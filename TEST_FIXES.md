# E2E Test Debugging Summary

**Date:** 2026-01-25
**Total Failures:** 23/66 tests
**Pass Rate:** 65%

## Issue Categories

### 1. localStorage SecurityError (13 failures)

**Error:**

```
SecurityError: Failed to read the 'localStorage' property from 'Window':
Access is denied for this document.
```

**Root Cause:**
`clearLocalStorage()` is called BEFORE `page.goto()`, when the page is at `about:blank` which doesn't have localStorage access.

**Affected Files:**

- `tests/e2e/auth/authentication.spec.ts` (11 tests)
- `tests/e2e/listing/listing-management.spec.ts` (2 tests)

**Fix:**

```diff
// tests/e2e/fixtures/test-fixtures.ts
export async function clearLocalStorage(page: any) {
-  await page.evaluate(() => {
+  await page.evaluate(() => {
     localStorage.clear()
-  })
+  }).catch(() => {
+    // Ignore if localStorage is not accessible (e.g., about:blank)
+  })
}
```

**And update test files:**

```diff
// tests/e2e/auth/authentication.spec.ts
test.beforeEach(async ({ page }) => {
-  await clearLocalStorage(page)
   await page.goto('/')
+  await clearLocalStorage(page)
})
```

### 2. Authentication Guard Redirects (7 failures)

**Root Cause:**
Tests navigate to protected pages (`/listing/new`, `/listing`) BEFORE setting up authentication, causing redirects back to `/`.

**Evidence from error context:**
When navigating to `/listing/new`, page snapshot shows home page content (property listings by district), not the listing creation form.

**Affected Tests:**

- Create Listing navigation tests (3 failures)
- Listing management tests (2 failures)
- Property detail tests (2 failures)

**Fix:**

```diff
// tests/e2e/listing/create-listing.spec.ts
test.describe('Create Listing - Step Navigation', () => {
  test.beforeEach(async ({ page }) => {
-    await page.goto('/')
-    await setupAuthenticatedUser(page)
+    // Set auth state BEFORE navigating to protected route
+    await page.goto('/')
+    await setupAuthenticatedUser(page)
+    // No additional navigation needed - setupAuthenticatedUser reloads
  })

  test('should have next and back navigation buttons', async ({ newListingPage }) => {
-    await newListingPage.goto()
+    await newListingPage.goto()  // This should now work

    await expect(newListingPage.nextButton).toBeVisible()
    await expect(newListingPage.backButton).toBeVisible()
  })
})
```

**Alternative Fix (Better):**
Update `setupAuthenticatedUser` to NOT reload if already on the target page:

```typescript
// tests/e2e/fixtures/test-fixtures.ts
export async function setupAuthenticatedUser(
  page: any,
  user = testData.users.testUser
) {
  await page.evaluate((userData: typeof user) => {
    const mockUser = {
      id: 'test-user-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-1234-5678',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: false,
    };
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
  }, user);
  // Only reload if necessary - check current URL first
  const currentUrl = page.url();
  if (
    currentUrl.includes('about:blank') ||
    currentUrl === 'http://localhost:3000/'
  ) {
    await page.reload();
  }
}
```

### 3. Dev Server Not Running (Root Cause for All Failures)

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Root Cause:**
Port 3000 is not in use. Playwright's `webServer` config should auto-start the dev server, but it's failing in the devcontainer environment.

**Verification:**

```bash
$ ps aux | grep 'next\|node.*dev'  # No Next.js process
$ lsof -i :3000                     # Port 3000 not in use
```

**Fix Option 1: Manual Dev Server**

Start the dev server manually before running tests:

```bash
# Terminal 1
npm run dev

# Terminal 2 (wait for server to start)
npx playwright test
```

**Fix Option 2: Update Playwright Config**

```diff
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
-    reuseExistingServer: !process.env.CI,
+    reuseExistingServer: true,  // Always reuse in dev
    timeout: 120000,
+    stdout: 'pipe',  // Show server output
+    stderr: 'pipe',
  },
})
```

**Fix Option 3: Add Server Health Check**

```typescript
// tests/e2e/fixtures/test-fixtures.ts
export async function waitForServer(url: string, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not ready
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`);
}

// Use in test setup
test.beforeAll(async () => {
  await waitForServer('http://localhost:3000');
});
```

## Selector Issues (3 failures)

**Affected Tests:**

- Property detail: `getLayout()` returns null
- Listing management: empty state scrolling images

**Root Cause:**
Elements either don't exist or selectors don't match DOM structure.

**Debugging Steps:**

1. Check screenshots in `test-results/` directories
2. Review error-context.md files (page snapshots)
3. Update selectors to match actual DOM

**Example Fix:**

```typescript
// tests/e2e/pages/PropertyDetailPage.ts
async getLayout(): Promise<string | null> {
  // Current selector might not match
  const layoutElement = await this.page.locator('[data-testid="layout"]').textContent()
  return layoutElement
}
```

## Action Items

### Immediate (Fix Dev Server)

1. ✅ Start dev server manually: `npm run dev`
2. ✅ Verify it's running: `curl http://localhost:3000`
3. ✅ Run tests: `npx playwright test`

### Short-term (Fix Tests)

1. 🔧 Update `clearLocalStorage()` with try-catch
2. 🔧 Reorder `beforeEach` blocks (navigate first, then clear)
3. 🔧 Fix auth setup timing for protected routes
4. 🔧 Update selectors for failing assertions

### Long-term (Improve CI)

1. 📝 Add server health check helper
2. 📝 Update Playwright config for devcontainer
3. 📝 Add data-testid attributes to critical elements
4. 📝 Consider using test database/fixtures instead of localStorage

## Running Tests After Fixes

```bash
# 1. Start dev server (if not using webServer config)
npm run dev

# 2. Run all tests
npx playwright test

# 3. Run specific test file
npx playwright test tests/e2e/auth/authentication.spec.ts

# 4. Run in headed mode (see browser)
npx playwright test --headed

# 5. Run with debug
npx playwright test --debug

# 6. View test report
npx playwright show-report
```

## Expected Results After Fixes

- ✅ localStorage errors: 0 (was 13)
- ✅ Auth redirect errors: 0 (was 7)
- ⚠️ Selector errors: 3 (needs investigation)
- **Target pass rate:** 95%+ (63/66 tests)
