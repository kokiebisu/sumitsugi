# Auto-Start Claude Code Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically start Claude Code when entering devcontainer via `./dev` script

**Architecture:** Modify the `dev` script to execute Claude Code in interactive mode upon entering the container, then drop to bash when user exits Claude

**Tech Stack:** Bash, devcontainer CLI, Claude Code CLI

**Dependencies:** Requires PR #115 (base `./dev` script) to be merged first

---

## Task 1: Modify dev Script for Claude Auto-Start

**Files:**
- Modify: `dev` (lines 31-35)

**Step 1: Read current dev script**

Read the `dev` file to see current implementation.

Expected: Should see the devcontainer exec command around line 31-35.

**Step 2: Update the shell opening command**

Replace the devcontainer exec line with Claude auto-start:

```bash
# Current (lines 31-35)
echo "Opening shell..."
if ! devcontainer exec --workspace-folder . bash; then
  echo "Error: Failed to open shell in devcontainer." >&2
  exit 1
fi

# New
echo "Opening shell with Claude Code..."
if ! devcontainer exec --workspace-folder . bash -c "claude; exec bash"; then
  echo "Error: Failed to open shell in devcontainer." >&2
  exit 1
fi
```

**What this does:**
- `bash -c "claude; exec bash"` runs Claude first
- Semicolon (`;`) continues to next command when Claude exits
- `exec bash` replaces shell process with bash (no nesting)
- User exits Claude → drops to bash prompt

**Step 3: Verify the change**

Run: `cat dev | grep -A 2 "Opening shell"`

Expected: Shows updated message and command

**Step 4: Test shell script syntax**

Run: `bash -n dev`

Expected: No output (syntax valid)

**Step 5: Commit the change**

```bash
git add dev
git commit -m "feat: auto-start Claude Code in devcontainer

Modify ./dev script to automatically launch Claude Code when entering
devcontainer. When user exits Claude (Ctrl+D or /exit), drops to bash shell.

- Change exec command from plain bash to 'bash -c \"claude; exec bash\"'
- Update message to 'Opening shell with Claude Code...'
- User workflow: ./dev → Claude starts → exit Claude → bash prompt

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md` (line 31, Commands section)

**Step 1: Read current CLAUDE.md**

Find the `./dev` command documentation (around line 31).

Expected: Should say "Open devcontainer shell (auto-installs CLI if needed)"

**Step 2: Update the ./dev description**

Change the description to mention Claude auto-start:

```markdown
# Current
./dev                    # Open devcontainer shell (auto-installs CLI if needed)

# New
./dev                    # Open devcontainer with Claude Code (auto-starts)
```

**Step 3: Verify the change**

Run: `grep -n "./dev" CLAUDE.md`

Expected: Shows line number with updated description

**Step 4: Commit the change**

```bash
git add CLAUDE.md
git commit -m "docs: update ./dev description for Claude auto-start

Update CLAUDE.md to reflect that ./dev now auto-starts Claude Code.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update README Quick Start

**Files:**
- Modify: `README.md` (Quick Start section, line ~19)

**Step 1: Read current README Quick Start**

Find the Quick Start section (around line 17-22).

Expected: Should show 4 steps with `./dev` in step 2

**Step 2: Update step 2 to mention Claude**

Change step 2 to indicate Claude starts automatically:

```markdown
# Current
2. Run `./dev` to enter devcontainer

# New
2. Run `./dev` (Claude Code starts automatically)
```

**Step 3: Verify the change**

Run: `grep -A 4 "Quick Start" README.md`

Expected: Shows updated step 2

**Step 4: Commit the change**

```bash
git add README.md
git commit -m "docs: update README to mention Claude auto-start

Update Quick Start step 2 to indicate Claude Code starts automatically
when running ./dev.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Files Modified:**
- `dev` - Modified shell opening command to auto-start Claude
- `CLAUDE.md` - Updated `./dev` command description
- `README.md` - Updated Quick Start step 2

**Result:**
Users run `./dev` and immediately enter Claude Code. When they exit Claude (Ctrl+D or `/exit`), they drop to a bash shell where they can continue working or type `claude` to restart.

**User Workflow:**
```bash
# Host machine
./dev

# Claude starts automatically
# User works with Claude
# User exits Claude (/exit or Ctrl+D)

# Now at bash prompt in devcontainer
node@container:/workspaces/tsumugi$
```

**Testing:**
Since the `dev` script runs on the host machine (not inside devcontainer), full testing requires:
1. Exit devcontainer if currently inside
2. Run `./dev` from host
3. Verify Claude starts automatically
4. Exit Claude (Ctrl+D or `/exit`)
5. Verify bash prompt appears
6. Type `claude` to verify can restart manually
7. Type `exit` to return to host

**Notes:**
- This implementation assumes PR #115 has been merged
- Claude Code is already installed in devcontainer via `postCreateCommand`
- If Claude isn't installed, user sees error but still gets bash shell
- Each terminal running `./dev` gets its own Claude instance
