#!/usr/bin/env tsx

import puppeteer from 'puppeteer';

async function testRealDataFlow() {
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
    console.log('🔍 Testing Real Data Flow...');
    
    // Load dashboard via HTTP server
    await page.goto('http://localhost:8080/dashboard.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test the data flow step by step
    const dataFlowTest = await page.evaluate(() => {
      return {
        // Check if dashboardData exists
        dashboardDataExists: typeof window.dashboardData !== 'undefined',
        
        // Check what's in dashboardData
        dashboardDataKeys: window.dashboardData ? Object.keys(window.dashboardData) : [],
        
        // Check if allTasks exists and has content
        allTasksExists: window.dashboardData?.allTasks ? true : false,
        allTasksCount: window.dashboardData?.allTasks?.length || 0,
        
        // Check if tasks exists and has content
        tasksExists: window.dashboardData?.tasks ? true : false,
        tasksCount: window.dashboardData?.tasks?.length || 0,
        
        // Check what's actually displayed in the UI
        inProgressTasksDisplayed: document.querySelectorAll('#in-progress-tasks .task-item').length,
        inProgressTasksText: Array.from(document.querySelectorAll('#in-progress-tasks .task-item')).map(el => el.textContent?.trim()).filter(Boolean),
        
        // Check if the real data provider was used
        dataProviderUsed: window.dashboardDataProvider ? true : false
      };
    });
    
    console.log('\n📊 Data Flow Analysis:');
    console.log(`Dashboard data exists: ${dataFlowTest.dashboardDataExists}`);
    console.log(`Dashboard data keys: ${dataFlowTest.dashboardDataKeys.join(', ')}`);
    console.log(`All tasks exists: ${dataFlowTest.allTasksExists}`);
    console.log(`All tasks count: ${dataFlowTest.allTasksCount}`);
    console.log(`Tasks exists: ${dataFlowTest.tasksExists}`);
    console.log(`Tasks count: ${dataFlowTest.tasksCount}`);
    console.log(`In-progress tasks displayed: ${dataFlowTest.inProgressTasksDisplayed}`);
    console.log(`Data provider used: ${dataFlowTest.dataProviderUsed}`);
    
    if (dataFlowTest.inProgressTasksText.length > 0) {
      console.log('\n📋 Tasks displayed in UI:');
      dataFlowTest.inProgressTasksText.forEach((text, index) => {
        console.log(`  ${index + 1}. ${text}`);
      });
    }
    
    // Take screenshot to see current state
    await page.screenshot({ 
      path: 'screenshots/data-flow-test.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: screenshots/data-flow-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testRealDataFlow().catch(console.error);
