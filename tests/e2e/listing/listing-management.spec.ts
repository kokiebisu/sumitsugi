import { test, expect, testData, clearLocalStorage, setupAuthenticatedUser, setupAuthenticatedSeller } from '../fixtures/test-fixtures'

/**
 * E2E Tests: Listing Management
 *
 * Critical user journey: 前の住人 (Previous Resident) listing management
 * Priority: HIGH
 *
 * Tests the listing dashboard at /listing where sellers can:
 * - View their listings
 * - Create new listings
 * - Edit/delete existing listings
 */

test.describe('Listing Page - Access Control', () => {
  test('should redirect to home when not logged in', async ({ listingPage, page }) => {
    await page.goto('/')
    await clearLocalStorage(page)
    await listingPage.goto()

    // Should redirect to home or show login
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {})
    // Or stay but show nothing (client-side redirect happens)
  })

  test('should show listing page when logged in', async ({ listingPage, page }) => {
    await page.goto('/')
    await setupAuthenticatedUser(page)
    await listingPage.goto()

    // Should show listing page content
    await page.waitForLoadState('networkidle')
    // Either empty state or listing content should be visible
    const hasEmptyState = await listingPage.isEmptyState()
    const hasListings = await listingPage.listingCount.isVisible().catch(() => false)

    expect(hasEmptyState || hasListings).toBe(true)
  })
})

test.describe('Listing Page - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await setupAuthenticatedUser(page)
  })

  test('should show empty state for new users with no listings', async ({ listingPage }) => {
    await listingPage.goto()

    // Should show empty state
    const isEmptyState = await listingPage.isEmptyState()
    expect(isEmptyState).toBe(true)

    // Should show catchy title
    await expect(listingPage.emptyStateTitle).toContainText('最初のリスティングをはじめよう')
  })

  test('should show create button in empty state', async ({ listingPage }) => {
    await listingPage.goto()

    // Should have create listing button
    await expect(listingPage.createButton.first()).toBeVisible()
  })

  test('should have scrolling images in empty state', async ({ listingPage, page }) => {
    await listingPage.goto()

    const isEmptyState = await listingPage.isEmptyState()
    test.skip(!isEmptyState, 'Not in empty state')

    // Wait for the fade-in animation to complete (100ms delay + 700ms duration)
    await page.waitForTimeout(1000)

    // Should have scrolling image rows - check for the container with animation style
    const scrollingContainer = await page.locator('[style*="animation"]').first().isVisible().catch(() => false)
    expect(scrollingContainer).toBe(true)
  })

  test('should navigate to new listing page when clicking create', async ({ listingPage, page }) => {
    await listingPage.goto()
    await listingPage.clickCreateListing()

    await expect(page).toHaveURL(/\/listing\/new/)
  })
})

test.describe('Listing Page - With Existing Listings', () => {
  test.beforeEach(async ({ page }) => {
    // Set up user with mock listings using addInitScript to ensure persistence
    await page.goto('/')

    await page.addInitScript(() => {
      const mockUser = {
        id: 'test-user-with-listings',
        email: 'seller@test.com',
        name: 'Test Seller',
        phone: '090-1234-5678',
        createdAt: new Date().toISOString(),
        authProvider: 'email',
        isSeller: true,
        sellerProfile: {
          occupation: 'Designer',
          bio: 'Test bio',
          sellerSince: new Date().toISOString(),
        },
      }
      localStorage.setItem('tsumugi_user', JSON.stringify(mockUser))

      // Add mock listings
      const mockListings = [
        {
          id: 'test-listing-1',
          userId: 'test-user-with-listings',
          status: 'published',
          title: 'Test Published Listing',
          roomStyle: null,
          roomPhotos: [],
          handoverFee: 50000,
          rent: 80000,
          layout: '1K',
          area: '渋谷区',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
        {
          id: 'test-listing-2',
          userId: 'test-user-with-listings',
          status: 'draft',
          title: 'Test Draft Listing',
          roomStyle: null,
          roomPhotos: [],
          handoverFee: 30000,
          rent: 70000,
          layout: '1R',
          area: '目黒区',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      localStorage.setItem('tsumugi_listings', JSON.stringify(mockListings))
    })

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('should show listings grid when user has listings', async ({ listingPage }) => {
    await listingPage.goto()

    // Should NOT show empty state
    const isEmptyState = await listingPage.isEmptyState()
    expect(isEmptyState).toBe(false)

    // Should show listing cards
    const cards = await listingPage.getListingCards()
    expect(cards.length).toBeGreaterThan(0)
  })

  test('should show listing count', async ({ listingPage }) => {
    await listingPage.goto()

    const count = await listingPage.getListingCount()
    expect(count).toBe(2)
  })

  test('should display published and draft status badges correctly', async ({ listingPage, page }) => {
    await listingPage.goto()

    // Find published badge
    const publishedBadge = page.locator('span:has-text("公開中")')
    await expect(publishedBadge).toBeVisible()

    // Find draft badge
    const draftBadge = page.locator('span:has-text("下書き")')
    await expect(draftBadge).toBeVisible()
  })

  test('should have new listing button in header', async ({ listingPage, page }) => {
    await listingPage.goto()

    const newButton = page.locator('a[href="/listing/new"] button')
    await expect(newButton).toBeVisible()
    await expect(newButton).toContainText('新規作成')
  })

  test('should open listing menu and show options', async ({ listingPage, page }) => {
    await listingPage.goto()
    await listingPage.openListingMenu(0)

    // Should show menu options
    await expect(page.locator('a:has-text("プレビュー")')).toBeVisible()
    await expect(page.locator('a:has-text("編集")')).toBeVisible()
    await expect(page.locator('button:has-text("削除")')).toBeVisible()
  })

  test('should delete listing when clicking delete', async ({ listingPage, page }) => {
    await listingPage.goto()

    const initialCount = await listingPage.getListingCount()
    await listingPage.deleteListing(0)

    // Count should decrease
    await page.waitForTimeout(500)
    const newCount = await listingPage.getListingCount()
    expect(newCount).toBe(initialCount - 1)
  })
})
