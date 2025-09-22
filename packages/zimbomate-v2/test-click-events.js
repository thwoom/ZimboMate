import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  let clickEventLogs = [];
  let rollEventLogs = [];

  // Capture specific console messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type().toUpperCase()}] ${text}`);

    // Track click-related events
    if (text.includes('🖱️') || text.includes('handleClick') || text.includes('executeRoll')) {
      clickEventLogs.push(text);
    }

    // Track roll-related events
    if (text.includes('🎲') || text.includes('rollStat') || text.includes('RollableElement')) {
      rollEventLogs.push(text);
    }
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('🎯 Testing click event propagation on DEX stat...');

    // Take screenshot before interaction
    await page.screenshot({ path: 'click-test-before.png', fullPage: true });

    // Find the DEX area and try clicking different parts
    const dexArea = page.locator('div:has-text("DEX")').first();

    // Target the RollableElement directly using its aria-label
    console.log('📍 Clicking on RollableElement with DEX stat aria-label...');
    const rollableElement = page.locator('[aria-label="Roll DEX stat"]');

    const count = await rollableElement.count();
    console.log(`Found ${count} RollableElement(s) with DEX aria-label`);

    if (count > 0) {
      await rollableElement.first().click();
      await page.waitForTimeout(3000); // Wait longer for roll animation

      console.log('📍 Second click attempt on same element...');
      await rollableElement.first().click();
      await page.waitForTimeout(3000);
    }

    // Take screenshot after interactions
    await page.screenshot({ path: 'click-test-after.png', fullPage: true });

    console.log(`\n📊 RESULTS:`);
    console.log(`Click event logs: ${clickEventLogs.length}`);
    clickEventLogs.forEach((log, i) => console.log(`  ${i+1}. ${log}`));

    console.log(`Roll event logs: ${rollEventLogs.length}`);
    rollEventLogs.forEach((log, i) => console.log(`  ${i+1}. ${log}`));

    if (clickEventLogs.length === 0) {
      console.log('❌ NO CLICK EVENTS DETECTED - RollableElement click handlers not firing!');
    }

    if (rollEventLogs.length === 0) {
      console.log('❌ NO ROLL EVENTS DETECTED - dice rolling system not activating!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();