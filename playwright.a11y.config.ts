import { defineConfig, devices } from '@playwright/test'
import baseConfig from './playwright.config'

const chromeProject =
  Array.isArray(baseConfig.projects) && baseConfig.projects.length > 0
    ? baseConfig.projects
        .filter((project) => project.name === 'Desktop Chrome')
        .map((project) => ({ ...project }))
    : [
        {
          name: 'Desktop Chrome',
          use: { ...devices['Desktop Chrome'] },
        },
      ]

export default defineConfig({
  ...baseConfig,
  testDir: './tests/accessibility',
  testMatch: ['**/*.spec.@(ts|tsx|js)'],
  projects: chromeProject,
})
