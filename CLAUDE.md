# tsumugi Memory Bank

> 住人の暮らしを引き継ぐプラットフォーム

## Quick Reference

**プロジェクト:** tsumugi（紡ぎ）
**技術スタック:** Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui
**ノードバージョン:** 20
**パッケージマネージャー:** npm

## Commands

```bash
npm run dev              # 開発サーバー起動 (localhost:3000)
npm run build            # プロダクションビルド
npm run start            # プロダクションサーバー起動
npm run lint             # ESLintでコードチェック

# Git Worktrees (with devcontainer support)
npm run worktree:create  # 新しいworktreeを作成
npm run worktree:list    # worktree一覧を表示
npm run worktree:prune   # 削除済みworktreeをクリーンアップ
```

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

### Claude Code & Superpowers Plugin

This project includes Claude Code CLI auto-installation in the devcontainer.

**Setup:**
- Claude Code CLI: Auto-installed during devcontainer build
- First-time auth: Run `claude` to authenticate via browser (one-time)
- Superpowers: Manual installation required (global, one-time):
  ```
  /plugin marketplace add obra/superpowers-marketplace
  /plugin install superpowers@superpowers-marketplace
  ```

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
status: "draft" | "public";
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
import { something } from "@/lib/utils"; // → src/lib/utils
import { Button } from "@/components/ui/button";
```

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
