import { chromium } from 'playwright';

/**
 * BASELINE SCREENSHOT CAPTURE
 * Run this before implementing major features to establish visual baselines
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`📸 BASELINE SCREENSHOT CAPTURE - ${timestamp}`);
  console.log('='.repeat(60));

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000); // Wait for full app load

    console.log('📋 Capturing baseline screenshots...');

    // 1. App Loading & Character Display
    await page.waitForSelector('text=Lyra Swiftarrow, text=Eldara Moonwhisper', { timeout: 10000 });
    await page.screenshot({
      path: `baseline-01-app-loaded-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ App loading baseline captured');

    // 2. Character Sheet Full State
    await page.screenshot({
      path: `baseline-02-character-sheet-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Character sheet baseline captured');

    // 3. Check if Level Up button is available
    const levelUpButton = await page.locator('button:has-text("Level Up")');
    const isLevelUpVisible = await levelUpButton.isVisible().catch(() => false);

    if (isLevelUpVisible) {
      console.log('🎯 Level Up button detected - capturing level up flow...');

      await levelUpButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `baseline-03-level-up-modal-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Level up modal baseline captured');

      // Test stat increase flow
      const statButton = await page.locator('button:has-text("Increase a stat")');
      await statButton.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `baseline-04-stat-selection-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Stat selection baseline captured');

      // Go back and test move selection
      const backButton = await page.locator('button:has-text("← Back to choices")');
      await backButton.click();
      await page.waitForTimeout(1000);

      const moveButton = await page.locator('button:has-text("Learn a new move")');
      await moveButton.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `baseline-05-move-selection-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Move selection baseline captured');

      // Close modal
      const closeButton = await page.locator('button:has-text("Close")');
      await closeButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('ℹ️  Level Up button not visible - skipping level up flow baseline');
    }

    // 4. Navigation/Panel States
    await page.screenshot({
      path: `baseline-06-final-state-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Final state baseline captured');

    // 5. Mobile viewport test
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 12
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `baseline-07-mobile-view-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Mobile viewport baseline captured');

    // Summary
    console.log('\n🎉 BASELINE CAPTURE COMPLETE');
    console.log('==============================');
    console.log(`Timestamp: ${timestamp}`);
    console.log('Screenshots saved:');
    console.log('📷 baseline-01-app-loaded - Initial app state');
    console.log('📷 baseline-02-character-sheet - Character display');
    if (isLevelUpVisible) {
      console.log('📷 baseline-03-level-up-modal - Level up dialog');
      console.log('📷 baseline-04-stat-selection - Stat increase UI');
      console.log('📷 baseline-05-move-selection - Move selection UI');
    }
    console.log('📷 baseline-06-final-state - App final state');
    console.log('📷 baseline-07-mobile-view - Mobile responsive layout');

    console.log('\n📝 Next Steps:');
    console.log('1. Implement your feature changes');
    console.log('2. Run: node complete-regression-test.js');
    console.log('3. Compare new screenshots with these baselines');
    console.log('4. Fix any visual regressions found');

  } catch (error) {
    console.error('❌ Baseline capture failed:', error);
    await page.screenshot({
      path: `baseline-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();