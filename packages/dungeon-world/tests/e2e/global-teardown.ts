import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Clean up any test data, temporary files, or resources
  // This runs after all tests have completed

  console.log('🧹 Global teardown completed');
}

export default globalTeardown;
