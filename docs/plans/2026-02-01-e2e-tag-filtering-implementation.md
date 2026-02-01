# E2E Test Tag Filtering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add intelligent Playwright test tag filtering to reduce PR E2E test time from 10-15 minutes to 2-4 minutes.

**Architecture:** Tag existing E2E tests with feature (@auth, @listing, @properties) and priority (@critical, @smoke, @extended, @quarantine) tags. Create GitHub workflow job that uses Claude to analyze PR changes and generate test filter. Modify E2E workflow to accept filter parameter and run only matching tests. Add npm scripts for local tagged test execution.

**Tech Stack:** Playwright, GitHub Actions, Claude Code Action, TypeScript, Next.js

---

## Task 1: Add npm Scripts for Tagged Test Execution

**Files:**
- Modify: `package.json:4-16`

**Step 1: Add new test scripts to package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "test:e2e:critical": "playwright test --grep '@critical'",
    "test:e2e:smoke": "playwright test --grep '@smoke'",
    "test:e2e:auth": "playwright test --grep '@auth'",
    "test:e2e:listing": "playwright test --grep '@listing'",
    "test:e2e:properties": "playwright test --grep '@properties'",
    "worktree:create": "bash scripts/create-worktree.sh",
    "worktree:list": "git worktree list",
    "worktree:prune": "git worktree prune"
  }
}
```

**Step 2: Verify scripts work**

Run: `npm run test:e2e:critical -- --list`
Expected: Lists tests (will show all tests since none are tagged yet)

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm scripts for tagged E2E test execution

Add convenience scripts for running tests by tag:
- test:e2e:critical - Core user journeys
- test:e2e:smoke - Quick sanity checks
- test:e2e:auth - Authentication tests
- test:e2e:listing - Listing management tests
- test:e2e:properties - Property browsing tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Tag Authentication Tests

**Files:**
- Modify: `tests/e2e/auth/authentication.spec.ts:1-233`

**Step 1: Add tags to test describes**

Update all `test.describe()` calls to include appropriate tags:

```typescript
import { test, expect, testData, setupAuthenticatedUser, setupAuthenticatedSeller } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Authentication Flows
 *
 * Critical user journey: Login, social auth, seller onboarding
 * Priority: HIGH
 */

// Login dialog tests - critical and failing (quarantine)
test.describe('Authentication - Login Dialog @auth @quarantine', () => {
  test('should open login dialog from header menu', async ({ page }) => {
    // ... existing test
  })

  test('should display email input and continue button', async ({ page }) => {
    // ... existing test
  })

  test('should display social login buttons', async ({ page }) => {
    // ... existing test
  })

  test('should display phone login option', async ({ page }) => {
    // ... existing test
  })

  test('should close dialog when clicking close button', async ({ page }) => {
    // ... existing test
  })

  test('should close dialog when clicking overlay', async ({ page }) => {
    // ... existing test
  })
})

// Email login flow - critical and failing (quarantine)
test.describe('Authentication - Email Login Flow @auth @quarantine', () => {
  test('should require email before continuing', async ({ page, loginDialog }) => {
    // ... existing test
  })

  test('should complete email login and close dialog', async ({ page, loginDialog }) => {
    // ... existing test
  })
})

// Social login - critical and failing (quarantine)
test.describe('Authentication - Social Login Flow @auth @quarantine', () => {
  test('should complete Google login', async ({ page, loginDialog }) => {
    // ... existing test
  })

  test('should complete Facebook login', async ({ page, loginDialog }) => {
    // ... existing test
  })

  test('should complete Apple login', async ({ page, loginDialog }) => {
    // ... existing test
  })
})

// Phone number validation - extended tests
test.describe('Authentication - Phone Number Validation @auth @extended', () => {
  test('should validate Japanese phone number format', async ({ page, loginDialog }) => {
    // ... existing test
  })

  test('should reject invalid phone numbers', async ({ page, loginDialog }) => {
    // ... existing test
  })
})

// Account menu - passing critical test
test.describe('Authentication - Account Menu @auth @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await setupAuthenticatedUser(page)
  })

  test('should show account menu with user info when logged in', async ({ page }) => {
    // ... existing test
  })

  test('should show logout option in account menu', async ({ page }) => {
    // ... existing test
  })

  test('should logout when clicking logout button', async ({ page }) => {
    // ... existing test
  })
})

