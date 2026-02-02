import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Payment Confirmation Page Object Model
 * Represents the payment success/failure confirmation pages
 */
export class PaymentConfirmationPage extends BasePage {
  // Success state elements
  readonly successIcon: Locator
  readonly successTitle: Locator
  readonly successMessage: Locator
  readonly paymentDetailsCard: Locator
  readonly transactionId: Locator
  readonly paymentAmount: Locator
  readonly paymentDate: Locator

  // Next steps after success
  readonly nextStepsSection: Locator
  readonly messagingLink: Locator
  readonly dashboardLink: Locator
  readonly propertyLink: Locator

  // Failure state elements
  readonly errorIcon: Locator
  readonly errorTitle: Locator
  readonly errorMessage: Locator
  readonly errorCode: Locator
  readonly retryButton: Locator
  readonly contactSupportLink: Locator

  // Common elements
  readonly backToPropertyButton: Locator
  readonly homeButton: Locator

  constructor(page: Page) {
    super(page)

    // Success elements
    this.successIcon = page.locator('svg.text-green-500, [class*="text-green"]:has(svg)')
    this.successTitle = page.locator('h1:has-text("支払いが完了しました"), h2:has-text("支払いが完了しました")')
    this.successMessage = page.locator('text=申込金のお支払いが正常に処理されました')
    this.paymentDetailsCard = page.locator('[class*="Card"]:has-text("お支払い詳細")')
    this.transactionId = page.locator('text=取引ID').locator('..').locator('span:last-child, p:last-child')
    this.paymentAmount = page.locator('text=お支払い金額').locator('..').locator('span:last-child, p:last-child')
    this.paymentDate = page.locator('text=お支払い日時').locator('..').locator('span:last-child, p:last-child')

    // Next steps
    this.nextStepsSection = page.locator('[class*="Card"]:has-text("次のステップ")')
    this.messagingLink = page.locator('a:has-text("メッセージを送る")')
    this.dashboardLink = page.locator('a:has-text("ダッシュボード"), a[href="/dashboard"]')
    this.propertyLink = page.locator('a:has-text("物件に戻る")')

    // Error elements
    this.errorIcon = page.locator('svg.text-red-500, [class*="text-red"]:has(svg)')
    this.errorTitle = page.locator('h1:has-text("支払いに失敗しました"), h2:has-text("支払いに失敗しました")')
    this.errorMessage = page.locator('[class*="bg-red"]:has-text("エラー"), [class*="text-red"]:has-text("失敗")')
    this.errorCode = page.locator('text=エラーコード').locator('..').locator('code, span:last-child')
    this.retryButton = page.locator('button:has-text("再試行"), button:has-text("もう一度試す")')
    this.contactSupportLink = page.locator('a:has-text("サポートに連絡")')

    // Common
    this.backToPropertyButton = page.locator('button:has-text("物件に戻る"), a:has-text("物件に戻る")')
    this.homeButton = page.locator('a:has-text("ホームに戻る"), button:has-text("ホームに戻る")')
  }

  /**
   * Wait for the confirmation page to be loaded
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle')
    // Wait for either success or error state
    await Promise.race([
      this.successTitle.waitFor({ state: 'visible', timeout: 10000 }),
      this.errorTitle.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {})
  }

  /**
   * Check if payment was successful
   */
  async isSuccess(): Promise<boolean> {
    return await this.successTitle.isVisible()
  }

  /**
   * Check if payment failed
   */
  async isFailure(): Promise<boolean> {
    return await this.errorTitle.isVisible()
  }

  /**
   * Get the payment confirmation status from URL params
   */
  async getStatusFromUrl(): Promise<'success' | 'failure' | 'cancelled' | null> {
    const url = new URL(this.page.url())
    const payment = url.searchParams.get('payment')

    if (payment === 'success') return 'success'
    if (payment === 'failure' || payment === 'failed') return 'failure'
    if (payment === 'cancelled' || payment === 'canceled') return 'cancelled'

    return null
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string | null> {
    if (await this.successMessage.isVisible()) {
      return await this.successMessage.textContent()
    }
    return null
  }

  /**
   * Get error message text
   */
  async getErrorMessageText(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent()
    }
    return null
  }

  /**
   * Get transaction ID from success page
   */
  async getTransactionId(): Promise<string | null> {
    if (await this.transactionId.isVisible()) {
      return await this.transactionId.textContent()
    }
    return null
  }

  /**
   * Get payment amount from confirmation
   */
  async getPaymentAmount(): Promise<string | null> {
    if (await this.paymentAmount.isVisible()) {
      return await this.paymentAmount.textContent()
    }
    return null
  }

  /**
   * Check if next steps section is visible
   */
  async hasNextSteps(): Promise<boolean> {
    return await this.nextStepsSection.isVisible()
  }

  /**
   * Click retry button (on failure page)
   */
  async clickRetry() {
    await this.retryButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click to return to property page
   */
  async clickBackToProperty() {
    await this.backToPropertyButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click to go to dashboard
   */
  async clickDashboard() {
    await this.dashboardLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click to go home
   */
  async clickHome() {
    await this.homeButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if contact support link is visible
   */
  async hasContactSupport(): Promise<boolean> {
    return await this.contactSupportLink.isVisible()
  }

  /**
   * Check if payment details are displayed
   */
  async hasPaymentDetails(): Promise<boolean> {
    return await this.paymentDetailsCard.isVisible()
  }
}
