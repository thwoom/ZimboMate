import { chromium } from 'playwright';

async function runDungeonWorldPlaythrough() {
  console.log('🎲 Starting Dungeon World Playthrough Test...');

  const browser = await chromium.launch({
    headless: false, // Show browser so we can see what's happening
    slowMo: 1000 // Slow down actions for better visibility
  });

  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('📱 Navigating to ZimboMate V2...');
    await page.goto('http://localhost:3002');

    // Wait for app to load
    await page.waitForTimeout(2000);

    // Take a screenshot of the main interface
    console.log('📸 Taking screenshot of main interface...');
    await page.screenshot({ path: 'main-interface.png', fullPage: true });

    // Look for character creation or character sheet elements
    console.log('🔍 Looking for UI elements...');

    // Check if there's a character creation button
    const createCharacterButton = await page.locator('button:has-text("Create Character"), button:has-text("New Character"), [data-testid*="create"], [data-testid*="character"]').first();

    if (await createCharacterButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found character creation element!');
      await createCharacterButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'character-creation.png', fullPage: true });

      // Look for Fighter class selection
      const fighterOption = await page.locator('text=Fighter, button:has-text("Fighter"), [data-class="Fighter"]').first();
      if (await fighterOption.isVisible({ timeout: 3000 })) {
        console.log('⚔️ Found Fighter class option!');
        await fighterOption.click();
      }

    } else {
      // Maybe we're already on a character sheet or different interface
      console.log('🏠 Looking for existing character interface...');

      // Check for common RPG UI elements
      const hpElement = await page.locator('text=/HP|Hit Points|Health/i, [data-testid*="hp"], .hp').first();
      if (await hpElement.isVisible({ timeout: 3000 })) {
        console.log('❤️ Found HP element!');
      }

      const moveElement = await page.locator('text=/Hack and Slash|Volley|Defend/, button:has-text("Hack"), [data-move]').first();
      if (await moveElement.isVisible({ timeout: 3000 })) {
        console.log('⚔️ Found move element!');
      }

      const xpElement = await page.locator('text=/XP|Experience/, [data-testid*="xp"], .xp').first();
      if (await xpElement.isVisible({ timeout: 3000 })) {
        console.log('⭐ Found XP element!');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-state.png', fullPage: true });

    console.log('✅ Playthrough test completed successfully!');
    console.log('📁 Screenshots saved: main-interface.png, character-creation.png, final-state.png');

  } catch (error) {
    console.error('❌ Error during playthrough:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  }

  await browser.close();
}

// Run the test
runDungeonWorldPlaythrough().catch(console.error);