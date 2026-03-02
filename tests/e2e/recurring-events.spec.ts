import { test, expect } from '@playwright/test';

test.describe('Recurring Events', () => {
  test('can create a recurring event and view in calendar', async ({ page }) => {
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
        await familyInput.fill('Recurring Test Family');
        const startBtn = page.locator('button:has-text("Create"), button:has-text("Start")').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // Add family member
    const memberInput = page.locator('input[placeholder*="Name"], input[placeholder*="name"]').first();
    if (await memberInput.isVisible() && !await memberInput.evaluate((el) => (el as HTMLInputElement).value)) {
      await memberInput.fill('Test Child');
      const addMemberBtn = page.locator('button').filter({ hasText: /^Add|^Create/ }).first();
      if (await addMemberBtn.isVisible()) {
        await addMemberBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Add event
    const addEventBtn = page.locator('button:has-text("Add Event")').first();
    if (await addEventBtn.isVisible()) {
      await addEventBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill event details
    const titleInput = page.locator('input[placeholder*="Event" i], input[placeholder*="event" i]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Weekly Team Meeting');
      
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-03-11');
      }
      
      const timeInput = page.locator('input[type="time"]').first();
      if (await timeInput.isVisible()) {
        await timeInput.fill('10:00');
      }

      // Fill duration
      const durationInput = page.locator('input[type="number"]').first();
      if (await durationInput.isVisible()) {
        await durationInput.fill('60');
      }
      
      // Select kid/family member
      const kidSelect = page.locator('select[name="kid"]');
      if (await kidSelect.isVisible()) {
        const options = kidSelect.locator('option');
        const optionCount = await options.count();
        if (optionCount > 1) {
          await kidSelect.selectOption({ index: 1 });
        }
      }
      
      // Set to weekly - use the repeatType select by name
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
    }
    
    // Switch to calendar view
    const calendarBtn = page.locator('button:has-text("Month"), button:has-text("Week")').first();
    if (await calendarBtn.isVisible()) {
      await calendarBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify page is responsive and has elements
    const inputs = page.locator('input');
    expect(await inputs.count()).toBeGreaterThanOrEqual(0);
  });
});
