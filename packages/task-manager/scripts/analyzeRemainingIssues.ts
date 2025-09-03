#!/usr/bin/env tsx
/**
 * Analyze and categorize the remaining 182 ESLint issues
 */

import { execSync } from 'child_process';

async function analyzeRemainingIssues() {
  console.log('🔍 Analyzing remaining ESLint issues...\n');
  
  try {
    // Get the full lint output
    const lintOutput = execSync('npm run lint:fix:enhanced 2>&1', { 
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const lines = lintOutput.split('\n');
    const issues: { [key: string]: number } = {};
    const files: { [key: string]: number } = {};
    
    for (const line of lines) {
      // Parse ESLint error lines
      if (line.includes('error') || line.includes('warning')) {
        // Extract rule name
        const ruleMatch = line.match(/\s+([a-z-/@]+)$/);
        if (ruleMatch) {
          const rule = ruleMatch[1];
          issues[rule] = (issues[rule] || 0) + 1;
        }
        
        // Extract file path
        const fileMatch = line.match(/^([^:]+):/);
        if (fileMatch) {
          const file = fileMatch[1].replace('C:\\ZimboMate\\', '');
          files[file] = (files[file] || 0) + 1;
        }
      }
    }
    
    // Sort by frequency
    const sortedIssues = Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);
    
    const sortedFiles = Object.entries(files)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    console.log('📊 **TOP ISSUE TYPES:**');
    console.log('┌─────────────────────────────────────────┬───────┐');
    console.log('│ Rule                                    │ Count │');
    console.log('├─────────────────────────────────────────┼───────┤');
    
    for (const [rule, count] of sortedIssues) {
      const paddedRule = rule.padEnd(39);
      const paddedCount = count.toString().padStart(5);
      console.log(`│ ${paddedRule} │ ${paddedCount} │`);
    }
    console.log('└─────────────────────────────────────────┴───────┘\n');
    
    console.log('📁 **FILES WITH MOST ISSUES:**');
    console.log('┌─────────────────────────────────────────┬───────┐');
    console.log('│ File                                    │ Count │');
    console.log('├─────────────────────────────────────────┼───────┤');
    
    for (const [file, count] of sortedFiles) {
      const shortFile = file.length > 39 ? '...' + file.slice(-36) : file;
      const paddedFile = shortFile.padEnd(39);
      const paddedCount = count.toString().padStart(5);
      console.log(`│ ${paddedFile} │ ${paddedCount} │`);
    }
    console.log('└─────────────────────────────────────────┴───────┘\n');
    
    // Categorize by fix strategy
    const categories = {
      'Auto-fixable (Unused Variables)': [
        'unused-imports/no-unused-vars',
        'unused-imports/no-unused-imports'
      ],
      'Auto-fixable (Empty Blocks)': [
        'no-empty'
      ],
      'Auto-fixable (Unicorn Rules)': [
        'unicorn/no-array-for-each',
        'unicorn/prefer-ternary',
        'unicorn/prefer-number-properties'
      ],
      'Auto-fixable (TypeScript)': [
        'prefer-const',
        '@typescript-eslint/no-empty-object-type',
        '@typescript-eslint/no-unsafe-function-type'
      ],
      'Manual Review Required': [
        '@typescript-eslint/no-explicit-any',
        'no-case-declarations',
        'no-unsafe-optional-chaining',
        'no-useless-catch',
        'no-useless-escape'
      ]
    };
    
    console.log('🎯 **CATEGORIZED BY FIX STRATEGY:**\n');
    
    for (const [category, rules] of Object.entries(categories)) {
      const categoryCount = rules.reduce((sum, rule) => sum + (issues[rule] || 0), 0);
      if (categoryCount > 0) {
        console.log(`**${category}**: ${categoryCount} issues`);
        for (const rule of rules) {
          if (issues[rule]) {
            console.log(`  - ${rule}: ${issues[rule]}`);
          }
        }
        console.log();
      }
    }
    
    const totalCounted = Object.values(issues).reduce((sum, count) => sum + count, 0);
    console.log(`📈 **TOTAL ISSUES ANALYZED**: ${totalCounted}`);
    
  } catch (error) {
    console.error('Error analyzing issues:', error);
  }
}

analyzeRemainingIssues().catch(console.error);
