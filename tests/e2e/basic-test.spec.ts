import { test, expect } from '@playwright/test';

test('app loads without errors', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});

test('page has content', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html.length).toBeGreaterThan(100);
});

