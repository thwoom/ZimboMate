import { defineConfig, devices } from '@playwright/test';

const DEV_SERVER_PORT = 3000;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [
    process.env.CI ? ['dot'] : ['list'],
    [
      '@argos-ci/playwright/reporter',
      {
        uploadToArgos: !!process.env.CI,
        token: process.env.ARGOS_TOKEN
      }
    ]
  ],
  use: {
    baseURL: `http://localhost:${DEV_SERVER_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${DEV_SERVER_PORT}`,
    timeout: 120000,
    reuseExistingServer: !process.env.CI
  }
});


