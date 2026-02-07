import { test, expect } from '../fixtures/test-fixtures';

/**
 * E2E Tests: Usage Guide Page
 *
 * Critical user journey: Understanding the handover process
 * Priority: MEDIUM
 *
 * Tests the guide page functionality:
 * - Page loads correctly
 * - Tab switching between seller/buyer views
 * - Step content display
 * - Cost explanation section
 */

test.describe('Guide Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide');
  });

  test('should load the guide page', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '使い方ガイド' })
    ).toBeVisible();
  });

  test('should show seller tab as default', async ({ page }) => {
    const sellerTab = page.getByRole('button', { name: '前の住人向け' });
    await expect(sellerTab).toBeVisible();
    await expect(page.getByText('家具を登録')).toBeVisible();
  });

  test('should switch to buyer tab', async ({ page }) => {
    await page.getByRole('button', { name: '次の住人向け' }).click();
    await expect(page.getByText('物件を探す')).toBeVisible();
  });

  test('should display cost explanation section', async ({ page }) => {
    await expect(page.getByText('費用の仕組み')).toBeVisible();
    await expect(page.getByText('エスクロー決済')).toBeVisible();
  });

  test('should have help center link', async ({ page }) => {
    await expect(page.getByText('ヘルプセンターへ')).toBeVisible();
  });
});
