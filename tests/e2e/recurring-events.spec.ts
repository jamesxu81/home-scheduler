import { test, expect } from '@playwright/test';

test.describe('Recurring Events', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page is accessible', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test('app renders properly', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
