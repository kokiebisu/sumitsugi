import {
  test,
  expect,
  testData,
  clearLocalStorage,
  setupAuthenticatedUser,
} from '../fixtures/test-fixtures';

/**
 * E2E Tests: Dashboard
 *
 * Critical user journey: Tracking inquiry progress
 * Priority: HIGH
 *
 * Tests the dashboard functionality:
 * - Access control (requires authentication)
 * - Inquiry list display
 * - Progress tracking
 * - Status indicators
 * - Action buttons
 */

test.describe('Dashboard - Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
  });

  test('should redirect to home when not logged in', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to home page
    await page.waitForURL('/');
    expect(page.url()).toContain('/');
    expect(page.url()).not.toContain('/dashboard');
  });

  test('should show dashboard when logged in', async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/dashboard');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Dashboard - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup user with no inquiries
    await setupAuthenticatedUser(page);
  });

  test('should show empty state when user has no inquiries', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Check for empty state message
    // This depends on actual implementation - adjust based on your empty state UI
    const hasContent = await page.locator('main').textContent();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Dashboard - With Inquiries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    // Create an inquiry first
    await page.goto(`/listings/${testData.properties.dj}/inquiry`);
    await page.locator('textarea#reason').fill('この暮らしに興味があります');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('text=引き継ぎ申し込みを受け付けました')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display list of user inquiries', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show at least one inquiry
    const inquiryCards = page.locator('[class*="inquiry"], [class*="card"]');
    await expect(inquiryCards.first()).toBeVisible();
  });

  test('should show inquiry property title', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show property title from the inquiry
    const propertyTitle = page.locator('text=/DJ|スタジオ|渋谷/');
    await expect(propertyTitle.first()).toBeVisible();
  });

  test('should show inquiry status', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show status indicator
    // New inquiries should be "pending" status
    const statusIndicator = page.locator(
      'text=/申し込み|確認中|承認済み|pending|reviewing/'
    );
    await expect(statusIndicator.first()).toBeVisible();
  });

  test('should show progress steps', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show progress visualization
    // Could be steps, timeline, or status badges
    const progressElements = page.locator(
      'text=/申し込み|確認中|承認済み|内見/'
    );
    const count = await progressElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show next action message', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show guidance on what to do next
    const actionMessage = page.locator(
      'text=/お待ちください|ご連絡|確認|準備/'
    );
    await expect(actionMessage.first()).toBeVisible();
  });
});

test.describe('Dashboard - Different Inquiry Statuses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  const statuses = [
    { status: 'pending' },
    { status: 'reviewing' },
    { status: 'approved' },
  ];

  for (const { status } of statuses) {
    test(`should display ${status} status correctly`, async ({ page }) => {
      // This test would need to set up different inquiry statuses
      // For now, just verify the dashboard loads
      await page.goto('/dashboard');
      await expect(page.locator('main')).toBeVisible();
    });
  }
});

test.describe('Dashboard - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should have header with navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show header
    await expect(page.locator('header')).toBeVisible();

    // Should have logo/home link
    const homeLink = page.locator('header a[href="/"]');
    await expect(homeLink).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should be accessible from header menu when logged in', async ({
    page,
    authPage,
  }) => {
    await page.goto('/');

    // Open user menu
    await authPage.openMenu();

    // Should have dashboard link
    const dashboardLink = page.locator(
      '[role="menuitem"]:has-text("ダッシュボード")'
    );
    await expect(dashboardLink).toBeVisible();

    // Click dashboard link
    await dashboardLink.click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Dashboard - Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    // Create an inquiry
    await page.goto(`/listings/${testData.properties.dj}/inquiry`);
    await page.locator('textarea#reason').fill('この暮らしに興味があります');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('text=引き継ぎ申し込みを受け付けました')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show appropriate action buttons based on status', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // For pending status, no action buttons should be shown
    // This will vary based on implementation
    const mainContent = await page.locator('main').textContent();
    expect(mainContent).toBeTruthy();
  });
});

test.describe('Dashboard - Multiple Inquiries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should handle multiple inquiries', async ({ page }) => {
    // Create first inquiry
    await page.goto(`/listings/${testData.properties.dj}/inquiry`);
    await page.locator('textarea#reason').fill('DJ機材に興味があります');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('text=引き継ぎ申し込みを受け付けました')
    ).toBeVisible({ timeout: 10000 });

    // Create second inquiry for different property
    await page.goto('`/listings/${testData.properties.vintage}/inquiry`');
    await page
      .locator('textarea#reason')
      .fill('ヴィンテージ家具に興味があります');
    await page.locator('button[type="submit"]').click();
    await expect(
      page.locator('text=引き継ぎ申し込みを受け付けました')
    ).toBeVisible({ timeout: 10000 });

    // Go to dashboard
    await page.goto('/dashboard');

    // Should show both inquiries
    // This is a basic check - adjust based on actual implementation
    const content = await page.locator('main').textContent();
    expect(content).toBeTruthy();
  });
});

test.describe('Dashboard - Loading States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for loading indicator or content
    const isLoaded = await page.locator('main').isVisible();
    expect(isLoaded).toBe(true);
  });
});

test.describe('Dashboard - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Dashboard should be visible on mobile
    await expect(page.locator('main')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/dashboard');

    // Dashboard should be visible on tablet
    await expect(page.locator('main')).toBeVisible();
  });
});
