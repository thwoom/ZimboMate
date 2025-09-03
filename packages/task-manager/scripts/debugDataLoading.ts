#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { resolve } from 'path';

async function debugDataLoading() {
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
    console.log('🔍 Debugging Data Loading Process...');
    
    // Load dashboard via HTTP server to avoid CORS issues
    await page.goto('http://localhost:8080/dashboard.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 8000)); // Wait longer for data loading
    
    // Check what data is actually loaded
    const dataAnalysis = await page.evaluate(() => {
      return {
        dashboardDataExists: typeof window.dashboardData !== 'undefined',
        allTasksCount: window.dashboardData?.allTasks?.length || 0,
        inProgressTasksCount: window.dashboardData?.tasks?.length || 0,
        firstTask: window.dashboardData?.tasks?.[0] || null,
        allTasksPreview: window.dashboardData?.allTasks?.slice(0, 3).map(t => ({ id: t.id, title: t.title })) || [],
        dataProviderExists: typeof window.dashboardDataProvider !== 'undefined'
      };
    });
    
    console.log('\n📊 Data Analysis:');
    console.log(`Dashboard data exists: ${dataAnalysis.dashboardDataExists}`);
    console.log(`All tasks count: ${dataAnalysis.allTasksCount}`);
    console.log(`In-progress tasks count: ${dataAnalysis.inProgressTasksCount}`);
    console.log(`Data provider exists: ${dataAnalysis.dataProviderExists}`);
    
    if (dataAnalysis.firstTask) {
      console.log(`First task: ${dataAnalysis.firstTask.id} - ${dataAnalysis.firstTask.title}`);
    }
    
    if (dataAnalysis.allTasksPreview.length > 0) {
      console.log('All tasks preview:');
      dataAnalysis.allTasksPreview.forEach(task => {
        console.log(`  - ${task.id}: ${task.title}`);
      });
    }
    
    // Test the YAML loading directly
    const yamlTest = await page.evaluate(async () => {
      try {
        console.log('🧪 Testing YAML loading directly...');
        const response = await fetch('./ops/tasks.yaml');
        if (!response.ok) {
          return { error: `Fetch failed: ${response.status} ${response.statusText}` };
        }
        
        const yamlText = await response.text();
        console.log(`📄 YAML text length: ${yamlText.length} characters`);
        console.log(`📄 YAML preview: ${yamlText.substring(0, 200)}...`);
        
        // Test if parseYAML function exists
        if (typeof parseYAML === 'function') {
          const parsed = parseYAML(yamlText);
          return {
            success: true,
            yamlLength: yamlText.length,
            parsedTasksCount: parsed?.tasks?.length || 0,
            firstParsedTask: parsed?.tasks?.[0] || null
          };
        } else {
          return { error: 'parseYAML function not found' };
        }
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n🧪 YAML Test Results:');
    if (yamlTest.error) {
      console.log(`❌ Error: ${yamlTest.error}`);
    } else {
      console.log(`✅ Success: Loaded ${yamlTest.parsedTasksCount} tasks from ${yamlTest.yamlLength} characters`);
      if (yamlTest.firstParsedTask) {
        console.log(`First parsed task: ${yamlTest.firstParsedTask.id} - ${yamlTest.firstParsedTask.title}`);
      }
    }
    
    // Take screenshot to see what's actually displayed
    await page.screenshot({ 
      path: 'screenshots/data-loading-debug.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved: screenshots/data-loading-debug.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugDataLoading().catch(console.error);
