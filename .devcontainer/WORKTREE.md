# Using Devcontainers with Git Worktrees

This guide explains how to use VS Code devcontainers when working with git worktrees in the tsumugi project.

## Quick Start

```bash
# Create a new worktree with devcontainer support
bun run worktree:create feature-name

# Or manually (in devcontainer):
git worktree add .worktrees/feature-name feature-name
cd .worktrees/feature-name
ln -s ../../.devcontainer .devcontainer
code .  # Open in VS Code and reopen in container
```

## Understanding the Setup

### The Challenge

Git worktrees create separate working directories for different branches. When you open a worktree in VS Code, the Dev Containers extension looks for a `.devcontainer` folder in that directory.

### The Solution

We use **symbolic links** to share the `.devcontainer` configuration from the main repository to all worktrees. This ensures:

- Single source of truth for devcontainer config
- No duplication or sync issues
- Consistent development environment across all worktrees

### Devcontainer-Specific Behavior

When running inside a devcontainer, worktrees are created in a `.worktrees/` subdirectory within the main repository to avoid permission issues with the `/workspaces` mount. On the host machine, worktrees are created as sibling directories.

## Creating Worktrees

### Option 1: Using the Helper Script (Recommended)

```bash
bun run worktree:create my-feature
```

This script:

1. Creates a new worktree as a sibling directory
2. Creates a symbolic link to `.devcontainer`
3. Opens the worktree in VS Code

### Option 2: Manual Setup

**In a devcontainer:**

1. **Create the worktree** (in .worktrees subdirectory):

   ```bash
   git worktree add .worktrees/feature-name feature-name
   ```

2. **Link the devcontainer config**:

   ```bash
   cd .worktrees/feature-name
   ln -s ../../.devcontainer .devcontainer
   ```

3. **Open in VS Code**:

   ```bash
   code .
   ```

4. **Reopen in Container**:
   - Press `Cmd/Ctrl + Shift + P`
   - Select "Dev Containers: Reopen in Container"

**On the host machine:**

1. **Create the worktree** (as a sibling directory):

   ```bash
   git worktree add ../tsumugi-feature-name feature-name
   ```

2. **Link the devcontainer config**:

   ```bash
   cd ../tsumugi-feature-name
   ln -s ../tsumugi/.devcontainer .devcontainer
   ```

3. **Open in VS Code and reopen in container**

## Directory Structure

### In Devcontainer (Subdirectory Approach)

```
tsumugi/                              # Main repository
├── .devcontainer/                   # Devcontainer config (source)
├── .worktrees/                      # Worktrees subdirectory
│   ├── feature-auth/               # Worktree 1
│   │   ├── .devcontainer -> ../../.devcontainer  # Symlink
│   │   └── ...
│   └── fix-bug-123/                # Worktree 2
│       ├── .devcontainer -> ../../.devcontainer  # Symlink
│       └── ...
├── src/
└── ...
```

### On Host Machine (Sibling Approach)

```
parent-directory/
├── tsumugi/                        # Main repository
│   ├── .devcontainer/             # Devcontainer config (source)
│   ├── src/
│   └── ...
├── tsumugi-feature-auth/          # Worktree 1
│   ├── .devcontainer -> ../tsumugi/.devcontainer  # Symlink
│   └── ...
└── tsumugi-bugfix-123/            # Worktree 2
    ├── .devcontainer -> ../tsumugi/.devcontainer  # Symlink
    └── ...
```

## Working with Worktrees

### List All Worktrees

```bash
git worktree list
```

### Remove a Worktree

```bash
# In devcontainer:
git worktree remove .worktrees/feature-name

# On host:
git worktree remove ../tsumugi-feature-name

# Or if already deleted:
git worktree prune
```

### Switch Between Worktrees

Simply open the worktree directory in VS Code:

```bash
code ../tsumugi-feature-name
```

Then reopen in container if not already open.

## Troubleshooting

### "Could not find devcontainer.json"

**Cause**: The symbolic link to `.devcontainer` is missing or broken.

**Solution**:

```bash
cd /path/to/worktree
ln -s ../tsumugi/.devcontainer .devcontainer
```

### "Permission denied" on symlink creation (Windows)

**Cause**: Windows requires admin privileges or Developer Mode for symlinks.

**Solution**:

1. Enable Developer Mode in Windows Settings
2. OR run terminal as Administrator
3. OR copy `.devcontainer` instead of symlinking:
   ```bash
   cp -r ../tsumugi/.devcontainer .devcontainer
   ```

### Container uses old dependencies

**Cause**: `postCreateCommand` runs `bun install` but package.json might differ across branches.

**Solution**: Rebuild the container:

- Press `Cmd/Ctrl + Shift + P`
- Select "Dev Containers: Rebuild Container"

### Git authentication issues

**Cause**: SSH agent forwarding not working.

**Solution**: Ensure SSH agent is running and keys are added:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

## Best Practices

1. **Naming Convention**: Use prefix pattern for worktree directories:
   - `tsumugi-feature-*` for features
   - `tsumugi-fix-*` for bug fixes
   - `tsumugi-refactor-*` for refactoring

2. **Location**: Create worktrees as siblings to the main repo:

   ```bash
   git worktree add ../tsumugi-feature-name branch-name
   ```

   Avoid deeply nested or unrelated paths.

3. **Cleanup**: Remove worktrees when done:

   ```bash
   git worktree remove ../tsumugi-feature-name
   git branch -d feature-name  # Delete branch if merged
   ```

4. **Container Rebuilds**: After switching worktrees with different dependencies, rebuild the container to ensure clean state.

## Integration with Workflow

This setup integrates with the project's git workflow defined in [.claude/rules/git-workflow.md](../.claude/rules/git-workflow.md):

1. Create worktree for feature: `bun run worktree:create feature-auth`
2. Open in VS Code and reopen in container
3. Implement feature using TDD
4. Commit changes: `/commit`
5. Create PR: `/pr`
6. After merge, cleanup worktree

## Advanced: Multiple Concurrent Features

Work on multiple features simultaneously, each in its own container:

```bash
# Terminal 1
git worktree add ../tsumugi-feature-auth feature-auth
cd ../tsumugi-feature-auth
ln -s ../tsumugi/.devcontainer .devcontainer
code .  # Opens in container instance 1

# Terminal 2
git worktree add ../tsumugi-feature-payments feature-payments
cd ../tsumugi-feature-payments
ln -s ../tsumugi/.devcontainer .devcontainer
code .  # Opens in container instance 2
```

Each container runs independently with its own:

- Dev server (port 3000 + offset)
- Dependencies (bun install per worktree)
- Git state (different branch checked out)

## References

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Project Git Workflow](.claude/rules/git-workflow.md)
