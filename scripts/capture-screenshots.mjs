import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureScreenshots() {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: '* { animation: none !important; transition: none !important; }'
  });

  console.log('📱 Navigating to app...');
  await page.goto('http://localhost:1420', { waitUntil: 'networkidle' });
  
  // Wait for app to be ready
  await page.waitForSelector('text=ZimboMate V2', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const outputDir = join(__dirname, '..', 'screenshots');
  
  // Capture main view
  console.log('📸 Capturing Play tab...');
  await page.screenshot({ 
    path: join(outputDir, '01-play-tab.png'),
    fullPage: true 
  });

  // Navigate through tabs
  const tabs = [
    { name: 'Character', file: '02-character-tab.png' },
    { name: 'Game Management', file: '03-game-management-tab.png' },
    { name: 'Settings', file: '04-settings-tab.png' }
  ];

  for (const tab of tabs) {
    console.log(`📸 Capturing ${tab.name} tab...`);
    const button = page.getByRole('button', { name: tab.name });
    if (await button.count() > 0) {
      await button.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: join(outputDir, tab.file),
        fullPage: true 
      });
    }
  }
  await browser.close();
  console.log('✅ Screenshots saved to screenshots/ directory');
}

captureScreenshots().catch(console.error);
