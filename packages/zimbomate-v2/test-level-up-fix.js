import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🔧 TESTING LEVEL UP FIX');
  console.log('=======================');

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow');

    // Check if the XP store initialization worked
    const storeState = await page.evaluate(() => {
      const xpStore = localStorage.getItem('zimbomate-xp-store');
      const characterStore = localStorage.getItem('zimbomate-character-storage');

      return {
        xpStore: xpStore ? JSON.parse(xpStore) : null,
        characterStore: characterStore ? JSON.parse(characterStore) : null
      };
    });

    console.log('XP Store State:', JSON.stringify(storeState.xpStore?.state, null, 2));

    const characterId = storeState.characterStore?.state?.characters?.[0]?.id;
    if (characterId) {
      const xpData = storeState.xpStore?.state;
      console.log(`Character ID: ${characterId}`);
      console.log(`XP in store: ${xpData?.characterXP?.[characterId]}`);
      console.log(`Level in store: ${xpData?.characterLevel?.[characterId]}`);

      // Test canLevelUp function
      const canLevelUpResult = await page.evaluate((charId) => {
        // Simulate the canLevelUp logic
        const xpStore = JSON.parse(localStorage.getItem('zimbomate-xp-store') || '{}');
        const currentXP = xpStore.state?.characterXP?.[charId] || 0;
        const currentLevel = xpStore.state?.characterLevel?.[charId] || 1;
        const xpNeededForNextLevel = 7 + currentLevel;
        const canLevel = currentXP >= xpNeededForNextLevel;

        return {
          currentXP,
          currentLevel,
          xpNeededForNextLevel,
          canLevel,
          calculation: `${currentXP} >= ${xpNeededForNextLevel} = ${canLevel}`
        };
      }, characterId);

      console.log('canLevelUp result:', canLevelUpResult);

      // Check if Level Up button is visible
      const levelUpButton = await page.locator('button:has-text("Level Up")');
      const isLevelUpVisible = await levelUpButton.isVisible().catch(() => false);

      console.log(`Level Up button visible: ${isLevelUpVisible}`);

      if (isLevelUpVisible) {
        console.log('✅ SUCCESS: Level up integration working!');
      } else {
        console.log('⚠️  Level up button not visible - may need additional debugging');
      }

      // Take screenshot
      await page.screenshot({
        path: 'level-up-fix-test.png',
        fullPage: true
      });

    } else {
      console.log('❌ Could not find character ID');
    }

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({
      path: 'level-up-fix-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();