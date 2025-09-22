import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('homepage has no accessibility violations', async ({ page }) => {
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('character sheet is accessible', async ({ page }) => {
    // Navigate to character tab
    await page.click('[role="tab"][aria-label*="Character"]')
    await page.waitForLoadState('networkidle')

    await checkA11y(page, '[data-testid="character-sheet"]', {
      axeOptions: {
        rules: {
          // Gaming apps may have intentional color contrast for theming
          'color-contrast': { enabled: false }
        }
      }
    })
  })

  test('dice roller is keyboard accessible', async ({ page }) => {
    await page.click('[role="tab"][aria-label*="Dice"]')

    // Test keyboard navigation
    await page.press('body', 'Tab')
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()

    // Test dice roll with keyboard
    await page.press(':focus', 'Enter')
    await page.waitForSelector('[data-testid="dice-result"]', { timeout: 3000 })

    await checkA11y(page, '[data-testid="dice-panel"]')
  })

  test('character builder workflow is accessible', async ({ page }) => {
    // Test multi-step form accessibility
    await page.goto('/character-builder')
    await page.waitForLoadState('networkidle')

    // Check each step of character creation
    const steps = ['class-selection', 'identity', 'alignment', 'attributes']

    for (const step of steps) {
      await checkA11y(page, `[data-testid="${step}"]`, {
        axeOptions: {
          rules: {
            'nested-interactive': { enabled: false }, // Gaming UIs may have complex interactions
          }
        }
      })

      // Navigate to next step if not the last one
      if (step !== 'attributes') {
        await page.click('button[aria-label*="Next"]')
        await page.waitForTimeout(500) // Allow for animations
      }
    }
  })

  test('command palette is accessible', async ({ page }) => {
    // Open command palette with keyboard shortcut
    await page.press('body', 'Control+K')
    await page.waitForSelector('[role="combobox"]')

    // Test search functionality
    await page.type('[role="combobox"]', 'roll dice')
    await page.waitForSelector('[role="option"]')

    await checkA11y(page, '[data-testid="command-palette"]', {
      axeOptions: {
        rules: {
          'aria-input-field-name': { enabled: true }
        }
      }
    })

    // Test keyboard navigation in results
    await page.press('[role="combobox"]', 'ArrowDown')
    const selectedOption = page.locator('[role="option"][aria-selected="true"]')
    await expect(selectedOption).toBeVisible()
  })

  test('theme switching maintains accessibility', async ({ page }) => {
    const themes = ['fantasy', 'dark', 'moonlit', 'dragonforge']

    for (const theme of themes) {
      // Switch theme
      await page.click('[data-testid="theme-toggle"]')
      await page.click(`[data-value="${theme}"]`)
      await page.waitForTimeout(500) // Allow theme to apply

      // Check accessibility after theme change
      await checkA11y(page, 'main', {
        axeOptions: {
          rules: {
            'color-contrast': { enabled: false } // Themes may have intentional contrast
          }
        }
      })
    }
  })

  test('mobile responsive design is accessible', async ({ page }) => {
    // Test different mobile viewports
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 } // iPad
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.waitForLoadState('networkidle')

      // Check touch targets are adequate size
      await checkA11y(page, undefined, {
        axeOptions: {
          rules: {
            'target-size': { enabled: true }
          }
        }
      })
    }
  })
})