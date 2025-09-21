import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  const page = await browser.newPage();

  console.log('🧹 Clearing localStorage...');

  await page.goto('http://localhost:3001');

  // Clear all localStorage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ Storage cleared');
  });

  await page.reload();
  await page.waitForTimeout(3000);

  console.log('✅ Storage cleared and page reloaded');

  // Check what the new character data looks like
  const newCharacterData = await page.evaluate(() => {
    const charData = localStorage.getItem('zimbomate-character-storage');
    return charData ? JSON.parse(charData) : null;
  });

  if (newCharacterData?.state?.characters?.[0]) {
    const char = newCharacterData.state.characters[0];
    console.log('📊 New character attributes format:', JSON.stringify(char.attributes, null, 2));
  }

  await page.screenshot({
    path: 'after-storage-clear.png',
    fullPage: true
  });

  await browser.close();
})();