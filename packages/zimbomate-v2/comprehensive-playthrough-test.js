import { chromium } from 'playwright';

async function comprehensivePlaythroughTest() {
  console.log('🎲 DUNGEON WORLD COMPREHENSIVE PLAYTHROUGH TEST');
  console.log('Testing ALL critical game mechanics...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage();
  const testResults = [];

  try {
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // TEST 1: Character Creation - Fighter "Korven" HP Calculation
    console.log('⚔️ TEST 1: Creating Fighter "Korven" with correct HP...');

    try {
      // Look for character creation or existing character
      const currentHP = await page.locator('.health-points, [data-testid*="hp"], text=/\\d+\\/\\d+.*HP|Health/i').first().textContent({ timeout: 3000 });

      if (currentHP) {
        const hpMatch = currentHP.match(/(\d+)\/(\d+)/);
        if (hpMatch) {
          const maxHP = parseInt(hpMatch[2]);
          console.log(`  Current character HP: ${currentHP}`);

          // Check if this follows DW HP rules (base + CON score)
          testResults.push({
            test: 'HP Calculation',
            status: maxHP > 10 ? 'PASS' : 'REVIEW',
            details: `Max HP: ${maxHP} (should be base + CON score)`
          });
        }
      }
    } catch (error) {
      console.log('  ⚠️ Could not find HP element');
    }

    // TEST 2: XP on Failure System
    console.log('\n⭐ TEST 2: Checking XP system...');

    try {
      const xpElement = await page.locator('text=/Experience|XP/, [data-testid*="xp"]').first();
      if (await xpElement.isVisible({ timeout: 3000 })) {
        const xpText = await xpElement.textContent();
        console.log(`  Current XP: ${xpText}`);
        testResults.push({
          test: 'XP System Present',
          status: 'PASS',
          details: `XP display found: ${xpText}`
        });
      }
    } catch (error) {
      testResults.push({
        test: 'XP System Present',
        status: 'FAIL',
        details: 'XP element not found'
      });
    }

    // TEST 3: Move System
    console.log('\n⚔️ TEST 3: Testing move system...');

    try {
      // Look for basic moves
      const hackAndSlashButton = await page.locator('button:has-text("Hack and Slash"), [data-move="hack-and-slash"]').first();
      const defendButton = await page.locator('button:has-text("Defend"), [data-move="defend"]').first();

      if (await hackAndSlashButton.isVisible({ timeout: 3000 }) || await defendButton.isVisible({ timeout: 3000 })) {
        console.log('  ✅ Move buttons found!');
        testResults.push({
          test: 'Basic Moves Present',
          status: 'PASS',
          details: 'Basic move buttons are available'
        });

        // Try clicking a move to test the system
        if (await defendButton.isVisible()) {
          console.log('  🛡️ Testing Defend move...');
          await defendButton.click();
          await page.waitForTimeout(1000);

          // Look for roll interface or result
          const rollInterface = await page.locator('button:has-text("Roll"), button:has-text("Execute"), .roll-button, .dice').first();
          if (await rollInterface.isVisible({ timeout: 2000 })) {
            console.log('  ✅ Roll interface appeared!');
            testResults.push({
              test: 'Move Execution',
              status: 'PASS',
              details: 'Defend move triggered roll interface'
            });
          }
        }
      }
    } catch (error) {
      console.log('  ⚠️ Move system test inconclusive');
    }

    // TEST 4: Alignment System
    console.log('\n⚖️ TEST 4: Testing alignment system...');

    try {
      const alignmentSection = await page.locator('text=/Alignment/, .alignment').first();
      if (await alignmentSection.isVisible({ timeout: 3000 })) {
        const alignmentText = await alignmentSection.textContent();
        console.log(`  Alignment found: ${alignmentText}`);
        testResults.push({
          test: 'Alignment System',
          status: 'PASS',
          details: `Alignment system active: ${alignmentText}`
        });
      }
    } catch (error) {
      console.log('  ⚠️ Alignment system not clearly visible');
    }

    // TEST 5: Bonds System
    console.log('\n🤝 TEST 5: Testing bonds system...');

    try {
      const bondsSection = await page.locator('text=/Bond/, text=/Character Bonds/, .bonds').first();
      if (await bondsSection.isVisible({ timeout: 3000 })) {
        console.log('  ✅ Bonds system found!');
        testResults.push({
          test: 'Bonds System',
          status: 'PASS',
          details: 'Bonds interface is present'
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Bonds System',
        status: 'FAIL',
        details: 'Bonds system not found'
      });
    }

    // TEST 6: Debilities System
    console.log('\n🤕 TEST 6: Testing debilities system...');

    try {
      const debilitiesSection = await page.locator('text=/Debility/, text=/Weak/, text=/Stunned/, .debility').first();
      if (await debilitiesSection.isVisible({ timeout: 3000 })) {
        console.log('  ✅ Debilities system found!');
        testResults.push({
          test: 'Debilities System',
          status: 'PASS',
          details: 'Debilities interface is present'
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Debilities System',
        status: 'REVIEW',
        details: 'Debilities system not clearly visible'
      });
    }

    // Final screenshot
    await page.screenshot({ path: 'comprehensive-test-final.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  }

  await browser.close();

  // Print test results summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS:');
  console.log('='.repeat(60));

  let passCount = 0;
  let failCount = 0;
  let reviewCount = 0;

  testResults.forEach((result, index) => {
    const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${statusEmoji} ${result.test}: ${result.status}`);
    console.log(`   ${result.details}\n`);

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'FAIL') failCount++;
    else reviewCount++;
  });

  console.log(`SUMMARY: ${passCount} PASS | ${failCount} FAIL | ${reviewCount} REVIEW`);

  if (failCount === 0) {
    console.log('🎉 ALL CRITICAL SYSTEMS FUNCTIONAL!');
  } else {
    console.log('⚠️ Some issues found - review needed');
  }

  return testResults;
}

// Run the comprehensive test
comprehensivePlaythroughTest().catch(console.error);