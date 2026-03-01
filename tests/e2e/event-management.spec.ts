import { test, expect } from '@playwright/test';

test.describe('Event Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new family and add events', async ({ page }) => {
    // Create new family
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Verify family is created and show the code
    await expect(page.locator('text=Family Code')).toBeVisible();

    // Add a family member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Alice');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Verify member is added
    await expect(page.locator('text=Alice')).toBeVisible();

    // Add an event
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Soccer Practice');
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '15:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });
    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify event is created
    await expect(page.locator('text=Soccer Practice')).toBeVisible();
  });

  test('should edit an event', async ({ page }) => {
    // Setup: Create family and add event
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Bob');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Original Event');
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '14:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });
    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Edit the event
    await page.click('button:has-text("✏️")');
    await page.waitForLoadState('networkidle');

    // The event form should be populated
    const titleInput = page.locator('input[placeholder*="Soccer Practice"]');
    await titleInput.clear();
    await titleInput.fill('Modified Event');

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify the change
    await expect(page.locator('text=Modified Event')).toBeVisible();
    await expect(page.locator('text=Original Event')).not.toBeVisible();
  });

  test('should filter events by family member', async ({ page }) => {
    // Setup: Create family with two members and events
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Add first member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Chris');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add second member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Diana');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add event for Chris
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', "Chris's Event");
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '15:00');
    
    const memberSelect = page.locator('select[name="kidId"]');
    const options = await memberSelect.locator('option').count();
    const chrisOption = await memberSelect.locator('option').nth(0).getAttribute('value');
    if (chrisOption) {
      await memberSelect.selectOption(chrisOption);
    }
    
    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Add event for Diana
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', "Diana's Event");
    await dateInput.fill(dateStr);
    await page.fill('input[name="time"]', '16:00');
    
    const dianaOption = await memberSelect.locator('option').nth(1).getAttribute('value');
    if (dianaOption) {
      await memberSelect.selectOption(dianaOption);
    }
    
    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Both events should be visible
    await expect(page.locator('text=Chris\'s Event')).toBeVisible();
    await expect(page.locator('text=Diana\'s Event')).toBeVisible();

    // Filter by Chris
    await page.click('button:has-text("Chris")');
    await page.waitForLoadState('networkidle');

    // Only Chris's event should be visible
    await expect(page.locator('text=Chris\'s Event')).toBeVisible();
  });

  test('should set event reminder', async ({ page }) => {
    // Setup: Create family and member
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Eve');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add event with reminder
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', 'Event with Reminder');
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '17:00');
    await page.selectOption('select[name="kidId"]', { index: 0 });

    // Check the reminder checkbox
    await page.check('input[name="reminder"]');

    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Verify reminder indicator is shown
    await expect(page.locator('text=🔔 Reminder set')).toBeVisible();
  });
});
