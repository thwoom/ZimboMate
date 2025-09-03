#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { resolve } from 'path';

class ScreenshotAnalyzer {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async analyzeCurrentModal() {
    if (!this.page) throw new Error('Page not initialized');

    // Load dashboard
    const dashboardPath = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
    await this.page.goto(dashboardPath, { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await this.page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📋 Looking for task items...');
    
    // Get all task items and their text
    const taskItems = await this.page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.task-item'));
      return items.map((item, index) => ({
        index,
        text: item.textContent?.trim() || '',
        onclick: item.getAttribute('onclick') || ''
      }));
    });
    
    console.log('📋 Found task items:');
    taskItems.forEach(item => {
      console.log(`  ${item.index}: ${item.text.substring(0, 100)}...`);
    });
    
    if (taskItems.length > 0) {
      console.log(`\n🖱️ Clicking first task item...`);
      
      // Click the first task item
      const firstTaskSelector = '.task-item';
      await this.page.click(firstTaskSelector);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot
      await this.page.screenshot({ 
        path: 'screenshots/current-modal-analysis.png',
        fullPage: true 
      });
      
      // Analyze what's actually visible in the modal
      const modalContent = await this.page.evaluate(() => {
        const modal = document.querySelector('#taskModal');
        const content = document.querySelector('#modal-content');
        
        if (!modal || !content) {
          return { error: 'Modal not found' };
        }
        
        // Get the actual visible text content
        const visibleText = content.textContent || '';
        
        // Get the HTML structure
        const htmlContent = content.innerHTML;
        
        // Check what sections are actually present
        const sections = {
          title: htmlContent.includes('📋') ? 'Found' : 'Missing',
          intent: htmlContent.includes('🎯') && htmlContent.includes('What This Task Is About') ? 'Found' : 'Missing',
          steps: htmlContent.includes('📝') && htmlContent.includes('Implementation Steps') ? 'Found' : 'Missing',
          acceptance: htmlContent.includes('✅') && htmlContent.includes('Acceptance Criteria') ? 'Found' : 'Missing',
          artifacts: htmlContent.includes('📦') && htmlContent.includes('Expected Artifacts') ? 'Found' : 'Missing',
          actions: htmlContent.includes('Task Actions') ? 'Found' : 'Missing'
        };
        
        return {
          visibleText: visibleText.substring(0, 1000),
          sections,
          taskId: visibleText.match(/Task ID:\s*([^\s]+)/)?.[1] || 'Not found',
          taskTitle: visibleText.match(/📋\s*([^\n]+)/)?.[1] || 'Not found'
        };
      });
      
      console.log('\n📊 MODAL CONTENT ANALYSIS:');
      console.log(`Task ID: ${modalContent.taskId}`);
      console.log(`Task Title: ${modalContent.taskTitle}`);
      console.log('\nSections Status:');
      Object.entries(modalContent.sections).forEach(([section, status]) => {
        const icon = status === 'Found' ? '✅' : '❌';
        console.log(`  ${icon} ${section}: ${status}`);
      });
      
      console.log('\nVisible Text Preview:');
      console.log(modalContent.visibleText);
      
      return modalContent;
    }
    
    return null;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function main() {
  const analyzer = new ScreenshotAnalyzer();
  
  try {
    await analyzer.initialize();
    console.log('🔍 Analyzing what\'s actually visible in the modal...\n');
    
    const result = await analyzer.analyzeCurrentModal();
    
    if (result) {
      console.log('\n📸 Screenshot saved: screenshots/current-modal-analysis.png');
      console.log('👀 This shows exactly what the user sees in the modal');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

main().catch(console.error);
