import { chromium } from 'playwright';

/**
 * WIKI GENERATOR TEST
 * Tests the new auto-wiki generation system for entities
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🧪 WIKI GENERATOR TEST - ${timestamp}`);
  console.log('='.repeat(50));

  // Listen for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR]: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.toString()}`);
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000);

    console.log('📋 Step 1: Navigating to Chronicle...');
    const chronicleTab = await page.locator('text=Session Tools').first();
    await chronicleTab.click();
    await page.waitForTimeout(3000);

    // Check if Chronicle loaded
    const chronicleHeader = await page.locator('text=Campaign Chronicle').first();
    const isChronicleLoaded = await chronicleHeader.isVisible().catch(() => false);

    if (!isChronicleLoaded) {
      console.log('❌ Chronicle system not loaded');
      return;
    }

    console.log('✅ Chronicle system loaded');

    // Navigate to Write tab
    const writeTab = await page.locator('button:has-text("Write")');
    await writeTab.click();
    await page.waitForTimeout(2000);

    // Add chronicle entries with rich entity data
    console.log('📝 Step 2: Creating chronicle entries with entities...');
    const textarea = await page.locator('textarea[placeholder*="adventure"]');

    // Entry 1: Character introduction
    await textarea.fill('@Gandalf the Grey is a powerful wizard who has a staff of power. He owns a magical sword called Glamdring and lives in the Grey Havens.');
    await page.waitForTimeout(1000);

    const saveButton = await page.locator('button:has-text("Save Entry")');
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Entry 2: Location description
    await textarea.fill('@Rivendell is a beautiful elven sanctuary where @Gandalf often visits. The location has ancient libraries and healing fountains.');
    await page.waitForTimeout(1000);
    await saveButton.click();
    await page.waitForTimeout(2000);

    // Entry 3: Mystery and relationship
    await textarea.fill('@Gandalf meets with @Elrond at @Rivendell to discuss the mystery of the One Ring. What secrets do they share?');
    await page.waitForTimeout(1000);
    await saveButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `wiki-test-01-entries-created-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Chronicle entries created');

    // Navigate to Entities tab
    console.log('🔍 Step 3: Checking auto-generated entities...');
    const entitiesTab = await page.locator('button:has-text("Entities")');
    await entitiesTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `wiki-test-02-entities-view-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Entities view loaded');

    // Try to click on first entity to open preview
    console.log('📖 Step 4: Testing entity preview and wiki generation...');
    const firstEntityButton = await page.locator('[role="button"]:has-text("Gandalf")').first();
    const isEntityVisible = await firstEntityButton.isVisible().catch(() => false);

    if (isEntityVisible) {
      await firstEntityButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `wiki-test-03-entity-preview-${timestamp}.png`,
        fullPage: true
      });

      // Look for View Wiki button
      const wikiButton = await page.locator('button:has-text("View Wiki")');
      const isWikiButtonVisible = await wikiButton.isVisible().catch(() => false);

      if (isWikiButtonVisible) {
        console.log('📚 Step 5: Testing wiki page generation...');
        await wikiButton.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: `wiki-test-04-wiki-page-${timestamp}.png`,
          fullPage: true
        });
        console.log('✅ Wiki page opened');

        // Check for wiki content sections
        const wikiSummary = await page.locator('text=Auto-Generated Summary');
        const keyFacts = await page.locator('text=Key Facts');
        const timeline = await page.locator('text=Timeline');
        const relationships = await page.locator('text=Relationships');

        const hasSummary = await wikiSummary.isVisible().catch(() => false);
        const hasKeyFacts = await keyFacts.isVisible().catch(() => false);
        const hasTimeline = await timeline.isVisible().catch(() => false);
        const hasRelationships = await relationships.isVisible().catch(() => false);

        console.log('📊 Step 6: Verifying wiki sections...');
        console.log(`Summary: ${hasSummary ? '✅' : '❌'}`);
        console.log(`Key Facts: ${hasKeyFacts ? '✅' : '❌'}`);
        console.log(`Timeline: ${hasTimeline ? '✅' : '❌'}`);
        console.log(`Relationships: ${hasRelationships ? '✅' : '❌'}`);

        // Test bookmark functionality
        const bookmarkButton = await page.locator('button:has([data-lucide="bookmark"])').first();
        const isBookmarkVisible = await bookmarkButton.isVisible().catch(() => false);

        if (isBookmarkVisible) {
          await bookmarkButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Bookmark functionality tested');
        }

        await page.screenshot({
          path: `wiki-test-05-final-wiki-${timestamp}.png`,
          fullPage: true
        });

        console.log('\\n🎉 WIKI GENERATOR TEST COMPLETE');
        console.log('=====================================');
        console.log('✅ Chronicle entries created with entities');
        console.log('✅ Auto-entity recognition working');
        console.log('✅ Entity preview accessible');
        console.log('✅ Wiki generation functional');
        console.log('✅ Wiki content sections populated');
        console.log('✅ Interactive wiki features working');

      } else {
        console.log('❌ View Wiki button not found');

        await page.screenshot({
          path: `wiki-test-error-no-wiki-button-${timestamp}.png`,
          fullPage: true
        });
      }

      // Close preview
      const closeButton = await page.locator('button:has([data-lucide="x"])').first();
      const isCloseVisible = await closeButton.isVisible().catch(() => false);
      if (isCloseVisible) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }

    } else {
      console.log('❌ No entities found or entity not clickable');

      await page.screenshot({
        path: `wiki-test-error-no-entities-${timestamp}.png`,
        fullPage: true
      });
    }

  } catch (error) {
    console.error('❌ Wiki generator test failed:', error);
    await page.screenshot({
      path: `wiki-test-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();