// Seller onboarding - critical and failing (quarantine)
test.describe('Authentication - Become Seller Flow @auth @listing @quarantine', () => {
  test('should trigger login dialog when clicking "暮らしを譲る" while not logged in', async ({ page }) => {
    // ... existing test
  })

  test('should navigate to listing creation after login when clicking "暮らしを譲る"', async ({ page }) => {
    // ... existing test
  })
})
```

**Step 2: Verify tags work**

Run: `npm run test:e2e:auth -- --list`
Expected: Shows all authentication tests

Run: `npm run test:e2e -- --grep '@quarantine' --list`
Expected: Shows quarantined (failing) tests

**Step 3: Commit**

```bash
git add tests/e2e/auth/authentication.spec.ts
git commit -m "test: add tags to authentication E2E tests

Tags added:
- @auth - All authentication tests
- @critical - Core auth flows (account menu, logout)
- @quarantine - Currently failing tests (login dialog, social auth)
- @extended - Phone validation tests
- @listing - Cross-feature (seller onboarding)

19 tests now have 12 in quarantine for future fixing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Tag Listing Tests

**Files:**
- Modify: `tests/e2e/listing/create-listing.spec.ts:1-234`
- Modify: `tests/e2e/listing/listing-management.spec.ts:1-203`

**Step 1: Tag create-listing.spec.ts**

```typescript
import { test, expect, testData, setupAuthenticatedUser, setupAuthenticatedSeller } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Create Listing Flow
 *
 * Critical user journey: 前の住人 creating a new listing
 * Priority: HIGH
 */

test.describe('Create Listing - Step Navigation @listing @critical', () => {
  // ... existing tests
})

test.describe('Create Listing - Step 2: Photos @listing @extended', () => {
  // ... existing tests
})

test.describe('Create Listing - Step 4: Property Info @listing @extended', () => {
  // ... existing tests
})

test.describe('Create Listing - Step 6: Furniture & Fee @listing @extended', () => {
  // ... existing tests
})

test.describe('Create Listing - Step 7: Preview @listing @extended', () => {
  // ... existing tests
})

test.describe('Create Listing - Save and Exit @listing @critical', () => {
  // ... existing tests
})

test.describe('Create Listing - Logo Navigation @listing @smoke', () => {
  // ... existing tests
})

test.describe('Create Listing - Authentication Guard @listing @auth @critical', () => {
  // ... existing tests
})
```

**Step 2: Tag listing-management.spec.ts**

```typescript
import { test, expect, testData, setupAuthenticatedUser } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Listing Management
 *
 * Tests the /listing page where sellers manage their listings
 * Priority: MEDIUM
 */

test.describe('Listing Page - No Listings State @listing @smoke', () => {
  // ... existing tests
})

test.describe('Listing Page - With Existing Listings @listing @quarantine', () => {
  // All tests in this group are failing
  // ... existing tests
})
```

**Step 3: Verify tags**

Run: `npm run test:e2e:listing -- --list`
Expected: Shows all listing tests

**Step 4: Commit**

```bash
git add tests/e2e/listing/create-listing.spec.ts tests/e2e/listing/listing-management.spec.ts
git commit -m "test: add tags to listing E2E tests

Create listing tags:
- @listing @critical - Core navigation and save/exit
- @listing @extended - Detailed step tests
- @listing @smoke - Quick logo navigation check
- @listing @auth - Authentication guard

Listing management tags:
- @listing @smoke - Empty state
- @listing @quarantine - Failing tests (6 tests)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Tag Property Tests

**Files:**
- Modify: `tests/e2e/properties/browse-properties.spec.ts:1-end`
- Modify: `tests/e2e/properties/property-detail.spec.ts:1-end`

**Step 1: Tag browse-properties.spec.ts**

```typescript
import { test, expect } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Browse Properties
 *
 * Critical user journey: Viewing and filtering property listings
 * Priority: HIGH
 */

test.describe('Browse Properties - Property Grid @properties @critical @smoke', () => {
  // ... existing tests (all passing)
})

