import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: '* { animation: none !important; transition: none !important; }',
  })
}

async function clickTopNav(page: Page, label: string) {
  const nav = page.locator('nav').first()

  const candidates = [
    nav.getByRole('button', { name: label, exact: true }),
    nav.getByRole('button', { name: new RegExp(label, 'i') }),
    nav.locator('button').filter({ hasText: label }),
    page.getByRole('button', { name: label, exact: true }),
    page.getByRole('button', { name: new RegExp(label, 'i') }),
    page.locator('button').filter({ hasText: label }),
    page.getByText(label, { exact: true }),
  ]

  for (const locator of candidates) {
    if (await locator.count()) {
      await locator.first().click()
      return
    }
  }

  throw new Error(`Navigation control "${label}" not found`)
}

const screenshotOptions = {
  fullPage: true,
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02,
}

const tabs = [
  { label: 'Play', file: 'play-tab.png' },
  { label: 'Character', file: 'character-tab.png' },
  { label: 'Dice', file: 'dice-tab.png' },
  { label: 'Game Management', file: 'game-management-tab.png' },
  { label: 'Settings', file: 'settings-tab.png' },
]

test.describe('Visual Regression - Matsu Theme', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (message) => {
      console.warn(`[browser:${message.type()}] ${message.text()}`)
    })
    page.on('pageerror', (error) => {
      console.error(`[pageerror] ${error?.message ?? error}`)
    })

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await disableAnimations(page)
    await page.waitForSelector('text=Active Theme: Matsu', { timeout: 10000 })
    await page.evaluate(() => window.scrollTo(0, 0))
  })

  for (const { label, file } of tabs) {
    test(`${label} tab matches baseline`, async ({ page }) => {
      await clickTopNav(page, label)
      await page.waitForTimeout(300)
      if (label === 'Settings') {
        await page.waitForTimeout(800)
        await page.evaluate(() => window.scrollTo(0, 0))
      }
      await expect(page).toHaveScreenshot(file, screenshotOptions)
    })
  }

  test('Button Debug tab matches baseline when available', async ({ page }) => {
    const button = page.getByRole('button', {
      name: 'Button Debug',
      exact: true,
    })
    if ((await button.count()) === 0) {
      test.skip('Button Debug tab not available in this build')
    }

    await button.first().click()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot(
      'button-debug-tab.png',
      screenshotOptions,
    )
  })
})
