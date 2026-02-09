---
description: Auto-pick tasks from Beads, categorize as Business/Dev, and dispatch parallel sub-agents to execute them. Loops until all eligible tasks are done.
---

# /work - Autonomous Task Execution

Continuously pick tasks from Beads and work on them in parallel using sub-agents. Each completed task goes through a Ralph Loop for CI refinement and audit. Keeps running in batches of up to 5 until no eligible tasks remain.

**When invoked, execute the loop below without waiting for user confirmation.**

---

## Main Loop

```
REPEAT:
  1. Discover eligible tasks (Phase 1)
  2. If none remain → print final session report → STOP
  3. Categorize tasks (Phase 2)
  4. Print batch summary (Phase 3)
  5. Dispatch sub-agents in parallel (Phase 4)
  6. Collect results, run Ralph Loop on each PR (Phase 5)
  7. Print batch report (Phase 6)
  8. Sync to Linear
  9. Go back to step 1 for next batch
```

**The loop ends ONLY when Phase 1 returns zero eligible tasks.**

---

## Phase 1: Task Discovery

Run `bd ready` to get eligible tasks. Parse the output to extract task IDs, titles, priorities, and labels.

**Fallback:** If `bd ready` fails, read `.beads/issues.jsonl` directly and filter for:

- `status === "open"`
- No blockers (empty `blockers` array)
- Labels do NOT include: `blocked`, `wontfix`, `autonomous:skip`, `needs-human`

**Additional filters — skip these tasks entirely:**

- Tasks with role labels: `ceo`, `cfo`, `cmo`, `coo` (require human decision-makers)
- Tasks whose title contains physical-action keywords: `ヒアリング実施`, `参加する`, `予約`, `電話`, `訪問`, `面談`, `対面`

**Sort:** Priority ASC (lower = higher priority), then `created_at` ASC (older first).

**Select up to 5 tasks for this batch.**

---

## Phase 2: Categorization

Classify each selected task as **Business** or **Dev**.

### Business labels (primary check)

If the task has ANY of these labels, it is a Business task:

```
business, marketing, legal, finance, sales, manual-setup, partnership, branding, hiring, operations
```

### Title keyword fallback (secondary check)

If no label match, check the title for Japanese business keywords:

```
タグライン, 予算, 法律, 法務, 規約, 管理会社, パートナー, マーケティング, Twitter, 投稿,
メールアドレスを作成, 提案資料, 振り返り, Stripe申請, 書類準備, イベント, Venture, Cafe,
告知, 成功事例, フォローアップ, 清掃費, 物件登録目標, 紹介プログラム, コンテンツマーケ,
CAC, LTV, 紹介フィー, オペレーション
```

Everything else is a **Dev** task.

---

## Phase 3: Batch Summary

Print a summary table before dispatching:

```
## Batch N — Dispatching M tasks

| # | Type | ID | Title | Priority |
|---|------|----|-------|----------|
| 1 | Dev  | tsumugi-xxx | ... | P1 |
| 2 | Biz  | tsumugi-yyy | ... | P2 |

Remaining eligible after this batch: X tasks
```

**Do NOT wait for confirmation. Proceed immediately to Phase 4.**

---

## Phase 4: Dispatch Sub-Agents

Use the **Task tool** to spawn one sub-agent per task. Launch all agents in a single message (parallel dispatch).

**CRITICAL:** Check for dependency relationships between selected tasks. If task B lists task A's ID in its `blockers`, do NOT dispatch both in parallel — dispatch A first, then B after A completes.

### Dev Agent Prompt Template

For each **Dev** task, use `subagent_type: "general-purpose"` with this prompt:

````
You are implementing a development task for the tsumugi project (Next.js/TypeScript/Bun).

First, determine the project root: REPO_ROOT=$(git rev-parse --show-toplevel)

## Task
**ID:** {task.id}
**Title:** {task.title}
**Description:** {task.description}
**Labels:** {task.labels}

## Workflow (follow EXACTLY)

### Step 1: Create worktree
```bash
cd $(git rev-parse --show-toplevel) && bun run worktree:create work-{task.id}
```

Then navigate: `cd $(git rev-parse --show-toplevel)/.worktrees/work-{task.id}`

### Step 2: Understand context

Read relevant source files. Understand the codebase area this task affects.

### Step 3: TDD Implementation

1. Write a failing test first (RED)
2. Run test to confirm it fails: `bun run test:run`
3. Write minimal implementation to pass (GREEN)
4. Run test to confirm it passes: `bun run test:run`
5. Refactor if needed (IMPROVE)

### Step 4: Verify locally

```bash
bun run test:run
bun run lint
bunx tsc --noEmit
```

