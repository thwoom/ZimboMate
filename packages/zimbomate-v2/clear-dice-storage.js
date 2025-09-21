import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🧹 Clearing dice store...');

  await page.goto('http://localhost:3001');

  // Clear dice store specifically
  await page.evaluate(() => {
    localStorage.removeItem('zimbomate-dice-store');
    console.log('✅ Dice store cleared');
  });

  await page.reload();
  await page.waitForTimeout(2000);

  console.log('✅ Dice store cleared and page reloaded');

  await page.screenshot({
    path: 'after-dice-storage-clear.png',
    fullPage: true
  });

  await browser.close();
})();