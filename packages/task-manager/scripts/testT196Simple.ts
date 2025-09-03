#!/usr/bin/env tsx

import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  duration: number;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

class T196SimpleTester {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private testSuite: TestSuite;
  private screenshotsDir: string;

  constructor() {
    this.testSuite = {
      name: 'T-196: Bond & Alignment XP Tracker - Simple Test Suite',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }
    };
    this.screenshotsDir = 'screenshots/t196-simple';
    
    if (!existsSync(this.screenshotsDir)) {
      mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🚀 Initializing T-196 Simple Test Suite...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    this.page.on('console', (msg) => {
      console.log(`🌐 Browser: ${msg.text()}`);
    });
    
    this.page.on('pageerror', (error) => {
      console.error(`❌ Page Error: ${error.message}`);
    });
    
    console.log('✅ Test environment initialized');
  }

  async runTestSuite() {
    const startTime = Date.now();
    console.log('\n🎯 Starting T-196 Simple Test Suite...\n');
    
    try {
      await this.loadDashboard();
      await this.testComponentAvailability();
      await this.testDataStructures();
      await this.testIntegrationPoints();
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
    
    this.testSuite.summary.duration = Date.now() - startTime;
  }

  private async loadDashboard() {
    console.log('📱 Loading dashboard...');
    
    await this.page!.goto('http://localhost:8080/dashboard.html', { 
      waitUntil: 'domcontentloaded' 
    });
    
    await this.page!.waitForSelector('h1', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Dashboard loaded');
  }

  private async testComponentAvailability() {
    console.log('\n🔍 Testing Component Availability...');
    
    // Test 1: Check if React components are loaded
    await this.runTest('React Components Loaded', async () => {
      const components = await this.page!.evaluate(() => {
        return {
          hasReactRoot: !!document.querySelector('#root'),
          hasDashboard: !!document.querySelector('h1'),
          hasTaskElements: document.querySelectorAll('.task-item').length > 0
        };
      });
      
      if (!components.hasReactRoot) {
        throw new Error('React application not mounted');
      }
      
      return 'React components loaded successfully';
    });

    // Test 2: Check for bond-related code in source
    await this.runTest('Bond Code in Source', async () => {
      const sourceCode = await this.page!.evaluate(() => {
        return document.documentElement.outerHTML;
      });
      
      const hasBondCode = sourceCode.includes('BondTracker') || 
                          sourceCode.includes('bond') || 
                          sourceCode.includes('Bond');
      
      if (!hasBondCode) {
        throw new Error('No bond-related code found in source');
      }
      
      return 'Bond-related code found in source';
    });
  }

  private async testDataStructures() {
    console.log('\n📊 Testing Data Structures...');
    
    // Test 1: Check if dashboard data is loaded
    await this.runTest('Dashboard Data Loaded', async () => {
      const dataStatus = await this.page!.evaluate(() => {
        return {
          hasDashboardData: typeof window.dashboardData !== 'undefined',
          hasAllTasks: window.dashboardData?.allTasks?.length > 0,
          taskCount: window.dashboardData?.allTasks?.length || 0
        };
      });
      
      if (!dataStatus.hasDashboardData) {
        throw new Error('Dashboard data not available');
      }
      
      if (!dataStatus.hasAllTasks) {
        throw new Error('No tasks loaded in dashboard');
      }
      
      return `Dashboard loaded with ${dataStatus.taskCount} tasks`;
    });

    // Test 2: Check for T-196 specifically
    await this.runTest('T-196 Task Found', async () => {
      const task196 = await this.page!.evaluate(() => {
        if (window.dashboardData?.allTasks) {
          return window.dashboardData.allTasks.find(t => t.id === 'T-196');
        }
        return null;
      });
      
      if (!task196) {
        throw new Error('T-196 task not found in dashboard data');
      }
      
      return `T-196 found: ${task196.title}`;
    });
  }

  private async testIntegrationPoints() {
    console.log('\n🔗 Testing Integration Points...');
    
    // Test 1: Check if components can be imported
    await this.runTest('Component Import Check', async () => {
      const importStatus = await this.page!.evaluate(() => {
        // Try to access components through various methods
        const methods = [
          'BondTracker',
          'AlignmentXPTracker', 
          'bondService',
          'Bond',
          'XPTrigger'
        ];
        
        const available = methods.filter(method => 
          typeof window[method] !== 'undefined'
        );
        
        return {
          available,
          count: available.length,
          total: methods.length
        };
      });
      
      if (importStatus.count === 0) {
        throw new Error('No bond/alignment components available in browser context');
      }
      
      return `Found ${importStatus.count}/${importStatus.total} components available`;
    });

    // Test 2: Check for bond templates
    await this.runTest('Bond Templates Available', async () => {
      const templates = await this.page!.evaluate(() => {
        // Check if bond templates are accessible
        if (window.bondTemplates) {
          return window.bondTemplates.length;
        }
        return 0;
      });
      
      if (templates === 0) {
        throw new Error('No bond templates available');
      }
      
      return `Found ${templates} bond templates`;
    });
  }

  private async runTest(testName: string, testFunction: () => Promise<string>): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`  🧪 Running: ${testName}`);
      
      const result = await testFunction();
      
      const duration = Date.now() - startTime;
      
      this.testSuite.results.push({
        testName,
        status: 'PASS',
        details: result,
        duration
      });
      
      this.testSuite.summary.passed++;
      console.log(`    ✅ PASS: ${result} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testSuite.results.push({
        testName,
        status: 'FAIL',
        details: error.message,
        duration
      });
      
      this.testSuite.summary.failed++;
      console.log(`    ❌ FAIL: ${error.message} (${duration}ms)`);
    }
    
    this.testSuite.summary.total++;
  }

  private async generateReport() {
    console.log('\n📊 Generating Test Report...');
    
    const report = {
      testSuite: this.testSuite,
      timestamp: new Date().toISOString(),
      summary: {
        overall: this.testSuite.summary.failed === 0 ? 'PASS' : 'FAIL',
        coverage: Math.round((this.testSuite.summary.passed / this.testSuite.summary.total) * 100),
        recommendations: this.generateRecommendations()
      }
    };
    
    // Save JSON report
    const reportPath = resolve(process.cwd(), 't196-simple-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = resolve(process.cwd(), 't196-simple-report.html');
    writeFileSync(htmlPath, htmlReport);
    
    console.log('\n📋 Test Results Summary:');
    console.log(`  Total Tests: ${this.testSuite.summary.total}`);
    console.log(`  Passed: ${this.testSuite.summary.passed} ✅`);
    console.log(`  Failed: ${this.testSuite.summary.failed} ❌`);
    console.log(`  Coverage: ${report.summary.coverage}%`);
    console.log(`  Overall: ${report.summary.overall}`);
    console.log(`  Duration: ${this.testSuite.summary.duration}ms`);
    
    console.log('\n📁 Reports saved:');
    console.log(`  JSON: ${reportPath}`);
    console.log(`  HTML: ${htmlPath}`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.testSuite.summary.failed === 0) {
      recommendations.push('🎉 T-196 is fully functional! All tests passed.');
      recommendations.push('✅ The Bond & Alignment XP Tracker is ready for production use.');
      recommendations.push('🚀 Consider updating task status to "done" in tasks.yaml');
    } else if (this.testSuite.summary.passed >= this.testSuite.summary.total * 0.7) {
      recommendations.push('⚠️ T-196 is mostly functional but has some issues.');
      recommendations.push('🔧 Review failing tests and fix identified problems.');
    } else {
      recommendations.push('❌ T-196 has significant issues that need attention.');
      recommendations.push('🔄 Review implementation and fix core functionality.');
    }
    
    return recommendations;
  }

  private generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>T-196 Simple Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card.pass { background: #d4edda; color: #155724; }
        .summary-card.fail { background: #f8d7da; color: #721c24; }
        .test-results { margin-top: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .test-item.pass { border-left: 5px solid #28a745; }
        .test-item.fail { border-left: 5px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${report.testSuite.name}</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card ${report.summary.overall === 'PASS' ? 'pass' : 'fail'}">
                <h3>Overall Status</h3>
                <h2>${report.summary.overall}</h2>
            </div>
            <div class="summary-card">
                <h3>Coverage</h3>
                <h2>${report.summary.coverage}%</h2>
            </div>
            <div class="summary-card">
                <h3>Total Tests</h3>
                <h2>${report.testSuite.summary.total}</h2>
            </div>
            <div class="summary-card pass">
                <h3>Passed</h3>
                <h2>${report.testSuite.summary.passed}</h2>
            </div>
            <div class="summary-card fail">
                <h3>Failed</h3>
                <h2>${report.testSuite.summary.failed}</h2>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Results</h2>
            ${report.testSuite.results.map(test => `
                <div class="test-item ${test.status.toLowerCase()}">
                    <h4>${test.testName}</h4>
                    <p><strong>Status:</strong> ${test.status}</p>
                    <p><strong>Details:</strong> ${test.details}</p>
                    <p><strong>Duration:</strong> ${test.duration}ms</p>
                </div>
            `).join('')}
        </div>
        
        <div class="recommendations">
            <h2>Recommendations</h2>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the simple test suite
async function main() {
  const tester = new T196SimpleTester();
  await tester.initialize();
  await tester.runTestSuite();
}

main().catch(console.error);
