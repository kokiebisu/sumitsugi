/**
 * Payment Page E2E Tests
 *
 * Tests for the payment initialization and page layout.
 * Verifies that the payment page loads correctly with proper elements.
 *
 * IMPORTANT: These tests require Stripe test mode environment variables:
 * - STRIPE_SECRET_KEY (sk_test_...)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...)
 *
 * Tests will be skipped if Stripe is not configured.
 *
 * @tag payment
 */
import { test, expect, testData } from '../fixtures/test-fixtures'

// Check if Stripe is configured (tests will skip if not)
const hasStripeConfig = Boolean(
  process.env.STRIPE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

test.describe('Payment Page @payment', () => {
  const propertyId = testData.properties.bohemian

  // Skip all tests in this describe block if Stripe is not configured
  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test.beforeEach(async ({ page }) => {
    // Navigate to payment page
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')
  })

  test('should display payment page with correct title', async ({ paymentPage }) => {
    const isLoaded = await paymentPage.isLoaded()
    expect(isLoaded).toBe(true)

    const title = await paymentPage.getPageTitle()
    expect(title).toBeTruthy()
  })

  test('should display three-step payment flow', async ({ paymentPage }) => {
    const steps = await paymentPage.hasPaymentSteps()

    expect(steps.applicationFee).toBe(true)
    expect(steps.deposit).toBe(true)
    expect(steps.remaining).toBe(true)

    // Take screenshot for documentation
    await paymentPage.takeScreenshot('payment-flow-steps')
  })

  test('should display fee breakdown section', async ({ paymentPage }) => {
    const hasFeeBreakdown = await paymentPage.hasFeeBreakdown()
    expect(hasFeeBreakdown).toBe(true)
  })

  test('should display trust indicators', async ({ paymentPage: _paymentPage }) => {
    const trustIndicators = await _paymentPage.hasTrustIndicators()

    expect(trustIndicators.securePayment).toBe(true)
    expect(trustIndicators.escrowProtection).toBe(true)
    expect(trustIndicators.support).toBe(true)
  })

  test('should display non-refundable warning', async ({ paymentPage: _paymentPage }) => {
    const hasWarning = await _paymentPage.hasNonRefundableWarning()
    expect(hasWarning).toBe(true)
  })

  test('should display correct application fee amount', async ({ paymentPage: _paymentPage }) => {
    const amount = await _paymentPage.getApplicationFeeAmount()
    // Application fee is 20,000 yen
    expect(amount).toBe('20,000')
  })

  test('should have terms and privacy links', async ({ paymentPage: _paymentPage, page }) => {
    void _paymentPage // Used for fixture setup
    const termsLink = page.locator('a[href="/terms"]')
    const privacyLink = page.locator('a[href="/privacy"]')

    await expect(termsLink).toBeVisible()
    await expect(privacyLink).toBeVisible()
  })

  test('should navigate to terms page when clicked', async ({ paymentPage: _paymentPage, page }) => {
    void _paymentPage // Used for fixture setup
    // Click on new tab link
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('a[href="/terms"]').click(),
    ])

    await newPage.waitForLoadState()
    expect(newPage.url()).toContain('/terms')
    await newPage.close()
  })

  test('should navigate to privacy page when clicked', async ({ paymentPage: _paymentPage, page }) => {
    void _paymentPage // Used for fixture setup
    // Click on new tab link
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('a[href="/privacy"]').click(),
    ])

    await newPage.waitForLoadState()
    expect(newPage.url()).toContain('/privacy')
    await newPage.close()
  })
})

test.describe('Payment Page - Non-existent Property @payment', () => {
  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('should show 404 for non-existent property', async ({ page }) => {
    // Navigate to payment page for non-existent property
    const response = await page.goto('/properties/non-existent-id-12345/payment')

    // Should return 404
    expect(response?.status()).toBe(404)
  })
})

test.describe('Payment Page - Fee Breakdown Verification @payment', () => {
  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('should display correct fee calculation', async ({ page }) => {
    const propertyId = testData.properties.bohemian

    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Verify fee breakdown elements are present
    await expect(page.locator('text=引き継ぎ費用 合計')).toBeVisible()
    await expect(page.locator('text=前の住人が受け取る金額')).toBeVisible()
    await expect(page.locator('text=追加クリーニング費用')).toBeVisible()
    await expect(page.locator('text=大家さんインセンティブ')).toBeVisible()
    await expect(page.locator('text=プラットフォーム手数料')).toBeVisible()
  })

  test('should show application fee as current step', async ({ page }) => {
    const propertyId = testData.properties.bohemian

    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Application fee step should be highlighted (has coral border)
    const applicationFeeStep = page.locator('[class*="border-\\[#FF5A5F\\]"], [class*="border-coral"]')
    await expect(applicationFeeStep).toBeVisible()

    // Should indicate this is the current step
    await expect(page.locator('text=申込金のお支払い（現在のステップ）')).toBeVisible()
  })

  test('should show deposit and remaining steps as inactive', async ({ page }) => {
    const propertyId = testData.properties.bohemian

    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Deposit step should be grayed out
    const depositStep = page.locator('[class*="opacity-60"]:has-text("デポジット")')
    await expect(depositStep).toBeVisible()

    // Remaining step should be grayed out
    const remainingStep = page.locator('[class*="opacity-60"]:has-text("残金")')
    await expect(remainingStep).toBeVisible()
  })
})
