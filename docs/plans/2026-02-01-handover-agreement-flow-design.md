# 内見後引き継ぎ合意フロー設計書

**作成日**: 2026-02-01
**対象タスク**: tsumugi-u8c
**ステータス**: 設計完了、実装待ち

## 概要

内見後に前の住人と次の住人の間で家具引き継ぎの合意を取り、残置物同意書を生成するフロー。

### 目的

- 内見直後の熱が冷めないうちにマッチングを確定
- 「捨てなくていい」「他の人に取られない」という安心感を提供
- 管理会社向けの法的エビデンス（残置物同意書）を自動生成

## フロー全体像

```
┌─────────────────────────────────────────────────────────────────┐
│                      内見後引き継ぎ合意フロー                      │
└─────────────────────────────────────────────────────────────────┘

【ステップ1: Web上の合意】

  前の住人                           次の住人
     │                                  │
     │  ①「内見完了」ボタン押下          │
     │  ────────────────────►           │
     │                                  │
     │  ② 家具リスト最終調整             │
     │   - 既存リストから追加/削除        │
     │   - 状態写真アップロード           │
     │   - 引越し費用の調整              │
     │                                  │
     │  ③ リスト確定                    │
     │  ─────── メール通知 ──────►       │
     │                                  │
     │                           ④ ログインして確認
     │                              内容確認・受諾
     │  ◄─────── 受諾通知 ───────        │
     │                                  │
     ▼                                  ▼
   マッチング仮成立（双方に通知）

【ステップ2: 残置物同意書】

     │  ⑤ 同意書生成（自動）             │
     │                                  │
     │                           ⑥ 同意書確認
     │                              チェックボックス同意
     │                              氏名入力
     │                                  │
     │  ⑦ 署名完了通知                   │
     │  ◄──────────────────────         │
     │                                  │
     ▼                                  ▼
   PDF ダウンロード可能（双方）
   → ユーザーが管理会社へ手動送信
```

### ステータス遷移

```
viewing_scheduled → viewing_completed → agreement_pending → agreement_signed → contract_in_progress
```

## 設計決定事項

| 項目 | 決定内容 | 理由 |
|------|----------|------|
| 開始トリガー | 内見完了ボタン | 明示的なアクションで開始 |
| 家具リスト | 物件登録時のリストから最終調整 | 二度手間を防ぐ |
| 価格設定 | 引越し費用として一括（個別価格なし） | UXをシンプルに |
| 引越し費用 | 内見後に変更可能 | 交渉結果を反映 |
| 次の住人の受諾 | メール通知 + Webリンク、ログイン必須 | セキュリティと利便性のバランス |
| 署名方式 | チェックボックス同意 + 氏名入力 | Phase 1としてシンプルに |
| 管理会社送信 | PDFダウンロード + 手動送信 | 信頼関係構築のため |

## データモデル

### HandoverAgreement（新規）

```typescript
interface HandoverAgreement {
  id: string;
  inquiryId: string;              // 紐づく問い合わせ
  propertyId: string;             // 物件ID

  // 家具リスト（最終調整後）
  items: HandoverItem[];

  // 引越し費用（調整後）
  adjustedHandoverFee: number;
  originalHandoverFee: number;    // 変更前の金額（記録用）

  // ステータス
  status: 'draft' | 'pending_acceptance' | 'accepted' | 'signed';

  // タイムスタンプ
  createdAt: Date;                // 前の住人が作成
  acceptedAt?: Date;              // 次の住人が受諾
  signedAt?: Date;                // 署名完了

  // 署名情報
  buyerSignature?: {
    name: string;                 // 署名時の氏名
    agreedAt: Date;
    ipAddress?: string;           // 記録用
  };
}

interface HandoverItem {
  id: string;
  name: string;                   // 家具名
  category: string;               // カテゴリ（家電、家具、etc）
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  photos: string[];               // 状態写真URL
  notes?: string;                 // 備考
  included: boolean;              // 引き継ぎ対象かどうか
}
```

### InquiryStatus（拡張）

```typescript
type InquiryStatus =
  | 'pending' | 'reviewing' | 'approved'
  | 'viewing_scheduled'
  | 'viewing_completed'      // 追加: 内見完了
  | 'agreement_pending'      // 追加: 合意待ち
  | 'agreement_signed'       // 追加: 署名完了
  | 'contract_in_progress'
  | 'completed' | 'rejected' | 'cancelled';
```

## 画面構成

