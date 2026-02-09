# 内見後引き継ぎ合意フロー実装プラン

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 内見後に前の住人と次の住人が家具引き継ぎを合意し、残置物同意書PDFを生成するフローを実装

**Architecture:** Inquiryモデルを拡張して新ステータスを追加、HandoverAgreementを新規作成。前の住人が内見完了→家具リスト最終調整、次の住人がWeb上で受諾→署名、PDF生成してダウンロード可能に。

**Tech Stack:** Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui / Resend (メール) / @react-pdf/renderer (PDF)

---

## Task 1: データモデル拡張 - InquiryStatusに新ステータス追加

**Files:**

- Modify: `src/lib/data.ts:54-67`

**Step 1: Inquiryインターフェースのステータスを拡張**

`src/lib/data.ts` の Inquiry インターフェースを編集:

```typescript
// Inquiry (引き継ぎ申し込み) データ型
export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status:
    | 'pending'
    | 'reviewing'
    | 'approved'
    | 'viewing_scheduled'
    | 'viewing_completed' // 追加: 内見完了
    | 'agreement_pending' // 追加: 合意待ち
    | 'agreement_signed' // 追加: 署名完了
    | 'contract_in_progress'
    | 'completed'
    | 'rejected'
    | 'cancelled';
  applicantName: string;
  applicantEmail: string;
  reason: string;
  questions?: string;
  submittedAt: string;
  updatedAt: string;
  notes?: string;
  viewingConfirmation?: ViewingConfirmation;
  handoverAgreementId?: string; // 追加: 紐づく合意ID
}
```

**Step 2: ビルド確認**

```bash
cd /workspaces/tsumugi/.worktrees/handover-agreement && npm run build 2>&1 | tail -5
```

Expected: ビルド成功

**Step 3: コミット**

```bash
git add src/lib/data.ts
git commit -m "feat: add new inquiry statuses for handover agreement flow"
```

---

## Task 2: データモデル - HandoverAgreement型定義追加

**Files:**

- Modify: `src/lib/data.ts` (Inquiryの後に追加)

**Step 1: HandoverAgreement関連の型を追加**

`src/lib/data.ts` のInquiry定義の後に追加:

```typescript
// 引き継ぎ品目の状態
export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';

// 引き継ぎ品目
export interface HandoverItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliance' | 'other';
  condition: ItemCondition;
  photos: string[];
  notes?: string;
  included: boolean;
}

// 署名情報
export interface BuyerSignature {
  name: string;
  agreedAt: string; // ISO日付
  ipAddress?: string;
}

// 引き継ぎ合意ステータス
export type HandoverAgreementStatus =
  | 'draft'
  | 'pending_acceptance'
  | 'accepted'
  | 'signed';

// 引き継ぎ合意
export interface HandoverAgreement {
  id: string;
  inquiryId: string;
  propertyId: string;

  // 家具リスト（最終調整後）
  items: HandoverItem[];

  // 引越し費用
  adjustedHandoverFee: number;
  originalHandoverFee: number;

  // ステータス
  status: HandoverAgreementStatus;

  // タイムスタンプ
  createdAt: string;
  acceptedAt?: string;
  signedAt?: string;

  // 署名情報
  buyerSignature?: BuyerSignature;

  // 当事者情報（PDF用）
  sellerName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  propertyTitle: string;
  propertyAddress?: string;
}
```

**Step 2: ビルド確認**

```bash
npm run build 2>&1 | tail -5
```

**Step 3: コミット**

```bash
git add src/lib/data.ts
git commit -m "feat: add HandoverAgreement type definitions"
```

---

## Task 3: モックデータ - HandoverAgreement用のサンプルデータ

**Files:**

- Modify: `src/lib/data.ts` (mockDataセクションに追加)

**Step 1: モック合意データを追加**

data.tsのモックデータセクション（既存のmockInquiriesなどの近く）に追加:

