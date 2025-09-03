#!/usr/bin/env tsx

import puppeteer from 'puppeteer';

async function testTaskModalRealData() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Capture all console messages
  page.on('console', (msg) => {
    console.log(`🌐 Browser: ${msg.text()}`);
  });
  
  page.on('pageerror', (error) => {
    console.error(`❌ Page Error: ${error.message}`);
  });
  
  try {
    console.log('🔍 Testing Task Modal with Real Data...');
    
    // Load dashboard via HTTP server
    await page.goto('http://localhost:8080/dashboard.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify T-196 exists and click on it
    const task196Element = await page.$('#in-progress-tasks .task-item:first-child');
    if (!task196Element) {
      throw new Error('T-196 task element not found');
    }
    
    console.log('✅ Found T-196 task element, clicking on it...');
    
    // Take screenshot before click
    await page.screenshot({ 
      path: 'screenshots/before-click-t196.png',
      fullPage: true 
    });
    
    // Click on the task
    await task196Element.click();
    
    // Wait for modal to appear
    await page.waitForSelector('#taskModal', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot after modal opens
    await page.screenshot({ 
      path: 'screenshots/after-click-t196.png',
      fullPage: true 
    });
    
    // Analyze the modal content
    const modalContent = await page.evaluate(() => {
      const modal = document.getElementById('task-modal');
      if (!modal) return { error: 'Modal not found' };
      
      const modalContent = document.getElementById('modal-content');
      if (!modalContent) return { error: 'Modal content not found' };
      
      return {
        modalVisible: !modal.classList.contains('hidden'),
        modalTitle: modal.querySelector('h2')?.textContent || 'No title',
        modalContentText: modalContent.textContent || 'No content',
        modalContentHTML: modalContent.innerHTML || 'No HTML',
        
        // Check for specific sections
        hasTitle: modalContent.textContent?.includes('Implement Bond & Alignment XP Tracker') || false,
        hasIntent: modalContent.textContent?.includes('intent') || modalContent.textContent?.includes('Intent') || false,
        hasSteps: modalContent.textContent?.includes('steps') || modalContent.textContent?.includes('Steps') || false,
        hasAcceptance: modalContent.textContent?.includes('acceptance') || modalContent.textContent?.includes('Acceptance') || false,
        hasArtifacts: modalContent.textContent?.includes('artifacts') || modalContent.textContent?.includes('Artifacts') || false,
        
        // Check for task ID
        hasTaskId: modalContent.textContent?.includes('T-196') || false
      };
    });
    
    console.log('\n📋 Modal Analysis:');
    console.log(`Modal visible: ${modalContent.modalVisible}`);
    console.log(`Modal title: ${modalContent.modalTitle}`);
    console.log(`Has T-196 ID: ${modalContent.hasTaskId}`);
    console.log(`Has Intent section: ${modalContent.hasIntent}`);
    console.log(`Has Steps section: ${modalContent.hasSteps}`);
    console.log(`Has Acceptance section: ${modalContent.hasAcceptance}`);
    console.log(`Has Artifacts section: ${modalContent.hasArtifacts}`);
    
    if (modalContent.error) {
      console.log(`❌ Error: ${modalContent.error}`);
    } else {
      console.log('\n📄 Modal Content Preview:');
      console.log(modalContent.modalContentText.substring(0, 500) + '...');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('  - before-click-t196.png');
    console.log('  - after-click-t196.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTaskModalRealData().catch(console.error);
