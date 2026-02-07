# CTO Knowledge - 技術会議決定事項（2026-02-06）

## 会議概要

技術制約ミーティング（PM + CTO + CAIO）にて、REQUIREMENTS.md セクション18の技術的残論点を全て解決。MVP実装に必要な技術選定を完了。

## 技術決定サマリー

### T-1: PDF自動生成 → `@react-pdf/renderer`

**選定理由:**

- Reactコンポーネントで記述可能（型安全、既存エコシステムとの親和性）
- サーバーサイド `renderToBuffer()` / `renderToStream()` でNode.js/Bun上で直接生成（Chromium不要）
- React 19対応済み（v4.1.0以降）
- Vercel Serverless Functionsで動作可能
- 日本語フォント対応可（Noto Sans JP登録）

**却下した選択肢:**

- Puppeteer/Playwright: Vercel Edge非対応、メモリ重い、Chromium依存
- jsPDF: 日本語フォント問題、デザイン制御困難
- 外部API（Gotenberg等）: 外部依存、レイテンシ

**アーキテクチャ:**

```
リスティングデータ → API Route → @react-pdf/renderer → R2保存 → URL記録
```

**テンプレート:** `src/lib/pdf/templates/` に配置
**実装優先:** F-611 + F-616 同時 → F-612

**リスク軽減:** Phase 0でPOC実施（日本語PDF生成 + Vercel動作確認 + R2アップロード）

### T-2: メール送信 → Resend（継続利用）

**選定理由:**

- Better-authマジックリンクで**導入済み**（v6.9.1）
- React Emailとの統合（テンプレートをReactコンポーネントで記述）
- MVP段階の無料枠（3,000通/月）で十分（推定: 月20物件×6通 = 120通）
- Next.js公式テンプレートあり

**却下した選択肢:**

- SendGrid: 未導入、追加セットアップ必要。スケール後の移行は容易なので今は不要

**テンプレート:** `src/lib/email/templates/` に配置

### T-3: 定期実行 → Vercel Cron Jobs

**選定理由:**

- Vercelにデプロイ済み（追加インフラ不要）
- `vercel.json`に定義追加のみ
- `CRON_SECRET`で認証
- Proプラン40個で十分

**却下した選択肢:**

- Inngest: 追加サービス依存（将来的には検討）
- GitHub Actions: 外部からのAPI呼び出し、認証複雑
- QStash: 追加サービス

### T-4: DBスキーマ拡張 → Drizzleマイグレーション

**主要変更:**

- `landlordConsent`: boolean → JSONB構造体（ConsentStatus + 詳細フィールド）
- `moveOutDate`: nullable Date追加
- `managementCompanyName`, `managementConsultedAt`: 新規追加
- `pdfUrls`: JSONB（R2 URL格納）
- inquiriesに `agreedFurniture`, `duration` 追加

**プロダクションデータなしのため破壊的変更は安全。**

## MVP技術スタック（確定版）

```
Frontend:  Next.js 16 + React 19 + TypeScript + Tailwind + shadcn/ui
Database:  PostgreSQL (Neon) + Drizzle ORM
Auth:      Better-auth (email/password + magic link + OAuth)
Storage:   Cloudflare R2 (画像 + PDF)
Payment:   Stripe Connect（Phase 1 Post-MVPで本格化）
Email:     Resend + React Email
PDF:       @react-pdf/renderer (サーバーサイド)
Cron:      Vercel Cron Jobs
Hosting:   Vercel (Serverless Functions + Edge)
Testing:   Vitest + Playwright
```

## CAIO視点（AI関連メモ）

- PDF生成自体にAIは不要。ただしテンプレートをデータドリブンに設計し、将来Phase 2でAI生成テキスト差し込みに対応
- リマインド通知の内容パーソナライズ（「価格を下げると問い合わせが増えます」等）はPhase 2で検討
- Cron→メール送信パイプラインを疎結合にしておけばAIレイヤー追加は容易

## MVP実装ロードマップ

- Phase 0（1週間）: インフラ整備 + PDF POC
- Phase 1（2週間）: コア機能強化（退去日、承認バッジ、通知メール、ガイドページ）
- Phase 2（2-3週間）: PDF生成 + B2B静的ページ
- Phase 3（1週間）: Cron自動化 + 同意書PDF
- **合計: 約6-7週間**

## 次のアクション

1. `@react-pdf/renderer` インストール + Noto Sans JPフォント準備
2. PDF POC実施（日本語生成 → Vercel → R2）
3. DBスキーマ拡張のマイグレーション作成
4. React Emailメールテンプレート基盤セットアップ
5. `vercel.json` にCron定義追加
