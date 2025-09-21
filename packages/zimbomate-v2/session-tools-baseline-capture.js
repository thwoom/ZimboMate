import { chromium } from 'playwright';

/**
 * SESSION TOOLS BASELINE CAPTURE
 * Captures current Session Tools page before Chronicle implementation
 */

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });
  const page = await browser.newPage();

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  console.log(`📸 SESSION TOOLS BASELINE CAPTURE - ${timestamp}`);
  console.log('='.repeat(60));

  try {
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(5000); // Wait for full app load

    console.log('📋 Capturing Session Tools baseline screenshots...');

    // 1. Navigate to Session Tools tab
    console.log('🔍 Navigating to Session Tools tab...');
    const sessionToolsTab = await page.locator('text=Session Tools').first();
    await sessionToolsTab.click();
    await page.waitForTimeout(3000);

    // 2. Session Tools main view
    await page.screenshot({
      path: `baseline-session-tools-01-main-view-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Session Tools main view baseline captured');

    // 3. Test Notes tab (should be active by default)
    const notesTab = await page.locator('button:has-text("Notes")').first();
    if (await notesTab.isVisible()) {
      await notesTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `baseline-session-tools-02-notes-tab-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Notes tab baseline captured');

      // Test adding a note
      const addNoteButton = await page.locator('button:has-text("Add Note")');
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({
          path: `baseline-session-tools-03-add-note-form-${timestamp}.png`,
          fullPage: true
        });
        console.log('✅ Add Note form baseline captured');

        // Cancel the form
        const cancelButton = await page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // 4. Test Trackers tab
    const trackersTab = await page.locator('button:has-text("Trackers")').first();
    if (await trackersTab.isVisible()) {
      await trackersTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `baseline-session-tools-04-trackers-tab-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Trackers tab baseline captured');

      // Test adding a tracker
      const addTrackerButton = await page.locator('button:has-text("Add Tracker")');
      if (await addTrackerButton.isVisible()) {
        await addTrackerButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({
          path: `baseline-session-tools-05-add-tracker-form-${timestamp}.png`,
          fullPage: true
        });
        console.log('✅ Add Tracker form baseline captured');

        // Cancel the form
        const cancelButton = await page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // 5. Test Timers tab
    const timersTab = await page.locator('button:has-text("Timers")').first();
    if (await timersTab.isVisible()) {
      await timersTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `baseline-session-tools-06-timers-tab-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ Timers tab baseline captured');

      // Test adding a timer
      const addTimerButton = await page.locator('button:has-text("Add Timer")');
      if (await addTimerButton.isVisible()) {
        await addTimerButton.click();
        await page.waitForTimeout(1500);

        await page.screenshot({
          path: `baseline-session-tools-07-add-timer-form-${timestamp}.png`,
          fullPage: true
        });
        console.log('✅ Add Timer form baseline captured');

        // Cancel the form
        const cancelButton = await page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // 6. Test History tab
    const historyTab = await page.locator('button:has-text("History")').first();
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `baseline-session-tools-08-history-tab-${timestamp}.png`,
        fullPage: true
      });
      console.log('✅ History tab baseline captured');
    }

    // 7. Mobile viewport test on Session Tools
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 12
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `baseline-session-tools-09-mobile-view-${timestamp}.png`,
      fullPage: true
    });
    console.log('✅ Session Tools mobile viewport baseline captured');

    // Summary
    console.log('\n🎉 SESSION TOOLS BASELINE CAPTURE COMPLETE');
    console.log('===========================================');
    console.log(`Timestamp: ${timestamp}`);
    console.log('Screenshots saved:');
    console.log('📷 baseline-session-tools-01-main-view - Initial Session Tools view');
    console.log('📷 baseline-session-tools-02-notes-tab - Notes tab interface');
    console.log('📷 baseline-session-tools-03-add-note-form - Add Note form');
    console.log('📷 baseline-session-tools-04-trackers-tab - Trackers tab interface');
    console.log('📷 baseline-session-tools-05-add-tracker-form - Add Tracker form');
    console.log('📷 baseline-session-tools-06-timers-tab - Timers tab interface');
    console.log('📷 baseline-session-tools-07-add-timer-form - Add Timer form');
    console.log('📷 baseline-session-tools-08-history-tab - History tab interface');
    console.log('📷 baseline-session-tools-09-mobile-view - Mobile responsive layout');

    console.log('\n📝 Next Steps:');
    console.log('1. Implement Chronicle system to replace Session Tools');
    console.log('2. Run regression test to compare new vs old interface');
    console.log('3. Ensure Chronicle provides better UX than current system');

  } catch (error) {
    console.error('❌ Session Tools baseline capture failed:', error);
    await page.screenshot({
      path: `baseline-session-tools-error-${timestamp}.png`,
      fullPage: true
    });
  }

  await browser.close();
})();