```typescript
// モック引き継ぎ合意データ
export const mockHandoverAgreements: HandoverAgreement[] = [
  {
    id: 'ha-001',
    inquiryId: 'inq-001',
    propertyId: 'prop-001',
    items: [
      {
        id: 'item-001',
        name: '冷蔵庫',
        category: 'appliance',
        condition: 'good',
        photos: [],
        included: true,
      },
      {
        id: 'item-002',
        name: '洗濯機',
        category: 'appliance',
        condition: 'excellent',
        photos: [],
        included: true,
      },
      {
        id: 'item-003',
        name: 'ダイニングテーブル',
        category: 'furniture',
        condition: 'good',
        photos: [],
        notes: '4人掛け、IKEAで購入',
        included: true,
      },
    ],
    adjustedHandoverFee: 50000,
    originalHandoverFee: 60000,
    status: 'draft',
    createdAt: new Date().toISOString(),
    sellerName: '山田太郎',
    sellerEmail: 'yamada@example.com',
    buyerName: '佐藤花子',
    buyerEmail: 'sato@example.com',
    propertyTitle: '目黒の緑に囲まれた部屋',
    propertyAddress: '東京都目黒区中目黒1-1-1',
  },
];
```

**Step 2: ビルド確認**

```bash
npm run build 2>&1 | tail -5
```

**Step 3: コミット**

```bash
git add src/lib/data.ts
git commit -m "feat: add mock HandoverAgreement data"
```

---

## Task 4: ダッシュボード更新 - 新ステータスの表示対応

**Files:**

- Modify: `src/app/dashboard/page.tsx:18-25` (inquirySteps)
- Modify: `src/app/dashboard/page.tsx:34-54` (getStepIndex)
- Modify: `src/app/dashboard/page.tsx:56-77` (getNextAction)

**Step 1: inquiryStepsに新ステータスを追加**

```typescript
const inquirySteps = [
  { id: 'pending', label: '申し込み', icon: Clock },
  { id: 'reviewing', label: '確認中', icon: Eye },
  { id: 'approved', label: '承認済み', icon: Check },
  { id: 'viewing_scheduled', label: '内見予定', icon: Calendar },
  { id: 'viewing_completed', label: '内見完了', icon: Check }, // 追加
  { id: 'agreement_pending', label: '合意待ち', icon: FileText }, // 追加
  { id: 'agreement_signed', label: '署名完了', icon: Check }, // 追加
  { id: 'contract_in_progress', label: '契約手続き中', icon: FileText },
  { id: 'completed', label: '完了', icon: Home },
];
```

**Step 2: getStepIndexを更新**

```typescript
const getStepIndex = (status: string) => {
  switch (status) {
    case 'pending':
      return 0;
    case 'reviewing':
      return 1;
    case 'approved':
      return 2;
    case 'viewing_scheduled':
      return 3;
    case 'viewing_completed':
      return 4;
    case 'agreement_pending':
      return 5;
    case 'agreement_signed':
      return 6;
    case 'contract_in_progress':
      return 7;
    case 'completed':
      return 8;
    case 'rejected':
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
};
```

**Step 3: getNextActionを更新**

```typescript
const getNextAction = (status: string) => {
  switch (status) {
    case 'pending':
      return '前の住人からのご連絡をお待ちください';
    case 'reviewing':
      return '前の住人が内容を確認中です';
    case 'approved':
      return '内見の日程調整をお待ちください';
    case 'viewing_scheduled':
      return '内見予定日が確定しました';
    case 'viewing_completed':
      return '前の住人が引き継ぎ内容を準備中です';
    case 'agreement_pending':
      return '引き継ぎ内容を確認して受諾してください';
    case 'agreement_signed':
      return '残置物同意書の署名が完了しました';
    case 'contract_in_progress':
      return '引き継ぎの準備を進めましょう';
    case 'completed':
      return '引き継ぎが完了しました';
    case 'rejected':
      return '申し訳ございません。今回はお断りとなりました';
    case 'cancelled':
      return '申し込みがキャンセルされました';
    default:
      return 'お待ちください';
  }
};
```

**Step 4: ビルド確認**

```bash
npm run build 2>&1 | tail -5
```

