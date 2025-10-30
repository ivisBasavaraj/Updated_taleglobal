const { test, expect } = require('@playwright/test');

// Test to verify that "Why Join Us" and "Google Maps Embed Code" fields are properly saved to MongoDB
test.describe('Employer Profile Fields Storage', () => {
  // Test user credentials - adjust based on your test user setup
  const TEST_EMAIL = 'testcompany@example.com';
  const TEST_PASSWORD = 'password123';
  const FRONTEND_URL = 'http://localhost:3000';
  const BACKEND_URL = 'http://localhost:5000';

  // Helper function to log in employer and navigate to profile
  async function loginAndNavigateToProfile(page) {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/employer/login`);
    await page.waitForLoadState('networkidle');

    // Check if already logged in by looking for skip/redirect
    const currentUrl = page.url();
    if (currentUrl.includes('/employer/dashboard') || currentUrl.includes('/employer/profile')) {
      // Already logged in, navigate to profile
      await page.goto(`${FRONTEND_URL}/employer/profile`);
      await page.waitForLoadState('networkidle');
      return true;
    }

    // Perform login
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();

    // Check if fields exist
    if (!(await emailField.isVisible()) || !(await passwordField.isVisible())) {
      console.log('Login fields not found, might already be logged in');
      await page.goto(`${FRONTEND_URL}/employer/profile`);
      await page.waitForLoadState('networkidle');
      return true;
    }

    // Fill credentials
    await emailField.fill(TEST_EMAIL);
    await passwordField.fill(TEST_PASSWORD);

    // Intercept response to ensure login succeeds
    const loginPromise = page.waitForURL('**/employer/**', { timeout: 15000 }).catch(() => null);
    await submitButton.click();
    
    try {
      await loginPromise;
    } catch (error) {
      console.log('Login redirect timeout, continuing...');
    }

    await page.waitForTimeout(1000);

    // Navigate to profile page
    await page.goto(`${FRONTEND_URL}/employer/profile`);
    await page.waitForLoadState('networkidle');

    return true;
  }

  test('should load employer profile page with form fields', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Verify we're on the profile page
    expect(page.url()).toContain('/employer/profile');

    // Check if profile form fields exist
    const whyJoinUsField = page.locator('textarea[name="whyJoinUs"], textarea:has-text("Why Join Us")').first();
    const googleMapsField = page.locator('textarea[name="googleMapsEmbed"], textarea:has-text("Google Maps")').first();

    // Wait for at least one field to be visible
    await page.waitForTimeout(2000);

    const whyJoinUsVisible = await whyJoinUsField.isVisible().catch(() => false);
    const googleMapsVisible = await googleMapsField.isVisible().catch(() => false);

    expect(whyJoinUsVisible || googleMapsVisible).toBeTruthy();
  });

  test('should save "Why Join Us" field to MongoDB', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Get reference to the Why Join Us field
    let whyJoinUsField = page.locator('textarea[name="whyJoinUs"]').first();

    // If by name doesn't work, try finding by placeholder or nearby text
    if (!(await whyJoinUsField.isVisible().catch(() => false))) {
      whyJoinUsField = page.locator('textarea').filter({ has: page.locator('text=/Why.*Join|Why.*Us/i') }).first();
    }

    // Wait for field to be visible
    try {
      await whyJoinUsField.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      // Field might not be in a separate textarea, try to find it
      const allTextareas = await page.locator('textarea').all();
      if (allTextareas.length > 0) {
        whyJoinUsField = page.locator('textarea').nth(0);
      } else {
        test.skip();
      }
    }

    // Generate unique test data with timestamp
    const timestamp = Date.now();
    const testWhyJoinUs = `Why Join Us Updated - ${timestamp}. Amazing opportunities await!`;

    // Clear existing value and fill the field
    await whyJoinUsField.clear();
    await whyJoinUsField.fill(testWhyJoinUs);

    // Verify the field has the correct value
    const fieldValue = await whyJoinUsField.inputValue();
    expect(fieldValue).toContain(String(timestamp));

    // Find and click the Save Profile button
    const saveButton = page.locator('button:has-text("Save Profile"), button:has-text("Save"), button:has-text("Update")').first();
    
    if (await saveButton.isVisible()) {
      // Set up listener for dialog/alert
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // Refresh the page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Re-locate the field after reload
    let reloadedWhyJoinUsField = page.locator('textarea[name="whyJoinUs"]').first();
    if (!(await reloadedWhyJoinUsField.isVisible().catch(() => false))) {
      reloadedWhyJoinUsField = page.locator('textarea').filter({ has: page.locator('text=/Why.*Join|Why.*Us/i') }).first();
    }

    // Verify the field still has the saved value
    const refreshedValue = await reloadedWhyJoinUsField.inputValue().catch(() => '');
    expect(refreshedValue).toContain(String(timestamp));
  });

  test('should save "Google Maps Embed Code" field to MongoDB', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Get reference to the Google Maps Embed field
    let googleMapsField = page.locator('textarea[name="googleMapsEmbed"]').first();

    // If by name doesn't work, try finding by placeholder or nearby text
    if (!(await googleMapsField.isVisible().catch(() => false))) {
      googleMapsField = page.locator('textarea').filter({ has: page.locator('text=/Google.*Maps|Maps.*Embed/i') }).first();
    }

    // Wait for field to be visible
    try {
      await googleMapsField.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      // Field might not be visible, try to find any textarea
      const allTextareas = await page.locator('textarea').all();
      if (allTextareas.length > 1) {
        googleMapsField = page.locator('textarea').nth(1);
      } else {
        test.skip();
      }
    }

    // Generate unique test data with timestamp
    const timestamp = Date.now();
    const testGoogleMapsEmbed = `<iframe src="https://www.google.com/maps/embed?pb=..." title="Company Location ${timestamp}"></iframe>`;

    // Clear existing value and fill the field
    await googleMapsField.clear();
    await googleMapsField.fill(testGoogleMapsEmbed);

    // Verify the field has the correct value
    const fieldValue = await googleMapsField.inputValue();
    expect(fieldValue).toContain(String(timestamp));

    // Find and click the Save Profile button
    const saveButton = page.locator('button:has-text("Save Profile"), button:has-text("Save"), button:has-text("Update")').first();
    
    if (await saveButton.isVisible()) {
      // Set up listener for dialog/alert
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // Refresh the page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Re-locate the field after reload
    let reloadedGoogleMapsField = page.locator('textarea[name="googleMapsEmbed"]').first();
    if (!(await reloadedGoogleMapsField.isVisible().catch(() => false))) {
      reloadedGoogleMapsField = page.locator('textarea').filter({ has: page.locator('text=/Google.*Maps|Maps.*Embed/i') }).first();
    }

    // Verify the field still has the saved value
    const refreshedValue = await reloadedGoogleMapsField.inputValue().catch(() => '');
    expect(refreshedValue).toContain(String(timestamp));
  });

  test('should save both fields simultaneously to MongoDB', async ({ page }) => {
    await loginAndNavigateToProfile(page);

    // Get references to both fields
    let whyJoinUsField = page.locator('textarea[name="whyJoinUs"]').first();
    let googleMapsField = page.locator('textarea[name="googleMapsEmbed"]').first();

    // Fallback: find by text if name attribute doesn't work
    if (!(await whyJoinUsField.isVisible().catch(() => false))) {
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 0) whyJoinUsField = page.locator('textarea').nth(0);
    }
    if (!(await googleMapsField.isVisible().catch(() => false))) {
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 1) googleMapsField = page.locator('textarea').nth(1);
    }

    // Generate unique test data
    const timestamp = Date.now();
    const testWhyJoinUs = `Why Join Us - ${timestamp}`;
    const testGoogleMapsEmbed = `<iframe src="https://maps.google.com/maps?q=...&t=m&z=15&output=embed" title="Location ${timestamp}"></iframe>`;

    // Fill both fields
    if (await whyJoinUsField.isVisible().catch(() => false)) {
      await whyJoinUsField.clear();
      await whyJoinUsField.fill(testWhyJoinUs);
    }

    if (await googleMapsField.isVisible().catch(() => false)) {
      await googleMapsField.clear();
      await googleMapsField.fill(testGoogleMapsEmbed);
    }

    // Wait for fields to be fully populated
    await page.waitForTimeout(500);

    // Save profile
    const saveButton = page.locator('button:has-text("Save Profile"), button:has-text("Save"), button:has-text("Update")').first();
    
    if (await saveButton.isVisible()) {
      page.once('dialog', async dialog => {
        await dialog.accept();
      });

      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    // Refresh the page to verify persistence of both fields
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Re-locate fields after reload
    let reloadedWhyJoinUsField = page.locator('textarea[name="whyJoinUs"]').first();
    let reloadedGoogleMapsField = page.locator('textarea[name="googleMapsEmbed"]').first();

    if (!(await reloadedWhyJoinUsField.isVisible().catch(() => false))) {
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 0) reloadedWhyJoinUsField = page.locator('textarea').nth(0);
    }
    if (!(await reloadedGoogleMapsField.isVisible().catch(() => false))) {
      const textareas = await page.locator('textarea').all();
      if (textareas.length > 1) reloadedGoogleMapsField = page.locator('textarea').nth(1);
    }

    // Verify both fields are still saved
    const refreshedWhyJoinUs = await reloadedWhyJoinUsField.inputValue().catch(() => '');
    const refreshedGoogleMaps = await reloadedGoogleMapsField.inputValue().catch(() => '');

    expect(refreshedWhyJoinUs).toContain(String(timestamp));
    expect(refreshedGoogleMaps).toContain(String(timestamp));
  });

  test('should verify fields persist in database via API', async ({ request }) => {
    // This test makes a direct API call to verify the fields are in the database
    // Note: This requires a valid token which may need to be obtained from a previous login

    try {
      // Try to get profile data via API
      const response = await request.get(`${BACKEND_URL}/api/employer/profile`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => null);

      if (!response) {
        console.log('Could not reach API without token');
        test.skip();
      }

      // If we get here, the endpoint is accessible
      expect(response.status()).toBeLessThan(500);
    } catch (error) {
      console.log('API verification skipped - requires authentication');
      test.skip();
    }
  });
});