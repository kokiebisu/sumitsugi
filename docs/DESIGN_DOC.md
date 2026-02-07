# tsumugi 設計ドキュメント（DESIGN_DOC）

> 技術的な「How」を記述するドキュメント。「What」（要件・仕様）は `REQUIREMENTS.md` を参照。

最終更新日: 2026-02-07（REQUIREMENTS.mdとの整合性整理・座談会#4〜#7反映）

---

## 1. 技術決定サマリー

MVP実装に向けた技術選定。`/meeting:tech`（技術会議 2026-02-06）で決定。

| #   | 残論点                       | 決定                                                                                                 | 関連機能            | ステータス |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------- | ---------- |
| T-1 | PDF自動生成の技術選定        | **`@react-pdf/renderer`** — サーバーサイド`renderToBuffer()` + R2保存。日本語フォント: Noto Sans JP  | F-611, F-612, F-616 | 解決済み   |
| T-2 | メール送信サービスの技術選定 | **Resend + React Email** — 導入済み（Better-auth magic linkで使用中）。MVP無料枠（3,000通/月）で十分 | F-204, F-205        | 解決済み   |
| T-3 | 定期実行（Cron）の技術選定   | **Vercel Cron Jobs** — `vercel.json`にcron定義。毎日実行でリマインドチェック + 期限切れチェック      | F-205, F-206        | 解決済み   |
| T-4 | DBスキーマ拡張               | **Drizzleマイグレーション** — `landlordConsent`をJSONB構造化、`moveOutDate`等のフィールド追加        | F-501, F-611        | 解決済み   |

---

## 2. アーキテクチャ詳細

### 2.1 T-1: PDF自動生成アーキテクチャ

```
[リスティングデータ]
  → API Route (POST /api/pdf/generate)
  → @react-pdf/renderer (サーバーサイド renderToBuffer())
  → PDFバイナリ生成
  → R2にアップロード（永続保存）
  → URLをPropertyレコードに保存
```

**テンプレート配置:** `src/lib/pdf/templates/` に F-611・F-612・F-616 それぞれ別テンプレート
**日本語フォント:** Noto Sans JP（public/fonts/ に配置 or CDN動的ロード）
**実装優先順位:** F-611 + F-616（同時）→ F-612

**PDF品質要件（座談会#5）:**

