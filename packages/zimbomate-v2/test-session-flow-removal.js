import { chromium } from 'playwright';

/**
 * SESSION FLOW REMOVAL TEST
 * Verify that the rigid SessionFlowManager is gone and only Chronicle remains
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`🔄 SESSION FLOW REMOVAL TEST - ${timestamp}`);
  console.log('='.repeat(50));

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER ERROR]: ${msg.text()}`);
    }
  });

  try {
    console.log('📋 Loading application on port 3005...');
    await page.goto('http://localhost:3005');
    await page.waitForTimeout(3000);

    console.log('📋 Clicking Session Tools tab...');
    const sessionToolsTab = await page.locator('text=Session Tools').first();
    await sessionToolsTab.click();
    await page.waitForTimeout(2000);

    // Check for Chronicle system (should be there)
    const chronicleHeader = await page.locator('text=Campaign Chronicle');
    const hasChronicle = await chronicleHeader.isVisible().catch(() => false);
    console.log(`Chronicle System: ${hasChronicle ? '✅ Present' : '❌ Missing'}`);

    // Check for old rigid session flow elements (should be gone)
    const sessionPhases = await page.locator('text=Session Phase');
    const hasSessionPhases = await sessionPhases.isVisible().catch(() => false);
    console.log(`Session Phases: ${hasSessionPhases ? '❌ Still Present' : '✅ Removed'}`);

    const progressBars = await page.locator('[role="progressbar"]');
    const progressCount = await progressBars.count();
    console.log(`Progress Bars: ${progressCount > 0 ? `❌ Found ${progressCount}` : '✅ None Found'}`);

    const phaseButtons = await page.locator('button:has-text("Opening")');
    const hasPhaseButtons = await phaseButtons.isVisible().catch(() => false);
    console.log(`Phase Buttons: ${hasPhaseButtons ? '❌ Still Present' : '✅ Removed'}`);

    // Check for natural Chronicle elements (should be there)
    const writeTab = await page.locator('button:has-text("Write")');
    const hasWriteTab = await writeTab.isVisible().catch(() => false);
    console.log(`Write Tab: ${hasWriteTab ? '✅ Present' : '❌ Missing'}`);

    const timelineTab = await page.locator('button:has-text("Timeline")');
    const hasTimelineTab = await timelineTab.isVisible().catch(() => false);
    console.log(`Timeline Tab: ${hasTimelineTab ? '✅ Present' : '❌ Missing'}`);

    const entitiesTab = await page.locator('button:has-text("Entities")');
    const hasEntitiesTab = await entitiesTab.isVisible().catch(() => false);
    console.log(`Entities Tab: ${hasEntitiesTab ? '✅ Present' : '❌ Missing'}`);

    const quickTemplates = await page.locator('text=Quick Start Templates');
    const hasTemplates = await quickTemplates.isVisible().catch(() => false);
    console.log(`Quick Templates: ${hasTemplates ? '✅ Present' : '❌ Missing'}`);

    await page.screenshot({
      path: `session-flow-removal-test-${timestamp}.png`,
      fullPage: true
    });

    console.log('\\n📊 RESULTS SUMMARY:');
    console.log('===================');
    if (hasChronicle && !hasSessionPhases && !hasPhaseButtons && hasWriteTab) {
      console.log('🎉 SUCCESS: Rigid session flow removed, Chronicle system working');
    } else {
      console.log('⚠️  ISSUES: Some cleanup may be needed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({
      path: `session-flow-removal-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();