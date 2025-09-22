import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);

  console.log('🎯 Testing level-up system...');

  // Check initial state
  const initialXP = await page.evaluate(() => {
    const xpData = localStorage.getItem('zimbomate-xp-store');
    return xpData ? JSON.parse(xpData) : null;
  });
  console.log('📊 Initial XP Store:', initialXP?.state?.characterXP);

  // Perform multiple dice rolls to accumulate XP and trigger level up
  const rollable = page.locator('[aria-label="Roll DEX stat"]');
  let rollCount = 0;
  let foundLevelUpButton = false;

  // Keep rolling until we see the level up button or hit max attempts
  while (rollCount < 10 && !foundLevelUpButton) {
    console.log(`🎲 Roll ${rollCount + 1}...`);
    await rollable.click();
    await page.waitForTimeout(3000);

    // Check if level up button appeared
    foundLevelUpButton = await page.locator('button:has-text("Level Up!")').isVisible();
    if (foundLevelUpButton) {
      console.log('🎉 Level Up button appeared!');

      // Take screenshot showing the level up button
      await page.screenshot({ path: `levelup-button-visible.png`, fullPage: true });

      // Click the level up button
      await page.locator('button:has-text("Level Up!")').click();
      await page.waitForTimeout(1000);

      // Check if modal appeared
      const modalVisible = await page.locator('text=Choose your advancement:').isVisible();
      console.log(`📋 Level up modal visible: ${modalVisible}`);

      if (modalVisible) {
        // Take screenshot of the modal
        await page.screenshot({ path: `levelup-modal.png`, fullPage: true });

        // Test clicking one of the advancement options
        await page.locator('button:has-text("Increase a stat by 1")').click();
        await page.waitForTimeout(1000);

        console.log('✅ Level up modal closed successfully');
      }

      break;
    }

    rollCount++;
  }

  // Check final XP state
  const finalXP = await page.evaluate(() => {
    const xpData = localStorage.getItem('zimbomate-xp-store');
    return xpData ? JSON.parse(xpData) : null;
  });

  console.log('\n📊 FINAL RESULTS:');
  console.log(`Total rolls: ${rollCount}`);
  console.log(`Level up button found: ${foundLevelUpButton}`);
  console.log('Final XP Store:', finalXP?.state?.characterXP);
  console.log('Final levels:', finalXP?.state?.characterLevel);

  await browser.close();
})();