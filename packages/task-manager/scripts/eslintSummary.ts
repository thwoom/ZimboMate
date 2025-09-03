#!/usr/bin/env tsx
/**
 * Generate a useful ESLint summary focused on actionable insights
 */

import { execSync } from 'child_process';

interface LintIssue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  rule: string;
}

async function generateUsefulSummary() {
  console.log('📊 ESLint Summary - Actionable Insights\n');
  
  try {
    const output = execSync('npm run lint:fix:enhanced 2>&1', { 
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10 
    });
    
    const issues: LintIssue[] = [];
    const lines = output.split('\n');
    let currentFile = '';
    
    for (const line of lines) {
      // Parse file paths
      if (line.match(/^C:\\.*\.(ts|tsx)$/)) {
        currentFile = line.replace('C:\\ZimboMate\\', '');
        continue;
      }
      
      // Parse issue lines
      const issueMatch = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([a-z-/@]+)$/);
      if (issueMatch && currentFile) {
        issues.push({
          file: currentFile,
          line: parseInt(issueMatch[1]),
          column: parseInt(issueMatch[2]),
          severity: issueMatch[3] as 'error' | 'warning',
          message: issueMatch[4].trim(),
          rule: issueMatch[5]
        });
      }
    }
    
    // Categorize issues by impact
    const critical = issues.filter(i => 
      i.rule.includes('parsing') || 
      i.rule.includes('no-explicit-any') ||
      i.message.includes('Parsing error')
    );
    
    const highImpact = issues.filter(i => 
      i.rule.includes('no-empty') ||
      i.rule.includes('no-useless-catch') ||
      i.rule.includes('no-unsafe-optional-chaining')
    );
    
    const cosmetic = issues.filter(i => 
      i.rule.includes('unused-imports/no-unused-vars') ||
      i.rule.includes('unicorn/') ||
      i.rule.includes('prefer-const')
    );
    
    // Generate actionable summary
    console.log('🎯 PRIORITY BREAKDOWN:\n');
    
    console.log(`🚨 CRITICAL (Fix First): ${critical.length} issues`);
    if (critical.length > 0) {
      console.log('   These break builds or hide serious bugs');
      critical.slice(0, 5).forEach(issue => {
        console.log(`   • ${issue.file}:${issue.line} - ${issue.message}`);
      });
      if (critical.length > 5) console.log(`   ... and ${critical.length - 5} more`);
    } else {
      console.log('   ✅ All critical issues resolved!');
    }
    console.log();
    
    console.log(`⚠️  HIGH IMPACT (Fix When Convenient): ${highImpact.length} issues`);
    if (highImpact.length > 0) {
      console.log('   These could cause runtime issues');
      highImpact.slice(0, 3).forEach(issue => {
        console.log(`   • ${issue.file}:${issue.line} - ${issue.message}`);
      });
      if (highImpact.length > 3) console.log(`   ... and ${highImpact.length - 3} more`);
    } else {
      console.log('   ✅ All high-impact issues resolved!');
    }
    console.log();
    
    console.log(`🎨 COSMETIC (Optional): ${cosmetic.length} issues`);
    console.log('   These are style preferences, code works fine');
    console.log();
    
    // Most problematic files
    const fileIssueCount = issues.reduce((acc, issue) => {
      acc[issue.file] = (acc[issue.file] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topFiles = Object.entries(fileIssueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('📁 FILES NEEDING MOST ATTENTION:\n');
    topFiles.forEach(([file, count], index) => {
      const criticalInFile = critical.filter(i => i.file === file).length;
      const highInFile = highImpact.filter(i => i.file === file).length;
      
      console.log(`${index + 1}. ${file} (${count} issues)`);
      if (criticalInFile > 0) console.log(`   🚨 ${criticalInFile} critical`);
      if (highInFile > 0) console.log(`   ⚠️  ${highInFile} high-impact`);
      console.log();
    });
    
    // Rule frequency
    const ruleCount = issues.reduce((acc, issue) => {
      acc[issue.rule] = (acc[issue.rule] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topRules = Object.entries(ruleCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('🔧 MOST COMMON ISSUES:\n');
    topRules.forEach(([rule, count], index) => {
      const isCritical = rule.includes('parsing') || rule.includes('no-explicit-any');
      const isHighImpact = rule.includes('no-empty') || rule.includes('no-useless-catch');
      const priority = isCritical ? '🚨' : isHighImpact ? '⚠️ ' : '🎨';
      
      console.log(`${index + 1}. ${priority} ${rule}: ${count} occurrences`);
    });
    
    console.log('\n📈 OVERALL PROGRESS:\n');
    console.log(`Total Issues: ${issues.length}`);
    console.log(`Critical: ${critical.length} (${critical.length === 0 ? '✅ DONE' : '🚨 NEEDS ATTENTION'})`);
    console.log(`High Impact: ${highImpact.length} (${highImpact.length < 10 ? '✅ MANAGEABLE' : '⚠️  REVIEW NEEDED'})`);
    console.log(`Cosmetic: ${cosmetic.length} (${cosmetic.length < 100 ? '✅ ACCEPTABLE' : '🎨 CLEANUP OPPORTUNITY'})`);
    
    // Actionable recommendations
    console.log('\n💡 RECOMMENDED ACTIONS:\n');
    
    if (critical.length > 0) {
      console.log('1. 🚨 Fix critical issues immediately (breaks builds)');
    } else if (highImpact.length > 10) {
      console.log('1. ⚠️  Consider fixing high-impact issues in batches');
    } else if (cosmetic.length > 50) {
      console.log('1. 🎨 Cosmetic issues can be addressed during regular development');
    } else {
      console.log('1. ✅ Codebase is in excellent shape! Focus on features.');
    }
    
    if (topFiles.length > 0) {
      console.log(`2. 📁 Start with: ${topFiles[0][0]} (${topFiles[0][1]} issues)`);
    }
    
    console.log('3. 🔧 Run `npm run lint:fix` to auto-fix simple issues');
    
  } catch (error) {
    console.error('Error generating summary:', error);
  }
}

generateUsefulSummary().catch(console.error);
