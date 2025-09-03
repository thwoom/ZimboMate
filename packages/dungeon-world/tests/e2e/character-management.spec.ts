import { expect,test } from '@playwright/test';

import { testData,TestHelpers } from './utils/test-helpers';

test.describe('Character Management System', () => {
  let helpers: TestHelpers;

  test.beforeEach(async({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForAppReady();
  });

  test.describe('Character Creation', () => {
    test('should create a wizard character with proper stats', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Fill out character form
      await page.fill('[data-testid="character-name"]', testData.characters.wizard.name);
      await page.selectOption('[data-testid="character-class"]', testData.characters.wizard.class);
      await page.fill('[data-testid="character-background"]', 'Scholar');

      // Set character stats
      await page.fill('[data-testid="stat-str"]', testData.characters.wizard.stats.str.toString());
      await page.fill('[data-testid="stat-dex"]', testData.characters.wizard.stats.dex.toString());
      await page.fill('[data-testid="stat-con"]', testData.characters.wizard.stats.con.toString());
      await page.fill('[data-testid="stat-int"]', testData.characters.wizard.stats.int.toString());
      await page.fill('[data-testid="stat-wis"]', testData.characters.wizard.stats.wis.toString());
      await page.fill('[data-testid="stat-cha"]', testData.characters.wizard.stats.cha.toString());

      // Submit character creation
      await page.click('[data-testid="create-character-btn"]');

      // Verify character was created
      await expect(page.locator('[data-testid="character-created-success"]')).toBeVisible();

      // Navigate to character sheet to verify stats
      await helpers.navigateToPanel('character-stats');
      await expect(page.locator(`text=${testData.characters.wizard.name}`)).toBeVisible();
      await expect(page.locator('[data-testid="stat-int-value"]')).toHaveText(testData.characters.wizard.stats.int.toString());
    });

    test('should create a fighter character with different stats', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Fill out character form
      await page.fill('[data-testid="character-name"]', testData.characters.fighter.name);
      await page.selectOption('[data-testid="character-class"]', testData.characters.fighter.class);
      await page.fill('[data-testid="character-background"]', 'Soldier');

      // Set character stats
      await page.fill('[data-testid="stat-str"]', testData.characters.fighter.stats.str.toString());
      await page.fill('[data-testid="stat-dex"]', testData.characters.fighter.stats.dex.toString());
      await page.fill('[data-testid="stat-con"]', testData.characters.fighter.stats.con.toString());
      await page.fill('[data-testid="stat-int"]', testData.characters.fighter.stats.int.toString());
      await page.fill('[data-testid="stat-wis"]', testData.characters.fighter.stats.wis.toString());
      await page.fill('[data-testid="stat-cha"]', testData.characters.fighter.stats.cha.toString());

      // Submit character creation
      await page.click('[data-testid="create-character-btn"]');

      // Verify character was created
      await expect(page.locator('[data-testid="character-created-success"]')).toBeVisible();
    });

    test('should validate character creation requirements', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Try to submit without required fields
      await page.click('[data-testid="create-character-btn"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('text=Character name is required')).toBeVisible();
      await expect(page.locator('text=Character class is required')).toBeVisible();

      // Fill required fields and try again
      await page.fill('[data-testid="character-name"]', 'Valid Character');
      await page.selectOption('[data-testid="character-class"]', 'Wizard');
      await page.click('[data-testid="create-character-btn"]');

      // Should now succeed
      await expect(page.locator('[data-testid="character-created-success"]')).toBeVisible();
    });

    test('should calculate derived stats correctly', async({ page }) => {
      await helpers.navigateToPanel('character-creation');

      // Create character with known stats
      await page.fill('[data-testid="character-name"]', 'Test Character');
      await page.selectOption('[data-testid="character-class"]', 'Fighter');

      // Set base stats
      await page.fill('[data-testid="stat-str"]', '16');
      await page.fill('[data-testid="stat-dex"]', '14');
      await page.fill('[data-testid="stat-con"]', '15');
      await page.fill('[data-testid="stat-int"]', '10');
      await page.fill('[data-testid="stat-wis"]', '12');
      await page.fill('[data-testid="stat-cha"]', '8');

      // Verify derived stats are calculated correctly
      await expect(page.locator('[data-testid="modifier-str"]')).toHaveText('+3');
      await expect(page.locator('[data-testid="modifier-dex"]')).toHaveText('+2');
      await expect(page.locator('[data-testid="modifier-con"]')).toHaveText('+2');
      await expect(page.locator('[data-testid="modifier-int"]')).toHaveText('+0');
      await expect(page.locator('[data-testid="modifier-wis"]')).toHaveText('+1');
      await expect(page.locator('[data-testid="modifier-cha"]')).toHaveText('-1');
    });
  });

  test.describe('Character Advancement', () => {
    test('should level up character and increase stats', async({ page }) => {
      // First create a character
      await helpers.createTestCharacter('Advancing Character', 'Fighter');

      // Navigate to character stats
      await helpers.navigateToPanel('character-stats');

      // Check initial level
      await expect(page.locator('[data-testid="character-level"]')).toHaveText('1');

      // Level up the character
      await page.click('[data-testid="level-up-btn"]');
      await expect(page.locator('[data-testid="level-up-modal"]')).toBeVisible();

      // Choose advancement option
      await page.click('[data-testid="advancement-option"]:has-text("Increase Strength")');
      await page.click('[data-testid="confirm-level-up"]');

      // Verify level increased
      await expect(page.locator('[data-testid="character-level"]')).toHaveText('2');

      // Verify stats increased
      await expect(page.locator('[data-testid="stat-str-value"]')).toHaveText('17');
    });

    test('should unlock new moves at higher levels', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Move Unlocker', 'Wizard');

      // Navigate to moves panel
      await helpers.navigateToPanel('moves');

      // Check initial moves available
      await expect(page.locator('[data-testid="move-wizard-cantrips"]')).toBeVisible();

      // Level up to unlock new moves
      await helpers.navigateToPanel('character-stats');
      await page.click('[data-testid="level-up-btn"]');
      await page.click('[data-testid="advancement-option"]:has-text("Learn New Spell")');
      await page.click('[data-testid="confirm-level-up"]');

      // Navigate back to moves to see new options
      await helpers.navigateToPanel('moves');
      await expect(page.locator('[data-testid="move-wizard-level-1-spells"]')).toBeVisible();
    });
  });

  test.describe('Character Equipment', () => {
    test('should equip and unequip items', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Equipped Character', 'Fighter');

      // Navigate to equipment panel
      await helpers.navigateToPanel('equipment');

      // Equip a weapon
      await page.click('[data-testid="equip-item"]:has-text("Longsword")');
      await expect(page.locator('[data-testid="equipped-weapon"]')).toHaveText('Longsword');

      // Unequip the weapon
      await page.click('[data-testid="unequip-item"]:has-text("Longsword")');
      await expect(page.locator('[data-testid="equipped-weapon"]')).not.toHaveText('Longsword');
    });

    test('should calculate encumbrance correctly', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Encumbered Character', 'Fighter');

      // Navigate to equipment panel
      await helpers.navigateToPanel('equipment');

      // Check initial encumbrance
      await expect(page.locator('[data-testid="encumbrance-current"]')).toHaveText('0');
      await expect(page.locator('[data-testid="encumbrance-max"]')).toHaveText('10');

      // Add heavy items
      await page.click('[data-testid="add-item"]:has-text("Heavy Armor")');
      await page.click('[data-testid="add-item"]:has-text("Greatsword")');

      // Verify encumbrance increased
      await expect(page.locator('[data-testid="encumbrance-current"]')).toHaveText('8');

      // Check if character is encumbered
      await expect(page.locator('[data-testid="encumbrance-status"]')).toHaveText('Encumbered');
    });
  });

  test.describe('Character Conditions', () => {
    test('should apply and remove conditions', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Conditioned Character', 'Fighter');

      // Navigate to character stats
      await helpers.navigateToPanel('character-stats');

      // Apply a condition
      await page.click('[data-testid="add-condition"]');
      await page.selectOption('[data-testid="condition-type"]', 'poisoned');
      await page.fill('[data-testid="condition-duration"]', '3');
      await page.click('[data-testid="apply-condition"]');

      // Verify condition is applied
      await expect(page.locator('[data-testid="condition-poisoned"]')).toBeVisible();
      await expect(page.locator('[data-testid="condition-duration"]')).toHaveText('3');

      // Remove condition
      await page.click('[data-testid="remove-condition"]:has-text("poisoned")');
      await expect(page.locator('[data-testid="condition-poisoned"]')).not.toBeVisible();
    });

    test('should apply condition effects to stats', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Affected Character', 'Fighter');

      // Navigate to character stats
      await helpers.navigateToPanel('character-stats');

      // Check initial stats
      const initialDex = await page.locator('[data-testid="stat-dex-value"]').textContent();

      // Apply disadvantage condition
      await page.click('[data-testid="add-condition"]');
      await page.selectOption('[data-testid="condition-type"]', 'disadvantage');
      await page.click('[data-testid="apply-condition"]');

      // Verify disadvantage indicator is shown
      await expect(page.locator('[data-testid="disadvantage-indicator"]')).toBeVisible();
    });
  });

  test.describe('Character Bonds and Alignment', () => {
    test('should create and manage character bonds', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Bonded Character', 'Fighter');

      // Navigate to bonds panel
      await helpers.navigateToPanel('bonds');

      // Create a bond
      await page.click('[data-testid="create-bond"]');
      await page.fill('[data-testid="bond-description"]', 'I will protect my village from harm');
      await page.selectOption('[data-testid="bond-type"]', 'duty');
      await page.click('[data-testid="save-bond"]');

      // Verify bond was created
      await expect(page.locator('text=I will protect my village from harm')).toBeVisible();
      await expect(page.locator('[data-testid="bond-type-duty"]')).toBeVisible();
    });

    test('should track alignment and XP', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Aligned Character', 'Paladin');

      // Navigate to alignment panel
      await helpers.navigateToPanel('alignment');

      // Set alignment
      await page.selectOption('[data-testid="alignment-select"]', 'lawful-good');

      // Perform an aligned action
      await page.click('[data-testid="aligned-action"]:has-text("Help the innocent")');

      // Verify XP gained
      await expect(page.locator('[data-testid="alignment-xp"]')).toHaveText('1');
    });
  });

  test.describe('Character Export/Import', () => {
    test('should export character data', async({ page }) => {
      // Create a character
      await helpers.createTestCharacter('Exportable Character', 'Wizard');

      // Navigate to export panel
      await helpers.navigateToPanel('export-import');

      // Export character
      await page.click('[data-testid="export-character"]');

      // Verify download started
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
    });

    test('should import character data', async({ page }) => {
      // Navigate to import panel
      await helpers.navigateToPanel('export-import');

      // Upload character file
      await page.setInputFiles('[data-testid="character-file-input"]', 'test-data/test-character.json');

      // Verify character imported
      await expect(page.locator('[data-testid="import-success"]')).toBeVisible();
      await expect(page.locator('text=Imported Character')).toBeVisible();
    });
  });
});
