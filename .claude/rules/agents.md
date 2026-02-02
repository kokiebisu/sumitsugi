# Agent Orchestration

## Available Agents

Located in `~/.claude/agents/`:

| Agent                | Purpose                 | When to Use                   |
| -------------------- | ----------------------- | ----------------------------- |
| planner              | Implementation planning | Complex features, refactoring |
| architect            | System design           | Architectural decisions       |
| tdd-guide            | Test-driven development | New features, bug fixes       |
| code-reviewer        | Code review             | After writing code            |
| security-reviewer    | Security analysis       | Before commits                |
| build-error-resolver | Fix build errors        | When build fails              |
| e2e-runner           | E2E testing             | Critical user flows           |
| refactor-cleaner     | Dead code cleanup       | Code maintenance              |
| doc-updater          | Documentation           | Updating docs                 |

## Automatic Agent Invocation (CRITICAL)

Claude MUST automatically invoke these agents based on task context. NO user prompt needed:

### Planning Agents

**Use EnterPlanMode or planner agent when:**

- New feature implementation with multiple approaches
- Architectural decisions required
- Multi-file changes (3+ files)
- Unclear requirements needing exploration
- User asks to "add", "implement", "build" something non-trivial

**Example triggers:** "add dark mode", "implement auth", "refactor the checkout flow"

### TDD Agent

**Use tdd-guide agent or tdd-workflow skill when:**

- Implementing new features
- Adding new functions/components
- Fixing bugs (write test first)
- Refactoring existing code
- Building business logic

**Example triggers:** "add a function to calculate X", "fix the bug in Y", "implement feature Z"

### Code Review Agent

**Use code-reviewer agent IMMEDIATELY after:**

- Writing new code
- Modifying existing code
- Completing implementation
- Before committing changes

**This is MANDATORY - always review code you write**

### E2E Testing Agent

**Use e2e skill or e2e-runner agent when:**

- Implementing user-facing features (new pages, forms, user flows)
- Adding interactive UI components (modals, dropdowns, wizards)
- Modifying critical user journeys (auth, checkout, booking, payment)
- Creating features with multi-step processes
- After completing feature implementation (before committing)

**Example triggers:** "add payment flow", "implement booking wizard", "create user dashboard"

**This is PROACTIVE - set up E2E tests as part of feature development, not after**

### Other Agents

- **architect** - System design, scalability decisions
- **security-reviewer** - Authentication, user input, sensitive data
- **build-error-resolver** - When build fails

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution

Launch 3 agents in parallel:

1. Agent 1: Security analysis of auth.ts
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utils.ts

# BAD: Sequential when unnecessary

First agent 1, then agent 2, then agent 3
```

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:

- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
