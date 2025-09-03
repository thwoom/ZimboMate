#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { resolve } from 'path';

async function testRealTaskModal() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('🚀 Testing Real Task Modal...');
    
    // Load dashboard
    const dashboardPath = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
    await page.goto(dashboardPath, { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📋 Looking for T-196 task specifically...');
    
    // Look for T-196 task specifically
    const foundT196 = await page.evaluate(() => {
      const taskItems = Array.from(document.querySelectorAll('.task-item'));
      for (const item of taskItems) {
        const text = item.textContent || '';
        if (text.includes('T-196') || text.includes('Bond & Alignment XP Tracker')) {
          // Click this task
          (item as HTMLElement).click();
          return { found: true, text: text.substring(0, 100) };
        }
      }
      return { found: false, text: 'Not found' };
    });
    
    if (foundT196.found) {
      console.log(`✅ Found and clicked T-196: ${foundT196.text}...`);
      
      // Wait for modal to open
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/t196-modal-test.png',
        fullPage: true 
      });
      
      // Analyze the modal content
      const modalContent = await page.evaluate(() => {
        const content = document.querySelector('#modal-content');
        if (!content) return { error: 'No modal content' };
        
        const text = content.textContent || '';
        const html = content.innerHTML;
        
        return {
          hasIntent: html.includes('🎯') && html.includes('What This Task Is About'),
          hasSteps: html.includes('📝') && html.includes('Implementation Steps'),
          hasAcceptance: html.includes('✅') && html.includes('Acceptance Criteria'),
          hasArtifacts: html.includes('📦') && html.includes('Expected Artifacts'),
          taskId: text.match(/Task ID:\s*([^\s]+)/)?.[1] || 'Not found',
          contentLength: text.length,
          preview: text.substring(0, 300)
        };
      });
      
      console.log('\n📊 T-196 Modal Analysis:');
      console.log(`Task ID: ${modalContent.taskId}`);
      console.log(`Content length: ${modalContent.contentLength} characters`);
      console.log(`Has Intent section: ${modalContent.hasIntent ? '✅' : '❌'}`);
      console.log(`Has Steps section: ${modalContent.hasSteps ? '✅' : '❌'}`);
      console.log(`Has Acceptance section: ${modalContent.hasAcceptance ? '✅' : '❌'}`);
      console.log(`Has Artifacts section: ${modalContent.hasArtifacts ? '✅' : '❌'}`);
      console.log(`\nContent preview: ${modalContent.preview}...`);
      
      console.log('\n📸 Screenshot saved: screenshots/t196-modal-test.png');
      
    } else {
      console.log('❌ T-196 task not found in dashboard');
      
      // Take screenshot of dashboard to see what tasks are available
      await page.screenshot({ 
        path: 'screenshots/dashboard-no-t196.png',
        fullPage: true 
      });
      
      // List all available tasks
      const availableTasks = await page.evaluate(() => {
        const taskItems = Array.from(document.querySelectorAll('.task-item'));
        return taskItems.map((item, index) => ({
          index,
          text: (item.textContent || '').substring(0, 100)
        }));
      });
      
      console.log('\n📋 Available tasks:');
      availableTasks.forEach(task => {
        console.log(`  ${task.index}: ${task.text}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testRealTaskModal().catch(console.error);
