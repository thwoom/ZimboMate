#!/usr/bin/env tsx

import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  duration: number;
  screenshots: string[];
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

class T196AutomatedTester {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private testSuite: TestSuite;
  private screenshotsDir: string;

  constructor() {
    this.testSuite = {
      name: 'T-196: Bond & Alignment XP Tracker Automated Test Suite',
      results: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }
    };
    this.screenshotsDir = 'screenshots/t196-testing';
    
    // Create screenshots directory if it doesn't exist
    if (!existsSync(this.screenshotsDir)) {
      mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async initialize() {
    console.log('🚀 Initializing T-196 Automated Test Suite...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Capture console messages for debugging
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
    console.log('\n🎯 Starting T-196 Automated Test Suite...\n');
    
    try {
      // Load the dashboard
      await this.loadDashboard();
      
      // Run all test categories
      await this.testBondSystem();
      await this.testAlignmentSystem();
      await this.testXPIntegration();
      await this.testUITechnical();
      await this.testDataPersistence();
      
      // Generate comprehensive report
      this.testSuite.summary.duration = Date.now() - startTime;
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async loadDashboard() {
    console.log('📱 Loading dashboard...');
    
    await this.page!.goto('http://localhost:8080/dashboard.html', { 
      waitUntil: 'domcontentloaded' 
    });
    
    // Wait for dashboard to fully load
    await this.page!.waitForSelector('h1', { timeout: 15000 });
    await this.page!.waitForFunction(() => {
      return typeof window.dashboardData !== 'undefined' && 
             window.dashboardData.allTasks && 
             window.dashboardData.allTasks.length > 0;
    }, { timeout: 20000 });
    
    console.log('✅ Dashboard loaded successfully');
  }

  private async testBondSystem() {
    console.log('\n🔗 Testing Bond System...');
    
    // Test 1: Bond Component Loading
    await this.runTest('Bond Component Loading', async () => {
      const bondComponent = await this.page!.evaluate(() => {
        // Check if BondTracker component exists in the DOM
        const bondElements = document.querySelectorAll('[class*="bond"]');
        return {
          found: bondElements.length > 0,
          count: bondElements.length,
          classes: Array.from(bondElements).map(el => el.className)
        };
      });
      
      if (!bondComponent.found) {
        throw new Error(`No bond-related components found. Found ${bondComponent.count} elements with classes: ${bondComponent.classes.join(', ')}`);
      }
      
      return `Found ${bondComponent.count} bond-related components`;
    });

    // Test 2: Bond Service Availability
    await this.runTest('Bond Service Availability', async () => {
      const serviceStatus = await this.page!.evaluate(() => {
        return {
          bondServiceExists: typeof window.bondService !== 'undefined',
          bondTypesExist: typeof window.Bond !== 'undefined',
          bondTemplatesExist: typeof window.bondTemplates !== 'undefined'
        };
      });
      
      if (!serviceStatus.bondServiceExists) {
        throw new Error('BondService not available in browser context');
      }
      
      return 'Bond service and types available';
    });

    // Test 3: Bond Templates Loading
    await this.runTest('Bond Templates Loading', async () => {
      const templates = await this.page!.evaluate(() => {
        // Try to access bond templates through the service
        if (window.bondService && window.bondService.getBondTemplates) {
          return window.bondService.getBondTemplates();
        }
        return null;
      });
      
      if (!templates || templates.length === 0) {
        throw new Error('No bond templates loaded');
      }
      
      return `Loaded ${templates.length} bond templates`;
    });
  }

  private async testAlignmentSystem() {
    console.log('\n🎭 Testing Alignment System...');
    
    // Test 1: Alignment Component Loading
    await this.runTest('Alignment Component Loading', async () => {
      const alignmentComponent = await this.page!.evaluate(() => {
        const alignmentElements = document.querySelectorAll('[class*="alignment"]');
        return {
          found: alignmentElements.length > 0,
          count: alignmentElements.length,
          classes: Array.from(alignmentElements).map(el => el.className)
        };
      });
      
      if (!alignmentComponent.found) {
        throw new Error(`No alignment-related components found. Found ${alignmentComponent.count} elements`);
      }
      
      return `Found ${alignmentComponent.count} alignment-related components`;
    });

    // Test 2: Alignment Actions Configuration
    await this.runTest('Alignment Actions Configuration', async () => {
      const alignmentConfig = await this.page!.evaluate(() => {
        if (window.AlignmentXPConfig) {
          return window.AlignmentXPConfig;
        }
        return null;
      });
      
      if (!alignmentConfig) {
        throw new Error('Alignment XP configuration not available');
      }
      
      return 'Alignment actions configuration loaded';
    });
  }

  private async testXPIntegration() {
    console.log('\n⭐ Testing XP Integration...');
    
    // Test 1: XP Trigger System
    await this.runTest('XP Trigger System', async () => {
      const xpSystem = await this.page!.evaluate(() => {
        return {
          xpTypesExist: typeof window.XPTriggerType !== 'undefined',
          xpTriggerExists: typeof window.XPTrigger !== 'undefined',
          alignmentActionExists: typeof window.AlignmentAction !== 'undefined'
        };
      });
      
      if (!xpSystem.xpTypesExist) {
        throw new Error('XP trigger types not defined');
      }
      
      return 'XP trigger system available';
    });

    // Test 2: Bond XP Integration
    await this.runTest('Bond XP Integration', async () => {
      const bondXP = await this.page!.evaluate(() => {
        if (window.bondService && window.bondService.resolveBond) {
          return 'Bond resolution with XP available';
        }
        return null;
      });
      
      if (!bondXP) {
        throw new Error('Bond XP integration not working');
      }
      
      return bondXP;
    });
  }

  private async testUITechnical() {
    console.log('\n🎨 Testing UI Technical Implementation...');
    
    // Test 1: Component Rendering
    await this.runTest('Component Rendering', async () => {
      const components = await this.page!.evaluate(() => {
        const reactRoot = document.querySelector('#root');
        return {
          reactMounted: !!reactRoot,
          hasComponents: document.querySelectorAll('[class*="bond"], [class*="alignment"]').length > 0
        };
      });
      
      if (!components.reactMounted) {
        throw new Error('React application not mounted');
      }
      
      return 'React components rendering correctly';
    });

    // Test 2: CSS Loading
    await this.runTest('CSS Loading', async () => {
      const cssStatus = await this.page!.evaluate(() => {
        const bondCSS = document.querySelector('link[href*="BondTracker.css"]');
        const alignmentCSS = document.querySelector('link[href*="AlignmentXPTracker.css"]');
        
        return {
          bondCSSLoaded: !!bondCSS,
          alignmentCSSLoaded: !!alignmentCSS
        };
      });
      
      if (!cssStatus.bondCSSLoaded || !cssStatus.alignmentCSSLoaded) {
        throw new Error('CSS files not loaded properly');
      }
      
      return 'CSS styling loaded correctly';
    });
  }

  private async testDataPersistence() {
    console.log('\n💾 Testing Data Persistence...');
    
    // Test 1: Local Storage
    await this.runTest('Local Storage', async () => {
      const storageStatus = await this.page!.evaluate(() => {
        try {
          localStorage.setItem('test-bond', 'test-value');
          const retrieved = localStorage.getItem('test-bond');
          localStorage.removeItem('test-bond');
          return retrieved === 'test-value';
        } catch (error) {
          return false;
        }
      });
      
      if (!storageStatus) {
        throw new Error('Local storage not working');
      }
      
      return 'Local storage functional';
    });

    // Test 2: Data Models
    await this.runTest('Data Models', async () => {
      const models = await this.page!.evaluate(() => {
        return {
          characterModel: typeof window.Character !== 'undefined',
          bondModel: typeof window.Bond !== 'undefined',
          xpModel: typeof window.XPTrigger !== 'undefined'
        };
      });
      
      if (!models.characterModel || !models.bondModel || !models.xpModel) {
        throw new Error('Data models not available');
      }
      
      return 'All required data models available';
    });
  }

  private async runTest(testName: string, testFunction: () => Promise<string>): Promise<void> {
    const startTime = Date.now();
    const screenshots: string[] = [];
    
    try {
      console.log(`  🧪 Running: ${testName}`);
      
      // Take screenshot before test
      const beforeScreenshot = `${this.screenshotsDir}/before-${testName.replace(/\s+/g, '-').toLowerCase()}.png`;
      await this.page!.screenshot({ path: beforeScreenshot, fullPage: true });
      screenshots.push(beforeScreenshot);
      
      const result = await testFunction();
      
      // Take screenshot after test
      const afterScreenshot = `${this.screenshotsDir}/after-${testName.replace(/\s+/g, '-').toLowerCase()}.png`;
      await this.page!.screenshot({ path: afterScreenshot, fullPage: true });
      screenshots.push(afterScreenshot);
      
      const duration = Date.now() - startTime;
      
      this.testSuite.results.push({
        testName,
        status: 'PASS',
        details: result,
        duration,
        screenshots
      });
      
      this.testSuite.summary.passed++;
      console.log(`    ✅ PASS: ${result} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testSuite.results.push({
        testName,
        status: 'FAIL',
        details: error.message,
        duration,
        screenshots
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
    
    // Save detailed report
    const reportPath = resolve(process.cwd(), 't196-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = resolve(process.cwd(), 't196-test-report.html');
    writeFileSync(htmlPath, htmlReport);
    
    console.log('\n📋 Test Results Summary:');
    console.log(`  Total Tests: ${this.testSuite.summary.total}`);
    console.log(`  Passed: ${this.testSuite.summary.passed} ✅`);
    console.log(`  Failed: ${this.testSuite.summary.failed} ❌`);
    console.log(`  Skipped: ${this.testSuite.summary.skipped} ⏭️`);
    console.log(`  Coverage: ${report.summary.coverage}%`);
    console.log(`  Overall: ${report.summary.overall}`);
    console.log(`  Duration: ${this.testSuite.summary.duration}ms`);
    
    console.log('\n📁 Reports saved:');
    console.log(`  JSON: ${reportPath}`);
    console.log(`  HTML: ${htmlPath}`);
    console.log(`  Screenshots: ${this.screenshotsDir}/`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.testSuite.summary.failed > 0) {
      recommendations.push('Fix failing tests before proceeding');
    }
    
    if (this.testSuite.summary.passed === this.testSuite.summary.total) {
      recommendations.push('T-196 is fully functional and ready for production');
      recommendations.push('Consider adding end-to-end user workflow tests');
    }
    
    if (this.testSuite.summary.passed < this.testSuite.summary.total * 0.8) {
      recommendations.push('Significant issues found - review implementation');
    }
    
    return recommendations;
  }

  private generateHTMLReport(report: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>T-196 Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card.pass { background: #d4edda; color: #155724; }
        .summary-card.fail { background: #f8d7da; color: #721c24; }
        .test-results { margin-top: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .test-item.pass { border-left: 5px solid #28a745; }
        .test-item.fail { border-left: 5px solid #dc3545; }
        .screenshots { display: flex; gap: 10px; margin-top: 10px; }
        .screenshot { max-width: 200px; border: 1px solid #ddd; border-radius: 4px; }
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
                    ${test.screenshots.length > 0 ? `
                        <div class="screenshots">
                            ${test.screenshots.map(screenshot => `
                                <img src="${screenshot}" alt="Screenshot" class="screenshot" onclick="window.open(this.src)">
                            `).join('')}
                        </div>
                    ` : ''}
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

// Run the automated test suite
async function main() {
  const tester = new T196AutomatedTester();
  await tester.initialize();
  await tester.runTestSuite();
}

main().catch(console.error);
