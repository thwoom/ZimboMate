import { chromium } from 'playwright';

/**
 * SESSION TOOLS ERROR TEST
 * Quick test to identify what error you're seeing
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🔍 SESSION TOOLS ERROR TEST - ${timestamp}`);
  console.log('='.repeat(50));

  // Listen for all console messages and errors
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.toString()}`);
  });

  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('📋 Step 1: Loading page...');
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `error-test-01-initial-load-${timestamp}.png`,
      fullPage: true
    });

    console.log('📋 Step 2: Clicking Session Tools tab...');
    const sessionToolsTab = await page.locator('text=Session Tools').first();
    const isVisible = await sessionToolsTab.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Session Tools tab found, clicking...');
      await sessionToolsTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `error-test-02-session-tools-clicked-${timestamp}.png`,
        fullPage: true
      });

      // Check for Chronicle panel
      const chronicleHeader = await page.locator('text=Campaign Chronicle');
      const hasChronicle = await chronicleHeader.isVisible().catch(() => false);

      if (hasChronicle) {
        console.log('✅ Chronicle system loaded successfully');
      } else {
        console.log('❌ Chronicle system not found');

        // Check for old Session Tools elements
        const oldSessionTools = await page.locator('text=Session Notes');
        const hasOldTools = await oldSessionTools.isVisible().catch(() => false);

        if (hasOldTools) {
          console.log('⚠️ Old Session Tools detected - update may not have taken effect');
        }
      }

      await page.screenshot({
        path: `error-test-03-final-state-${timestamp}.png`,
        fullPage: true
      });

    } else {
      console.log('❌ Session Tools tab not found');

      await page.screenshot({
        path: `error-test-no-tab-${timestamp}.png`,
        fullPage: true
      });
    }

    console.log('✅ Error test complete');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({
      path: `error-test-exception-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();