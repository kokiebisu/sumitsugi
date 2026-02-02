# Devcontainer Shell Script Design

**Date:** 2026-02-02
**Purpose:** Make it easier to open devcontainer from terminal with a simple `./dev` command

## Problem

Users want to quickly enter the devcontainer shell when opening a new terminal in the project root, without needing to remember complex devcontainer CLI commands.

## Solution

Create a `./dev` shell script at project root that handles devcontainer CLI installation, container startup, and shell access with a single command.

## Core Design

### What the script does:

1. Checks if devcontainer CLI is installed (`@devcontainers/cli`)
2. If missing, offers to install it automatically via npm
3. Checks if the devcontainer is already running
4. If not running, starts it with `devcontainer up --workspace-folder .`
5. Opens an interactive bash shell with `devcontainer exec --workspace-folder . bash`

### Smart detection:

- If already inside the devcontainer, it tells you instead of nesting shells
- Detects this by checking for the `REMOTE_CONTAINERS` environment variable

### File location:

```
/workspaces/tsumugi/dev    # Executable script at project root
```

### Basic usage:

```bash
# From project root
./dev              # Start container (if needed) and open shell
```

## Error Handling & Edge Cases

### Installation prompt:

When devcontainer CLI is missing, the script will:

- Display a clear message: "devcontainer CLI not found"
- Ask: "Install it now? (y/n)"
- If yes: Run `npm install -g @devcontainers/cli` and continue
- If no: Exit with instructions to install manually

### Already in container:

- Check if `$REMOTE_CONTAINERS` or `$CODESPACES` environment variables exist
- If yes: Print "Already in devcontainer!" and exit cleanly (no error)
- Prevents confusing nested shell situations

### Container startup failures:

- If `devcontainer up` fails, show the error output
- Exit with non-zero code so user knows something went wrong
- Common causes: Docker not running, permission issues

### Workspace detection:

- Script assumes it's run from project root
- Uses `--workspace-folder .` to point to current directory
- If run from elsewhere, devcontainer CLI will error (we let it fail naturally)

### Graceful exit:

- When you exit the shell (Ctrl+D or `exit`), returns to host terminal normally
- Container keeps running for faster re-entry

## Implementation

### Script structure:

```bash
#!/usr/bin/env bash
set -e  # Exit on error

# 1. Check if already in container
if [ -n "$REMOTE_CONTAINERS" ] || [ -n "$CODESPACES" ]; then
  echo "✓ Already in devcontainer!"
  exit 0
fi

# 2. Check/install devcontainer CLI
if ! command -v devcontainer &> /dev/null; then
  echo "devcontainer CLI not found."
  read -p "Install it now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install -g @devcontainers/cli
  else
    echo "Install manually: npm install -g @devcontainers/cli"
    exit 1
  fi
fi

# 3. Start container if needed (idempotent)
echo "Starting devcontainer..."
devcontainer up --workspace-folder .

# 4. Open shell
echo "Opening shell..."
devcontainer exec --workspace-folder . bash
```

### File permissions:

- Make executable: `chmod +x dev`
- Commit as executable to git

### Git integration:

- Add `dev` to git (not `.gitignore`)
- This script is part of the project's DX, should be shared with team

## Documentation Updates

### Update CLAUDE.md:

Add to the "Commands" section:

```markdown
./dev # Open devcontainer shell (auto-installs CLI if needed)
```

### Optional: Add npm script alias:

For users who prefer `npm run` commands, add to `package.json`:

```json
"scripts": {
  "shell": "./dev"
}
```

This way both `./dev` and `npm run shell` work.

### Setup instructions (none needed!):

- Script is executable and committed to repo
- First run auto-installs devcontainer CLI if missing
- No manual setup required for new contributors

### Documentation in README (optional):

Could add a "Quick Start" section:

```markdown
## Quick Start

1. Clone the repo
2. Run `./dev` to enter devcontainer
3. Inside container: `npm run dev`
```

## Files to Create/Modify

1. **Create:** `dev` (executable shell script)
2. **Update:** `CLAUDE.md` (add command to Commands section)
3. **Optional:** `package.json` (add shell script alias)
4. **Optional:** `README.md` (add Quick Start section)

## Result

New contributors clone the repo, run `./dev`, and they're immediately in the correct development environment. Single command, zero configuration.

## Trade-offs

**Chosen Approach:** Shell script over npm script

- **Pro:** Shortest command (`./dev` vs `npm run shell`)
- **Pro:** Auto-installs dependencies
- **Pro:** Can provide richer feedback and error handling
- **Con:** Adds new file to repo
- **Con:** Requires executable permissions

**Decision:** The DX benefits (shortest command, auto-install) outweigh the minor con of adding one more file.
