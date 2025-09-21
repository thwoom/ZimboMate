import { chromium } from 'playwright';

async function fullAppWalkthrough() {
  console.log('🎲 ZIMBOMATE V2 - COMPLETE APP WALKTHROUGH');
  console.log('Exploring every section of the Dungeon World app...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500, // Slower for better visibility
    viewport: { width: 1400, height: 1000 }
  });

  const page = await browser.newPage();

  try {
    // Start at the main app
    console.log('📱 1. Loading ZimboMate V2...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '01-main-interface.png', fullPage: true });
    console.log('   📸 Screenshot saved: 01-main-interface.png');

    // Navigate through the top menu tabs
    console.log('\n🗂️ 2. Exploring main navigation tabs...');

    const navTabs = [
      'Character', 'Dice', 'Moves', 'Equipment', 'Monsters',
      'Session Tools', 'Campaign', 'File Management', 'Multiplayer', 'Settings'
    ];

    for (let i = 0; i < navTabs.length; i++) {
      const tabName = navTabs[i];
      console.log(`   🔍 Testing ${tabName} tab...`);

      try {
        // Try multiple selectors for the tab
        const tabSelectors = [
          `button:has-text("${tabName}")`,
          `[data-tab="${tabName.toLowerCase()}"]`,
          `[aria-label="${tabName}"]`,
          `text=${tabName}`,
          `.tab:has-text("${tabName}")`
        ];

        let tabFound = false;
        for (const selector of tabSelectors) {
          const tab = page.locator(selector);
          if (await tab.isVisible({ timeout: 1000 })) {
            await tab.first().click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `${String(i + 2).padStart(2, '0')}-${tabName.toLowerCase().replace(' ', '-')}-tab.png`, fullPage: true });
            console.log(`   ✅ ${tabName} tab found and captured`);
            tabFound = true;
            break;
          }
        }

        if (!tabFound) {
          console.log(`   ⚠️ ${tabName} tab not found with standard selectors`);
        }
      } catch (error) {
        console.log(`   ⚠️ ${tabName} tab navigation failed: ${error.message}`);
      }
    }

    // Test character creation flow
    console.log('\n⚔️ 3. Testing Character Creation...');
    try {
      const createButtons = [
        'button:has-text("Create Character")',
        'button:has-text("New Character")',
        'button:has-text("Create")',
        '[data-testid*="create"]',
        '.create-character'
      ];

      let createFound = false;
      for (const selector of createButtons) {
        const createBtn = page.locator(selector);
        if (await createBtn.isVisible({ timeout: 1000 })) {
          await createBtn.first().click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: '12-character-creation-start.png', fullPage: true });
          console.log('   ✅ Character creation interface opened');
          createFound = true;
          break;
        }
      }

      if (!createFound) {
        console.log('   ⚠️ Character creation button not found');
      }

      // Try to select Fighter class if creation opened
      if (createFound) {
        const fighterSelectors = [
          'button:has-text("Fighter")',
          '[data-class="Fighter"]',
          'text=Fighter'
        ];

        for (const selector of fighterSelectors) {
          const fighter = page.locator(selector);
          if (await fighter.isVisible({ timeout: 1000 })) {
            await fighter.first().click();
            await page.waitForTimeout(1500);
            await page.screenshot({ path: '13-fighter-selected.png', fullPage: true });
            console.log('   ✅ Fighter class selected');
            break;
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Character creation test failed: ${error.message}`);
    }

    // Test dice rolling interface
    console.log('\n🎲 4. Testing Dice Rolling...');
    try {
      const diceSelectors = [
        'button:has-text("Roll")',
        'button:has-text("2d6")',
        '.dice-roller',
        '[data-testid*="dice"]',
        '[data-testid*="roll"]'
      ];

      for (const selector of diceSelectors) {
        const diceBtn = page.locator(selector);
        if (await diceBtn.isVisible({ timeout: 1000 })) {
          await diceBtn.first().click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: '14-dice-rolling.png', fullPage: true });
          console.log('   ✅ Dice rolling interface accessed');
          break;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Dice rolling test failed: ${error.message}`);
    }

    // Test moves interface
    console.log('\n⚔️ 5. Testing Moves Interface...');
    try {
      const basicMoves = ['Hack and Slash', 'Defend', 'Volley', 'Spout Lore'];

      for (const moveName of basicMoves) {
        const moveBtn = page.locator(`button:has-text("${moveName}")`);
        if (await moveBtn.isVisible({ timeout: 1000 })) {
          await moveBtn.first().click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: `15-move-${moveName.toLowerCase().replace(' ', '-')}.png`, fullPage: true });
          console.log(`   ✅ ${moveName} move tested`);

          // Try to cancel/close the move
          const cancelBtns = page.locator('button:has-text("Cancel"), button:has-text("Close"), button:has-text("×")');
          if (await cancelBtns.first().isVisible({ timeout: 1000 })) {
            await cancelBtns.first().click();
            await page.waitForTimeout(500);
          }
          break;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Moves interface test failed: ${error.message}`);
    }

    // Explore any modal dialogs or popups
    console.log('\n📋 6. Looking for additional interfaces...');
    try {
      // Look for any settings or configuration panels
      const settingsSelectors = [
        'button:has-text("Settings")',
        'button[aria-label="Settings"]',
        '.settings-button',
        '[data-testid*="settings"]'
      ];

      for (const selector of settingsSelectors) {
        const settingsBtn = page.locator(selector);
        if (await settingsBtn.isVisible({ timeout: 1000 })) {
          await settingsBtn.first().click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: '16-settings-panel.png', fullPage: true });
          console.log('   ✅ Settings panel captured');

          // Close settings
          const closeBtns = page.locator('button:has-text("Close"), button:has-text("×"), [aria-label="Close"]');
          if (await closeBtns.first().isVisible({ timeout: 1000 })) {
            await closeBtns.first().click();
          }
          break;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Settings exploration failed: ${error.message}`);
    }

    // Final comprehensive screenshot
    console.log('\n📸 7. Taking final comprehensive screenshot...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '99-final-complete-state.png', fullPage: true });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 COMPLETE APP WALKTHROUGH FINISHED!');
    console.log('='.repeat(60));
    console.log('📁 Check the following screenshot files:');
    console.log('   • 01-main-interface.png - Initial app state');
    console.log('   • 02-XX-tab.png - Navigation tab screenshots');
    console.log('   • 12-character-creation-start.png - Character creation');
    console.log('   • 13-fighter-selected.png - Fighter class selection');
    console.log('   • 14-dice-rolling.png - Dice interface');
    console.log('   • 15-move-*.png - Move system interactions');
    console.log('   • 16-settings-panel.png - Settings interface');
    console.log('   • 99-final-complete-state.png - Final state');
    console.log('\n🎲 Use these screenshots to analyze the complete app functionality!');

  } catch (error) {
    console.error('❌ Walkthrough error:', error.message);
    await page.screenshot({ path: 'walkthrough-error.png', fullPage: true });
  }

  await browser.close();
}

// Run the complete walkthrough
fullAppWalkthrough().catch(console.error);