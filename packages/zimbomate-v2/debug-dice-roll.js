import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  console.log('🐛 DEBUGGING DICE ROLL FLOW');
  console.log('=============================');

  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    consoleMessages.push(text);
    console.log(text);
  });

  try {
    console.log('Step 1: Loading app...');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('Step 2: Waiting for character sheet...');
    await page.waitForSelector('text=Lyra Swiftarrow', { timeout: 10000 });

    console.log('Step 3: Looking for rollable stat...');
    const strStatButton = await page.locator('[aria-label*="Roll"][aria-label*="STR"]').first();
    const isVisible = await strStatButton.isVisible();
    console.log(`STR rollable stat visible: ${isVisible}`);

    console.log('Step 4: Clicking STR stat to roll...');
    await strStatButton.click();

    console.log('Step 5: Waiting for roll to complete...');
    await page.waitForTimeout(4000); // Wait for roll animation and processing

    console.log('Step 6: Checking dice store data...');
    const diceStoreData = await page.evaluate(() => {
      const diceData = localStorage.getItem('zimbomate-dice-store');
      return diceData ? JSON.parse(diceData) : null;
    });

    console.log('Dice store data:', JSON.stringify(diceStoreData, null, 2));

    console.log('Step 7: Checking if roll history shows up...');
    const historyVisible = await page.locator('text=No rolls yet').isVisible();
    console.log(`"No rolls yet" still visible: ${historyVisible}`);

    // Take screenshot of current state
    await page.screenshot({
      path: 'debug-dice-roll-after.png',
      fullPage: true
    });

    console.log('\n📊 Console Messages from last 10:');
    consoleMessages.slice(-10).forEach(msg => console.log(`  ${msg}`));

  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({
      path: 'debug-dice-roll-error.png',
      fullPage: true
    });
  }

  await browser.close();
})();