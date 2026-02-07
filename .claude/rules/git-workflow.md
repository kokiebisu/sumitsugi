# Git Workflow

## Git Worktree Usage (CRITICAL)

**ALWAYS use git worktrees to prevent accidental file inclusion:**

### Why Worktrees Matter

Working directly in the main workspace can lead to accidentally committing unrelated modified files:

- Example: You want to update CLAUDE.md but .beads/issues.jsonl is also modified
- Without worktree: High risk of accidentally staging/committing both files together
- With worktree: Complete isolation - only your intended changes exist in that workspace

### When to Use Worktrees

**Use worktrees for ALL changes when:**

- There are ANY other modified files in your workspace (even unrelated ones)
- Making documentation updates
- Making configuration changes
- Implementing features
- Fixing bugs

**Only skip worktrees when:**

- Working directory is completely clean (no other modified files)
- Making trivial single-file edits with no other changes present

### Worktree Workflow (REQUIRED)

```bash
# 1. Create worktree FIRST (before making any changes)
bun run worktree:create <branch-name>

# 2. Navigate to worktree
cd /workspaces/tsumugi/.worktrees/<branch-name>

# 3. Make your changes in isolation

# 4. Stage ONLY the files you changed
git add <specific-file>

# 5. Verify (CRITICAL - must show only your intended changes)
git status

# 6. Commit, push, create PR
git commit -m "..."
git push -u origin HEAD
gh pr create --title "..." --body "..."

# 7. Wait for CI to pass and check for PR review comments
gh pr checks                          # Monitor CI status
gh pr view <number> --comments        # Check for review comments
gh pr merge <number> --squash --delete-branch  # Only after CI passes + comments addressed

# 8-10: Clean up worktree (EACH STEP MUST BE A SEPARATE BASH CALL)
```

**Worktree cleanup (3 separate Bash calls - NEVER chain these):**

```bash
# Bash call 1: Return to main workspace (MUST succeed on its own)
cd /workspaces/tsumugi
```

```bash
# Bash call 2: Remove worktree (safe now - CWD is main workspace)
git worktree remove /workspaces/tsumugi/.worktrees/<branch-name>
```

```bash
# Bash call 3: Pull latest
git pull origin main
```

**CRITICAL: Each cleanup step MUST be a separate Bash tool invocation.** Chaining `cd && git worktree remove` in one call is NOT safe - if any part of the chain fails (e.g., a later `git pull` exits 128), the CWD persistence may not update, leaving the next Bash call starting in the deleted worktree directory. This permanently breaks the shell - all commands return exit code 1 with no output.

**Remember:** Worktrees prevent the "oops, I committed the wrong files" problem by giving you a clean, isolated workspace.

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

**NEVER STOP UNTIL MERGE IS COMPLETE (CRITICAL):**

- **DO NOT STOP** after creating a PR
- **DO NOT STOP** after pushing commits
- **DO NOT STOP** after CI starts running
- **DO NOT STOP** when CI fails - fix it iteratively until it passes
- **ALWAYS WAIT** for ALL CI to pass (lint, types, unit tests, E2E tests)
- **ALWAYS FIX** CI failures using `/ralph-loop` to iteratively fix until green
- **ALWAYS CHECK** for relevant PR review comments before merging
- **ALWAYS ADDRESS** relevant review feedback before merging
- **ALWAYS MERGE** the PR after CI passes and review feedback is addressed
- **ALWAYS SWITCH** back to main and pull
- **ONLY THEN** is the work complete

**Complete PR Workflow (MUST FINISH ALL STEPS):**

1. Create/update PR
2. Wait for CI checks (`gh pr checks`) - ALL must pass (lint, types, unit tests, E2E tests)
3. If any CI check fails: use `/ralph-loop` to iteratively fix until all checks pass, then go back to step 2
4. Check for PR review comments (`gh pr view <number> --comments` and `gh pr reviews <number>`)
5. If relevant comments exist: address them, push fixes, go back to step 2
6. Merge PR (`gh pr merge <number> --squash --delete-branch`)
7. Switch to main (`git checkout main`)
8. Pull latest changes (`git pull origin main`)
9. Verify you're on main with latest code

**If you stop before step 9, you haven't finished the task.**
**If CI fails, you MUST fix it - do not skip, do not ask the user to merge manually.**

**PR Size Limit (CRITICAL):**

- Maximum ~300 lines of code per PR
- Large features MUST be broken into multiple sequential PRs
- Each PR should be independently reviewable
- If a task results in >300 lines, split it into smaller logical chunks
- Example: Database schema with 3 tables = 3 separate PRs (one per table)

**Single Responsibility Principle (CRITICAL):**

- Each PR must address ONE specific concern only
- Do NOT combine unrelated changes (e.g., feature + docs update, bug fix + refactor)
- If changes are unrelated, create separate PRs
- Example: Stop tracking a file should not include documentation updates

**CI Check Requirement (CRITICAL):**

- **ALL CI checks MUST pass** before merging - this includes linting, type checks, unit tests, AND E2E tests
- Use `gh pr checks` to monitor status; verify every check is green
- NEVER merge a PR with any failing CI check, regardless of which check it is
- If ANY check fails, use `/ralph-loop` to iteratively fix:
  1. Ralph reads the failing check's logs (`gh run view <run-id> --log-failed`)
  2. Identifies root cause from the error output
  3. Fixes the issue locally
  4. Pushes the fix and waits for CI to re-run
  5. If it still fails, repeats automatically until ALL checks pass

