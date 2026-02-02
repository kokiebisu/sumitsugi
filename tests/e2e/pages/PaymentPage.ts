import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Payment Page Object Model
 * Represents the payment flow pages for handling Stripe payments
 */
export class PaymentPage extends BasePage {
  // Main payment page elements
  readonly pageTitle: Locator
  readonly paymentFlowSection: Locator
  readonly feeBreakdownSection: Locator
  readonly paymentFormCard: Locator
  readonly trustIndicators: Locator

  // Payment steps (1-3)
  readonly applicationFeeStep: Locator
  readonly depositStep: Locator
  readonly remainingStep: Locator

  // Fee breakdown elements
  readonly handoverFeeTotal: Locator
  readonly sellerReceivesAmount: Locator
  readonly additionalCleaningFee: Locator
  readonly landlordIncentive: Locator
  readonly platformFee: Locator

  // Application fee form elements
  readonly applicationFeeFormCard: Locator
  readonly applicationFeeFormTitle: Locator
  readonly warningBanner: Locator
  readonly applicationFeeAmount: Locator
  readonly stripePaymentElement: Locator
  readonly submitButton: Locator
  readonly processingIndicator: Locator
  readonly errorMessage: Locator
  readonly loadingIndicator: Locator

  // Trust indicators
  readonly securePaymentBadge: Locator
  readonly escrowProtectionBadge: Locator
  readonly supportBadge: Locator

  // Terms links
  readonly termsLink: Locator
  readonly privacyLink: Locator

  constructor(page: Page) {
    super(page)

    // Main sections
    this.pageTitle = page.locator('h1')
    this.paymentFlowSection = page.locator('section:has(h2:text("お支払いの流れ")), [class*="Card"]:has-text("お支払いの流れ")')
    this.feeBreakdownSection = page.locator('section:has(h2:text("費用の内訳")), [class*="Card"]:has-text("費用の内訳")')
    this.paymentFormCard = page.locator('[class*="Card"]:has-text("申込金のお支払い")')
    this.trustIndicators = page.locator('[class*="Card"]:has-text("安全な決済")')

    // Payment steps
    this.applicationFeeStep = page.locator('[class*="rounded-lg"]:has-text("申込金のお支払い（現在のステップ）")')
    this.depositStep = page.locator('[class*="rounded-lg"]:has-text("デポジット（30%）")')
    this.remainingStep = page.locator('[class*="rounded-lg"]:has-text("残金（70%）")')

    // Fee breakdown
    this.handoverFeeTotal = page.locator('text=/引き継ぎ費用\\s+合計/').locator('..')
    this.sellerReceivesAmount = page.locator('text=前の住人が受け取る金額').locator('..').locator('span:last-child')
    this.additionalCleaningFee = page.locator('text=追加クリーニング費用').locator('..').locator('span:last-child')
    this.landlordIncentive = page.locator('text=大家さんインセンティブ').locator('..').locator('span:last-child')
    this.platformFee = page.locator('text=プラットフォーム手数料').locator('..').locator('span:last-child')

    // Application fee form
    this.applicationFeeFormCard = page.locator('[class*="Card"]:has-text("申込金のお支払い")').first()
    this.applicationFeeFormTitle = this.applicationFeeFormCard.locator('[class*="CardTitle"]')
    this.warningBanner = page.locator('[class*="bg-yellow"]:has-text("重要：申込金について")')
    this.applicationFeeAmount = page.locator('text=/申込金.*円/')
    this.stripePaymentElement = page.locator('#payment-element, [class*="StripeElement"], [id*="card-element"]')
    this.submitButton = page.locator('button[type="submit"]:has-text("円を支払う")')
    this.processingIndicator = page.locator('text=処理中...')
    this.errorMessage = page.locator('[class*="bg-red"]:has-text("エラー")')
    this.loadingIndicator = page.locator('text=読み込み中...')

    // Trust badges
    this.securePaymentBadge = page.locator('text=安全な決済').locator('..')
    this.escrowProtectionBadge = page.locator('text=エスクロー保護').locator('..')
    this.supportBadge = page.locator('text=トラブル対応').locator('..')

    // Terms
    this.termsLink = page.locator('a[href="/terms"]')
    this.privacyLink = page.locator('a[href="/privacy"]')
  }

  /**
   * Navigate to payment page for a specific property
   */
  async goto(propertyId: string) {
    await this.page.goto(`/properties/${propertyId}/payment`)
    await this.waitForPageLoad()
  }

