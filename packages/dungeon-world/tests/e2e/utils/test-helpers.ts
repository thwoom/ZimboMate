import { expect,Page } from '@playwright/test';

/**
 * Test helper utilities for ZimboMate app
 */
export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the app to be fully loaded
   */
  async waitForAppReady() {
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for the main app container to be visible
    await this.page.waitForSelector('[data-testid="app-container"]');
    // Wait for the sidebar to be visible (indicates app is ready)
    await this.page.waitForSelector('[data-testid="sidebar"]');
  }

  /**
   * Navigate to a specific panel/route
   */
  async navigateToPanel(panelName: string) {
    // Click the navigation button for the panel
    await this.page.click(`[data-testid="nav-${panelName}"]`);
    // Wait for the panel to be active (you might need to adjust this based on your actual implementation)
    await this.page.waitForTimeout(500); // Give time for panel switch
  }

  /**
   * Create a test character with basic data
   */
  async createTestCharacter(name: string, characterClass: string) {
    await this.page.click('[data-testid="create-character-btn"]');
    await this.page.fill('[data-testid="character-name"]', name);
    await this.page.selectOption('[data-testid="character-class"]', characterClass);
    await this.page.click('[data-testid="confirm-character-creation"]');

    // Wait for character to be created
    await this.page.waitForSelector('[data-testid="character-sheet"]');
  }

  /**
   * Roll dice and verify result
   */
  async rollDice(diceType: string) {
    const rollButton = this.page.locator(`[data-testid="roll-${diceType}"]`);
    await rollButton.click();

    // Wait for dice animation and result
    await this.page.waitForTimeout(1000);

    const result = this.page.locator('[data-testid="dice-result"]');
    await expect(result).toBeVisible();

    return await result.textContent();
  }

  /**
   * Create a test task
   */
  async createTestTask(title: string, priority = 'p3') {
    await this.page.click('[data-testid="create-task-btn"]');
    await this.page.fill('[data-testid="task-title"]', title);
    await this.page.selectOption('[data-testid="task-priority"]', priority);
    await this.page.click('[data-testid="save-task"]');

    // Wait for task to appear in list
    await this.page.waitForSelector(`text=${title}`);
  }

  /**
   * Complete a task
   */
  async completeTask(title: string) {
    const taskRow = this.page.locator(`[data-testid="task-row"]:has-text("${title}")`);
    await taskRow.locator('[data-testid="complete-task-btn"]').click();

    // Wait for completion confirmation
    await this.page.waitForSelector('[data-testid="task-completed"]');
  }

  /**
   * Take a screenshot for debugging
   */
  async takeDebugScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/debug-${name}.png` });
  }
}

/**
 * Common test data
 */
export const testData = {
  characters: {
    wizard: {
      name: 'Test Wizard',
      class: 'Wizard',
      stats: { str: 8, dex: 12, con: 10, int: 16, wis: 14, cha: 13 },
    },
    fighter: {
      name: 'Test Fighter',
      class: 'Fighter',
      stats: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
    },
  },
  tasks: {
    simple: 'Test simple task',
    complex: 'Test complex task with description',
    urgent: 'Test urgent task',
  },
};
