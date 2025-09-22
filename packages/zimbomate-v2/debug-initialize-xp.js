import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🔧 INITIALIZING XP STORE FOR LEVEL UP');
  console.log('====================================');

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow');

    // Step 1: Check all localStorage data
    console.log('Step 1: Checking all localStorage data...');

    const allStorage = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch (e) {
          data[key] = localStorage.getItem(key); // Raw string if not JSON
        }
      }
      return data;
    });

    console.log('All localStorage data:');
    Object.keys(allStorage).forEach(key => {
      console.log(`  ${key}:`, JSON.stringify(allStorage[key], null, 2).substring(0, 200) + '...');
    });

    // Step 2: Get character ID from character store
    const characterId = allStorage['zimbomate-character-storage']?.state?.characters?.[0]?.id;
    console.log('Found character ID:', characterId);

    if (characterId) {
      // Step 3: Initialize XP store with proper data
      console.log('Step 3: Initializing XP store...');

      await page.evaluate((charId) => {
        // Create proper XP store data
        const xpStoreData = {
          state: {
            characterXP: {
              [charId]: 12  // Character has 12 XP
            },
            characterLevel: {
              [charId]: 3   // Character is level 3
            },
            lastXPGainTimestamp: {},
            xpGainHistory: {}
          },
          version: 0
        };

        // Save to localStorage
        localStorage.setItem('zimbomate-xp-store', JSON.stringify(xpStoreData));
        console.log('XP store initialized with:', xpStoreData);
      }, characterId);

      // Step 4: Reload page to pick up new XP data
      console.log('Step 4: Reloading to apply XP store...');
      await page.reload();
      await page.waitForTimeout(3000);
      await page.waitForSelector('text=Lyra Swiftarrow');

      // Step 5: Check if level up button appears now
      const levelUpButtonExists = await page.locator('button:has-text("Level Up")').count();
      console.log('Level Up buttons after XP init:', levelUpButtonExists);

      await page.screenshot({
        path: 'debug-after-xp-init.png',
        fullPage: true
      });

      // Step 6: If level up button exists, click it
      if (levelUpButtonExists > 0) {
        console.log('Step 6: Level up button found! Clicking...');

        const levelUpButton = await page.locator('button:has-text("Level Up")').first();
        await levelUpButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'debug-level-up-modal-opened.png',
          fullPage: true
        });

        // Check for DW level up options
        const options = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          const levelUpOptions = [];
          buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes('stat') || text.includes('move') || text.includes('class') ||
                text.includes('increase') || text.includes('learn') || text.includes('abilities')) {
              levelUpOptions.push(button.textContent);
            }
          });
          return levelUpOptions;
        });

        console.log('Level up options found:', options);

        if (options.length > 0) {
          // Click the first option (usually stat increase)
          const firstOption = await page.locator('button').filter({ hasText: options[0] });
          await firstOption.click();
          await page.waitForTimeout(1000);

          await page.screenshot({
            path: 'debug-level-up-option-selected.png',
            fullPage: true
          });
        }
      }

      // Step 7: Final state
      await page.screenshot({
        path: 'debug-final-level-up-state.png',
        fullPage: true
      });
    }

  } catch (error) {
    console.error('Debug failed:', error);
    await page.screenshot({
      path: 'debug-initialize-xp-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();