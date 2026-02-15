# Stripe本番申請ガイド

> タスク: sumitsugi-u22 | 作成日: 2026-02-15

---

## 概要

Stripe Connectを本番環境で利用するため、Stripe Dashboardで本番申請（Production Application）を提出する手順を記載します。

## 前提条件

本番申請を行う前に、以下が完了している必要があります:

### 1. Stripe Connect設定完了

- [x] Stripe Connectが有効化されている
- [x] プラットフォーム設定（Platform Settings）が完了
- [x] Standard Accountタイプが選択されている
- [x] Destination Charges実装済み

### 2. 実装完了

- [x] 決済システム実装完了（Phase 4）
- [x] Webhook実装完了（`/api/webhooks/stripe`）
- [x] 前の住人オンボーディングフロー実装完了
- [x] テスト環境で動作確認済み

### 3. ビジネス情報準備

本番申請時に以下の情報が必要です:

- [ ] **会社情報**
  - 会社名/個人名
  - 住所
  - 電話番号
  - ウェブサイトURL
  - ビジネスの説明（英語推奨）

- [ ] **プラットフォーム情報**
  - サービス概要
  - ビジネスモデル（マーケットプレイス、SaaS等）
  - 取扱商品/サービスの種類
  - 想定月間取引量・金額

- [ ] **銀行口座情報**
  - プラットフォーム手数料受取用の銀行口座
  - 口座名義
  - 銀行コード・支店コード・口座番号

- [ ] **代表者情報**
  - 氏名
  - 生年月日
  - 身分証明書（運転免許証、パスポート等）

## 本番申請手順

### Step 1: Stripe Dashboardにログイン

1. https://dashboard.stripe.com/ にアクセス
2. アカウントにログイン
3. 右上の「テストモード」トグルを確認（現在はテストモード）

### Step 2: Connect設定確認

1. 左メニュー → **Connect** → **Settings** に移動
2. **Account types** でStandardが有効化されていることを確認
3. **Branding** でプラットフォーム名・アイコンを設定

### Step 3: 本番申請フォームにアクセス

1. 左メニュー → **Settings** → **Account details**
2. **Business information** セクションを確認
3. **Activate account** または **Submit application** ボタンをクリック

### Step 4: ビジネス情報入力

以下の情報を入力します:

#### ビジネス詳細

- **Business name**: 株式会社sumitsugi（仮）
- **Business type**: Corporation / Individual
- **Business description**:
  ```
  sumitsugi is a peer-to-peer furniture handover platform for renters in Japan.
  We facilitate transactions where outgoing tenants transfer furniture to incoming tenants,
  with landlord approval. Our platform handles escrow payments and consent documentation.
  ```
- **Website**: https://sumitsugi.example.com
- **Support email**: support@sumitsugi.example.com
- **Business phone**: +81-XX-XXXX-XXXX

#### 代表者情報

- Full name
- Date of birth
- Address
- Phone number

#### 銀行口座情報

- Bank name
- Branch name
- Account number
- Account holder name

#### 本人確認書類アップロード

- 運転免許証（表・裏）
- または パスポート
- または マイナンバーカード

### Step 5: Stripe Connect固有情報

#### プラットフォームタイプ

- **Type**: Marketplace
- **Connected account type**: Standard

#### 取引情報

- **Average transaction amount**: ¥100,000 - ¥200,000
- **Expected monthly volume**: 5-10 transactions (MVP初期)
- **Geographic market**: Japan only

#### リスク管理

- **Refund policy**: [利用規約 §キャンセルポリシー参照]
- **Dispute handling**: Platform-mediated resolution
- **Customer support**: Email support with 24-48h response time

### Step 6: 申請提出

1. 全ての必須項目を入力
2. 入力内容を確認
3. **Submit application** をクリック

### Step 7: 審査待機

- **審査期間**: 通常1-3営業日
- **追加情報要求**: Stripeから追加情報を求められる場合あり
  - メール通知を確認
  - Dashboard上の通知を確認

### Step 8: 承認後の設定

審査承認後:

1. **本番APIキー取得**
   - Dashboard → Developers → API keys
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`（表示時に必ずコピー、二度と表示されない）

2. **環境変数更新**

   ```bash
   # Vercel環境変数に設定
   vercel env add STRIPE_SECRET_KEY production
   # → sk_live_... を入力

   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   # → pk_live_... を入力
   ```

3. **Webhook再設定**
   - Dashboard → Developers → Webhooks
   - テスト環境のWebhookを確認
   - 本番環境用Webhookを追加（本番URLに対して）
   - Webhook signing secretを環境変数に追加

4. **Connect Onboarding URL更新**
   - 本番環境のConnected Account作成フローが正しいURLを使用しているか確認

## 本番環境チェックリスト

申請承認後、以下を確認:

- [ ] 本番APIキーが環境変数に設定されている
- [ ] Webhook endpointが本番URLに設定されている
- [ ] Webhook signing secretが環境変数に設定されている
- [ ] テスト決済が成功する
- [ ] Connected Account作成フローが動作する
- [ ] エスクロー・分配ロジックが動作する

## トラブルシューティング

### 申請が却下された場合

1. **却下理由を確認**
   - Dashboard通知またはメールを確認
   - 不足情報・不明確な点を特定

2. **情報を修正・追加**
   - 求められた情報を追加
   - ビジネスモデルをより詳細に説明

3. **再申請**
   - 修正後、再度Submit

### よくある却下理由

- ビジネスモデルの説明不足
- 本人確認書類の不備
- 想定取引量の根拠不足
- ウェブサイト未公開（ランディングページでも可）

## 参考リソース

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Activation Guide](https://stripe.com/docs/connect/enable-payment-acceptance-guide)
- [docs/setup/deployment.md](./deployment.md) - デプロイガイド
- [docs/requirements/payment.md](../requirements/payment.md) - 決済システム仕様

## 注意事項

### 法的要件

本番申請前に以下を確認:

- [ ] 利用規約が整備されている
- [ ] プライバシーポリシーが整備されている
- [ ] 特定商取引法表記が整備されている
- [ ] 外部弁護士による法務レビュー完了（資金移動業登録不要の確認）

### セキュリティ

- 本番APIキーは**絶対にGitにコミットしない**
- 環境変数としてのみ管理
- ローテーション計画を策定（年1回推奨）

### モニタリング

本番稼働後:

- Stripe Dashboardで取引を日次確認
- 失敗した決済を監視
- Webhook配信失敗を監視
- 異常な取引パターンを検知

---

**Next Steps:**

1. このチェックリストを元に必要情報を準備
2. Stripe Dashboardで本番申請を提出
3. 承認後、本番APIキーを環境変数に設定
4. 本番環境でテスト決済を実施
5. sumitsugi-u22タスクをクローズ
