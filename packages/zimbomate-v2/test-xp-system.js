import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  const page = await browser.newPage();

  let xpLogs = [];
  let rollLogs = [];
  let errorLogs = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      errorLogs.push(text);
      console.log(`❌ ERROR: ${text}`);
    }

    if (text.includes('[XP]') || text.includes('XP') || text.includes('awardFailedRoll')) {
      xpLogs.push(text);
      console.log(`💰 XP: ${text}`);
    }

    if (text.includes('rollStat') || text.includes('💔') || text.includes('Failed roll')) {
      rollLogs.push(text);
      console.log(`🎲 ROLL: ${text}`);
    }
  });

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(3000);

    console.log('🎯 Testing XP system with DEX roll...');

    // Check if XP store exists before roll
    const preRollXP = await page.evaluate(() => {
      return localStorage.getItem('zimbomate-xp-store');
    });
    console.log('📊 XP Store before roll:', preRollXP ? 'EXISTS' : 'NULL');

    // Perform dice roll
    const rollable = page.locator('[aria-label="Roll DEX stat"]');
    await rollable.click();
    await page.waitForTimeout(5000); // Wait for roll completion

    // Check XP store after roll
    const postRollXP = await page.evaluate(() => {
      const xpData = localStorage.getItem('zimbomate-xp-store');
      return xpData ? JSON.parse(xpData) : null;
    });

    console.log('\n📊 RESULTS:');
    console.log(`Roll logs: ${rollLogs.length}`);
    console.log(`XP logs: ${xpLogs.length}`);
    console.log(`Errors: ${errorLogs.length}`);
    console.log(`XP Store after roll:`, postRollXP);

    if (postRollXP && postRollXP.state && postRollXP.state.characterXP) {
      const characterIds = Object.keys(postRollXP.state.characterXP);
      console.log(`Characters with XP: ${characterIds.length}`);
      characterIds.forEach(id => {
        console.log(`  ${id}: ${postRollXP.state.characterXP[id]} XP`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();