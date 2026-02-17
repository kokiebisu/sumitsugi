# E2E Test Tag Filtering Design

**Date:** 2026-02-01
**Status:** Approved
**Author:** Claude Code (with user validation)

## Overview

Implement intelligent E2E test filtering for PRs using Playwright tags and Claude-powered test selection. This reduces PR test execution time from 10-15 minutes to 2-4 minutes while maintaining safety through always-on critical test coverage.

## Problem Statement

Currently, all E2E tests run on every PR regardless of what changed. This leads to:

- Long CI feedback loops (10-15 minutes)
- Wasted compute resources
- Slower development velocity
- Same wait time for small changes vs large changes

## Solution: Tagged Test Filtering with Claude Intelligence

### 1. Test Tagging Strategy

**Tag Categories:**

1. **Feature tags**: `@auth`, `@listing`, `@properties`, `@payment`, `@messaging`
   - Identifies which feature area the test covers
   - Multiple feature tags allowed if test spans features

2. **Priority tags**: `@critical`, `@smoke`, `@extended`
   - `@critical`: Core user journeys that must never break (auth, create listing, browse)
   - `@smoke`: Quick sanity checks (page loads, navigation)
   - `@extended`: Comprehensive tests for edge cases

3. **Special tags**: `@slow`, `@flaky`, `@quarantine`
   - `@slow`: Tests taking >30s (mark for parallel execution)
   - `@flaky`: Known flaky tests (run with retries)
   - `@quarantine`: Broken tests being fixed (skip in CI)

**Tag Combination Examples:**

```typescript
// Critical auth flow - runs on EVERY PR
test.describe('Login flow @auth @critical', () => {});

// Payment feature test - runs on payment PRs + main
test.describe('Checkout process @payment @critical', () => {});

// Extended listing test - runs on listing PRs + main, not every PR
test.describe('Draft listing recovery @listing @extended', () => {});

// Smoke test - quick check, runs everywhere
test.describe('Homepage loads @smoke', () => {});
```

**Default behavior:**

- All PRs: Run `@critical` + `@smoke` + matching feature tags
- Main branch: Run everything
- Estimated PR test time: 2-4 minutes instead of 10-15 minutes

### 2. Claude-Powered Tag Detection

Instead of static file mappings, Claude analyzes PR changes and intelligently determines which tests to run:

```yaml
# .github/workflows/e2e-tests.yml
jobs:
  determine-tests:
    runs-on: ubuntu-latest
    outputs:
      test-filter: ${{ steps.claude-analysis.outputs.filter }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Need full history for diff

      - name: Analyze PR changes with Claude
        id: claude-analysis
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Analyze the changes in this PR and determine which E2E test tags should run.

            Available tags:
            - @auth - Authentication and user management
            - @listing - Creating/managing listings
            - @properties - Browsing and viewing properties
            - @payment - Payment and checkout flows
            - @messaging - User messaging features

            ALWAYS include: @critical @smoke

            Output ONLY the grep filter string, example: "@critical or @smoke or @payment or @listing"

      - name: Set test filter output
        run: echo "filter=${{ steps.claude-analysis.outputs.result }}" >> $GITHUB_OUTPUT

  e2e-tests:
    needs: determine-tests
    runs-on: ubuntu-latest
    steps:
      # ... existing setup steps ...

      - name: Run E2E tests with smart filtering
        run: npm run test:e2e -- --grep "${{ needs.determine-tests.outputs.test-filter }}"
```

**Why Claude-powered is better:**

- Understands semantic relationships (e.g., auth changes affect listing creation)
- No maintenance of static mapping files
- Handles edge cases intelligently
- Can explain reasoning in PR comments
- Adapts as codebase evolves

**Override options:**

- PR label `e2e:full-suite`: Runs complete suite
- PR label `e2e:skip`: Skips E2E tests entirely (docs-only changes)
- PR label `e2e:critical-only`: Runs only @critical tests

**Fallback safety:**

- If Claude analysis fails → run `@critical` + `@smoke` (safe default)
- If API rate limited → run `@critical` + `@smoke`

### 3. Test Implementation & Migration

**Tagging Existing Tests:**

```typescript
// tests/e2e/auth/authentication.spec.ts
test.describe('Login flow @auth @critical', () => {
  // Core authentication - must always work
});

test.describe('Password recovery @auth @extended', () => {
  // Important but not critical path
});

// tests/e2e/listing/create-listing.spec.ts
test.describe('Create Listing - Step Navigation @listing @critical', () => {
  // Critical: Core listing creation flow
});

test.describe('Create Listing - Photo Upload @listing @extended', () => {
  // Extended: Photo upload edge cases
});

// tests/e2e/properties/browse-properties.spec.ts
test.describe('Browse properties @properties @critical @smoke', () => {
  // Triple tagged: critical path + smoke test
});

test.describe('Property filtering @properties @extended', () => {
  // Extended: Advanced filtering features
});
```

**Migration Strategy:**

1. **Phase 1**: Tag all existing tests (5 spec files, ~30 tests)
   - Review each test, assign appropriate tags
   - Start conservative: most tests get `@critical` initially

2. **Phase 2**: Optimize after data collection
   - Run for 1 week, collect metrics
   - Move less-critical tests from `@critical` to `@extended`
   - Identify true smoke tests (fast, high-value checks)