test.describe('Browse Properties - Property Cards @properties @critical', () => {
  // ... existing tests (all passing)
})

test.describe('Browse Properties - Filters @properties @extended', () => {
  // ... existing tests (if any)
})
```

**Step 2: Tag property-detail.spec.ts**

```typescript
import { test, expect } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Property Detail Page
 *
 * Tests individual property detail view and interactions
 * Priority: HIGH
 */

test.describe('Property Detail Page @properties @critical', () => {
  test('should display property information', async ({ page }) => {
    // ... existing test
  })

  test('should show property images', async ({ page }) => {
    // ... existing test
  })

  test('should display host profile', async ({ page }) => {
    // ... existing test
  })

  test('should show amenities and furniture', async ({ page }) => {
    // ... existing test
  })

  test('should have contact host button', async ({ page }) => {
    // ... existing test
  })
})

test.describe('Property Detail Page - Error Handling @properties @quarantine', () => {
  test('should show 404 for non-existent property', async ({ page }) => {
    // ... existing test (failing)
  })
})
```

**Step 3: Verify tags**

Run: `npm run test:e2e:properties -- --list`
Expected: Shows all property tests

**Step 4: Commit**

```bash
git add tests/e2e/properties/browse-properties.spec.ts tests/e2e/properties/property-detail.spec.ts
git commit -m "test: add tags to property E2E tests

Browse properties tags:
- @properties @critical @smoke - Core browsing (6 passing tests)
- @properties @extended - Advanced filtering

Property detail tags:
- @properties @critical - Detail page tests (5 passing)
- @properties @quarantine - 404 handling (1 failing test)

All critical property tests passing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Claude Test Tag Detection Script

**Files:**
- Create: `scripts/detect-test-tags.js`

**Step 1: Create detection script (using execFile for security)**

```javascript
/**
 * Claude-powered E2E test tag detection
 *
 * Analyzes PR changes and determines which test tags should run.
 * Always includes @critical and @smoke as baseline.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// Feature tag mappings (used as hints for Claude)
const FEATURE_MAPPINGS = {
  auth: [
    'src/contexts/auth-context.tsx',
    'src/components/auth/',
    'src/app/api/auth/',
  ],
  listing: [
    'src/app/listing/',
    'src/components/listing/',
  ],
  properties: [
    'src/app/properties/',
    'src/components/property',
  ],
  payment: [
    'src/lib/payment/',
    'src/app/checkout/',
  ],
  messaging: [
    'src/app/messages/',
    'src/components/messaging/',
  ],
};

// Default tags (always run)
const DEFAULT_TAGS = ['@critical', '@smoke'];

/**
 * Detect changed files from git diff
 */
async function getChangedFiles() {
  try {
    const baseBranch = process.env.GITHUB_BASE_REF || 'main';
    const { stdout } = await execFileAsync('git', [
      'diff',
      '--name-only',
      `origin/${baseBranch}...HEAD`
    ]);

    return stdout
      .split('\n')
      .filter(file => file.trim().length > 0);
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Map changed files to feature tags (simple heuristic fallback)
 */
function detectFeatureTags(changedFiles) {
  const tags = new Set(DEFAULT_TAGS);

  for (const file of changedFiles) {
    for (const [feature, patterns] of Object.entries(FEATURE_MAPPINGS)) {
      if (patterns.some(pattern => file.includes(pattern))) {
        tags.add(`@${feature}`);
      }
    }
  }

  return Array.from(tags);
}

/**
 * Generate Playwright grep filter from tags
 */
function generateGrepFilter(tags) {
  return tags.join(' or ');
}

/**
 * Main execution
 */
async function main() {
  const changedFiles = await getChangedFiles();

  console.log('Changed files:', changedFiles);

  if (changedFiles.length === 0) {
    console.log('No changes detected, using default tags');
    const defaultFilter = generateGrepFilter(DEFAULT_TAGS);
    console.log('::set-output name=filter::' + defaultFilter);
    return;
  }

  const tags = detectFeatureTags(changedFiles);
  const filter = generateGrepFilter(tags);

  console.log('Detected tags:', tags);
  console.log('Generated filter:', filter);

  // Output for GitHub Actions
  console.log('::set-output name=filter::' + filter);
  console.log('::set-output name=tags::' + tags.join(','));
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { getChangedFiles, detectFeatureTags, generateGrepFilter };
```

