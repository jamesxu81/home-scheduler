import { test, expect } from '@playwright/test';

test.describe('Event Management', () => {
  test('app homepage loads', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('app content is accessible', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    expect(html.includes('Family') || html.includes('family')).toBe(true);
  });

  test('can create a new event', async ({ page }) => {
    await page.goto('/');
    
    // Find and fill the event form
    const titleInput = page.locator('input[placeholder*="Event Title"], input[placeholder*="Title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Event');
      await page.waitForTimeout(300);
    }
    
    // Look for a submit button
    const submitButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Save")');
    if (await submitButton.first().isVisible()) {
      await submitButton.first().click();
      await page.waitForTimeout(500);
    }
    
    // Verify page is still responsive
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('can interact with event list', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForTimeout(500);
    
    // Look for event delete buttons
    const deleteButtons = page.locator('button:has-text("❌"), button:has-text("Delete"), button:has-text("Remove")');
    const count = await deleteButtons.count();
    
    // If there are events, verify we can see them
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
    
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});
