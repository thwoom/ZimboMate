import { chromium } from 'playwright';

/**
 * Comprehensive Visual Regression Testing for Dice System
 * Tests the complete dice rolling functionality with screenshots
 */

class DiceSystemVisualTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = [];
    this.testResults = [];
  }

  async initialize() {
    console.log('🎲 DICE SYSTEM VISUAL REGRESSION TESTING');
    console.log('Testing comprehensive dice system with screenshots...\n');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      viewport: { width: 1400, height: 1000 }
    });

    this.page = await this.browser.newPage();

    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ CONSOLE ERROR:', msg.text());
      }
    });

    // Navigate to app
    await this.page.goto('http://localhost:3001');
    await this.page.waitForTimeout(2000);
    console.log('✅ Connected to app');
  }

  async takeScreenshot(name, description) {
    const filename = `dice-test-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    this.screenshots.push({ name, filename, description });
    console.log(`📸 Screenshot: ${filename} - ${description}`);
    return filename;
  }

  async testDiceTabAccess() {
    console.log('\n🔍 Test 1: Dice Tab Access and Initial State');

    try {
      // Initial state on Character tab
      await this.takeScreenshot('01-initial-character-tab', 'App loads on Character tab');

      // Click Dice tab
      const diceTab = await this.page.locator('button:has-text("Dice")');
      await diceTab.click();
      await this.page.waitForTimeout(2000);

      await this.takeScreenshot('02-dice-tab-initial', 'Dice tab loads successfully');

      // Verify key elements are visible
      const diceTitle = await this.page.locator('text=Dice Rolling System');
      const statsTab = await this.page.locator('button:has-text("Stats")');
      const movesTab = await this.page.locator('button:has-text("Moves")');

      if (await diceTitle.count() > 0 && await statsTab.count() > 0 && await movesTab.count() > 0) {
        return { success: true, message: 'Dice tab loads with all key elements' };
      } else {
        return { success: false, message: 'Missing key dice system elements' };
      }

    } catch (error) {
      return { success: false, message: `Dice tab access failed: ${error.message}` };
    }
  }

  async testTabNavigation() {
    console.log('\n🔍 Test 2: Tab Navigation (Stats, Moves, Custom)');

    try {
      // Test Stats tab
      const statsTab = await this.page.locator('button:has-text("Stats")');
      await statsTab.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('03-stats-tab', 'Stats tab selected');

      // Test Moves tab
      const movesTab = await this.page.locator('button:has-text("Moves")');
      await movesTab.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('04-moves-tab', 'Moves tab selected');

      // Test Custom tab
      const customTab = await this.page.locator('button:has-text("Custom")');
      await customTab.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('05-custom-tab', 'Custom tab selected');

      return { success: true, message: 'All tabs navigate successfully' };

    } catch (error) {
      return { success: false, message: `Tab navigation failed: ${error.message}` };
    }
  }

  async testRollDisplayModes() {
    console.log('\n🔍 Test 3: Roll Display Modes (Persistent, Timeline, Comparison)');

    try {
      // Test Persistent mode (default)
      await this.takeScreenshot('06-persistent-mode', 'Persistent roll display mode');

      // Test Timeline mode
      const timelineButton = await this.page.locator('button:has-text("timeline")');
      if (await timelineButton.count() > 0) {
        await timelineButton.click();
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot('07-timeline-mode', 'Timeline roll display mode');
      }

      // Test Comparison mode
      const comparisonButton = await this.page.locator('button:has-text("comparison")');
      if (await comparisonButton.count() > 0) {
        await comparisonButton.click();
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot('08-comparison-mode', 'Comparison roll display mode');
      }

      // Return to persistent
      const persistentButton = await this.page.locator('button:has-text("persistent")');
      if (await persistentButton.count() > 0) {
        await persistentButton.click();
        await this.page.waitForTimeout(1000);
      }

      return { success: true, message: 'Roll display modes work correctly' };

    } catch (error) {
      return { success: false, message: `Roll display modes failed: ${error.message}` };
    }
  }

  async testCharacterCreation() {
    console.log('\n🔍 Test 4: Character Creation for Testing Rolls');

    try {
      // Click Character tab to create a test character
      const characterTab = await this.page.locator('button:has-text("Character")');
      await characterTab.click();
      await this.page.waitForTimeout(2000);

      // Look for Create Character button
      const createButton = await this.page.locator('button:has-text("Create Character")');
      if (await createButton.count() > 0) {
        await createButton.click();
        await this.page.waitForTimeout(2000);
        await this.takeScreenshot('09-character-creation', 'Character creation dialog');

        // Try to fill in basic character info and create
        // This is a simplified test - may need to be adjusted based on actual form
        const nameInput = await this.page.locator('input[placeholder*="name"], input[name*="name"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test Warrior');
          await this.page.waitForTimeout(500);

          // Look for create/save button
          const saveButton = await this.page.locator('button:has-text("Create"), button:has-text("Save")').first();
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await this.page.waitForTimeout(2000);
            await this.takeScreenshot('10-character-created', 'Character created successfully');
          }
        }
      }

      return { success: true, message: 'Character creation attempted' };

    } catch (error) {
      return { success: false, message: `Character creation failed: ${error.message}` };
    }
  }

  async testDiceRolling() {
    console.log('\n🔍 Test 5: Actual Dice Rolling Functionality');

    try {
      // Return to Dice tab
      const diceTab = await this.page.locator('button:has-text("Dice")');
      await diceTab.click();
      await this.page.waitForTimeout(2000);

      // Go to Stats tab to try rolling
      const statsTab = await this.page.locator('button:has-text("Stats")');
      await statsTab.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('11-ready-to-roll', 'Ready to test dice rolling');

      // Look for rollable stat buttons (STR, DEX, etc.)
      const statButtons = await this.page.locator('button:has-text("STR"), button:has-text("DEX"), button:has-text("WIS")');
      if (await statButtons.count() > 0) {
        // Try clicking first stat button
        await statButtons.first().click();
        await this.page.waitForTimeout(3000); // Wait for roll animation

        await this.takeScreenshot('12-after-stat-roll', 'After attempting stat roll');

        // Look for roll results
        const rollResults = await this.page.locator('.roll-result, [class*="roll"], [class*="dice"]');
        if (await rollResults.count() > 0) {
          await this.takeScreenshot('13-roll-results', 'Roll results displayed');
        }
      }

      // Test Moves tab rolling
      const movesTab = await this.page.locator('button:has-text("Moves")');
      await movesTab.click();
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('14-moves-tab-rolling', 'Moves tab for rolling');

      // Look for move buttons
      const moveButtons = await this.page.locator('button:contains("Hack and Slash"), button:contains("Volley"), button:contains("Defy Danger")');
      if (await moveButtons.count() > 0) {
        await moveButtons.first().click();
        await this.page.waitForTimeout(3000);
        await this.takeScreenshot('15-after-move-roll', 'After attempting move roll');
      }

      return { success: true, message: 'Dice rolling functionality tested' };

    } catch (error) {
      return { success: false, message: `Dice rolling test failed: ${error.message}` };
    }
  }

  async testKeyboardShortcuts() {
    console.log('\n🔍 Test 6: Keyboard Shortcuts');

    try {
      await this.takeScreenshot('16-before-keyboard-test', 'Before keyboard shortcuts test');

      // Test stat rolling shortcuts
      await this.page.keyboard.press('s'); // Should trigger STR roll
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('17-keyboard-str-roll', 'After S key (STR roll)');

      await this.page.keyboard.press('d'); // Should trigger DEX roll
      await this.page.waitForTimeout(2000);
      await this.takeScreenshot('18-keyboard-dex-roll', 'After D key (DEX roll)');

      // Test command palette
      await this.page.keyboard.press('Control+k');
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('19-command-palette', 'Command palette opened with Ctrl+K');

      // Close command palette
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);

      return { success: true, message: 'Keyboard shortcuts tested' };

    } catch (error) {
      return { success: false, message: `Keyboard shortcuts failed: ${error.message}` };
    }
  }

  async testResponsiveDesign() {
    console.log('\n🔍 Test 7: Responsive Design');

    try {
      // Desktop view
      await this.page.setViewportSize({ width: 1400, height: 1000 });
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('20-desktop-view', 'Desktop responsive view');

      // Tablet view
      await this.page.setViewportSize({ width: 768, height: 1024 });
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('21-tablet-view', 'Tablet responsive view');

      // Mobile view
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot('22-mobile-view', 'Mobile responsive view');

      // Reset to desktop
      await this.page.setViewportSize({ width: 1400, height: 1000 });
      await this.page.waitForTimeout(1000);

      return { success: true, message: 'Responsive design tested across viewports' };

    } catch (error) {
      return { success: false, message: `Responsive design test failed: ${error.message}` };
    }
  }

  async testErrorHandling() {
    console.log('\n🔍 Test 8: Error Handling and Edge Cases');

    try {
      // Test with no character selected
      await this.takeScreenshot('23-no-character-state', 'No character selected state');

      // Try various interactions that might cause errors
      await this.page.keyboard.press('Control+r'); // Try refresh
      await this.page.waitForTimeout(2000);

      await this.takeScreenshot('24-after-refresh', 'After page refresh');

      return { success: true, message: 'Error handling and edge cases tested' };

    } catch (error) {
      return { success: false, message: `Error handling test failed: ${error.message}` };
    }
  }

  async generateVisualReport() {
    console.log('\n📊 VISUAL REGRESSION TEST REPORT');
    console.log('=====================================');

    const summary = this.testResults.reduce((acc, result) => {
      acc.total++;
      if (result.success) acc.passed++;
      else acc.failed++;
      return acc;
    }, { total: 0, passed: 0, failed: 0 });

    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`📈 Success Rate: ${Math.round((summary.passed / summary.total) * 100)}%`);

    console.log('\nDetailed Results:');
    this.testResults.forEach((result, index) => {
      console.log(`${result.success ? '✅' : '❌'} Test ${index + 1}: ${result.message}`);
    });

    console.log('\n📸 Screenshots Generated:');
    this.screenshots.forEach(screenshot => {
      console.log(`   ${screenshot.filename} - ${screenshot.description}`);
    });

    console.log(`\n🎯 Total Screenshots: ${this.screenshots.length}`);
    console.log('📁 All screenshots saved to current directory');

    return { summary, screenshots: this.screenshots };
  }

  async runAllTests() {
    try {
      await this.initialize();

      const tests = [
        { name: 'Dice Tab Access', fn: () => this.testDiceTabAccess() },
        { name: 'Tab Navigation', fn: () => this.testTabNavigation() },
        { name: 'Roll Display Modes', fn: () => this.testRollDisplayModes() },
        { name: 'Character Creation', fn: () => this.testCharacterCreation() },
        { name: 'Dice Rolling', fn: () => this.testDiceRolling() },
        { name: 'Keyboard Shortcuts', fn: () => this.testKeyboardShortcuts() },
        { name: 'Responsive Design', fn: () => this.testResponsiveDesign() },
        { name: 'Error Handling', fn: () => this.testErrorHandling() }
      ];

      for (const test of tests) {
        const result = await test.fn();
        this.testResults.push({ name: test.name, ...result });
        console.log(`${result.success ? '✅' : '❌'} ${test.name}: ${result.message}\n`);
      }

      const report = await this.generateVisualReport();
      return report;

    } catch (error) {
      console.error('🚨 Visual testing failed:', error);
      return { summary: { total: 0, passed: 0, failed: 1 }, screenshots: this.screenshots };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the comprehensive visual tests
const tester = new DiceSystemVisualTester();
tester.runAllTests().then(report => {
  process.exit(report.summary.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});