import { chromium } from 'playwright';

async function equipmentInteractionTest() {
  console.log('⚔️ EQUIPMENT INTERACTION TEST');
  console.log('Testing actual equip/unequip functionality...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    viewport: { width: 1400, height: 1000 }
  });

  const page = await browser.newPage();

  try {
    // Load the app
    console.log('📱 Loading ZimboMate V2...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);

    // Navigate to Equipment tab
    console.log('🎒 Navigating to Equipment tab...');
    const equipmentTab = page.locator('button:has-text("Equipment")');
    await equipmentTab.click();
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'equipment-initial-state.png', fullPage: true });
    console.log('📸 Initial equipment state captured');

    // Look for equipped items
    console.log('\n🔍 Looking for equipped items...');

    // Try multiple selectors for equipped items
    const equippedItemSelectors = [
      '[data-equipped="true"]',
      '.equipped-item',
      '[class*="equipped"]',
      '.item.equipped',
      'button:has-text("Unequip")',
      '[data-testid*="equipped"]',
      '.equipment-slot .item'
    ];

    let equippedItems = [];
    for (const selector of equippedItemSelectors) {
      const items = await page.locator(selector).all();
      if (items.length > 0) {
        console.log(`   Found ${items.length} items with selector: ${selector}`);
        equippedItems = items;
        break;
      }
    }

    if (equippedItems.length === 0) {
      console.log('⚠️ No equipped items found. Looking for any items to equip first...');

      // Look for unequipped items or equip buttons
      const unequippedSelectors = [
        'button:has-text("Equip")',
        '.item:not(.equipped)',
        '[data-equipped="false"]',
        '.inventory-item'
      ];

      for (const selector of unequippedSelectors) {
        const items = await page.locator(selector).all();
        if (items.length > 0) {
          console.log(`   Found ${items.length} unequipped items with selector: ${selector}`);

          // Try to equip the first item
          console.log('   🔧 Attempting to equip first item...');
          await items[0].click();
          await page.waitForTimeout(1500);

          await page.screenshot({ path: 'equipment-after-equip.png', fullPage: true });
          console.log('   📸 Post-equip state captured');

          // Now look for equipped items again
          for (const equippedSelector of equippedItemSelectors) {
            const nowEquipped = await page.locator(equippedSelector).all();
            if (nowEquipped.length > 0) {
              equippedItems = nowEquipped;
              console.log(`   ✅ Item successfully equipped! Found with: ${equippedSelector}`);
              break;
            }
          }
          break;
        }
      }
    }

    // Test unequipping
    if (equippedItems.length > 0) {
      console.log('\n🔄 Testing unequip functionality...');

      const firstEquippedItem = equippedItems[0];

      // Try different ways to unequip
      const unequipMethods = [
        async () => {
          // Method 1: Look for unequip button within the item
          const unequipBtn = firstEquippedItem.locator('button:has-text("Unequip")');
          if (await unequipBtn.isVisible({ timeout: 1000 })) {
            await unequipBtn.click();
            return 'Unequip button';
          }
          return null;
        },
        async () => {
          // Method 2: Right click on item
          await firstEquippedItem.click({ button: 'right' });
          await page.waitForTimeout(500);
          const contextUnequip = page.locator('button:has-text("Unequip")');
          if (await contextUnequip.isVisible({ timeout: 1000 })) {
            await contextUnequip.click();
            return 'Right-click context menu';
          }
          return null;
        },
        async () => {
          // Method 3: Double click on item
          await firstEquippedItem.dblclick();
          return 'Double-click';
        },
        async () => {
          // Method 4: Single click on equipped item
          await firstEquippedItem.click();
          return 'Single click';
        }
      ];

      let unequipWorked = false;
      let methodUsed = 'None';

      for (const method of unequipMethods) {
        try {
          const methodName = await method();
          if (methodName) {
            await page.waitForTimeout(2000);

            // Check if item is still equipped
            const stillEquippedCount = await page.locator(equippedItemSelectors[0]).count();
            const originalCount = equippedItems.length;

            if (stillEquippedCount < originalCount) {
              unequipWorked = true;
              methodUsed = methodName;
              console.log(`   ✅ Unequip worked using: ${methodName}`);
              break;
            } else {
              console.log(`   ❌ Unequip failed with: ${methodName || 'method'}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Method failed: ${error.message}`);
        }
      }

      // Take final screenshot
      await page.screenshot({ path: 'equipment-after-unequip-attempt.png', fullPage: true });
      console.log('📸 Post-unequip attempt captured');

      if (!unequipWorked) {
        console.log('\n❌ CRITICAL BUG CONFIRMED: Unequip functionality does not work!');
        console.log('   This matches the user\'s report of the sword unequip issue.');
      } else {
        console.log(`\n✅ Unequip functionality works via: ${methodUsed}`);
      }
    } else {
      console.log('\n⚠️ Could not find any items to test unequip functionality');
    }

    // Test inventory state management
    console.log('\n📦 Testing inventory state...');

    // Look for inventory section
    const inventorySelectors = [
      '.inventory',
      '[data-testid*="inventory"]',
      '.unequipped-items',
      '.item-list'
    ];

    for (const selector of inventorySelectors) {
      const inventory = page.locator(selector);
      if (await inventory.isVisible({ timeout: 1000 })) {
        const inventoryItems = await inventory.locator('.item, [class*="item"]').count();
        console.log(`   📋 Found inventory section with ${inventoryItems} items`);
        break;
      }
    }

    // Final comprehensive screenshot
    await page.screenshot({ path: 'equipment-final-state.png', fullPage: true });

    console.log('\n' + '='.repeat(60));
    console.log('⚔️ EQUIPMENT INTERACTION TEST COMPLETE');
    console.log('='.repeat(60));
    console.log('📁 Screenshots captured:');
    console.log('   • equipment-initial-state.png');
    console.log('   • equipment-after-equip.png (if equip tested)');
    console.log('   • equipment-after-unequip-attempt.png');
    console.log('   • equipment-final-state.png');
    console.log('\n🔍 This test specifically targets the unequip bug the user reported!');

  } catch (error) {
    console.error('❌ Equipment test error:', error.message);
    await page.screenshot({ path: 'equipment-test-error.png', fullPage: true });
  }

  await browser.close();
}

// Run the equipment interaction test
equipmentInteractionTest().catch(console.error);