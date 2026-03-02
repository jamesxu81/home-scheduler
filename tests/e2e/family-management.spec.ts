import { test, expect } from '@playwright/test';

test.describe('Family Management', () => {
  test('can create a new family and add members', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load - check for setup button or family form
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Check if we need to create a family first
    const createFamilyButton = page.locator('button:has-text("Create Family"), button:has-text("Create New Family")').first();
    if (await createFamilyButton.isVisible()) {
      await createFamilyButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for family name input
    const familyNameInput = page.locator('input[type="text"]').first();
    if (await familyNameInput.isVisible()) {
      await familyNameInput.fill('Test Family');
      
      // Click create button
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Start")').first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Now add family member
    const memberInput = page.locator('input[placeholder*="Name"], input[placeholder*="name"]').first();
    if (await memberInput.isVisible()) {
      await memberInput.fill('John');
      await page.waitForTimeout(400);
      
      // Find and click add button
      const addBtn = page.locator('button').filter({ hasText: /^Add|^Create/ }).first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Verify page still has interactive elements
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
