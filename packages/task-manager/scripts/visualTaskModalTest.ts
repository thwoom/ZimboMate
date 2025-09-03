#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { resolve } from 'path';

class VisualTaskModalTester {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    console.log('🚀 Initializing Visual Puppeteer Test...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Keep visible so we can see what's happening
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Browser ready for visual testing');
  }

  async testTaskModal() {
    if (!this.page) throw new Error('Page not initialized');

    console.log('📄 Loading dashboard...');
    
    // Load the dashboard
    const dashboardPath = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
    await this.page.goto(dashboardPath, { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await this.page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for data to load
    
    console.log('📸 Taking screenshot of dashboard...');
    await this.page.screenshot({ 
      path: 'screenshots/dashboard-before-click.png',
      fullPage: true 
    });
    
    // Find and click a task
    const taskItems = await this.page.$$('.task-item');
    console.log(`📋 Found ${taskItems.length} task items`);
    
    if (taskItems.length > 0) {
      console.log('🖱️ Clicking first task...');
      await taskItems[0].click();
      
      // Wait for modal to appear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📸 Taking screenshot of modal...');
      await this.page.screenshot({ 
        path: 'screenshots/modal-opened.png',
        fullPage: true 
      });
      
      // Get modal content for analysis
      const modalInfo = await this.page.evaluate(() => {
        const modal = document.querySelector('#taskModal');
        const content = document.querySelector('#modal-content');
        
        return {
          modalVisible: modal ? window.getComputedStyle(modal).display !== 'none' : false,
          contentLength: content ? content.textContent?.length || 0 : 0,
          contentPreview: content ? content.textContent?.substring(0, 200) + '...' : 'No content'
        };
      });
      
      console.log('📊 Modal Analysis:');
      console.log(`Modal visible: ${modalInfo.modalVisible}`);
      console.log(`Content length: ${modalInfo.contentLength} characters`);
      console.log(`Content preview: ${modalInfo.contentPreview}`);
      
      return modalInfo;
    }
    
    return null;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

async function main() {
  const tester = new VisualTaskModalTester();
  
  try {
    await tester.initialize();
    const result = await tester.testTaskModal();
    
    if (result) {
      console.log('\n🎯 VISUAL TEST COMPLETE!');
      console.log('📸 Screenshots saved:');
      console.log('  - screenshots/dashboard-before-click.png');
      console.log('  - screenshots/modal-opened.png');
      console.log('\n👀 Please examine these screenshots to see what needs to be fixed!');
    }
    
  } catch (error) {
    console.error('❌ Visual test failed:', error);
  } finally {
    await tester.cleanup();
  }
}

main().catch(console.error);
