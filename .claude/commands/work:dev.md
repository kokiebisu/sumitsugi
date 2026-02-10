---
description: Auto-pick dev tasks from Beads and dispatch parallel sub-agents. Loops until done.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task, WebFetch, WebSearch
---

# /work:dev - Autonomous Dev Task Execution

Execute without waiting for user confirmation.

**Arguments:** `$ARGUMENTS` (optional milestone, e.g. `1`, `phase-2`, or empty for all)

## Milestone Filtering

Parse `$ARGUMENTS` to determine the maximum phase to include:

- `1` or `phase-1` → include tasks with labels `phase-0`, `phase-1` only
- `2` or `phase-2` → include tasks with labels `phase-0`, `phase-1`, `phase-2`
- Empty or not specified → no phase filter (include all tasks regardless of phase labels)

**Rule:** If a milestone is specified, SKIP any task whose labels contain `phase-N` where N > max phase. Tasks with NO phase label are always included.

## Main Loop

```
REPEAT:
  1. Discover eligible dev tasks → if none, print final report → STOP
  2. Print batch summary table
  3. Dispatch sub-agents in parallel (up to 5)
  4. Collect results
  5. Print batch report + sync Linear
  6. Go back to 1
```

## Phase 1: Task Discovery

Run `bd ready`. Fallback: read `.beads/issues.jsonl` for `status=open`, no blockers.

**Skip tasks with:** labels `blocked|wontfix|autonomous:skip|needs-human|ceo|cfo|cmo|coo`, or title keywords `ヒアリング実施|参加する|予約|電話|訪問|面談|対面`.

**Milestone gate:** If a milestone was specified via arguments, skip tasks with a `phase-N` label where N exceeds the milestone.

**Filter to Dev only:** Exclude tasks where labels include: `business|marketing|legal|finance|sales|manual-setup|partnership|branding|hiring|operations`. Also exclude tasks where title matches: `タグライン|予算|法律|法務|規約|管理会社|パートナー|マーケティング|Twitter|投稿|提案資料|振り返り|Stripe|書類|イベント|Venture|Cafe|告知|成功事例|フォローアップ|清掃費|物件登録目標|紹介プログラム|コンテンツマーケ|CAC|LTV|紹介フィー|オペレーション`.

Sort: priority ASC, created_at ASC. Select up to 5.

## Phase 2: Batch Summary

Print: `## Batch N — M tasks` with table `| # | ID | Title | Priority |`. Proceed immediately.

## Phase 3: Dispatch Sub-Agents

Use Task tool with `subagent_type: "general-purpose"`. Launch all in parallel. If task B depends on A, dispatch A first.

### Dev Agent Prompt

For each task, use this prompt (fill in `{id}`, `{title}`, `{description}`, `{labels}`, `{linear-id}`):

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

## Phase 4-5: Results & Reporting

Print batch table: `| # | ID | Title | Status | PR | Ralph Loops |`

Sync: `source .env.local && bd linear sync --push --create-only && ./scripts/linear-set-project.sh`

## Final Report

When no tasks remain: print session summary (batches, attempted, merged, failed) + remaining ineligible tasks.

## Edge Cases

- No tasks → print message, stop
- CI fail after 5 iterations → mark blocked, skip
- Merge conflict → rebase once, if still conflicting skip
- Failed tasks → never re-pick in same session
