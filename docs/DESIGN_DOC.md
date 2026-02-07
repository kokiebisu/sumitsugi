# tsumugi 設計ドキュメント（DESIGN_DOC）

> 技術的な「How」を記述するドキュメント。「What」（要件・仕様）は [`requirements/`](./requirements/README.md) を参照。

最終更新日: 2026-02-07（技術会議#12反映：T-7決済2段階化・T-8ロードマップ短縮・F-205/F-206/F-616 Post-MVP移動）

---

## 1. 技術決定サマリー

MVP実装に向けた技術選定。`/meeting:tech`（技術会議 2026-02-06）で決定。

| #   | 残論点                       | 決定                                                                                                                                                                                                          | 関連機能                  | ステータス |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------- |
| T-1 | PDF自動生成の技術選定        | **`@react-pdf/renderer`** — サーバーサイド`renderToBuffer()` + R2保存。日本語フォント: Noto Sans JP                                                                                                           | F-611, F-612, F-616       | 解決済み   |
| T-2 | メール送信サービスの技術選定 | **Resend + React Email** — 導入済み（Better-auth magic linkで使用中）。MVP無料枠（3,000通/月）で十分                                                                                                          | F-204, F-205              | 解決済み   |
| T-3 | 定期実行（Cron）の技術選定   | **Vercel Cron Jobs** — `vercel.json`にcron定義。毎日実行でリマインドチェック + 期限切れチェック                                                                                                               | F-205, F-206              | 解決済み   |
| T-4 | DBスキーマ拡張               | **Drizzleマイグレーション** — `landlordConsent`をJSONB構造化、`moveOutDate`等のフィールド追加。座談会#9で`handoverFee`(Property)、`brand`/`newPrice`/`yearsUsed`/`pin`/`furnitureCategory`(FurnitureItem)追加 | F-501, F-611, F-XXX(§7.7) | 解決済み   |
| T-5 | 簡易メッセージ機能の技術選定 | **DB + Server Actions** — messagesテーブル + threadsテーブル。ポーリングベース（MVP）。メール通知はResend既存パイプライン活用                                                                                 | F-XXX(§3.1メッセージ)     | 解決済み   |
| T-6 | 値付けガイダンスの実装方式   | **クライアントサイド計算** — FurnitureItemのnewPrice・yearsUsedから減価テーブルで目安レンジを算出。バックエンド不要                                                                                           | F-XXX(§7.10)              | 解決済み   |
| T-7 | 決済フロー2段階化            | **申込金¥20,000→残額一括** — MVP: deposit除外、PaymentIntentは2種類のみ（application_fee/remaining）。デポジット分離はPost-MVP                                                                                | §12.4, §12.7              | 解決済み   |
| T-8 | MVPロードマップ短縮          | **F-205/F-206/F-616除外** — コンシェルジュ型MVPにより自動化・仲介PDFをPost-MVP移動。Phase 2-4短縮、合計約6.5-8.5週間                                                                                          | §3.1, §3.2                | 解決済み   |

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

**テンプレート配置:** `src/lib/pdf/templates/` に F-611・F-612 それぞれ別テンプレート（F-616はPost-MVP）
**日本語フォント:** Noto Sans JP（public/fonts/ に配置 or CDN動的ロード）
**実装優先順位:** F-611（Phase 2）→ F-612（Phase 3）。F-616はPost-MVP（座談会#11: コンシェルジュ型MVPでは管理会社経由で伝達）

**PDF品質要件（座談会#5）:**