**Step 5: コミット**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: update dashboard to show new agreement statuses"
```

---

## Task 5: 内見完了ページ作成 - 基本構造

**Files:**

- Create: `src/app/inquiry/[id]/viewing-complete/page.tsx`

**Step 1: ディレクトリ作成**

```bash
mkdir -p src/app/inquiry/[id]/viewing-complete
```

**Step 2: 内見完了ページを作成**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  Check,
  Plus,
  Trash2,
  Camera,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { HandoverItem, ItemCondition } from "@/lib/data";

// 状態のラベル
const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

// カテゴリのラベル
const CATEGORY_LABELS = {
  furniture: "家具",
  appliance: "家電",
  other: "その他",
};

export default function ViewingCompletePage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading, inquiries, listings } = useAuth();

  // この問い合わせに対応するInquiryを取得
  const inquiry = inquiries.find((inq) => inq.id === inquiryId);

  // 物件情報を取得（listingIdから）
  const listing = inquiry
    ? listings.find((l) => l.id === inquiry.propertyId)
    : null;

  // 家具リストの状態（既存のリストから初期化）
  const [items, setItems] = useState<HandoverItem[]>([]);
  const [adjustedFee, setAdjustedFee] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期化
  useEffect(() => {
    if (listing) {
      // 既存の家具リストから初期化
      const initialItems: HandoverItem[] = (listing.furnitureItems || []).map(
        (item, index) => ({
          id: `item-${index}`,
          name: item.type,
          category: "furniture" as const,
          condition: item.condition || "good",
          photos: item.photos || [],
          notes: item.notes,
          included: true,
        })
      );
      setItems(initialItems);
      setAdjustedFee(listing.handoverFee || 0);
    }
  }, [listing]);

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // アイテム追加
  const addItem = () => {
    const newItem: HandoverItem = {
      id: `item-${Date.now()}`,
      name: "",
      category: "furniture",
      condition: "good",
      photos: [],
      included: true,
    };
    setItems([...items, newItem]);
  };

  // アイテム更新
  const updateItem = (id: string, updates: Partial<HandoverItem>) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // アイテム削除
  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // 確定処理
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: API呼び出しでHandoverAgreementを作成
    // 今はモックとしてダッシュボードに戻る
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!inquiry || !listing) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">該当する情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = items.filter((item) => item.included);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              内見完了 - 引き継ぎ内容の確定
            </h1>
            <p className="mt-2 text-muted-foreground">
              内見で話し合った内容に基づいて、引き継ぐ家具・家電と費用を確定してください
            </p>
          </div>

          {/* 物件情報 */}
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">対象物件</p>
            <p className="font-medium text-foreground">{listing.title}</p>
            <p className="text-sm text-muted-foreground">
              申込者: {inquiry.applicantName}
            </p>
          </div>

          {/* 引越し費用 */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              引越し費用
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¥
                </span>
                <input
                  type="number"
                  value={adjustedFee}
                  onChange={(e) => setAdjustedFee(Number(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background py-3 pl-8 pr-4 text-lg font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {listing.handoverFee !== adjustedFee && (
                <p className="text-sm text-muted-foreground">
                  (元の金額: ¥{listing.handoverFee?.toLocaleString()})
                </p>
              )}
            </div>
          </div>

          {/* 引き継ぎ品目リスト */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                引き継ぎ品目
              </h2>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                追加
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center">
                <p className="text-muted-foreground">
                  引き継ぐ品目がありません
                </p>
                <Button variant="outline" className="mt-4" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" />
                  品目を追加
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 ${
                      item.included
                        ? "border-border bg-background"
                        : "border-dashed border-muted bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 含むチェック */}
                      <button
                        onClick={() =>
                          updateItem(item.id, { included: !item.included })
                        }
                        className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${
                          item.included
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground"
                        }`}
                      >
                        {item.included && <Check className="h-3 w-3" />}
                      </button>

                      {/* 品目詳細 */}
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, { name: e.target.value })
                          }
                          placeholder="品目名（例: 冷蔵庫）"
                          className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />

                        <div className="flex gap-3">
                          <select
                            value={item.category}
                            onChange={(e) =>
                              updateItem(item.id, {
                                category: e.target.value as HandoverItem["category"],
                              })
                            }
                            className="rounded border border-input bg-background px-3 py-2 text-sm"
                          >
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>

                          <select
                            value={item.condition}
                            onChange={(e) =>
                              updateItem(item.id, {
                                condition: e.target.value as ItemCondition,
                              })
                            }
                            className="rounded border border-input bg-background px-3 py-2 text-sm"
                          >
                            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <input
                          type="text"
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateItem(item.id, { notes: e.target.value })
                          }
                          placeholder="備考（任意）"
                          className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />

                        {/* 写真アップロード（プレースホルダー） */}
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                          <Camera className="h-4 w-4" />
                          写真を追加（準備中）
                        </button>
                      </div>

                      {/* 削除ボタン */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* サマリー */}
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6">
            <h3 className="mb-4 font-semibold text-foreground">確認</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">引き継ぎ品目数</span>
                <span className="font-medium">{includedItems.length}点</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">引越し費用</span>
                <span className="font-medium">¥{adjustedFee.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">キャンセル</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                "送信中..."
              ) : (
                <>
                  内容を確定して送信
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Step 3: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: コミット**

```bash
git add src/app/inquiry/[id]/viewing-complete/page.tsx
git commit -m "feat: add viewing complete page for seller to finalize handover items"
```

---

## Task 6: 合意内容確認ページ作成（次の住人用）

**Files:**

- Create: `src/app/inquiry/[id]/agreement/page.tsx`

**Step 1: ディレクトリ作成**

```bash
mkdir -p src/app/inquiry/[id]/agreement
```

**Step 2: 合意確認ページを作成**

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Check,
} from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";
import type { ItemCondition } from "@/lib/data";

