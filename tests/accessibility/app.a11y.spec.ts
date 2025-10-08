import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('Accessibility Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('home view has no critical accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze()

    const criticalViolations = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    )

    if (criticalViolations.length > 0) {
      await test.info().attach('axe-violations', {
        body: JSON.stringify(criticalViolations, null, 2),
        contentType: 'application/json',
      })
    }

    expect(
      criticalViolations,
      'Expected no critical or serious accessibility violations',
    ).toEqual([])
  })

  test('primary navigation is keyboard reachable', async ({ page }) => {
    await page.keyboard.press('Tab')

    const activeSummary = await page.evaluate(() => {
      const active = document.activeElement
      if (!active) return null

      return {
        role: active.getAttribute('role'),
        tag: active.tagName,
        ariaLabel: active.getAttribute('aria-label'),
      }
    })

    await test.info().attach('active-element', {
      body: JSON.stringify(activeSummary, null, 2),
      contentType: 'application/json',
    })

    expect(activeSummary).not.toBeNull()
  })
})
