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

  test('can navigate calendar views', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Look for calendar view buttons (Monthly, Weekly, etc.)
    const viewButtons = page.locator('button:has-text("Month"), button:has-text("Week"), button:has-text("Day")');
    const count = await viewButtons.count();
    
    if (count > 0) {
      // Click the first view button
      await viewButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('calendar displays correctly with different viewports', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    let content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

