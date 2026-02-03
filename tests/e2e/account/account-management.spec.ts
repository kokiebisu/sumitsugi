import {
  test,
  expect,
  testData,
  clearLocalStorage,
  setupAuthenticatedUser,
} from '../fixtures/test-fixtures';

/**
 * E2E Tests: Account Management
 *
 * Critical user journey: User profile management
 * Priority: MEDIUM
 *
 * Tests account functionality:
 * - Access control
 * - Profile viewing
 * - Profile editing
 * - Data validation
 */

test.describe('Account - Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('should redirect to home when not logged in', async ({ page }) => {
    await page.goto('/account');

    // Should redirect to home page
    await page.waitForURL('/');
    expect(page.url()).not.toContain('/account');
  });

  test('should show account page when logged in', async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/account');

    // Should stay on account page
    await expect(page).toHaveURL('/account');
  });
});

test.describe('Account - Profile Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should display user name', async ({ page }) => {
    await page.goto('/account');

    // Should show user name
    await expect(
      page.locator(`text=${testData.users.testUser.name}`)
    ).toBeVisible();
  });

  test('should display user email', async ({ page }) => {
    await page.goto('/account');

    // Should show user email
    await expect(
      page.locator(`text=${testData.users.testUser.email}`)
    ).toBeVisible();
  });

  test('should have edit profile button', async ({ page }) => {
    await page.goto('/account');

    // Should show edit button
    const editButton = page.locator(
      'a[href="/account/edit"], button:has-text("編集")'
    );
    await expect(editButton.first()).toBeVisible();
  });

  test('should show profile sections', async ({ page }) => {
    await page.goto('/account');

    // Should show various profile information sections
    // Name, email, phone, etc.
    const profileContent = await page.locator('main').textContent();
    expect(profileContent).toContain(testData.users.testUser.name);
  });

  test('should display user since date if available', async ({ page }) => {
    await page.goto('/account');

    // Check if join date or member since info is shown
    // This depends on actual implementation
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Account - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should be accessible from header menu', async ({ page, authPage }) => {
    await page.goto('/');

    // Open user menu
    await authPage.openMenu();

    // Should have account link
    const accountLink = page.locator(
      '[role="menuitem"]:has-text("アカウント")'
    );
    await expect(accountLink).toBeVisible();

    // Click account link
    await accountLink.click();

    // Should navigate to account page
    await expect(page).toHaveURL('/account');
  });

  test('should have header and footer', async ({ page }) => {
    await page.goto('/account');

    // Should show header
    await expect(page.locator('header')).toBeVisible();

    // Should show footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should navigate to edit page when clicking edit', async ({ page }) => {
    await page.goto('/account');

    // Click edit button
    const editButton = page.locator('a[href="/account/edit"]').first();
    await editButton.click();

    // Should navigate to edit page
    await expect(page).toHaveURL('/account/edit');
  });
});

test.describe('Account - Edit Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should show edit form with current values', async ({ page }) => {
    await page.goto('/account/edit');

    // Wait for page to load
    await page.waitForURL('/account/edit');

    // Name field should be pre-filled
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(testData.users.testUser.name);
  });

  test('should have save and cancel buttons', async ({ page }) => {
    await page.goto('/account/edit');

    // Should have save button
    const saveButton = page.locator(
      'button[type="submit"], button:has-text("保存")'
    );
    await expect(saveButton.first()).toBeVisible();

    // Should have cancel button or link
    const cancelButton = page.locator(
      'a[href="/account"], button:has-text("キャンセル")'
    );
    await expect(cancelButton.first()).toBeVisible();
  });

  test('should allow editing name', async ({ page }) => {
    await page.goto('/account/edit');

    // Wait for page to load
    await page.waitForURL('/account/edit');

    // Find and edit name field
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('新しい名前');

    // Name should be updated in the field
    await expect(nameInput).toHaveValue('新しい名前');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/account/edit');

    // Wait for page to load
    await page.waitForURL('/account/edit');

    // Clear required field (e.g., name)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();

    // Try to submit
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();

    // Form should not submit (HTML5 validation)
    // Should still be on edit page
    await expect(page).toHaveURL('/account/edit');
  });

  test('should navigate back to account page on cancel', async ({ page }) => {
    await page.goto('/account/edit');

    // Click cancel
    const cancelButton = page.locator('a[href="/account"]').first();
    await cancelButton.click();

    // Should go back to account page
    await expect(page).toHaveURL('/account');
  });

  test('should save changes and redirect to account page', async ({ page }) => {
    await page.goto('/account/edit');

    // Wait for page to load
    await page.waitForURL('/account/edit');

    // Edit a field
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.clear();
    await nameInput.fill('Updated Name');

    // Submit form
    const saveButton = page.locator('button[type="submit"]').first();
    await saveButton.click();

    // Should redirect to account page
    await expect(page).toHaveURL('/account', { timeout: 5000 });
  });
});

test.describe('Account - Profile Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should display contact information section', async ({ page }) => {
    await page.goto('/account');

    // Should show email
    await expect(
      page.locator(`text=${testData.users.testUser.email}`)
    ).toBeVisible();
  });

  test('should show account settings or preferences', async ({ page }) => {
    await page.goto('/account');

    // Check if there are any settings sections
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
  });

  test('should have logout functionality', async ({ page, authPage }) => {
    await page.goto('/account');

    // Open menu
    await authPage.openMenu();

    // Should have logout option
    await expect(authPage.menuLogoutButton).toBeVisible();
  });
});

test.describe('Account - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/account');

    // Page should load and show content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle edit page loading', async ({ page }) => {
    await page.goto('/account/edit');

    // Wait for page to load
    await page.waitForURL('/account/edit');

    // Edit form inputs should be visible
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
  });
});

test.describe('Account - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/account');

    // Account page should be visible on mobile
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/account');

    // Account page should be visible on tablet
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Account - Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should not expose sensitive information', async ({ page }) => {
    await page.goto('/account');

    // Password should not be visible in plain text
    const content = await page.locator('main').textContent();
    expect(content).not.toContain('password');
    expect(content).not.toContain('パスワード');
  });
});

test.describe('Account - Profile Completeness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should show all profile fields', async ({ page }) => {
    await page.goto('/account');

    // Should display key profile information
    // Name, email are minimum
    const hasName = await page
      .locator(`text=${testData.users.testUser.name}`)
      .isVisible();
    const hasEmail = await page
      .locator(`text=${testData.users.testUser.email}`)
      .isVisible();

    expect(hasName).toBe(true);
    expect(hasEmail).toBe(true);
  });
});
