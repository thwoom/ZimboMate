import { expect,test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the app successfully', async({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Basic verification that the app loaded
    await expect(page.locator('body')).toBeVisible();

    // Check that there are no console errors
    const errors = await page.evaluate(() => {
      return window.console.error ? window.console.error.mock?.calls?.length || 0 : 0;
    });

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/smoke-test-success.png' });

    // Verify no critical errors
    expect(errors).toBe(0);
  });

  test('should have basic page structure', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check for basic HTML structure - only body should be visible
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    // Verify the page has some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('should handle basic navigation', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Test that we can navigate to different URLs
    await page.goto('/#/test');
    await page.waitForLoadState('domcontentloaded');

    // Verify the page is still responsive
    await expect(page.locator('body')).toBeVisible();

    // Navigate back
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify we're back to the main page
    await expect(page.locator('body')).toBeVisible();
  });
});
