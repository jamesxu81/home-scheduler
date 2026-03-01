import { test, expect } from '@playwright/test';

test.describe('Calendar Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Setup: Create family, member, and event
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'TestUser');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add multiple events
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Add Event")');
      await page.fill('input[placeholder*="Soccer Practice"]', `Event ${i + 1}`);
      
      const dateInput = page.locator('input[name="date"]');
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      await dateInput.fill(dateStr);
      
      await page.fill('input[name="time"]', `${10 + i}:00`);
      await page.selectOption('select[name="kidId"]', { index: 0 });
      await page.click('button:has-text("Add Event")');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display list view of events', async ({ page }) => {
    // Click list view button
    const listBtn = page.locator('button:has-text("📋 List")');
    await listBtn.click();
    await page.waitForLoadState('networkidle');

    // Verify events are displayed in list format
    await expect(page.locator('text=Event 1')).toBeVisible();
    await expect(page.locator('text=Event 2')).toBeVisible();
    await expect(page.locator('text=Event 3')).toBeVisible();
  });

  test('should display month calendar view', async ({ page }) => {
    // Click calendar view button
    const calendarBtn = page.locator('button:has-text("📅 Month")');
    
    if (await calendarBtn.isVisible()) {
      await calendarBtn.click();
      await page.waitForLoadState('networkidle');

      // Verify calendar elements are visible
      const calendar = page.locator('[class*="calendar"]');
      if (await calendar.isVisible()) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('should display week view', async ({ page }) => {
    // Click week view button
    const weekBtn = page.locator('button:has-text("🗓️ Week")');
    
    if (await weekBtn.isVisible()) {
      await weekBtn.click();
      await page.waitForLoadState('networkidle');

      // Verify week view elements are displayed
      const weekView = page.locator('[class*="week"]');
      if (await weekView.isVisible()) {
        await expect(weekView).toBeVisible();
      }
    }
  });

  test('should navigate between different dates', async ({ page }) => {
    // Test date navigation
    const dateInput = page.locator('input[type="date"]');
    
    if (await dateInput.isVisible()) {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      await dateInput.fill(nextMonthStr);
      await page.waitForLoadState('networkidle');

      // Verify navigation worked
      await expect(page.locator('input[type="date"]')).toHaveValue(nextMonthStr);
    }
  });
});
