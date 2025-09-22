import { chromium } from 'playwright';

/**
 * UX FEEDBACK TEST
 * Test the visual indicators for @mention processing
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🎨 UX FEEDBACK TEST - ${timestamp}`);
  console.log('='.repeat(50));

  try {
    console.log('📋 Loading application...');
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(3000);

    console.log('📋 Navigating to Chronicle...');
    const sessionToolsTab = await page.locator('text=Session Tools').first();
    await sessionToolsTab.click();
    await page.waitForTimeout(2000);

    console.log('📝 Step 1: Testing @ mention visual feedback...');
    const textarea = await page.locator('textarea[placeholder*="adventure"]');
    await textarea.click();
    await page.waitForTimeout(1000);

    // Test typing @ symbol
    console.log('⌨️  Typing @ symbol...');
    await textarea.type('@');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `ux-test-01-at-symbol-${timestamp}.png`,
      fullPage: true
    });

    // Test typing entity name
    console.log('⌨️  Typing entity name...');
    await textarea.type('Gandalf');
    await page.waitForTimeout(1500); // Wait for processing indicator

    await page.screenshot({
      path: `ux-test-02-processing-${timestamp}.png`,
      fullPage: true
    });

    // Check for visual indicators
    const processingIndicator = await page.locator('text=Recognizing entity');
    const hasProcessing = await processingIndicator.isVisible().catch(() => false);
    console.log(`Processing Indicator: ${hasProcessing ? '✅ Visible' : '❌ Not Found'}`);

    // Wait for processing to complete
    await page.waitForTimeout(1000);

    const successIndicator = await page.locator('text=recognized');
    const hasSuccess = await successIndicator.isVisible().catch(() => false);
    console.log(`Success Indicator: ${hasSuccess ? '✅ Visible' : '❌ Not Found'}`);

    await page.screenshot({
      path: `ux-test-03-success-${timestamp}.png`,
      fullPage: true
    });

    // Test entity suggestions
    console.log('📋 Step 2: Testing entity suggestions...');
    await textarea.fill(''); // Clear
    await textarea.type('@Gan');
    await page.waitForTimeout(1000);

    const suggestionPanel = await page.locator('[role="listbox"], .entity-suggestions');
    const hasSuggestions = await suggestionPanel.isVisible().catch(() => false);
    console.log(`Entity Suggestions: ${hasSuggestions ? '✅ Visible' : '❌ Not Found'}`);

    await page.screenshot({
      path: `ux-test-04-suggestions-${timestamp}.png`,
      fullPage: true
    });

    // Test textarea border highlight
    const textareaElement = await textarea.first();
    const classList = await textareaElement.getAttribute('class');
    const hasHighlight = classList && classList.includes('ring');
    console.log(`Textarea Highlight: ${hasHighlight ? '✅ Applied' : '❌ Not Found'}`);

    console.log('\\n📊 UX FEEDBACK TEST RESULTS:');
    console.log('==============================');
    if (hasProcessing || hasSuccess) {
      console.log('🎉 SUCCESS: Visual feedback system working!');
      console.log('✅ Users can now see that @mention processing is happening');
    } else {
      console.log('⚠️  Some visual indicators may need adjustment');
    }

  } catch (error) {
    console.error('❌ UX test failed:', error);
    await page.screenshot({
      path: `ux-test-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();