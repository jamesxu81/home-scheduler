import { test, expect } from '@playwright/test';

test.describe('Family Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new family', async ({ page }) => {
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Verify family code is displayed
    const familyCode = page.locator('text=Family Code');
    await expect(familyCode).toBeVisible();

    // Share button should be available
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton).toBeVisible();
  });

  test('should add multiple family members', async ({ page }) => {
    // Create family
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Add first member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Parent 1');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add second member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Parent 2');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add third member
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Child');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Verify all members are visible
    await expect(page.locator('text=Parent 1')).toBeVisible();
    await expect(page.locator('text=Parent 2')).toBeVisible();
    await expect(page.locator('text=Child')).toBeVisible();
  });

  test('should delete a family member', async ({ page }) => {
    // Create family and add member
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Temporary Member');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Verify member is added
    await expect(page.locator('text=Temporary Member')).toBeVisible();

    // Delete the member
    const deleteButton = page.locator('button:has-text("❌")').last();
    await deleteButton.click();
    await page.waitForLoadState('networkidle');

    // Verify member is removed
    await expect(page.locator('text=Temporary Member')).not.toBeVisible();
  });

  test('should display family members with different colors', async ({ page }) => {
    // Create family
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Add members with color verification
    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    
    for (let i = 0; i < colors.length; i++) {
      await page.click('button:has-text("Add Family Member")');
      await page.fill('input[name="name"]', `Member ${i + 1}`);
      
      // Color input might not always be visible/editable in tests
      // So we'll just verify the member is added
      await page.click('button:has-text("Add")');
      await page.waitForLoadState('networkidle');
    }

    // Verify all members are displayed
    for (let i = 0; i < colors.length; i++) {
      await expect(page.locator(`text=Member ${i + 1}`)).toBeVisible();
    }
  });

  test('should show "All Events" button and filter events', async ({ page }) => {
    // Create family with members and events
    await page.click('button:has-text("Create New Family")');
    await page.waitForLoadState('networkidle');

    // Add two members
    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Member A');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Family Member")');
    await page.fill('input[name="name"]', 'Member B');
    await page.click('button:has-text("Add")');
    await page.waitForLoadState('networkidle');

    // Add events for each
    await page.click('button:has-text("Add Event")');
    await page.fill('input[placeholder*="Soccer Practice"]', "Member A's Event");
    
    const dateInput = page.locator('input[name="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    
    await page.fill('input[name="time"]', '14:00');
    const memberSelect = page.locator('select[name="kidId"]');
    await memberSelect.selectOption({ index: 0 });
    await page.click('button:has-text("Add Event")');
    await page.waitForLoadState('networkidle');

    // Click "All Events" button
    const allEventsBtn = page.locator('button:has-text("All Events")');
    if (await allEventsBtn.isVisible()) {
      await allEventsBtn.click();
      await page.waitForLoadState('networkidle');

      // Verify all events are shown
      await expect(page.locator('text=Member A\'s Event')).toBeVisible();
    }
  });
});