- 結論ファースト構成（アクション手順→概要→家具リスト→メリット→リスク対応→FAQ）
- A4 3枚以内
- tsumugiブランディング控えめ
- メール送付テンプレートも付随提供
- 詳細は[座談会#5議事録](./meetings/2026-02-07-product-meeting-5-pdf-templates.md)

### 2.2 T-2: メール送信アーキテクチャ

**テンプレート配置:** `src/lib/email/templates/` に React Email コンポーネント

| メール種別         | トリガー                  | 宛先     | Reply-to           | 機能ID |
| ------------------ | ------------------------- | -------- | ------------------ | ------ |
| 問い合わせ確認     | 問い合わせ送信時          | 次の住人 | —                  | F-204  |
| 新着問い合わせ通知 | 問い合わせ送信時          | 前の住人 | 問い合わせ者メアド | F-204  |
| 承認リマインド     | 退去日確定後 7/14/21/27日 | 前の住人 | —                  | F-205  |
| 自動非公開化通知   | 退去日確定後 30日         | 前の住人 | —                  | F-206  |

**リマインドメール文面出し分け（座談会#6）:**

- `managementConsultedAt` が **null** → 「管理会社への残置物相談がまだのようです」
- `managementConsultedAt` が **set** → 「管理会社への相談から○日経過。承認結果の入力をお願いします」
- 詳細は[座談会#6議事録](./meetings/2026-02-07-product-meeting-6-reminder-notifications.md)

### 2.3 T-3: Vercel Cron Jobs設定

```json
{
  "crons": [
    { "path": "/api/cron/reminder-check", "schedule": "0 0 * * *" },
    { "path": "/api/cron/expiration-check", "schedule": "0 1 * * *" }
  ]
}
```

**リマインドチェック（毎日0:00 UTC）:** 退去日確定済み + pending状態のリスティングを検索 → 7/14/21/27日経過でメール送信（managementConsultedAtで文面出し分け）
**期限切れチェック（毎日1:00 UTC）:** 30日経過のpendingリスティングを自動非公開化（一時停止、削除ではない）+ 通知メール。承認ステータス更新で再公開可能

### 2.4 T-4: DBスキーマ拡張（Drizzleマイグレーション）

REQUIREMENTS.md セクション7のデータモデル定義に基づく。

| 変更内容                          | テーブル   | 説明                                                                          |
| --------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `moveOutDate` 追加                | properties | 退去日（nullable Date）                                                       |
| `moveOutReason` 追加              | properties | 引越し理由（MoveOutReason enum、REQUIREMENTS.md 7.6参照）                     |
| `managementCompanyName` 追加      | properties | 管理会社名（nullable string）                                                 |
| `managementConsultedAt` 追加      | properties | 管理会社相談日時（nullable timestamp）                                        |
| `landlordConsent` をJSONBに構造化 | properties | boolean → ConsentStatus構造体                                                 |
| `pdfUrls` 追加                    | properties | 生成済みPDFのR2 URL格納（JSONB）                                              |
| `furnitureItems` 変更             | listings   | 旧`furniture: string[]` → `FurnitureItem[]`（JSONB、REQUIREMENTS.md 7.7参照） |
| `coreSetPrice` 追加               | listings   | コアセット一括価格（nullable number）                                         |
| `agreedFurnitureIds` 変更         | inquiries  | 旧`agreedFurniture: string[]` → 確定家具IDリスト                              |
| `duration` 追加                   | inquiries  | 希望契約期間（string）                                                        |

---

## 3. MVP実装ロードマップ

技術会議（2026-02-06）で合意。

```
Phase 0: インフラ整備（1週間）
├── DBスキーマ拡張（moveOutDate, moveOutReason, landlordConsent構造化, furnitureItems等）
├── Resendメールテンプレート基盤
└── @react-pdf/renderer セットアップ + 日本語フォント + POC検証

Phase 1: コア機能強化（2週間）
├── F-501/F-502: 退去日フィールド + バリデーション
├── 出品フォーム改修（必須/任意フィールド整理、FurnitureItem入力UI）
├── 大家承認ステータス表示（バッジ・バナー 5パターン）
├── F-204: 問い合わせ通知メール（Resend）
└── F-701: 使い方ガイドページ（静的ページ）

Phase 2: PDF + B2B（2-3週間）
├── F-611: 残置物引き継ぎ相談資料PDF（結論ファースト・A4 3枚以内）
├── F-616: 仲介向け物件シートPDF
├── F-615: 管理会社向けFAQ（静的ページ）
└── PDF生成トリガー（退去日設定時に自動生成）

Phase 3: 自動化（1週間）
├── F-205: 承認リマインド通知（4段階: 7/14/21/27日、文面出し分け）
├── F-206: 承認期限切れ自動処理（30日で一時停止）
└── F-612: 残置物同意書PDF（家具リスト確定時）

Phase 4: 決済基盤 — Stripe Connect（2-3週間）
├── Stripe Connectプラットフォーム設定（APIキー・Webhook endpoint・環境変数）
├── 前の住人オンボーディングフロー（出品時にConnected Account作成 + Stripe Hosted Onboarding）
├── 決済UI（3段階チェックアウト: 申込金→デポジット→残額）
├── Webhook処理（payment_intent.succeeded, account.updated, transfer.created等）
└── 管理者エスクロー解放（手動トリガーのAdmin画面 — 引き継ぎ完了確認後に実行）

合計: 約8-10週間
```

---

## 4. UIデザイン仕様

カラーパレット・スペーシング・大家承認バッジ/バナーの仕様は **[REQUIREMENTS.md セクション10](./REQUIREMENTS.md#10-デザインガイドライン)** を参照。

### 4.1 実装メモ

- バッジ/バナーのコンポーネントは `src/components/listing/` に配置
- バナー表示ロジック: `moveOutDate` と `managementConsultedAt` の組み合わせで5パターン分岐（REQUIREMENTS.md 10.5参照）
- FurnitureItem入力UI: コアセット/追加家具のグルーピング（drag & drop or チェックボックス方式）

---

## 5. 決済システム設計

決済データモデル（Payment / Transaction / StripeAccount）および Stripe Connect 実装方針は **[REQUIREMENTS.md セクション12](./REQUIREMENTS.md#12-決済システム)** を参照。

### 5.1 実装固有のメモ

- **Webhook endpoint:** `POST /api/stripe/webhook`
- **Connect OAuth:** `GET /api/stripe/connect/authorize` → `GET /api/stripe/connect/callback`
- **エスクロー解放:** `POST /api/admin/escrow/release` （認証必須・Admin権限）
- **環境変数:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`

### 5.2 関連設計ドキュメント

- [決済システム設計書](./plans/2026-01-31-payment-system-design.md) - 全体設計、料金体系、エスクロー、申込金モデル
- [法的レビュー質問リスト](./plans/legal-review-questions.md) - 弁護士確認用の質問事項

---

## 6. 既知の技術的負債

| ID     | 問題                         | 影響                     | 対応時期                                       |
| ------ | ---------------------------- | ------------------------ | ---------------------------------------------- |
| TD-001 | サンプルデータがハードコード | DBに切り替えれば解消     | Phase 2でDB実装時                              |
| TD-002 | 認証がモック状態             | 本番運用には実認証が必要 | Phase 2でBetter-auth本格導入時                 |
| TD-003 | 画像最適化が未実装           | 表示速度に影響しうる     | 後日対応                                       |
| TD-004 | inquiry-list.tsxが未使用     | 不要コードが残存         | /listingページに問い合わせ管理タブ追加時に活用 |
