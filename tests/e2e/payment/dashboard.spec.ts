/**
 * Dashboard E2E Tests
 *
 * Tests for the user dashboard that shows inquiry and payment status.
 * Verifies progress tracking and payment-related actions.
 *
 * @tag payment
 * @tag dashboard
 */
import {
  test,
  expect,
  testData,
  setupAuthenticatedUser,
} from '../fixtures/test-fixtures';

test.describe('Dashboard - Page Load @payment @dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);
  });

  test('should display dashboard title', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard to load and not redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Wait for title to be visible
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should display dashboard description', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    await expect(
      page.locator('text=申し込んだ暮らしの引き継ぎ状況を確認できます')
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard - Empty State @payment @dashboard', () => {
  test('should show empty state for user without inquiries', async ({
    page,
  }) => {
    // Set up new user with no inquiries before navigation
    await page.addInitScript(() => {
      const mockUser = {
        id: 'new-user-' + Date.now(),
        email: 'newuser@test.com',
        name: 'New User',
        createdAt: new Date().toISOString(),
        authProvider: 'email',
        isSeller: false,
      };
      localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
      // Clear any existing inquiries
      localStorage.removeItem('tsumugi_inquiries');
    });

    await page.goto('/dashboard');

    // Wait for dashboard to load and not redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Should show empty state message
    await expect(page.locator('text=申し込んだ暮らしがありません')).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('should have link to browse properties from empty state', async ({
    page,
  }) => {
    await page.goto('/');

    await page.addInitScript(() => {
      const mockUser = {
        id: 'new-user-' + Date.now(),
        email: 'newuser@test.com',
        name: 'New User',
        createdAt: new Date().toISOString(),
        authProvider: 'email',
        isSeller: false,
      };
      localStorage.setItem('tsumugi_user', JSON.stringify(mockUser));
      // Clear any existing inquiries
      localStorage.removeItem('tsumugi_inquiries');
    });

    await page.reload();
    await page.goto('/dashboard');

    // Wait for dashboard to load and not redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    const browseLink = page.locator('a:has-text("暮らしを探す")');
    await expect(browseLink).toBeVisible({ timeout: 10000 });

    await browseLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to home
    expect(page.url()).toContain('/');
  });
});

test.describe('Dashboard - Progress Steps @payment @dashboard', () => {
  test('should display 9-stage progress steps', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    // Mock user with an inquiry
    await page.addInitScript(() => {
      // Create inquiry data
      const inquiry = {
        id: 'test-inquiry-1',
        propertyId: '1368794573069214647',
        propertyTitle: 'Test Property',
        status: 'viewing_scheduled',
        applicantName: 'Test User',
        applicantEmail: 'test@tsumugi.example.com',
        reason: 'Test reason',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
    });

    await page.reload();
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Check for progress step labels
    const expectedSteps = [
      '申し込み',
      '確認中',
      '承認済み',
      '内見予定',
      '内見完了',
      '合意待ち',
      '署名完了',
      '契約手続き中',
      '完了',
    ];

    for (const step of expectedSteps) {
      await expect(page.locator(`text="${step}"`).first()).toBeVisible({
        timeout: 10000,
      });
    }
  });
});

test.describe('Dashboard - Status Messages @payment @dashboard', () => {
  const statusMessages: Record<string, string> = {
    pending: '前の住人からのご連絡をお待ちください',
    reviewing: '前の住人が内容を確認中です',
    approved: '内見の日程調整をお待ちください',
    viewing_scheduled: '内見予定日が確定しました',
  };

  for (const [status, message] of Object.entries(statusMessages)) {
    test(`should show correct message for ${status} status`, async ({
      page,
    }) => {
      await page.goto('/');
      await setupAuthenticatedUser(page);

      // Mock inquiry with specific status
      await page.addInitScript(
        ({ status, testEmail }) => {
          const inquiry = {
            id: `test-inquiry-${status}`,
            propertyId: '1368794573069214647',
            propertyTitle: 'Test Property',
            status: status,
            applicantName: 'Test User',
            applicantEmail: testEmail,
            reason: 'Test reason',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
        },
        { status, testEmail: testData.users.testUser.email }
      );

      await page.reload();
      await page.goto('/dashboard');

      // Wait for dashboard to load and not redirect
      await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

      await expect(page.locator(`text=${message}`)).toBeVisible({
        timeout: 10000,
      });
    });
  }
});

test.describe('Dashboard - Action Buttons @payment @dashboard', () => {
  test('should show viewing complete button when viewing is scheduled', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    await page.addInitScript(
      ({ testEmail }) => {
        const inquiry = {
          id: 'test-inquiry-viewing',
          propertyId: '1368794573069214647',
          propertyTitle: 'Test Property',
          status: 'viewing_scheduled',
          applicantName: 'Test User',
          applicantEmail: testEmail,
          reason: 'Test reason',
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
      },
      { testEmail: testData.users.testUser.email }
    );

    await page.reload();
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Check for viewing complete button
    await expect(page.locator('a:has-text("内見完了を報告")')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show agreement button when agreement is pending', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    await page.addInitScript(
      ({ testEmail }) => {
        const inquiry = {
          id: 'test-inquiry-agreement',
          propertyId: '1368794573069214647',
          propertyTitle: 'Test Property',
          status: 'agreement_pending',
          applicantName: 'Test User',
          applicantEmail: testEmail,
          reason: 'Test reason',
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
      },
      { testEmail: testData.users.testUser.email }
    );

    await page.reload();
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Check for agreement button
    await expect(page.locator('a:has-text("引き継ぎ内容を確認")')).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Dashboard - Property Navigation @payment @dashboard', () => {
  test('should navigate to property page when title clicked', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedUser(page);

    const propertyId = testData.properties.bohemian;

    await page.addInitScript(
      ({ propertyId, testEmail }) => {
        const inquiry = {
          id: 'test-inquiry-nav',
          propertyId: propertyId,
          propertyTitle: 'Test Bohemian Property',
          status: 'pending',
          applicantName: 'Test User',
          applicantEmail: testEmail,
          reason: 'Test reason',
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
      },
      { propertyId, testEmail: testData.users.testUser.email }
    );

    await page.reload();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on property title
    const propertyLink = page.locator(`a[href="/listings/${propertyId}"]`);
    await propertyLink.click();
    await page.waitForLoadState('networkidle');

    // Should navigate to property page
    expect(page.url()).toContain(`/listings/${propertyId}`);
  });
});

test.describe('Dashboard - Responsive Design @payment @dashboard', () => {
  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display dashboard on mobile', async ({ page }) => {
      await page.goto('/');
      await setupAuthenticatedUser(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible();

      // Take mobile screenshot
      await page.screenshot({
        path: 'tests/e2e/artifacts/dashboard-mobile.png',
        fullPage: true,
      });
    });

    test('progress bar should scroll horizontally on mobile', async ({
      page,
    }) => {
      await page.goto('/');
      await setupAuthenticatedUser(page);

      await page.addInitScript(
        ({ testEmail }) => {
          const inquiry = {
            id: 'test-inquiry-mobile',
            propertyId: '1368794573069214647',
            propertyTitle: 'Test Property',
            status: 'viewing_scheduled',
            applicantName: 'Test User',
            applicantEmail: testEmail,
            reason: 'Test reason',
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('tsumugi_inquiries', JSON.stringify([inquiry]));
        },
        { testEmail: testData.users.testUser.email }
      );

      await page.reload();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check for overflow-x-auto class (horizontal scroll)
      const scrollContainer = page
        .locator('[class*="overflow-x-auto"]')
        .first();
      await expect(scrollContainer).toBeVisible();
    });
  });
});
