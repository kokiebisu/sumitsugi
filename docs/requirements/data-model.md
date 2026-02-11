# データモデル

> 旧 REQUIREMENTS.md §7 | Feature IDs: — | DESIGN_DOC参照: T-4 | 最終更新: 2026-02-09

---

## 7.1 Property（物件）

| フィールド            | 型                  | 必須 | 説明                                                                                                                                                                                 |
| --------------------- | ------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                    | string              | ○    | 物件ID                                                                                                                                                                               |
| title                 | string              | ○    | 物件タイトル                                                                                                                                                                         |
| images                | string[]            | ○    | 物件画像URL配列                                                                                                                                                                      |
| estimatedDuration     | string              | ○    | 契約期間（例：「2〜4ヶ月」）                                                                                                                                                         |
| status                | 'draft' \| 'public' | ○    | 公開ステータス                                                                                                                                                                       |
| taste                 | string              | -    | テイスト（例：北欧風、ミニマル、和モダン）                                                                                                                                           |
| tasteCategory         | TasteCategory       | -    | テイストカテゴリ（enum型。将来AIマッチング用特徴量）— [技術会議#13 CAIO推奨](../design/meetings/2026-02-09-tech-meeting-13-delta.md)                                                 |
| concept               | string              | -    | 空間のコンセプト・ストーリー                                                                                                                                                         |
| lifestyle             | string              | -    | 暮らし方の説明                                                                                                                                                                       |
| videoTourUrl          | string              | -    | 動画ツアーURL                                                                                                                                                                        |
| faq                   | FAQ[]               | -    | よくある質問（下記7.5参照）                                                                                                                                                          |
| coordinatorId         | string              | -    | コーディネーターのユーザーID                                                                                                                                                         |
| landlordConsent       | LandlordConsent     | ○    | 大家承認情報（下記7.4参照）                                                                                                                                                          |
| handoverFee           | number              | ○    | 引越し費用（円）。内訳は[payment.md §12.3](./payment.md#123-引越し費用の構成)参照                                                                                                    |
| moveOutDate           | Date \| null        | ○    | 退去（引き渡し）予定日                                                                                                                                                               |
| moveOutReason         | MoveOutReason       | -    | 引越し理由（下記7.6参照）                                                                                                                                                            |
| managementCompanyName | string              | -    | 管理会社名（前の住人が入力。ポストのシール・管理アプリ等で確認）                                                                                                                     |
| managementConsultedAt | Date \| null        | -    | 管理会社に残置物相談を行った日時（前の住人が自己申告）                                                                                                                               |
| pdfUrls               | object \| null      | -    | 生成済みPDFのURL格納（F-611/F-612/F-616のR2 URL）                                                                                                                                    |
| isProCoordinated      | boolean             | -    | プロにコーディネートされた物件か（デフォルト: false）。[座談会#15](../requirements/meetings/2026-02-09-product-meeting-15-delta.md)でMVPデータ収集用に決定。表示機能F-901〜F-903はP2 |

## 7.2 Inquiry（問い合わせ）

| フィールド         | 型             | 必須 | 説明                                                                                                                                |
| ------------------ | -------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| id                 | string         | ○    | 問い合わせID                                                                                                                        |
| propertyId         | string         | ○    | 物件ID                                                                                                                              |
| propertyTitle      | string         | ○    | 物件タイトル                                                                                                                        |
| status             | InquiryStatus  | ○    | ステータス                                                                                                                          |
| applicantName      | string         | ○    | 申込者氏名                                                                                                                          |
| applicantEmail     | string         | ○    | メールアドレス                                                                                                                      |
| reason             | string         | ○    | 興味を持った理由                                                                                                                    |
| duration           | string         | -    | 希望契約期間                                                                                                                        |
| questions          | string         | -    | 質問                                                                                                                                |
| viewingDate        | string         | -    | 内見日時                                                                                                                            |
| agreedFurnitureIds | string[]       | -    | 確定家具IDリスト（内見後に前の住人・次の住人が合意した引き継ぎ対象のFurnitureItem ID）                                              |
| submittedAt        | string         | ○    | 送信日時                                                                                                                            |
| updatedAt          | string         | ○    | 更新日時                                                                                                                            |
| notes              | string         | -    | 運営メモ                                                                                                                            |
| userPreferences    | object \| null | -    | ユーザー嗜好データ（JSONB。将来AI学習データ蓄積用）— [技術会議#13 CAIO推奨](../design/meetings/2026-02-09-tech-meeting-13-delta.md) |

## 7.3 UserListing（ユーザー作成リスティング）

| フィールド     | 型                     | 必須 | 説明                                             |
| -------------- | ---------------------- | ---- | ------------------------------------------------ |
| id             | string                 | ○    | リスティングID                                   |
| userId         | string                 | ○    | ユーザーID                                       |
| status         | 'draft' \| 'published' | ○    | ステータス                                       |
| title          | string                 | ○    | タイトル                                         |
| furnitureItems | FurnitureItem[]        | ○    | 家具リスト（下記7.7参照。コアセット + 追加家具） |
| coreSetPrice   | number \| null         | -    | コアセット一括価格（円）                         |
| roomPhotos     | string[]               | ○    | 部屋の写真                                       |
| concept        | string                 | -    | 空間コンセプト                                   |
| lifestyle      | string                 | -    | 暮らし方の説明                                   |
| taste          | string                 | -    | テイスト                                         |
| videoTourUrl   | string                 | -    | 動画ツアーURL                                    |
| faq            | FAQ[]                  | -    | よくある質問                                     |
| createdAt      | string                 | ○    | 作成日時                                         |
| updatedAt      | string                 | ○    | 更新日時                                         |
| publishedAt    | string                 | -    | 公開日時                                         |

## 7.4 LandlordConsent（大家承認）

booleanではなく構造化データとして管理。条件付き承認や原状回復の取り決めに対応する。

| フィールド       | 型            | 必須 | 説明                           |
| ---------------- | ------------- | ---- | ------------------------------ |
| status           | ConsentStatus | ○    | 承認状態                       |
| approvedItems    | string[]      | -    | 承認された家具・設備リスト     |
| rejectedItems    | string[]      | -    | 拒否された家具・設備リスト     |
| conditions       | string        | -    | 条件付き承認の条件（自由記述） |
| restorationTerms | string        | -    | 原状回復に関する取り決め       |
| approvedAt       | string        | -    | 承認日時                       |
| approvedBy       | string        | -    | 承認者（大家名 or 管理会社名） |

**ConsentStatus**:

- `pending`: 未確認（デフォルト）
- `approved`: 全面承認
- `conditional`: 条件付き承認（一部家具のみ可、条件あり等）
- `rejected`: 拒否
- `expired`: 期限切れ（30日間未更新で自動非公開化、F-206）

## 7.5 FAQ（よくある質問）

| フィールド | 型     | 必須 | 説明 |
| ---------- | ------ | ---- | ---- |
| question   | string | ○    | 質問 |
| answer     | string | ○    | 回答 |

## 7.6 MoveOutReason（引越し理由）

前の住人の引越し理由。出品フォームで選択（座談会#4で決定）。次の住人や管理会社が状況を把握するために使用。

| 値                | UI表示       | 説明                           |
| ----------------- | ------------ | ------------------------------ |
| `job_transfer`    | 転勤         | 会社都合の転勤・異動           |
| `job_change`      | 転職         | 自己都合の転職                 |
| `marriage`        | 結婚・同棲   | 結婚や同棲開始                 |
| `family`          | 家族の事情   | 家族の介護・実家への帰省等     |
| `upgrade`         | 住み替え     | より広い/良い物件への引越し    |
| `downsize`        | ダウンサイズ | よりコンパクトな物件への引越し |
| `end_of_contract` | 契約満了     | 定期借家の満了                 |
| `other`           | その他       | 自由記述                       |

## 7.7 FurnitureItem（家具アイテム）

家具の個別アイテム。コアセットと追加家具のグルーピングに対応（座談会#7で決定）。値付けガイダンス関連フィールドを座談会#9で追加。

| フィールド        | 型                                           | 必須 | 説明                                                         |
| ----------------- | -------------------------------------------- | ---- | ------------------------------------------------------------ |
| id                | string                                       | ○    | 家具ID（UUID）                                               |
| name              | string                                       | ○    | 家具名（例：「ソファ」「ダイニングテーブル」）               |
| category          | 'core' \| 'additional'                       | ○    | コアセット or 追加家具                                       |
| furnitureCategory | FurnitureCategory                            | ○    | 家具カテゴリ（下記7.7.1参照）                                |
| description       | string                                       | -    | 説明・状態メモ                                               |
| photoUrl          | string                                       | -    | 家具の写真URL                                                |
| price             | number                                       | -    | 個別価格（追加家具のみ。コアセットはcoreSetPriceで一括設定） |
| brand             | string                                       | -    | ブランド名（任意・自由テキスト）                             |
| newPrice          | number                                       | -    | 新品価格。未入力時はカテゴリのデフォルト新品価格を自動セット |
| yearsUsed         | number                                       | -    | 使用年数                                                     |
| pin               | { photoIndex: number; x: number; y: number } | -    | 部屋写真上の位置（%座標）。将来の写真タグ機能用              |

### 7.7.1 FurnitureCategory（家具カテゴリ）

カテゴリ選択（必須）でデフォルト新品価格を自動セット。出品者の入力負荷を軽減（座談会#9で決定）。

| 値             | UI表示             | デフォルト新品価格 |
| -------------- | ------------------ | ------------------ |
| `sofa`         | ソファ             | ¥50,000            |
| `dining_table` | ダイニングテーブル | ¥30,000            |
| `bed_frame`    | ベッドフレーム     | ¥40,000            |
| `desk`         | デスク             | ¥25,000            |
| `storage`      | 収納棚             | ¥15,000            |
| `chair`        | チェア             | ¥10,000            |
| `lighting`     | 照明               | ¥8,000             |
| `rug`          | ラグ               | ¥10,000            |
| `other`        | その他             | ¥5,000             |

**コアセット・追加家具のルール：**

- **コアセット（`core`）：** 部屋の世界観を構成する主要家具。一括引き継ぎが前提（個別選択不可）。`coreSetPrice`で一括価格を設定
- **追加家具（`additional`）：** コアセットに含まれないオプション家具。チェックボックスで個別に引き継ぎ可否を選択可能
- 次の住人は**コアセット全体** + **任意の追加家具**を選択して`agreedFurnitureIds`を確定する
- ミナ（アレンジ型）のように「一部だけ引き継ぎたい」ニーズに対応

## 7.8 Thread（メッセージスレッド）

座談会#8でMVP格上げ。物件×ペアで1スレッド。

| フィールド | 型     | 必須 | 説明                 |
| ---------- | ------ | ---- | -------------------- |
| id         | string | ○    | スレッドID           |
| propertyId | string | ○    | 物件ID               |
| sellerId   | string | ○    | 前の住人のユーザーID |
| buyerId    | string | ○    | 次の住人のユーザーID |
| createdAt  | string | ○    | 作成日時             |

## 7.9 Message（メッセージ）

| フィールド | 型     | 必須 | 説明                         |
| ---------- | ------ | ---- | ---------------------------- |
| id         | string | ○    | メッセージID                 |
| threadId   | string | ○    | スレッドID                   |
| senderId   | string | ○    | 送信者のユーザーID           |
| body       | string | ○    | メッセージ本文               |
| createdAt  | string | ○    | 送信日時                     |
| readAt     | string | -    | 既読日時（nullの場合は未読） |

## 7.10 値付けガイダンス（座談会#9で決定）

出品者が適正な価格を設定できるよう、使用年数とカテゴリに基づく目安レンジを表示。次の住人には比較情報を提供。

### 7.10.1 減価目安レンジ

使用年数 × 新品合計価格から目安レンジを自動計算・表示。表示文言は「参考値」であり「推奨」ではない。出品者はレンジ外の価格も自由に設定可能。

| 使用年数 | 目安レンジ（新品合計比） |
| -------- | ------------------------ |
| 1年以内  | 35〜50%                  |
| 1〜3年   | 25〜40%                  |
| 3〜5年   | 15〜30%                  |
| 5年以上  | 10〜20%                  |

**表示文言例:** 「同じようなセットの出品者は、このくらいの範囲で設定しています（参考値）」

### 7.10.2 次の住人向け比較表示

- 物件詳細ページに「新品で揃えた場合: 約○万円」を表示（各家具のnewPrice合計）
- 割引率の表示:「新品の○%の価格で引き継ぎ」

### 7.10.3 ブランド表示

- **MVP:** 家具ごとにブランド名入力（任意・自由テキスト）→ 物件詳細ページで表示
- **Phase 2:** デザイナーズ/ヴィンテージバッジ（ブランドDBとの照合で信憑性を担保）

## 7.11 TasteCategory（テイストカテゴリ）

座談会#14でサムネイルベースのテイスト検索を決定。技術会議#13でenum型での構造化を確定（CAIO推奨: 将来AIマッチング用特徴量）。

| 値        | UI表示       | 説明                                     |
| --------- | ------------ | ---------------------------------------- |
| `natural` | ナチュラル   | 木目や自然素材を活かした温かみのある空間 |
| `modern`  | モダン       | シンプルで洗練されたデザイン             |
| `nordic`  | 北欧         | 北欧デザインの明るく機能的な空間         |
| `vintage` | ヴィンテージ | アンティーク・レトロな雰囲気             |
| `minimal` | ミニマル     | 必要最小限の物で構成されたシンプルな空間 |
| `japandi` | 和モダン     | 和のテイストとモダンデザインの融合       |

- 参照: [技術会議#13](../design/meetings/2026-02-09-tech-meeting-13-delta.md)
- サムネイル画像はMVPでは手動キュレーション（`public/images/taste/`に配置）
- 将来Phase 2でAIマッチングの入力特徴量として利用
