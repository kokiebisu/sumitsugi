import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * New Listing Creation Page Object Model
 * Represents the multi-step listing creation flow at /listing/new
 */
export class NewListingPage extends BasePage {
  readonly stepIndicator: Locator;
  readonly stepTitle: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly saveAndExitButton: Locator;
  readonly progressBar: Locator;

  // Step 1 - Introduction
  readonly introTitle: Locator;
  readonly introDescription: Locator;

  // Step 2 - Photos
  readonly addPhotoButton: Locator;
  readonly photoUploadDialog: Locator;
  readonly photoCount: Locator;
  readonly uploadedPhotos: Locator;

  // Step 3 - Location
  readonly locationPicker: Locator;
  readonly selectedLocation: Locator;

  // Step 4 - Property Info
  readonly rentInput: Locator;
  readonly managementFeeInput: Locator;
  readonly layoutOptions: Locator;
  readonly occupantsOptions: Locator;

  // Step 5 - Schedule
  readonly viewingDatePicker: Locator;
  readonly moveInDatePicker: Locator;

  // Step 6 - Handover Fee & Furniture
  readonly furnitureOptions: Locator;
  readonly handoverFeeInput: Locator;
  readonly estimateCard: Locator;

  // Step 7 - Preview
  readonly previewSection: Locator;
  readonly publishButton: Locator;
  readonly addressWarning: Locator;

  constructor(page: Page) {
    super(page);

    // Common elements
    this.stepIndicator = page.locator(
      'p.text-base.font-medium:has-text("ステップ")'
    );
    this.stepTitle = page.locator('h1[class*="text-\\[48px\\]"]');
    this.nextButton = page.locator(
      'button:has-text("次へ"), button:has-text("公開する"), button:has-text("登録する")'
    );
    this.backButton = page.locator('button:has-text("戻る")');
    this.saveAndExitButton = page.locator('button:has-text("保存して終了")');
    this.progressBar = page.locator('footer .h-\\[2px\\]');

    // Step 1
    this.introTitle = page.locator('h1:has-text("暮らしを引き継ぐ")');
    this.introDescription = page.locator('p:has-text("お部屋の写真やエリア")');

    // Step 2
    this.addPhotoButton = page.locator(
      'button:has-text("写真を追加"), button:has(svg.lucide-plus)'
    );
    this.photoUploadDialog = page.locator(
      '.fixed.inset-0.z-50:has(h2:has-text("写真をアップロード"))'
    );
    this.photoCount = page.locator('p:has-text("/ 5 枚")');
    this.uploadedPhotos = page.locator('.relative.flex-shrink-0.w-\\[400px\\]');

    // Step 3
    this.locationPicker = page.locator('.leaflet-container, [class*="map"]');
    this.selectedLocation = page.locator('p:has-text("選択された場所")');

    // Step 4
    this.rentInput = page.locator('input[placeholder*="80000"]');
    this.managementFeeInput = page.locator('input[placeholder*="5000"]');
    this.layoutOptions = page.locator(
      'button:has-text("1R"), button:has-text("1K"), button:has-text("1LDK")'
    );
    this.occupantsOptions = page.locator(
      'button:has-text("1人"), button:has-text("2人")'
    );

    // Step 5
    this.viewingDatePicker = page.locator(
      'button:has-text("内見可能日を選択")'
    );
    this.moveInDatePicker = page.locator(
      'button:has-text("引き継ぎ可能日を選択")'
    );

    // Step 6
    this.furnitureOptions = page.locator(
      'button:has(svg.lucide-bed-double), button:has(svg.lucide-sofa)'
    );
    this.handoverFeeInput = page.locator('input[placeholder*="50000"]');
    this.estimateCard = page.locator('[class*="estimate"]');

    // Step 7
    this.previewSection = page.locator('div:has(h1:has-text("プレビュー"))');
    this.publishButton = page.locator('button:has-text("公開する")');
    this.addressWarning = page.locator('.bg-amber-50');
  }

  /**
   * Navigate to new listing page
   */
  async goto() {
    await this.page.goto('/listing/new');
    await this.waitForPageLoad();
  }

  /**
   * Get current step number
   */
  async getCurrentStep(): Promise<number> {
    const text = await this.stepIndicator.textContent();
    if (!text) return 0;
    const match = text.match(/ステップ\s*(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Go to next step
   */
  async goToNextStep() {
    await this.nextButton.click();
    await this.page.waitForTimeout(500); // Allow animation
  }

  /**
   * Go to previous step
   */
  async goToPreviousStep() {
    await this.backButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Save and exit the flow
   */
  async saveAndExit() {
    await this.saveAndExitButton.click();
    await this.page.waitForURL('**/listing');
  }

  // Step 2 - Photos
  /**
   * Get current photo count
   */
  async getPhotoCount(): Promise<number> {
    const text = await this.photoCount.textContent();
    if (!text) return 0;
    const match = text.match(/(\d+)\s*\//);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Open photo upload dialog
   */
  async openPhotoUploadDialog() {
    await this.addPhotoButton.first().click();
    await expect(this.photoUploadDialog).toBeVisible();
  }

  // Step 4 - Property Info
  /**
   * Enter rent amount
   */
  async enterRent(amount: number) {
    await this.rentInput.fill(amount.toString());
  }

  /**
   * Enter management fee
   */
  async enterManagementFee(amount: number) {
    await this.managementFeeInput.fill(amount.toString());
  }

  /**
   * Select layout option
   */
  async selectLayout(layout: string) {
    await this.page.locator(`button:has-text("${layout}")`).click();
  }

  /**
   * Select number of occupants
   */
  async selectOccupants(occupants: string) {
    await this.page.locator(`button:has-text("${occupants}")`).click();
  }

  // Step 6 - Furniture & Fee
  /**
   * Select furniture items
   */
  async selectFurniture(items: string[]) {
    for (const item of items) {
      await this.page.locator(`button:has-text("${item}")`).click();
    }
  }

  /**
   * Enter handover fee
   */
  async enterHandoverFee(amount: number) {
    await this.handoverFeeInput.fill(amount.toString());
  }

  /**
   * Get the selected furniture items
   */
  async getSelectedFurniture(): Promise<string[]> {
    const selected = await this.page
      .locator('button[class*="border-foreground"]:has(svg)')
      .all();
    const items: string[] = [];
    for (const btn of selected) {
      const text = await btn.locator('span').textContent();
      if (text) items.push(text.trim());
    }
    return items;
  }

  // Step 7 - Preview
  /**
   * Check if preview is showing address warning
   */
  async hasAddressWarning(): Promise<boolean> {
    return await this.addressWarning.isVisible();
  }

  /**
   * Get preview title
   */
  async getPreviewTitle(): Promise<string | null> {
    const titleEl = this.page.locator('.max-w-4xl h2').first();
    return await titleEl.textContent();
  }

  /**
   * Complete the listing creation (publish or save as draft)
   */
  async completeCreation() {
    await this.nextButton.click();
    await this.page.waitForURL('**/listing');
  }

  /**
   * Navigate from step 1 to step 2 (quick forward for testing later steps)
   */
  async skipToStep(targetStep: number) {
    let currentStep = await this.getCurrentStep();
    while (currentStep < targetStep) {
      await this.goToNextStep();
      currentStep = await this.getCurrentStep();
    }
  }
}