All must pass before proceeding.

### Step 5: Create PR

```bash
git add <specific-files-only>
git commit -m "<type>: <description>"
git push -u origin HEAD
gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
## Summary
- <what changed and why>

## Test Plan
- [ ] Unit tests pass
- [ ] Lint passes
- [ ] Type check passes

Beads: {task.id}
EOF
)"
```

### Step 6: Ralph Loop — CI Refinement (CRITICAL)

Run the Ralph Loop to ensure CI passes. This is an iterative cycle:

1. Check CI status: `gh pr checks <pr-number>`
2. If ALL checks pass → proceed to Step 7
3. If any check fails:
   a. Read failure logs: `gh run view <run-id> --log-failed`
   b. Identify root cause from the error output
   c. Fix the issue locally
   d. Run local verification again: `bun run test:run && bun run lint && bunx tsc --noEmit`
   e. Push the fix: `git add <files> && git commit -m "fix: <what was fixed>" && git push`
   f. Go back to step 1

Repeat until ALL CI checks are green. Max 5 iterations.
If still failing after 5 iterations, report the failure and move on.

### Step 7: Ralph Loop — Code Audit (CRITICAL)

After CI passes, perform a self-audit before merging:

1. Review your own changes: `git diff origin/main...HEAD`
2. Check for:
   - Security issues (hardcoded secrets, XSS, injection)
   - Missing error handling
   - Console.log statements left in
   - Unused imports or variables
   - Code that violates project patterns (mutation, >800 line files, deep nesting)
3. If issues found: fix, commit, push, re-run Ralph Loop from Step 6
4. If clean: proceed to merge

### Step 8: Check PR comments and merge

```bash
gh pr view <pr-number> --comments
gh pr reviews <pr-number>
```

Address any relevant comments (fix, push, re-run Ralph Loop if needed). Then:

```bash
gh pr merge <pr-number> --squash --delete-branch
```

### Step 9: Cleanup worktree (3 SEPARATE Bash calls - NEVER chain)

Call 1: `cd $(git rev-parse --show-toplevel)`
Call 2: `git worktree remove $(git rev-parse --show-toplevel)/.worktrees/work-{task.id}`
Call 3: `git pull origin main`

### Step 10: Mark done

```bash
source $(git rev-parse --show-toplevel)/.env.local
bd close {task.id}
$(git rev-parse --show-toplevel)/scripts/linear-done.sh {linear-identifier}
```

### Constraints

- Max 300 lines of code changes per PR
- Must include tests
- Must pass all existing tests
- Follow existing code patterns in the project
- Do NOT modify unrelated files
````

### Business Agent Prompt Template

For each **Business** task, use `subagent_type: "general-purpose"` with this prompt:

````
You are executing a business task for the tsumugi project.

First, determine the project root: REPO_ROOT=$(git rev-parse --show-toplevel)

## Task

**ID:** {task.id}
**Title:** {task.title}
**Description:** {task.description}
**Labels:** {task.labels}

## Context

Read relevant strategy documents first:

- `docs/team/ceo/STRATEGY.md` (if exists)
- `docs/team/cto/STRATEGY.md` (if exists)
- `docs/team/cmo/STRATEGY.md` (if exists)
- `docs/requirements/` (project requirements)
- `DASHBOARD.md` (current status)

Use these for context on the project's direction and goals.

## Workflow

### Step 1: Create worktree

```bash
cd $(git rev-parse --show-toplevel) && bun run worktree:create work-{task.id}
```

Then navigate: `cd $(git rev-parse --show-toplevel)/.worktrees/work-{task.id}`

### Step 2: Analyze the task

Determine what tangible output this task requires:

- **Strategy/Plan**: Create a markdown document in `docs/`
- **Research/Analysis**: Compile findings into structured markdown
- **Draft materials**: Create templates, outlines, or draft content
- **List/Database**: Create structured data files (markdown tables, JSON)
- **Process documentation**: Document workflows or procedures

### Step 3: Produce output

Create the deliverable files. Write thorough, actionable content — not placeholders.
Use Japanese where appropriate (this is a Japan-based startup).

### Step 4: Create PR

```bash
git add <specific-files-only>
git commit -m "docs: <description>"
git push -u origin HEAD
gh pr create --title "docs: <description>" --body "$(cat <<'EOF'
## Summary
- <what was created/updated and why>

## Output
- <list of deliverable files created>

Beads: {task.id}
EOF
)"
```

### Step 5: Ralph Loop — CI Refinement

1. Check CI status: `gh pr checks <pr-number>`
2. If ALL checks pass → proceed to Step 6
3. If any check fails:
   a. Read failure logs: `gh run view <run-id> --log-failed`
   b. Fix the issue locally
   c. Push the fix
   d. Re-check CI
