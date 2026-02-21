import { expect, test } from '@playwright/test';

test('venn visual snapshot', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sample Data' }).click();
  await page.getByRole('button', { name: /Compare/ }).click();
  const venn = page.locator('.venn-region');
  await expect(venn).toHaveScreenshot('venn-region.png');
});
