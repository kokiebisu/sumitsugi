# Worktrees Directory

This directory contains git worktrees when working inside a devcontainer.

Worktrees created here are automatically ignored by git (see `.gitignore`).

## Usage

Create a new worktree:
```bash
bun run worktree:create feature-name
```

This directory is used instead of creating sibling directories to avoid permission issues in the devcontainer environment.

See [../.devcontainer/WORKTREE.md](../.devcontainer/WORKTREE.md) for full documentation.
