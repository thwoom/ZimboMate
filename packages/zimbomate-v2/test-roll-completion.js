import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  // Monitor console for dice roll specific messages
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('🎯 Testing DEX roll with extended wait time...');

    // Click DEX
    const dexButton = await page.locator('div:has-text("DEX") button').first();
    await dexButton.click();

    // Wait longer for the roll animation (1.5s + buffer)
    console.log('⏳ Waiting 6 seconds for roll completion...');
    await page.waitForTimeout(6000);

    // Check dice store immediately after waiting
    const diceStore = await page.evaluate(() => {
      const diceStoreKey = 'zimbomate-dice-store';
      return localStorage.getItem(diceStoreKey);
    });

    console.log('🎲 Dice Store After 6s Wait:', diceStore);

    // Check if there are any DOM changes that indicate a roll happened
    const rollIndicators = await page.locator('[class*="roll"], [class*="result"], [class*="notification"]').count();
    console.log(`🎭 UI Roll Indicators Found: ${rollIndicators}`);

    // Take final screenshot
    await page.screenshot({ path: 'roll-completion-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();