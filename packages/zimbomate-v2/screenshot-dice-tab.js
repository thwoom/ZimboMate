import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);

    // Look for the Dice tab and click it
    const diceTab = await page.locator('button:has-text("Dice")').first();
    if (await diceTab.count() > 0) {
      await diceTab.click();
      await page.waitForTimeout(3000); // Wait for any errors to appear
    }

    // Take screenshot
    await page.screenshot({ path: 'dice-tab-screenshot.png', fullPage: true });
    console.log('Screenshot saved as dice-tab-screenshot.png');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();