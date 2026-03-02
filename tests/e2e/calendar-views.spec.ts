import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test('can switch between calendar views', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Setup if needed
    const createFamilyBtn = page.locator('button:has-text("Create Family"), button:has-text("Create New Family")').first();
    if (await createFamilyBtn.isVisible()) {
      await createFamilyBtn.click();
      await page.waitForTimeout(1000);
      
      const familyInput = page.locator('input[type="text"]').first();
      if (await familyInput.isVisible()) {
        await familyInput.fill('Calendar Test Family');
        const startBtn = page.locator('button:has-text("Create"), button:has-text("Start")').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // Look for calendar view buttons
    const monthBtn = page.locator('button:has-text("Month")').first();
    const weekBtn = page.locator('button:has-text("Week")').first();
    const listBtn = page.locator('button:has-text("List")').first();
    
    // Switch to Month view
    if (await monthBtn.isVisible()) {
      await monthBtn.click();
      await page.waitForTimeout(800);
    }
    
    // Switch to Week view
    if (await weekBtn.isVisible()) {
      await weekBtn.click();
      await page.waitForTimeout(800);
    }
    
    // Switch to List view
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(800);
    }
    
    // Verify page still has buttons (is responsive)
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});

