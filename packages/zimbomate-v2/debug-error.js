import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  console.log('🐛 DEBUGGING ERROR BOUNDARY');
  console.log('===========================');

  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
    consoleMessages.push(`[PAGE ERROR] ${error.message}`);
  });

  try {
    console.log('Step 1: Loading app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000); // Wait longer to see what happens

    // Take screenshot of current state
    await page.screenshot({
      path: 'debug-error-state.png',
      fullPage: true
    });

    console.log('Step 2: Checking if error boundary is visible...');
    const errorBoundary = await page.locator('text=Oops! Something went wrong').isVisible();
    console.log(`Error boundary visible: ${errorBoundary}`);

    if (errorBoundary) {
      // Try to get error details
      const showDetailsButton = await page.locator('button:has-text("Show Details")');
      if (await showDetailsButton.isVisible()) {
        await showDetailsButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'debug-error-details.png',
          fullPage: true
        });
      }

      // Try to show console
      const showConsoleButton = await page.locator('button:has-text("Show Console")');
      if (await showConsoleButton.isVisible()) {
        await showConsoleButton.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: 'debug-console-output.png',
          fullPage: true
        });
      }
    }

    console.log('\n📊 Console Messages:');
    consoleMessages.forEach(msg => console.log(`  ${msg}`));

  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({
      path: 'debug-failed.png',
      fullPage: true
    });
  }

  await browser.close();
})();