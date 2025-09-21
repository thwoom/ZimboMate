import { chromium } from 'playwright';

async function finalVerificationTest() {
  console.log('🎯 FINAL VERIFICATION TEST');
  console.log('Testing all fixes with fresh browser session...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    viewport: { width: 1400, height: 1000 }
  });

  const page = await browser.newPage();

  try {
    console.log('📱 Loading fresh page...');
    await page.goto('http://localhost:3002?fresh=' + Date.now()); // Cache bust
    await page.waitForTimeout(3000);

    const results = {
      equipment: { fixed: false, details: [] },
      moves: { fixed: false, details: [] },
      dice: { fixed: false, details: [] },
      character: { fixed: false, details: [] }
    };

    // Test 1: Character Creation
    console.log('\n✅ TEST 1: Character Creation');
    await page.locator('button:has-text("Character")').first().click();
    await page.waitForTimeout(1500);

    const createButtons = await page.locator('button:has-text("Create")').count();
    results.character.fixed = createButtons > 0;
    results.character.details.push(`Found ${createButtons} create buttons`);
    console.log(`   📊 Create buttons: ${createButtons} ${createButtons > 0 ? '✅' : '❌'}`);

    // Test 2: Equipment Unequip
    console.log('\n⚔️ TEST 2: Equipment Unequip');
    await page.locator('button:has-text("Equipment")').first().click();
    await page.waitForTimeout(1500);

    const visibleUnequipButtons = await page.locator('button:visible').count();
    const equippedItems = await page.locator('.equipment-slot-filled').count();

    results.equipment.details.push(`Found ${equippedItems} equipped items`);
    results.equipment.details.push(`Found ${visibleUnequipButtons} total visible buttons`);

    // Test single click on first equipped item
    if (equippedItems > 0) {
      const beforeClick = await page.locator('.equipment-slot-filled').count();
      const firstItem = page.locator('.equipment-slot-filled').first();
      await firstItem.click();
      await page.waitForTimeout(2000);
      const afterClick = await page.locator('.equipment-slot-filled').count();

      const clickWorked = afterClick < beforeClick;
      results.equipment.fixed = clickWorked;
      results.equipment.details.push(`Single click: ${clickWorked ? 'WORKS' : 'FAILS'} (${beforeClick} → ${afterClick})`);
      console.log(`   📊 Single click unequip: ${clickWorked ? '✅' : '❌'} (${beforeClick} → ${afterClick})`);
    }

    // Test 3: Moves Interaction
    console.log('\n🎲 TEST 3: Moves Interaction');
    await page.locator('button:has-text("Moves")').first().click();
    await page.waitForTimeout(1500);

    const moveButtons = await page.locator('button:has-text("Hack and Slash"), button:has-text("Defend"), button:has-text("Volley")').count();
    results.moves.details.push(`Found ${moveButtons} move buttons`);
    console.log(`   📊 Move buttons found: ${moveButtons} ${moveButtons > 0 ? '✅' : '❌'}`);

    if (moveButtons > 0) {
      // Test click interaction
      const moveButton = page.locator('button:has-text("Defend")').first();
      if (await moveButton.isVisible()) {
        await moveButton.click();
        await page.waitForTimeout(2000);

        const rollInterface = await page.locator('.dice-result, .roll-result, button:has-text("Roll")').count();
        const clickProducedResults = rollInterface > 0;
        results.moves.fixed = moveButtons > 0 && clickProducedResults;
        results.moves.details.push(`Click response: ${clickProducedResults ? 'WORKS' : 'FAILS'} (${rollInterface} roll elements)`);
        console.log(`   📊 Move click response: ${clickProducedResults ? '✅' : '❌'} (${rollInterface} elements)`);
      }
    }

    // Test 4: Dice Rolling
    console.log('\n🎲 TEST 4: Dice Rolling');
    try {
      await page.locator('button:has-text("Dice")').first().click({ timeout: 5000 });
      await page.waitForTimeout(1500);

      const diceButtons = await page.locator('button:has-text("Roll"), button:has-text("2d6")').count();
      results.dice.details.push(`Found ${diceButtons} dice buttons`);
      console.log(`   📊 Dice buttons: ${diceButtons} ${diceButtons > 0 ? '✅' : '❌'}`);

      if (diceButtons > 0) {
        const rollButton = page.locator('button:has-text("Roll")').first();
        await rollButton.click();
        await page.waitForTimeout(2000);

        const results_elements = await page.locator('.dice-result, .roll-result').count();
        const rollWorked = results_elements > 0;
        results.dice.fixed = rollWorked;
        results.dice.details.push(`Roll results: ${rollWorked ? 'VISIBLE' : 'NONE'} (${results_elements} elements)`);
        console.log(`   📊 Roll results: ${rollWorked ? '✅' : '❌'} (${results_elements} elements)`);
      }
    } catch (error) {
      results.dice.details.push(`Navigation failed: ${error.message}`);
      console.log(`   📊 Dice tab navigation: ❌ (${error.message})`);
    }

    // Summary
    const fixedCount = Object.values(results).filter(r => r.fixed).length;
    const totalTests = Object.keys(results).length;

    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixedCount}/${totalTests} tests passing`);

    Object.entries(results).forEach(([test, result]) => {
      console.log(`\n${result.fixed ? '✅' : '❌'} ${test.toUpperCase()}:`);
      result.details.forEach(detail => console.log(`   • ${detail}`));
    });

    await page.screenshot({ path: 'final-verification-complete.png', fullPage: true });

  } catch (error) {
    console.error('❌ Verification error:', error.message);
    await page.screenshot({ path: 'verification-error.png', fullPage: true });
  }

  await browser.close();
}

finalVerificationTest().catch(console.error);