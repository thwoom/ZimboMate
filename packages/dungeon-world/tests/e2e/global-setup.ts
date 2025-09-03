import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Launch browser and create a new context
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the app and wait for it to be ready
  await page.goto(baseURL!);

  // Wait for the app to be fully loaded
  await page.waitForLoadState('networkidle');

  // Optional: Set up any authentication or initial state here
  // For example, if you need to log in or set up test data

  // Close browser
  await browser.close();
}

export default globalSetup;
