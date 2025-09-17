import { test } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

test('homepage visual', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await argosScreenshot(page, 'homepage');
});


