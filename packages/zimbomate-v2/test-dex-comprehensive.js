import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  const errors = [];
  const logs = [];

  // Capture ALL console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    logs.push({ type, text });

    console.log(`[${type.toUpperCase()}] ${text}`);

    if (type === 'error') {
      errors.push(text);
    }
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('🎯 Looking for DEX stat button...');

    // Take screenshot before click
    await page.screenshot({ path: 'before-dex-click.png', fullPage: true });

    // Find and click DEX
    const dexButton = await page.locator('div:has-text("DEX") button').first();
    const count = await dexButton.count();
    console.log(`Found ${count} DEX buttons`);

    if (count > 0) {
      console.log('🖱️ Clicking DEX button...');
      await dexButton.click();

      // Wait for any async operations
      await page.waitForTimeout(5000);

      console.log('📸 Taking screenshot after click...');
      await page.screenshot({ path: 'after-dex-click.png', fullPage: true });

      // Check dice store again
      const finalDiceStore = await page.evaluate(() => {
        const diceStoreKey = 'zimbomate-dice-store';
        const diceData = localStorage.getItem(diceStoreKey);
        return diceData ? JSON.parse(diceData) : null;
      });

      console.log('🎲 Final Dice Store State:', JSON.stringify(finalDiceStore, null, 2));

      // Go to dice tab to see if any rolls show up
      console.log('📋 Checking dice tab...');
      const diceTab = await page.locator('button:has-text("Dice")');
      await diceTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'dice-tab-final.png', fullPage: true });
    }

    console.log('\n📊 SUMMARY:');
    console.log(`Errors captured: ${errors.length}`);
    console.log(`Logs captured: ${logs.length}`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach((error, i) => console.log(`${i + 1}. ${error}`));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();