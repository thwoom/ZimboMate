#!/usr/bin/env tsx

import puppeteer, { Browser, Page } from 'puppeteer';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

class PuppeteerVisualAnalyzer {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private iteration = 0;

  async initialize() {
    console.log('🚀 Initializing Puppeteer Visual Analyzer...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Browser ready for visual analysis');
  }

  async captureAndAnalyzeModal() {
    if (!this.page) throw new Error('Page not initialized');

    this.iteration++;
    console.log(`\n🔍 Visual Analysis Iteration ${this.iteration}`);
    
    // Load dashboard
    const dashboardPath = 'file://' + resolve(process.cwd(), 'dashboard.html').replace(/\\/g, '/');
    await this.page.goto(dashboardPath, { waitUntil: 'domcontentloaded' });
    
    // Wait for dashboard to load
    await this.page.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take dashboard screenshot
    const dashboardScreenshot = `screenshots/dashboard-iteration-${this.iteration}.png`;
    await this.page.screenshot({ 
      path: dashboardScreenshot,
      fullPage: true 
    });
    console.log(`📸 Dashboard screenshot: ${dashboardScreenshot}`);
    
    // Find and click T-196 specifically (the task with detailed data)
    const taskItems = await this.page.$$('.task-item');
    console.log(`📋 Found ${taskItems.length} task items`);
    
    // Look for T-196 specifically
    let targetTask = null;
    for (let i = 0; i < taskItems.length; i++) {
      const taskText = await taskItems[i].evaluate(el => el.textContent || '');
      if (taskText.includes('T-196') || taskText.includes('Bond & Alignment XP Tracker')) {
        targetTask = taskItems[i];
        console.log(`🎯 Found T-196 task: ${taskText.substring(0, 100)}...`);
        break;
      }
    }
    
    if (targetTask) {
      // Click T-196 task
      await targetTask.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (taskItems.length > 0) {
      // Fallback to first task
      console.log('⚠️ T-196 not found, clicking first available task');
      await taskItems[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log('❌ No task items found');
      return null;
    }
      
      // Take modal screenshot
      const modalScreenshot = `screenshots/modal-iteration-${this.iteration}.png`;
      await this.page.screenshot({ 
        path: modalScreenshot,
        fullPage: true 
      });
      console.log(`📸 Modal screenshot: ${modalScreenshot}`);
      
      // Analyze what's actually in the modal
      const modalAnalysis = await this.page.evaluate(() => {
        const modal = document.querySelector('#taskModal');
        const content = document.querySelector('#modal-content');
        
        if (!modal || !content) {
          return { error: 'Modal or content not found' };
        }
        
        const modalStyle = window.getComputedStyle(modal);
        const contentHTML = content.innerHTML;
        const contentText = content.textContent || '';
        
        // Check for specific sections
        const sections = {
          hasTitle: contentHTML.includes('📋') && contentHTML.includes('title'),
          hasIntent: contentHTML.includes('🎯') && contentHTML.includes('What This Task Is About'),
          hasSteps: contentHTML.includes('📝') && contentHTML.includes('Implementation Steps'),
          hasAcceptance: contentHTML.includes('✅') && contentHTML.includes('Acceptance Criteria'),
          hasArtifacts: contentHTML.includes('📦') && contentHTML.includes('Expected Artifacts'),
          hasActions: contentHTML.includes('Task Actions')
        };
        
        return {
          modalVisible: modalStyle.display !== 'none',
          modalWidth: modal.offsetWidth,
          modalHeight: modal.offsetHeight,
          contentLength: contentText.length,
          sections,
          contentPreview: contentText.substring(0, 500),
          htmlPreview: contentHTML.substring(0, 1000)
        };
      });
      
      console.log('📊 Modal Visual Analysis:');
      console.log(`  Modal visible: ${modalAnalysis.modalVisible}`);
      console.log(`  Modal size: ${modalAnalysis.modalWidth}x${modalAnalysis.modalHeight}`);
      console.log(`  Content length: ${modalAnalysis.contentLength} characters`);
      console.log('  Sections found:', modalAnalysis.sections);
      console.log(`  Content preview: ${modalAnalysis.contentPreview?.substring(0, 200)}...`);
      
      // Save analysis to file for review
      const analysisFile = `screenshots/analysis-iteration-${this.iteration}.json`;
      writeFileSync(analysisFile, JSON.stringify(modalAnalysis, null, 2));
      console.log(`📄 Analysis saved: ${analysisFile}`);
      
      return modalAnalysis;
    }
    
    return null;
  }

  async identifyIssues(analysis: any) {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    console.log('\n🔍 Identifying Visual Issues:');
    
    if (!analysis.sections.hasIntent) {
      issues.push('Missing Task Intent section');
      fixes.push('Add task intent/description section with proper styling');
    }
    
    if (!analysis.sections.hasSteps) {
      issues.push('Missing Implementation Steps section');
      fixes.push('Add implementation steps section with numbered list');
    }
    
    if (!analysis.sections.hasAcceptance) {
      issues.push('Missing Acceptance Criteria section');
      fixes.push('Add acceptance criteria section with checkmarks');
    }
    
    if (!analysis.sections.hasArtifacts) {
      issues.push('Missing Artifacts section');
      fixes.push('Add expected artifacts section with file listings');
    }
    
    if (analysis.contentLength < 500) {
      issues.push('Modal content appears sparse');
      fixes.push('Ensure all task data is being loaded and displayed');
    }
    
    if (analysis.modalWidth < 800) {
      issues.push('Modal may be too narrow for content');
      fixes.push('Increase modal width for better content display');
    }
    
    console.log('❌ Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    
    console.log('🔧 Suggested fixes:');
    fixes.forEach(fix => console.log(`  - ${fix}`));
    
    return { issues, fixes };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

async function main() {
  const analyzer = new PuppeteerVisualAnalyzer();
  
  try {
    await analyzer.initialize();
    
    console.log('🎯 Starting Visual Analysis of Task Modal...');
    const analysis = await analyzer.captureAndAnalyzeModal();
    
    if (analysis) {
      const { issues, fixes } = await analyzer.identifyIssues(analysis);
      
      console.log('\n📋 VISUAL ANALYSIS COMPLETE!');
      console.log('📸 Screenshots and analysis files saved in screenshots/ directory');
      console.log(`🔍 Found ${issues.length} issues that need attention`);
      console.log(`🔧 Generated ${fixes.length} suggested fixes`);
      
      if (issues.length === 0) {
        console.log('🎉 Task modal looks perfect!');
      } else {
        console.log('\n👀 Review the screenshots and implement the suggested fixes');
      }
    }
    
  } catch (error) {
    console.error('❌ Visual analysis failed:', error);
  } finally {
    await analyzer.cleanup();
  }
}

main().catch(console.error);
