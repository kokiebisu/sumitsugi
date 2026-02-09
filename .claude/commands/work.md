---
description: Auto-pick tasks from Beads, categorize, and dispatch parallel sub-agents. Loops until done.
---

# /work - Autonomous Task Execution

Execute without waiting for user confirmation.

## Main Loop

```
REPEAT:
  1. Discover eligible tasks → if none, print final report → STOP
  2. Categorize as Business/Dev
  3. Print batch summary table
  4. Dispatch sub-agents in parallel (up to 5)
  5. Collect results
  6. Print batch report + sync Linear
  7. Go back to 1
```

## Phase 1: Task Discovery

Run `bd ready`. Fallback: read `.beads/issues.jsonl` for `status=open`, no blockers.

**Skip tasks with:** labels `blocked|wontfix|autonomous:skip|needs-human|ceo|cfo|cmo|coo`, or title keywords `ヒアリング実施|参加する|予約|電話|訪問|面談|対面`.

Sort: priority ASC, created_at ASC. Select up to 5.

## Phase 2: Categorization

**Business** if labels include: `business|marketing|legal|finance|sales|manual-setup|partnership|branding|hiring|operations`. Or title matches: `タグライン|予算|法律|法務|規約|管理会社|パートナー|マーケティング|Twitter|投稿|提案資料|振り返り|Stripe|書類|イベント|Venture|Cafe|告知|成功事例|フォローアップ|清掃費|物件登録目標|紹介プログラム|コンテンツマーケ|CAC|LTV|紹介フィー|オペレーション`. Else **Dev**.

## Phase 3: Batch Summary

Print: `## Batch N — M tasks` with table `| # | Type | ID | Title | Priority |`. Proceed immediately.

## Phase 4: Dispatch Sub-Agents

Use Task tool with `subagent_type: "general-purpose"`. Launch all in parallel. If task B depends on A, dispatch A first.

### Dev Agent Prompt

For each Dev task, use this prompt (fill in `{id}`, `{title}`, `{description}`, `{labels}`, `{linear-id}`):

```
You are implementing a dev task for tsumugi (Next.js/TypeScript/Bun).

## Task
**ID:** {id} | **Title:** {title} | **Labels:** {labels}
**Description:** {description}

## Steps (follow exactly)
1. `cd $(git rev-parse --show-toplevel) && bun run worktree:create work-{id}` then `cd $(git rev-parse --show-toplevel)/.worktrees/work-{id}`
2. Read relevant source files to understand context
3. TDD: write failing test → `bun run test:run` (must fail) → implement → `bun run test:run` (must pass) → refactor
4. Verify: `bun run test:run && bun run lint && bunx tsc --noEmit`
5. Stage explicitly: `git add <files>` (NEVER `git add .`), commit, push, create PR with `gh pr create`
6. **CI Loop (max 5):** `gh pr checks` → if fail: `gh run view <id> --log-failed` → fix → push → repeat
7. **Self-audit:** `git diff origin/main...HEAD` — check: security, console.log, unused code, mutations, >800-line files
8. Check comments: `gh pr view <n> --comments && gh pr reviews <n>` → address feedback
9. Merge: `gh pr merge <n> --squash --delete-branch`
10. **Cleanup (3 SEPARATE Bash calls):** `cd $(git rev-parse --show-toplevel)` | `git worktree remove .worktrees/work-{id}` | `git pull origin main`
11. `source .env.local && bd close {id} && ./scripts/linear-done.sh {linear-id}`

**Constraints:** Max 300 lines, must include tests, follow existing patterns, don't modify unrelated files.
```

### Business Agent Prompt

For each Business task, use this prompt:

```
You are executing a business task for tsumugi (Japan-based startup).

## Task
**ID:** {id} | **Title:** {title} | **Labels:** {labels}
**Description:** {description}

## Steps
1. `cd $(git rev-parse --show-toplevel) && bun run worktree:create work-{id}` then `cd $(git rev-parse --show-toplevel)/.worktrees/work-{id}`
2. Read context: `docs/team/*/STRATEGY.md`, `docs/requirements/`, `DASHBOARD.md`
3. Produce tangible output (docs, plans, research, templates). No placeholders. Use Japanese where appropriate.
4. Stage explicitly, commit, push, create PR with `gh pr create`
5. **CI Loop (max 5):** check → fix → push → repeat until green
6. **Content audit:** completeness, accuracy, actionability, quality, language
7. Check comments, then merge: `gh pr merge <n> --squash --delete-branch`
8. **Cleanup (3 SEPARATE Bash calls):** `cd $(git rev-parse --show-toplevel)` | `git worktree remove .worktrees/work-{id}` | `git pull origin main`
9. `source .env.local && bd close {id} && ./scripts/linear-done.sh {linear-id}`
```

## Phase 5-6: Results & Reporting

Print batch table: `| # | Type | ID | Title | Status | PR | Ralph Loops |`

Sync: `source .env.local && bd linear sync --push --create-only && ./scripts/linear-set-project.sh`

## Final Report

When no tasks remain: print session summary (batches, attempted, merged, failed) + remaining ineligible tasks.

## Edge Cases

- No tasks → print message, stop
- CI fail after 5 iterations → mark blocked, skip
- Merge conflict → rebase once, if still conflicting skip
- Failed tasks → never re-pick in same session
