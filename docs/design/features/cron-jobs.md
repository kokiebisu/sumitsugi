# T-3: Vercel Cron Jobs設定

> 技術決定: **Vercel Cron Jobs** — `vercel.json`にcron定義。毎日実行でリマインドチェック + 期限切れチェック

関連機能: F-205, F-206

---

## 設定

```json
{
  "crons": [
    { "path": "/api/cron/reminder-check", "schedule": "0 0 * * *" },
    { "path": "/api/cron/expiration-check", "schedule": "0 1 * * *" }
  ]
}
```

## 処理内容

**リマインドチェック（毎日0:00 UTC）:** 退去日確定済み + pending状態のリスティングを検索 → 7/14/21/27日経過でメール送信（managementConsultedAtで文面出し分け）

**期限切れチェック（毎日1:00 UTC）:** 30日経過のpendingリスティングを自動非公開化（一時停止、削除ではない）+ 通知メール。承認ステータス更新で再公開可能

## MVPステータス

**注（技術会議#12）:** F-205/F-206がPost-MVPに移動したため、**Cron Jobs実装自体がPost-MVP**。MVPでは運営が手動プッシュ（コンシェルジュ型対応）。設計は保持し、Post-MVP移行時にそのまま実装可能。
