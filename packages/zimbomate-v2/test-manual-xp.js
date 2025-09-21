import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);

  console.log('🎯 Testing level-up with manual XP...');

  // Manually add XP via console to trigger level up
  await page.evaluate(() => {
    // Get the XP store and add enough XP to trigger level up
    const store = JSON.parse(localStorage.getItem('zimbomate-xp-store') || '{"state":{"characterXP":{},"characterLevel":{},"xpEvents":[],"autoAwardFailedRolls":true,"showXPNotifications":true,"xpPerLevel":7}}');

    // Add 10 XP to trigger level up (needs 7 for level 2)
    store.state.characterXP['eldara-moonwhisper'] = 10;
    store.state.characterLevel['eldara-moonwhisper'] = 1; // Keep at level 1 so canLevelUp() returns true

    localStorage.setItem('zimbomate-xp-store', JSON.stringify(store));
    console.log('Added manual XP:', store.state.characterXP);

    // Force page refresh to see the updated state
    window.location.reload();
  });

  // Wait for page reload
  await page.waitForTimeout(3000);

  console.log('📊 Page reloaded with manual XP...');

  // Check if level up button is visible
  const levelUpButtonVisible = await page.locator('button:has-text("Level Up!")').isVisible();
  console.log(`🎉 Level Up button visible: ${levelUpButtonVisible}`);

  if (levelUpButtonVisible) {
    // Take screenshot showing the level up button
    await page.screenshot({ path: `manual-levelup-button.png`, fullPage: true });

    // Click the level up button
    await page.locator('button:has-text("Level Up!")').click();
    await page.waitForTimeout(1000);

    // Check if modal appeared
    const modalVisible = await page.locator('text=Choose your advancement:').isVisible();
    console.log(`📋 Level up modal visible: ${modalVisible}`);

    if (modalVisible) {
      // Take screenshot of the modal
      await page.screenshot({ path: `manual-levelup-modal.png`, fullPage: true });
      console.log('✅ Level up modal working correctly!');

      // Close modal
      await page.locator('button:has-text("Close (Level up later)")').click();
      await page.waitForTimeout(1000);
    }
  } else {
    console.log('❌ Level up button not visible - checking XP state...');

    // Check XP state
    const xpState = await page.evaluate(() => {
      const xpData = localStorage.getItem('zimbomate-xp-store');
      return xpData ? JSON.parse(xpData) : null;
    });
    console.log('XP State:', xpState?.state?.characterXP);
    console.log('Level State:', xpState?.state?.characterLevel);
  }

  await browser.close();
})();