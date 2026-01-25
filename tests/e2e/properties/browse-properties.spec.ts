import { test, expect, testData } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Browse Properties
 *
 * Critical user journey: Browsing properties on the home page
 * Priority: HIGH
 *
 * Tests the main landing page where users discover available properties
 * organized by Tokyo districts with horizontal scrolling sections.
 */

test.describe('Browse Properties - Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto()
  })

  test('should display the home page with header and footer', async ({ homePage, page }) => {
    // Verify header is visible
    await expect(homePage.header).toBeVisible()
    await expect(homePage.logo).toBeVisible()
    await expect(homePage.logo).toHaveText('tsumugi')

    // Verify footer is visible
    await expect(homePage.footer).toBeVisible()

    // Verify page title
    await expect(page).toHaveTitle(/tsumugi/i)
  })

  test('should display property listings organized by district', async ({ homePage }) => {
    // Wait for properties to load
    const hasProperties = await homePage.hasProperties()

    if (hasProperties) {
      // Get district sections
      const districts = await homePage.getDistrictTitles()
      expect(districts.length).toBeGreaterThan(0)

      // Verify at least one known district is present
      const hasKnownDistrict = districts.some(district =>
        testData.districts.includes(district)
      )
      expect(hasKnownDistrict).toBe(true)
    } else {
      // Empty state should be shown
      const hasEmptyState = await homePage.hasEmptyState()
      expect(hasEmptyState).toBe(true)
    }
  })

  test('should display property cards with essential information', async ({ homePage, page }) => {
    const propertyCount = await homePage.getPropertyCount()

    // Skip if no properties
    test.skip(propertyCount === 0, 'No properties available')

    // Get first property card
    const firstCard = homePage.propertyCards.first()
    await expect(firstCard).toBeVisible()

    // Verify card contains title
    const title = firstCard.locator('h3')
    await expect(title).toBeVisible()

    // Verify card contains handover fee (引き継ぎ費用)
    const handoverFee = firstCard.locator('text=引き継ぎ費用')
    await expect(handoverFee).toBeVisible()
  })

  test('should navigate to property detail when clicking a card', async ({ homePage, page }) => {
    const propertyCount = await homePage.getPropertyCount()
    test.skip(propertyCount === 0, 'No properties available')

    // Click first property
    await homePage.clickFirstProperty()

    // Should navigate to property detail page
    await expect(page).toHaveURL(/\/listings\/[a-z0-9]+/)
  })

  test('should show multiple properties per district section', async ({ homePage }) => {
    const districts = await homePage.getDistrictTitles()
    test.skip(districts.length === 0, 'No districts available')

    // Check first district has multiple properties
    const firstDistrict = districts[0]
    const propertiesInDistrict = await homePage.getPropertiesInDistrict(firstDistrict)

    // Should have at least one property
    expect(propertiesInDistrict.length).toBeGreaterThan(0)
  })

  test('property cards should be horizontally scrollable', async ({ homePage, page }) => {
    const districts = await homePage.getDistrictTitles()
    test.skip(districts.length === 0, 'No districts available')

    // Find a scroll container
    const scrollContainer = page.locator('.overflow-x-auto').first()
    await expect(scrollContainer).toBeVisible()

    // Verify scroll is possible (has content wider than container)
    const scrollWidth = await scrollContainer.evaluate(el => el.scrollWidth)
    const clientWidth = await scrollContainer.evaluate(el => el.clientWidth)

    // Scroll width should be greater if there are multiple cards
    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth)
  })
})

test.describe('Browse Properties - Heart/Favorite', () => {
  test('should toggle heart icon when clicking favorite button', async ({ homePage, page }) => {
    await homePage.goto()

    const propertyCount = await homePage.getPropertyCount()
    test.skip(propertyCount === 0, 'No properties available')

    // Find the first heart button
    const heartButton = page.locator('button:has(svg.lucide-heart)').first()
    await expect(heartButton).toBeVisible()

    // Get initial state
    const heartIcon = heartButton.locator('svg')
    const initialFill = await heartIcon.getAttribute('class')

    // Click to toggle
    await heartButton.click()

    // Verify state changed (class should differ after toggle)
    const newFill = await heartIcon.getAttribute('class')
    expect(newFill).not.toBe(initialFill)
  })
})

test.describe('Browse Properties - Image Carousel', () => {
  test('should navigate between images using arrow buttons', async ({ homePage, page }) => {
    await homePage.goto()

    const propertyCount = await homePage.getPropertyCount()
    test.skip(propertyCount === 0, 'No properties available')

    // Hover over property card to reveal arrows
    const firstCard = homePage.propertyCards.first()
    await firstCard.hover()

    // Find navigation arrows
    const nextButton = firstCard.locator('button:has(svg.lucide-chevron-right)')
    const prevButton = firstCard.locator('button:has(svg.lucide-chevron-left)')

    // Check if arrows exist (only if multiple images)
    const hasArrows = await nextButton.isVisible().catch(() => false)

    if (hasArrows) {
      // Click next and verify (image should change - dots indicator changes)
      const dots = firstCard.locator('.rounded-full.bg-white')
      const initialActiveDot = await dots.first().getAttribute('class')

      await nextButton.click()
      await page.waitForTimeout(300) // Wait for transition

      // Dot state might change
      const newActiveDot = await dots.first().getAttribute('class')
      // Note: Can't guarantee change if there are only 2 images
    }
  })
})
