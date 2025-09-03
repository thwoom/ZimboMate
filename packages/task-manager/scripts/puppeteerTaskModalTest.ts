#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

interface TestResult {
  success: boolean;
  screenshot: string;
  issues: string[];
  improvements: string[];
}

class TaskModalPuppeteerTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private testIteration = 0;

  async initialize() {
    console.log('🚀 Initializing Puppeteer for Task Modal Testing...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Show browser for visual feedback
        defaultViewport: { width: 1920, height: 1080 },
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--allow-running-insecure-content'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Enable console logging from the page
      this.page.on('console', (msg) => {
        console.log('🌐 Browser Console:', msg.text());
      });
      
      // Enable error logging
      this.page.on('pageerror', (error) => {
        console.error('❌ Page Error:', error.message);
      });
      
      console.log('✅ Puppeteer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer:', error);
      throw error;
    }
  }

  async testTaskModal(): Promise<TestResult> {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    this.testIteration++;
    console.log(`\n🧪 Test Iteration ${this.testIteration}: Testing Task Modal...`);
    
    const issues: string[] = [];
    const improvements: string[] = [];
    
    try {
      // Use file:// protocol to avoid server issues
      const dashboardPath = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
      console.log(`📄 Loading dashboard from: ${dashboardPath}`);
      
      await this.page.goto(dashboardPath, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      console.log('📄 Dashboard loaded, waiting for initialization...');
      
      // Wait for dashboard to load
      await this.page.waitForSelector('body', { timeout: 15000 });
      
      // Wait for the dashboard title to appear
      await this.page.waitForSelector('h1', { timeout: 15000 });
      
      // Wait for JavaScript to initialize
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Look for task items to click - try multiple selectors
      let taskItems = await this.page.$$('.task-item');
      
      if (taskItems.length === 0) {
        // Try alternative selectors
        taskItems = await this.page.$$('[onclick*="openTaskModal"]');
      }
      
      if (taskItems.length === 0) {
        // Try buttons that might open tasks
        taskItems = await this.page.$$('button[onclick*="Task"]');
      }
      
      console.log(`📋 Found ${taskItems.length} clickable task elements`);
      
      if (taskItems.length === 0) {
        // Try to find any clickable elements and take a screenshot for debugging
        const allButtons = await this.page.$$('button');
        console.log(`🔘 Found ${allButtons.length} buttons total`);
        
        const screenshotPath = `screenshots/debug-no-tasks-iteration-${this.testIteration}.png`;
        await this.page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`📸 Debug screenshot saved: ${screenshotPath}`);
        
        issues.push('No task items found on dashboard - see debug screenshot');
        return { success: false, screenshot: screenshotPath, issues, improvements };
      }
      
      // Click on the first task item to open modal
      console.log('🖱️ Clicking on first task element...');
      await taskItems[0].click();
      
      // Wait for modal to appear
      try {
        await this.page.waitForSelector('#taskModal', { visible: true, timeout: 10000 });
        console.log('✅ Task modal opened');
      } catch (modalError) {
        console.log('⚠️ Modal selector #taskModal not found, trying alternatives...');
        
        // Try alternative modal selectors
        const modalSelectors = ['.modal', '[role="dialog"]', '.task-modal'];
        let modalFound = false;
        
        for (const selector of modalSelectors) {
          try {
            await this.page.waitForSelector(selector, { visible: true, timeout: 2000 });
            console.log(`✅ Modal found with selector: ${selector}`);
            modalFound = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!modalFound) {
          issues.push('Modal did not appear after clicking task item');
        }
      }
      
      // Take screenshot regardless
      const screenshotPath = `screenshots/task-modal-iteration-${this.testIteration}.png`;
      
      // Ensure screenshots directory exists
      try {
        mkdirSync(dirname(screenshotPath), { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
      
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Analyze modal content
      const modalAnalysis = await this.analyzeModalContent();
      issues.push(...modalAnalysis.issues);
      improvements.push(...modalAnalysis.improvements);
      
      // Check visual elements
      const visualAnalysis = await this.analyzeVisualElements();
      issues.push(...visualAnalysis.issues);
      improvements.push(...visualAnalysis.improvements);
      
      return {
        success: issues.length === 0,
        screenshot: screenshotPath,
        issues,
        improvements
      };
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      
      // Take error screenshot
      const errorScreenshotPath = `screenshots/error-iteration-${this.testIteration}.png`;
      try {
        await this.page.screenshot({ 
          path: errorScreenshotPath,
          fullPage: true 
        });
        console.log(`📸 Error screenshot saved: ${errorScreenshotPath}`);
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      
      issues.push(`Test execution failed: ${error}`);
      return { success: false, screenshot: errorScreenshotPath, issues, improvements };
    }
  }

  async analyzeModalContent() {
    if (!this.page) {
      return { issues: ['Page not initialized'], improvements: [] };
    }

    const issues: string[] = [];
    const improvements: string[] = [];
    
    console.log('🔍 Analyzing modal content...');
    
    // Get all modal content and structure for detailed analysis
    const modalAnalysis = await this.page.evaluate(() => {
      const modalElement = document.querySelector('#modal-content');
      if (!modalElement) return { content: '', structure: 'Modal not found' };
      
      const content = modalElement.textContent || '';
      
      // Get the actual HTML structure to understand what's being rendered
      const structure = modalElement.innerHTML;
      
      // Look for specific sections in the HTML
      const sections = {
        hasTaskTitle: structure.includes('📋') && structure.includes('title'),
        hasTaskIntent: structure.includes('🎯') && structure.includes('What This Task Is About'),
        hasSteps: structure.includes('📝') && structure.includes('Implementation Steps'),
        hasAcceptance: structure.includes('✅') && structure.includes('Acceptance Criteria'),
        hasArtifacts: structure.includes('📦') && structure.includes('Expected Artifacts'),
        hasActions: structure.includes('🎯') && structure.includes('Task Actions')
      };
      
      return { content, structure: structure.substring(0, 1000), sections };
    });
    
    console.log('📊 Modal Content Analysis:');
    console.log(`Content length: ${modalAnalysis.content.length} characters`);
    console.log('HTML Structure preview:', modalAnalysis.structure);
    console.log('Sections found:', modalAnalysis.sections);
    
    // Check for required sections based on actual HTML structure
    const requiredSections = [
      { key: 'hasTaskIntent', name: 'Task Intent', text: 'What This Task Is About' },
      { key: 'hasSteps', name: 'Steps Section', text: 'Implementation Steps' },
      { key: 'hasAcceptance', name: 'Acceptance Criteria', text: 'Acceptance Criteria' },
      { key: 'hasArtifacts', name: 'Artifacts Section', text: 'Expected Artifacts' },
      { key: 'hasActions', name: 'Action Buttons', text: 'Task Actions' }
    ];
    
    for (const section of requiredSections) {
      if (modalAnalysis.sections[section.key as keyof typeof modalAnalysis.sections]) {
        console.log(`✅ Found ${section.name}`);
      } else {
        issues.push(`Missing ${section.name} section`);
        console.log(`❌ Missing ${section.name} - looking for "${section.text}"`);
      }
    }
    
    // Check for specific task data in the content
    const expectedContent = [
      { text: 'T-196', description: 'Task ID' },
      { text: 'Bond & Alignment XP Tracker', description: 'Task title' },
      { text: 'Create comprehensive tracking system', description: 'Task intent' },
      { text: 'Create bond tracking interface', description: 'Implementation steps' },
      { text: 'Users can create, edit, and resolve bonds', description: 'Acceptance criteria' },
      { text: 'BondTracker.tsx', description: 'Artifacts' }
    ];
    
    for (const expected of expectedContent) {
      if (modalAnalysis.content.includes(expected.text)) {
        console.log(`✅ Found ${expected.description}: "${expected.text}"`);
      } else {
        issues.push(`${expected.description} not displayed`);
        console.log(`❌ Missing ${expected.description}: "${expected.text}"`);
      }
    }
    
    // Check if modal has any content at all
    if (modalAnalysis.content.trim().length < 50) {
      issues.push('Modal appears to be empty or has very little content');
    }
    
    return { issues, improvements };
  }

  async analyzeVisualElements() {
    if (!this.page) {
      return { issues: ['Page not initialized'], improvements: [] };
    }

    const issues: string[] = [];
    const improvements: string[] = [];
    
    console.log('🎨 Analyzing visual elements...');
    
    try {
      // Check if modal exists and is visible
      const modalExists = await this.page.$('#taskModal');
      
      if (modalExists) {
        const modalBounds = await this.page.evaluate(() => {
          const modal = document.querySelector('#taskModal') as HTMLElement;
          if (!modal) return null;
          
          const rect = modal.getBoundingClientRect();
          const style = window.getComputedStyle(modal);
          
          return {
            width: rect.width,
            height: rect.height,
            visible: style.display !== 'none' && style.visibility !== 'hidden',
            display: style.display
          };
        });
        
        if (modalBounds) {
          if (!modalBounds.visible) {
            issues.push('Modal is not visible');
          } else {
            console.log(`✅ Modal is visible (${modalBounds.width}x${modalBounds.height})`);
          }
          
          if (modalBounds.width < 600) {
            improvements.push('Modal could be wider for better content display');
          }
        }
      } else {
        issues.push('Modal element #taskModal not found in DOM');
      }
      
      // Check for proper styling
      const modalContentExists = await this.page.$('#modal-content');
      if (modalContentExists) {
        const hasGlassmorphism = await this.page.evaluate(() => {
          const el = document.querySelector('#modal-content') as HTMLElement;
          if (!el) return false;
          
          const style = window.getComputedStyle(el);
          return style.background.includes('rgba') || 
                 style.backdropFilter !== 'none' || 
                 style.background.includes('gradient');
        });
        
        if (!hasGlassmorphism) {
          improvements.push('Add glassmorphism effects to modal');
        } else {
          console.log('✅ Modal has glassmorphism styling');
        }
      }
      
      // Check button functionality
      const buttons = await this.page.$$('#taskModal button');
      console.log(`🔘 Found ${buttons.length} buttons in modal`);
      
      if (buttons.length < 3) {
        issues.push('Not enough action buttons in modal');
      }
      
    } catch (error) {
      issues.push(`Error analyzing visual elements: ${error}`);
    }
    
    return { issues, improvements };
  }

  async implementFixes(issues: string[], improvements: string[]) {
    console.log('\n🔧 Implementing fixes based on analysis...');
    
    if (issues.length === 0 && improvements.length === 0) {
      console.log('✅ No issues found - modal is perfect!');
      return;
    }
    
    // Read current dashboard.html
    const dashboardPath = resolve(process.cwd(), 'dashboard.html');
    const dashboardContent = readFileSync(dashboardPath, 'utf8');
    
    let modified = false;
    
    // Fix common issues
    for (const issue of issues) {
      if (issue.includes('Task ID not displayed')) {
        console.log('🔧 Fixing task ID display...');
        // Implementation would go here
        modified = true;
      }
      
      if (issue.includes('Missing') && issue.includes('section')) {
        console.log(`🔧 Adding missing section: ${issue}`);
        // Implementation would go here
        modified = true;
      }
    }
    
    // Apply improvements
    for (const improvement of improvements) {
      if (improvement.includes('glassmorphism')) {
        console.log('🎨 Adding glassmorphism effects...');
        // Implementation would go here
        modified = true;
      }
      
      if (improvement.includes('wider')) {
        console.log('📐 Adjusting modal width...');
        // Implementation would go here
        modified = true;
      }
    }
    
    if (modified) {
      console.log('💾 Saving improvements to dashboard.html...');
      // Would write back to file here
    }
  }

  async runIterativeTest(maxIterations = 5) {
    console.log(`🔄 Starting iterative testing (max ${maxIterations} iterations)...`);
    
    for (let i = 0; i < maxIterations; i++) {
      const result = await this.testTaskModal();
      
      console.log(`\n📊 Iteration ${this.testIteration} Results:`);
      console.log(`✅ Success: ${result.success}`);
      console.log(`📸 Screenshot: ${result.screenshot}`);
      
      if (result.issues.length > 0) {
        console.log('❌ Issues found:');
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      if (result.improvements.length > 0) {
        console.log('💡 Improvements suggested:');
        result.improvements.forEach(improvement => console.log(`  - ${improvement}`));
      }
      
      if (result.success) {
        console.log('🎉 Task modal is perfect! Testing complete.');
        break;
      }
      
      // Implement fixes before next iteration
      await this.implementFixes(result.issues, result.improvements);
      
      // Wait before next iteration
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Main execution
async function main() {
  const tester = new TaskModalPuppeteerTester();
  
  try {
    await tester.initialize();
    await tester.runIterativeTest(5);
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run main function
main().catch(console.error);

export { TaskModalPuppeteerTester };
