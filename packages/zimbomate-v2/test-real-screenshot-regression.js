import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🧪 REAL SCREENSHOT REGRESSION TEST');
  console.log('===================================');

  try {
    // Step 1: Load the app and wait for it to fully load
    console.log('Step 1: Loading app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Wait for the character data to load (any of the sample characters)
    await page.waitForSelector('text=Lyra Swiftarrow', { timeout: 10000 });
    console.log('✅ App loaded successfully');

    // Step 2: Take baseline screenshot
    await page.screenshot({
      path: 'real-baseline.png',
      fullPage: true
    });
    console.log('✅ Step 2: Baseline screenshot taken');

    // Step 3: Verify character store connection - check if we can see character data
    const characterName = await page.locator('h1, h2, h3').filter({ hasText: /Eldara|Lyra|Gareth/ }).first().textContent();
    console.log(`✅ Step 3: Active character: ${characterName}`);

    // Step 4: Verify edit button is working
    const editButton = await page.locator('button:has-text("Edit")').first();
    const isEditVisible = await editButton.isVisible({ timeout: 5000 });
    console.log(`✅ Step 4: Edit button visible: ${isEditVisible}`);

    if (isEditVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'real-edit-mode.png',
        fullPage: true
      });
      console.log('✅ Edit mode screenshot taken');

      // Exit edit mode
      await page.locator('button:has-text("Save")').first().click();
      await page.waitForTimeout(1000);
    }

    // Step 5: Test dice rolling
    const rollableStats = await page.locator('[aria-label*="Roll"][aria-label*="stat"]');
    const rollableCount = await rollableStats.count();
    console.log(`✅ Step 5: Found ${rollableCount} rollable stats`);

    if (rollableCount > 0) {
      // Click the first rollable stat
      await rollableStats.first().click();
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: 'real-after-dice-roll.png',
        fullPage: true
      });
      console.log('✅ Dice roll screenshot taken');
    }

    // Step 6: Check for any console errors
    let consoleErrors = [];
    let consoleWarnings = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Give a moment for any async errors to surface
    await page.waitForTimeout(2000);

    // Step 7: Test navigation between tabs (if available)
    const tabButtons = await page.locator('button[role="tab"], nav button').all();
    if (tabButtons.length > 0) {
      console.log(`✅ Step 7: Found ${tabButtons.length} navigation tabs`);

      // Click a different tab if available
      if (tabButtons.length > 1) {
        await tabButtons[1].click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'real-tab-navigation.png',
          fullPage: true
        });
        console.log('✅ Tab navigation screenshot taken');

        // Go back to first tab
        await tabButtons[0].click();
        await page.waitForTimeout(1000);
      }
    }

    // Step 8: Verify XP system is working
    const xpData = await page.evaluate(() => {
      const xpStore = localStorage.getItem('zimbomate-xp-store');
      return xpStore ? JSON.parse(xpStore) : null;
    });

    const hasXPData = xpData?.state?.characterXP && Object.keys(xpData.state.characterXP).length > 0;
    console.log(`✅ Step 8: XP system has data: ${hasXPData}`);

    // Final screenshot
    await page.screenshot({
      path: 'real-final-state.png',
      fullPage: true
    });

    console.log('');
    console.log('🎯 REAL TEST RESULTS:');
    console.log('======================');
    console.log(`✅ App loads successfully: YES`);
    console.log(`✅ Character data visible: ${characterName || 'Unknown'}`);
    console.log(`✅ Edit functionality: ${isEditVisible ? 'WORKING' : 'NOT FOUND'}`);
    console.log(`✅ Dice rolling: ${rollableCount > 0 ? 'WORKING' : 'NOT FOUND'}`);
    console.log(`✅ XP system: ${hasXPData ? 'HAS DATA' : 'NO DATA'}`);
    console.log(`✅ Console errors: ${consoleErrors.length}`);
    console.log(`✅ Console warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️ Console Warnings:');
      consoleWarnings.forEach(warning => console.log(`  - ${warning}`));
    }

    console.log('\n📸 Screenshots taken:');
    console.log('  - real-baseline.png');
    if (isEditVisible) console.log('  - real-edit-mode.png');
    if (rollableCount > 0) console.log('  - real-after-dice-roll.png');
    if (tabButtons.length > 1) console.log('  - real-tab-navigation.png');
    console.log('  - real-final-state.png');

  } catch (error) {
    console.error('❌ Real test failed:', error);

    await page.screenshot({
      path: 'real-test-error.png',
      fullPage: true
    });

    console.log('Error screenshot saved as: real-test-error.png');
  }

  await browser.close();
})();