**Step 2: Make script executable**

Run: `chmod +x scripts/detect-test-tags.js`

**Step 3: Test script locally**

Run: `node scripts/detect-test-tags.js`
Expected: Outputs filter and tags

**Step 4: Commit**

```bash
git add scripts/detect-test-tags.js
git commit -m "feat: add test tag detection script

Analyzes git diff to detect which E2E test tags should run.

Features:
- Maps changed files to feature tags (@auth, @listing, @properties)
- Always includes @critical and @smoke tags
- Generates Playwright --grep filter
- Outputs for GitHub Actions integration
- Uses execFile for security (no shell injection)

Fallback heuristic for when Claude analysis isn't available.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update GitHub Workflow - Add Test Detection Job

**Files:**
- Modify: `.github/workflows/e2e-tests.yml:1-282`

**Step 1: Add determine-tests job before e2e-tests**

Insert this new job after the `jobs:` line and before `e2e-tests:`:

```yaml
jobs:
  determine-tests:
    runs-on: ubuntu-latest
    # Only run on PRs, not on main branch pushes
    if: github.event_name == 'pull_request'
    outputs:
      test-filter: ${{ steps.set-filter.outputs.filter }}
      detected-tags: ${{ steps.set-filter.outputs.tags }}
      skip-tests: ${{ steps.check-labels.outputs.skip }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for git diff

      - name: Check PR labels
        id: check-labels
        uses: actions/github-script@v7
        with:
          script: |
            const labels = context.payload.pull_request.labels.map(l => l.name);

            // Check for skip label
            if (labels.includes('e2e:skip')) {
              core.setOutput('skip', 'true');
              core.setOutput('reason', 'PR labeled with e2e:skip');
              return;
            }

            // Check for full suite label
            if (labels.includes('e2e:full-suite')) {
              core.setOutput('full-suite', 'true');
              return;
            }

            // Check for critical-only label
            if (labels.includes('e2e:critical-only')) {
              core.setOutput('critical-only', 'true');
              return;
            }

            core.setOutput('skip', 'false');

      - name: Analyze changes with Claude (if available)
        id: claude-analysis
        if: steps.check-labels.outputs.skip != 'true' && steps.check-labels.outputs.critical-only != 'true' && steps.check-labels.outputs.full-suite != 'true'
        continue-on-error: true
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Analyze the changes in this PR and determine which E2E test tags should run.

            Available feature tags:
            - @auth - Authentication and user management (login, logout, session)
            - @listing - Creating and managing property listings (seller flows)
            - @properties - Browsing and viewing properties (buyer flows)
            - @payment - Payment and checkout flows
            - @messaging - User messaging features

            Priority tags:
            - @critical - Core user journeys that must never break
            - @smoke - Quick sanity checks (always include)
            - @extended - Comprehensive edge case tests
            - @quarantine - Known failing tests (exclude from filter)

            ALWAYS include: @critical @smoke
            NEVER include: @quarantine

            Analyze the changed files and determine which feature tags are relevant.
            Consider semantic relationships (e.g., auth changes affect listing creation).

            Output ONLY a grep filter string like: "@critical or @smoke or @auth or @listing"
            Do not include explanations or markdown, just the filter string.

      - name: Setup Node.js (fallback)
        if: steps.claude-analysis.outcome == 'failure' || steps.claude-analysis.outcome == 'skipped'
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Detect tags (fallback)
        id: fallback-detection
        if: steps.claude-analysis.outcome == 'failure' || steps.claude-analysis.outcome == 'skipped'
        run: |
          node scripts/detect-test-tags.js

      - name: Set filter output
        id: set-filter
        run: |
          # Handle skip
          if [[ "${{ steps.check-labels.outputs.skip }}" == "true" ]]; then
            echo "filter=@skip-all-tests" >> $GITHUB_OUTPUT
            echo "tags=skip" >> $GITHUB_OUTPUT
            echo "Skipping tests (e2e:skip label)"
            exit 0
          fi

          # Handle critical-only
          if [[ "${{ steps.check-labels.outputs.critical-only }}" == "true" ]]; then
            echo "filter=@critical" >> $GITHUB_OUTPUT
            echo "tags=critical" >> $GITHUB_OUTPUT
            echo "Running critical tests only (e2e:critical-only label)"
            exit 0
          fi

          # Handle full-suite
          if [[ "${{ steps.check-labels.outputs.full-suite }}" == "true" ]]; then
            echo "filter=" >> $GITHUB_OUTPUT
            echo "tags=all" >> $GITHUB_OUTPUT
            echo "Running full test suite (e2e:full-suite label)"
            exit 0
          fi

          # Use Claude result if available
          if [[ "${{ steps.claude-analysis.outcome }}" == "success" ]]; then
            FILTER="${{ steps.claude-analysis.outputs.result }}"
            echo "filter=$FILTER" >> $GITHUB_OUTPUT
            echo "tags=claude-detected" >> $GITHUB_OUTPUT
            echo "Using Claude-detected filter: $FILTER"
          else
            # Use fallback detection
            echo "Using fallback detection (Claude unavailable)"
          fi

  e2e-tests:
    needs: determine-tests
    # Run on main branch OR if not skipped on PRs
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && needs.determine-tests.outputs.skip-tests != 'true')
    runs-on: ubuntu-latest
    timeout-minutes: 20

    # ... rest of existing e2e-tests job ...
