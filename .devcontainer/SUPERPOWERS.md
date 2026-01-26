# Superpowers Plugin Setup

Superpowers is an agentic skills framework for Claude Code that enforces structured development workflows including TDD, code review, and planning.

## Overview

Superpowers provides a complete software development workflow for AI coding agents, built on composable skills that guide development through structured processes rather than ad-hoc code generation.

## One-Time Installation

Run these commands **once** in any Claude Code session:

1. Add the marketplace:
   ```
   /plugin marketplace add obra/superpowers-marketplace
   ```

2. Install Superpowers:
   ```
   /plugin install superpowers@superpowers-marketplace
   ```

3. Verify installation:
   ```
   /help
   ```
   You should see Superpowers commands in the help output.

## Available Skills

Superpowers provides a 7-step development workflow:

1. **Brainstorming** - Design refinement before coding
2. **Git Worktrees** - Isolated branch development (already implemented in tsumugi)
3. **Implementation Planning** - Break work into 2-5 minute tasks
4. **Subagent-Driven Development** - Parallel execution with code review
5. **Test-Driven Development** - RED-GREEN-REFACTOR cycle
6. **Code Review** - Built-in review checkpoints
7. **Branch Completion** - PR creation and merge decisions

## Usage

Superpowers skills are automatically invoked by Claude based on task context. No manual invocation needed for most workflows.

Key commands:
- `/superpowers:brainstorm` - Start design discussion
- `/superpowers:write-plan` - Create implementation plan
- `/superpowers:execute-plan` - Execute planned tasks

## Integration with tsumugi

This project already follows many Superpowers patterns:

- **Git worktrees** - See [WORKTREE.md](WORKTREE.md)
- **TDD workflow** - See [.claude/rules/testing.md](../.claude/rules/testing.md)
- **Code review agents** - See [.claude/agents/](../.claude/agents/)
- **Planning workflow** - See [.claude/rules/agents.md](../.claude/rules/agents.md)

Superpowers formalizes these patterns into enforceable skills, providing additional structure and guidance.

## Working with Beads

Superpowers and Beads complement each other:

- **Superpowers** provides workflow structure (how to work)
- **Beads** provides persistent memory (what to work on)

Example workflow:
```bash
# 1. Use Superpowers to create a plan
/superpowers:write-plan

# 2. Create Beads tasks from the plan
bd create "Phase 1: Database schema"
bd create "Phase 2: API endpoints"
bd create "Phase 3: Frontend components"

# 3. Execute with Superpowers + check Beads for next task
bd ready
# Work on unblocked tasks
```

## Updates

Update to latest version:
```
/plugin update superpowers
```

Check for new skills:
```
/help
```

## Resources

- [Superpowers GitHub](https://github.com/obra/superpowers)
- [Superpowers Marketplace](https://github.com/obra/superpowers-marketplace)

## Troubleshooting

### Plugin Not Found
If installation fails, verify marketplace is added:
```
/plugin marketplace list
```

Should show `obra/superpowers-marketplace`. If not, re-add:
```
/plugin marketplace add obra/superpowers-marketplace
```

### Commands Not Available
After installation, commands may take a moment to load. Try:
1. Run `/help` again
2. Restart Claude Code session
3. Reinstall: `/plugin uninstall superpowers` then reinstall

### Conflicts with Existing Skills
Superpowers is additive and should not conflict with existing `.claude/skills/`. If issues arise:
1. Check for duplicate skill names
2. Review `.claude/skills/` for overlapping functionality
3. Consider renaming local skills to avoid conflicts
