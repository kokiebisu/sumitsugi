# T-5: 簡易メッセージ機能アーキテクチャ

> 技術決定: **DB + Server Actions** — messagesテーブル + threadsテーブル。ポーリングベース（MVP）。メール通知はResend既存パイプライン活用

関連機能: F-XXX(§3.1メッセージ)

座談会#8でMVP格上げ決定。個人メアド非公開・内見日程調整に必須。

---

## アーキテクチャ

```
[次の住人] → メッセージ送信 (Server Action)
  → messagesテーブルにINSERT
  → Resendで相手に通知メール（「新着メッセージがあります」+ sumitsugiリンク）
  → [前の住人] がsumitsugi上で閲覧・返信
```

## データモデル（技術会議#11で詳細設計確定）

### threads テーブル

| フィールド | 型            | 制約                                  | 説明                 |
| ---------- | ------------- | ------------------------------------- | -------------------- |
| id         | text          | PK                                    | スレッドID (UUID)    |
| propertyId | text          | FK → properties.id, NOT NULL, CASCADE | 物件ID               |
| sellerId   | text          | FK → users.id, NOT NULL, CASCADE      | 前の住人のユーザーID |
| buyerId    | text          | FK → users.id, NOT NULL, CASCADE      | 次の住人のユーザーID |
| createdAt  | timestamp(tz) | NOT NULL, default now()               | 作成日時             |
| —          | —             | UNIQUE(propertyId, sellerId, buyerId) | 1物件×1ペア1スレッド |

### messages テーブル

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

### インデックス

- threads: `idx_threads_property_id`, `idx_threads_seller_id`, `idx_threads_buyer_id`
- messages: `idx_messages_thread_id`, `idx_messages_sender_id`, `idx_messages_created_at`

## 設計判断（技術会議#11）

- **スキーマ配置:** 新規ファイル `src/db/schema/messages.ts` に threads + messages を配置
- **UNIQUE制約:** DB制約で1物件×1ペア1スレッドを保証（race condition防止）
- **senderId SET NULL:** ユーザー退会時もメッセージ履歴は保全（契約エビデンス価値）
- **messageType:** 初期設計に含める（将来のAIテンプレート提案・Analytics用。追加コストほぼゼロ）
- **テンプレート保存方式:** bodyに展開結果を保存（送信時点の文面保持。テンプレート元情報はmetadata JSONB）
- **body上限:** 2,000文字（Zodバリデーション。DB制約なし）

## 実装方針

- Server Actionsで送受信（API Route不要）
- ポーリングベース（MVP）: 画面表示時にfetch、30秒間隔で新着チェック
- 日程調整テンプレート: 定型文ボタン（「内見候補日: ①○月○日 ②○月○日 ③○月○日」）
- メール通知: 新着メッセージ時にResendで通知（本文は含めず、リンクのみ）
- ファイル配置: `src/app/(main)/messages/`, `src/lib/actions/message.ts`

## Post-MVP

Phase 2移行: WebSocket/SSEでリアルタイム化、既読表示、画像添付
