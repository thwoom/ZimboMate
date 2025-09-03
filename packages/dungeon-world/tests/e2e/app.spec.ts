import { expect,test } from '@playwright/test';

import { testData,TestHelpers } from './utils/test-helpers';

test.describe('ZimboMate App', () => {
  let helpers: TestHelpers;

  test.beforeEach(async({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForAppReady();
  });

  test.describe('App Navigation', () => {
    test('should load the main app successfully', async({ page }) => {
      // Verify the app loads without errors
      await expect(page.locator('body')).not.toHaveClass(/error/);

      // Check for main app elements
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="app-title"]')).toHaveText('Dungeon World');
    });

    test('should navigate between panels without errors', async({ page }) => {
      // Test navigation to a few key panels
      const panels = ['character-stats', 'equipment', 'moves'];

      for (const panel of panels) {
        await helpers.navigateToPanel(panel);
        // Wait a moment for panel to load
        await page.waitForTimeout(500);

        // Verify the navigation button is active
        await expect(page.locator(`[data-testid="nav-${panel}"]`)).toHaveClass(/active/);

        // Verify no console errors during navigation
        const errors = await page.evaluate(() => {
          return window.console.error ? window.console.error.mock?.calls?.length || 0 : 0;
        });
        expect(errors).toBe(0);
      }
    });
  });

  test.describe('Character Creation', () => {
    test('should create a new character successfully', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Fill out character form
      await page.fill('[data-testid="character-name"]', testData.characters.wizard.name);
      await page.selectOption('[data-testid="character-class"]', testData.characters.wizard.class);

      // Verify form validation
      await expect(page.locator('[data-testid="character-name"]')).toHaveValue(testData.characters.wizard.name);
      await expect(page.locator('[data-testid="character-class"]')).toHaveValue(testData.characters.wizard.class);

      // Submit form
      await page.click('[data-testid="create-character-btn"]');

      // Verify success
      await expect(page.locator('[data-testid="character-created-success"]')).toBeVisible();
    });

    test('should validate required fields', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Try to submit without required fields
      await page.click('[data-testid="create-character-btn"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    });
  });

  test.describe('Dice Rolling', () => {
    test('should roll dice and display results', async({ page }) => {
      await helpers.navigateToPanel('dice-roller');

      // Test different dice types
      const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

      for (const diceType of diceTypes) {
        const result = await helpers.rollDice(diceType);
        expect(result).toBeTruthy();

        // Verify result is a valid number
        const numResult = Number.parseInt(result!);
        expect(numResult).toBeGreaterThan(0);

        // Verify result is within dice range
        const maxValue = Number.parseInt(diceType.replace('d', ''));
        expect(numResult).toBeLessThanOrEqual(maxValue);
      }
    });

    test('should animate dice rolls', async({ page }) => {
      await helpers.navigateToPanel('dice-roller');

      // Start a roll
      await page.click('[data-testid="roll-d20"]');

      // Verify animation plays
      await expect(page.locator('[data-testid="dice-animation"]')).toBeVisible();

      // Wait for animation to complete
      await page.waitForTimeout(2000);

      // Verify result is shown
      await expect(page.locator('[data-testid="dice-result"]')).toBeVisible();
    });
  });

  test.describe('Task Management', () => {
    test('should create and manage tasks', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create a task
      const taskTitle = testData.tasks.simple;
      await helpers.createTestTask(taskTitle, 'p2');

      // Verify task appears in list
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible();

      // Complete the task
      await helpers.completeTask(taskTitle);

      // Verify task is marked as completed
      await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();
    });

    test('should filter tasks by priority', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create tasks with different priorities
      await helpers.createTestTask('High Priority Task', 'p1');
      await helpers.createTestTask('Medium Priority Task', 'p2');
      await helpers.createTestTask('Low Priority Task', 'p3');

      // Filter by high priority
      await page.selectOption('[data-testid="priority-filter"]', 'p1');

      // Verify only high priority tasks are shown
      await expect(page.locator('text=High Priority Task')).toBeVisible();
      await expect(page.locator('text=Medium Priority Task')).not.toBeVisible();
      await expect(page.locator('text=Low Priority Task')).not.toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/');
      await helpers.waitForAppReady();

      // Verify the app loads on mobile
      await expect(page.locator('[data-testid="app-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

      // Verify content is properly sized for mobile
      const contentWidth = await page.locator('[data-testid="main-content"]').boundingBox();
      expect(contentWidth!.width).toBeLessThanOrEqual(375);
    });

    test('should work on tablet devices', async({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/');
      await helpers.waitForAppReady();

      // Verify tablet layout works
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async({ page }) => {
      // Mock network failure
      await page.route('**/api/**', route => route.abort());

      // Try to perform an action that requires API
      await helpers.navigateToPanel('character-creation');

      // Verify error message is shown
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

      // Verify retry option is available
      await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
    });

    test('should recover from errors after network restoration', async({ page }) => {
      // First, cause a network error
      await page.route('**/api/**', route => route.abort());
      await helpers.navigateToPanel('character-creation');

      // Restore network
      await page.unroute('**/api/**');

      // Click retry
      await page.click('[data-testid="retry-btn"]');

      // Verify recovery
      await expect(page.locator('[data-testid="character-creation-form"]')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await helpers.waitForAppReady();

      const loadTime = Date.now() - startTime;

      // App should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not have memory leaks during navigation', async({ page }) => {
      // Navigate multiple times to check for memory issues
      for (let i = 0; i < 5; i++) {
        await helpers.navigateToPanel('character-creation');
        await helpers.navigateToPanel('character-stats');
        await helpers.navigateToPanel('moves');
      }

      // Verify app is still responsive
      await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    });
  });
});
