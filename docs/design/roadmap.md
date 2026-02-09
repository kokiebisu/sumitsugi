# MVP実装ロードマップ

技術会議（2026-02-06）で合意。座談会#8・#9の追加決定を反映。技術会議#12でT-7/T-8反映（2026-02-07更新）。技術会議#13でCAIO推奨データ設計追加（2026-02-09更新）。

---

```
Phase 0: インフラ整備（1週間）
├── DBスキーマ拡張: 単一マイグレーション（技術会議#11確定）
│   ├── properties: moveOutDate, moveOutReason, managementCompanyName, managementConsultedAt, pdfUrls, coreSetPrice追加
│   ├── properties: landlordConsent boolean→JSONB構造化（破壊的変更・データ変換SQL付き）
│   ├── properties: furniture text[]→furnitureItems JSONB（破壊的変更・FurnitureItem[]化）
│   ├── inquiries: duration, agreedFurnitureIds, viewingDate, userPreferences(JSONB)追加 ← 技術会議#13 CAIO推奨
│   ├── properties: tasteCategory(enum型)追加 ← 技術会議#13 CAIO推奨（将来AIマッチング用）
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

## 関連ドキュメント

- 各Phase の技術詳細: [pdf-generation.md](./pdf-generation.md), [email-system.md](./email-system.md), [db-schema.md](./db-schema.md), [messaging.md](./messaging.md), [pricing-guidance.md](./pricing-guidance.md)
- 決済実装: [payment-implementation.md](./payment-implementation.md)
- MVPスコープ定義: [requirements/scope.md](../requirements/scope.md)
