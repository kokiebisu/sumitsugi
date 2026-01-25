# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

Note: Attribution disabled globally via ~/.claude/settings.json.

## Pull Request Workflow

**Single Responsibility Principle (CRITICAL):**
- Each PR must address ONE specific concern only
- Do NOT combine unrelated changes (e.g., feature + docs update, bug fix + refactor)
- If changes are unrelated, create separate PRs
- Example: Stop tracking a file should not include documentation updates

**Auto-Merge Requirement (CRITICAL):**
- You MUST merge PRs automatically after creation using `gh pr merge <number> --squash --delete-branch`
- This is NOT optional - merge immediately after PR creation

**When to merge automatically:**
- Docs updates (README, CLAUDE.md, comments, etc.)
- Config changes (eslint, tsconfig, package.json, etc.)
- Bug fixes (small, non-breaking)
- Small features (non-breaking, tests pass)
- Refactoring (no behavior changes)
- Test additions
- Dependency updates

**Only wait for user approval when:**
- Breaking changes that affect existing APIs
- Major architectural decisions
- Large features spanning 10+ files
- Changes requiring user input on approach

**Default: MERGE IMMEDIATELY unless it clearly falls into the "wait" category**

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan with TODOs
5. Push with `-u` flag if new branch
6. Verify PR contains only related changes
7. **IMMEDIATELY merge PR with `gh pr merge <number> --squash --delete-branch`**
8. **Switch back to main and delete local branch:**
   ```bash
   git checkout main
   git pull origin main
   git branch -D <feature-branch-name>
   ```

## Feature Implementation Workflow

1. **Plan First** (Automatic)
   - Claude automatically uses **planner** agent for complex features
   - Identifies dependencies and risks
   - Breaks down into phases

2. **TDD Approach** (Automatic)
   - Claude automatically uses **tdd-guide** agent
   - Writes tests first (RED)
   - Implements to pass tests (GREEN)
   - Refactors (IMPROVE)
   - Verifies 80%+ coverage

3. **Code Review** (Automatic)
   - Claude automatically uses **code-reviewer** agent after writing code
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Detailed commit messages
   - Follow conventional commits format
