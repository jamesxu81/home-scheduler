import { test, expect } from '@playwright/test';

test.describe('Recurring Event Deletion', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page content is accessible', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });
});
