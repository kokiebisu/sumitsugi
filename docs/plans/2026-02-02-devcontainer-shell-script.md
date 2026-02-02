# Devcontainer Shell Script Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `./dev` shell script that makes it easy to open the devcontainer from the terminal with a single command.

**Architecture:** Bash script that handles devcontainer CLI installation, container startup, and shell access. Includes smart detection for already-running containers and nested shell prevention.

**Tech Stack:** Bash, @devcontainers/cli, npm

---

## Task 1: Create Shell Script

**Files:**

- Create: `dev` (project root)

**Step 1: Create the shell script file**

Create `dev` with the following content:

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

**Step 2: Make script executable**

Run: `chmod +x dev`

Expected: File becomes executable (no output)

**Step 3: Verify script exists and is executable**

Run: `ls -la dev`

Expected: Output shows `-rwxr-xr-x` permissions

**Step 4: Commit the shell script**

```bash
git add dev
git commit -m "feat: add devcontainer shell script

Add ./dev script to easily open devcontainer from terminal.
Auto-installs CLI if needed, starts container, opens shell.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add npm Script Alias

**Files:**

- Modify: `package.json` (scripts section)

**Step 1: Add shell script to package.json**

Add this to the `scripts` section in `package.json`:

```json
"shell": "./dev"
```

The scripts section should look like:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "shell": "./dev",
  ...
}
```

**Step 2: Test the npm script alias**

Run: `npm run shell --help` (if this errors with "command not found", that's expected - we're just verifying npm recognizes the script)

Expected: npm should recognize the script (may show usage or try to run it)

**Step 3: Commit the package.json change**

```bash
git add package.json
git commit -m "feat: add npm script alias for devcontainer shell

Add 'npm run shell' as alias for './dev' script.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update CLAUDE.md Documentation

**Files:**

- Modify: `CLAUDE.md` (Commands section, line ~24-40)

**Step 1: Add command to CLAUDE.md**

In the Commands section after line 30 (after `npm run lint`), add:

```markdown
./dev # Open devcontainer shell (auto-installs CLI if needed)
```

The Commands section should look like:

````markdown
## Commands

```bash
npm run dev              # 開発サーバー起動 (localhost:3000)
npm run build            # プロダクションビルド
npm run start            # プロダクションサーバー起動
npm run lint             # ESLintでコードチェック
./dev                    # Open devcontainer shell (auto-installs CLI if needed)

# Git Worktrees (with devcontainer support)
...
```
````

````

**Step 2: Verify the documentation update**

Run: `grep -n "./dev" CLAUDE.md`

Expected: Shows the line number where `./dev` appears in CLAUDE.md

**Step 3: Commit the documentation update**

```bash
git add CLAUDE.md
git commit -m "docs: add ./dev command to CLAUDE.md

Document new devcontainer shell script in Commands section.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
````

---

## Task 4: Update README (Optional Quick Start)

**Files:**

- Modify: `README.md` (add Quick Start section near top)

**Step 1: Read current README structure**

Run: `head -30 README.md`

Expected: See current README structure to determine best placement

**Step 2: Add Quick Start section**

Add a "Quick Start" section after the project description (around line 10-15):

```markdown
## Quick Start

1. Clone the repo
2. Run `./dev` to enter devcontainer
3. Inside container: `npm run dev`
4. Open http://localhost:3000
```

**Step 3: Verify README update**

Run: `grep -A 4 "Quick Start" README.md`

Expected: Shows the Quick Start section

**Step 4: Commit README update**

```bash
git add README.md
git commit -m "docs: add Quick Start section to README

Add quick start instructions using ./dev script.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Files Created:**

- `dev` - Shell script for entering devcontainer

**Files Modified:**

- `package.json` - Added `shell` script alias
- `CLAUDE.md` - Documented `./dev` command
- `README.md` - Added Quick Start section (optional)

**Result:**
Users can now run `./dev` from project root to instantly enter the devcontainer, with automatic CLI installation if needed.

**Testing:**
The script can be fully tested by:

1. Exiting devcontainer if currently inside
2. Running `./dev` from host machine
3. Verifying it starts container and opens shell

**Note:** Since we're implementing this inside a worktree within a devcontainer, we cannot fully test the script in this environment. The script is designed to run from the host machine.
