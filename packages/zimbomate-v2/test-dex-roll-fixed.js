import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ CONSOLE ERROR:', msg.text());
    }
  });

  try {
    // Navigate to app
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: 'initial-state.png', fullPage: true });
    console.log('📸 Initial state screenshot taken');

    // Look for DEX stat on main character page
    console.log('🔍 Looking for DEX stat button on Character page...');

    // Look for clickable DEX elements with various selectors
    const dexSelectors = [
      'button:has-text("DEX")',
      '[data-stat="DEX"]',
      '[class*="dex"]',
      '.stat-button:has-text("DEX")',
      'div:has-text("DEX") button',
      '[role="button"]:has-text("DEX")'
    ];

    let dexFound = false;
    for (const selector of dexSelectors) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ Found ${count} DEX elements with selector: ${selector}`);
        try {
          console.log('🎯 Clicking DEX button...');
          await elements.first().click();
          await page.waitForTimeout(4000); // Wait for roll animation
          dexFound = true;
          break;
        } catch (error) {
          console.log(`⚠️ Failed to click DEX with selector ${selector}:`, error.message);
        }
      }
    }

    if (!dexFound) {
      console.log('⚠️ No clickable DEX elements found, trying keyboard shortcut...');
      await page.keyboard.press('d');
      await page.waitForTimeout(3000);
    }

    // Take screenshot after attempting roll
    await page.screenshot({ path: 'after-dex-attempt.png', fullPage: true });
    console.log('📸 After DEX roll attempt screenshot taken');

    // Check if we're on dice tab now
    const diceTab = await page.locator('button:has-text("Dice")');
    if (await diceTab.count() > 0) {
      await diceTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'dice-tab-after-roll.png', fullPage: true });
      console.log('📸 Dice tab after roll screenshot taken');
    }

    console.log('✅ DEX roll test completed');

  } catch (error) {
    console.error('❌ Error during DEX roll test:', error);
  } finally {
    await browser.close();
  }
})();