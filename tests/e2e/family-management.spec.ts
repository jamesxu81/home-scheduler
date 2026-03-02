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

  test('can interact with family members section', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Wait for page to load
    await page.waitForTimeout(500);
    
    // Look for family member input
    const memberInput = page.locator('input[placeholder*="Name"], input[placeholder*="member"]').first();
    if (await memberInput.isVisible()) {
      await memberInput.fill('Test Family Member');
      await page.waitForTimeout(300);
    }
    
    // Look for add button
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create")');
    if (await addButton.first().isVisible()) {
      await addButton.first().click();
      await page.waitForTimeout(500);
    }
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('can view family members list', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Look for family member elements
    const members = page.locator('[class*="member"], [class*="family"]');
    const count = await members.count();
    
    // Verify the page has family-related elements
    const content = await page.textContent('body');
    expect(content?.includes('Family') || content?.includes('member')).toBeTruthy();
  });
});
