#!/bin/bash
# Devcontainer postCreateCommand setup script.
# Handles the case where sumitsugi is a git submodule and the parent repo's
# .git/modules/ directory isn't available inside the container.

set -e

# 1. Install dependencies
bun install

# 2. Fix git if running as a submodule in the container
#    The .git file references ../../.git/modules/sumitsugi which doesn't exist
#    inside the container. We create a container-local git repo instead.
if [ -f .git ] && ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Detected broken git submodule reference, initializing container-local git..."
  GIT_LOCAL="/home/bun/.sumitsugi-git"

  git init --bare "$GIT_LOCAL"
  git --git-dir="$GIT_LOCAL" remote add origin git@github.com:kokiebisu/sumitsugi.git 2>/dev/null || true
  git --git-dir="$GIT_LOCAL" config user.email "kokiebisu@icloud.com"
  git --git-dir="$GIT_LOCAL" config user.name "neko"
  git --git-dir="$GIT_LOCAL" config core.worktree /workspace
  git --git-dir="$GIT_LOCAL" config core.bare false

  # Fetch from remote (SSH keys are mounted from host)
  git --git-dir="$GIT_LOCAL" fetch origin 2>/dev/null || {
    echo "Warning: Could not fetch from remote. Trying HTTPS..."
    git --git-dir="$GIT_LOCAL" remote set-url origin https://github.com/kokiebisu/sumitsugi.git
    git --git-dir="$GIT_LOCAL" fetch origin 2>/dev/null || true
  }

  # Reset index to match remote main (working tree files are already present via bind mount)
  git --git-dir="$GIT_LOCAL" --work-tree=/workspace reset --mixed origin/main 2>/dev/null || true

  # Set GIT_DIR for the rest of this script
  export GIT_DIR="$GIT_LOCAL"

  # Persist for future shell sessions
  for rc in ~/.bashrc ~/.zshrc; do
    if ! grep -q 'GIT_DIR=.*sumitsugi-git' "$rc" 2>/dev/null; then
      cat >> "$rc" << 'GITENV'

# Container-local git for submodule workaround
export GIT_DIR=/home/bun/.sumitsugi-git
export GIT_WORK_TREE=/workspace
GITENV
    fi
  done

  echo "Git configured for container use (GIT_DIR=$GIT_LOCAL)"
fi

# 3. Global git config
git config --global worktree.guessRemote true

# 4. Initialize beads if needed
[ -d .beads ] || bd init --quiet 2>/dev/null || true

# 5. Setup git hooks (non-fatal if git is still not fully available)
bash scripts/setup-git-hooks.sh 2>/dev/null || true

# 6. Shell aliases for Claude Code
grep -q 'alias claude=' ~/.bashrc 2>/dev/null || \
  echo "alias claude='claude --dangerously-skip-permissions'" >> ~/.bashrc
grep -q 'alias claude=' ~/.zshrc 2>/dev/null || \
  echo "alias claude='claude --dangerously-skip-permissions'" >> ~/.zshrc
