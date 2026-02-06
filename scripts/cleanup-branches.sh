#!/bin/bash
set -e

echo "🧹 Cleaning up branches..."
echo ""

# Fetch all branches and prune deleted remotes
echo "📡 Fetching from remote and pruning..."
git fetch --all --prune
echo ""

# Delete merged branches
echo "=== Deleting branches merged to main ==="
merged_branches=$(git branch --merged main | grep -v '^\*' | grep -v 'main$' | grep -v 'gh-pages' | sed 's/^[+ ]*//' || true)
if [ -z "$merged_branches" ]; then
  echo "  No merged branches to delete"
else
  echo "$merged_branches" | while read branch; do
    if [ ! -z "$branch" ]; then
      echo "  ✓ Deleting merged branch: $branch"
      git branch -d "$branch" 2>/dev/null || true
    fi
  done
fi
echo ""

# Delete branches marked as [gone] (deleted on remote)
echo "=== Deleting branches removed from remote ==="
gone_branches=$(git branch -vv | grep ': gone]' | awk '{print $1}' | sed 's/^[+* ]//' || true)
if [ -z "$gone_branches" ]; then
  echo "  No [gone] branches to delete"
else
  echo "$gone_branches" | while read branch; do
    if [ ! -z "$branch" ]; then
      # Check if branch has a worktree
      worktree=$(git worktree list | grep "\\[$branch\\]" | awk '{print $1}' || true)
      
      if [ ! -z "$worktree" ] && [ "$worktree" != "$(git rev-parse --show-toplevel)" ]; then
        echo "  ✓ Removing worktree: $worktree"
        git worktree remove --force "$worktree" 2>/dev/null || true
      fi
      
      echo "  ✓ Deleting gone branch: $branch"
      git branch -D "$branch" 2>/dev/null || true
    fi
  done
fi
echo ""

echo "=== Summary ==="
total_branches=$(git branch | wc -l | tr -d ' ')
echo "  Total remaining branches: $total_branches"
echo ""
echo "✨ Cleanup complete!"
