# tsumugi Memory Bank

> 住人の暮らしを引き継ぐプラットフォーム

## Quick Reference

**プロジェクト:** tsumugi（紡ぎ）
**技術スタック:** Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui
**ランタイム:** Bun 1.x
**パッケージマネージャー:** bun

## Task Management (CRITICAL)

**タスク完了時は必ずLinearも更新すること。**

詳細は `.claude/rules/task-management.md` を参照。

**クイックワークフロー:**

1. タスクを完了
2. DASHBOARDを更新
3. **LinearでタスクをDoneに更新**
4. ユーザーに報告

---

## Environment Variables

**Always load `.env.local` before running commands that need API keys:**

```bash
source .env.local
```

Available keys in `.env.local`:

- `LINEAR_API_KEY` - Linear API for issue tracking sync (タスク完了時に使用)
- Other project-specific secrets

## Commands

```bash
bun dev                  # 開発サーバー起動 (localhost:3000)
bun run build            # プロダクションビルド
bun start                # プロダクションサーバー起動
bun lint                 # ESLintでコードチェック
./dev                    # Open devcontainer with Claude Code (auto-starts)

# Git Worktrees (with devcontainer support)
npm run worktree:create  # 新しいworktreeを作成 (still uses npm script runner)
npm run worktree:list    # worktree一覧を表示
npm run worktree:prune   # 削除済みworktreeをクリーンアップ

# Branch Cleanup (automated)
npm run cleanup:branches # マージ済みブランチと削除済みリモートブランチを削除
npm run cleanup:all      # 完全クリーンアップ（ブランチ + worktree + stash）
```

## Prerequisites

**Bun Runtime:** This project uses Bun instead of Node.js for faster performance.

**Local development (outside devcontainer):**

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Start dev server
bun dev
```

**Devcontainer:** Bun is pre-installed in the devcontainer.

## Development Tools

### Beads Task Tracker

Use the `bd` command for AI-friendly task tracking instead of markdown TODOs:

```bash
bd ready              # Show tasks with no blockers
bd create "Task"      # Create new task
bd status --json      # Get JSON output for agents
bd done <id>          # Mark task complete
bd show <id>          # Show task details and dependencies
```

Tasks are stored in the `.beads/` directory and shared across git worktrees. Beads provides persistent, structured memory for AI agents with dependency tracking and merge-conflict-free task IDs.

See [Beads documentation](https://github.com/steveyegge/beads) for details.

### Claude Code & Plugins

This project includes Claude Code CLI auto-installation in the devcontainer.

**Authentication Persistence:**

- Claude config directory (`~/.claude`) is mounted from your host machine
- Authentication persists across devcontainer restarts and rebuilds
- One-time authentication that persists permanently

**Setup:**

- Claude Code CLI: Auto-installed during devcontainer build
- First-time auth: Run `claude` to authenticate via browser (one-time, persists)
- Plugins: Configured in `.claude/settings.json` and auto-enabled

**Enabled Plugins:**

- `superpowers` - TDD, planning, and review workflows
- `context7` - Enhanced context management
- `typescript-lsp` - TypeScript language server integration
- `ralph-loop` - Interactive development loop
- `code-review` - Automated code review
- `security-guidance` - Security best practices
- And more (see `.claude/settings.json` for full list)

**Integration:** Superpowers formalizes the TDD, planning, and review workflows already defined in `.claude/rules/` and `.claude/agents/`, providing additional structure through composable skills.

**Workflow Example:**

```bash
/superpowers:write-plan    # Create structured implementation plan
bd create "Task from plan" # Create Beads tasks from plan
bd ready                   # Check available work
```

## Git Workflow

**Git Worktrees for Isolated Development**

Use git worktrees (via Superpowers' `using-git-worktrees` skill or npm scripts) when:

- Implementing complex features
- Working from an implementation plan
- Needing isolation from current workspace
- Making changes that span multiple files/components

**Skip worktrees for:**

- Single-line typo fixes
- Documentation-only changes
- Simple, low-risk edits

**Workflow:** Create worktree (when needed) → implement → `/commit` → `/pr`

### Manual Worktree Commands

You can create worktrees manually with:

```bash
npm run worktree:create feature-name  # Creates worktree with devcontainer support
npm run worktree:list                 # List all worktrees
npm run worktree:prune                # Clean up removed worktrees
```

Worktrees are created in `.worktrees/<branch-name>/` with automatic devcontainer symlink setup.

See [.devcontainer/WORKTREE.md](.devcontainer/WORKTREE.md) for detailed documentation.

### Automated Branch Cleanup

**Automatic cleanup is enabled** to keep your repository clean:

**GitHub Auto-Delete:**

- Branches are automatically deleted on GitHub after PR merge
- Enabled via repository settings

**GitHub Actions (Daily):**

- Runs daily at 00:00 UTC
- Deletes merged branches
- Removes branches marked as [gone] (deleted on remote)
- Can be triggered manually: `gh workflow run "Cleanup Merged Branches"`

**Local Cleanup Commands:**

```bash
npm run cleanup:branches  # Delete merged and [gone] branches
npm run cleanup:all       # Full cleanup: branches + worktrees + stashes
```

**Manual cleanup workflow:**

```bash
git fetch --all --prune          # Update remote tracking
npm run cleanup:branches         # Clean up branches
git worktree prune               # Clean up worktrees
```

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # ホームページ
│   ├── layout.tsx        # ルートレイアウト
│   ├── properties/       # 物件一覧・詳細
│   ├── listing/          # 前の住人向けリスティング管理
│   └── account/          # ユーザーアカウント
├── components/           # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── auth/             # 認証関連
│   └── listing/          # リスティング作成フロー
├── contexts/             # Reactコンテキスト
│   └── auth-context.tsx  # 認証状態管理
└── lib/                  # ユーティリティ・データ層
    ├── data.ts           # 物件データ、型定義
    ├── utils.ts          # ユーティリティ関数
    └── site-config.ts    # サイト設定
```

