# sumitsugi 設計ドキュメント

> 技術的な「How」を記述するドキュメント。「What」（要件・仕様）は [`requirements/`](../requirements/README.md) を参照。

最終更新日: 2026-02-16（管理会社オペレーション自動化設計追加）

---

## 技術決定サマリー

MVP実装に向けた技術選定。`/meeting:tech`（技術会議 2026-02-06）で決定。

| #   | 残論点                       | 決定                                                                                                                                                                                                          | 関連機能                  | ステータス | 詳細                                                           |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------- | -------------------------------------------------------------- |
| T-1 | PDF自動生成の技術選定        | **`@react-pdf/renderer`** — サーバーサイド`renderToBuffer()` + R2保存。日本語フォント: Noto Sans JP                                                                                                           | F-611, F-612, F-616       | 解決済み   | [features/pdf-generation.md](./features/pdf-generation.md)     |
| T-2 | メール送信サービスの技術選定 | **Resend + React Email** — 導入済み（Better-auth magic linkで使用中）。MVP無料枠（3,000通/月）で十分                                                                                                          | F-204, F-205              | 解決済み   | [features/email-system.md](./features/email-system.md)         |
| T-3 | 定期実行（Cron）の技術選定   | **Vercel Cron Jobs** — `vercel.json`にcron定義。毎日実行でリマインドチェック + 期限切れチェック                                                                                                               | F-205, F-206              | 解決済み   | [features/cron-jobs.md](./features/cron-jobs.md)               |
| T-4 | DBスキーマ拡張               | **Drizzleマイグレーション** — `landlordConsent`をJSONB構造化、`moveOutDate`等のフィールド追加。座談会#9で`handoverFee`(Property)、`brand`/`newPrice`/`yearsUsed`/`pin`/`furnitureCategory`(FurnitureItem)追加 | F-501, F-611, F-XXX(§7.7) | 解決済み   | [features/db-schema.md](./features/db-schema.md)               |
| T-5 | 簡易メッセージ機能の技術選定 | **DB + Server Actions** — messagesテーブル + threadsテーブル。ポーリングベース（MVP）。メール通知はResend既存パイプライン活用                                                                                 | F-XXX(§3.1メッセージ)     | 解決済み   | [features/messaging.md](./features/messaging.md)               |
| T-6 | 値付けガイダンスの実装方式   | **クライアントサイド計算** — FurnitureItemのnewPrice・yearsUsedから減価テーブルで目安レンジを算出。バックエンド不要                                                                                           | F-XXX(§7.10)              | 解決済み   | [features/pricing-guidance.md](./features/pricing-guidance.md) |
| T-7 | 決済フロー2段階化            | **申込金¥20,000→残額一括** — MVP: deposit除外、PaymentIntentは2種類のみ（application_fee/remaining）。デポジット分離はPost-MVP                                                                                | §12.4, §12.7              | 解決済み   | [features/payment.md](./features/payment.md)                   |
| T-8 | MVPロードマップ短縮          | **F-205/F-206/F-616除外** — コンシェルジュ型MVPにより自動化・仲介PDFをPost-MVP移動。Phase 2-4短縮、合計約6.5-8.5週間                                                                                          | §3.1, §3.2                | 解決済み   | [roadmap.md](./roadmap.md)                                     |

---

## ドキュメント構成

### features/ — 機能別設計

| ファイル                                                        | 内容                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| [payment.md](./features/payment.md)                             | 決済システム設計 (T-7)                                    |
| [pdf-generation.md](./features/pdf-generation.md)               | PDF自動生成アーキテクチャ (T-1)                           |
| [email-system.md](./features/email-system.md)                   | メール送信アーキテクチャ (T-2)                            |
| [cron-jobs.md](./features/cron-jobs.md)                         | Vercel Cron Jobs設定 (T-3)                                |
| [db-schema.md](./features/db-schema.md)                         | DBスキーマ拡張 (T-4)                                      |
| [messaging.md](./features/messaging.md)                         | 簡易メッセージ機能 (T-5)                                  |
| [pricing-guidance.md](./features/pricing-guidance.md)           | 値付けガイダンス (T-6)                                    |
| [move-out-notification.md](./features/move-out-notification.md) | 退去通知システム設計                                      |
| [handover-agreement.md](./features/handover-agreement.md)       | 引き継ぎ合意フロー設計                                    |
| [approval-flow.md](./features/approval-flow.md)                 | 大家承諾フロー図                                          |
| [management-automation.md](./features/management-automation.md) | 管理会社オペレーション自動化設計（Phase 2、F-602〜F-605） |

### infrastructure/ — インフラ・DevEx設計

| ファイル                                                        | 内容                                  |
| --------------------------------------------------------------- | ------------------------------------- |
| [bun-migration.md](./infrastructure/bun-migration.md)           | Bun移行設計                           |
| [devcontainer.md](./infrastructure/devcontainer.md)             | devcontainer + Claude自動起動         |
| [daily-cleanup.md](./infrastructure/daily-cleanup.md)           | 自動クリーンアップシステム            |
| [mcp-servers.md](./infrastructure/mcp-servers.md)               | MCPサーバー統合（Filesystem, Linear） |
| [prettier-ts-reset.md](./infrastructure/prettier-ts-reset.md)   | Prettier + ts-reset設定               |
| [executive-personas.md](./infrastructure/executive-personas.md) | エグゼクティブペルソナ強化            |
| [e2e-testing.md](./infrastructure/e2e-testing.md)               | E2Eテスト タグフィルタリング          |

### その他（ルート）

| ファイル                       | 内容                |
| ------------------------------ | ------------------- |
| [roadmap.md](./roadmap.md)     | MVP実装ロードマップ |
| [tech-debt.md](./tech-debt.md) | 既知の技術的負債    |

### archive/ — 過去の実装計画

完了した実装タスクの詳細計画書。履歴参照用。

| ファイル                                        | 内容                            |
| ----------------------------------------------- | ------------------------------- |
| 2026-02-01-handover-agreement-implementation.md | 引き継ぎ合意フロー実装計画      |
| 2026-02-01-e2e-tag-filtering-implementation.md  | E2Eタグフィルタリング実装計画   |
| 2026-01-31-payment-system-implementation.md     | 決済システム実装計画            |
| 2026-02-02-bun-migration.md                     | Bun移行実装計画                 |
| 2026-02-02-auto-start-claude.md                 | Claude自動起動実装計画          |
| 2026-02-02-devcontainer-shell-script.md         | devcontainerスクリプト実装計画  |
| 2026-02-02-prettier-ts-reset-implementation.md  | Prettier + ts-reset実装計画     |
| legal-review-questions.md                       | 弁護士確認用 質問リスト（全文） |

---

### UIデザイン仕様

カラーパレット・スペーシング・大家承認バッジ/バナーの仕様は **[requirements/design-guidelines.md](../requirements/design-guidelines.md)** を参照。

**実装メモ:**

- バッジ/バナーのコンポーネントは `src/components/listing/` に配置
- バナー表示ロジック: `moveOutDate` と `managementConsultedAt` の組み合わせで5パターン分岐（[design-guidelines.md §10.5](../requirements/design-guidelines.md#大家承認バッジ)参照）
- FurnitureItem入力UI: コアセット/追加家具のグルーピング（drag & drop or チェックボックス方式）

---

_旧構成: `docs/DESIGN_DOC.md`（単一ファイル）→ `docs/design/`（フラット構成）→ 現在の features/infrastructure/archive 構成_
