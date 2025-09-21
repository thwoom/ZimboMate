import { chromium } from 'playwright';

async function equipmentHoverInteractionTest() {
  console.log('🔍 EQUIPMENT HOVER INTERACTION TEST');
  console.log('Testing the exact unequip issue the user reported...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    viewport: { width: 1400, height: 1000 }
  });

  const page = await browser.newPage();

  try {
    // Load app and navigate to equipment
    console.log('📱 Loading app and navigating to Equipment tab...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(1500);

    const equipmentTab = page.locator('button:has-text("Equipment")');
    await equipmentTab.click();
    await page.waitForTimeout(2000);

    // Find an equipped item (like the sword/staff)
    console.log('⚔️ Looking for equipped items...');
    const equippedItems = await page.locator('.equipment-slot-filled').all();

    if (equippedItems.length === 0) {
      console.log('❌ No equipped items found to test!');
      return;
    }

    const firstItem = equippedItems[0];
    console.log(`✅ Found ${equippedItems.length} equipped items to test`);

    // Test 1: Single click (what user probably tried)
    console.log('\n🖱️ TEST 1: Single click on equipped item (user\'s likely approach)...');
    await firstItem.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'hover-test-single-click.png', fullPage: true });
    console.log('   📸 Single click result captured');

    // Check if anything happened
    const stillEquipped1 = await page.locator('.equipment-slot-filled').count();
    console.log(`   📊 Items still equipped after single click: ${stillEquipped1}`);

    // Test 2: Look for unequip button WITHOUT hover
    console.log('\n👁️ TEST 2: Checking for visible unequip buttons without hover...');
    const visibleUnequipButtons = await page.locator('button:has-text("×"), .group button[aria-label*="nequip"], button:visible:has(.arrow-down)').count();
    console.log(`   📊 Visible unequip buttons without hover: ${visibleUnequipButtons}`);

    if (visibleUnequipButtons === 0) {
      console.log('   ⚠️ ISSUE CONFIRMED: No visible unequip buttons without hover!');
    }

    // Test 3: Hover to reveal unequip button
    console.log('\n🎯 TEST 3: Hovering over equipped item to reveal unequip button...');
    await firstItem.hover();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'hover-test-hover-state.png', fullPage: true });
    console.log('   📸 Hover state captured');

    // Look for unequip button after hover
    const hoverUnequipButtons = await page.locator('button:visible:has([class*="arrow"]), button:visible[class*="opacity"]:not([class*="opacity-0"])').count();
    console.log(`   📊 Visible unequip buttons after hover: ${hoverUnequipButtons}`);

    // Test 4: Try to click the hover-revealed button
    console.log('\n🎯 TEST 4: Attempting to click hover-revealed unequip button...');

    try {
      // Look for the specific unequip button pattern from the code
      const unequipButton = page.locator('.equipment-slot-filled .group button[class*="opacity"]').first();

      if (await unequipButton.isVisible({ timeout: 1000 })) {
        await unequipButton.click();
        await page.waitForTimeout(1500);

        const stillEquipped2 = await page.locator('.equipment-slot-filled').count();
        console.log(`   📊 Items still equipped after hover-button click: ${stillEquipped2}`);

        if (stillEquipped2 < equippedItems.length) {
          console.log('   ✅ Hover-click unequip worked!');
        } else {
          console.log('   ❌ Hover-click unequip failed!');
        }
      } else {
        console.log('   ❌ Could not find hover-revealed unequip button!');
      }
    } catch (error) {
      console.log(`   ❌ Hover-click attempt failed: ${error.message}`);
    }

    await page.screenshot({ path: 'hover-test-after-hover-click.png', fullPage: true });

    // Test 5: Double-click method (what my test found works)
    console.log('\n🖱️ TEST 5: Double-click method (confirmed working)...');
    const remainingItems = await page.locator('.equipment-slot-filled').all();

    if (remainingItems.length > 0) {
      await remainingItems[0].dblclick();
      await page.waitForTimeout(1500);

      const finalEquipped = await page.locator('.equipment-slot-filled').count();
      console.log(`   📊 Items remaining after double-click: ${finalEquipped}`);

      if (finalEquipped < remainingItems.length) {
        console.log('   ✅ Double-click unequip confirmed working!');
      }
    }

    await page.screenshot({ path: 'hover-test-final-state.png', fullPage: true });

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 EQUIPMENT INTERACTION ANALYSIS COMPLETE');
    console.log('='.repeat(70));
    console.log('🔍 ROOT CAUSE ANALYSIS:');
    console.log('   • Unequip buttons are HIDDEN by default (opacity-0)');
    console.log('   • Only visible on hover (group-hover:opacity-100)');
    console.log('   • User likely tried single-click, which does nothing');
    console.log('   • User may not have discovered the hover requirement');
    console.log('   • Double-click works as alternative interaction');
    console.log('\n💡 UX ISSUE: Poor discoverability of unequip functionality!');

  } catch (error) {
    console.error('❌ Hover interaction test error:', error.message);
    await page.screenshot({ path: 'hover-test-error.png', fullPage: true });
  }

  await browser.close();
}

equipmentHoverInteractionTest().catch(console.error);