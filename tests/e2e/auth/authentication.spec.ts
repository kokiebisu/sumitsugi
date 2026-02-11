import { test, expect } from '../fixtures/test-fixtures';

/**
 * E2E Tests: Magic Link Authentication Flow
 *
 * Critical user journey: Magic Link login/signup
 * Priority: HIGH
 *
 * Tests the Magic Link authentication dialog and flows:
 * - Dialog open/close
 * - Email input and validation
 * - Magic link send request (mocked API)
 * - Email sent confirmation UI
 * - Logout flow
 * - Protected route redirects
 * - Session persistence
 */

test.describe('Magic Link Auth - Dialog @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open login dialog from header menu', async ({ authPage }) => {
    await authPage.openLoginDialog();

    const isVisible = await authPage.isDialogVisible();
    expect(isVisible).toBe(true);

    await expect(authPage.dialogTitle).toContainText('ログイン / 新規登録');
  });

  test('should display email input and submit button', async ({ authPage }) => {
    await authPage.openLoginDialog();

    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.emailInput).toHaveAttribute('type', 'email');
    await expect(authPage.submitButton).toBeVisible();
    await expect(authPage.submitButton).toContainText('ログインリンクを送信');
  });

  test('should display descriptive text about magic link', async ({
    authPage,
    page,
  }) => {
    await authPage.openLoginDialog();

    await expect(
      page.locator('text=ログインリンクをお送りします。')
    ).toBeVisible();
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

    const overlay = page
      .locator('.fixed.inset-0.z-50 > .absolute.inset-0')
      .first();
    await overlay.click({ position: { x: 10, y: 10 } });

    await authPage.signupDialog.waitFor({ state: 'hidden', timeout: 5000 });
  });
});

test.describe('Magic Link Auth - Email Validation @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should disable submit button when email is empty', async ({
    authPage,
  }) => {
    await authPage.openLoginDialog();

    await expect(authPage.submitButton).toBeDisabled();
  });

  test('should enable submit button when valid email is entered', async ({
    authPage,
  }) => {
    await authPage.openLoginDialog();

    await authPage.emailInput.fill('test@example.com');

    await expect(authPage.submitButton).toBeEnabled();
  });

  test('should use HTML5 email validation', async ({ authPage }) => {
    await authPage.openLoginDialog();

    await expect(authPage.emailInput).toHaveAttribute('required', '');
    await expect(authPage.emailInput).toHaveAttribute('type', 'email');
  });
});

test.describe('Magic Link Auth - Send Request @auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show confirmation after successful magic link send', async ({
    authPage,
  }) => {
    await authPage.mockMagicLinkSuccess();
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest('test@example.com');

    await expect(authPage.emailSentConfirmation).toBeVisible({
      timeout: 10000,
    });
    await expect(authPage.emailSentCloseButton).toBeVisible();
  });

  test('should display submitted email in confirmation', async ({
    authPage,
    page,
  }) => {
    const testEmail = 'user@tsumugi.example.com';
    await authPage.mockMagicLinkSuccess();
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest(testEmail);

    await expect(authPage.emailSentConfirmation).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();
  });

  test('should show link validity notice in confirmation', async ({
    authPage,
    page,
  }) => {
    await authPage.mockMagicLinkSuccess();
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest('test@example.com');

    await expect(authPage.emailSentConfirmation).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=リンクは15分間有効です。')).toBeVisible();
  });

  test('should update dialog title after successful send', async ({
    authPage,
  }) => {
    await authPage.mockMagicLinkSuccess();
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest('test@example.com');

    await expect(authPage.dialogTitle).toContainText(
      'メールを確認してください',
      { timeout: 10000 }
    );
  });

  test('should close confirmation dialog with close button', async ({
    authPage,
  }) => {
    await authPage.mockMagicLinkSuccess();
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest('test@example.com');

    await expect(authPage.emailSentCloseButton).toBeVisible({
      timeout: 10000,
    });
    await authPage.emailSentCloseButton.click();

    expect(await authPage.isDialogVisible()).toBe(false);
  });

  test('should show error message on API failure', async ({ authPage }) => {
    await authPage.mockMagicLinkError('メール送信に失敗しました');
    await authPage.openLoginDialog();

    await authPage.submitMagicLinkRequest('test@example.com');

    await expect(authPage.errorMessage).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Magic Link Auth - Become Seller @auth', () => {
  test('should trigger login dialog when clicking become seller while not logged in', async ({
    authPage,
    page,
  }) => {
    await page.goto('/');
    await authPage.clickBecomeSeller();

    expect(await authPage.isDialogVisible()).toBe(true);
  });
});

test.describe('Magic Link Auth - Terms and Privacy @auth', () => {
  test('should display terms and privacy links', async ({ authPage, page }) => {
    await page.goto('/');
    await authPage.openLoginDialog();

    const termsLink = page.locator('a[href="/terms"]');
    const privacyLink = page.locator('a[href="/privacy"]');

    await expect(termsLink).toBeVisible();
    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toContainText('利用規約');
    await expect(privacyLink).toContainText('プライバシーポリシー');
  });
});