- 結論ファースト構成（アクション手順→概要→家具リスト→メリット→リスク対応→FAQ）
- A4 3枚以内
- tsumugiブランディング控えめ
- メール送付テンプレートも付随提供
- 詳細は[座談会#5議事録](./meetings/2026-02-07-product-meeting-5-pdf-templates.md)

### 2.2 T-2: メール送信アーキテクチャ

**テンプレート配置:** `src/lib/email/templates/` に React Email コンポーネント

| メール種別           | トリガー                      | 宛先         | Reply-to           | 機能ID                 |
| -------------------- | ----------------------------- | ------------ | ------------------ | ---------------------- |
| 問い合わせ確認       | 問い合わせ送信時              | 次の住人     | —                  | F-204                  |
| 新着問い合わせ通知   | 問い合わせ送信時              | 前の住人     | 問い合わせ者メアド | F-204                  |
| ~~承認リマインド~~   | ~~退去日確定後 7/14/21/27日~~ | ~~前の住人~~ | —                  | ~~F-205~~ **Post-MVP** |
| ~~自動非公開化通知~~ | ~~退去日確定後 30日~~         | ~~前の住人~~ | —                  | ~~F-206~~ **Post-MVP** |
| 新着メッセージ通知   | メッセージ受信時              | 相手方       | —                  | T-5                    |
| 内見フォローメール   | 内見翌日（自動送信）          | 次の住人     | —                  | §11                    |
| 管理会社紹介テンプレ | 契約手続き開始時（手動送信）  | 管理会社     | 前の住人メアド     | §11                    |

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

**注（技術会議#12）:** F-205/F-206がPost-MVPに移動したため、**Cron Jobs実装自体がPost-MVP**。MVPでは運営が手動プッシュ（コンシェルジュ型対応）。設計は保持し、Post-MVP移行時にそのまま実装可能。

### 2.4 T-4: DBスキーマ拡張（Drizzleマイグレーション）

[requirements/data-model.md](./requirements/data-model.md) のデータモデル定義に基づく。

| 変更内容                          | テーブル   | 説明                                                                                                         |
| --------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ |
| `moveOutDate` 追加                | properties | 退去日（nullable timestamp）                                                                                 |
| `moveOutReason` 追加              | properties | 引越し理由（varchar(50)、[data-model.md §7.6](./requirements/data-model.md#76-moveoutreason引越し理由)参照） |
| `managementCompanyName` 追加      | properties | 管理会社名（nullable varchar(255)）                                                                          |
| `managementConsultedAt` 追加      | properties | 管理会社相談日時（nullable timestamp）                                                                       |
| `landlordConsent` をJSONBに構造化 | properties | boolean → ConsentStatus構造体（破壊的変更）                                                                  |
| `pdfUrls` 追加                    | properties | 生成済みPDFのR2 URL格納（JSONB）                                                                             |
| `furnitureItems` 変更             | properties | 旧`furniture: text[]` → `furnitureItems: JSONB`（FurnitureItem[]、破壊的変更）                               |
| `coreSetPrice` 追加               | properties | コアセット一括価格（nullable integer）                                                                       |
| `handoverFee` 既存                | properties | 引越し費用（既にintegerカラムとして存在）                                                                    |
| `agreedFurnitureIds` 追加         | inquiries  | 確定家具IDリスト（text[]）                                                                                   |
| `duration` 追加                   | inquiries  | 希望契約期間（nullable varchar(100)）                                                                        |
| `viewingDate` 追加                | inquiries  | 内見日時（nullable timestamp）                                                                               |
| `threads` テーブル新規作成        | threads    | メッセージスレッド（T-5、詳細は§2.5）                                                                        |
| `messages` テーブル新規作成       | messages   | メッセージ（T-5、詳細は§2.5）                                                                                |

**注:** `brand`/`newPrice`/`yearsUsed`/`furnitureCategory`/`pin`はFurnitureItem JSONB内フィールドのため、カラム追加不要。

**マイグレーション実行戦略（技術会議#11で決定）:**

- **単一マイグレーション**で全変更を実行（プレローンチのため本番データなし）
- 破壊的変更のデータ変換SQL:
  - `landlordConsent`: `UPDATE properties SET landlord_consent = jsonb_build_object('status', CASE WHEN landlord_consent THEN 'approved' ELSE 'pending' END)` （カラム型変更後）
  - `furniture` → `furnitureItems`: カラムリネーム + 型変更（text[] → JSONB）。既存の文字列配列は空配列`[]`で初期化
- enum制約（MoveOutReason, ConsentStatus, FurnitureCategory）は**アプリ層Zodで管理**（DB CHECK制約なし。カテゴリ追加時のマイグレーション不要化）
- threads/messagesテーブルはPhase 3実装だが、**スキーマ定義はPhase 0で作成**（後からALTER TABLEよりクリーン）

### 2.5 T-5: 簡易メッセージ機能アーキテクチャ

座談会#8でMVP格上げ決定。個人メアド非公開・内見日程調整に必須。

```
[次の住人] → メッセージ送信 (Server Action)
  → messagesテーブルにINSERT
  → Resendで相手に通知メール（「新着メッセージがあります」+ tsumugiリンク）
  → [前の住人] がtsumugi上で閲覧・返信
```

**データモデル（技術会議#11で詳細設計確定）:**

**threads テーブル:**

| フィールド | 型            | 制約                                  | 説明                 |
| ---------- | ------------- | ------------------------------------- | -------------------- |
| id         | text          | PK                                    | スレッドID (UUID)    |
| propertyId | text          | FK → properties.id, NOT NULL, CASCADE | 物件ID               |
| sellerId   | text          | FK → users.id, NOT NULL, CASCADE      | 前の住人のユーザーID |
| buyerId    | text          | FK → users.id, NOT NULL, CASCADE      | 次の住人のユーザーID |
| createdAt  | timestamp(tz) | NOT NULL, default now()               | 作成日時             |
| —          | —             | UNIQUE(propertyId, sellerId, buyerId) | 1物件×1ペア1スレッド |

**messages テーブル:**

| フィールド  | 型            | 制約                               | 説明                                    |
| ----------- | ------------- | ---------------------------------- | --------------------------------------- |
| id          | text          | PK                                 | メッセージID (UUID)                     |
| threadId    | text          | FK → threads.id, NOT NULL, CASCADE | スレッドID                              |
| senderId    | text          | FK → users.id, nullable, SET NULL  | 送信者ID（退会時NULL→「退会済み」表示） |
| body        | text          | NOT NULL                           | メッセージ本文（上限2,000文字・Zod）    |
| messageType | varchar(20)   | NOT NULL, default 'text'           | text / template / system                |
| metadata    | jsonb         | nullable                           | テンプレートID等の補助情報              |
| createdAt   | timestamp(tz) | NOT NULL, default now()            | 送信日時                                |
| readAt      | timestamp(tz) | nullable                           | 既読日時（nullは未読）                  |

**インデックス:**

- threads: `idx_threads_property_id`, `idx_threads_seller_id`, `idx_threads_buyer_id`
- messages: `idx_messages_thread_id`, `idx_messages_sender_id`, `idx_messages_created_at`

**設計判断（技術会議#11）:**

- **スキーマ配置:** 新規ファイル `src/db/schema/messages.ts` に threads + messages を配置
- **UNIQUE制約:** DB制約で1物件×1ペア1スレッドを保証（race condition防止）
- **senderId SET NULL:** ユーザー退会時もメッセージ履歴は保全（契約エビデンス価値）
- **messageType:** 初期設計に含める（将来のAIテンプレート提案・Analytics用。追加コストほぼゼロ）
- **テンプレート保存方式:** bodyに展開結果を保存（送信時点の文面保持。テンプレート元情報はmetadata JSONB）
- **body上限:** 2,000文字（Zodバリデーション。DB制約なし）

**実装方針:**

- Server Actionsで送受信（API Route不要）
- ポーリングベース（MVP）: 画面表示時にfetch、30秒間隔で新着チェック
- 日程調整テンプレート: 定型文ボタン（「内見候補日: ①○月○日 ②○月○日 ③○月○日」）
- メール通知: 新着メッセージ時にResendで通知（本文は含めず、リンクのみ）
- ファイル配置: `src/app/(main)/messages/`, `src/lib/actions/message.ts`

**Phase 2移行:** WebSocket/SSEでリアルタイム化、既読表示、画像添付

### 2.6 T-6: 値付けガイダンス実装

座談会#9で決定。クライアントサイドのみで完結。

```
[出品フォーム]
  → FurnitureItemのcategory選択 → デフォルトnewPriceを自動セット
  → yearsUsed入力 → 減価テーブルで目安レンジ計算
  → 「参考値: ¥XX,XXX 〜 ¥YY,YYY」を表示

[物件詳細ページ]
  → 各FurnitureItemのnewPrice合計 → 「新品で揃えた場合: 約○万円」
  → handoverFee / newPrice合計 → 「新品の○%の価格で引き継ぎ」
```

**実装メモ:**

- 減価テーブル（[data-model.md §7.10.1](./requirements/data-model.md#7101-減価目安レンジ)）はconstオブジェクトで定義: `src/lib/pricing.ts`
- カテゴリ別デフォルト新品価格もconstオブジェクトで定義（同ファイル）
- UIコンポーネント: `src/components/listing/pricing-guidance.tsx`
- バックエンド不要（計算はすべてクライアント）

---

## 3. MVP実装ロードマップ

技術会議（2026-02-06）で合意。座談会#8・#9の追加決定を反映。技術会議#12でT-7/T-8反映（2026-02-07更新）。

```
Phase 0: インフラ整備（1週間）
├── DBスキーマ拡張: 単一マイグレーション（技術会議#11確定）
│   ├── properties: moveOutDate, moveOutReason, managementCompanyName, managementConsultedAt, pdfUrls, coreSetPrice追加
│   ├── properties: landlordConsent boolean→JSONB構造化（破壊的変更・データ変換SQL付き）
│   ├── properties: furniture text[]→furnitureItems JSONB（破壊的変更・FurnitureItem[]化）
│   ├── inquiries: duration, agreedFurnitureIds, viewingDate追加
│   └── threads/messagesテーブル新規作成（T-5スキーマ先行作成・実装はPhase 3）
├── Resendメールテンプレート基盤
└── @react-pdf/renderer セットアップ + 日本語フォント + POC検証

Phase 1: コア機能強化（2週間）
├── F-501/F-502: 退去日フィールド + バリデーション
├── 出品フォーム改修（必須/任意フィールド整理、FurnitureItem入力UI、カテゴリ選択+デフォルト新品価格）
├── 値付けガイダンス（T-6: 減価テーブル目安レンジ表示、比較表示）
├── 大家承認ステータス表示（バッジ・バナー 5パターン）
├── F-204: 問い合わせ通知メール（Resend）
├── F-701: 使い方ガイドページ（静的ページ）
└── 内見フロー基盤（家具チェックリストUI、内見フォローメール自動送信 — §11 step 4-5）

Phase 2: PDF + B2B（1-2週間）← T-8: F-616除外で短縮
├── F-611: 残置物引き継ぎ相談資料PDF（結論ファースト・A4 3枚以内）
├── ~~F-616: 仲介向け物件シートPDF~~ → Post-MVP（座談会#11: 管理会社経由で伝達）
├── F-615: 管理会社向けFAQ（静的ページ）
└── PDF生成トリガー（退去日設定時に自動生成）

Phase 3: メッセージング + 同意書（1-1.5週間）← T-8: F-205/F-206除外で短縮
├── ~~F-205: 承認リマインド通知~~ → Post-MVP（座談会#11: 運営手動プッシュ）
├── ~~F-206: 承認期限切れ自動処理~~ → Post-MVP（座談会#11: 運営手動対応）
├── F-612: 残置物同意書PDF（家具リスト確定時）
└── T-5: 簡易メッセージ機能（threads/messagesテーブル、Server Actions、日程調整テンプレート、メール通知）

Phase 4: 決済基盤 — Stripe Connect（1.5-2週間）← T-7: 2段階化で短縮
├── Stripe Connectプラットフォーム設定（APIキー・Webhook endpoint・環境変数）
├── 前の住人オンボーディングフロー（出品時にConnected Account作成 + Stripe Hosted Onboarding）
├── 決済UI（2段階チェックアウト: 申込金¥20,000→残額一括）
├── Webhook処理（payment_intent.succeeded, account.updated, transfer.created等）
└── 管理者エスクロー解放（手動トリガーのAdmin画面 — 引き継ぎ完了確認後に実行）

合計: 約6.5-8.5週間（T-7/T-8により従来の9-11週間から短縮）
```

---

## 4. UIデザイン仕様

カラーパレット・スペーシング・大家承認バッジ/バナーの仕様は **[requirements/design-guidelines.md](./requirements/design-guidelines.md)** を参照。

### 4.1 実装メモ

- バッジ/バナーのコンポーネントは `src/components/listing/` に配置
- バナー表示ロジック: `moveOutDate` と `managementConsultedAt` の組み合わせで5パターン分岐（[design-guidelines.md §10.5](./requirements/design-guidelines.md#大家承認バッジ)参照）
- FurnitureItem入力UI: コアセット/追加家具のグルーピング（drag & drop or チェックボックス方式）

---

## 5. 決済システム設計

決済データモデル（Payment / Transaction / StripeAccount）および Stripe Connect 実装方針は **[requirements/payment.md](./requirements/payment.md)** を参照。

### 5.1 実装固有のメモ

- **Webhook endpoint:** `POST /api/stripe/webhook`
- **Connect OAuth:** `GET /api/stripe/connect/authorize` → `GET /api/stripe/connect/callback`
- **エスクロー解放:** `POST /api/admin/escrow/release` （認証必須・Admin権限）
- **環境変数:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`

### 5.2 関連設計ドキュメント

- [決済システム設計書](./plans/2026-01-31-payment-system-design.md) - 全体設計、料金体系、エスクロー、申込金モデル
- [法的レビュー質問リスト](./plans/legal-review-questions.md) - 弁護士確認用の質問事項

### 5.3 Post-MVP実装メモ（技術会議#12）

以下はMVPスコープからPost-MVPに移動した項目の技術メモ。設計は確定済みのため、移行時にそのまま実装可能。

| 項目                           | 設計参照                                                                      | 移動理由                                | 移行時の作業                            |
| ------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------- |
| F-205 承認リマインド通知       | §2.2, §2.3                                                                    | コンシェルジュ型MVPでは運営手動プッシュ | Cron Job実装 + メールテンプレート       |
| F-206 承認期限切れ自動処理     | §2.3                                                                          | 同上                                    | Cron Job実装 + 自動非公開化ロジック     |
| F-616 仲介向け物件シートPDF    | §2.1                                                                          | 管理会社経由で伝達                      | PDFテンプレート追加                     |
| 決済3段階化（デポジット分離）  | §5, [payment.md §12.4](./requirements/payment.md#124-支払いフロー)            | キャンセル率データ収集後に検討          | Payment type に `deposit` 追加 + UI追加 |
| 問い合わせステータス進捗表示UI | [data-model.md §7.4](./requirements/data-model.md#74-landlordconsent大家承認) | MVPではメッセージベースで代替           | ステータス進捗バーコンポーネント作成    |

---

## 6. 既知の技術的負債

| ID     | 問題                         | 影響                     | 対応時期                                       |
| ------ | ---------------------------- | ------------------------ | ---------------------------------------------- |
| TD-001 | サンプルデータがハードコード | DBに切り替えれば解消     | Phase 0（DBスキーマ拡張）で解消予定            |
| TD-002 | 認証がモック状態             | 本番運用には実認証が必要 | Phase 0-1でBetter-auth本番設定時に解消予定     |
| TD-003 | 画像最適化が未実装           | 表示速度に影響しうる     | 後日対応                                       |
| TD-004 | inquiry-list.tsxが未使用     | 不要コードが残存         | /listingページに問い合わせ管理タブ追加時に活用 |
