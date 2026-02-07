import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Property Detail Page Object Model
 * Represents the individual property listing detail page
 */
export class PropertyDetailPage extends BasePage {
  readonly backLink: Locator;
  readonly imageGallery: Locator;
  readonly propertyTitle: Locator;
  readonly propertyLocation: Locator;
  readonly propertyInfoSection: Locator;
  readonly furnitureSection: Locator;
  readonly furnitureItems: Locator;
  readonly sidebar: Locator;
  readonly mapSection: Locator;
  readonly layoutInfo: Locator;
  readonly occupancyInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.backLink = page.locator('a:has-text("リスティング")');
    this.imageGallery = page.locator('[class*="rounded-xl"]').first();
    this.propertyTitle = page.locator('h1');
    this.propertyLocation = page.locator('h1 + p');
    this.propertyInfoSection = page.locator('section:has(h2:text("物件情報"))');
    this.furnitureSection = page.locator(
      'section:has(h2:text("引き継ぎ対象の大型家具"))'
    );
    this.furnitureItems = page.locator('[class*="rounded-xl"]:has(svg)');
    this.sidebar = page.locator('.lg\\:col-span-2');
    this.mapSection = page.locator('section:has(h2:text("ロケーション"))');
    this.layoutInfo = page.locator('text=間取り');
    this.occupancyInfo = page.locator('text=居住人数');
  }

  /**
   * Navigate to a specific property detail page
   */
  async goto(propertyId: string) {
    await this.page.goto(`/listings/${propertyId}`);
    await this.waitForPageLoad();
  }

  /**
   * Get the property title
   */
  async getTitle(): Promise<string | null> {
    await this.propertyTitle.waitFor({ state: 'visible' });
    return await this.propertyTitle.textContent();
  }

  /**
   * Get the property location/area info
   */
  async getLocationInfo(): Promise<string | null> {
    return await this.propertyLocation.textContent();
  }

  /**
   * Check if the image gallery is displayed
   */
  async hasImageGallery(): Promise<boolean> {
    const images = this.page.locator('img[alt]');
    return await images.first().isVisible();
  }

  /**
   * Get all images in the gallery
   */
  async getGalleryImages(): Promise<string[]> {
    const images = await this.page.locator('img[src*="http"]').all();
    const srcs: string[] = [];
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src) srcs.push(src);
    }
    return srcs;
  }

  /**
   * Get the layout (間取り) information
   */
  async getLayout(): Promise<string | null> {
    const layoutSection = this.page.locator('p:text("間取り") + p');
    await layoutSection
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    return await layoutSection.textContent().catch(() => null);
  }

  /**
   * Get the occupancy (居住人数) information
   */
  async getOccupancy(): Promise<string | null> {
    const occupancySection = this.page.locator('p:text("居住人数") + p');
    await occupancySection
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    return await occupancySection.textContent().catch(() => null);
  }

  /**
   * Get the list of furniture items
   */
  async getFurnitureItems(): Promise<string[]> {
    const items = await this.furnitureSection.locator('span').all();
    const names: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) names.push(text.trim());
    }
    return names;
  }

  /**
   * Check if map is displayed
   */
  async hasMap(): Promise<boolean> {
    return await this.mapSection.isVisible();
  }

  /**
   * Click the back link to return to listings
   */
  async goBack() {
    await this.backLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if page has loaded correctly with essential elements
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.propertyTitle.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the handover fee from sidebar if visible
   */
  async getHandoverFee(): Promise<string | null> {
    const feeElement = this.page.locator('text=/引き継ぎ費用.*¥/');
    const isVisible = await feeElement.isVisible().catch(() => false);
    if (!isVisible) return null;
    return await feeElement.textContent();
  }
}
