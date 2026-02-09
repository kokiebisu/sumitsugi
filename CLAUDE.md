# tsumugi Memory Bank

> 住人の暮らしを引き継ぐプラットフォーム

## Quick Reference

**Stack:** Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui / Bun 1.x

## Commands

```bash
bun dev                  # Dev server (localhost:3000)
bun run build            # Production build
bun lint                 # ESLint
bun run test:run         # Unit tests (Vitest, once)
bun run test:e2e         # E2E tests (Playwright)
bun run worktree:create  # Create git worktree
bun run cleanup:branches # Clean merged branches
```

**Task tracking:** `bd ready` / `bd create` / `bd close <id>` / `bd show <id>`
**Linear:** `./scripts/linear-list.sh` / `./scripts/linear-done.sh TSU-xxx` / `./scripts/linear-set-project.sh`
**Beads→Linear sync:** `bd linear sync --push --create-only && ./scripts/linear-set-project.sh`

**IMPORTANT:** Use `bun run test`, NOT `bun test`. Always `source .env.local` before commands needing API keys.

## Directory Structure

```
src/app/          # Pages (properties/, listing/, account/)
src/components/   # React components (ui/, auth/, listing/)
src/contexts/     # React contexts (auth-context.tsx)
src/lib/          # Utils & data (data.ts, utils.ts, site-config.ts)
```

Import: `@/lib/utils` → `src/lib/utils`, `@/components/ui/button`

## Key Concepts

**UI用語:** セラー→**前の住人**, 次の住人, インテリア利用料→**引越し費用**, セラー歴→**活動歴**
(データ構造は内部用語`seller`等を使用、UI表示のみ日本語)

**物件ステータス:** `'draft'`(非表示) | `'public'`(公開)

## Design

Airbnb風クリーンUI / アクセント: `#FF5A5F` / Lucide React / shadcn/ui / ダークモード: classベース

## GitHub Actions (CRITICAL)

Claude Code CLI (`claude -p`) を使用。Anthropic SDKはOAuthトークン非対応。
Secret: `ANTHROPIC_AUTH_TOKEN`, env: `CLAUDE_CODE_OAUTH_TOKEN`

## Automated Workflows

- `autonomous-developer.yml` — 4時間ごとにBeadsタスク実装
- `daily-standup.yml` — 毎日09:00 JSTに進捗報告
- `weekly-retrospective.yml` — 毎週日曜振り返り
- 一時停止: `touch .github/PAUSE_AUTONOMOUS` or label `autonomous:pause`

## Related Docs

- `.claude/PROJECT.md` — コンセプト・デザイン原則
- `.claude/BUSINESS.md` — 料金体系・引き継ぎフロー
- `docs/DESIGN_DOC.md` — アーキテクチャ・ロードマップ

## Current Phase

**Phase 1:** 物件情報表示、基本引き継ぎフロー
**Phase 2 (next):** ユーザー登録、メッセージ、決済、電子契約