// 状態のラベル
const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

export default function AgreementPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  // モックデータから合意を取得（実際はAPIから取得）
  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">合意情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              引き継ぎ内容の確認
            </h1>
            <p className="mt-2 text-muted-foreground">
              前の住人が確定した引き継ぎ内容を確認してください
            </p>
          </div>

          {/* 物件・当事者情報 */}
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground">{agreement.propertyTitle}</p>
            {agreement.propertyAddress && (
              <p className="text-sm text-muted-foreground">{agreement.propertyAddress}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">前の住人</p>
                <p className="font-medium">{agreement.sellerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">次の住人（あなた）</p>
                <p className="font-medium">{agreement.buyerName}</p>
              </div>
            </div>
          </div>

          {/* 引越し費用 */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">引越し費用</h2>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-3xl font-bold text-foreground">
                ¥{agreement.adjustedHandoverFee.toLocaleString()}
              </p>
              {agreement.adjustedHandoverFee !== agreement.originalHandoverFee && (
                <p className="mt-1 text-sm text-muted-foreground">
                  (元の金額: ¥{agreement.originalHandoverFee.toLocaleString()})
                </p>
              )}
            </div>
          </div>

          {/* 引き継ぎ品目 */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              引き継ぎ品目（{includedItems.length}点）
            </h2>
            {includedItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">引き継ぎ品目はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {includedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        状態: {CONDITION_LABELS[item.condition]}
                        {item.notes && ` / ${item.notes}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              ご確認ください
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
              <li>・上記の品目は現状有姿での譲渡となります</li>
              <li>・退去時の処分責任は次の住人（あなた）が負います</li>
              <li>・受諾後は残置物同意書への署名が必要です</li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">戻る</Link>
            </Button>
            <Button asChild>
              <Link href={`/inquiry/${inquiryId}/agreement/accept`}>
                内容を確認して受諾へ進む
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Step 3: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: コミット**

```bash
git add src/app/inquiry/[id]/agreement/page.tsx
git commit -m "feat: add agreement review page for buyer"
```

---

## Task 7: 受諾ページ作成

**Files:**

- Create: `src/app/inquiry/[id]/agreement/accept/page.tsx`

**Step 1: ディレクトリ作成**

```bash
mkdir -p src/app/inquiry/[id]/agreement/accept
```

**Step 2: 受諾ページを作成**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";

export default function AcceptPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleAccept = async () => {
    if (!isAccepted) return;

    setIsSubmitting(true);
    // TODO: API呼び出しで受諾を記録
    setTimeout(() => {
      router.push(`/inquiry/${inquiryId}/agreement/sign`);
    }, 500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">合意情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href={`/inquiry/${inquiryId}/agreement`}
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              内容確認に戻る
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              引き継ぎ内容の受諾
            </h1>
            <p className="mt-2 text-muted-foreground">
              以下の内容で引き継ぎを受諾します
            </p>
          </div>

          {/* サマリー */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">
              {agreement.propertyTitle}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">引越し費用</span>
                <span className="font-medium">
                  ¥{agreement.adjustedHandoverFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">引き継ぎ品目</span>
                <span className="font-medium">{includedItems.length}点</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">前の住人</span>
                <span className="font-medium">{agreement.sellerName}</span>
              </div>
            </div>
          </div>

          {/* 同意チェック */}
          <div className="mb-8">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
              <button
                type="button"
                onClick={() => setIsAccepted(!isAccepted)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isAccepted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground"
                }`}
              >
                {isAccepted && <Check className="h-3 w-3" />}
              </button>
              <span className="text-sm text-foreground">
                上記の引き継ぎ内容を確認し、受諾することに同意します。
                受諾後は残置物同意書への署名に進みます。
              </span>
            </label>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={`/inquiry/${inquiryId}/agreement`}>戻る</Link>
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!isAccepted || isSubmitting}
            >
              {isSubmitting ? (
                "処理中..."
              ) : (
                <>
                  受諾して署名へ進む
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Step 3: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: コミット**

```bash
git add src/app/inquiry/[id]/agreement/accept/page.tsx
git commit -m "feat: add acceptance page for buyer to accept handover terms"
```

---

## Task 8: 署名ページ作成

**Files:**

- Create: `src/app/inquiry/[id]/agreement/sign/page.tsx`

**Step 1: ディレクトリ作成**

```bash
mkdir -p src/app/inquiry/[id]/agreement/sign
```

**Step 2: 署名ページを作成**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";

export default function SignPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  const [signatureName, setSignatureName] = useState("");
  const [agreements, setAgreements] = useState({
    currentCondition: false,
    disposalResponsibility: false,
    noWarranty: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setSignatureName(user.name);
    }
  }, [user]);

  const allAgreed = Object.values(agreements).every(Boolean);
  const canSubmit = allAgreed && signatureName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    // TODO: API呼び出しで署名を記録
    setTimeout(() => {
      // 署名完了後、合意詳細ページへ
      router.push(`/agreements/${agreement?.id}`);
    }, 1000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">合意情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const agreementItems = [
    {
      key: "currentCondition" as const,
      label: "現状有姿での譲渡に同意します",
      description:
        "引き継ぎ品目は内見時に確認した状態のままで譲渡されます。",
    },
    {
      key: "disposalResponsibility" as const,
      label: "退去時の処分責任を負うことに同意します",
      description:
        "引き継いだ品目は、退去時にご自身の責任で処分または次の方へ引き継いでください。",
    },
    {
      key: "noWarranty" as const,
      label: "大家・管理会社への免責に同意します",
      description:
        "引き継ぎ品目に関するトラブルについて、大家・管理会社は責任を負いません。",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href={`/inquiry/${inquiryId}/agreement/accept`}
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              受諾画面に戻る
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  残置物同意書への署名
                </h1>
                <p className="text-sm text-muted-foreground">
                  以下の内容に同意し、署名してください
                </p>
              </div>
            </div>
          </div>

          {/* 同意事項 */}
          <div className="mb-8 space-y-4">
            {agreementItems.map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    setAgreements((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    agreements[item.key]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {agreements[item.key] && <Check className="h-3 w-3" />}
                </button>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* 署名欄 */}
          <div className="mb-8">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                署名（氏名）
              </span>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="氏名を入力"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                上記の同意事項を確認し、署名することで残置物同意書が作成されます。
              </p>
            </label>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={`/inquiry/${inquiryId}/agreement/accept`}>戻る</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "署名中..." : "署名して完了"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Step 3: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: コミット**

```bash
git add src/app/inquiry/[id]/agreement/sign/page.tsx
git commit -m "feat: add signature page for buyer to sign leftover items agreement"
```

---

## Task 9: 合意詳細・PDFダウンロードページ作成

**Files:**

- Create: `src/app/agreements/[id]/page.tsx`
- Create: `src/app/agreements/[id]/pdf/page.tsx`

**Step 1: ディレクトリ作成**

```bash
mkdir -p src/app/agreements/[id]/pdf
```

**Step 2: 合意詳細ページを作成**

`src/app/agreements/[id]/page.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  Download,
  Check,
  FileText,
  Calendar,
} from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";
import type { ItemCondition } from "@/lib/data";

const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

export default function AgreementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;
  const { user, isLoading } = useAuth();

  const agreement = mockHandoverAgreements.find((a) => a.id === agreementId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">合意情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);
  const isSigned = agreement.status === "signed";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              ダッシュボードに戻る
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    残置物同意書
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isSigned ? "署名済み" : "未署名"}
                  </p>
                </div>
              </div>
              {isSigned && (
                <Button asChild>
                  <Link href={`/agreements/${agreementId}/pdf`}>
                    <Download className="mr-2 h-4 w-4" />
                    PDFをダウンロード
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* 物件・当事者情報 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">基本情報</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">物件名</dt>
                <dd className="font-medium">{agreement.propertyTitle}</dd>
              </div>
              {agreement.propertyAddress && (
                <div>
                  <dt className="text-muted-foreground">所在地</dt>
                  <dd className="font-medium">{agreement.propertyAddress}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">譲渡者（前の住人）</dt>
                <dd className="font-medium">{agreement.sellerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">譲受者（次の住人）</dt>
                <dd className="font-medium">{agreement.buyerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">作成日</dt>
                <dd className="font-medium">
                  {new Date(agreement.createdAt).toLocaleDateString("ja-JP")}
                </dd>
              </div>
              {agreement.signedAt && (
                <div>
                  <dt className="text-muted-foreground">署名日</dt>
                  <dd className="font-medium">
                    {new Date(agreement.signedAt).toLocaleDateString("ja-JP")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 引越し費用 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">引越し費用</h2>
            <p className="text-3xl font-bold text-foreground">
              ¥{agreement.adjustedHandoverFee.toLocaleString()}
            </p>
          </div>

          {/* 引き継ぎ品目 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">
              引き継ぎ品目（{includedItems.length}点）
            </h2>
            <div className="space-y-3">
              {includedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      状態: {CONDITION_LABELS[item.condition]}
                      {item.notes && ` / ${item.notes}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 署名情報 */}
          {agreement.buyerSignature && (
            <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="font-semibold text-green-800 dark:text-green-200">
                  署名済み
                </h2>
              </div>
              <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                <p>署名者: {agreement.buyerSignature.name}</p>
                <p>
                  署名日時:{" "}
                  {new Date(agreement.buyerSignature.agreedAt).toLocaleString(
                    "ja-JP"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* PDFダウンロードボタン */}
          {isSigned && (
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href={`/agreements/${agreementId}/pdf`}>
                  <Download className="mr-2 h-5 w-5" />
                  残置物同意書をダウンロード
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Step 3: PDFページを作成**

`src/app/agreements/[id]/pdf/page.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { mockHandoverAgreements } from "@/lib/data";
import type { ItemCondition } from "@/lib/data";

const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

export default function AgreementPDFPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;
  const { user, isLoading } = useAuth();

  const agreement = mockHandoverAgreements.find((a) => a.id === agreementId);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">合意情報が見つかりません</div>
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* 印刷ボタン */}
      <div className="no-print fixed right-4 top-4 flex gap-2">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          戻る
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600"
          style={{ backgroundColor: "#FF5A5F" }}
        >
          印刷 / PDF保存
        </button>
      </div>

      {/* PDF本文 */}
      <div className="mx-auto max-w-[210mm] p-8">
        {/* タイトル */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">残置物同意書</h1>
          <p className="mt-2 text-sm text-gray-600">
            作成日: {today}
          </p>
        </div>

        {/* 物件情報 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            物件情報
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-32 py-1 text-gray-600">物件名</td>
                <td className="py-1 font-medium">{agreement.propertyTitle}</td>
              </tr>
              {agreement.propertyAddress && (
                <tr>
                  <td className="py-1 text-gray-600">所在地</td>
                  <td className="py-1">{agreement.propertyAddress}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* 当事者 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            当事者
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-32 py-1 text-gray-600">譲渡者（前の住人）</td>
                <td className="py-1 font-medium">{agreement.sellerName}</td>
              </tr>
              <tr>
                <td className="py-1 text-gray-600">譲受者（次の住人）</td>
                <td className="py-1 font-medium">{agreement.buyerName}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 引き継ぎ品目 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            引き継ぎ品目
          </h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">No.</th>
                <th className="border border-gray-300 px-3 py-2 text-left">品目名</th>
                <th className="border border-gray-300 px-3 py-2 text-left">状態</th>
                <th className="border border-gray-300 px-3 py-2 text-left">備考</th>
              </tr>
            </thead>
            <tbody>
              {includedItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    {CONDITION_LABELS[item.condition]}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {item.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 引越し費用 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            引越し費用
          </h2>
          <p className="text-xl font-bold">
            ¥{agreement.adjustedHandoverFee.toLocaleString()}
          </p>
        </section>

        {/* 同意事項 */}
        <section className="mb-6">
          <h2 className="mb-3 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            同意事項
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              上記の品目は現状有姿での譲渡とし、譲受者はその状態を確認の上、
              引き継ぐことに同意します。
            </li>
            <li>
              譲渡後の品目に関する所有権は譲受者に移転し、退去時の処分責任は
              譲受者が負うものとします。
            </li>
            <li>
              引き継ぎ品目に関するトラブルについて、大家および管理会社は
              一切の責任を負わないことに同意します。
            </li>
          </ol>
        </section>

        {/* 署名欄 */}
        <section className="mt-12">
          <h2 className="mb-6 border-b-2 border-gray-800 pb-1 text-lg font-bold text-gray-900">
            署名
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-gray-600">譲受者（次の住人）</p>
              <div className="border-b border-gray-400 pb-2">
                {agreement.buyerSignature ? (
                  <div>
                    <p className="text-lg font-medium">
                      {agreement.buyerSignature.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(agreement.buyerSignature.agreedAt).toLocaleString(
                        "ja-JP"
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">（未署名）</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="mt-12 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          <p>本書類は tsumugi プラットフォームにて作成されました</p>
          <p>https://tsumugi.app</p>
        </footer>
      </div>
    </div>
  );
}
```

**Step 4: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 5: コミット**

```bash
git add src/app/agreements/
git commit -m "feat: add agreement detail and PDF pages"
```

---

## Task 10: ダッシュボードに導線追加

**Files:**

- Modify: `src/app/dashboard/page.tsx`

**Step 1: 合意フローへのリンクを追加**

ダッシュボードの各問い合わせカードに、ステータスに応じたアクションボタンを追加:

```typescript
// getActionButton関数を追加（getNextActionの後に）
const getActionButton = (status: string, inquiryId: string) => {
  switch (status) {
    case "viewing_scheduled":
      return (
        <Link
          href={`/inquiry/${inquiryId}/viewing-complete`}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          内見完了を報告
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      );
    case "agreement_pending":
      return (
        <Link
          href={`/inquiry/${inquiryId}/agreement`}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          引き継ぎ内容を確認
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      );
    default:
      return null;
  }
};
```

ダッシュボードのカード内に追加:

```tsx
{
  /* 既存のステータス表示の後に */
}
{
  getActionButton(inquiry.status, inquiry.id);
}
```

**Step 2: ビルド確認**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: コミット**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: add action buttons to dashboard for agreement flow navigation"
```

---

## Task 11: 最終確認とPR作成

**Step 1: 全体ビルド確認**

```bash
npm run build
```

**Step 2: lint確認**

```bash
npm run lint
```

**Step 3: 変更内容の確認**

```bash
git log --oneline feature/handover-agreement ^main
```

**Step 4: PRの作成**

```bash
git push -u origin feature/handover-agreement
gh pr create --title "feat: implement post-viewing handover agreement flow" --body "$(cat <<'EOF'
## Summary

内見後の引き継ぎ合意フローを実装しました。

### 実装内容

- **データモデル拡張**
  - `Inquiry` に新ステータス追加 (`viewing_completed`, `agreement_pending`, `agreement_signed`)
  - `HandoverAgreement` 型定義追加

- **前の住人側フロー**
  - `/inquiry/[id]/viewing-complete` - 内見完了・家具リスト最終調整ページ

- **次の住人側フロー**
  - `/inquiry/[id]/agreement` - 合意内容確認ページ
  - `/inquiry/[id]/agreement/accept` - 受諾ページ
  - `/inquiry/[id]/agreement/sign` - 署名ページ

- **共通機能**
  - `/agreements/[id]` - 合意詳細ページ
  - `/agreements/[id]/pdf` - 残置物同意書PDF表示・ダウンロード

- **ダッシュボード更新**
  - 新ステータスの表示対応
  - 各フローへの導線追加

### 関連タスク
- tsumugi-u8c: Design and implement post-viewing handover agreement flow

## Test plan
- [ ] 前の住人として内見完了ページにアクセスできる
- [ ] 家具リストの追加・編集・削除ができる
- [ ] 引越し費用の調整ができる
- [ ] 次の住人として合意内容を確認できる
- [ ] 受諾・署名フローが完了する
- [ ] PDFが正しく表示・印刷できる
- [ ] ダッシュボードに新ステータスが表示される

EOF
)"
```

---

## 次のフェーズ（別タスク）

以下は本プランの範囲外:

1. **メール通知機能** (Phase E)
   - Resend + React Email セットアップ
   - 3種類のメールテンプレート

2. **写真アップロード機能**
   - ファイルストレージ連携
   - 画像最適化

3. **API実装**
   - HandoverAgreement CRUD API
   - Inquiry ステータス更新API
