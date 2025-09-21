import { chromium } from 'playwright'

async function debugMovesTest() {
  console.log('🔍 DEBUG: Testing Moves Interaction')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  })

  const page = await browser.newPage()

  // Listen for console messages and errors
  page.on('console', msg => console.log('BROWSER:', msg.text()))
  page.on('error', err => console.log('ERROR:', err.message))

  try {
    await page.goto('http://localhost:3002')
    await page.waitForTimeout(2000)

    console.log('1. Navigate to Moves tab...')
    await page.locator('button:has-text("Moves")').click()
    await page.waitForTimeout(2000)

    console.log('2. Check for move buttons...')
    const moveButtons = await page.locator('button:has-text("Hack and Slash"), button:has-text("Defend"), button:has-text("Volley")').count()
    console.log(`   Found ${moveButtons} move buttons`)

    if (moveButtons > 0) {
      console.log('3. Click first available move button...')
      const firstMove = page.locator('button:has-text("Defend")').first()

      console.log('   Before click screenshot...')
      await page.screenshot({ path: 'debug-before-move-click.png' })

      await firstMove.click()
      await page.waitForTimeout(3000)

      console.log('   After click screenshot...')
      await page.screenshot({ path: 'debug-after-move-click.png' })

      console.log('4. Check for roll interface elements...')
      const rollElements = await page.locator('.dice-result, .roll-result, button:has-text("Roll"), .execute-move, .magical-glow').count()
      console.log(`   Found ${rollElements} roll interface elements`)

      console.log('5. Check for selected move interface...')
      const selectedMoveElements = await page.locator('.fixed.bottom-6, [class*="selected-move"]').count()
      console.log(`   Found ${selectedMoveElements} selected move elements`)

      console.log('6. Check visible elements on page...')
      const allVisibleElements = await page.locator('*:visible').count()
      console.log(`   Total visible elements: ${allVisibleElements}`)
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message)
    await page.screenshot({ path: 'debug-error.png' })
  }

  await browser.close()
}

debugMovesTest().catch(console.error)