- E2E test failures are NOT optional to fix - treat them the same as any other CI failure
- If after several iterations a failure appears to be a flaky test unrelated to your changes, flag it to the user rather than silently merging

**PR Review Comment Check (CRITICAL):**

- **ALWAYS check for PR review comments before merging** using `gh pr view <number> --comments`
- Also check review status: `gh pr reviews <number>`
- Address ALL relevant review comments before merging, not just critical ones
- Look for: requested changes, blocking reviews, bug reports, security concerns, design feedback, logic issues
- Only skip comments that are clearly irrelevant (e.g., bot noise, outdated/resolved threads, pure style preferences with no substance)
- When in doubt, address the comment - it's better to fix something unnecessary than to merge with a real issue
- NEVER merge a PR with unaddressed relevant review comments

**Auto-Merge After CI + Review Check (CRITICAL):**

- After CI passes AND relevant review comments are addressed, merge using `gh pr merge <number> --squash --delete-branch`
- This is NOT optional - merge immediately after both checks pass

**When to merge automatically:**

- Docs updates (README, CLAUDE.md, comments, etc.)
- Config changes (eslint, tsconfig, package.json, etc.)
- Bug fixes (small, non-breaking)
- Small features (non-breaking, tests pass)
- Refactoring (no behavior changes)
- Test additions
- Dependency updates

**Only wait for user approval when:**

- Breaking changes that affect existing APIs
- Major architectural decisions
- Large features spanning 10+ files
- Changes requiring user input on approach

**Default: MERGE IMMEDIATELY unless it clearly falls into the "wait" category**

When creating PRs:

1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch
6. Verify PR contains only related changes
7. **WAIT FOR ALL CI CHECKS TO PASS** - Use `gh pr checks` to monitor status (lint, types, unit tests, E2E)
8. **If any CI check fails** - Use `/ralph-loop` to iteratively fix until green
9. **CHECK FOR PR REVIEW COMMENTS** - Use `gh pr view <number> --comments` and `gh pr reviews <number>`
10. **Address all relevant review comments** before proceeding
11. **After ALL CI passes and review comments are addressed, merge PR with `gh pr merge <number> --squash --delete-branch`**
12. **Switch back to main and delete local branch:**

```bash
git checkout main
git pull origin main
git branch -D <feature-branch-name>
```

**Keep PR Description Updated (CRITICAL):**

- **ALWAYS update PR description after making changes to the branch**
- After each commit/push, use `gh pr edit <pr-number> --body "..."` to update description
- PR description should reflect ALL changes made, not just initial changes
- Include:
  - Summary of what changed since last update
  - Why changes were needed (e.g., "Fixed CI timeout", "Resolved merge conflict")
  - Current state of the PR
  - Test status
- This keeps reviewers informed and maintains accurate documentation
- Use comprehensive descriptions like the example in this PR (#103)

## Creating Multiple PRs from Grouped Changes (CRITICAL)

When you have multiple groups of changes to commit as separate PRs:

**WRONG approach (what NOT to do):**

```bash
# DON'T do this - staging unrelated files together
git add file1.md file2.md file3.jsonl  # All at once
git commit -m "docs: update"           # Everything in one commit
```

**CORRECT approach (what TO do):**

For each PR group, follow this exact sequence:

1. **Create branch for FIRST group only:**

   ```bash
   git checkout -b <branch-name-for-group-1>
   ```

2. **Stage ONLY files for this group (CRITICAL):**

   ```bash
   git add <file1-from-group-1> <file2-from-group-1>  # ONLY group 1 files
   ```

3. **Verify what's staged before committing:**

   ```bash
   git status  # MUST show only files intended for this PR
   ```

   **STOP if you see unexpected files!** Only proceed if `git status` shows exactly the files you want in this PR.

4. **Commit only staged files:**

   ```bash
   git commit -m "..."
   ```

5. **Push and create PR:**

   ```bash
   git push -u origin HEAD
   gh pr create --title "..." --body "..."
   ```

6. **Wait for CI, check PR comments, then merge:**

   ```bash
   gh pr checks                          # Monitor CI status
   gh pr view <number> --comments        # Check for review comments
   gh pr merge <number> --squash --delete-branch  # Only after CI passes + comments addressed
   ```

7. **Return to main and pull:**

   ```bash
   git checkout main
   git pull origin main
   ```

8. **Repeat steps 1-7 for SECOND group:**
   - Create new branch
   - Stage ONLY group 2 files
   - Verify with `git status`
   - Commit, push, create PR, merge

**Key Rules:**

- **ONE group per branch** - Never mix groups
- **Explicit staging** - Use `git add <specific-file>`, NOT `git add .` or `git add -A`
- **Always verify** - Run `git status` before committing
- **Sequential processing** - Complete PR1 (merge) before starting PR2
- **Clean state** - Return to main between PRs

## Feature Implementation Workflow

1. **Plan First** (Automatic)
   - Claude automatically uses **planner** agent for complex features
   - Identifies dependencies and risks
   - Breaks down into phases

2. **TDD Approach** (Automatic)
   - Claude automatically uses **tdd-guide** agent
   - Writes tests first (RED)
   - Implements to pass tests (GREEN)
   - Refactors (IMPROVE)
   - Verifies 80%+ coverage

3. **Code Review** (Automatic)
   - Claude automatically uses **code-reviewer** agent after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format
