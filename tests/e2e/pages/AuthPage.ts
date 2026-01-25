import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Auth Page Object Model
 * Handles authentication dialogs and login/signup flows
 */
export class AuthPage extends BasePage {
  readonly signupDialog: Locator
  readonly dialogTitle: Locator
  readonly emailInput: Locator
  readonly continueButton: Locator
  readonly phoneButton: Locator
  readonly socialButtons: {
    facebook: Locator
    google: Locator
    apple: Locator
  }
  readonly closeButton: Locator
  readonly processingIndicator: Locator
  readonly menuLoginButton: Locator
  readonly menuLogoutButton: Locator
  readonly becomeSellerButton: Locator

  constructor(page: Page) {
    super(page)
    this.signupDialog = page.locator('.fixed.inset-0.z-50')
    this.dialogTitle = this.signupDialog.locator('h2')
    this.emailInput = this.signupDialog.locator('input[type="email"]')
    this.continueButton = this.signupDialog.locator('button[type="submit"]')
    this.phoneButton = this.signupDialog.locator('button:has-text("電話番号で続行")')
    this.socialButtons = {
      facebook: this.signupDialog.locator('button:has(svg[fill="#1877F2"])'),
      google: this.signupDialog.locator('button:has(svg path[fill="#4285F4"])'),
      apple: this.signupDialog.locator('button:has(svg path[d*="M17.05"])'),
    }
    this.closeButton = this.signupDialog.locator('button:has(svg.h-4.w-4)')
    this.processingIndicator = this.signupDialog.locator('text=処理中...')
    this.menuLoginButton = page.locator('[role="menuitem"]:has-text("ログインまたは登録")')
    this.menuLogoutButton = page.locator('[role="menuitem"]:has-text("ログアウト")')
    this.becomeSellerButton = page.locator('button:has-text("暮らしを譲る"), [role="menuitem"]:has-text("暮らしを譲る")')
  }

  /**
   * Open the login/signup dialog via header menu
   */
  async openLoginDialog() {
    await this.openMenu()
    await this.menuLoginButton.click()
    await expect(this.signupDialog).toBeVisible()
  }

  /**
   * Login with email
   */
  async loginWithEmail(email: string) {
    await this.emailInput.fill(email)
    await this.continueButton.click()
    // Wait for processing to complete
    await this.processingIndicator.waitFor({ state: 'visible' }).catch(() => {})
    await this.processingIndicator.waitFor({ state: 'hidden', timeout: 10000 })
    await this.signupDialog.waitFor({ state: 'hidden', timeout: 5000 })
  }

  /**
   * Login with social provider (Facebook, Google, Apple)
   */
  async loginWithSocial(provider: 'facebook' | 'google' | 'apple') {
    await this.socialButtons[provider].click()
    // Wait for processing to complete
    await this.processingIndicator.waitFor({ state: 'visible' }).catch(() => {})
    await this.processingIndicator.waitFor({ state: 'hidden', timeout: 10000 })
    await this.signupDialog.waitFor({ state: 'hidden', timeout: 5000 })
  }

  /**
   * Close the signup dialog
   */
  async closeDialog() {
    if (await this.signupDialog.isVisible()) {
      await this.closeButton.click()
      await this.signupDialog.waitFor({ state: 'hidden' })
    }
  }

  /**
   * Logout the current user
   */
  async logout() {
    await this.openMenu()
    await this.menuLogoutButton.click()
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(500) // Give time for React state to update
  }

  /**
   * Check if signup dialog is visible
   */
  async isDialogVisible(): Promise<boolean> {
    return await this.signupDialog.isVisible()
  }

  /**
   * Click "暮らしを譲る" (Become a seller) button
   * This should trigger login for unauthenticated users
   */
  async clickBecomeSeller() {
    // First check if it's in header (not logged in, not a seller)
    const headerButton = this.page.locator('button:has-text("暮らしを譲る")').first()
    if (await headerButton.isVisible()) {
      await headerButton.click()
    } else {
      // Try via menu
      await this.openMenu()
      await this.becomeSellerButton.click()
    }
  }

  /**
   * Complete a full login flow with email
   */
  async completeEmailLogin(email: string = 'test@example.com') {
    await this.openLoginDialog()
    await this.loginWithEmail(email)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if user menu shows logged-in state
   */
  async isUserLoggedIn(): Promise<boolean> {
    await this.openMenu()
    const hasLogout = await this.menuLogoutButton.isVisible()
    await this.page.keyboard.press('Escape')
    return hasLogout
  }
}
