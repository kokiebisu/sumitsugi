'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import {
  Check,
  Plus,
  Trash2,
  Camera,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { HandoverItem, ItemCondition } from '@/lib/data';

// 状態のラベル
const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: '非常に良い',
  good: '良い',
  fair: '普通',
  poor: '使用感あり',
};

// カテゴリのラベル
const CATEGORY_LABELS = {
  furniture: '家具',
  appliance: '家電',
  other: 'その他',
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
          category: 'furniture' as const,
          condition: item.condition || 'good',
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
      router.push('/');
    }
  }, [user, isLoading, router]);

  // アイテム追加
  const addItem = () => {
    const newItem: HandoverItem = {
      id: `item-${Date.now()}`,
      name: '',
      category: 'furniture',
      condition: 'good',
      photos: [],
      included: true,
    };
    setItems([...items, newItem]);
  };

  // アイテム更新
  const updateItem = (id: string, updates: Partial<HandoverItem>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
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
      router.push('/dashboard');
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
            <p className="text-muted-foreground">
              該当する情報が見つかりません
            </p>
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
                        ? 'border-border bg-background'
                        : 'border-dashed border-muted bg-muted/30'
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
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground'
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
                                category: e.target
                                  .value as HandoverItem['category'],
                              })
                            }
                            className="rounded border border-input bg-background px-3 py-2 text-sm"
                          >
                            {Object.entries(CATEGORY_LABELS).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              )
                            )}
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
                            {Object.entries(CONDITION_LABELS).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <input
                          type="text"
                          value={item.notes || ''}
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
                <span className="font-medium">
                  ¥{adjustedFee.toLocaleString()}
                </span>
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
                '送信中...'
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
