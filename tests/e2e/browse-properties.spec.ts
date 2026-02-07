import { test, expect } from '@playwright/test';

test.describe('Move-in Date Filter (F-508)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the move-in filter bar', async ({ page }) => {
    await expect(page.getByText('入居可能月')).toBeVisible();
  });

  test('should show month filter buttons', async ({ page }) => {
    // Should have at least the current month button
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    await expect(
      page.getByRole('button', { name: `${currentMonth}月` })
    ).toBeVisible();
  });

  test('should activate filter on month button click', async ({ page }) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const monthButton = page.getByRole('button', { name: `${currentMonth}月` });

    await monthButton.click();

    // Clear button should appear when filter is active
    await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible();
  });

  test('should clear filter when clicking clear button', async ({ page }) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    // Activate filter
    await page.getByRole('button', { name: `${currentMonth}月` }).click();
    await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible();

    // Clear filter
    await page.getByRole('button', { name: 'クリア' }).click();
    await expect(
      page.getByRole('button', { name: 'クリア' })
    ).not.toBeVisible();
  });

  test('should toggle filter off when clicking the same month twice', async ({
    page,
  }) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const monthButton = page.getByRole('button', { name: `${currentMonth}月` });

    // Activate
    await monthButton.click();
    await expect(page.getByRole('button', { name: 'クリア' })).toBeVisible();

    // Deactivate by clicking same button
    await monthButton.click();
    await expect(
      page.getByRole('button', { name: 'クリア' })
    ).not.toBeVisible();
  });
});
