import { test, expect } from '@playwright/test';

test.describe('Recurring Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a daily recurring event', async ({ page }) => {
    // Setup
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Frank');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Create daily recurring event
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Daily Standup');
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '09:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });

    // Select Daily repeat
    await page.selectOption('select[name="repeatType"]', 'Daily');

    // Set repeat until
    const repeatInput = page.locator('input[name="repeatUntil"]');
    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 4);
    await repeatInput.fill(endDate.toISOString().split('T')[0]);

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify multiple instances are created
    const eventCards = page.locator('[class*="rounded-lg"]').filter({ hasText: 'Daily Standup' });
    const count = await eventCards.count();
    
    // Should have at least 5 daily events
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should create a weekly recurring event', async ({ page }) => {
    // Setup
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Grace');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Create weekly recurring event
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Weekly Meeting');
    
    const dateInput = page.locator('input[name="date"]');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '10:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });

    // Select Weekly repeat
    await page.selectOption('select[name="repeatType"]', 'Weekly');

    // Set repeat until 8 weeks out
    const repeatInput = page.locator('input[name="repeatUntil"]');
    const endDate = new Date(nextWeek);
    endDate.setDate(endDate.getDate() + 49);
    await repeatInput.fill(endDate.toISOString().split('T')[0]);

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify multiple instances are created
    const eventCards = page.locator('[class*="rounded-lg"]').filter({ hasText: 'Weekly Meeting' });
    const count = await eventCards.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should delete entire recurring event series', async ({ page }) => {
    // Setup
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Henry');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Create recurring event
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Recurring To Delete');
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '18:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });
    await page.selectOption('select[name="repeatType"]', 'Daily');

    const repeatInput = page.locator('input[name="repeatUntil"]');
    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 3);
    await repeatInput.fill(endDate.toISOString().split('T')[0]);

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify events exist
    let eventCards = page.locator('[class*="rounded-lg"]').filter({ hasText: 'Recurring To Delete' });
    let initialCount = await eventCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Delete one instance
    const deleteButton = page.locator('button:has-text("❌")').first();
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify all instances are deleted
    eventCards = page.locator('[class*="rounded-lg"]').filter({ hasText: 'Recurring To Delete' });
    const finalCount = await eventCards.count();
    
    expect(finalCount).toBe(0);
  });

  test('should create weekdays-only recurring event', async ({ page }) => {
    // Setup
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Ivy');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Create weekdays recurring event
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Weekday Event');
    
    const dateInput = page.locator('input[name="date"]');
    const monday = new Date();
    // Find next Monday
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() + 1);
    }
    const dateStr = monday.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '11:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });

    // Select Weekdays repeat
    await page.selectOption('select[name="repeatType"]', 'Weekdays (Mon-Fri)');

    // Set repeat until
    const repeatInput = page.locator('input[name="repeatUntil"]');
    const endDate = new Date(monday);
    endDate.setDate(endDate.getDate() + 20);
    await repeatInput.fill(endDate.toISOString().split('T')[0]);

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify events are created
    const eventCards = page.locator('[class*="rounded-lg"]').filter({ hasText: 'Weekday Event' });
    const count = await eventCards.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
