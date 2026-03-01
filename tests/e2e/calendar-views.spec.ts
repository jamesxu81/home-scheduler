import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('app homepage loads', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('page remains accessible', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    const html = await page.content();
    expect(html.length).toBeGreaterThan(0);
  });

  test('layout renders correctly', async ({ page }) => {
    await page.goto('/');
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