4. Repeat until green. Max 5 iterations.

### Step 6: Ralph Loop — Content Audit

After CI passes, self-audit the deliverable:

1. Re-read all files you created
2. Check for:
   - Completeness: Does the output fully address the task?
   - Accuracy: Are facts, numbers, and references correct?
   - Actionability: Can someone act on this immediately?
   - Quality: Is it professional, well-structured, thorough?
   - Language: Correct Japanese/English usage as appropriate?
3. If issues found: fix, commit, push, re-run CI check
4. If clean: proceed to merge

### Step 7: Merge

```bash
gh pr view <pr-number> --comments
gh pr merge <pr-number> --squash --delete-branch
```

### Step 8: Cleanup worktree (3 SEPARATE Bash calls)

Call 1: `cd $(git rev-parse --show-toplevel)`
Call 2: `git worktree remove $(git rev-parse --show-toplevel)/.worktrees/work-{task.id}`
Call 3: `git pull origin main`

### Step 9: Mark done

```bash
source $(git rev-parse --show-toplevel)/.env.local
bd close {task.id}
$(git rev-parse --show-toplevel)/scripts/linear-done.sh {linear-identifier}
```
````

---

## Phase 5: Monitoring

As sub-agents complete, collect their results. For each:

- **Success**: Note the PR URL, merge status, and Ralph Loop iterations needed
- **Failure**: Note the reason (CI failure after max retries, merge conflict, etc.)

If a sub-agent fails after retries, do NOT block other agents. Continue with the rest.

---

## Phase 6: Batch Report

After all agents in the current batch complete, print a batch summary:

```

## Batch N Complete

| #   | Type | ID          | Title | Status | PR   | Ralph Loops |
| --- | ---- | ----------- | ----- | ------ | ---- | ----------- |
| 1   | Dev  | tsumugi-xxx | ...   | Merged | #123 | 2           |
| 2   | Biz  | tsumugi-yyy | ...   | Merged | #124 | 0           |
| 3   | Dev  | tsumugi-zzz | ...   | Failed | #125 | 5 (max)     |

Batch: N/M completed
```

Sync to Linear after each batch:

```bash
source $(git rev-parse --show-toplevel)/.env.local
bd linear sync --push --create-only && $(git rev-parse --show-toplevel)/scripts/linear-set-project.sh
```

**Then return to Phase 1 to pick the next batch.** The loop continues until no eligible tasks remain.

---

## Session End: Final Report

When Phase 1 returns zero eligible tasks, print the full session summary:

```
## Work Session Complete — All Tasks Done

### Session Summary
- Total batches: N
- Total tasks attempted: X
- Successfully merged: Y
- Failed: Z

### All Tasks
| # | Batch | Type | ID | Title | Status | PR |
|---|-------|------|----|-------|--------|----|
| 1 | 1 | Dev  | ... | ... | Merged | #123 |
| 2 | 1 | Biz  | ... | ... | Merged | #124 |
| 3 | 2 | Dev  | ... | ... | Merged | #126 |
| ...

### Remaining (ineligible)
- N tasks blocked
- N tasks require human action
- N tasks skipped (labels)

No more eligible tasks. Work session ended.
```

---

## Edge Cases

- **No eligible tasks on first run**: Print "No eligible tasks found. All tasks are completed, blocked, or require human action." and stop.
- **Fewer than 5 eligible tasks in a batch**: Work on however many are available.
- **Dependency between selected tasks**: Sequence dependent tasks (blocker first, then dependent).
- **CI failure after 5 Ralph Loop iterations**: Mark task as blocked in Beads, add comment, skip to next.
- **Merge conflict**: Rebase once (`git pull --rebase origin main`). If still conflicting, report and skip.
- **Worktree name collision**: Append timestamp suffix (e.g., `work-{task.id}-1707500000`).
- **Previously failed tasks reappearing**: Tasks marked blocked in a previous batch should NOT be re-selected in the same session.
- **Context window pressure**: If the session is getting long after many batches, print a warning but continue. The sub-agents have their own fresh context windows.

---

## Rules

- **Max 5 tasks per batch, unlimited batches** — loop until done
- **Every PR goes through Ralph Loop** — CI refinement + code/content audit
- **Always use worktrees** for isolation between parallel agents
- **Always update Linear** after each batch
- **Dev tasks follow TDD** — tests before implementation
- **Business tasks produce tangible outputs** — no empty placeholders
- **PR size limit: 300 lines** for dev tasks
- **Never chain worktree cleanup** — always 3 separate Bash calls
- **Never re-pick a failed task** in the same session
