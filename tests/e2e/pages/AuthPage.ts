import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Auth Page Object Model
 * Handles Magic Link authentication dialog and login/logout flows
 */
export class AuthPage extends BasePage {
  readonly signupDialog: Locator;
  readonly dialogTitle: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly closeButton: Locator;
  readonly submittingIndicator: Locator;
  readonly emailSentConfirmation: Locator;
  readonly emailSentMessage: Locator;
  readonly emailSentCloseButton: Locator;
  readonly errorMessage: Locator;
  readonly menuLoginButton: Locator;
  readonly menuLogoutButton: Locator;
  readonly becomeSellerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signupDialog = page.locator('.fixed.inset-0.z-50');
    this.dialogTitle = this.signupDialog.locator('h2');
    this.emailInput = this.signupDialog.locator('input[type="email"]');
    this.submitButton = this.signupDialog.locator('button[type="submit"]');
    this.closeButton = this.signupDialog.locator('button:has(svg.h-4.w-4)');
    this.submittingIndicator = this.signupDialog.locator('text=送信中...');
    this.emailSentConfirmation =
      this.signupDialog.locator('text=メールを送信しました');
    this.emailSentMessage = this.signupDialog.locator(
      'text=にログインリンクを送信しました。'
    );
    this.emailSentCloseButton = this.signupDialog.locator(
      'button:has-text("閉じる")'
    );
    this.errorMessage = this.signupDialog.locator('.text-red-500');
    this.menuLoginButton = page.locator(
      '[role="menuitem"]:has-text("ログインまたは登録")'
    );
    this.menuLogoutButton = page.locator(
      '[role="menuitem"]:has-text("ログアウト")'
    );
    this.becomeSellerButton = page.locator(
      'button:has-text("暮らしを譲る"), [role="menuitem"]:has-text("暮らしを譲る")'
    );
  }

  /**
   * Open the login/signup dialog via header menu
   */
  async openLoginDialog() {
    await this.openMenu();
    await this.menuLoginButton.click();
    await expect(this.signupDialog).toBeVisible();
  }

  /**
   * Fill email and submit the magic link form
   */
  async submitMagicLinkRequest(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Close the signup dialog
   */
  async closeDialog() {
    if (await this.signupDialog.isVisible()) {
      await this.closeButton.click();
      await this.signupDialog.waitFor({ state: 'hidden' });
    }
  }

  /**
   * Logout the current user
   */
  async logout() {
    await this.openMenu();
    await this.menuLogoutButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if signup dialog is visible
   */
  async isDialogVisible(): Promise<boolean> {
    return await this.signupDialog.isVisible();
  }

  /**
   * Click "暮らしを譲る" (Become a seller) button
   */
  async clickBecomeSeller() {
    const headerButton = this.page.locator(
      'header button:has-text("暮らしを譲る")'
    );
    if (await headerButton.isVisible()) {
      await headerButton.click();
    } else {
      await this.openMenu();
      const menuItem = this.page.locator(
        '[role="menuitem"]:has-text("暮らしを譲る")'
      );
      await menuItem.click();
    }
  }

  /**
   * Check if user menu shows logged-in state
   */
  async isUserLoggedIn(): Promise<boolean> {
    await this.openMenu();
    const hasLogout = await this.menuLogoutButton.isVisible();
    await this.page.keyboard.press('Escape');
    return hasLogout;
  }

  /**
   * Mock the magic link API endpoint to return success
   */
  async mockMagicLinkSuccess() {
    await this.page.route('**/api/auth/sign-in/magic-link', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: true }),
      });
    });
  }

  /**
   * Mock the magic link API endpoint to return an error
   */
  async mockMagicLinkError(errorMessage: string = 'エラーが発生しました') {
    await this.page.route('**/api/auth/sign-in/magic-link', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: errorMessage },
        }),
      });
    });
  }
}
