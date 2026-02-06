#!/bin/bash
# Appends branch cleanup to the post-merge hook (idempotent).
# Runs after `bd init` which creates the base post-merge hook.

HOOK_FILE="$(git rev-parse --git-dir)/hooks/post-merge"
MARKER="# [tsumugi] auto-cleanup gone branches"

# Skip if already installed
if [ -f "$HOOK_FILE" ] && grep -qF "$MARKER" "$HOOK_FILE"; then
  exit 0
fi

# If no post-merge hook exists, create one
if [ ! -f "$HOOK_FILE" ]; then
  echo "#!/bin/sh" > "$HOOK_FILE"
  chmod +x "$HOOK_FILE"
fi

# Remove the trailing `exit 0` so our block runs, then re-add it
sed -i '/^exit 0$/d' "$HOOK_FILE"

cat >> "$HOOK_FILE" << 'HOOK'

# [tsumugi] auto-cleanup gone branches
gone_branches=$(git branch -vv 2>/dev/null | grep ': gone]' | awk '{print $1}' | sed 's/^[+* ]//')
if [ -n "$gone_branches" ]; then
    echo "$gone_branches" | while read branch; do
        if [ -n "$branch" ]; then
            git branch -D "$branch" 2>/dev/null && echo "Cleaned up [gone] branch: $branch" >&2
        fi
    done
fi

exit 0
HOOK
