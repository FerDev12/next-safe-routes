import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('navigation', () => {
  test('useRouter implementation', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Go to product by id' });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page).toHaveTitle('Product by Id');
  });

  test('redirect implementation', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveTitle('Auth');
  });

  test('Link implementation', async ({ page }) => {
    const link = page.getByText('Go to post by id');
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveTitle('Post by Id');
  });
});
