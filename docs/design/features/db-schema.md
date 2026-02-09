# T-4: DBスキーマ拡張（Drizzleマイグレーション）

> 技術決定: **Drizzleマイグレーション** — `landlordConsent`をJSONB構造化、`moveOutDate`等のフィールド追加

関連機能: F-501, F-611, F-XXX(§7.7)

データモデル定義の詳細は [requirements/data-model.md](../requirements/data-model.md) を参照。

---

## 変更一覧

| 変更内容                          | テーブル   | 説明                                                                                                          |
| --------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `moveOutDate` 追加                | properties | 退去日（nullable timestamp）                                                                                  |
| `moveOutReason` 追加              | properties | 引越し理由（varchar(50)、[data-model.md §7.6](../requirements/data-model.md#76-moveoutreason引越し理由)参照） |
| `managementCompanyName` 追加      | properties | 管理会社名（nullable varchar(255)）                                                                           |
| `managementConsultedAt` 追加      | properties | 管理会社相談日時（nullable timestamp）                                                                        |
| `landlordConsent` をJSONBに構造化 | properties | boolean → ConsentStatus構造体（破壊的変更）                                                                   |
| `pdfUrls` 追加                    | properties | 生成済みPDFのR2 URL格納（JSONB）                                                                              |
| `furnitureItems` 変更             | properties | 旧`furniture: text[]` → `furnitureItems: JSONB`（FurnitureItem[]、破壊的変更）                                |
| `coreSetPrice` 追加               | properties | コアセット一括価格（nullable integer）                                                                        |
| `handoverFee` 既存                | properties | 引越し費用（既にintegerカラムとして存在）                                                                     |
| `agreedFurnitureIds` 追加         | inquiries  | 確定家具IDリスト（text[]）                                                                                    |
| `duration` 追加                   | inquiries  | 希望契約期間（nullable varchar(100)）                                                                         |
| `viewingDate` 追加                | inquiries  | 内見日時（nullable timestamp）                                                                                |
| `threads` テーブル新規作成        | threads    | メッセージスレッド（T-5、詳細は [messaging.md](./messaging.md)）                                              |
| `messages` テーブル新規作成       | messages   | メッセージ（T-5、詳細は [messaging.md](./messaging.md)）                                                      |

**注:** `brand`/`newPrice`/`yearsUsed`/`furnitureCategory`/`pin`はFurnitureItem JSONB内フィールドのため、カラム追加不要。

## マイグレーション実行戦略（技術会議#11で決定）

- **単一マイグレーション**で全変更を実行（プレローンチのため本番データなし）
- 破壊的変更のデータ変換SQL:
  - `landlordConsent`: `UPDATE properties SET landlord_consent = jsonb_build_object('status', CASE WHEN landlord_consent THEN 'approved' ELSE 'pending' END)` （カラム型変更後）
  - `furniture` → `furnitureItems`: カラムリネーム + 型変更（text[] → JSONB）。既存の文字列配列は空配列`[]`で初期化
- enum制約（MoveOutReason, ConsentStatus, FurnitureCategory）は**アプリ層Zodで管理**（DB CHECK制約なし。カテゴリ追加時のマイグレーション不要化）
- threads/messagesテーブルはPhase 3実装だが、**スキーマ定義はPhase 0で作成**（後からALTER TABLEよりクリーン）
