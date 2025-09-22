import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  console.log('🔍 DEBUGGING WITH CONSOLE LOGGING');
  console.log('=================================');

  // Listen for all console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]:`, error.toString());
  });

  // Listen for request failures
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]:`, request.url(), request.failure()?.errorText);
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('📂 Navigating to Campaign tab...');
    const campaignTab = await page.locator('text=Campaign').first();
    await campaignTab.click();
    await page.waitForTimeout(2000);

    console.log('🔍 Looking for Create Campaign button...');
    const createButton = await page.locator('button:has-text("Create Campaign")');
    const isVisible = await createButton.isVisible();
    console.log(`Create Campaign button visible: ${isVisible}`);

    if (isVisible) {
      console.log('🖱️ Clicking Create Campaign button...');
      await createButton.click();
      await page.waitForTimeout(3000);

      // Check if we got an error page
      const errorPage = await page.locator('text=Oops! Something went wrong').isVisible();
      if (errorPage) {
        console.log('❌ Error page detected! Clicking Show Console...');

        const showConsoleBtn = await page.locator('button:has-text("Show Console")');
        if (await showConsoleBtn.isVisible()) {
          await showConsoleBtn.click();
          await page.waitForTimeout(2000);

          await page.screenshot({
            path: 'debug-with-console.png',
            fullPage: true
          });
        }

        // Also click Show Details to get more info
        const showDetailsBtn = await page.locator('button:has-text("Show Details")');
        if (await showDetailsBtn.isVisible()) {
          await showDetailsBtn.click();
          await page.waitForTimeout(2000);

          await page.screenshot({
            path: 'debug-with-details.png',
            fullPage: true
          });
        }
      } else {
        console.log('✅ Modal opened successfully!');
        await page.screenshot({
          path: 'debug-modal-success.png',
          fullPage: true
        });
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }

  await browser.close();
})();