import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(3000);

  console.log('🎯 Testing real-time XP display...');

  // Take screenshot before rolls
  await page.screenshot({ path: 'before-xp-display-test.png', fullPage: true });

  // Perform multiple dice rolls to accumulate XP
  const rollable = page.locator('[aria-label="Roll DEX stat"]');

  for (let i = 1; i <= 4; i++) {
    console.log(`🎲 Roll ${i}...`);
    await rollable.click();
    await page.waitForTimeout(3000);

    // Take screenshot after each roll
    await page.screenshot({ path: `xp-after-roll-${i}.png`, fullPage: true });
  }

  // Check final XP state
  const finalXP = await page.evaluate(() => {
    const xpData = localStorage.getItem('zimbomate-xp-store');
    return xpData ? JSON.parse(xpData) : null;
  });

  console.log('📊 Final XP Store:', finalXP?.state?.characterXP);

  await browser.close();
})();