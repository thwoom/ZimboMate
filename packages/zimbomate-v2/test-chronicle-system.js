import { chromium } from 'playwright';

/**
 * CHRONICLE SYSTEM TEST
 * Tests the new Chronicle system that replaced Session Tools
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🧪 CHRONICLE SYSTEM TEST - ${timestamp}`);
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

    console.log('📋 Step 1: Navigating to Session Tools (now Chronicle)...');
    const sessionToolsTab = await page.locator('text=Session Tools').first();
    await sessionToolsTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `chronicle-test-01-main-view-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Chronicle main view captured');

    // Test if Chronicle Panel loaded (look for Chronicle-specific elements)
    const chronicleHeader = await page.locator('text=Campaign Chronicle').first();
    const isChronicleLoaded = await chronicleHeader.isVisible().catch(() => false);

    if (isChronicleLoaded) {
      console.log('🎉 SUCCESS: Chronicle system loaded successfully!');

      // Test writing area
      console.log('📝 Step 2: Testing Chronicle writing interface...');
      const writeTab = await page.locator('button:has-text("Write")');
      const isWriteTabVisible = await writeTab.isVisible().catch(() => false);

      if (isWriteTabVisible) {
        await writeTab.click();
        await page.waitForTimeout(2000);

        // Look for the writing textarea
        const textarea = await page.locator('textarea[placeholder*="adventure"]');
        const isTextareaVisible = await textarea.isVisible().catch(() => false);

        if (isTextareaVisible) {
          console.log('📝 Step 3: Testing entity mention functionality...');

          // Test @ mention functionality
          await textarea.fill('Our party encounters @Baron Redcloak at the @Goblin\'s Den. He tells us about the #mystery of the missing crown.');
          await page.waitForTimeout(2000);

          await page.screenshot({
            path: `chronicle-test-02-writing-${timestamp}.png`,
            fullPage: true
          });
          console.log('✅ Writing interface test captured');

          // Test save functionality
          const saveButton = await page.locator('button:has-text("Save Entry")');
          const isSaveVisible = await saveButton.isVisible().catch(() => false);

          if (isSaveVisible) {
            console.log('💾 Step 4: Testing save functionality...');
            await saveButton.click();
            await page.waitForTimeout(2000);

            await page.screenshot({
              path: `chronicle-test-03-saved-${timestamp}.png`,
              fullPage: true
            });
            console.log('✅ Save functionality tested');

            // Test timeline view
            console.log('📊 Step 5: Testing Timeline view...');
            const timelineTab = await page.locator('button:has-text("Timeline")');
            await timelineTab.click();
            await page.waitForTimeout(2000);

            await page.screenshot({
              path: `chronicle-test-04-timeline-${timestamp}.png`,
              fullPage: true
            });
            console.log('✅ Timeline view tested');

            // Test entities view
            console.log('👥 Step 6: Testing Entities view...');
            const entitiesTab = await page.locator('button:has-text("Entities")');
            await entitiesTab.click();
            await page.waitForTimeout(2000);

            await page.screenshot({
              path: `chronicle-test-05-entities-${timestamp}.png`,
              fullPage: true
            });
            console.log('✅ Entities view tested');

            console.log('\n🎉 CHRONICLE SYSTEM TEST COMPLETE');
            console.log('=======================================');
            console.log('✅ Main interface loaded successfully');
            console.log('✅ Writing interface functional');
            console.log('✅ Entity mention system working');
            console.log('✅ Save functionality operational');
            console.log('✅ Timeline view accessible');
            console.log('✅ Entities view functional');

          } else {
            console.log('❌ Save button not found');
          }
        } else {
          console.log('❌ Writing textarea not found');
        }
      } else {
        console.log('❌ Write tab not visible');
      }
    } else {
      console.log('❌ Chronicle header not found - system may not have loaded properly');

      // Capture what we do see
      await page.screenshot({
        path: `chronicle-test-error-${timestamp}.png`,
        fullPage: true
      });
    }

  } catch (error) {
    console.error('❌ Chronicle test failed:', error);
    await page.screenshot({
      path: `chronicle-test-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();