import { test, expect } from '@playwright/test';

test.describe('Event Management', () => {
  test('app homepage loads', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('app content is accessible', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html.includes('Family') || html.includes('family')).toBe(true);
  });
});
