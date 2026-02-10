/**
 * Payment Page E2E Tests
 *
 * Tests for the payment placeholder page (feature coming soon).
 * Payment feature is temporarily disabled for launch.
 *
 * @tag payment
 */
import { test, expect, testData } from '../fixtures/test-fixtures';

test.describe('Payment Page - Coming Soon @payment', () => {
  const propertyId = testData.properties.bohemian;

  test('should display coming soon placeholder', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=決済機能')).toBeVisible();
    await expect(page.locator('text=この機能は現在準備中です')).toBeVisible();
  });

  test('should have back button to property page', async ({ page }) => {
    await page.goto(`/properties/${propertyId}/payment`);
    await page.waitForLoadState('networkidle');

    const backButton = page.locator('text=物件ページに戻る');
    await expect(backButton).toBeVisible();
  });

  test('should show 404 for non-existent property', async ({ page }) => {
    const response = await page.goto(
      '/properties/non-existent-id-12345/payment'
    );
    expect(response?.status()).toBe(404);
  });
});
