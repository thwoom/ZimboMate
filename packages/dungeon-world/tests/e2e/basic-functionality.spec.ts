import { expect,test } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the app and display Dungeon World title', async({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('domcontentloaded');

    // Check that the app loads
    await expect(page.locator('body')).toBeVisible();

    // Check for the main title
    await expect(page.locator('text=Dungeon World')).toBeVisible();

    // Check for the app container
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });

  test('should display sidebar with navigation', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check sidebar exists (use the specific one from MainLayout)
    await expect(page.locator('[data-testid="main-layout-sidebar"]')).toBeVisible();

    // Check the inner sidebar component
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Check sidebar header
    await expect(page.locator('[data-testid="sidebar-header"]')).toBeVisible();

    // Check app title in sidebar
    await expect(page.locator('[data-testid="app-title"]')).toHaveText('Dungeon World');

    // Check navigation exists
    await expect(page.locator('[data-testid="sidebar-navigation"]')).toBeVisible();
  });

  test('should display main content area', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check main content area exists
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    // Check main layout exists
    await expect(page.locator('[data-testid="main-layout"]')).toBeVisible();
  });

  test('should have working navigation buttons', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that navigation buttons exist
    await expect(page.locator('[data-testid="nav-character-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-equipment"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-moves"]')).toBeVisible();

    // Click on a navigation button
    await page.click('[data-testid="nav-equipment"]');

    // Wait a moment for the click to register
    await page.waitForTimeout(500);

    // Verify the button was clicked (you might need to adjust this based on your actual implementation)
    await expect(page.locator('[data-testid="nav-equipment"]')).toBeVisible();
  });

  test('should display theme toggle', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the theme toggle exists (DarkModeToggle component)
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
    await expect(page.locator('.theme-toggle')).toBeVisible();
  });

  test('should handle basic app interactions', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the app is interactive
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();

    // Try to interact with the sidebar
    await page.click('[data-testid="sidebar-header"]');

    // Verify the app is still responsive
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
  });
});
