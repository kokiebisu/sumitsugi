# Create Pull Request

Create focused pull requests with changes grouped logically and limited to 200 lines each.

## Step 1: Analyze Changes

1. Run `git status` to check current state
2. Run `git diff --stat origin/main...HEAD` to get line counts per file
3. Run `git diff origin/main...HEAD` to analyze actual changes

## Step 2: Group Changes

Analyze all changes and group them by:
- **Feature**: Related functionality (e.g., "location picker", "date range picker")
- **Type**: Similar change types (e.g., "type fixes", "dependency updates")
- **Domain**: Same domain area (e.g., "auth", "listing", "admin")

For each group, calculate total line changes (additions + deletions).

## Step 3: Split if Needed

If any group exceeds 200 lines:
- Split into smaller logical units
- Each PR should be independently reviewable
- Maintain dependency order (base changes first)

Present groups to user:
```
Group 1: feat: add location picker (156 lines)
  - src/components/location-picker.tsx (+120, -0)
  - src/lib/geocoding.ts (+36, -0)

Group 2: fix: improve date range validation (89 lines)
  - src/components/date-range-picker.tsx (+45, -12)
  - src/lib/date-utils.ts (+32, -0)
```

Ask user to confirm or adjust groupings.

## Step 4: Run Tests

Before pushing, verify all tests pass:

1. **Run test suite**:
   ```bash
   pnpm test
   ```

2. **Run type check**:
   ```bash
   pnpm tsc --noEmit
   ```

3. **Run linter**:
   ```bash
   pnpm lint
   ```

4. **Run build** (if applicable):
   ```bash
   pnpm build
   ```

If any test fails:
- **STOP** - Do not proceed with PR creation
- Report the failing tests to user
- Ask user how to proceed (fix issues or skip PR)

## Step 5: Create PRs

**IMPORTANT**: You MUST automatically create pull requests using `gh pr create`. DO NOT just push branches and expect the user to create PRs manually.

For each approved group:

1. **Create branch** (if needed):
   ```bash
   git checkout -b <type>/<short-description>
   ```

2. **Stage only group files**:
   ```bash
   git add <file1> <file2> ...
   ```

3. **Commit with conventional commit format**:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `refactor:` - Code refactoring
   - `docs:` - Documentation
   - `test:` - Tests
   - `chore:` - Maintenance
   - `perf:` - Performance
   - `ci:` - CI/CD

4. **Push branch**:
   ```bash
   git push -u origin HEAD
   ```

5. **Immediately create PR** (DO NOT SKIP THIS):
   ```bash
   gh pr create --title "<type>: <description>" --body "$(cat <<'EOF'
   ## Summary
   <2-4 bullet points describing what changed and why>

   ## Changes
   <bulleted list of specific changes made>

   ## Test Plan
   - [ ] <verification step 1>
   - [ ] <verification step 2>
   - [ ] <verification step 3>

   Generated with Claude Code
   EOF
   )"
   ```

6. **Report PR URL and status** after creation

## Step 6: Wait for CI and Merge

After PR is created:

1. **Monitor CI checks**:
   ```bash
   gh pr checks <pr-number>
   ```

2. **Wait for all checks to pass** - Do NOT proceed if any check fails

3. **Merge PR and delete remote branch**:
   ```bash
   gh pr merge <pr-number> --squash --delete-branch
   ```

   This deletes the **remote branch** on GitHub.

4. **Clean up local workspace**:
   ```bash
   # Switch to main (if not already there)
   git checkout main

   # Pull latest changes
   git pull origin main

   # Delete local feature branch (only if it exists)
   if git show-ref --verify --quiet refs/heads/<feature-branch-name>; then
     git branch -d <feature-branch-name>
   fi
   ```

   This deletes the **local branch** (only if it exists).

**Result**: Both remote and local branches are deleted.

**Note**: The existence check prevents errors when the branch has already been deleted.

## Rules

- **ALWAYS create PRs automatically** - Never just push and tell user to create PR manually
- **All tests must pass** before pushing
- **Type check must pass** before pushing
- **Lint must pass** before pushing
- **Build must succeed** before pushing
- **Max 200 lines per PR** (additions + deletions)
- **Title MUST use conventional commits** format
- **One logical change per PR** - independently reviewable
- **No uncommitted changes** - commit or stash first
- **Dependencies first** - if PR B depends on PR A, create A first
- **Use `gh pr create`** - Not just `git push`
