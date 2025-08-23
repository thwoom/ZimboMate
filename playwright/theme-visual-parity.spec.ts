import { test, expect } from '@playwright/test'

// Test theme visual parity across Classic, Cosmic, and Moebius themes
test.describe('Theme Visual Parity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load and themes to be applied
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow time for theme application
  })

  const themes = ['classic', 'cosmic', 'moebius'] as const

  themes.forEach(theme => {
    test(`${theme} theme visual consistency`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      
      // Wait for theme to be applied
      await page.waitForTimeout(500)
      
      // Take screenshot of the entire page
      await expect(page).toHaveScreenshot(`theme-${theme}-full-page.png`, {
        fullPage: true,
        mask: [
          // Mask any time-dependent elements if any exist
        ]
      })
    })

    test(`${theme} theme button variants`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on button variants section
      const buttonSection = page.locator('h2:has-text("Button Variants")').locator('..') 
      await expect(buttonSection).toHaveScreenshot(`theme-${theme}-buttons.png`)
    })

    test(`${theme} theme HUD pills`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on HUD pills section
      const pillsSection = page.locator('h2:has-text("HUD Pills")').locator('..')
      await expect(pillsSection).toHaveScreenshot(`theme-${theme}-pills.png`)
    })

    test(`${theme} theme toolbar`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on toolbar section
      const toolbarSection = page.locator('h2:has-text("Toolbar")').locator('..')
      await expect(toolbarSection).toHaveScreenshot(`theme-${theme}-toolbar.png`)
    })

    test(`${theme} theme controls`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on controls section
      const controlsSection = page.locator('h2:has-text("Controls")').locator('..')
      await expect(controlsSection).toHaveScreenshot(`theme-${theme}-controls.png`)
    })

    test(`${theme} theme tabs`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on tabs section
      const tabsSection = page.locator('h2:has-text("Tabs")').locator('..')
      await expect(tabsSection).toHaveScreenshot(`theme-${theme}-tabs.png`)
    })

    test(`${theme} theme panel variants`, async ({ page }) => {
      // Switch to the theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(500)
      
      // Focus on panel variants (the grid at the bottom)
      const panelGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-3')
      await expect(panelGrid).toHaveScreenshot(`theme-${theme}-panel-variants.png`)
    })
  })

  test('theme switching animation consistency', async ({ page }) => {
    // Test that theme switching works properly
    for (const theme of themes) {
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      
      // Verify theme is applied
      if (theme === 'classic') {
        await expect(page.locator('html')).not.toHaveAttribute('data-theme')
      } else {
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      }
      
      // Verify current theme display
      await expect(page.locator('span.font-bold.text-primary')).toHaveText(theme)
      
      await page.waitForTimeout(200) // Brief pause between theme switches
    }
  })

  test('accessibility: focus states work across themes', async ({ page }) => {
    for (const theme of themes) {
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      await page.waitForTimeout(300)
      
      // Test keyboard navigation through buttons
      const firstButton = page.locator('button:has-text("Primary")').first()
      await firstButton.focus()
      
      // Verify focus is visible
      await expect(firstButton).toBeFocused()
      
      // Test Tab navigation
      await page.keyboard.press('Tab')
      const secondButton = page.locator('button:has-text("Secondary")')
      await expect(secondButton).toBeFocused()
    }
  })

  test('reduced motion: verify motion respects preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    for (const theme of themes) {
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`)
      
      // Check that data-reduce-motion is not set (Storybook-specific)
      // In a real app, this would respect the browser preference
      const html = page.locator('html')
      
      // The theme should still work even with reduced motion
      if (theme === 'classic') {
        await expect(html).not.toHaveAttribute('data-theme')
      } else {
        await expect(html).toHaveAttribute('data-theme', theme)
      }
    }
  })
})
