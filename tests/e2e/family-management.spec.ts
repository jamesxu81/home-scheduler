import { test, expect } from '@playwright/test';

test.describe('Family Management', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page renders content', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html.length).toBeGreaterThan(100);
  });

  test('can navigate the app', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
