import { expect, test } from '@playwright/test';

test('core compare flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Vennom/ })).toBeVisible();
  await page.getByTestId('list-a').fill('apple\nbanana\nkiwi');
  await page.getByTestId('list-b').fill('banana\nkiwi\nmelon');
  await expect(page.getByTestId('list-a')).toHaveValue('apple\nbanana\nkiwi');
  await expect(page.getByTestId('list-b')).toHaveValue('banana\nkiwi\nmelon');
  await page.getByTestId('compare-btn').click();
  const intersectionCard = page.locator('article', { hasText: '|A∩B|' });
  await expect(intersectionCard.locator('p')).toHaveText('2');
});

test('keyboard shortcut compares lists', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('list-a').fill('x\ny');
  await page.getByTestId('list-b').fill('y\nz');
  await page.getByTestId('list-b').press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+Enter`);
  const intersectionCard = page.locator('article', { hasText: '|A∩B|' });
  await expect(intersectionCard.locator('p')).toHaveText('1');
});

test('can add a third list', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Add List/i }).click();
  await expect(page.getByTestId('list-3')).toBeVisible();
});
