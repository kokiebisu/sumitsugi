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

## Git Workflow

**CRITICAL: `/worktree` skill auto-invokes** for ANY implementation task.

The `/worktree` skill (defined in [.claude/skills/worktree.cl.md](.claude/skills/worktree.cl.md)) automatically creates an isolated git worktree with devcontainer support.

Claude will automatically invoke `/worktree` as the FIRST action when you request:
- Feature implementations
- Bug fixes
- Refactoring
- Code modifications
- UI/UX changes

**Skip worktree only for:** Single-line typo fixes, documentation-only changes.

**Workflow:** `/worktree` (auto) → implement → `/commit` → `/pr`

**How it works:**
1. Claude invokes `/worktree` skill
2. Creates branch and worktree in `.worktrees/<branch-name>/`
3. Sets up devcontainer symlink
4. You open the worktree in VS Code and reopen in container
5. Continue development in the isolated environment

### Devcontainers with Worktrees

To use devcontainers with git worktrees:

```bash
npm run worktree:create feature-name  # Creates worktree with devcontainer support
npm run worktree:list                 # List all worktrees
npm run worktree:prune                # Clean up removed worktrees
```

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
