import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  console.log('🔍 DEBUGGING canLevelUp FUNCTION');
  console.log('=================================');

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow');

    // Test the canLevelUp function directly by injecting JavaScript
    const debugResult = await page.evaluate(() => {
      // First check what XP data we have
      const xpStoreData = localStorage.getItem('zimbomate-xp-store');
      const characterStoreData = localStorage.getItem('zimbomate-character-storage');

      let xpStore = null;
      let characterId = null;

      if (xpStoreData) {
        xpStore = JSON.parse(xpStoreData);
      }

      if (characterStoreData) {
        const charStore = JSON.parse(characterStoreData);
        characterId = charStore.state?.characters?.[0]?.id;
      }

      // Manual calculation of canLevelUp
      let manualCanLevelUp = false;
      if (xpStore && characterId) {
        const currentXP = xpStore.state?.characterXP?.[characterId] || 0;
        const currentLevel = xpStore.state?.characterLevel?.[characterId] || 1;
        const xpNeededForNextLevel = 7 + currentLevel;
        manualCanLevelUp = currentXP >= xpNeededForNextLevel;

        return {
          characterId,
          currentXP,
          currentLevel,
          xpNeededForNextLevel,
          manualCanLevelUp,
          calculation: `${currentXP} >= ${xpNeededForNextLevel} = ${manualCanLevelUp}`,
          xpStoreState: xpStore.state
        };
      }

      return {
        error: 'Missing data',
        xpStoreExists: !!xpStore,
        characterIdFound: !!characterId,
        xpStoreData: xpStore?.state
      };
    });

    console.log('Debug result:', JSON.stringify(debugResult, null, 2));

    // Take screenshot showing current state
    await page.screenshot({
      path: 'debug-can-level-up-state.png',
      fullPage: true
    });

    // If the manual calculation shows we should be able to level up,
    // let's try to force the issue by modifying the component directly
    if (debugResult.manualCanLevelUp) {
      console.log('✅ Manual calculation shows character CAN level up!');
      console.log('🔧 Attempting to force level up button to appear...');

      // Try to manually trigger the level up UI
      await page.evaluate(() => {
        // Look for the Experience progress container and add a level up button
        const experienceSection = document.querySelector('text=Experience')?.parentElement?.parentElement;

        if (experienceSection) {
          // Create a level up button manually
          const levelUpButton = document.createElement('button');
          levelUpButton.textContent = '⭐ Level Up! (DEBUG)';
          levelUpButton.className = 'absolute -top-2 -right-2 animate-pulse shadow-lg bg-purple-600 text-white px-2 py-1 rounded text-sm z-10';
          levelUpButton.style.position = 'absolute';
          levelUpButton.style.top = '-8px';
          levelUpButton.style.right = '-8px';
          levelUpButton.style.zIndex = '1000';

          levelUpButton.onclick = () => {
            alert('Level Up clicked! Character should advance from Level 3 to Level 4 per Dungeon World rules.');
          };

          experienceSection.style.position = 'relative';
          experienceSection.appendChild(levelUpButton);

          console.log('✅ DEBUG: Level Up button manually added');
          return true;
        }
        return false;
      });

      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'debug-with-manual-level-up-button.png',
        fullPage: true
      });

      // Try clicking the manual button
      const manualButton = await page.locator('text=Level Up! (DEBUG)');
      if (await manualButton.isVisible()) {
        console.log('🖱️ Clicking manual level up button...');
        await manualButton.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({
      path: 'debug-final-can-level-up.png',
      fullPage: true
    });

  } catch (error) {
    console.error('Debug failed:', error);
    await page.screenshot({
      path: 'debug-can-level-up-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();