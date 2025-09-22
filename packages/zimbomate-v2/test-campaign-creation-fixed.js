import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  console.log('🔍 TESTING FIXED CAMPAIGN CREATION');
  console.log('===================================');

  // Listen for console messages and errors
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
    await page.waitForTimeout(3000);

    // Navigate to Campaign tab
    console.log('📂 Step 1: Navigating to Campaign tab...');
    const campaignTab = await page.locator('text=Campaign').first();
    await campaignTab.click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'test-01-campaign-tab-loaded.png',
      fullPage: true
    });

    // Click the main Create Campaign button (not the submit button)
    console.log('🔍 Step 2: Looking for main Create Campaign button...');
    const createButton = await page.getByRole('button', { name: 'Create Campaign' }).first();
    const isCreateButtonVisible = await createButton.isVisible();
    console.log(`Create Campaign button visible: ${isCreateButtonVisible}`);

    if (isCreateButtonVisible) {
      console.log('✅ Step 3: Clicking Create Campaign button...');
      await createButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'test-02-modal-opened.png',
        fullPage: true
      });

      // Check if modal opened
      const modalTitle = await page.locator('text=Create New Campaign').isVisible();
      console.log(`Modal opened: ${modalTitle}`);

      if (modalTitle) {
        console.log('📝 Step 4: Testing form input...');

        // Test campaign name input
        const nameInput = await page.locator('input[placeholder*="campaign name"]');
        await nameInput.fill('Test Campaign Fixed');

        // Test description textarea
        const descInput = await page.locator('textarea[placeholder*="Describe"]');
        await descInput.fill('This campaign tests the fixed modal functionality.');

        await page.screenshot({
          path: 'test-03-form-filled.png',
          fullPage: true
        });

        // Try to submit using the submit button specifically
        console.log('🚀 Step 5: Testing form submission...');
        const submitButton = await page.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'test-04-after-submit.png',
          fullPage: true
        });

        // Check for success - modal should close and campaign should appear
        const modalStillOpen = await page.locator('text=Create New Campaign').isVisible();
        const campaignCreated = await page.locator('text=Test Campaign Fixed').isVisible();

        console.log(`Modal still open: ${modalStillOpen}`);
        console.log(`Campaign created: ${campaignCreated}`);

        if (!modalStillOpen && campaignCreated) {
          console.log('✅ SUCCESS: Campaign creation workflow complete!');
        } else {
          console.log('⚠️ PARTIAL SUCCESS: Modal opened but submission may have issues');
        }

      } else {
        console.log('❌ Modal did not open');
      }
    } else {
      console.log('❌ Create Campaign button not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({
      path: 'test-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();