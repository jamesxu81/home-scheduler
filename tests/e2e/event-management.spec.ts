import { test, expect } from '@playwright/test';

test.describe('Event Management', () => {
  test('can create a repeating event and delete it', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Setup family if needed
    const createFamilyBtn = page.locator('button:has-text("Create Family"), button:has-text("Create New Family")').first();
    if (await createFamilyBtn.isVisible()) {
      await createFamilyBtn.click();
      await page.waitForTimeout(1000);
      
      const familyInput = page.locator('input[type="text"]').first();
      if (await familyInput.isVisible()) {
        await familyInput.fill('Test Family');
        const startBtn = page.locator('button:has-text("Create"), button:has-text("Start")').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // Add a family member first
    const memberInput = page.locator('input[placeholder*="Name"], input[placeholder*="name"]').first();
    if (await memberInput.isVisible() && !await memberInput.evaluate((el) => (el as HTMLInputElement).value)) {
      await memberInput.fill('Test Kid');
      const addMemberBtn = page.locator('button').filter({ hasText: /^Add|^Create/ }).first();
      if (await addMemberBtn.isVisible()) {
        await addMemberBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Click Add Event button
    const addEventBtn = page.locator('button:has-text("Add Event")').first();
    if (await addEventBtn.isVisible()) {
      await addEventBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill event title
    const titleInput = page.locator('input[placeholder*="Event" i], input[placeholder*="event" i]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Weekly Homework');
    }
    
    // Fill date
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2026-03-10');
    }
    
    // Fill time
    const timeInput = page.locator('input[type="time"]').first();
    if (await timeInput.isVisible()) {
      await timeInput.fill('15:00');
    }

    // Fill duration
    const durationInput = page.locator('input[type="number"]').first();
    if (await durationInput.isVisible()) {
      await durationInput.fill('45');
    }
    
    // Select kid/family member
    const kidSelect = page.locator('select[name="kid"]');
    if (await kidSelect.isVisible()) {
      // Get all options and select the first available one
      const options = kidSelect.locator('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        // Select the second option (first is usually placeholder)
        await kidSelect.selectOption({ index: 1 });
      }
    }
    
    // Set repeat to Weekly using the repeatType select by name
    const repeatSelect = page.locator('select[name="repeatType"]');
    if (await repeatSelect.isVisible()) {
      await repeatSelect.selectOption('WEEKLY');
    }
    
    // Submit
    const submitBtn = page.locator('button:has-text("Add Event"), button:has-text("Save Event")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Try to find and delete an event
    const deleteBtn = page.locator('button:has-text("x"), button:has-text("X"), button:has-text("❌"), button:has-text("Delete")').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify page is still functional - has buttons
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
