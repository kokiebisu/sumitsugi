# Cleanup Merged Branches

Clean up local and remote branches that have been merged into the main branch.

## Step 1: Identify Merged Branches

1. **List local merged branches**:
   ```bash
   git branch --merged main | grep -v "^\* main$" | grep -v "^  main$"
   ```

2. **List remote merged branches**:
   ```bash
   git branch -r --merged main | grep -v "HEAD" | grep -v "main" | sed 's/origin\///'
   ```

3. **Show summary** to user:
   ```
   Local branches to delete (X):
   - feat/feature-a
   - fix/bug-fix-b

   Remote branches to delete (Y):
   - feat/feature-a
   - fix/bug-fix-b
   ```

## Step 2: Confirm Deletion

Ask user to confirm before proceeding. Present options:
- Delete both local and remote branches
- Delete only local branches
- Delete only remote branches
- Cancel

## Step 3: Delete Branches

Based on user selection:

### Delete Local Branches

```bash
git branch -D <branch1> <branch2> <branch3> ...
```

Use `-D` (force delete) instead of `-d` to avoid issues with branches that were squash-merged.

### Delete Remote Branches

```bash
git push origin --delete <branch1> <branch2> <branch3> ...
```

### Prune Remote References

After deleting remote branches, clean up stale remote-tracking references:

```bash
git remote prune origin
```

## Step 4: Verify Cleanup

1. **Show remaining local branches**:
   ```bash
   git branch
   ```

2. **Show remaining remote branches**:
   ```bash
   git branch -r
   ```

3. **Report summary**:
   ```
   Cleanup complete!
   - Deleted X local branches
   - Deleted Y remote branches
   - Remaining: Z local branches, W remote branches
   ```

## Safety Rules

- **NEVER delete main/master** branch
- **NEVER delete current branch** (checkout main first if needed)
- **NEVER delete branches with unpushed commits** (warn user)
- **Always confirm** before deleting
- **Show clear summary** of what will be deleted
- **Verify branches are merged** before deleting

## Edge Cases

1. **Current branch is not main**:
   - Switch to main first: `git checkout main`
   - Pull latest changes: `git pull`

2. **Uncommitted changes**:
   - Warn user about uncommitted changes
   - Suggest stashing: `git stash`

3. **Branches not merged but pushed to remote**:
   - List these separately
   - Warn user they may contain unmerged work
   - Only delete if user explicitly confirms

4. **Authentication required for remote**:
   - Ensure gh CLI is authenticated
   - Use `gh auth status` to check

## Example Output

```
Found 5 local merged branches:
  - feat/location-picker
  - feat/date-picker
  - fix/typo-fix
  - docs/update-readme
  - chore/cleanup

Found 3 remote merged branches:
  - feat/location-picker
  - feat/date-picker
  - fix/typo-fix

Delete all merged branches? (local + remote)
[Options: all / local only / remote only / cancel]

> all

Deleting local branches...
✓ Deleted feat/location-picker
✓ Deleted feat/date-picker
✓ Deleted fix/typo-fix
✓ Deleted docs/update-readme
✓ Deleted chore/cleanup

Deleting remote branches...
✓ Deleted origin/feat/location-picker
✓ Deleted origin/feat/date-picker
✓ Deleted origin/fix/typo-fix

Pruning remote references...
✓ Pruned 3 stale references

Cleanup complete!
- Deleted 5 local branches
- Deleted 3 remote branches
- Remaining: 1 local branch (main), 1 remote branch (origin/main)
```
