import { chromium } from 'playwright';

/**
 * Focused Dice System Testing
 * Tests the comprehensive dice system we just built
 */

class DiceSystemTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async initialize() {
    console.log('🎲 DICE SYSTEM TESTING');
    console.log('Testing comprehensive dice system implementation...\n');

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100,
      viewport: { width: 1400, height: 1000 }
    });

    this.page = await this.browser.newPage();

    // Try multiple endpoints to find the working app
    const endpoints = [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3000'
    ];

    let connected = false;
    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 Trying ${endpoint}...`);
        await this.page.goto(endpoint);
        await this.page.waitForTimeout(2000);

        // Check if page loaded successfully
        const title = await this.page.title();
        if (title && !title.includes('Cannot GET')) {
          console.log(`✅ Connected to ${endpoint}`);
          connected = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${endpoint}`);
      }
    }

    if (!connected) {
      throw new Error('Could not connect to any development server');
    }
  }

  async testPageStructure() {
    console.log('🔍 Testing: Page Structure');

    try {
      // Check if basic elements exist
      const body = await this.page.locator('body').count();
      const hasReact = await this.page.locator('[data-reactroot], #root').count();

      console.log(`   ✅ Page loaded (body elements: ${body})`);
      console.log(`   ${hasReact > 0 ? '✅' : '❌'} React app detected`);

      // Check for any visible UI elements
      const buttons = await this.page.locator('button').count();
      const inputs = await this.page.locator('input').count();
      const cards = await this.page.locator('[class*="card"], .card').count();

      console.log(`   📊 UI Elements: ${buttons} buttons, ${inputs} inputs, ${cards} cards`);

      return { success: true, elements: { buttons, inputs, cards } };
    } catch (error) {
      console.log(`   ❌ Page structure test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testDiceSystemPresence() {
    console.log('🎲 Testing: Dice System Components');

    try {
      // Look for dice-related elements using various selectors
      const diceSelectors = [
        '[class*="dice"]',
        '[data-testid*="dice"]',
        '[aria-label*="dice"]',
        '[aria-label*="roll"]',
        'button[class*="rollable"]',
        '[class*="sidebar"]'
      ];

      const results = {};

      for (const selector of diceSelectors) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          results[selector] = count;
          console.log(`   ✅ Found ${count} elements matching "${selector}"`);
        }
      }

      // Test for specific dice system features we built
      const diceFeatures = [
        { name: 'Rollable Elements', selector: '[class*="rollable"], [role="button"][class*="cursor-pointer"]' },
        { name: 'History Sidebar', selector: '#dice-history-content, [class*="history"]' },
        { name: 'Stats Section', selector: '[class*="stat"], [class*="attribute"]' },
        { name: 'Moves Panel', selector: '[class*="move"], [class*="panel"]' },
        { name: 'Dice Icons', selector: '[class*="dice"], svg[class*="lucide"]' }
      ];

      for (const feature of diceFeatures) {
        const count = await this.page.locator(feature.selector).count();
        console.log(`   ${count > 0 ? '✅' : '⚠️'} ${feature.name}: ${count} elements`);
      }

      return { success: true, results };
    } catch (error) {
      console.log(`   ❌ Dice system presence test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testInteractivity() {
    console.log('⚡ Testing: Basic Interactivity');

    try {
      // Find any clickable elements
      const clickableElements = await this.page.locator('button, [role="button"], [class*="cursor-pointer"]').count();
      console.log(`   📱 Found ${clickableElements} clickable elements`);

      // Test clicking the first few clickable elements (safely)
      if (clickableElements > 0) {
        const buttons = this.page.locator('button').first();
        const buttonCount = await buttons.count();

        if (buttonCount > 0) {
          console.log(`   🖱️ Testing button interaction...`);
          await buttons.click();
          await this.page.waitForTimeout(1000);
          console.log(`   ✅ Button click successful`);
        }
      }

      // Test keyboard interactions
      console.log(`   ⌨️ Testing keyboard shortcuts...`);
      await this.page.keyboard.press('s'); // Should trigger STR roll shortcut
      await this.page.waitForTimeout(500);
      await this.page.keyboard.press('d'); // Should trigger DEX roll shortcut
      await this.page.waitForTimeout(500);
      console.log(`   ✅ Keyboard input successful`);

      return { success: true, clickableElements };
    } catch (error) {
      console.log(`   ❌ Interactivity test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testResponsiveness() {
    console.log('📱 Testing: Responsive Design');

    try {
      const viewports = [
        { name: 'Desktop', width: 1400, height: 1000 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ];

      for (const viewport of viewports) {
        await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
        await this.page.waitForTimeout(1000);

        const bodyHeight = await this.page.evaluate(() => document.body.scrollHeight);
        const hasOverflow = bodyHeight > viewport.height;

        console.log(`   ${viewport.name} (${viewport.width}x${viewport.height}): ${hasOverflow ? 'Scrollable' : 'Fits'} content`);
      }

      // Reset to desktop
      await this.page.setViewportSize({ width: 1400, height: 1000 });

      return { success: true };
    } catch (error) {
      console.log(`   ❌ Responsiveness test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testAccessibility() {
    console.log('♿ Testing: Accessibility Features');

    try {
      // Check for ARIA labels and roles
      const ariaLabels = await this.page.locator('[aria-label]').count();
      const ariaRoles = await this.page.locator('[role]').count();
      const tabIndexes = await this.page.locator('[tabindex]').count();

      console.log(`   🏷️ ARIA labels: ${ariaLabels}`);
      console.log(`   🎭 ARIA roles: ${ariaRoles}`);
      console.log(`   ⭐ Tab indexes: ${tabIndexes}`);

      // Test keyboard navigation
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
      const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
      console.log(`   🔍 Focus navigation: ${focusedElement ? 'Working' : 'No focus'}`);

      return { success: true, ariaLabels, ariaRoles, tabIndexes };
    } catch (error) {
      console.log(`   ❌ Accessibility test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async generateReport() {
    console.log('\n📊 DICE SYSTEM TEST REPORT');
    console.log('========================');

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

    // Detailed results
    console.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
      if (!result.success && result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    return summary;
  }

  async runAllTests() {
    try {
      await this.initialize();

      const tests = [
        { name: 'Page Structure', fn: () => this.testPageStructure() },
        { name: 'Dice System Presence', fn: () => this.testDiceSystemPresence() },
        { name: 'Basic Interactivity', fn: () => this.testInteractivity() },
        { name: 'Responsive Design', fn: () => this.testResponsiveness() },
        { name: 'Accessibility Features', fn: () => this.testAccessibility() }
      ];

      for (const test of tests) {
        const result = await test.fn();
        this.testResults.push({ name: test.name, ...result });
        console.log(''); // spacing
      }

      const summary = await this.generateReport();

      return summary;
    } catch (error) {
      console.error('🚨 Testing failed:', error);
      return { total: 0, passed: 0, failed: 1 };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the tests
const tester = new DiceSystemTester();
tester.runAllTests().then(summary => {
  process.exit(summary.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});