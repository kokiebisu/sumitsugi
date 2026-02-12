#!/bin/bash

# Script to create a new git worktree with devcontainer support
# Usage: ./scripts/create-worktree.sh <branch-name> [worktree-path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if branch name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Branch name is required${NC}"
    echo "Usage: $0 <branch-name> [worktree-path]"
    echo ""
    echo "Examples:"
    echo "  $0 feature-auth"
    echo "  $0 fix-bug-123"
    echo "  $0 feature-payments ~/projects/sumitsugi-payments"
    exit 1
fi

BRANCH_NAME="$1"
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
IN_CONTAINER=false

# Determine worktree path
if [ -n "$2" ]; then
    WORKTREE_PATH="$2"
else
    # Check if we're in a devcontainer (limited permissions in /workspaces)
    if [ -f "/.dockerenv" ] || [ -f "/run/.containerenv" ]; then
        # In container: use .worktrees subdirectory to avoid permission issues
        WORKTREE_PATH="$REPO_ROOT/.worktrees/${BRANCH_NAME}"
        IN_CONTAINER=true
        echo -e "${YELLOW}Detected container environment${NC}"
        echo -e "${YELLOW}Using .worktrees subdirectory instead of sibling directories${NC}"
    else
        # On host: create as sibling directory with prefix
        PARENT_DIR=$(dirname "$REPO_ROOT")
        WORKTREE_PATH="$PARENT_DIR/${REPO_NAME}-${BRANCH_NAME}"
    fi
fi

echo -e "${GREEN}Creating worktree for branch: ${BRANCH_NAME}${NC}"
echo -e "${GREEN}Worktree path: ${WORKTREE_PATH}${NC}"
echo ""

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    echo -e "${YELLOW}Branch '$BRANCH_NAME' already exists. Using existing branch.${NC}"
    git worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
else
    echo -e "${GREEN}Creating new branch '$BRANCH_NAME'${NC}"
    git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH"
fi

# In container environments, skip the .devcontainer symlink entirely.
# Replacing git-tracked .devcontainer/ with a symlink breaks git stash and
# rebase ("is beyond a symbolic link" error). Since we're already inside the
# container, the devcontainer config is unused in worktrees.
if [ "$IN_CONTAINER" = true ]; then
    echo -e "${GREEN}Skipping .devcontainer symlink (already in container)${NC}"
else
    # On host: create symlink for VS Code devcontainer support
    echo -e "${GREEN}Creating symlink to .devcontainer...${NC}"
    cd "$WORKTREE_PATH"

    if [ -e ".devcontainer" ]; then
        rm -rf .devcontainer
    fi

    RELATIVE_PATH=$(realpath --relative-to="$WORKTREE_PATH" "$REPO_ROOT/.devcontainer")
    ln -s "$RELATIVE_PATH" .devcontainer

    # Mark .devcontainer files as skip-worktree so git ignores the symlink
    # replacement. Without this, git stash/rebase fail on the symlinked paths.
    git -C "$WORKTREE_PATH" ls-files .devcontainer/ | \
        xargs -r git -C "$WORKTREE_PATH" update-index --skip-worktree

    echo -e "${GREEN}Symlink created: .devcontainer -> $RELATIVE_PATH${NC}"

    if [ -L ".devcontainer" ] && [ -e ".devcontainer" ]; then
        echo -e "${GREEN}Symlink verified successfully${NC}"
    else
        echo -e "${RED}Error: Symlink creation failed${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}Worktree created successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. cd $WORKTREE_PATH"
if [ "$IN_CONTAINER" = false ]; then
    echo "  2. code .  # Open in VS Code"
    echo "  3. Reopen in Container (Cmd/Ctrl+Shift+P -> Dev Containers: Reopen in Container)"
fi
echo ""
echo "To list all worktrees: git worktree list"
echo "To remove this worktree: git worktree remove $WORKTREE_PATH"
echo ""
