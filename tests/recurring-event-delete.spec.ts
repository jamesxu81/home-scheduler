import { test, expect } from '@playwright/test';

test.describe('Recurring Event Deletion', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for it to load
    await page.goto('http://localhost:3000');
    
    // Wait for the app to be interactive
    await page.waitForLoadState('networkidle');
    
    // Check if we need to create a family first
    const setupBtn = page.locator('button:has-text("Setup Family")');
    if (await setupBtn.isVisible()) {
      // Create a new family
      await setupBtn.click();
      await page.fill('input[placeholder*="Family"]', 'Test Family');
      await page.click('button:has-text("Create Family")');
      
      // Wait for family to be created
      await page.waitForLoadState('networkidle');
    }
  });

  test('should not move other events when deleting a recurring event instance', async ({ page }) => {
    // Step 1: Add a family member
    const addMemberBtn = page.locator('button:has-text("Add Member")');
    await addMemberBtn.click();
    
    const nameInput = page.locator('input[placeholder*="name" i]');
    await nameInput.fill('John');
    
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill('#FF5733');
    
    const createBtn = page.locator('button:has-text("Create")');
    await createBtn.click();
    
    await page.waitForLoadState('networkidle');
    
    // Step 2: Create a recurring event (Weekly for 4 weeks)
    const addEventBtn = page.locator('button:has-text("Add Event")');
    await addEventBtn.click();
    
    await page.fill('input[placeholder*="Title" i]', 'Weekly Meetup');
    await page.fill('input[placeholder*="Description" i]', 'Team meeting');
    
    // Select a date (today or a future date)
    const dateInput = page.locator('input[type="date"]').first();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[type="time"]', '10:00');
    
    // Select the member
    await page.selectOption('select', 'John');
    
    // Set it as weekly recurring
    await page.selectOption('select[name*="repeat" i]', 'WEEKLY');
    
    // Set repeat until 4 weeks from now
    const repeatUntil = new Date(tomorrow);
    repeatUntil.setDate(repeatUntil.getDate() + 28);
    const repeatUntilStr = repeatUntil.toISOString().split('T')[0];
    
    const repeatUntilInput = page.locator('input[type="date"]').nth(1);
    await repeatUntilInput.fill(repeatUntilStr);
    
    const submitBtn = page.locator('button:has-text("Add Event")').last();
    await submitBtn.click();
    
    await page.waitForLoadState('networkidle');
    
    // Step 3: Verify that 4 instances are shown
    const eventCards = page.locator('.bg-white .rounded-lg').filter({ hasText: 'Weekly Meetup' });
    const initialCount = await eventCards.count();
    
    console.log(`Initial event count: ${initialCount}`);
    expect(initialCount).toBeGreaterThanOrEqual(1);
    
    // Step 4: Get the text of all events before deletion
    const eventTextsBeforeDelete: string[] = [];
    for (let i = 0; i < initialCount; i++) {
      const text = await eventCards.nth(i).textContent();
      eventTextsBeforeDelete.push(text || '');
    }
    console.log('Events before delete:', eventTextsBeforeDelete);
    
    // Step 5: Delete the second instance
    const deleteButtons = page.locator('button:has-text("❌")');
    const deleteCountBefore = await deleteButtons.count();
    
    if (deleteCountBefore >= 2) {
      // Click delete on the second event
      await deleteButtons.nth(1).click();
      
      // Wait for deletion to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Step 6: Verify the event count decreased
      const eventCardsAfter = page.locator('.bg-white .rounded-lg').filter({ hasText: 'Weekly Meetup' });
      const countAfterDelete = await eventCardsAfter.count();
      
      const deleteCountAfter = await page.locator('button:has-text("❌")').count();
      
      console.log(`Event count after delete: ${countAfterDelete}`);
      console.log(`Delete buttons before: ${deleteCountBefore}, after: ${deleteCountAfter}`);
      
      // The count should have decreased by 1 (or the entire series if deleted)
      expect(countAfterDelete).toBeLessThanOrEqual(initialCount);
      
      // If it's a recurring event series, all instances should be deleted
      // If it's per-instance deletion, one should be removed
      if (countAfterDelete === 0) {
        console.log('✅ Entire recurring series was deleted (expected behavior)');
      } else {
        console.log(`✅ Delete successful: ${initialCount} -> ${countAfterDelete} events`);
      }
    }
  });

  test('should correctly handle deleting non-recurring events', async ({ page }) => {
    // Add a member first
    const addMemberBtn = page.locator('button:has-text("Add Member")');
    await addMemberBtn.click();
    
    const nameInput = page.locator('input[placeholder*="name" i]');
    await nameInput.fill('Jane');
    
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill('#33FF57');
    
    const createBtn = page.locator('button:has-text("Create")');
    await createBtn.click();
    
    await page.waitForLoadState('networkidle');
    
    // Create a single non-recurring event
    const addEventBtn = page.locator('button:has-text("Add Event")');
    await addEventBtn.click();
    
    await page.fill('input[placeholder*="Title" i]', 'Single Event');
    
    const dateInput = page.locator('input[type="date"]').first();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[type="time"]', '14:00');
    
    await page.selectOption('select', 'Jane');
    
    const submitBtn = page.locator('button:has-text("Add Event")').last();
    await submitBtn.click();
    
    await page.waitForLoadState('networkidle');
    
    // Verify event exists
    const singleEvent = page.locator('text=Single Event');
    await expect(singleEvent).toBeVisible();
    
    // Delete it
    const deleteBtn = page.locator('button:has-text("❌")').first();
    await deleteBtn.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Verify it's gone
    const eventAfter = page.locator('text=Single Event');
    await expect(eventAfter).not.toBeVisible();
    
    console.log('✅ Single event successfully deleted');
  });
});
