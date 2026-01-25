import { Page, Locator, expect } from '@playwright/test'

/**
 * Base Page Object Model class
 * Provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page
  readonly header: Locator
  readonly footer: Locator
  readonly logo: Locator
  readonly menuButton: Locator
  readonly menuDropdown: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('header')
    this.footer = page.locator('footer')
    this.logo = page.locator('header a:has-text("tsumugi")')
    this.menuButton = page.locator('header button.rounded-full:has(svg.lucide-menu)')
    this.menuDropdown = page.locator('[role="menu"]')
  }

  /**
   * Navigate to home page
   */
  async goHome() {
    await this.logo.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Open the user menu dropdown
   */
  async openMenu() {
    await this.menuButton.waitFor({ state: 'visible', timeout: 5000 })
    await this.menuButton.click()
    await expect(this.menuDropdown).toBeVisible({ timeout: 5000 })
  }

  /**
   * Check if user is logged in by checking menu content
   */
  async isLoggedIn(): Promise<boolean> {
    await this.openMenu()
    const logoutButton = this.page.locator('[role="menuitem"]:has-text("logout")', { hasText: /logout/i })
    const isVisible = await logoutButton.isVisible().catch(() => false)
    // Close menu by clicking elsewhere
    await this.page.keyboard.press('Escape')
    return isVisible
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/e2e/artifacts/${name}.png`, fullPage: true })
  }
}
