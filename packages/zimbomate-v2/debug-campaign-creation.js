import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  console.log('🔍 DEBUGGING CAMPAIGN CREATION');
  console.log('==============================');

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    // Navigate to Campaign tab
    console.log('📂 Step 1: Navigating to Campaign tab...');
    const campaignTab = await page.locator('text=Campaign').first();
    await campaignTab.click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'debug-01-campaign-tab-loaded.png',
      fullPage: true
    });

    // Look for Create Campaign button
    console.log('🔍 Step 2: Looking for Create Campaign button...');
    const createButton = await page.locator('button:has-text("Create Campaign")');
    const isCreateButtonVisible = await createButton.isVisible();
    console.log(`Create Campaign button visible: ${isCreateButtonVisible}`);

    if (isCreateButtonVisible) {
      console.log('✅ Step 3: Clicking Create Campaign button...');
      await createButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'debug-02-modal-opened.png',
        fullPage: true
      });

      // Check if modal opened
      const modalTitle = await page.locator('text=Create New Campaign').isVisible();
      console.log(`Modal opened: ${modalTitle}`);

      if (modalTitle) {
        console.log('📝 Step 4: Testing form input...');

        // Test campaign name input
        const nameInput = await page.locator('input[placeholder*="campaign name"]');
        await nameInput.fill('Test Campaign Debug');

        // Test description textarea
        const descInput = await page.locator('textarea[placeholder*="Describe"]');
        await descInput.fill('This is a test campaign for debugging purposes.');

        await page.screenshot({
          path: 'debug-03-form-filled.png',
          fullPage: true
        });

        // Try to submit
        console.log('🚀 Step 5: Testing form submission...');
        const submitButton = await page.locator('button:has-text("Create Campaign")');
        await submitButton.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'debug-04-after-submit.png',
          fullPage: true
        });

        // Check for success or error
        const errorMessage = await page.locator('text=Failed').isVisible().catch(() => false);
        const successIndicator = await page.locator('text=Test Campaign Debug').isVisible().catch(() => false);

        console.log(`Error visible: ${errorMessage}`);
        console.log(`Success (campaign name visible): ${successIndicator}`);

      } else {
        console.log('❌ Modal did not open - checking for errors...');
      }
    } else {
      console.log('❌ Create Campaign button not found');
    }

    // Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 Browser Error:', msg.text());
      }
    });

    // Check for any JavaScript errors
    const errors = await page.evaluate(() => {
      const errors = window.console._errors || [];
      return errors;
    });

    console.log('Browser Console Errors:', errors);

  } catch (error) {
    console.error('❌ Debug test failed:', error);
    await page.screenshot({
      path: 'debug-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();