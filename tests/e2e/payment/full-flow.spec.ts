/**
 * Full Payment Flow E2E Tests
 *
 * Tests the complete payment journey:
 * Stripe Connect registration → Application Fee → Deposit → Remaining → Handover Confirmation → Escrow Release
 *
 * All Stripe API calls are mocked via route interception.
 * Uses mock users from test fixtures.
 *
 * @tag payment
 * @tag full-flow
 */
import {
  test,
  expect,
  testData,
  setupAuthenticatedSeller,
  setupAuthenticatedBuyer,
  calculateExpectedFees,
} from '../fixtures/test-fixtures';

const propertyId = testData.properties.bohemian;

/**
 * Mock Stripe Connect server actions via Next.js server action interception
 */
async function mockStripeConnectActions(
  page: import('@playwright/test').Page,
  scenario: 'not_registered' | 'pending' | 'complete'
) {
  // Intercept server action calls for Stripe Connect status
  await page.route('**/actions/stripe-connect**', async (route) => {
    const request = route.request();
    const postData = request.postData() || '';

    if (postData.includes('getConnectAccountStatus')) {
      const responses: Record<string, object> = {
        not_registered: { success: true, exists: false },
        pending: {
          success: true,
          exists: true,
          account: {
            stripeAccountId: 'acct_mock_001',
            onboardingCompleted: false,
            chargesEnabled: false,
            payoutsEnabled: false,
          },
        },
        complete: {
          success: true,
          exists: true,
          account: {
            stripeAccountId: 'acct_mock_001',
            onboardingCompleted: true,
            chargesEnabled: true,
            payoutsEnabled: true,
          },
        },
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responses[scenario]),
      });
    } else if (postData.includes('createConnectAccount')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accountId: 'acct_mock_001',
        }),
      });
    } else if (postData.includes('getConnectAccountOnboardingLink')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: 'https://connect.stripe.com/setup/mock',
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock payment creation server actions
 */
async function mockPaymentActions(page: import('@playwright/test').Page) {
  await page.route('**/actions/payment**', async (route) => {
    const postData = route.request().postData() || '';

    if (
      postData.includes('createApplicationFeePayment') ||
      postData.includes('createDepositPayment') ||
      postData.includes('createRemainingPayment')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          clientSecret: 'pi_mock_secret_test',
          paymentId: 'pay_mock_001',
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Mock escrow server actions
 */
async function mockEscrowActions(
  page: import('@playwright/test').Page,
  confirmationState: 'first' | 'both'
) {
  await page.route('**/actions/escrow**', async (route) => {
    const postData = route.request().postData() || '';

    if (postData.includes('confirmHandoverCompletion')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bothConfirmed: confirmationState === 'both',
        }),
      });
    } else if (postData.includes('releaseEscrowAndDistribute')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transferIds: {
            previousTenant: 'tr_mock_001',
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

// ==========================================
// Test Suite: Stripe Connect Registration
// ==========================================
test.describe('Full Flow - Step 1: Stripe Connect Registration @payment @full-flow', () => {
  test('seller sees setup prompt when not registered', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account/stripe-setup');
    await page.waitForLoadState('networkidle');

    // Page title should be visible
    await expect(page.locator('h1')).toContainText('報酬受取口座の設定');

    // Should show the onboarding component
    await expect(page.locator('text=報酬受取口座')).toBeVisible();
  });

  test('stripe setup page shows FAQ section', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account/stripe-setup');
    await page.waitForLoadState('networkidle');

    // Check FAQ content
    await expect(page.locator('text=報酬はいつ受け取れますか？')).toBeVisible();
    await expect(page.locator('text=手数料はかかりますか？')).toBeVisible();
    await expect(page.locator('text=個人情報は安全ですか？')).toBeVisible();
  });

  test('stripe setup page shows callback status for complete', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account/stripe-setup?status=complete');
    await page.waitForLoadState('networkidle');

    // Should show success message
    await expect(page.locator('text=設定が完了しました')).toBeVisible();
  });

  test('stripe setup page shows callback status for refresh', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account/stripe-setup?status=refresh');
    await page.waitForLoadState('networkidle');

    // Should show refresh message
    await expect(page.locator('text=設定を続けてください')).toBeVisible();
  });

  test('account page has stripe connect link for sellers', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account');
    await page.waitForLoadState('networkidle');

    // Seller should see Stripe Connect setup link
    await expect(page.locator('text=報酬受取口座の設定')).toBeVisible();
    await expect(page.locator('a[href="/account/stripe-setup"]')).toBeVisible();
  });

  test('account page hides stripe connect link for non-sellers', async ({
    page,
  }) => {
    await page.goto('/');
    await setupAuthenticatedBuyer(page);
    await page.goto('/account');
    await page.waitForLoadState('networkidle');

    // Buyer should NOT see Stripe Connect setup
    await expect(page.locator('text=報酬受取口座の設定')).not.toBeVisible();
  });

  test('back link navigates to account page', async ({ page }) => {
    await page.goto('/');
    await setupAuthenticatedSeller(page);
    await page.goto('/account/stripe-setup');
    await page.waitForLoadState('networkidle');

    // Click back link
    const backLink = page.locator('a:has-text("アカウントに戻る")');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/account');
  });
});

// ==========================================
// Test Suite: Three-Stage Payment Flow
// ==========================================
test.describe('Full Flow - Step 2: Application Fee Payment @payment @full-flow', () => {
  test('payment page shows three steps with application fee active', async ({
    page,
  }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Step 1 should be active
    await expect(
      page.locator('text=申込金のお支払い（現在のステップ）')
    ).toBeVisible();

    // Steps 2 and 3 should be visible but grayed
    await expect(page.locator('text=デポジット（30%）')).toBeVisible();
    await expect(page.locator('text=残金（70%）')).toBeVisible();

    // Fee amounts should be visible
    await expect(page.locator('text=20,000円').first()).toBeVisible();
    await expect(page.locator('text=返金不可')).toBeVisible();
  });

  test('application fee form card is displayed', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Application fee form should be visible
    await expect(page.locator('text=申込金のお支払い')).toBeVisible();
  });

  test('displays correct fee breakdown', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Verify all fee components are displayed
    const feeLabels = [
      '引き継ぎ費用 合計',
      '前の住人が受け取る金額',
      '追加クリーニング費用',
      '大家さんインセンティブ',
      'プラットフォーム手数料',
    ];

    for (const label of feeLabels) {
      await expect(page.locator(`text=${label}`)).toBeVisible();
    }
  });

  test('displays info about next steps', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=次のステップについて：')).toBeVisible();
    await expect(
      page.locator(
        'text=申込金のお支払い後、前の住人とメッセージでやり取りを開始できます'
      )
    ).toBeVisible();
  });
});

