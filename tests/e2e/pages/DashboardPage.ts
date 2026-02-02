import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Dashboard Page Object Model
 * Represents the user dashboard showing inquiry and payment status
 */
export class DashboardPage extends BasePage {
  // Main elements
  readonly pageTitle: Locator
  readonly pageDescription: Locator
  readonly emptyState: Locator
  readonly emptyStateIcon: Locator
  readonly browsePropertiesLink: Locator

  // Inquiry cards
  readonly inquiryCards: Locator
  readonly propertyTitles: Locator
  readonly submissionDates: Locator
  readonly progressBars: Locator

  // Status indicators
  readonly pendingStatusBadge: Locator
  readonly reviewingStatusBadge: Locator
  readonly approvedStatusBadge: Locator
  readonly completedStatusBadge: Locator
  readonly rejectedStatusBadge: Locator
  readonly cancelledStatusBadge: Locator

  // Progress steps (9 stages)
  readonly progressSteps: Locator
  readonly applicationStep: Locator
  readonly reviewStep: Locator
  readonly approvalStep: Locator
  readonly viewingScheduledStep: Locator
  readonly viewingCompletedStep: Locator
  readonly agreementPendingStep: Locator
  readonly agreementSignedStep: Locator
  readonly contractStep: Locator
  readonly completedStep: Locator

  // Action buttons
  readonly viewingCompleteButton: Locator
  readonly agreementButton: Locator
  readonly viewPropertyButton: Locator

  // Next action messages
  readonly nextActionMessage: Locator

  constructor(page: Page) {
    super(page)

    // Main elements
    this.pageTitle = page.locator('h1:has-text("ダッシュボード")')
    this.pageDescription = page.locator('text=申し込んだ暮らしの引き継ぎ状況を確認できます')
    this.emptyState = page.locator('[class*="border"]:has-text("申し込んだ暮らしがありません")')
    this.emptyStateIcon = page.locator('svg.lucide-home')
    this.browsePropertiesLink = page.locator('a:has-text("暮らしを探す")')

    // Inquiry cards
    this.inquiryCards = page.locator('[class*="rounded-xl"][class*="border"]')
    this.propertyTitles = page.locator('[class*="rounded-xl"] a[href^="/listings/"]')
    this.submissionDates = page.locator('text=申込日:')
    this.progressBars = page.locator('[class*="absolute"][class*="bg-coral"]')

    // Status badges
    this.pendingStatusBadge = page.locator('[class*="bg-amber"]')
    this.reviewingStatusBadge = page.locator('text=確認中')
    this.approvedStatusBadge = page.locator('text=承認済み')
    this.completedStatusBadge = page.locator('[class*="bg-green"]:has-text("完了")')
    this.rejectedStatusBadge = page.locator('[class*="bg-red"]:has-text("お断り")')
    this.cancelledStatusBadge = page.locator('[class*="bg-red"]:has-text("キャンセル")')

    // Progress steps
    this.progressSteps = page.locator('[class*="grid-cols-9"] > div')
    this.applicationStep = page.locator('text=申し込み').locator('..')
    this.reviewStep = page.locator('p:text-is("確認中")').locator('..')
    this.approvalStep = page.locator('p:text-is("承認済み")').locator('..')
    this.viewingScheduledStep = page.locator('text=内見予定').locator('..')
    this.viewingCompletedStep = page.locator('p:text-is("内見完了")').locator('..')
    this.agreementPendingStep = page.locator('text=合意待ち').locator('..')
    this.agreementSignedStep = page.locator('text=署名完了').locator('..')
    this.contractStep = page.locator('text=契約手続き中').locator('..')
    this.completedStep = page.locator('p:text-is("完了")').locator('..')

    // Action buttons
    this.viewingCompleteButton = page.locator('a:has-text("内見完了を報告")')
    this.agreementButton = page.locator('a:has-text("引き継ぎ内容を確認")')
    this.viewPropertyButton = page.locator('a[href^="/listings/"]')

    // Next action
    this.nextActionMessage = page.locator('[class*="rounded-lg"][class*="p-4"] p')
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard')
    await this.waitForPageLoad()
  }

  /**
   * Check if dashboard is loaded
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
   * Check if dashboard shows empty state
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible()
  }

  /**
   * Get count of inquiry cards
   */
  async getInquiryCount(): Promise<number> {
    if (await this.isEmpty()) return 0
    // Filter out cards that aren't inquiry cards
    const cards = await this.page.locator('[class*="rounded-xl"][class*="border"]:has(a[href^="/listings/"])').all()
    return cards.length
  }

  /**
   * Get all property titles from inquiry cards
   */
  async getPropertyTitles(): Promise<string[]> {
    const titles = await this.propertyTitles.all()
    const titleTexts: string[] = []
    for (const title of titles) {
      const text = await title.textContent()
      if (text) titleTexts.push(text.trim())
    }
    return titleTexts
  }

  /**
   * Get next action message for a specific inquiry (by index)
   */
  async getNextActionMessage(index: number = 0): Promise<string | null> {
    const messages = await this.nextActionMessage.all()
    if (messages[index]) {
      return await messages[index].textContent()
    }
    return null
  }

  /**
   * Click on property title to navigate to property page
   */
  async clickProperty(index: number = 0) {
    const titles = await this.propertyTitles.all()
    if (titles[index]) {
      await titles[index].click()
      await this.page.waitForLoadState('networkidle')
    }
  }

  /**
   * Check if viewing complete button is visible for any inquiry
   */
  async hasViewingCompleteButton(): Promise<boolean> {
    return await this.viewingCompleteButton.isVisible()
  }

  /**
   * Click viewing complete button
   */
  async clickViewingComplete() {
    await this.viewingCompleteButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if agreement button is visible for any inquiry
   */
  async hasAgreementButton(): Promise<boolean> {
    return await this.agreementButton.isVisible()
  }

  /**
   * Click agreement button
   */
  async clickAgreement() {
    await this.agreementButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click browse properties (from empty state)
   */
  async clickBrowseProperties() {
    await this.browsePropertiesLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get current progress step count for an inquiry
   */
  async getCurrentProgressStep(inquiryIndex: number = 0): Promise<number> {
    const cards = await this.page.locator('[class*="rounded-xl"][class*="border"]:has(a[href^="/listings/"])').all()
    if (!cards[inquiryIndex]) return 0

    const card = cards[inquiryIndex]
    const activeSteps = await card.locator('[class*="border-coral"]').count()
    return activeSteps
  }

  /**
   * Check if inquiry is in a specific status
   */
  async hasInquiryInStatus(status: string): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      pending: '前の住人からのご連絡をお待ちください',
      reviewing: '前の住人が内容を確認中です',
      approved: '内見の日程調整をお待ちください',
      viewing_scheduled: '内見予定日が確定しました',
      viewing_completed: '前の住人が引き継ぎ内容を準備中です',
      agreement_pending: '引き継ぎ内容を確認して受諾してください',
      agreement_signed: '残置物同意書の署名が完了しました',
      contract_in_progress: '引き継ぎの準備を進めましょう',
      completed: '引き継ぎが完了しました',
      rejected: 'お断りとなりました',
      cancelled: 'キャンセルされました',
    }

    const message = statusMessages[status]
    if (!message) return false

    return await this.page.locator(`text=${message}`).isVisible()
  }
}
