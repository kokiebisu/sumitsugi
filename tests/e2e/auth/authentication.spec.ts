import {
  test,
  expect,
  testData,
  clearLocalStorage,
  setupAuthenticatedUser,
} from '../fixtures/test-fixtures';

/**
 * E2E Tests: Authentication Flow
 *
 * Critical user journey: User authentication (login/signup)
 * Priority: HIGH
 *
 * Tests the authentication dialogs and login flows including:
 * - Email/phone login
 * - User menu states (logged in/out)
 * - Logout flow
 * - Become seller flow
 */

test.describe('Authentication - Login Dialog @auth @quarantine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('should open login dialog from header menu', async ({ authPage }) => {
    // Open menu and click login
    await authPage.openLoginDialog();

    // Verify dialog is visible
    const isVisible = await authPage.isDialogVisible();
    expect(isVisible).toBe(true);

    // Verify dialog title
    await expect(authPage.dialogTitle).toContainText('ログインまたは登録');
  });

  test('should display email input and continue button', async ({
    authPage,
  }) => {
    await authPage.openLoginDialog();

    // Verify email input exists
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.emailInput).toHaveAttribute('type', 'email');

    // Verify continue button exists
    await expect(authPage.continueButton).toBeVisible();
    await expect(authPage.continueButton).toContainText('続行');
  });

  test('should display phone input field', async ({ authPage, page }) => {
    await authPage.openLoginDialog();

    // Verify phone input exists (required field in the form)
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('placeholder', '電話番号（必須）');
  });

  test('should close dialog when clicking close button', async ({
    authPage,
  }) => {
    await authPage.openLoginDialog();
    expect(await authPage.isDialogVisible()).toBe(true);

    await authPage.closeDialog();
    expect(await authPage.isDialogVisible()).toBe(false);
  });

  test('should close dialog when clicking overlay', async ({
    authPage,
    page,
  }) => {
    await authPage.openLoginDialog();
    expect(await authPage.isDialogVisible()).toBe(true);

    // Click overlay (background) - use the outer dialog container's overlay
    const overlay = page
      .locator('.fixed.inset-0.z-50 > .absolute.inset-0')
      .first();
    await overlay.click({ position: { x: 10, y: 10 } });

    // Dialog should close
    await authPage.signupDialog.waitFor({ state: 'hidden', timeout: 5000 });
  });
});

test.describe('Authentication - Email Login Flow @auth @quarantine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('should require email and phone before continuing', async ({
    authPage,
    page,
  }) => {
    await authPage.openLoginDialog();

    // Button should be disabled when fields are empty
    await expect(authPage.continueButton).toBeDisabled();

    // Enter valid email only
    await authPage.emailInput.fill('test@example.com');

    // Button should still be disabled (phone required)
    await expect(authPage.continueButton).toBeDisabled();

    // Enter phone number
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('09012345678');

    // Button should now be enabled
    await expect(authPage.continueButton).toBeEnabled();
  });

  test('should complete email login and close dialog', async ({
    authPage,
    page,
  }) => {
    await authPage.openLoginDialog();

    // Enter email and submit
    await authPage.loginWithEmail(testData.users.testUser.email);

    // Dialog should close
    expect(await authPage.isDialogVisible()).toBe(false);

    // User should be logged in (check localStorage)
    const userState = await page.evaluate(() => {
      return localStorage.getItem('tsumugi_user');
    });
    expect(userState).not.toBeNull();
  });
});

test.describe('Authentication - Logged In State @auth @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should show user avatar in header when logged in', async ({ page }) => {
    // Menu button should show avatar instead of default icon
    const avatarInMenu = page.locator('header button .rounded-full');
    await expect(avatarInMenu).toBeVisible();
  });

  test('should show logout option in menu when logged in', async ({
    authPage,
  }) => {
    const isLoggedIn = await authPage.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should show dashboard link in menu when logged in', async ({
    authPage,
    page,
  }) => {
    await authPage.openMenu();

    const dashboardLink = page.locator(
      '[role="menuitem"]:has-text("ダッシュボード")'
    );
    await expect(dashboardLink).toBeVisible();
  });

  test('should show account link in menu when logged in', async ({
    authPage,
    page,
  }) => {
    await authPage.openMenu();

    const accountLink = page.locator(
      '[role="menuitem"]:has-text("アカウント")'
    );
    await expect(accountLink).toBeVisible();
  });
});

test.describe('Authentication - Logout Flow @auth @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should logout user when clicking logout', async ({
    authPage,
    page,
  }) => {
    // Open menu and click logout directly (don't use isUserLoggedIn to avoid double menu open)
    await authPage.openMenu();
    await authPage.menuLogoutButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify logged out (localStorage cleared)
    const userState = await page.evaluate(() => {
      return localStorage.getItem('tsumugi_user');
    });
    expect(userState).toBeNull();
  });

  test('should show login option in menu after logout', async ({
    authPage,
  }) => {
    await authPage.logout();

    // Check menu shows login option
    await authPage.openMenu();
    await expect(authPage.menuLoginButton).toBeVisible();
  });
});

test.describe('Authentication - Protected Routes @auth @critical', () => {
  test('should redirect to home when visiting /listing without auth', async ({
    page,
  }) => {
    await clearLocalStorage(page);
    await page.goto('/listing');
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toContain('/');
  });

  test('should redirect to home when visiting /account without auth', async ({
    page,
  }) => {
    await clearLocalStorage(page);
    await page.goto('/account');
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toContain('/');
  });
});

test.describe('Authentication - Session Persistence @auth @critical', () => {
  test('should maintain auth state after page navigation', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    // Navigate to a different page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // User should still be logged in
    const userState = await page.evaluate(() => {
      return localStorage.getItem('tsumugi_user');
    });
    expect(userState).not.toBeNull();
  });

  test('should maintain auth state after browser reload', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // User should still be logged in
    const userState = await page.evaluate(() => {
      return localStorage.getItem('tsumugi_user');
    });
    expect(userState).not.toBeNull();
  });
});

test.describe('Authentication - Become Seller Flow @auth @listing @quarantine', () => {
  test('should trigger login dialog when clicking "暮らしを譲る" while not logged in', async ({
    authPage,
    page,
  }) => {
    await page.goto('/');
    await clearLocalStorage(page);

    // Click the "暮らしを譲る" button
    await authPage.clickBecomeSeller();

    // Login dialog should appear
    expect(await authPage.isDialogVisible()).toBe(true);
  });
});
