import { chromium } from 'playwright';

/**
 * COMPLETE REGRESSION TEST SUITE
 * Run this after implementing features to detect visual regressions
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🔍 REGRESSION TEST SUITE - ${timestamp}`);
  console.log('='.repeat(60));

  const testResults = {
    passed: 0,
    failed: 0,
    issues: []
  };

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000);

    // Test 1: App Loading & Character Display
    console.log('\n📋 TEST 1: App Loading & Character Display');
    console.log('=========================================');

    try {
      await page.waitForSelector('text=Lyra Swiftarrow, text=Eldara Moonwhisper', { timeout: 10000 });

      // Check for critical UI elements
      const hasCharacterName = await page.locator('text=Lyra Swiftarrow, text=Eldara Moonwhisper').isVisible();
      const hasStatsGrid = await page.locator('[class*="STR"], [class*="DEX"], [class*="CON"]').count() >= 6;
      const hasExperienceSection = await page.locator('text=Experience').isVisible();

      await page.screenshot({
        path: `regression-01-app-loaded-${timestamp}.png`,
        fullPage: true
      });

      if (hasCharacterName && hasStatsGrid && hasExperienceSection) {
        console.log('✅ App loading test PASSED');
        testResults.passed++;
      } else {
        console.log('❌ App loading test FAILED');
        console.log(`  Character name visible: ${hasCharacterName}`);
        console.log(`  Stats grid present: ${hasStatsGrid}`);
        console.log(`  Experience section visible: ${hasExperienceSection}`);
        testResults.failed++;
        testResults.issues.push('App loading: Missing critical UI elements');
      }
    } catch (error) {
      console.log('❌ App loading test FAILED with error:', error.message);
      testResults.failed++;
      testResults.issues.push(`App loading error: ${error.message}`);
    }

    // Test 2: Character Sheet Display Integrity
    console.log('\n📊 TEST 2: Character Sheet Display Integrity');
    console.log('==========================================');

    try {
      // Verify all 6 stats are displayed with values
      const statElements = await page.locator('[class*="stat"], [class*="STR"], [class*="DEX"], [class*="CON"], [class*="INT"], [class*="WIS"], [class*="CHA"]').count();
      const hasHP = await page.locator('text=Health, text=HP').isVisible();
      const hasLevel = await page.locator('text=Level').isVisible();

      await page.screenshot({
        path: `regression-02-character-sheet-${timestamp}.png`,
        fullPage: true
      });

      if (statElements >= 6 && hasHP && hasLevel) {
        console.log('✅ Character sheet integrity test PASSED');
        testResults.passed++;
      } else {
        console.log('❌ Character sheet integrity test FAILED');
        console.log(`  Stat elements found: ${statElements}/6`);
        console.log(`  HP visible: ${hasHP}`);
        console.log(`  Level visible: ${hasLevel}`);
        testResults.failed++;
        testResults.issues.push('Character sheet: Missing stat/HP/level elements');
      }
    } catch (error) {
      console.log('❌ Character sheet test FAILED with error:', error.message);
      testResults.failed++;
      testResults.issues.push(`Character sheet error: ${error.message}`);
    }

    // Test 3: Level Up System (Critical)
    console.log('\n🆙 TEST 3: Level Up System');
    console.log('========================');

    try {
      const levelUpButton = await page.locator('button:has-text("Level Up")');
      const isLevelUpVisible = await levelUpButton.isVisible();

      if (isLevelUpVisible) {
        console.log('🎯 Level Up button detected - testing full flow...');

        await levelUpButton.click();
        await page.waitForTimeout(2000);

        // Verify modal opens with 3 options
        const statOption = await page.locator('button:has-text("Increase a stat")').isVisible();
        const moveOption = await page.locator('button:has-text("Learn a new move")').isVisible();
        const abilityOption = await page.locator('button:has-text("class abilities")').isVisible();

        await page.screenshot({
          path: `regression-03-level-up-modal-${timestamp}.png`,
          fullPage: true
        });

        if (statOption && moveOption && abilityOption) {
          console.log('✅ Level up modal test PASSED - All 3 options available');

          // Test stat selection flow
          await page.locator('button:has-text("Increase a stat")').click();
          await page.waitForTimeout(1500);

          const statButtons = await page.locator('button:has-text("STR"), button:has-text("DEX"), button:has-text("CON")').count();
          await page.screenshot({
            path: `regression-04-stat-selection-${timestamp}.png`,
            fullPage: true
          });

          if (statButtons >= 6) {
            console.log('✅ Stat selection test PASSED - All 6 stats available');
            testResults.passed++;
          } else {
            console.log(`❌ Stat selection test FAILED - Only ${statButtons}/6 stats found`);
            testResults.failed++;
            testResults.issues.push('Level up: Missing stat selection options');
          }

          // Test move selection flow
          await page.locator('button:has-text("← Back to choices")').click();
          await page.waitForTimeout(1000);

          await page.locator('button:has-text("Learn a new move")').click();
          await page.waitForTimeout(1500);

          const moveSection = await page.locator('text=Choose a new move to learn').isVisible();
          await page.screenshot({
            path: `regression-05-move-selection-${timestamp}.png`,
            fullPage: true
          });

          if (moveSection) {
            console.log('✅ Move selection test PASSED');
            testResults.passed++;
          } else {
            console.log('❌ Move selection test FAILED');
            testResults.failed++;
            testResults.issues.push('Level up: Move selection not working');
          }

          // Close modal
          await page.locator('button:has-text("Close")').click();
          await page.waitForTimeout(1000);

        } else {
          console.log('❌ Level up modal test FAILED - Missing advancement options');
          testResults.failed++;
          testResults.issues.push('Level up: Modal missing advancement options');
        }

      } else {
        console.log('ℹ️  Level Up button not visible - testing XP store integration...');

        // Test XP store initialization
        const xpStoreTest = await page.evaluate(() => {
          const xpStore = localStorage.getItem('zimbomate-xp-store');
          const charStore = localStorage.getItem('zimbomate-character-storage');
          return {
            xpStoreExists: !!xpStore,
            characterStoreExists: !!charStore
          };
        });

        if (xpStoreTest.xpStoreExists && xpStoreTest.characterStoreExists) {
          console.log('✅ XP store integration test PASSED');
          testResults.passed++;
        } else {
          console.log('❌ XP store integration test FAILED');
          testResults.failed++;
          testResults.issues.push('Level up: XP store not properly initialized');
        }
      }

    } catch (error) {
      console.log('❌ Level up system test FAILED with error:', error.message);
      testResults.failed++;
      testResults.issues.push(`Level up system error: ${error.message}`);
    }

    // Test 4: Mobile Responsiveness
    console.log('\n📱 TEST 4: Mobile Responsiveness');
    console.log('==============================');

    try {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(2000);

      const isMobileResponsive = await page.evaluate(() => {
        const bodyWidth = document.body.scrollWidth;
        return bodyWidth <= 400; // Should not have horizontal scroll on mobile
      });

      await page.screenshot({
        path: `regression-06-mobile-view-${timestamp}.png`,
        fullPage: true
      });

      if (isMobileResponsive) {
        console.log('✅ Mobile responsiveness test PASSED');
        testResults.passed++;
      } else {
        console.log('❌ Mobile responsiveness test FAILED - Horizontal scroll detected');
        testResults.failed++;
        testResults.issues.push('Mobile: Layout not properly responsive');
      }

    } catch (error) {
      console.log('❌ Mobile responsiveness test FAILED with error:', error.message);
      testResults.failed++;
      testResults.issues.push(`Mobile responsiveness error: ${error.message}`);
    }

    // Final summary
    console.log('\n🏆 REGRESSION TEST RESULTS');
    console.log('='.repeat(30));
    console.log(`✅ Tests Passed: ${testResults.passed}`);
    console.log(`❌ Tests Failed: ${testResults.failed}`);
    console.log(`📊 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

    if (testResults.issues.length > 0) {
      console.log('\n🚨 ISSUES DETECTED:');
      testResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log('\n⚠️  Please fix these issues before committing changes!');
    } else {
      console.log('\n🎉 All tests passed! No regressions detected.');
    }

    console.log('\n📸 Screenshots Generated:');
    console.log('========================');
    console.log(`📷 regression-01-app-loaded-${timestamp}.png`);
    console.log(`📷 regression-02-character-sheet-${timestamp}.png`);
    console.log(`📷 regression-03-level-up-modal-${timestamp}.png`);
    console.log(`📷 regression-04-stat-selection-${timestamp}.png`);
    console.log(`📷 regression-05-move-selection-${timestamp}.png`);
    console.log(`📷 regression-06-mobile-view-${timestamp}.png`);

  } catch (error) {
    console.error('❌ Regression test suite failed:', error);
    await page.screenshot({
      path: `regression-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();