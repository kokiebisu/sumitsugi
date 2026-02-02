# Auto-Start Claude Code in Devcontainer Design

**Date:** 2026-02-02
**Purpose:** Automatically start Claude Code when entering devcontainer via `./dev` script

## Problem

Users run `./dev` to enter the devcontainer, then manually type `claude` to start Claude Code. This adds an extra step to a common workflow. We want Claude to start automatically for immediate productivity.

## Solution

Modify the `./dev` script to automatically launch Claude Code in interactive mode after entering the devcontainer. When the user exits Claude, drop to bash shell for continued work.

## User Workflow

```bash
# On host machine
cd /workspaces/tsumugi
./dev

# Output:
# Starting devcontainer...
# Opening shell with Claude Code...
# [Claude Code starts automatically]

# User works with Claude
# When done: /exit or Ctrl+D

# Drops to bash prompt in devcontainer
node@container:/workspaces/tsumugi$
```

## Design Decisions

### Behavior: Interactive Mode with Bash Fallback

**What happens:**

1. Enter devcontainer at main repo root (`/workspaces/tsumugi`)
2. Claude Code starts automatically in interactive mode
3. User works with Claude (chat, coding, worktree creation)
4. When user exits Claude → drops to bash shell
5. User can continue working or type `claude` to restart

**Why this design:**

- **Always start at main branch:** Clean starting point, user asks Claude to create worktrees as needed
- **Separate sessions:** Each terminal gets independent Claude instance (good for worktree isolation)
- **Bash fallback:** After exiting Claude, user has full shell access for manual work
- **No flags/prompts:** Always-on for simplicity (can add opt-out later if needed)

### Implementation Approach

**Key change to `dev` script (line ~31-35):**

```bash
# Current
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

**How it works:**

- `bash -c "claude; exec bash"` runs two commands
- `claude` starts Claude Code interactively
- Semicolon (`;`) means "run next command when first completes"
- `exec bash` replaces current shell with new bash session (clean, no nesting)

### Error Handling

**If Claude isn't installed:**

- Command fails with "command not found"
- Semicolon continues to bash anyway
- User sees error but gets shell
- Can troubleshoot or manually install

**If Claude crashes:**

- Same behavior - bash still starts
- User always gets a shell, never stuck

**Already in devcontainer:**

- Existing check prevents double-nesting
- Script exits with "[OK] Already in devcontainer!" message

### Worktree Integration

**Philosophy:** Start clean, create worktrees on-demand

1. User runs `./dev` from main repo
2. Claude starts at `/workspaces/tsumugi` (main branch)
3. User: "Create a worktree for feature X"
4. Claude uses `using-git-worktrees` skill
5. User continues working in that worktree or creates more

**Why not worktree-aware:**

- Simpler implementation
- User explicitly chooses when to create/use worktrees
- Claude handles worktree creation workflow
- Main branch is the natural starting point

### Multiple Terminal Sessions

When running `./dev` in multiple terminals:

- All connect to the SAME devcontainer instance
- Each gets a separate shell session
- Each starts its own Claude instance
- Sessions are independent (different conversations)

This is the desired behavior for:

- Working on multiple tasks simultaneously
- Keeping separate Claude contexts
- Terminal independence

## Files Modified

**Primary change:**

- `dev` - Lines 31-35: Add Claude auto-start to exec command

**Documentation updates:**

- `CLAUDE.md` - Update `./dev` description to mention Claude auto-start
- `README.md` - Update Quick Start step 2 to mention Claude starts automatically

## User Experience Benefits

1. **Immediate productivity:** Claude available instantly
2. **Natural workflow:** Talk to Claude → create worktrees → implement
3. **Flexibility:** Can exit Claude anytime for manual work
4. **Consistent:** Same experience every time
5. **Discoverable:** Users learn Claude is available right away

## Alternative Designs Considered

### 1. Opt-in flag (`./dev --claude`)

**Rejected:** Adds friction. Since Claude is the primary development tool, auto-start makes sense as default.

### 2. Interactive prompt ("Start Claude? y/n")

**Rejected:** Adds an extra step every time. Can add later if users request it.

### 3. Directory-aware (start in worktree)

**Rejected:** User prefers starting at main branch and creating worktrees on-demand through Claude.

### 4. Shared tmux session

**Rejected:** Doesn't work well with worktree isolation. Each terminal needs independent context.

## Future Enhancements

If needed later:

- Add `./dev --no-claude` flag to skip auto-start
- Add `./dev --help` to document behavior
- Consider `CLAUDE_AUTO_START=false` environment variable

## Testing

**Manual testing steps:**

1. Exit devcontainer if currently inside
2. Run `./dev` from host
3. Verify Claude starts automatically
4. Exit Claude (Ctrl+D or `/exit`)
5. Verify bash prompt appears
6. Type `claude` to verify can restart manually
7. Verify `exit` returns to host

**Expected behavior:**

- Claude starts immediately after container is ready
- Smooth transition from Claude to bash
- No errors or warnings
- Works from main repo root

## Implementation Priority

This is a quality-of-life improvement that significantly enhances developer experience. Recommended as a follow-up to PR #115 (basic `./dev` script).

**Dependencies:**

- Requires PR #115 to be merged (base `./dev` script)
- Requires Claude Code installed in devcontainer (already done via postCreateCommand)

## Trade-offs

**Pros:**

- Immediate access to Claude
- Reduces repetitive typing
- Encourages Claude usage
- Smooth development experience

**Cons:**

- Users who don't want Claude have to exit it (minor)
- Slightly longer startup time (Claude initialization)
- Always-on might surprise first-time users (easily exitable)

**Decision:** Pros significantly outweigh cons. Auto-start is the right default.
