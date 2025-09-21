import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Inject debug code to check store states
    const storeDebug = await page.evaluate(() => {
      // Access Zustand stores from window if available
      const stores = {};

      // Try to find character store data
      const characterStoreKey = 'zimbomate-character-storage';
      const characterData = localStorage.getItem(characterStoreKey);
      stores.characterStore = characterData ? JSON.parse(characterData) : null;

      // Try to find dice store data
      const diceStoreKey = 'zimbomate-dice-store';
      const diceData = localStorage.getItem(diceStoreKey);
      stores.diceStore = diceData ? JSON.parse(diceData) : null;

      return stores;
    });

    console.log('📊 Store Debug Info:');
    console.log('Character Store:', JSON.stringify(storeDebug.characterStore, null, 2));
    console.log('Dice Store:', JSON.stringify(storeDebug.diceStore, null, 2));

    // Click DEX and immediately check what happens
    console.log('🎯 Clicking DEX and monitoring...');

    const dexButton = await page.locator('div:has-text("DEX") button').first();
    await dexButton.click();

    // Wait and check again
    await page.waitForTimeout(2000);

    const afterRollDebug = await page.evaluate(() => {
      const diceStoreKey = 'zimbomate-dice-store';
      const diceData = localStorage.getItem(diceStoreKey);
      return diceData ? JSON.parse(diceData) : null;
    });

    console.log('🎲 After DEX Roll - Dice Store:', JSON.stringify(afterRollDebug, null, 2));

    await page.screenshot({ path: 'debug-after-dex-roll.png', fullPage: true });
    console.log('📸 Debug screenshot taken');

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
})();