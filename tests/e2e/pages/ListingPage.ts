import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Listing Management Page Object Model
 * For the /listing page where 前の住人 (previous residents) manage their listings
 */
export class ListingPage extends BasePage {
  readonly createButton: Locator
  readonly emptyStateTitle: Locator
  readonly listingCards: Locator
  readonly listingCount: Locator
  readonly newListingButton: Locator
  readonly scrollingImages: Locator

  constructor(page: Page) {
    super(page)
    this.createButton = page.locator('a[href="/listing/new"] button, a:has-text("リスティングを作成")')
    this.emptyStateTitle = page.locator('h1:has-text("最初のリスティングをはじめよう")')
    this.listingCards = page.locator('.group.relative.bg-white.rounded-2xl')
    // Listing count is shown in a badge next to "リスティング" tab
    this.listingCount = page.locator('button:has-text("リスティング") span.rounded-full')
    this.newListingButton = page.locator('a[href="/listing/new"]')
    this.scrollingImages = page.locator('[style*="animation: scrollLeft"], [style*="animation: scrollRight"]')
  }

  /**
   * Navigate to listing management page
   */
  async goto() {
    await this.page.goto('/listing')
    await this.waitForPageLoad()
  }

  /**
   * Check if page is in empty state (no listings)
   */
  async isEmptyState(): Promise<boolean> {
    return await this.emptyStateTitle.isVisible()
  }

  /**
   * Get the number of listings from the badge in the tab
   */
  async getListingCount(): Promise<number> {
    const countText = await this.listingCount.textContent()
    if (!countText) return 0
    // Count is just a number in the badge, e.g. "2"
    return parseInt(countText.trim(), 10) || 0
  }

  /**
   * Click to create a new listing
   */
  async clickCreateListing() {
    await this.createButton.first().click()
    await this.page.waitForURL('**/listing/new')
  }

  /**
   * Get all listing cards
   */
  async getListingCards(): Promise<Locator[]> {
    return await this.listingCards.all()
  }

  /**
   * Get listing card data by index
   */
  async getListingCardData(index: number) {
    const cards = await this.listingCards.all()
    if (!cards[index]) {
      throw new Error(`Listing card at index ${index} not found`)
    }
    const card = cards[index]

    const title = await card.locator('h3').textContent()
    const statusBadge = await card.locator('span[class*="rounded-full"]').textContent()
    const dateInfo = await card.locator('p.text-sm.text-muted-foreground').textContent()

    return {
      title,
      status: statusBadge?.includes('公開中') ? 'published' : 'draft',
      dateInfo,
    }
  }

  /**
   * Open the menu for a specific listing
   */
  async openListingMenu(index: number) {
    const cards = await this.listingCards.all()
    if (!cards[index]) {
      throw new Error(`Listing card at index ${index} not found`)
    }
    await cards[index].locator('button:has(svg)').click()
  }

  /**
   * Delete a listing by index
   */
  async deleteListing(index: number) {
    await this.openListingMenu(index)
    await this.page.locator('button:has-text("削除")').click()
  }

  /**
   * Preview a listing by index
   */
  async previewListing(index: number) {
    await this.openListingMenu(index)
    await this.page.locator('a:has-text("プレビュー")').click()
    await this.waitForPageLoad()
  }

  /**
   * Edit a listing by index
   */
  async editListing(index: number) {
    await this.openListingMenu(index)
    await this.page.locator('a:has-text("編集")').click()
    await this.waitForPageLoad()
  }
}
