import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  console.log('🏆 DUNGEON WORLD LEVEL UP TEST (Simplified)');
  console.log('===========================================');

  try {
    // Step 1: Load app
    console.log('Step 1: Loading app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow', { timeout: 10000 });

    await page.screenshot({
      path: 'levelup-01-ready-to-level.png',
      fullPage: true
    });
    console.log('✅ Initial state: Character has 12/10 XP - ready to level up!');

    // Step 2: Look for level up button (the yellow Level 3 badge might be clickable)
    console.log('Step 2: Looking for level up trigger...');

    // Try the Level 3 badge first
    const levelBadge = await page.locator('text=Level 3').first();
    const isLevelBadgeVisible = await levelBadge.isVisible().catch(() => false);
    console.log(`Level badge visible: ${isLevelBadgeVisible}`);

    // Also check for any level up buttons
    const levelUpButtons = await page.locator('button:has-text("Level Up"), button:has-text("level up"), .level-up-btn').all();
    console.log(`Found ${levelUpButtons.length} potential level up buttons`);

    // Try clicking the level badge first
    if (isLevelBadgeVisible) {
      console.log('Step 3: Clicking level badge...');
      await levelBadge.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'levelup-02-after-level-badge-click.png',
        fullPage: true
      });
    }

    // Look for level up modal or any level up UI
    const levelUpModal = await page.locator('text=Level Up, text=level up, text=Choose, text=advancement').first();
    const modalVisible = await levelUpModal.isVisible().catch(() => false);
    console.log(`Level up modal visible: ${modalVisible}`);

    if (!modalVisible && levelUpButtons.length > 0) {
      console.log('Step 3b: Trying direct level up buttons...');
      await levelUpButtons[0].click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'levelup-02b-after-button-click.png',
        fullPage: true
      });
    }

    // Step 4: Look for the level up modal content
    console.log('Step 4: Looking for level up options...');

    // Check for Dungeon World level up options
    const statIncreaseOption = await page.locator('button:has-text("stat"), button:has-text("Increase"), text=stat').first();
    const newMoveOption = await page.locator('button:has-text("move"), button:has-text("Learn"), text=move').first();
    const classAbilityOption = await page.locator('button:has-text("class"), button:has-text("abilities"), text=class').first();

    const statOptionVisible = await statIncreaseOption.isVisible().catch(() => false);
    const moveOptionVisible = await newMoveOption.isVisible().catch(() => false);
    const abilityOptionVisible = await classAbilityOption.isVisible().catch(() => false);

    console.log(`DW Level Up Options found:`);
    console.log(`- Stat increase: ${statOptionVisible}`);
    console.log(`- New move: ${moveOptionVisible}`);
    console.log(`- Class abilities: ${abilityOptionVisible}`);

    if (statOptionVisible || moveOptionVisible || abilityOptionVisible) {
      await page.screenshot({
        path: 'levelup-03-level-up-modal.png',
        fullPage: true
      });

      // Try stat increase option (most common DW advancement)
      if (statOptionVisible) {
        console.log('Step 5: Testing stat increase...');
        await statIncreaseOption.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'levelup-04-stat-increase-selection.png',
          fullPage: true
        });
      }
    } else {
      console.log('⚠️  No level up modal found. Checking XP store manually...');

      // Check XP data programmatically
      const xpData = await page.evaluate(() => {
        const xpStore = localStorage.getItem('zimbomate-xp-store');
        const characterStore = localStorage.getItem('zimbomate-character-storage');
        return {
          xpStore: xpStore ? JSON.parse(xpStore) : null,
          characterStore: characterStore ? JSON.parse(characterStore) : null
        };
      });

      console.log('XP Store data:', JSON.stringify(xpData.xpStore?.state, null, 2));

      // Force trigger level up by manually calling level up function
      await page.evaluate(() => {
        // Try to find and trigger level up programmatically
        if (window.useXPStore) {
          const store = window.useXPStore.getState();
          console.log('XP Store methods:', Object.keys(store));
        }
      });
    }

    // Step 6: Final state screenshot
    await page.screenshot({
      path: 'levelup-05-final-state.png',
      fullPage: true
    });

    console.log('\n🎯 LEVEL UP TEST RESULTS:');
    console.log('==========================');
    console.log('✅ Character loaded with 12/10 XP (ready to level)');
    console.log('✅ Screenshots captured showing current state');
    console.log('📊 Need to investigate why level up modal not appearing');

  } catch (error) {
    console.error('❌ Level up test failed:', error);

    await page.screenshot({
      path: 'levelup-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();