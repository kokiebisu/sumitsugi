# Workflow

## Git Worktrees

Use worktrees for ALL changes when other modified files exist in workspace. Skip only for clean-workspace trivial edits.

**Branch naming:** Use conventional commit style: `<type>/<short-description>`

- Examples: `feat/rental-cost-note`, `fix/pdf-header-alignment`, `docs/update-meeting-notes`
- Types: `feat|fix|refactor|docs|test|chore|perf|ci`
- PR titles must also use conventional commit format: `feat: add rental cost note`

```bash
bun run worktree:create <type>/<short-description>  # Create (conventional branch name)
cd /workspace/.worktrees/<type>/<short-description>  # Navigate
# ... work ...
git add <specific-files>              # Stage explicitly (NEVER git add . or -A)
git status                            # Verify before commit
git commit -m "<type>: <desc>"        # Commit types: feat|fix|refactor|docs|test|chore|perf|ci
git push -u origin HEAD
gh pr create --title "<type>: <desc>" --body "..."
```

**Worktree cleanup — 3 SEPARATE Bash calls (NEVER chain):**

1. `cd /workspace`
2. `git worktree remove /workspace/.worktrees/<name>`
3. `git pull origin main`

Chaining these risks permanently breaking the shell if any step fails.

## Build Verification (CRITICAL)

**ALWAYS run `bun run build` locally before creating a PR.** CI alone is not sufficient — if CI lacks a build step, type errors slip through silently.

- `bun run build` catches TypeScript errors that ESLint and tests miss
- If build fails, fix ALL type errors before pushing
- NEVER merge a PR without confirming the build passes (locally or in CI)

## PR Process (CRITICAL)

**NEVER STOP until merge is complete.** Full sequence:

1. Create PR (max 300 lines, single responsibility)
2. Wait for ALL CI: `gh pr checks` (lint + types + unit + E2E)
3. If CI fails → fix iteratively (read logs: `gh run view <id> --log-failed`), max 5 iterations
4. Check PR comments: `gh pr view <n> --comments` + `gh pr reviews <n>`
5. Address all relevant review feedback
6. Merge: `gh pr merge <n> --squash --delete-branch`
7. **Remove worktree (3 SEPARATE Bash calls):** `cd /workspace` | `git worktree remove /workspace/.worktrees/<name> --force` | `git branch -D <branch> 2>/dev/null; git pull origin main`
8. Update PR description after each push: `gh pr edit <n> --body "..."`

**Auto-merge** all changes except: breaking API changes, major architecture decisions, 10+ file features.

## PR Review Resolution (CRITICAL)

When addressing PR review comments (from Claude Code bot, github-actions, or humans):

1. Read ALL review comments: fetch via GitHub API or `gh pr view <n> --comments` + review comments endpoint
2. Fix each issue in code
3. **Resolve each addressed comment** after pushing the fix:
   ```bash
   # Via GitHub GraphQL API — mark review threads as resolved
   gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "<THREAD_NODE_ID>"}) { thread { isResolved } } }'
   ```
4. Push fixes, then verify no unresolved threads remain

**NEVER leave addressed review comments unresolved.** Resolving threads signals to reviewers that feedback was acted on.

## Task Completion (CRITICAL)

After completing any task:

1. Close in Beads: `bd close <id>`
2. Update Linear: `./scripts/linear-done.sh TSU-xxx`
3. Update DASHBOARD.md
4. Report to user

**Beads → Linear sync:** `bd linear sync --push --create-only && ./scripts/linear-set-project.sh`

**Linear scripts:** `linear-list.sh` (list), `linear-done.sh` (close), `linear-comment.sh` (comment), `linear-set-project.sh` (assign project)

## Multiple PRs from Grouped Changes

One group per branch. For each group: create branch → stage only that group's files → verify with `git status` → commit → PR → merge → return to main → repeat for next group.