  /**
   * Wait for the payment form to be fully loaded
   */
  async waitForPaymentFormLoad() {
    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})

    // Wait for either the payment element or an error to appear
    await Promise.race([
      this.stripePaymentElement.waitFor({ state: 'visible', timeout: 20000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 20000 }),
    ]).catch(() => {})
  }

  /**
   * Check if the payment page is loaded correctly
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the page title text
   */
  async getPageTitle(): Promise<string | null> {
    return await this.pageTitle.textContent()
  }

  /**
   * Get the application fee amount displayed
   */
  async getApplicationFeeAmount(): Promise<string | null> {
    const amountElement = this.page.locator('text=/\\d{1,3}(,\\d{3})*円を支払う/')
    const buttonText = await amountElement.textContent().catch(() => null)
    if (buttonText) {
      const match = buttonText.match(/(\d{1,3}(,\d{3})*)円/)
      return match ? match[1] : null
    }
    return null
  }

  /**
   * Check if payment steps are displayed correctly
   */
  async hasPaymentSteps(): Promise<{
    applicationFee: boolean
    deposit: boolean
    remaining: boolean
  }> {
    return {
      applicationFee: await this.applicationFeeStep.isVisible(),
      deposit: await this.depositStep.isVisible(),
      remaining: await this.remainingStep.isVisible(),
    }
  }

  /**
   * Check if fee breakdown is displayed
   */
  async hasFeeBreakdown(): Promise<boolean> {
    return await this.feeBreakdownSection.isVisible()
  }

  /**
   * Check if trust indicators are visible
   */
  async hasTrustIndicators(): Promise<{
    securePayment: boolean
    escrowProtection: boolean
    support: boolean
  }> {
    return {
      securePayment: await this.securePaymentBadge.isVisible(),
      escrowProtection: await this.escrowProtectionBadge.isVisible(),
      support: await this.supportBadge.isVisible(),
    }
  }

  /**
   * Check if warning banner about non-refundable payment is visible
   */
  async hasNonRefundableWarning(): Promise<boolean> {
    return await this.warningBanner.isVisible()
  }

  /**
   * Check if Stripe payment element is loaded
   */
  async isStripeElementLoaded(): Promise<boolean> {
    // Check for Stripe iframe or payment element
    const stripeIframe = this.page.locator('iframe[name*="stripe"], iframe[src*="stripe"]')
    const paymentElement = this.page.locator('[id*="payment-element"], [class*="StripeElement"]')

    return (
      await stripeIframe.count() > 0 ||
      await paymentElement.isVisible().catch(() => false)
    )
  }

  /**
   * Fill in test card details (for Stripe test mode)
   * Note: This requires Stripe Elements in test mode
   */
  async fillTestCardDetails(cardNumber: string = '4242424242424242') {
    // Stripe Elements are in iframes, need to handle specially
    const stripeIframe = this.page.locator('iframe[name*="__privateStripeFrame"]').first()
    const stripeFrame = stripeIframe.contentFrame()
    if (!stripeFrame) {
      throw new Error('Stripe frame not found')
    }

    // Fill card number
    await stripeFrame.locator('[name="cardnumber"], [placeholder*="card number" i]')
      .fill(cardNumber)
      .catch(() => {
        // Alternative selectors for different Stripe versions
      })

    // Fill expiry date (any future date)
    await stripeFrame.locator('[name="exp-date"], [placeholder*="MM" i]')
      .fill('12/30')
      .catch(() => {})

    // Fill CVC
    await stripeFrame.locator('[name="cvc"], [placeholder*="CVC" i]')
      .fill('123')
      .catch(() => {})

    // Fill postal code if required
    await stripeFrame.locator('[name="postal"], [placeholder*="postal" i], [placeholder*="ZIP" i]')
      .fill('12345')
      .catch(() => {})
  }

  /**
   * Submit the payment form
   */
  async submitPayment() {
    await this.submitButton.click()
  }

  /**
   * Check if payment is processing
   */
  async isProcessing(): Promise<boolean> {
    return await this.processingIndicator.isVisible()
  }

  /**
   * Wait for payment processing to complete
   */
  async waitForPaymentCompletion(timeoutMs: number = 30000) {
    await this.processingIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await this.processingIndicator.waitFor({ state: 'hidden', timeout: timeoutMs })
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return await this.errorMessage.textContent()
    }
    return null
  }

  /**
   * Check if payment form is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible()
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled()
  }

  /**
   * Click on terms of service link
   */
  async clickTermsLink() {
    await this.termsLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click on privacy policy link
   */
  async clickPrivacyLink() {
    await this.privacyLink.click()
    await this.page.waitForLoadState('networkidle')
  }
}