3. **Phase 3**: Add new feature tags as features develop
   - Payment feature → add `@payment` tags
   - Messaging feature → add `@messaging` tags

**Tag Guidelines for Developers:**

- New feature test? Tag with feature + priority
- Touches auth? Add `@auth` tag too
- Takes >30s? Add `@slow` tag
- Flaky test? Add `@flaky` + increase retries

### 4. Developer Workflow Integration

**TDD Workflow with Tagged Tests:**

```bash
# 1. Start feature work in worktree
npm run worktree:create feat/payment-flow

# 2. Write tagged test FIRST (TDD Red phase)
# tests/e2e/payment/checkout.spec.ts
test.describe('Payment checkout @payment @critical', () => {
  test('should process payment successfully', async ({ page }) => {
    // Test implementation
  })
})

# 3. Run only your feature tests locally (fast feedback)
npm run test:e2e -- --grep "@payment"

# 4. Implement feature (TDD Green phase)

# 5. Run critical tests to ensure nothing broke
npm run test:e2e -- --grep "@critical"

# 6. Commit and create PR
git commit -m "feat: add payment checkout flow"
gh pr create --title "Add payment checkout"

# 7. CI automatically runs: @critical + @smoke + @payment
# (Claude detected payment changes, added @payment tag)

# 8. After PR merged to main, full suite runs
```

**Local Development Commands:**

```json
{
  "test:e2e:critical": "playwright test --grep '@critical'",
  "test:e2e:smoke": "playwright test --grep '@smoke'",
  "test:e2e:feature": "playwright test --grep",
  "test:e2e:watch": "playwright test --grep '@critical' --ui"
}
```

**PR Feedback Loop:**

1. Push commit → CI runs in ~3 minutes (only relevant tests)
2. See results in PR comment with tag breakdown
3. Fix issues, push again → fast re-run
4. Much faster than 10-15 minute full suite

### 5. PR Reporting & Observability

**Enhanced PR Comments:**

```markdown
## 🎭 E2E Test Results

✅ **Status:** All tests passed!

### 🎯 Test Selection (Claude Analysis)

**Changed files:**

- `src/lib/payment/checkout.ts`
- `src/app/checkout/page.tsx`

**Tags selected:** `@critical @smoke @payment @listing`

**Reasoning:** Payment checkout changes detected. Also running @listing
tests because checkout flow depends on active listings.

### 📊 Test Breakdown

| Tag       | Tests Run | Passed    | Duration |
| --------- | --------- | --------- | -------- |
| @critical | 12        | ✅ 12     | 45s      |
| @smoke    | 5         | ✅ 5      | 12s      |
| @payment  | 8         | ✅ 8      | 38s      |
| @listing  | 3         | ✅ 3      | 15s      |
| **Total** | **28**    | **✅ 28** | **110s** |

💡 **Full suite (64 tests) will run when merged to main**

### 🌐 [View Full Report](https://kokiebisu.github.io/sumitsugi/e2e-reports/123)
```

**Metrics Dashboard:**

Track over time (stored in GitHub Pages):

- Average PR test time (goal: <5 minutes)
- Tag coverage per feature
- Flaky test detection
- Test execution trends

**Override Controls:**

- `e2e:full-suite` label - Run all tests (pre-release validation)
- `e2e:skip` label - Skip E2E entirely (docs-only PR)
- `e2e:critical-only` label - Run only @critical tests (quick check)

## Implementation Tasks

1. **Add test tags to existing E2E tests**
   - Tag 5 spec files (~30 tests)
   - Start with conservative @critical assignments

2. **Create Claude tag detection job**
   - Add `determine-tests` job to e2e-tests.yml
   - Configure Claude prompt for test selection
   - Handle output and fallbacks

3. **Update E2E workflow**
   - Accept test-filter input
   - Pass to Playwright via --grep
   - Maintain full suite on main branch

4. **Enhance PR reporting**
   - Show which tags ran and why
   - Display tag breakdown table
   - Include Claude's reasoning

5. **Add npm scripts**
   - test:e2e:critical
   - test:e2e:smoke
   - test:e2e:feature

6. **Update documentation**
   - Add tagging guide to CLAUDE.md
   - Document local development commands
   - Explain PR label overrides

## Success Metrics

- **PR test time**: 2-4 minutes (down from 10-15 minutes)
- **Critical coverage**: 100% of PRs run @critical + @smoke tests
- **Developer satisfaction**: Faster feedback loops
- **Test reliability**: No increase in bugs reaching production
- **False negatives**: <5% (tests that should have run but didn't)

## Risks & Mitigations

| Risk                   | Mitigation                                    |
| ---------------------- | --------------------------------------------- |
| Claude API failure     | Fallback to @critical + @smoke                |
| Wrong tags selected    | Always include @critical + @smoke as baseline |
| Tests become flaky     | Use @flaky tag + increased retries            |
| Tag sprawl             | Regular tag audits, consolidate when needed   |
| Developers forget tags | PR template reminder, CI warning if no tags   |

## Future Enhancements

- **Auto-quarantine**: Automatically tag consistently failing tests as @quarantine
- **Smart retries**: Increase retries only for @flaky tests
- **Parallel execution**: Run @slow tests in parallel across multiple workers
- **ML-based prediction**: Learn which tests catch bugs for specific file patterns
- **Test impact analysis**: Show which features are most tested/least tested

## Approval

✅ Design approved on 2026-02-01

Ready for implementation.
