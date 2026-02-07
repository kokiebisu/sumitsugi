# 退去日通知システム設計書

> Feature IDs: F-503, F-504, F-505, F-506 | 最終更新: 2026-02-08

## 概要

退去日が近づいているホストに対し、段階的に通知を送信するシステム。
ユーザーに早期のアクション（価格見直し、処分検討）を促し、退去日までに引き継ぎが完了しないリスクを軽減する。

## 通知スケジュール

| タイミング    | Feature ID | 件名                                 | トリガー条件                          | チャネル                     |
| ------------- | ---------- | ------------------------------------ | ------------------------------------- | ---------------------------- |
| 退去日2ヶ月前 | F-503      | 価格見直しのご提案                   | moveOutDate - 60日 <= 今日 かつ未送信 | メール                       |
| 退去日1ヶ月前 | F-504      | 引き継ぎ以外の選択肢もご検討ください | moveOutDate - 30日 <= 今日 かつ未送信 | メール + アプリ内            |
| 退去日2週間前 | F-505      | 処分業者の手配について               | moveOutDate - 14日 <= 今日 かつ未送信 | メール + アプリ内            |
| 退去日1週間前 | F-506      | 緊急引き取りサービスのご案内         | moveOutDate - 7日 <= 今日 かつ未送信  | メール + アプリ内 + プッシュ |

## アーキテクチャ

### 処理フロー（日次バッチ）

1. 日次バッチ（毎朝9:00 JST）が起動
2. status=public かつ moveOutDate IS NOT NULL の物件を取得
3. 各物件について moveOutDate と現在日時の差分を計算
4. 該当する通知タイミングに達しているか判定
5. move_out_notifications テーブルで送信済みか確認（重複防止）
6. 未送信の場合、通知を送信し、ログに記録

### 冪等性の保証

- move_out_notifications テーブルに (property_id, notification_type, channel) のユニーク制約
- 同じ通知は1回だけ送信される

## データモデル（Drizzle Schema）

```typescript
// src/db/schema/move-out-notifications.ts
export const moveOutNotifications = pgTable(
  'move_out_notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    propertyId: uuid('property_id')
      .notNull()
      .references(() => properties.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    notificationType: varchar('notification_type', { length: 20 }).notNull(),
    channel: varchar('channel', { length: 20 }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
    emailId: varchar('email_id', { length: 255 }),
  },
  (table) => ({
    uniqueNotification: uniqueIndex('unique_notification').on(
      table.propertyId,
      table.notificationType,
      table.channel
    ),
  })
);
```

## 通知サービス設計

```typescript
// src/lib/notifications/move-out-scheduler.ts
interface NotificationConfig {
  type: '2month' | '1month' | '2week' | '1week';
  daysBeforeMoveOut: number;
  channels: ('email' | 'in_app' | 'push')[];
}

const NOTIFICATION_CONFIGS: NotificationConfig[] = [
  { type: '2month', daysBeforeMoveOut: 60, channels: ['email'] },
  { type: '1month', daysBeforeMoveOut: 30, channels: ['email', 'in_app'] },
  { type: '2week', daysBeforeMoveOut: 14, channels: ['email', 'in_app'] },
  {
    type: '1week',
    daysBeforeMoveOut: 7,
    channels: ['email', 'in_app', 'push'],
  },
];
```

## 配信方法

- **メール**: 既存の src/lib/email/ インフラ（Resend）を利用。React Email テンプレート。
- **アプリ内通知**: /api/notifications エンドポイントで取得。ベルアイコンに未読バッジ。
- **プッシュ通知**: 1週間前のみ。Web Push API（将来実装、MVPではメール+アプリ内のみ）

## 通知停止条件

1. 引き継ぎ完了（物件にstatus=completedのinquiryがある）
2. 物件非公開化（status=draftに変更）
3. 退去日変更（新しい退去日で再計算）
4. ユーザーオプトアウト

## 実装フェーズ

### Phase 1（MVP）

- [x] 設計ドキュメント作成（本ドキュメント）
- [ ] move_out_notifications テーブル作成
- [ ] F-504: 1ヶ月前通知テンプレート作成
- [ ] 日次バッチ実装（Next.js API Route + Vercel Cron）

### Phase 2

- [ ] F-503, F-505, F-506 の各通知テンプレート
- [ ] アプリ内通知UI

### Phase 3

- [ ] プッシュ通知、通知設定画面、A/Bテスト

## テスト方針

- ユニットテスト: スケジューラーロジック（日付計算、重複チェック）
- 統合テスト: バッチ処理のE2E
- テスト用ヘルパー: moveOutDateを任意に設定した物件を生成
