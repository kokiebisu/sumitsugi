# SessionStart Hook

This hook runs automatically when a new Claude Code session starts (especially on the web).
It ensures the environment is ready for development.

## Steps

1. Install dependencies
2. Verify environment
3. Load project context

---

Run the following commands to set up the development environment:

```bash
# Install dependencies (frozen lockfile for reproducibility)
bun install --frozen-lockfile

# Ensure git hooks are configured
git config core.hooksPath .githooks || true

# Source environment variables if available
if [ -f .env.local ]; then
  source .env.local
fi

# Verify critical tools
bun --version
node --version

# Quick sanity check - TypeScript compiles
bun run build --no-lint 2>/dev/null || echo "Build check skipped (expected in fresh session)"
```

After setup, read these files for context:
- `CLAUDE.md` (project instructions)
- `.claude/PROJECT.md` (concept and design)
- `DASHBOARD.md` (current status and priorities)
- `docs/CODEMAPS/overview.md` (codebase map)

Check for active tasks:
```bash
bd ready 2>/dev/null || echo "No Beads tasks ready"
```