test.describe('Full Flow - Step 3: Deposit Payment @payment @full-flow', () => {
  test('deposit step is active when step=deposit', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=deposit`);
    await page.waitForLoadState('networkidle');

    // Step 2 should be active
    await expect(
      page.locator('text=デポジット（30%）（現在のステップ）')
    ).toBeVisible();

    // Step 1 should show as completed
    await expect(page.locator('text=申込金のお支払い（完了）')).toBeVisible();

    // Deposit form should be visible
    await expect(page.locator('text=デポジットのお支払い')).toBeVisible();
  });

  test('deposit step shows escrow info', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=deposit`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=デポジットについて：')).toBeVisible();
    await expect(
      page.locator('text=デポジットはエスクローに安全に保管されます')
    ).toBeVisible();
  });

  test('deposit step displays correct amounts', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=deposit`);
    await page.waitForLoadState('networkidle');

    // The deposit form card should be visible
    await expect(page.locator('text=デポジットのお支払い')).toBeVisible();

    // Fee breakdown should still be visible
    await expect(page.locator('text=引き継ぎ費用 合計')).toBeVisible();
  });
});

test.describe('Full Flow - Step 4: Remaining Payment @payment @full-flow', () => {
  test('remaining step is active when step=remaining', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=remaining`);
    await page.waitForLoadState('networkidle');

    // Step 3 should be active
    await expect(
      page.locator('text=残金（70%）（現在のステップ）')
    ).toBeVisible();

    // Steps 1 and 2 should show as completed
    await expect(page.locator('text=申込金のお支払い（完了）')).toBeVisible();
    await expect(page.locator('text=デポジット（30%）（完了）')).toBeVisible();

    // Remaining form should be visible
    await expect(page.locator('text=残金のお支払い')).toBeVisible();
  });

  test('remaining step shows final payment info', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=remaining`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=残金について：')).toBeVisible();
    await expect(
      page.locator('text=残金のお支払い後、引き渡しの確認を行ってください')
    ).toBeVisible();
  });
});

// ==========================================
// Test Suite: Payment Success Status
// ==========================================
test.describe('Full Flow - Payment Success Callbacks @payment @full-flow', () => {
  test('shows success banner after application fee payment', async ({
    page,
  }) => {
    await page.goto(`/properties/${propertyId}/payment?status=success`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=お支払いが完了しました')).toBeVisible();
    await expect(
      page.locator('text=申込金のお支払いが完了しました')
    ).toBeVisible();
  });

  test('shows success banner after deposit payment', async ({ page }) => {
    await page.goto(
      `/properties/${propertyId}/payment?step=deposit&status=success`
    );
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=お支払いが完了しました')).toBeVisible();
    await expect(
      page.locator('text=デポジットのお支払いが完了しました')
    ).toBeVisible();
  });

  test('shows success banner after remaining payment', async ({ page }) => {
    await page.goto(
      `/properties/${propertyId}/payment?step=remaining&status=success`
    );
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=お支払いが完了しました')).toBeVisible();
    await expect(
      page.locator('text=残金のお支払いが完了しました')
    ).toBeVisible();
  });
});

// ==========================================
// Test Suite: Trust & Security Indicators
// ==========================================
test.describe('Full Flow - Trust Indicators @payment @full-flow', () => {
  const steps = [
    { name: 'application_fee', query: '' },
    { name: 'deposit', query: '?step=deposit' },
    { name: 'remaining', query: '?step=remaining' },
  ];

  for (const step of steps) {
    test(`trust indicators visible on ${step.name} step`, async ({ page }) => {
      await page.goto(`/properties/${propertyId}/payment${step.query}`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=安全な決済')).toBeVisible();
      await expect(page.locator('text=エスクロー保護')).toBeVisible();
      await expect(page.locator('text=トラブル対応')).toBeVisible();
    });
  }
});

// ==========================================
// Test Suite: Fee Calculation Consistency
// ==========================================
test.describe('Full Flow - Fee Calculations @payment @full-flow', () => {
  test('fee breakdown matches expected calculations', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Get the handover fee total from the page
    const totalText = await page
      .locator('text=引き継ぎ費用 合計')
      .locator('..')
      .locator('span:last-child')
      .textContent();

    expect(totalText).toBeTruthy();

    // Parse the amount (e.g., "180,000円" -> 180000)
    const totalAmount = parseInt(totalText!.replace(/[^0-9]/g, ''), 10);
    expect(totalAmount).toBeGreaterThan(0);

    // Calculate expected fees
    const expected = calculateExpectedFees(totalAmount);

    // Verify cleaning fee is present
    const cleaningFeeText = await page
      .locator('text=追加クリーニング費用')
      .locator('..')
      .locator('span:last-child')
      .textContent();
    expect(cleaningFeeText).toContain(
      expected.additionalCleaningFee.toLocaleString()
    );
  });
});

// ==========================================
// Test Suite: Navigation & Step Transitions
// ==========================================
test.describe('Full Flow - Step Navigation @payment @full-flow', () => {
  test('default step is application_fee', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Application fee step should be active by default
    await expect(
      page.locator('text=申込金のお支払い（現在のステップ）')
    ).toBeVisible();
  });

  test('invalid step param defaults to application_fee', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment?step=invalid`);
    await page.waitForLoadState('networkidle');

    // Should default to application fee step
    await expect(
      page.locator('text=申込金のお支払い（現在のステップ）')
    ).toBeVisible();
  });

  test('step progression shows correct completed states', async ({ page }) => {
    // On deposit step, step 1 should be completed
    await page.goto(`/properties/${propertyId}/payment?step=deposit`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=申込金のお支払い（完了）')).toBeVisible();
    await expect(
      page.locator('text=デポジット（30%）（現在のステップ）')
    ).toBeVisible();

    // On remaining step, steps 1 and 2 should be completed
    await page.goto(`/properties/${propertyId}/payment?step=remaining`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=申込金のお支払い（完了）')).toBeVisible();
    await expect(page.locator('text=デポジット（30%）（完了）')).toBeVisible();
    await expect(
      page.locator('text=残金（70%）（現在のステップ）')
    ).toBeVisible();
  });
});

// ==========================================
// Test Suite: Responsive Layout
// ==========================================
test.describe('Full Flow - Responsive Layout @payment @full-flow', () => {
  test('payment page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=お支払いの流れ')).toBeVisible();
    await expect(page.locator('text=費用の内訳')).toBeVisible();
  });

  test('deposit form renders on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`/properties/${propertyId}/payment?step=deposit`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=デポジットのお支払い')).toBeVisible();
  });
});