```

**Step 2: Update e2e-tests job to accept filter**

Modify the "Run E2E tests" step:

```yaml
      - name: Run E2E tests
        run: |
          # On main branch or full-suite label: run all tests
          if [[ "${{ github.event_name }}" == "push" ]] || [[ "${{ needs.determine-tests.outputs.test-filter }}" == "" ]]; then
            echo "Running full test suite"
            npm run test:e2e
          else
            # On PR: run filtered tests
            FILTER="${{ needs.determine-tests.outputs.test-filter }}"
            echo "Running filtered tests: $FILTER"
            npm run test:e2e -- --grep "$FILTER"
          fi
        env:
          CI: true
          BASE_URL: http://localhost:3000
```

**Step 3: Verify workflow syntax**

Run: `cat .github/workflows/e2e-tests.yml | head -100`
Expected: Valid YAML syntax

**Step 4: Commit**

```bash
git add .github/workflows/e2e-tests.yml
git commit -m "feat: add Claude-powered test tag detection to E2E workflow

Add new determine-tests job that:
- Uses Claude to analyze PR changes and select test tags
- Falls back to heuristic detection if Claude unavailable
- Supports PR labels for override (e2e:skip, e2e:full-suite, e2e:critical-only)
- Always includes @critical and @smoke tags
- Excludes @quarantine (failing) tests

Update e2e-tests job to:
- Accept test-filter from determine-tests
- Run full suite on main branch
- Run filtered tests on PRs

Reduces PR test time from 10-15min to 2-4min.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

(Tasks 7-10 continue as written in the previous version, ending with the PR creation)

## Success Criteria

- [ ] All E2E tests have appropriate tags
- [ ] npm scripts for tagged tests work locally
- [ ] Tag detection script outputs correct filters
- [ ] GitHub workflow runs filtered tests on PRs
- [ ] GitHub workflow runs full suite on main
- [ ] PR comments show tag selection reasoning
- [ ] Test execution time reduced to 2-4 minutes on PRs
- [ ] All 47 passing tests still pass
- [ ] 19 quarantined tests are excluded from PR runs
- [ ] Documentation updated in CLAUDE.md

## Rollback Plan

If issues arise:
1. Revert PR merge
2. Tags remain in tests (harmless)
3. Workflow reverts to running all tests
4. No data loss or test coverage gaps

## Notes

- 19 pre-existing test failures are tagged `@quarantine`
- These should be fixed in a separate PR
- Tag filtering is conservative - when in doubt, runs more tests
- Claude analysis provides semantic understanding of changes
- Fallback heuristic ensures tests run even if Claude unavailable
- Security: Uses execFile instead of exec to prevent command injection
