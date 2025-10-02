import type { ReporterDescription } from '@playwright/test'
import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const DEV_SERVER_PORT = 3001
const isCI = !!process.env.CI
const runAllDevices = isCI || process.env.PW_DEVICES === 'all'
const webCommand = process.env.PW_USE_DEV_SERVER
  ? `npm run dev -- --port ${DEV_SERVER_PORT} --strictPort`
  : `npm run build && npm run preview -- --port ${DEV_SERVER_PORT} --strictPort`

const reporters: ReporterDescription[] = [isCI ? ['dot'] : ['list']]

if (process.env.ARGOS_TOKEN) {
  reporters.push([
    '@argos-ci/playwright/reporter',
    {
      uploadToArgos: isCI,
      token: process.env.ARGOS_TOKEN,
    },
  ])
}

const desktopMatrix = [
  {
    name: 'Desktop Chrome',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'Desktop Firefox',
    use: { ...devices['Desktop Firefox'] },
  },
]

const extendedMatrix = [
  {
    name: 'Desktop Safari',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'Mobile Safari',
    use: { ...devices['iPhone 12'] },
  },
  {
    name: 'Tablet iPad',
    use: { ...devices['iPad Pro'] },
  },
  {
    name: 'Large Desktop',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1920, height: 1080 },
    },
  },
  {
    name: 'Gaming Laptop',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1366, height: 768 },
    },
  },
]

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: reporters,
  fullyParallel: false,
  maxFailures: 1,
  workers: isCI ? undefined : 2,
  use: {
    baseURL: `http://localhost:${DEV_SERVER_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 20000,
  },
  projects: runAllDevices ? [...desktopMatrix, ...extendedMatrix] : desktopMatrix,
  webServer: {
    command: webCommand,
    url: `http://localhost:${DEV_SERVER_PORT}`,
    timeout: 180000,
    reuseExistingServer: !isCI,
  },
})
