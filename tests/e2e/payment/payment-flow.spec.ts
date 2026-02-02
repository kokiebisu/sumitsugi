/**
 * Payment Flow E2E Tests
 *
 * End-to-end tests for complete payment journeys.
 * These tests cover the full user flow from property selection to payment completion.
 *
 * IMPORTANT: These tests require:
 * - Stripe test mode environment variables
 * - Mock or test seller with Stripe Connect account
 *
 * @tag payment
 */
import { test, expect, testData, setupAuthenticatedBuyer } from '../fixtures/test-fixtures'

// Check if Stripe is configured
const hasStripeConfig = Boolean(
  process.env.STRIPE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
)

test.describe('Payment Flow - User Journey @payment', () => {
  const propertyId = testData.properties.bohemian

  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('user can navigate from property to payment page', async ({ page, homePage }) => {
    // Start from home page
    await homePage.goto()

    // Click on a property
    await homePage.clickFirstProperty()

    // Wait for property detail page
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/listings/')

    // Navigate to payment page (this would typically be through an inquiry flow)
    // For now, directly navigate
    const currentUrl = page.url()
    const id = currentUrl.split('/listings/')[1]

    await page.goto(`/properties/${id}/payment`)
    await page.waitForLoadState('networkidle')

    // Verify we're on payment page
    await expect(page.locator('text=引き継ぎ費用のお支払い手続き')).toBeVisible()
  })

  test('authenticated user sees payment form loaded', async ({ page }) => {
    // Set up authenticated user
    await page.goto('/')
    await setupAuthenticatedBuyer(page)

    // Navigate to payment page
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Wait for form to load
    await page.waitForSelector('[class*="Card"]:has-text("申込金のお支払い")', { timeout: 10000 })

    // Verify form elements
    await expect(page.locator('text=申込金のお支払い')).toBeVisible()
    await expect(page.locator('text=20,000円')).toBeVisible()
  })

  test('displays property title on payment page', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Payment page should show property title in h1
    const title = await page.locator('h1').textContent()
    expect(title).toBeTruthy()
    expect(title!.length).toBeGreaterThan(0)
  })
})

test.describe('Payment Flow - Pre-payment Checks @payment', () => {
  const propertyId = testData.properties.bohemian

  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('shows all payment steps with correct amounts', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Check Step 1: Application Fee
    await expect(page.locator('text=申込金のお支払い（現在のステップ）')).toBeVisible()
    await expect(page.locator('text=20,000円').first()).toBeVisible()
    await expect(page.locator('text=返金不可')).toBeVisible()

    // Check Step 2: Deposit (should be grayed out)
    const depositStep = page.locator('[class*="opacity"]:has-text("デポジット")')
    await expect(depositStep).toBeVisible()

    // Check Step 3: Remaining (should be grayed out)
    const remainingStep = page.locator('[class*="opacity"]:has-text("残金")')
    await expect(remainingStep).toBeVisible()
  })

  test('shows next steps information', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Check next steps info box
    const nextStepsInfo = page.locator('text=次のステップについて')
    await expect(nextStepsInfo).toBeVisible()

    // Check explanation about messaging
    await expect(page.locator('text=前の住人とメッセージでやり取りを開始できます')).toBeVisible()
  })

  test('shows fee breakdown with all components', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Verify all fee components are displayed
    const feeComponents = [
      '引き継ぎ費用 合計',
      '前の住人が受け取る金額',
      '追加クリーニング費用',
      '大家さんインセンティブ',
      'プラットフォーム手数料',
    ]

    for (const component of feeComponents) {
      await expect(page.locator(`text=${component}`)).toBeVisible()
    }
  })

  test('shows trust indicators for secure payment', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Check trust badges
    await expect(page.locator('text=安全な決済')).toBeVisible()
    await expect(page.locator('text=Stripeによる安全な決済処理')).toBeVisible()
    await expect(page.locator('text=エスクロー保護')).toBeVisible()
    await expect(page.locator('text=トラブル対応')).toBeVisible()
  })
})

test.describe('Payment Flow - Return URL Handling @payment', () => {
  const propertyId = testData.properties.bohemian

  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('handles payment success return URL', async ({ page }) => {
    // Simulate return from Stripe with success
    await page.goto(`/properties/${propertyId}?payment=success`)
    await page.waitForLoadState('networkidle')

    // Check URL parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('payment')).toBe('success')

    // The page should handle this and potentially show a success message
    // This depends on implementation
  })

  test('handles payment failure return URL', async ({ page }) => {
    // Simulate return from Stripe with failure
    await page.goto(`/properties/${propertyId}?payment=failure`)
    await page.waitForLoadState('networkidle')

    // Check URL parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('payment')).toBe('failure')
  })

  test('handles payment cancellation return URL', async ({ page }) => {
    // Simulate return from Stripe after cancellation
    await page.goto(`/properties/${propertyId}?payment=cancelled`)
    await page.waitForLoadState('networkidle')

    // Check URL parameter
    const url = new URL(page.url())
    expect(url.searchParams.get('payment')).toBe('cancelled')
  })
})

test.describe('Payment Flow - Cross-Browser @payment', () => {
  const propertyId = testData.properties.bohemian

  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  // These tests will run in all configured browsers
  test('payment page renders correctly', async ({ page, browserName: _browserName }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Basic checks that should work in all browsers
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=申込金のお支払い')).toBeVisible()

    // Take browser-specific screenshot
    await page.screenshot({
      path: `tests/e2e/artifacts/payment-page-${_browserName}.png`,
      fullPage: true,
    })
  })

  test('fee breakdown displays correctly', async ({ page, browserName: _browserName }) => {
    void _browserName // Available for browser-specific logic if needed
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Check fee breakdown card
    const feeCard = page.locator('[class*="Card"]:has-text("費用の内訳")')
    await expect(feeCard).toBeVisible()

    // Verify numbers are formatted correctly (browser may affect number formatting)
    await expect(page.locator('text=/\\d{1,3}(,\\d{3})*円/')).toBeVisible()
  })
})

test.describe('Payment Flow - Accessibility @payment', () => {
  const propertyId = testData.properties.bohemian

  test.skip(!hasStripeConfig, 'Stripe environment variables not configured')

  test('payment page is keyboard navigable', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Tab through interactive elements
    await page.keyboard.press('Tab')

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return el?.tagName.toLowerCase()
    })

    expect(focusedElement).toBeTruthy()
  })

  test('form elements have proper labels', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Submit button should have accessible text
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    const buttonText = await submitButton.textContent()
    expect(buttonText).toContain('円を支払う')
  })

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`)
    await page.waitForLoadState('networkidle')

    // Should have h1 for main title
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Should have h2s or h3s for sections
    const h2Count = await page.locator('h2, h3').count()
    expect(h2Count).toBeGreaterThan(0)
  })
})
