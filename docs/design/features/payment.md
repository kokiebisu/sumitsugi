# 決済システム設計

> 技術決定 T-7: **申込金¥20,000→残額一括** — MVP: deposit除外、PaymentIntentは2種類のみ（application_fee/remaining）。デポジット分離はPost-MVP

決済データモデル（Payment / Transaction / StripeAccount）および Stripe Connect 実装方針は **[requirements/payment.md](../../requirements/payment.md)** を参照。

---

## ビジネスロジック決定事項

**作成日:** 2026-01-31
**タスク:** sumitsugi-43p - Payment System Integration

### 1. 支払いフロー: Combined Checkout

**決定:** 引越し費用として一括で徴収（内訳は表示しない）

**内訳（ユーザーには非表示）:**

- 追加清掃費
- 前の住人への支払い
- プラットフォーム手数料

**理由:** メルカリ的なシンプルさ重視。一つの金額で完結する方がUX良い。

### 2. 清掃費モデル: 管理会社が清掃

**決定:** sumitsugiが管理会社の清掃費を代理徴収

```
次の住人 → sumitsugi → 管理会社
         (引越し費用)  (追加清掃費を送金)
```

### 3. 清掃費の二重構造

- **通常の賃貸契約:** 前の住人の敷金から基本清掃費を差し引き（変更なし）
- **sumitsugiが徴収:** 家具有りの追加清掃費のみ（次の住人が負担）

```
引越し費用 = 追加清掃費 + 前の住人への支払い + プラットフォーム手数料
```

### 4. 追加清掃費: シンプル定額 ¥5,000-8,000

- 家具の数に関わらず一律
- 実コスト ¥1,500-4,000 に対して十分なマージン
- 段階制は避ける（定義の曖昧さ・複雑化）

### 5. 手数料モデル: 前の住人が総額を入力 → システムが分配

```typescript
const handoverFeeTotal = 150000; // 前の住人が入力
const additionalCleaningFee = 8000; // 固定
const landlordIncentive = Math.max(handoverFeeTotal * 0.01, 3000); // 1% + 最低¥3,000
const platformFee = handoverFeeTotal * 0.12; // 12%
const previousTenantReceives =
  handoverFeeTotal - additionalCleaningFee - landlordIncentive - platformFee;
```

### 6. 大家アカウント: 軽量 → フル

- **Phase 1:** メールアドレス + 銀行口座のみ（ダッシュボード不要）
- **Phase 2:** 大家用ダッシュボード（成長後オプション）

### 7. 大家協力金: 1% + 最低保証¥3,000

```typescript
const landlordIncentive = Math.max(handoverFeeTotal * 0.01, 3000);
```

### 8. エスクローモデル（メルカリ方式）

```
次の住人が支払い → sumitsugiがエスクロー保管（Stripe Connect）
→ 引き継ぎ実施 → 双方が「完了」押下 → 24-48h後に自動分配
```

### 9. デポジット: 30% + 上下限（¥30,000-50,000）

```typescript
const depositAmount = Math.min(Math.max(handoverFee * 0.3, 30000), 50000);
```

### 10. 申込金: ¥20,000（非返金）+ デポジット30%（返金可能）

**前の住人ファースト戦略**（Airbnbのホスト重視と同様）:

- 申込金は即座に前の住人へTransfer
- 審査落ち時も返金なし（前の住人への補償）

---

## 実装エンドポイント

- **Webhook endpoint:** `POST /api/stripe/webhook`
- **Connect OAuth:** `GET /api/stripe/connect/authorize` → `GET /api/stripe/connect/callback`
- **エスクロー解放:** `POST /api/admin/escrow/release` （認証必須・Admin権限）
- **環境変数:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`

---

## Stripe Webhook 設定

### 処理イベント

**Critical:**

- `payment_intent.succeeded` — 支払い完了。`application_fee` は即座に前の住人へTransfer
- `payment_intent.payment_failed` — 支払い失敗。ステータス更新 + 失敗理由記録

**Informational:**

- `transfer.created` / `transfer.updated` — ログ記録

### 開発環境セットアップ

```bash
# Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# → whsec_... をコピーして .env.local に設定
```

### 本番環境

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `transfer.updated`
4. `STRIPE_WEBHOOK_SECRET` を環境変数に設定

### セキュリティ

- Signature検証（`stripe-signature` ヘッダー）
- 冪等性保証（重複イベント対応）
- 適切なHTTPステータスコード返却

### イベントシーケンス

**申込金（非返金）:**

1. PaymentIntent作成 → `payment_intent.succeeded` → `processApplicationFeeTransfer()` → 前の住人へTransfer

**デポジット/残額（エスクロー）:**

1. PaymentIntent作成（`capture_method: manual`） → `payment_intent.succeeded` → 保留
2. 紛争期間(48h)後 → `releaseEscrow()` → 分配

---

## 法的レビュー質問リスト

弁護士確認用の質問事項。Stripe Connect導入前の法的リスク確認。

### 主要カテゴリ

| #   | カテゴリ             | 主要質問                                                 |
| --- | -------------------- | -------------------------------------------------------- |
| 1   | 資金決済法           | 資金移動業ライセンス要否、エスクロー期間制限、供託金     |
| 2   | 不動産関連法規       | 宅建業法適用可否、仲介手数料規制、残置物同意書の法的効力 |
| 3   | プラットフォーム責任 | トラブル時の責任範囲、特商法適用、個人情報保護           |
| 4   | 契約・利用規約       | 必須条項、キャンセルポリシー有効性、大家・管理会社契約   |
| 5   | 税務                 | 消費税、支払調書、源泉徴収                               |
| 6   | Stripe利用規約       | 禁止業種確認、手数料転嫁                                 |
| 7   | その他               | AML/KYC、犯罪収益移転防止法、約款掲示義務                |

詳細な質問内容はアーカイブ（`archive/legal-review-questions.md`）を参照。

---

## Post-MVP実装メモ（技術会議#12）

| 項目                           | 設計参照                                                             | 移動理由                                | 移行時の作業                    |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------------- | ------------------------------- |
| F-205 承認リマインド通知       | [email-system.md](./email-system.md), [cron-jobs.md](./cron-jobs.md) | コンシェルジュ型MVPでは運営手動プッシュ | Cron Job + メールテンプレート   |
| F-206 承認期限切れ自動処理     | [cron-jobs.md](./cron-jobs.md)                                       | 同上                                    | Cron Job + 自動非公開化ロジック |
| F-616 仲介向け物件シートPDF    | [pdf-generation.md](./pdf-generation.md)                             | 管理会社経由で伝達                      | PDFテンプレート追加             |
| 決済3段階化（デポジット分離）  | [requirements/payment.md §12.4](../../requirements/payment.md)       | キャンセル率データ収集後に検討          | Payment type に `deposit` 追加  |
| 問い合わせステータス進捗表示UI | [requirements/data-model.md §7.4](../../requirements/data-model.md)  | MVPではメッセージベースで代替           | 進捗バーコンポーネント作成      |

---

## 未決定事項

1. プラットフォーム手数料率の確定（12-15%のどこか）
2. 賃貸契約状態のトラッキング方法
3. データベーススキーマの最終確定
4. フェーズ1実装スコープの決定

---

_元ファイル: `design/payment-implementation.md`, `plans/2026-01-31-payment-system-design.md`, `plans/stripe-webhook-setup.md`, `plans/legal-review-questions.md`_
