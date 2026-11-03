import { expect, test } from '@playwright/test';

// ST-001 smoke: the deployed web app loads, is Arabic-first (RTL) and shows the brand.
test('web app loads in Arabic, right-to-left, with the BEN-BEN logo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('img', { name: /BEN-BEN/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('env-badge')).toBeVisible();
  expect(errors).toEqual([]);
});
