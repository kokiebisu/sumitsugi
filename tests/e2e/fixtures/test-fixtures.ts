import { test as base, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'
import { PropertyDetailPage } from '../pages/PropertyDetailPage'
import { AuthPage } from '../pages/AuthPage'
import { ListingPage } from '../pages/ListingPage'
import { NewListingPage } from '../pages/NewListingPage'

/**
 * Custom test fixtures for tsumugi E2E tests
 * Provides pre-configured page objects for all tests
 */
export const test = base.extend<{
  homePage: HomePage
  propertyDetailPage: PropertyDetailPage
  authPage: AuthPage
  listingPage: ListingPage
  newListingPage: NewListingPage
}>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page)
    await use(homePage)
  },
  propertyDetailPage: async ({ page }, use) => {
    const propertyDetailPage = new PropertyDetailPage(page)
    await use(propertyDetailPage)
  },
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page)
    await use(authPage)
  },
  listingPage: async ({ page }, use) => {
    const listingPage = new ListingPage(page)
    await use(listingPage)
  },
  newListingPage: async ({ page }, use) => {
    const newListingPage = new NewListingPage(page)
    await use(newListingPage)
  },
})

export { expect }

/**
 * Test data for various scenarios
 */
export const testData = {
  // Known property IDs from the mock data
  properties: {
    bohemian: '1368794573069214647', // Bohemian apartment in Nakameguro
    dj: '1368794573069214648', // DJ/Producer space in Ebisu
    vintage: '1368794573069214649', // Vintage furniture in Koenji
    artist: '1368794573069214650', // Artist atelier
  },

  // Test user credentials
  users: {
    testUser: {
      email: 'test@tsumugi.example.com',
      name: 'Test User',
    },
    seller: {
      email: 'seller@tsumugi.example.com',
      name: 'Test Seller',
    },
  },

  // Tokyo districts that should appear on home page
  districts: [
    '渋谷区',
    '目黒区',
    '港区',
    '世田谷区',
    '杉並区',
  ],

  // Layout options
  layouts: ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK'],

  // Furniture options (Japanese labels)
  furniture: {
    bed: 'ベッド',
    sofa: 'ソファ',
    desk: 'デスク',
    storage: '収納',
    table: 'テーブル',
    wardrobe: 'ワードローブ',
    tv: 'テレビ台',
    fridge: '冷蔵庫',
  },
}

/**
 * Helper to clear localStorage (for clean test state)
 */
export async function clearLocalStorage(page: any) {
  await page.evaluate(() => {
    localStorage.clear()
  }).catch(() => {
    // Ignore if localStorage is not accessible (e.g., about:blank or file://)
  })
}

/**
 * Helper to set up authenticated user state
 */
export async function setupAuthenticatedUser(page: any, user = testData.users.testUser) {
  // Add localStorage state before navigating
  await page.addInitScript((userData: typeof user) => {
    const mockUser = {
      id: 'test-user-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-1234-5678',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: false,
    }
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser))
  }, user)

  // Reload the page so the init script runs
  await page.reload()
  await page.waitForLoadState('networkidle')
  // Give React time to hydrate and initialize auth context
  await page.waitForTimeout(500)
}

/**
 * Helper to set up authenticated seller user state
 */
export async function setupAuthenticatedSeller(page: any, user = testData.users.seller) {
  // Add localStorage state before navigating
  await page.addInitScript((userData: typeof user) => {
    const mockUser = {
      id: 'test-seller-' + Date.now(),
      email: userData.email,
      name: userData.name,
      phone: '090-1234-5678',
      createdAt: new Date().toISOString(),
      authProvider: 'email',
      isSeller: true,
      sellerProfile: {
        occupation: 'Designer',
        bio: 'Test seller bio',
        sellerSince: new Date().toISOString(),
      },
    }
    localStorage.setItem('tsumugi_user', JSON.stringify(mockUser))
  }, user)

  // Reload the page so the init script runs
  await page.reload()
  await page.waitForLoadState('networkidle')
  // Give React time to hydrate and initialize auth context
  await page.waitForTimeout(500)
}
