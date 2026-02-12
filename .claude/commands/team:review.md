---
description: Agent Teams parallel code review. Spawns specialized reviewers for thorough concurrent review. CLI only.
allowed-tools: Bash, Read, Grep, Glob, Task
---

# /team:review - Agent Teams Parallel Code Review

Spawn an agent team of specialized code reviewers for thorough parallel review.

**Arguments:** `$ARGUMENTS` (PR number(s) or branch name, e.g. `#142`, `feat/auth-flow`)

## Prerequisites

- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set
- Interactive CLI session

## When to Use

- After `/team:dev` completes, before merging
- For large PRs (>300 lines) that warrant multi-angle review
- For security-sensitive changes (auth, payment, user data)
- Before major releases
- When you want deeper review than a single code review agent provides

## Phase 1: Target Identification

Parse `$ARGUMENTS` to determine review target:

```bash
# For PR number
gh pr view {n} --json files,additions,deletions,title,body,headRefName

# For branch
git diff main...{branch} --stat
git log main...{branch} --oneline
```

Print summary: files changed, lines added/deleted, scope assessment.

## Phase 2: Spawn Review Team

Create an agent team with 4 specialized reviewers. Use **delegate mode**.

Instruct Claude to create the team:

```
Create an agent team to review PR #{n} (or branch {name}).
Spawn 4 specialized reviewers. Use delegate mode -- synthesize only.

Reviewers:

1. Teammate "security-reviewer":
   Focus EXCLUSIVELY on security implications.
   Checklist:
   - Hardcoded secrets, API keys, tokens
   - SQL injection, NoSQL injection
   - XSS (Cross-Site Scripting)
   - CSRF (Cross-Site Request Forgery)
   - Auth bypasses, privilege escalation
   - Input validation at system boundaries
   - Path traversal, file inclusion
   - Sensitive data in error messages or logs
   - Dependency vulnerabilities
   Severity: CRITICAL / HIGH / MEDIUM / LOW for each finding.

2. Teammate "quality-reviewer":
   Focus on code quality and maintainability.
   Checklist:
   - Function size (<50 lines)
   - File size (<800 lines, typical 200-400)
   - Nesting depth (<4 levels)
   - Immutability (spread operator, no mutations)
   - Error handling (descriptive messages, proper catch)
   - Naming conventions (clear, consistent)
   - No console.log in committed code
   - No hardcoded values (use env vars/config)
   - No emojis in code
   - Import organization
   - Dead code, unused variables

3. Teammate "test-reviewer":
   Focus on test coverage and quality.
   Checklist:
   - New code has corresponding tests
   - TDD appears to have been followed
   - Edge cases covered (null, empty, boundary)
   - Test naming is descriptive
   - Assertions are meaningful (not just "doesn't throw")
   - No flaky patterns (timing, network, random)
   - Integration tests for cross-component behavior
   - E2E tests for user-facing features
   Run: `bun run test:run` to verify all tests pass.
   Check coverage: are there gaps in the changed files?

4. Teammate "perf-reviewer":
   Focus on performance implications.
   Checklist:
   - O(n^2) or worse algorithms where O(n log n) is possible
   - Unnecessary re-renders in React components
   - Missing memoization (useMemo, useCallback where needed)
   - Bundle size impact (large imports, tree-shaking)
   - N+1 query patterns
   - Caching opportunities
   - Lazy loading candidates
   - Image optimization
   - Unnecessary network requests

Each reviewer: read the PR diff, examine changed files in full,
and report findings with file:line references.

After individual review, share findings with each other.
Security reviewer should challenge any finding that might have
security implications. Test reviewer should note if security
findings need test coverage.
```

## Phase 3: Cross-Review

After individual reviews, the lead facilitates cross-pollination:

- Security findings that need tests -> test-reviewer acknowledges
- Performance patterns that affect quality -> quality-reviewer notes
- Quality issues that could cause bugs -> test-reviewer flags gap

## Phase 4: Review Synthesis

The lead synthesizes all findings into a unified report:

```markdown
## Code Review Report: PR #{n}

**Branch:** {branch}
**Files changed:** {count}
**Lines:** +{added} / -{removed}

### Verdict: [APPROVE / REQUEST CHANGES / BLOCK]

### Critical Issues (must fix before merge)

- [{reviewer}] {file}:{line} - {description}

### High Issues (should fix before merge)

- [{reviewer}] {file}:{line} - {description}

### Medium Issues (fix soon, can merge)

- [{reviewer}] {file}:{line} - {description}

### Low Issues (suggestions for improvement)

- [{reviewer}] {file}:{line} - {description}

### Cross-Review Insights

[Where multiple reviewers identified related concerns]

### Summary by Reviewer

- **Security:** {pass/fail} - {one-line summary}
- **Quality:** {pass/fail} - {one-line summary}
- **Tests:** {pass/fail} - {one-line summary}
- **Performance:** {pass/fail} - {one-line summary}
```

## Phase 5: Action

Based on verdict:

- **APPROVE**: No critical/high issues.

  ```bash
  gh pr review {n} --approve --body "Reviewed by Agent Team (4 specialists). No blocking issues found."
  ```

- **REQUEST CHANGES**: High issues found.

  ```bash
  gh pr review {n} --request-changes --body "{synthesized findings}"
  ```

  Post individual comments on specific lines:

  ```bash
  gh api repos/{owner}/{repo}/pulls/{n}/comments -f body="{finding}" -f path="{file}" -f line={line} -f side="RIGHT" -f commit_id="{sha}"
  ```

- **BLOCK**: Critical security or correctness issues.
  ```bash
  gh pr review {n} --request-changes --body "BLOCKED: Critical issues found. {details}"
  ```

## Phase 6: Cleanup

Dismiss the team after review is complete.

## Review Standards Reference

These are sumitsugi-specific standards (from `.claude/rules/standards.md`):

- Immutability: ALWAYS `{...obj, key: val}`, NEVER mutate
- Small files: 200-400 lines typical, 800 max
- Small functions: <50 lines, no deep nesting (>4 levels)
- Input validation: Zod schemas at system boundaries
- No console.log, no hardcoded secrets
- Test coverage minimum: 80%
