import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);

    console.log('Taking initial screenshot...');
    await page.screenshot({ path: 'before-dice-click.png' });

    // Find and click the Dice tab
    const diceTab = await page.locator('button:has-text("Dice")').first();
    if (await diceTab.count() > 0) {
      console.log('Clicking Dice tab...');
      await diceTab.click();
      await page.waitForTimeout(3000); // Wait for errors to appear

      console.log('Taking error screenshot...');
      await page.screenshot({ path: 'after-dice-click-error.png' });

      // Check if error modal is visible
      const errorModal = await page.locator('text=Oops! Something went wrong');
      if (await errorModal.count() > 0) {
        console.log('Error modal detected');

        // Try to click "Show Details" if available
        const showDetails = await page.locator('button:has-text("Show Details")');
        if (await showDetails.count() > 0) {
          await showDetails.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'error-details.png' });
        }
      }
    } else {
      console.log('Dice tab not found');
    }

  } catch (error) {
    console.error('Script Error:', error);
  } finally {
    await browser.close();
  }
})();