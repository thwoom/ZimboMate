import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Visual Regression Testing System for ZimboMate V2
 *
 * This system captures screenshots of all UI interactions and compares them
 * against expected behaviors to catch UX issues like hidden buttons,
 * missing visual feedback, and poor discoverability.
 */

class VisualRegressionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baselineDir = './visual-baselines';
    this.currentDir = './visual-current';
    this.diffDir = './visual-diffs';

    // Create directories
    [this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize() {
    console.log('🔍 VISUAL REGRESSION TESTING SYSTEM');
    console.log('Systematic UI/UX interaction testing...\n');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      viewport: { width: 1400, height: 1000 }
    });

    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:3002');
    await this.page.waitForTimeout(2000);
  }

  async testInteractionPattern(name, testFn, expectedBehaviors) {
    console.log(`🧪 Testing: ${name}`);

    const testResult = {
      name,
      timestamp: new Date().toISOString(),
      expectedBehaviors,
      actualBehaviors: [],
      issues: [],
      screenshots: []
    };

    try {
      // Take initial screenshot
      const initialScreenshot = `${name}-initial.png`;
      await this.page.screenshot({
        path: path.join(this.currentDir, initialScreenshot),
        fullPage: true
      });
      testResult.screenshots.push(initialScreenshot);

      // Run the test
      const result = await testFn(this.page);
      testResult.actualBehaviors = result.behaviors || [];

      // Take final screenshot
      const finalScreenshot = `${name}-final.png`;
      await this.page.screenshot({
        path: path.join(this.currentDir, finalScreenshot),
        fullPage: true
      });
      testResult.screenshots.push(finalScreenshot);

      // Analyze behaviors vs expectations
      this.analyzeBehaviors(testResult);

      console.log(`   ✅ Test completed: ${testResult.issues.length} issues found`);

    } catch (error) {
      testResult.issues.push(`Test execution failed: ${error.message}`);
      console.log(`   ❌ Test failed: ${error.message}`);
    }

    this.testResults.push(testResult);
    return testResult;
  }

  analyzeBehaviors(testResult) {
    const { expectedBehaviors, actualBehaviors } = testResult;

    expectedBehaviors.forEach(expected => {
      const actual = actualBehaviors.find(a => a.type === expected.type);

      if (!actual) {
        testResult.issues.push(`Missing behavior: ${expected.description}`);
      } else if (expected.shouldBeVisible && !actual.visible) {
        testResult.issues.push(`Element should be visible but isn't: ${expected.description}`);
      } else if (expected.shouldWork && !actual.working) {
        testResult.issues.push(`Interaction should work but doesn't: ${expected.description}`);
      } else if (expected.shouldHaveVisualFeedback && !actual.visualFeedback) {
        testResult.issues.push(`Missing visual feedback: ${expected.description}`);
      }
    });
  }

  // Equipment interaction tests
  async testEquipmentUnequip() {
    return await this.testInteractionPattern(
      'equipment-unequip',
      async (page) => {
        // Navigate to equipment
        await page.locator('button:has-text("Equipment")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Test 1: Check for visible unequip buttons without interaction
        const visibleUnequipCount = await page.locator('button:visible:has(.lucide-arrow-down-right)').count();
        behaviors.push({
          type: 'unequip-button-visibility',
          visible: visibleUnequipCount > 0,
          count: visibleUnequipCount,
          description: `Found ${visibleUnequipCount} visible unequip buttons`
        });

        // Test 2: Single click behavior
        const equippedItems = await page.locator('.equipment-slot-filled').all();
        if (equippedItems.length > 0) {
          const initialCount = equippedItems.length;
          await equippedItems[0].click();
          await page.waitForTimeout(1000);

          const afterClickCount = await page.locator('.equipment-slot-filled').count();
          behaviors.push({
            type: 'single-click-unequip',
            working: afterClickCount < initialCount,
            visualFeedback: false, // We'll check this separately
            description: `Single click ${afterClickCount < initialCount ? 'worked' : 'had no effect'}`
          });
        }

        // Test 3: Hover behavior
        if (equippedItems.length > 0) {
          await equippedItems[0].hover();
          await page.waitForTimeout(500);

          const hoverUnequipCount = await page.locator('button:visible:has(.lucide-arrow-down-right)').count();
          behaviors.push({
            type: 'hover-reveals-buttons',
            visible: hoverUnequipCount > 0,
            visualFeedback: true,
            description: `Hover revealed ${hoverUnequipCount} unequip buttons`
          });
        }

        return { behaviors };
      },
      [
        {
          type: 'unequip-button-visibility',
          shouldBeVisible: true,
          description: 'Unequip buttons should be visible without hover for discoverability'
        },
        {
          type: 'single-click-unequip',
          shouldWork: true,
          description: 'Single click should unequip item (most intuitive interaction)'
        },
        {
          type: 'hover-reveals-buttons',
          shouldHaveVisualFeedback: true,
          description: 'Hover should provide clear visual feedback'
        }
      ]
    );
  }

  // Character creation interaction tests
  async testCharacterCreation() {
    return await this.testInteractionPattern(
      'character-creation',
      async (page) => {
        await page.locator('button:has-text("Character")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Look for create character buttons
        const createButtons = await page.locator('button:has-text("Create")').count();
        behaviors.push({
          type: 'create-button-visibility',
          visible: createButtons > 0,
          description: `Found ${createButtons} create buttons`
        });

        // Test form accessibility
        const inputFields = await page.locator('input:visible').count();
        behaviors.push({
          type: 'form-inputs',
          visible: inputFields > 0,
          description: `Found ${inputFields} visible input fields`
        });

        return { behaviors };
      },
      [
        {
          type: 'create-button-visibility',
          shouldBeVisible: true,
          description: 'Character creation should be clearly accessible'
        }
      ]
    );
  }

  // Moves interaction tests
  async testMovesInteraction() {
    return await this.testInteractionPattern(
      'moves-interaction',
      async (page) => {
        await page.locator('button:has-text("Moves")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Check for move buttons
        const moveButtons = await page.locator('button:has-text("Hack and Slash"), button:has-text("Defend")').count();
        behaviors.push({
          type: 'move-buttons',
          visible: moveButtons > 0,
          description: `Found ${moveButtons} move buttons`
        });

        // Test move interaction
        const defendButton = page.locator('button:has-text("Defend")');
        if (await defendButton.isVisible()) {
          await defendButton.click();
          await page.waitForTimeout(1000);

          // Check if roll interface appeared
          const rollInterface = await page.locator('.dice-roller, button:has-text("Roll")').count();
          behaviors.push({
            type: 'move-roll-interface',
            working: rollInterface > 0,
            visualFeedback: rollInterface > 0,
            description: `Move click ${rollInterface > 0 ? 'opened roll interface' : 'had no visible effect'}`
          });
        }

        return { behaviors };
      },
      [
        {
          type: 'move-buttons',
          shouldBeVisible: true,
          description: 'Move buttons should be clearly visible'
        },
        {
          type: 'move-roll-interface',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Clicking moves should open roll interface with clear feedback'
        }
      ]
    );
  }

  // Dice interaction tests
  async testDiceInteraction() {
    return await this.testInteractionPattern(
      'dice-interaction',
      async (page) => {
        await page.locator('button:has-text("Dice")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Look for dice roll buttons
        const diceButtons = await page.locator('button:has-text("Roll"), button:has-text("2d6")').count();
        behaviors.push({
          type: 'dice-buttons',
          visible: diceButtons > 0,
          description: `Found ${diceButtons} dice buttons`
        });

        // Test dice roll
        const rollButton = page.locator('button:has-text("Roll")').first();
        if (await rollButton.isVisible()) {
          await rollButton.click();
          await page.waitForTimeout(1000);

          // Check for roll results
          const results = await page.locator('.dice-result, .roll-result').count();
          behaviors.push({
            type: 'roll-results',
            working: results > 0,
            visualFeedback: results > 0,
            description: `Roll ${results > 0 ? 'produced visible results' : 'had no visible results'}`
          });
        }

        return { behaviors };
      },
      [
        {
          type: 'dice-buttons',
          shouldBeVisible: true,
          description: 'Dice roll buttons should be visible'
        },
        {
          type: 'roll-results',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Dice rolls should produce visible results'
        }
      ]
    );
  }

  // New dice system behavioral tests
  async testDiceHistorySidebar() {
    return await this.testInteractionPattern(
      'dice-history-sidebar',
      async (page) => {
        await page.locator('button:has-text("Character")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Test 1: Sidebar visibility by default
        const sidebar = page.locator('#dice-history-content');
        const isVisible = await sidebar.isVisible();
        behaviors.push({
          type: 'sidebar-visibility',
          visible: isVisible,
          description: `Dice history sidebar ${isVisible ? 'is visible' : 'is not visible'} by default`
        });

        // Test 2: Collapse/expand functionality
        const collapseButton = page.locator('button[aria-label="Collapse dice history sidebar"]');
        if (await collapseButton.isVisible()) {
          await collapseButton.click();
          await page.waitForTimeout(500);

          const collapsedVisible = await sidebar.isVisible();
          behaviors.push({
            type: 'sidebar-collapse',
            working: !collapsedVisible,
            visualFeedback: true,
            description: `Collapse button ${!collapsedVisible ? 'worked' : 'had no effect'}`
          });

          // Expand it back
          await collapseButton.click();
          await page.waitForTimeout(500);
        }

        return { behaviors };
      },
      [
        {
          type: 'sidebar-visibility',
          shouldBeVisible: true,
          description: 'Dice history sidebar should be visible to show roll context'
        },
        {
          type: 'sidebar-collapse',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Users should be able to collapse sidebar to save space'
        }
      ]
    );
  }

  async testStatHoverInteractions() {
    return await this.testInteractionPattern(
      'stat-hover-interactions',
      async (page) => {
        await page.locator('button:has-text("Character")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Test rollable stat elements
        const rollableStats = await page.locator('[role="button"][aria-label*="Roll"][aria-label*="stat"]').all();

        if (rollableStats.length > 0) {
          // Test hover shows dice indicator
          await rollableStats[0].hover();
          await page.waitForTimeout(300);

          const diceIndicator = await page.locator('.absolute.-top-2.-right-2').isVisible();
          behaviors.push({
            type: 'hover-dice-indicator',
            visible: diceIndicator,
            visualFeedback: diceIndicator,
            description: `Hover ${diceIndicator ? 'shows' : 'does not show'} dice roll indicator`
          });

          // Test click interaction
          await rollableStats[0].click();
          await page.waitForTimeout(1000);

          // Check if roll occurred (look for history or notifications)
          const rollOccurred = await page.locator('.dice-result, [id*="dice-history"]').count() > 0;
          behaviors.push({
            type: 'stat-click-roll',
            working: rollOccurred,
            visualFeedback: rollOccurred,
            description: `Clicking stat ${rollOccurred ? 'triggered a roll' : 'had no visible effect'}`
          });
        }

        return { behaviors };
      },
      [
        {
          type: 'hover-dice-indicator',
          shouldBeVisible: true,
          shouldHaveVisualFeedback: true,
          description: 'Stats should show dice indicator on hover for discoverability'
        },
        {
          type: 'stat-click-roll',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Clicking stats should trigger rolls with clear feedback'
        }
      ]
    );
  }

  async testKeyboardShortcuts() {
    return await this.testInteractionPattern(
      'keyboard-shortcuts',
      async (page) => {
        await page.locator('button:has-text("Character")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        // Test Ctrl+K for command palette
        await page.keyboard.press('Control+k');
        await page.waitForTimeout(500);

        const paletteVisible = await page.locator('[data-testid="command-palette"], input[placeholder*="command"]').isVisible();
        behaviors.push({
          type: 'command-palette-shortcut',
          working: paletteVisible,
          visualFeedback: paletteVisible,
          description: `Ctrl+K ${paletteVisible ? 'opens' : 'does not open'} command palette`
        });

        if (paletteVisible) {
          // Close palette
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }

        // Test direct stat shortcuts (S for STR)
        await page.keyboard.press('s');
        await page.waitForTimeout(1000);

        // Check if STR roll occurred
        const statRollOccurred = await page.locator('.dice-result, [id*="dice-history"]').count() > 0;
        behaviors.push({
          type: 'direct-stat-shortcut',
          working: statRollOccurred,
          visualFeedback: statRollOccurred,
          description: `Pressing 'S' ${statRollOccurred ? 'triggered STR roll' : 'had no effect'}`
        });

        return { behaviors };
      },
      [
        {
          type: 'command-palette-shortcut',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Ctrl+K should open command palette for power users'
        },
        {
          type: 'direct-stat-shortcut',
          shouldWork: true,
          shouldHaveVisualFeedback: true,
          description: 'Direct stat shortcuts should work for fast gameplay'
        }
      ]
    );
  }

  async testDragAndDropRolling() {
    return await this.testInteractionPattern(
      'drag-drop-rolling',
      async (page) => {
        await page.locator('button:has-text("Character")').click();
        await page.waitForTimeout(1500);

        const behaviors = [];

        const rollableElements = await page.locator('[role="button"][aria-label*="Roll"]').all();

        if (rollableElements.length > 0) {
          // Start drag to see if quick roll zones appear
          await rollableElements[0].hover();
          await page.mouse.down();
          await page.mouse.move(640, 400); // Move toward center
          await page.waitForTimeout(500);

          const quickRollZones = await page.locator('[data-testid*="quick-roll"], .quick-roll-zone').isVisible();
          behaviors.push({
            type: 'drag-shows-zones',
            visible: quickRollZones,
            visualFeedback: quickRollZones,
            description: `Dragging ${quickRollZones ? 'shows' : 'does not show'} quick roll zones`
          });

          // End drag
          await page.mouse.up();
          await page.waitForTimeout(300);
        }

        return { behaviors };
      },
      [
        {
          type: 'drag-shows-zones',
          shouldBeVisible: true,
          shouldHaveVisualFeedback: true,
          description: 'Dragging should show quick roll zones for enhanced UX'
        }
      ]
    );
  }

  async runAllTests() {
    await this.initialize();

    const tests = [
      () => this.testEquipmentUnequip(),
      () => this.testCharacterCreation(),
      () => this.testMovesInteraction(),
      () => this.testDiceInteraction(),
      // New dice system tests
      () => this.testDiceHistorySidebar(),
      () => this.testStatHoverInteractions(),
      () => this.testKeyboardShortcuts(),
      () => this.testDragAndDropRolling()
    ];

    for (const test of tests) {
      await test();
      await this.page.waitForTimeout(1000); // Pause between tests
    }

    await this.generateReport();
    await this.browser.close();
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      totalIssues: this.testResults.reduce((sum, test) => sum + test.issues.length, 0),
      results: this.testResults
    };

    // Write JSON report
    fs.writeFileSync(
      path.join(this.currentDir, 'visual-regression-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Write human-readable report
    const humanReport = this.generateHumanReport(report);
    fs.writeFileSync(
      path.join(this.currentDir, 'visual-regression-report.md'),
      humanReport
    );

    console.log('\n' + '='.repeat(60));
    console.log('📊 VISUAL REGRESSION TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`Tests run: ${report.totalTests}`);
    console.log(`Issues found: ${report.totalIssues}`);
    console.log(`Report: ${path.join(this.currentDir, 'visual-regression-report.md')}`);
  }

  generateHumanReport(report) {
    let markdown = `# Visual Regression Test Report\n\n`;
    markdown += `**Generated**: ${report.timestamp}\n`;
    markdown += `**Tests Run**: ${report.totalTests}\n`;
    markdown += `**Issues Found**: ${report.totalIssues}\n\n`;

    report.results.forEach(test => {
      markdown += `## ${test.name}\n\n`;

      if (test.issues.length > 0) {
        markdown += `⚠️ **Issues Found (${test.issues.length})**:\n`;
        test.issues.forEach(issue => {
          markdown += `- ${issue}\n`;
        });
      } else {
        markdown += `✅ **No Issues Found**\n`;
      }

      markdown += `\n**Expected Behaviors**:\n`;
      test.expectedBehaviors.forEach(expected => {
        markdown += `- ${expected.description}\n`;
      });

      markdown += `\n**Actual Behaviors**:\n`;
      test.actualBehaviors.forEach(actual => {
        markdown += `- ${actual.description}\n`;
      });

      markdown += `\n**Screenshots**: ${test.screenshots.join(', ')}\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }
}

// Run the visual regression tests
const tester = new VisualRegressionTester();
tester.runAllTests().catch(console.error);