## Key Concepts

### 用語ガイドライン（重要）

**UIで使う用語：**

- ❌ セラー（内部用語） → ✅ **前の住人**（UI表示）
- **次の住人** - 暮らしを引き継ぐ側
- ❌ インテリア利用料 → ✅ **引越し費用**
- ❌ セラー歴 / ホスティング歴 → ✅ **活動歴**

**注意:** データ構造のフィールド名（`seller`, `sellerProfile`, `yearsSelling`など）は内部用語として使用し、UI表示では常に「前の住人」を使用する

### 物件ステータス

```typescript
status: 'draft' | 'public';
```

- `draft`: 下書き状態、一覧には非表示
- `public`: 公開状態、誰でも閲覧可能

## Design Guidelines

- **テーマ:** Airbnb風のクリーンなUI
- **アクセントカラー:** コーラル色 `#FF5A5F`
- **アイコン:** Lucide React
- **UIコンポーネント:** shadcn/ui (Radix UIベース)
- **ダークモード:** classベース

## Key Files

| ファイル                           | 説明                                                     |
| ---------------------------------- | -------------------------------------------------------- |
| `src/lib/data.ts`                  | Property, User, SellerProfile などの型定義とモックデータ |
| `src/contexts/auth-context.tsx`    | 認証状態管理（localStorage永続化）                       |
| `src/components/header.tsx`        | グローバルヘッダー                                       |
| `src/components/property-card.tsx` | 物件カードコンポーネント                                 |

## Import Aliases

```typescript
import { something } from '@/lib/utils'; // → src/lib/utils
import { Button } from '@/components/ui/button';
```

## Automated Workflows

### Daily Requirements Audit

GitHub Actionsで毎日午前9時(JST)に自動実行。REQUIREMENTS.mdとコードを比較し、実装漏れを検出。

**動作:**

1. REQUIREMENTS.md / BUSINESS.md を読み込み
2. 実際のコードと比較（Claude API使用）
3. 差分（ギャップ）があればBeadsタスクとして登録
4. ギャップがある場合のみPRを作成（`YYYY-MM-DD Daily Audit`）
5. PRを自動マージ
6. ギャップがなければPR作成をスキップ

**手動実行:**

```bash
gh workflow run "Requirements Audit"
```

**必要なSecret:** `ANTHROPIC_API_KEY`

## Related Documentation

詳細な仕様については以下を参照：

- `.claude/PROJECT.md` - プロジェクト仕様書（コンセプト、デザイン原則）
- `.claude/BUSINESS.md` - ビジネスロジック仕様書（料金体系、引き継ぎフロー）

## Current Phase

**フェーズ1（現在）:** 物件情報の表示、基本的な引き継ぎフロー

**次期開発予定（フェーズ2）:**

- ユーザー登録・ログイン機能
- メッセージング機能
- 決済機能統合
- 電子契約書機能