```
src/app/
├── inquiry/[id]/
│   ├── viewing-complete/        # ① 内見完了 → 家具リスト調整
│   │   └── page.tsx
│   │
│   └── agreement/
│       ├── page.tsx             # ② 合意内容確認（次の住人用）
│       ├── accept/
│       │   └── page.tsx         # ③ 受諾確認画面
│       └── sign/
│           └── page.tsx         # ④ 署名画面
│
├── agreements/[id]/
│   ├── page.tsx                 # 合意詳細（双方が閲覧可能）
│   └── pdf/
│       └── page.tsx             # PDF表示・ダウンロード
│
└── dashboard/
    └── page.tsx                 # 既存: 合意ステータス表示を追加
```

### 各画面の役割

| 画面 | アクセス者 | 主な機能 |
|------|-----------|----------|
| `/inquiry/[id]/viewing-complete` | 前の住人 | 内見完了報告、家具リスト最終調整、引越し費用調整 |
| `/inquiry/[id]/agreement` | 次の住人 | 合意内容の確認（読み取り専用） |
| `/inquiry/[id]/agreement/accept` | 次の住人 | 受諾ボタン |
| `/inquiry/[id]/agreement/sign` | 次の住人 | 同意チェックボックス、氏名入力、署名完了 |
| `/agreements/[id]` | 双方 | 署名済み合意の詳細表示 |
| `/agreements/[id]/pdf` | 双方 | PDF生成・ダウンロード |

## メール通知

### 送信タイミング

| タイミング | 宛先 | 件名例 |
|-----------|------|--------|
| 家具リスト確定時 | 次の住人 | 「[物件名] 引き継ぎ内容が届きました」 |
| 次の住人が受諾時 | 前の住人 | 「[物件名] 引き継ぎ内容が承諾されました」 |
| 署名完了時 | 双方 | 「[物件名] 残置物同意書の署名が完了しました」 |

### 技術選定

- メール送信: Resend
- テンプレート: React Email

## PDF生成

### 残置物同意書の構成

```
┌────────────────────────────────────────┐
│         残置物同意書                    │
│                                        │
│ 作成日: 2026年2月1日                    │
│                                        │
│ ■ 物件情報                             │
│   物件名: ○○マンション 301号室          │
│   所在地: 東京都目黒区...               │
│                                        │
│ ■ 当事者                               │
│   譲渡者（前の住人）: 山田太郎           │
│   譲受者（次の住人）: 佐藤花子           │
│                                        │
│ ■ 引き継ぎ品目                         │
│   1. 冷蔵庫（状態: 良好）[写真]         │
│   2. 洗濯機（状態: 良好）[写真]         │
│   3. ...                               │
│                                        │
│ ■ 引越し費用: ¥50,000                  │
│                                        │
│ ■ 同意事項                             │
│   ・現状有姿での譲渡に同意              │
│   ・退去時の処分責任は譲受者が負う       │
│   ・大家・管理会社への免責              │
│                                        │
│ ■ 署名                                 │
│   譲受者氏名: 佐藤花子                  │
│   同意日時: 2026/02/01 14:30           │
│                                        │
│ ─────────────────────────              │
│ tsumugi プラットフォームにて作成         │
└────────────────────────────────────────┘
```

### 技術選定

- PDF生成: `@react-pdf/renderer`

## 実装フェーズ

### Phase A: データ基盤
1. `HandoverAgreement` モデル・型定義の追加
2. `InquiryStatus` に新ステータス追加
3. モックデータの作成

### Phase B: 前の住人側フロー
4. `/inquiry/[id]/viewing-complete` 画面
   - 内見完了ボタン
   - 既存家具リストの表示・編集
   - 状態写真アップロード
   - 引越し費用の調整
   - 確定ボタン

### Phase C: 次の住人側フロー
5. `/inquiry/[id]/agreement` 合意内容確認画面
6. `/inquiry/[id]/agreement/accept` 受諾画面
7. `/inquiry/[id]/agreement/sign` 署名画面

### Phase D: PDF生成
8. `@react-pdf/renderer` セットアップ
9. 残置物同意書テンプレート作成
10. `/agreements/[id]/pdf` PDF表示・ダウンロード

### Phase E: メール通知
11. Resend + React Email セットアップ
12. 3種類のメールテンプレート作成
13. 各タイミングでの送信処理

### Phase F: ダッシュボード統合
14. 既存ダッシュボードに合意ステータス表示追加
15. 各フローへの導線追加

## 関連タスク

- **tsumugi-u8c**: 本タスク（引き継ぎ合意フロー全体）
- **tsumugi-fpq**: PDF生成（Phase Dでカバー、完了後にdone）

## 今後の拡張可能性

- 電子署名サービス連携（DocuSign等）
- 管理会社ポータル
- 自動メール送信（管理会社向け）
