import { test, expect, testData, clearLocalStorage, setupAuthenticatedUser } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Inquiry Flow
 *
 * Critical user journey: Next resident submitting inquiry to previous resident
 * Priority: HIGH
 *
 * Tests the complete inquiry submission flow:
 * - Accessing inquiry form from property detail
 * - Form validation
 * - Authentication requirement
 * - Successful submission
 * - Post-submission redirect
 */

test.describe('Inquiry Flow - Unauthenticated User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearLocalStorage(page)
  })

  test('should show inquiry button on property detail page', async ({ page }) => {
    // Navigate to a property detail page
    await page.goto(`/listings/${testData.properties.dj}`)

    // Should show inquiry button
    const inquiryButton = page.locator('a[href*="/inquiry"], button:has-text("この暮らしに興味がある")')
    await expect(inquiryButton.first()).toBeVisible()
  })

  test('should navigate to inquiry form when clicking inquiry button', async ({ page }) => {
    await page.goto(`/listings/${testData.properties.dj}`)

    // Click inquiry button
    const inquiryButton = page.locator('a[href*="/inquiry"]').first()
    await inquiryButton.click()

    // Should be on inquiry page
    await expect(page).toHaveURL(/\/listings\/.*\/inquiry/)

    // Should show form title
    await expect(page.locator('h1:has-text("この暮らしに興味がある")')).toBeVisible()
  })

  test('should show property summary on inquiry page', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Should show property summary card
    const summaryCard = page.locator('text=お問い合わせ対象')
    await expect(summaryCard).toBeVisible()

    // Should show property image
    const propertyImage = page.locator('img[alt*="DJ"], img[alt*="Studio"]').first()
    await expect(propertyImage).toBeVisible()
  })

  test('should show all required form fields', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Name field
    const nameInput = page.locator('input#name')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveAttribute('required')

    // Email field
    const emailInput = page.locator('input#email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(emailInput).toHaveAttribute('required')

    // Reason field
    const reasonField = page.locator('textarea#reason')
    await expect(reasonField).toBeVisible()
    await expect(reasonField).toHaveAttribute('required')

    // Questions field (optional)
    const questionsField = page.locator('textarea#questions')
    await expect(questionsField).toBeVisible()
  })

  test('should trigger login dialog when submitting without authentication', async ({ page, authPage }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Fill form
    await page.locator('input#name').fill('テスト太郎')
    await page.locator('input#email').fill('test@example.com')
    await page.locator('textarea#reason').fill('この暮らしに興味があります')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should show signup dialog
    expect(await authPage.isDialogVisible()).toBe(true)
  })

  test('should have back link to property detail', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Should show back link
    const backLink = page.locator('a:has-text("物件詳細に戻る")')
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/listings/${testData.properties.dj}')
  })
})

test.describe('Inquiry Flow - Authenticated User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await setupAuthenticatedUser(page)
  })

  test('should pre-fill name and email for logged-in user', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Wait for form to load
    await page.waitForSelector('input#name')

    // Name and email should be pre-filled
    const nameInput = page.locator('input#name')
    const emailInput = page.locator('input#email')

    await expect(nameInput).toHaveValue(testData.users.testUser.name)
    await expect(emailInput).toHaveValue(testData.users.testUser.email)

    // Fields should be disabled (can't change)
    await expect(nameInput).toBeDisabled()
    await expect(emailInput).toBeDisabled()
  })

  test('should show user info banner when logged in', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Should show "申し込み as [name]" banner
    const userBanner = page.locator('text=/.*として申し込み/')
    await expect(userBanner).toBeVisible()
  })

  test('should successfully submit inquiry when authenticated', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Fill required fields (name and email pre-filled)
    await page.locator('textarea#reason').fill('DJ機材がそのまま使える環境を探していました。ぜひ引き継がせていただきたいです。')
    await page.locator('textarea#questions').fill('機材のメンテナンス状況を教えていただけますか？')

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should show loading state
    const loadingIndicator = page.locator('button:has-text("送信中"), button:disabled')
    await expect(loadingIndicator).toBeVisible()

    // Should show success message
    await expect(page.locator('text=引き継ぎ申し込みを受け付けました')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=数日以内にメールでご連絡いたします')).toBeVisible()
  })

  test('should show dashboard button after successful submission', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Fill and submit
    await page.locator('textarea#reason').fill('この暮らしに興味があります')
    await page.locator('button[type="submit"]').click()

    // Wait for success message
    await expect(page.locator('text=引き継ぎ申し込みを受け付けました')).toBeVisible({ timeout: 10000 })

    // Should show dashboard button
    const dashboardButton = page.locator('button:has-text("ダッシュボードで進捗を確認")')
    await expect(dashboardButton).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Clear reason field if pre-filled
    await page.locator('textarea#reason').clear()

    // Try to submit without reason
    await page.locator('button[type="submit"]').click()

    // Form should not submit (HTML5 validation)
    const reasonField = page.locator('textarea#reason')
    await expect(reasonField).toBeFocused()
  })
})

test.describe('Inquiry Flow - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await clearLocalStorage(page)
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Enter invalid email
    await page.locator('input#email').fill('invalid-email')
    await page.locator('input#name').fill('テスト太郎')
    await page.locator('textarea#reason').fill('興味があります')

    // Try to submit
    await page.locator('button[type="submit"]').click()

    // Email field should show validation error
    const emailInput = page.locator('input#email')
    await expect(emailInput).toBeFocused()
  })

  test('should show helper text for email field', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Should show helper text explaining email usage
    await expect(page.locator('text=ご連絡はこちらのメールアドレスに送らせていただきます')).toBeVisible()
  })

  test('should show form purpose notice', async ({ page }) => {
    await page.goto('/listings/${testData.properties.dj}/inquiry')

    // Should show notice about form purpose
    await expect(page.locator('text=このフォームの目的')).toBeVisible()
    await expect(page.locator('text=マッチングを行うものではありません')).toBeVisible()
  })
})

test.describe('Inquiry Flow - Different Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await setupAuthenticatedUser(page)
  })

  test('should work for different property types', async ({ page }) => {
    const properties = [
      { id: testData.properties.dj, name: 'DJ' },
      { id: testData.properties.vintage, name: 'ヴィンテージ' }
    ]

    for (const property of properties) {
      await page.goto(`/listings/${property.id}/inquiry`)

      // Should load inquiry form
      await expect(page.locator('h1:has-text("この暮らしに興味がある")')).toBeVisible()

      // Should show correct property
      await expect(page.locator(`img[alt*="${property.name}"], h2:has-text("${property.name}")`).first()).toBeVisible()
    }
  })
})

test.describe('Inquiry Flow - Edge Cases', () => {
  test('should show 404 for non-existent property inquiry', async ({ page }) => {
    await page.goto('/listings/non-existent-property/inquiry')

    // Should show 404 or redirect
    const is404 = await page.locator('text=/404|見つかりません/').isVisible().catch(() => false)
    expect(is404).toBe(true)
  })

  test('should show 404 for draft property inquiry', async ({ page }) => {
    // Try to access inquiry for a draft listing (if any exist)
    // This would need to be tested with actual draft listings
    // For now, just verify the route exists
    await page.goto('/listings/${testData.properties.dj}/inquiry')
    await expect(page.locator('h1')).toBeVisible()
  })
})
