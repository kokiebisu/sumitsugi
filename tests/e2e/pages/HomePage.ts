import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Home Page Object Model
 * Represents the main landing page with property listings by district
 */
export class HomePage extends BasePage {
  readonly mainContent: Locator
  readonly scrollSections: Locator
  readonly propertyCards: Locator
  readonly noPropertiesMessage: Locator
  readonly districtHeaders: Locator

  constructor(page: Page) {
    super(page)
    this.mainContent = page.locator('main')
    this.scrollSections = page.locator('section')
    this.propertyCards = page.locator('a[href^="/listings/"]')
    this.noPropertiesMessage = page.locator('text=公開中の物件はありません')
    this.districtHeaders = page.locator('section h2')
  }

  /**
   * Navigate to home page
   */
  async goto() {
    await this.page.goto('/')
    await this.waitForPageLoad()
  }

  /**
   * Get all district section titles
   */
  async getDistrictTitles(): Promise<string[]> {
    const headers = await this.districtHeaders.all()
    const titles: string[] = []
    for (const header of headers) {
      const text = await header.textContent()
      if (text) titles.push(text)
    }
    return titles
  }

  /**
   * Get the count of visible property cards
   */
  async getPropertyCount(): Promise<number> {
    // Wait for at least one property to appear
    await this.propertyCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    return await this.propertyCards.count()
  }

  /**
   * Get all property card elements
   */
  async getPropertyCards(): Promise<Locator[]> {
    return await this.propertyCards.all()
  }

  /**
   * Click on a property card by index
   */
  async clickProperty(index: number) {
    const cards = await this.propertyCards.all()
    if (cards[index]) {
      await cards[index].click()
      await this.page.waitForLoadState('networkidle')
    } else {
      throw new Error(`Property card at index ${index} not found`)
    }
  }

  /**
   * Click on the first property card
   */
  async clickFirstProperty() {
    await this.clickProperty(0)
  }

  /**
   * Get property card data (title, price, etc)
   */
  async getPropertyCardData(index: number) {
    const cards = await this.propertyCards.all()
    if (!cards[index]) {
      throw new Error(`Property card at index ${index} not found`)
    }
    const card = cards[index]

    const title = await card.locator('h3').textContent()
    const handoverFeeText = await card.locator('text=transfer cost').textContent().catch(() => null)
    const rentText = await card.locator('text=rent').textContent().catch(() => null)
    const locationText = await card.locator('p:last-child').textContent()

    return {
      title,
      handoverFeeText,
      rentText,
      locationText,
    }
  }

  /**
   * Check if properties are displayed
   */
  async hasProperties(): Promise<boolean> {
    const count = await this.getPropertyCount()
    return count > 0
  }

  /**
   * Check if empty state is displayed
   */
  async hasEmptyState(): Promise<boolean> {
    return await this.noPropertiesMessage.isVisible()
  }

  /**
   * Scroll to a specific district section
   */
  async scrollToDistrict(districtName: string) {
    const section = this.page.locator(`section:has(h2:text("${districtName}"))`)
    await section.scrollIntoViewIfNeeded()
  }

  /**
   * Get property cards within a specific district
   */
  async getPropertiesInDistrict(districtName: string): Promise<Locator[]> {
    const section = this.page.locator(`section:has(h2:text("${districtName}"))`)
    return await section.locator('a[href^="/listings/"]').all()
  }
}
