import { test, expect } from '@playwright/test';

test('app loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  
  // Check that title exists
  const title = await page.title();
  expect(title).toBeTruthy();
});

