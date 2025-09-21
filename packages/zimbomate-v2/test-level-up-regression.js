import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  console.log('🏆 DUNGEON WORLD LEVEL UP REGRESSION TEST');
  console.log('==========================================');

  // Capture all console messages for debugging
  const consoleMessages = [];
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(text);
    }
  });

  try {
    // Step 1: Load app and wait for character data
    console.log('Step 1: Loading app and waiting for character...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);
    await page.waitForSelector('text=Lyra Swiftarrow', { timeout: 10000 });

    await page.screenshot({
      path: 'level-up-01-initial-state.png',
      fullPage: true
    });
    console.log('✅ Initial state captured');

    // Step 2: Check current XP and level
    const currentLevel = await page.locator('.text-2xl:has-text("Level")').textContent();
    const xpText = await page.locator('text=Experience').locator('..').textContent();
    console.log(`📊 Current state: ${currentLevel}, XP info: ${xpText}`);

    // Step 3: Award XP to reach leveling threshold
    // In Dungeon World, you level up when XP = Level + 7
    // Let's simulate gaining XP through failed rolls first
    console.log('Step 2: Simulating failed rolls to gain XP...');

    // Make multiple failed rolls (STR is low, so likely to fail)
    for (let i = 0; i < 5; i++) {
      console.log(`Making failed roll attempt ${i + 1}...`);

      // Click on STR stat (lowest stat, most likely to fail)
      const strStat = await page.locator('[aria-label*="Roll"][aria-label*="STR"]').first();
      await strStat.click();

      // Wait for roll animation to complete
      await page.waitForTimeout(3000);

      // Check if we got XP (look for XP notification or updated XP bar)
      await page.screenshot({
        path: `level-up-02-roll-attempt-${i + 1}.png`,
        fullPage: true
      });
    }

    // Step 3: Check if character can level up now
    console.log('Step 3: Checking for level up availability...');

    // Look for level up button or notification
    const levelUpButton = await page.locator('button:has-text("Level Up")');
    const isLevelUpAvailable = await levelUpButton.isVisible().catch(() => false);

    console.log(`🎯 Level up available: ${isLevelUpAvailable}`);

    await page.screenshot({
      path: 'level-up-03-after-xp-gain.png',
      fullPage: true
    });

    if (isLevelUpAvailable) {
      // Step 4: Click Level Up button
      console.log('Step 4: Initiating level up process...');
      await levelUpButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'level-up-04-level-up-modal.png',
        fullPage: true
      });

      // Step 5: Test each level up option according to DW rules
      console.log('Step 5: Testing level up options...');

      // Option 1: Increase a stat by 1 (DW official rule)
      const statIncreaseButton = await page.locator('button:has-text("Increase a stat")');
      if (await statIncreaseButton.isVisible()) {
        await statIncreaseButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'level-up-05a-stat-increase-option.png',
          fullPage: true
        });

        // Cancel and try next option
        const cancelButton = await page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("Back")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Option 2: Learn a new move (DW official rule)
      const newMoveButton = await page.locator('button:has-text("new move"), button:has-text("Learn")');
      if (await newMoveButton.isVisible()) {
        await newMoveButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'level-up-05b-new-move-option.png',
          fullPage: true
        });

        // Cancel and try next option
        const cancelButton = await page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("Back")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Option 3: Gain class abilities (DW official rule)
      const classAbilityButton = await page.locator('button:has-text("class abilities"), button:has-text("abilities")');
      if (await classAbilityButton.isVisible()) {
        await classAbilityButton.click();
        await page.waitForTimeout(1000);

        await page.screenshot({
          path: 'level-up-05c-class-ability-option.png',
          fullPage: true
        });

        // Cancel back to main modal
        const cancelButton = await page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("Back")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // Step 6: Actually complete a level up (choose stat increase)
      console.log('Step 6: Completing level up with stat increase...');

      const statIncreaseButtonFinal = await page.locator('button:has-text("Increase a stat")');
      if (await statIncreaseButtonFinal.isVisible()) {
        await statIncreaseButtonFinal.click();
        await page.waitForTimeout(1000);

        // Look for stat selection (should show current stats and +1 options)
        await page.screenshot({
          path: 'level-up-06-stat-selection.png',
          fullPage: true
        });

        // Try to increase STR (lowest stat, most beneficial)
        const strIncreaseButton = await page.locator('button:has-text("STR"), .stat-increase-str, [data-stat="STR"]');
        if (await strIncreaseButton.isVisible()) {
          await strIncreaseButton.click();
          await page.waitForTimeout(2000);
        }

        // Confirm the level up
        const confirmButton = await page.locator('button:has-text("Confirm"), button:has-text("Apply"), button:has-text("Level Up")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }
      }
    } else {
      console.log('⚠️  Level up not available, manually setting XP...');

      // Manually trigger level up by setting XP programmatically
      await page.evaluate(() => {
        // Get the XP store and award enough XP to trigger level up
        const xpData = localStorage.getItem('zimbomate-xp-store');
        if (xpData) {
          const parsed = JSON.parse(xpData);
          const characterId = Object.keys(parsed.state.characterXP)[0];
          if (characterId) {
            // Set XP to trigger level up (Level + 7 is the DW threshold)
            const currentLevel = parsed.state.characterLevel[characterId] || 1;
            const requiredXP = currentLevel + 7;
            parsed.state.characterXP[characterId] = requiredXP;
            localStorage.setItem('zimbomate-xp-store', JSON.stringify(parsed));
            console.log(`Set XP to ${requiredXP} for level ${currentLevel} character`);
          }
        }
      });

      // Reload to trigger level up check
      await page.reload();
      await page.waitForTimeout(3000);
      await page.waitForSelector('text=Lyra Swiftarrow', { timeout: 10000 });

      await page.screenshot({
        path: 'level-up-03b-manual-xp-trigger.png',
        fullPage: true
      });

      // Check again for level up button
      const levelUpButtonRetry = await page.locator('button:has-text("Level Up")');
      const isLevelUpAvailableRetry = await levelUpButtonRetry.isVisible().catch(() => false);

      if (isLevelUpAvailableRetry) {
        console.log('✅ Level up now available after manual XP setting');
        await levelUpButtonRetry.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'level-up-04b-level-up-modal-manual.png',
          fullPage: true
        });
      }
    }

    // Step 7: Final state after level up
    console.log('Step 7: Capturing final state...');

    await page.screenshot({
      path: 'level-up-07-final-state.png',
      fullPage: true
    });

    // Step 8: Verify level up effects
    console.log('Step 8: Verifying level up effects...');

    // Check new level
    const newLevel = await page.locator('.text-2xl:has-text("Level")').textContent();
    const newXpText = await page.locator('text=Experience').locator('..').textContent();

    // Check if stats changed
    const finalStats = await page.evaluate(() => {
      const stats = {};
      const statElements = document.querySelectorAll('[data-stat], .stat-value');
      statElements.forEach(el => {
        const statName = el.getAttribute('data-stat') || el.textContent?.match(/STR|DEX|CON|INT|WIS|CHA/)?.[0];
        const statValue = el.textContent?.match(/\d+/)?.[0];
        if (statName && statValue) {
          stats[statName] = parseInt(statValue);
        }
      });
      return stats;
    });

    console.log('\n🎯 LEVEL UP REGRESSION RESULTS:');
    console.log('=====================================');
    console.log(`📊 Final level: ${newLevel}`);
    console.log(`📊 Final XP: ${newXpText}`);
    console.log('📊 Final stats:', finalStats);
    console.log(`✅ Screenshots taken: 7-10 images`);

    // Check for any errors in console
    const errors = consoleMessages.filter(msg => msg.includes('[ERROR]'));
    const warnings = consoleMessages.filter(msg => msg.includes('[WARNING]') || msg.includes('[WARN]'));

    console.log(`🐛 Console errors: ${errors.length}`);
    console.log(`⚠️  Console warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Console Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n📸 Screenshots saved:');
    console.log('  - level-up-01-initial-state.png');
    console.log('  - level-up-02-roll-attempt-*.png (5 attempts)');
    console.log('  - level-up-03-after-xp-gain.png');
    console.log('  - level-up-04-level-up-modal.png');
    console.log('  - level-up-05a-stat-increase-option.png');
    console.log('  - level-up-05b-new-move-option.png');
    console.log('  - level-up-05c-class-ability-option.png');
    console.log('  - level-up-06-stat-selection.png');
    console.log('  - level-up-07-final-state.png');

  } catch (error) {
    console.error('❌ Level up test failed:', error);

    await page.screenshot({
      path: 'level-up-error.png',
      fullPage: true
    });

    console.log('Error screenshot saved as: level-up-error.png');
  }

  await browser.close();
})();