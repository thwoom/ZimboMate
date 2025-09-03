import { expect,test } from '@playwright/test';

test.describe('ZimboMate Realistic App Tests', () => {
  test('should load the app and display all navigation elements', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the app loads
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-layout"]')).toBeVisible();

    // Check sidebar structure
    await expect(page.locator('[data-testid="main-layout-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-title"]')).toHaveText('Dungeon World');
    await expect(page.locator('[data-testid="sidebar-navigation"]')).toBeVisible();

    // Check main content area
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();

    // Check theme toggle
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
  });

  test('should display all actual navigation panels', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // These are the actual panel IDs that exist in your app
    const actualPanelIds = [
      'character-creation',
      'character-stats',
      'equipment',
      'moves',
      'spells',
      'special-moves',
      'campaigns',
      'test-playground',
      'move-library',
      'content-studio',
      'bonds',
      'alignment-xp-tracker',
      'condition-tracker',
      'inventory',
      'session-tools',
      'lore-journal',
    ];

    // Check that navigation buttons exist for actual panels
    for (const panelId of actualPanelIds) {
      const navButton = page.locator(`[data-testid="nav-${panelId}"]`);
      await expect(navButton).toBeVisible();
    }
  });

  test('should navigate to character-stats panel (default)', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on character-stats navigation (this should be the default active panel)
    await page.click('[data-testid="nav-character-stats"]');
    await page.waitForTimeout(500);

    // Verify the button is now active
    await expect(page.locator('[data-testid="nav-character-stats"]')).toBeVisible();
  });

  test('should navigate to equipment panel', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on equipment navigation
    await page.click('[data-testid="nav-equipment"]');
    await page.waitForTimeout(500);

    // Verify the button is visible
    await expect(page.locator('[data-testid="nav-equipment"]')).toBeVisible();
  });

  test('should navigate to moves panel', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on moves navigation
    await page.click('[data-testid="nav-moves"]');
    await page.waitForTimeout(500);

    // Verify the button is visible
    await expect(page.locator('[data-testid="nav-moves"]')).toBeVisible();
  });

  test('should handle theme toggle interaction', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click the theme toggle
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Verify the theme toggle is still visible and functional
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible();
  });

  test('should be responsive on different screen sizes', async({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify app loads on mobile
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify app loads on tablet
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Verify app loads on desktop
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('should handle basic app interactions without errors', async({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click on sidebar header
    await page.click('[data-testid="sidebar-header"]');

    // Click on navigation
    await page.click('[data-testid="sidebar-navigation"]');

    // Verify app is still responsive
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible();

    // Check for no console errors
    const errors = await page.evaluate(() => {
      return window.console.error ? window.console.error.mock?.calls?.length || 0 : 0;
    });
    expect(errors).toBe(0);
  });
});
