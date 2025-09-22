import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🔍 DEBUGGING LEVEL UP DETECTION');
  console.log('================================');

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow');

    // Step 1: Check current XP data
    console.log('Step 1: Checking XP and level data...');

    const storeData = await page.evaluate(() => {
      const xpStore = localStorage.getItem('zimbomate-xp-store');
      const characterStore = localStorage.getItem('zimbomate-character-storage');

      return {
        xpStoreRaw: xpStore,
        xpStore: xpStore ? JSON.parse(xpStore) : null,
        characterStore: characterStore ? JSON.parse(characterStore) : null
      };
    });

    console.log('XP Store:', JSON.stringify(storeData.xpStore, null, 2));

    // Step 2: Get visible XP information
    const visibleXP = await page.locator('text=Experience').locator('..').textContent();
    console.log('Visible XP text:', visibleXP);

    // Step 3: Check for level up button in DOM
    const levelUpButtonExists = await page.locator('button:has-text("Level Up")').count();
    console.log('Level Up buttons found:', levelUpButtonExists);

    // Step 4: Check if canLevelUp function exists and works
    const canLevelUpResult = await page.evaluate(() => {
      // Try to access the XP store directly
      try {
        const xpStoreState = localStorage.getItem('zimbomate-xp-store');
        if (xpStoreState) {
          const parsed = JSON.parse(xpStoreState);
          const characterId = Object.keys(parsed.state?.characterXP || {})[0];
          if (characterId) {
            const xp = parsed.state.characterXP[characterId] || 0;
            const level = parsed.state.characterLevel[characterId] || 1;
            const threshold = level + 7; // DW leveling rule

            console.log(`Character: ${characterId}`);
            console.log(`XP: ${xp}, Level: ${level}, Threshold: ${threshold}`);
            console.log(`Can Level Up: ${xp >= threshold}`);

            return {
              characterId,
              xp,
              level,
              threshold,
              canLevelUp: xp >= threshold
            };
          }
        }
        return null;
      } catch (error) {
        console.error('Error checking level up:', error);
        return { error: error.message };
      }
    });

    console.log('Level up calculation:', canLevelUpResult);

    // Step 5: Take screenshot showing current state
    await page.screenshot({
      path: 'debug-level-up-current-state.png',
      fullPage: true
    });

    // Step 6: Try to manually trigger level up by calling the XP store method
    console.log('Step 2: Attempting to manually trigger level up...');

    const manualTrigger = await page.evaluate(() => {
      try {
        // Look for XP store in window
        if (window.useXPStore) {
          const store = window.useXPStore.getState();
          console.log('XP Store methods available:', Object.keys(store));

          // Try to find character and check canLevelUp
          const characterId = Object.keys(store.characterXP)[0];
          if (characterId && store.canLevelUp) {
            const canLevel = store.canLevelUp(characterId);
            console.log(`Can level up ${characterId}: ${canLevel}`);
            return { canLevel, characterId, methods: Object.keys(store) };
          }
        }
        return { error: 'XP store not accessible from window' };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('Manual trigger result:', manualTrigger);

    // Step 7: Check if the level up button should be visible based on React state
    const reactStateCheck = await page.evaluate(() => {
      // Look for React fiber or state information
      const elements = document.querySelectorAll('[data-testid], [class*="level"], [class*="xp"]');
      const info = [];

      elements.forEach(el => {
        if (el.textContent?.includes('Level') || el.textContent?.includes('XP') || el.textContent?.includes('Experience')) {
          info.push({
            tag: el.tagName,
            class: el.className,
            text: el.textContent,
            id: el.id
          });
        }
      });

      return info;
    });

    console.log('React elements related to level/XP:', reactStateCheck);

  } catch (error) {
    console.error('Debug failed:', error);
    await page.screenshot({
      path: 'debug-level-up-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();