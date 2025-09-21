import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  try {
    // Navigate to app
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);

    // Go to Dice tab
    const diceTab = await page.locator('button:has-text("Dice")');
    await diceTab.click();
    await page.waitForTimeout(2000);

    // Screenshot before roll
    await page.screenshot({ path: 'before-dex-roll.png', fullPage: true });
    console.log('📸 Screenshot taken: before-dex-roll.png');

    // Try DEX roll via keyboard shortcut
    console.log('⌨️ Pressing D key for DEX roll...');
    await page.keyboard.press('d');
    await page.waitForTimeout(4000); // Wait for roll animation

    // Screenshot after roll
    await page.screenshot({ path: 'after-dex-roll.png', fullPage: true });
    console.log('📸 Screenshot taken: after-dex-roll.png');

    // Also try clicking Stats tab and looking for DEX button
    const statsTab = await page.locator('button').filter({ hasText: /^Stats$/ }).first();
    if (await statsTab.count() > 0) {
      await statsTab.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'stats-tab-view.png', fullPage: true });
      console.log('📸 Screenshot taken: stats-tab-view.png');

      // Look for DEX stat button
      const dexButton = await page.locator('button:has-text("DEX"), [data-stat="DEX"], [class*="dex"]').first();
      if (await dexButton.count() > 0) {
        console.log('🎯 Found DEX button, clicking...');
        await dexButton.click();
        await page.waitForTimeout(4000);

        await page.screenshot({ path: 'dex-button-roll.png', fullPage: true });
        console.log('📸 Screenshot taken: dex-button-roll.png');
      } else {
        console.log('⚠️ No DEX button found in Stats tab');
      }
    }

    console.log('✅ DEX roll test completed');

  } catch (error) {
    console.error('❌ Error during DEX roll test:', error);
  } finally {
    await browser.close();
  }
})();