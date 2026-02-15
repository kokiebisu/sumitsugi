# Stripe本番申請チェックリスト

> タスク: sumitsugi-u22 | 簡易版チェックリスト

---

## 申請前準備（30分）

### 必要情報の収集

- [ ] **会社情報**
  - [ ] 会社名/個人名
  - [ ] 住所（郵便番号含む）
  - [ ] 電話番号
  - [ ] ウェブサイトURL
  - [ ] サポートメールアドレス

- [ ] **代表者情報**
  - [ ] 氏名（フルネーム）
  - [ ] 生年月日
  - [ ] 住所
  - [ ] 電話番号
  - [ ] 本人確認書類の画像ファイル（運転免許証・パスポート・マイナンバーカード）

- [ ] **銀行口座情報**
  - [ ] 銀行名
  - [ ] 支店名
  - [ ] 口座種別（普通/当座）
  - [ ] 口座番号
  - [ ] 口座名義

- [ ] **ビジネス説明（英語）**
  ```
  sumitsugi is a peer-to-peer furniture handover platform for renters in Japan.
  We facilitate transactions where outgoing tenants transfer furniture to incoming tenants,
  with landlord approval. Our platform handles escrow payments and consent documentation.
  ```

---

## 申請手順（15分）

### 1. Stripe Dashboardアクセス

- [ ] https://dashboard.stripe.com/ にログイン
- [ ] 現在テストモードであることを確認

### 2. 本番申請フォーム

- [ ] Settings → Account details に移動
- [ ] "Activate account" または "Submit application" をクリック

### 3. フォーム入力

#### Business information

- [ ] Business name: `株式会社sumitsugi`（仮）
- [ ] Business type: `Corporation` or `Individual`
- [ ] Business description: 上記英語説明を入力
- [ ] Website: `https://sumitsugi.example.com`
- [ ] Support email: `support@sumitsugi.example.com`
- [ ] Phone: `+81-XX-XXXX-XXXX`

#### Representative information

- [ ] Full name
- [ ] Date of birth
- [ ] Address
- [ ] Phone

#### Banking details

- [ ] Bank account information
- [ ] Upload ID verification document

#### Platform details (Stripe Connect)

- [ ] Platform type: `Marketplace`
- [ ] Connected account type: `Standard`
- [ ] Average transaction: `¥100,000 - ¥200,000`
- [ ] Monthly volume: `5-10 transactions` (MVP初期想定)
- [ ] Market: `Japan`

### 4. 提出

- [ ] 全項目を確認
- [ ] "Submit application" をクリック

---

## 承認後の作業（30分）

### 審査結果確認

- [ ] 審査完了メールを待つ（1-3営業日）
- [ ] Dashboard通知を確認

### 本番APIキー取得

- [ ] Dashboard → Developers → API keys
- [ ] Publishable key (pk*live*...) をコピー
- [ ] Secret key (sk*live*...) をコピー ⚠️ **一度しか表示されない**

### 環境変数設定

Vercel環境変数に追加:

```bash
# 本番Secret Key
vercel env add STRIPE_SECRET_KEY production
# → sk_live_... を入力

# 本番Publishable Key
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# → pk_live_... を入力
```

### Webhook設定

- [ ] Dashboard → Developers → Webhooks → Add endpoint
- [ ] URL: `https://sumitsugi.example.com/api/webhooks/stripe`
- [ ] Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `transfer.created`, `transfer.updated`
- [ ] Webhook signing secret (whsec\_...) をコピー
- [ ] 環境変数に設定:
  ```bash
  vercel env add STRIPE_WEBHOOK_SECRET production
  # → whsec_... を入力
  ```

### 本番環境デプロイ

- [ ] 環境変数設定後、再デプロイ:
  ```bash
  git commit --allow-empty -m "chore: trigger redeploy for Stripe production keys"
  git push origin main
  ```

### 動作確認

- [ ] 本番環境でテスト決済を実施
- [ ] Connected Account作成フローを確認
- [ ] Webhook配信を確認（Dashboard → Webhooks → Logs）

---

## 完了条件

以下が全て完了したらタスククローズ:

- [x] Stripe本番申請が承認された
- [x] 本番APIキーが環境変数に設定されている
- [x] Webhookが本番URLに設定されている
- [x] 本番環境でテスト決済が成功した
- [x] sumitsugi-u22タスクをクローズ

---

## トラブル時の連絡先

- **Stripe Support**: https://support.stripe.com/
- **ドキュメント**: https://stripe.com/docs/connect
- **詳細ガイド**: [docs/setup/stripe-production-activation.md](./stripe-production-activation.md)
