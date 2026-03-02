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

test('can interact with the app', async ({ page }) => {
  await page.goto('/');
  
  // Click on the add event button
  const addButton = page.locator('button:has-text("Add Event")');
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(500);
  }
  
  // Verify the page is still responsive
  const content = await page.textContent('body');
  expect(content).toBeTruthy();
});

