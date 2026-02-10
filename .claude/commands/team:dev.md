---
description: Agent Teams parallel dev execution. Spawns teammates for concurrent task implementation. CLI only.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task, WebFetch, WebSearch
---

# /team:dev - Agent Teams Parallel Development

Execute dev tasks in parallel using Agent Teams. Each teammate is an independent Claude Code instance working in its own git worktree.

**For CI/GitHub Actions, use `/work:dev` instead** (subagent fallback).

**Arguments:** `$ARGUMENTS` (optional: milestone filter, e.g. `1`, `phase-2`, or empty for all)

## Prerequisites

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set (in `.claude/settings.json`)
- Interactive CLI session (Agent Teams does not work in headless/CI)

## Milestone Filtering

Same rules as `/work:dev`:

- `1` or `phase-1` -> include `phase-0`, `phase-1` only
- `2` or `phase-2` -> include `phase-0`, `phase-1`, `phase-2`
- Empty -> no phase filter

## Main Loop

```
REPEAT:
  1. Discover eligible dev tasks -> if none, print final report -> STOP
  2. Print batch summary table
  3. Prepare worktrees
  4. Spawn Agent Team (one teammate per task)
  5. Coordinate until all teammates finish
  6. Merge PRs, cleanup worktrees, close tasks
  7. Sync Linear
  8. Go back to 1
```

## Phase 1: Task Discovery

Run `bd ready`. Fallback: read `.beads/issues.jsonl` for `status=open`, no blockers.

**Skip tasks with:** labels `blocked|wontfix|autonomous:skip|needs-human|human|ceo|cfo|cmo|coo`, or title keywords `ヒアリング実施|参加する|予約|電話|訪問|面談|対面`.

**Filter to Dev only:** Exclude tasks where labels include: `business|marketing|legal|finance|sales|manual-setup|partnership|branding|hiring|operations`. Also exclude tasks where title matches: `タグライン|予算|法律|法務|規約|管理会社|パートナー|マーケティング|Twitter|投稿|提案資料|振り返り|Stripe|書類|イベント|Venture|Cafe|告知|成功事例|フォローアップ|清掃費|物件登録目標|紹介プログラム|コンテンツマーケ|CAC|LTV|紹介フィー|オペレーション`.

Sort: priority ASC, created_at ASC. Select up to 5.

## Phase 2: Batch Summary

Print: `## Batch N -- M tasks` with table `| # | ID | Title | Priority |`. Proceed immediately.

## Phase 3: Worktree Preparation

Before spawning teammates, create one worktree per task:

```bash
for each task {id}:
  bun run worktree:create work-{id}
```

This ensures file isolation -- each teammate works in its own directory.

## Phase 4: Spawn Agent Team

Create an agent team. Use **delegate mode** so the lead coordinates only.

Instruct Claude to create the team with this pattern:

```
Create an agent team for parallel development.
Spawn {N} teammates, one per task below.
Use delegate mode -- coordinate only, do not implement yourself.
Require plan approval before teammates make code changes.

Tasks:
1. Teammate "dev-{id1}": {title1}
   Worktree: /workspace/.worktrees/work-{id1}

2. Teammate "dev-{id2}": {title2}
   Worktree: /workspace/.worktrees/work-{id2}

[... up to 5]
```

### Teammate Spawn Prompt

For each teammate, use this prompt:

```
You are implementing a dev task for tsumugi (Next.js/TypeScript/Bun).

## Task
**ID:** {id} | **Title:** {title} | **Labels:** {labels}
**Description:** {description}

## Your Worktree
Work ONLY in: /workspace/.worktrees/work-{id}
cd /workspace/.worktrees/work-{id}

## Steps (follow exactly)
1. Read relevant source files to understand context
2. TDD: write failing test -> `bun run test:run` (must fail) -> implement -> `bun run test:run` (must pass) -> refactor
3. Verify: `bun run test:run && bun run lint && bunx tsc --noEmit`
4. `bun run build` (MUST pass before PR)
5. Stage explicitly: `git add <files>` (NEVER `git add .` or `-A`)
6. Commit: `git commit -m "<type>: <desc>"`
7. Push: `git push -u origin HEAD`
8. Create PR: `gh pr create --title "<type>: <desc>" --body "..."`
9. CI Loop (max 5): `gh pr checks` -> if fail: `gh run view <id> --log-failed` -> fix -> push -> repeat
10. Self-audit: `git diff origin/main...HEAD` -- check security, console.log, unused code, mutations, >800-line files
11. Check comments: `gh pr view <n> --comments && gh pr reviews <n>` -> address feedback
12. Message the lead when done with: task ID, PR URL, status (success/blocked)

## Constraints
- Max 300 lines changed per PR
- Must include tests (TDD required)
- Follow existing patterns in the codebase
- Stay in YOUR worktree -- do not touch other worktrees
- If you change a shared API/interface, message other teammates about the change

## Communication
- If you need context from another teammate: message them directly
- If you change something that affects others: broadcast the change
- If you're blocked: message the lead immediately, don't spin
```

## Phase 5: Coordination

The lead monitors teammate progress:

- Check shared task list for status updates
- When a teammate finishes: verify PR URL, check CI status
- If a teammate is stuck (>10 minutes no progress): redirect or help
- If two teammates have a conflict: mediate and assign resolution
- When all teammates are done: proceed to merge

## Phase 6: Merge & Cleanup

After all teammates complete and CIs pass:

1. Merge PRs in dependency order:

   ```bash
   gh pr merge <n> --squash --delete-branch
   ```

2. Worktree cleanup -- **3 SEPARATE Bash calls per worktree** (CRITICAL):

   ```bash
   # Call 1: Ensure CWD is safe
   cd /workspace

   # Call 2: Remove worktree
   git worktree remove /workspace/.worktrees/work-{id} --force

   # Call 3: Pull latest
   git branch -D work-{id} 2>/dev/null; git pull origin main
   ```

3. Close tasks:

   ```bash
   source .env.local && bd close {id} && ./scripts/linear-done.sh {linear-id}
   ```

4. Dismiss the team

## Phase 7: Sync & Report

Sync: `source .env.local && bd linear sync --push --create-only && ./scripts/linear-set-project.sh`

Print session summary:

```
## Session Summary
| # | ID | Title | Status | PR | Teammate |
|---|----|----|----|----|-----|
| 1 | {id} | {title} | merged | #{pr} | dev-{id} |

Batches: N | Attempted: M | Merged: X | Failed: Y
```

## Edge Cases

- No tasks -> print message, stop
- CI fail after 5 iterations -> teammate marks blocked, lead skips
- Merge conflict -> teammate rebases once, if still conflicting lead skips
- Failed tasks -> never re-pick in same session
- Teammate unresponsive -> lead dismisses and continues with remaining
