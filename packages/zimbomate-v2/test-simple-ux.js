import { chromium } from 'playwright';

/**
 * SIMPLE UX TEST
 * Simple test to verify @mention feedback works
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🎨 SIMPLE UX TEST - ${timestamp}`);

  // Listen for console messages to see our debug logs
  page.on('console', msg => {
    if (msg.text().includes('🔍') || msg.text().includes('✅')) {
      console.log(`[APP]: ${msg.text()}`);
    }
  });

  try {
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(3000);

    // Go to Chronicle
    await page.locator('text=Session Tools').first().click();
    await page.waitForTimeout(2000);

    // Click on textarea
    const textarea = await page.locator('textarea[placeholder*="adventure"]');
    await textarea.click();
    await page.waitForTimeout(500);

    console.log('🔤 Typing: @G');
    await textarea.type('@G', { delay: 200 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `simple-ux-test-${timestamp}.png`,
      fullPage: true
    });

    console.log('✅ Test complete - check console for @mention detection');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();