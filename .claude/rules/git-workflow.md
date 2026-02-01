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
npm run worktree:create <branch-name>

# 2. Navigate to worktree
cd /workspaces/tsumugi/.worktrees/<branch-name>

# 3. Make your changes in isolation

# 4. Stage ONLY the files you changed
git add <specific-file>

# 5. Verify (CRITICAL - must show only your intended changes)
git status

# 6. Commit, push, create PR, merge
git commit -m "..."
git push -u origin HEAD
gh pr create --title "..." --body "..."
gh pr merge <number> --squash --delete-branch

# 7. Return to main workspace
cd /workspaces/tsumugi

# 8. Clean up worktree
git worktree remove /workspaces/tsumugi/.worktrees/<branch-name>
git pull origin main
```

**Remember:** Worktrees prevent the "oops, I committed the wrong files" problem by giving you a clean, isolated workspace.

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

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

**Auto-Merge Requirement (CRITICAL):**
- You MUST merge PRs automatically after creation using `gh pr merge <number> --squash --delete-branch`
- This is NOT optional - merge immediately after PR creation

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
7. **IMMEDIATELY merge PR with `gh pr merge <number> --squash --delete-branch`**
8. **Switch back to main and delete local branch:**
   ```bash
   git checkout main
   git pull origin main
   git branch -D <feature-branch-name>
   ```

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

6. **Merge immediately:**
   ```bash
   gh pr merge <number> --squash --delete-branch
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
