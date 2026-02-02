import { test, expect, testData } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Property Detail Page
 *
 * Critical user journey: Viewing individual property details
 * Priority: HIGH
 *
 * Tests the property detail page showing full property information,
 * image gallery, furniture list, map, and sidebar with pricing.
 */

test.describe('Property Detail Page @properties @critical', () => {
  test('should display property detail page with all sections', async ({ propertyDetailPage }) => {
    // Navigate to a known property
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Verify page loaded
    const isLoaded = await propertyDetailPage.isLoaded()
    expect(isLoaded).toBe(true)

    // Verify title is visible
    await expect(propertyDetailPage.propertyTitle).toBeVisible()
    const title = await propertyDetailPage.getTitle()
    expect(title).toContain('アート')
  })

  test('should display image gallery with multiple images', async ({ propertyDetailPage }) => {
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Check images are displayed
    const hasGallery = await propertyDetailPage.hasImageGallery()
    expect(hasGallery).toBe(true)

    // Get all images
    const images = await propertyDetailPage.getGalleryImages()
    expect(images.length).toBeGreaterThan(0)
  })

  test('should display property information section', async ({ propertyDetailPage, page }) => {
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Verify property info section exists
    await expect(propertyDetailPage.propertyInfoSection).toBeVisible()

    // Verify layout is displayed
    const layout = await propertyDetailPage.getLayout()
    expect(layout).toBeTruthy()

    // Check for occupancy info (if present)
    const occupancy = await propertyDetailPage.getOccupancy()
    // This property should have occupancy
    expect(occupancy).toContain('1人')
  })

  test('should display furniture section with handover items', async ({ propertyDetailPage }) => {
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Verify furniture section exists
    await expect(propertyDetailPage.furnitureSection).toBeVisible()

    // Get furniture items
    const furniture = await propertyDetailPage.getFurnitureItems()
    expect(furniture.length).toBeGreaterThan(0)

    // Should include expected furniture types
    const hasExpectedFurniture = furniture.some(item =>
      ['ベッド', 'デスク', '収納'].includes(item)
    )
    expect(hasExpectedFurniture).toBe(true)
  })

  test('should display location map section', async ({ propertyDetailPage, page }) => {
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Wait for page to fully load and scroll to map section if needed
    await page.waitForLoadState('networkidle')

    // Verify map section heading exists (the section itself might take time to load the map)
    await expect(page.locator('h2:text("ロケーション")')).toBeVisible({ timeout: 10000 })
  })

  test('should have back link to return to listings', async ({ propertyDetailPage, page }) => {
    await propertyDetailPage.goto(testData.properties.bohemian)

    // Verify back link exists
    await expect(propertyDetailPage.backLink).toBeVisible()

    // Click back link
    await propertyDetailPage.goBack()

    // Should navigate to home
    await expect(page).toHaveURL('/')
  })

  test('should show 404 for non-existent property', async ({ page }) => {
    await page.goto('/listings/non-existent-property-id')
    await page.waitForLoadState('networkidle')

    // The page should either show 404 content or redirect to home
    const url = page.url()
    const isOnHomePage = url === 'http://localhost:3000/' || url.endsWith('/')
    const hasNotFoundText = await page.locator('text=/404|見つかりません|not found/i').isVisible().catch(() => false)

    // Either should show 404 text or redirect to home
    expect(isOnHomePage || hasNotFoundText).toBe(true)
  })
})

test.describe('Property Detail - Different Property Types @properties @extended', () => {
  test('should display DJ/Producer property correctly', async ({ propertyDetailPage }) => {
    await propertyDetailPage.goto(testData.properties.dj)

    const title = await propertyDetailPage.getTitle()
    expect(title).toContain('DJ')

    const layout = await propertyDetailPage.getLayout()
    expect(layout).toBe('1LDK')
  })

  test('should display vintage property correctly', async ({ propertyDetailPage }) => {
    await propertyDetailPage.goto(testData.properties.vintage)

    const title = await propertyDetailPage.getTitle()
    expect(title).toContain('ヴィンテージ')

    const layout = await propertyDetailPage.getLayout()
    expect(layout).toBe('1K')
  })
})

test.describe('Property Detail - Navigation Flow @properties @quarantine', () => {
  test('should navigate from home to detail and back', async ({ homePage, page }) => {
    // Start at home
    await homePage.goto()

    const propertyCount = await homePage.getPropertyCount()
    test.skip(propertyCount === 0, 'No properties available')

    // Click first property
    await homePage.clickFirstProperty()

    // Verify on detail page
    await expect(page).toHaveURL(/\/listings\//)

    // Go back
    await page.locator('a:has-text("リスティング")').click()

    // Should be back at home
    await expect(page).toHaveURL('/')
  })
})
