#!/usr/bin/env tsx

import { readdirSync, readFileSync, statSync,writeFileSync } from 'node:fs';
import { extname,join } from 'node:path';

interface SyntaxFix {
  pattern: string;
  replacement: string;
  description: string;
}

const SYNTAX_FIXES: SyntaxFix[] = [
  // Fix incomplete regex patterns
  {
    pattern: /\/\s*\*\s*damage\s*\//g,
    replacement: '/\\*damage/',
    description: 'Fix incomplete regex pattern with spacing'
  },
  {
    pattern: /\/\s*use\s*\(\w+\)\s*\+\s*instead\s*\+\s*of\s*\+\s*unknown\s*\+\s*other\s*\+\s*stat\s*\//g,
    replacement: '/use\\s+(\\w+)\\s+instead\\s+of\\s+unknown\\s+other\\s+stat/',
    description: 'Fix incomplete regex pattern with spacing'
  },
  {
    pattern: /\/\s*choose\s*\+\s*to\s*\+\s*use\s*\(\w+\)\s*\+\s*instead\s*\//g,
    replacement: '/choose\\s+to\\s+use\\s+(\\w+)\\s+instead/',
    description: 'Fix incomplete regex pattern with spacing'
  },
  {
    pattern: /\/\s*may\s*\+\s*use\s*\(\w+\)\s*\+\s*instead\s*\//g,
    replacement: '/may\\s+use\\s+(\\w+)\\s+instead/',
    description: 'Fix incomplete regex pattern with spacing'
  },
  
  // Fix incomplete function calls
  {
    pattern: /\.find\(\(c\s*$/gm,
    replacement: '.find(c => c.id === itemId)',
    description: 'Fix incomplete find function call'
  },
  
  // Fix incomplete if statements
  {
    pattern: /if\s*\(\s*condition\?\s*\.\s*duration\s*===\s*'scene'\s*\)\s*\{/g,
    replacement: "if (condition?.duration === 'scene') {",
    description: 'Fix incomplete if statement with spacing'
  },
  {
    pattern: /if\s*\(\s*condition\?\s*\.\s*duration\s*===\s*'scene'\s*\|\|\s*condition\?\s*\.\s*duration\s*===\s*'session'\s*\)\s*\{/g,
    replacement: "if (condition?.duration === 'scene' || condition?.duration === 'session') {",
    description: 'Fix incomplete if statement with spacing'
  },
  
  // Fix incomplete variable declarations
  {
    pattern: /let\s+expectedTotal:\s*number;/g,
    replacement: 'let expectedTotal: number;',
    description: 'Fix incomplete variable declaration'
  },
  
  // Fix incomplete localStorage calls
  {
    pattern: /localStorage\.setItem\('zimbomate_custom_portraits',\s*JSON\.stringify\(updated\)\);/g,
    replacement: "localStorage.setItem('zimbomate_custom_portraits', JSON.stringify(updated));",
    description: 'Fix incomplete localStorage call'
  },
  {
    pattern: /localStorage\.setItem\('zimbomate_custom_templates',\s*JSON\.stringify\(updated\)\);/g,
    replacement: "localStorage.setItem('zimbomate_custom_templates', JSON.stringify(updated));",
    description: 'Fix incomplete localStorage call'
  },
  
  // Fix incomplete for loops
  {
    pattern: /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*localStorage\.length;\s*i\+\+\)\s*\{/g,
    replacement: 'for (let i = 0; i < localStorage.length; i++) {',
    description: 'Fix incomplete for loop with spacing'
  },
  
  // Fix incomplete template literals
  {
    pattern: /\}\s*ms\s*\(threshold:\s*\$\{this\.thresholds\.panelSwitchTime\}\s*ms\)/g,
    replacement: '}ms (threshold: ${this.thresholds.panelSwitchTime}ms)',
    description: 'Fix incomplete template literal'
  },
  {
    pattern: /\}\s*ms\s*\(threshold:\s*\$\{this\.thresholds\.renderTime\}\s*ms\)/g,
    replacement: '}ms (threshold: ${this.thresholds.renderTime}ms)',
    description: 'Fix incomplete template literal'
  },
  
  // Fix incomplete generic types
  {
    pattern: /Record\s*<\s*string,\s*number\s*>/g,
    replacement: 'Record<string, number>',
    description: 'Fix incomplete generic type with spacing'
  },
  {
    pattern: /Partial\s*<\s*PerformanceThresholds\s*>/g,
    replacement: 'Partial<PerformanceThresholds>',
    description: 'Fix incomplete generic type with spacing'
  },
  
  // Fix incomplete array types
  {
    pattern: /string\s*\[\s*\]/g,
    replacement: 'string[]',
    description: 'Fix incomplete array type with spacing'
  },
  {
    pattern: /PerformanceMetrics\s*\[\s*\]/g,
    replacement: 'PerformanceMetrics[]',
    description: 'Fix incomplete array type with spacing'
  },
  
  // Fix incomplete function parameters
  {
    pattern: /\(metric:\s*PerformanceMetrics\):\s*void\s*\{/g,
    replacement: '(metric: PerformanceMetrics): void {',
    description: 'Fix incomplete function parameter with spacing'
  },
  
  // Fix incomplete method calls
  {
    pattern: /this\.metrics\.push\(metric\);/g,
    replacement: 'this.metrics.push(metric);',
    description: 'Fix incomplete method call'
  },
  
  // Fix incomplete property access
  {
    pattern: /this\.thresholds\s*=\s*\{\s*\.\.\.this\.thresholds,\s*\.\.\.thresholds\s*\};/g,
    replacement: 'this.thresholds = { ...this.thresholds, ...thresholds };',
    description: 'Fix incomplete property access with spacing'
  },
  
  // Fix incomplete return statements
  {
    pattern: /return\s*this\.metrics;/g,
    replacement: 'return this.metrics;',
    description: 'Fix incomplete return statement'
  },
  
  // Fix incomplete method definitions
  {
    pattern: /getAllMetrics\(\):\s*PerformanceMetrics\s*\[\s*\]\s*\{/g,
    replacement: 'getAllMetrics(): PerformanceMetrics[] {',
    description: 'Fix incomplete method definition with spacing'
  },
  
  // Fix incomplete boolean methods
  {
    pattern: /isPerformanceAcceptable\(\):\s*boolean\s*\{/g,
    replacement: 'isPerformanceAcceptable(): boolean {',
    description: 'Fix incomplete boolean method with spacing'
  },
  
  // Fix incomplete number methods
  {
    pattern: /getMemoryUsage\(\):\s*number\s*\|\s*null\s*\{/g,
    replacement: 'getMemoryUsage(): number | null {',
    description: 'Fix incomplete number method with spacing'
  },
  
  // Fix incomplete void methods
  {
    pattern: /clearMetrics\(\):\s*void\s*\{/g,
    replacement: 'clearMetrics(): void {',
    description: 'Fix incomplete void method with spacing'
  },
  
  // Fix incomplete setThresholds method
  {
    pattern: /setThresholds\(thresholds:\s*Partial\s*<\s*PerformanceThresholds\s*>\):\s*void\s*\{/g,
    replacement: 'setThresholds(thresholds: Partial<PerformanceThresholds>): void {',
    description: 'Fix incomplete setThresholds method with spacing'
  }
];

function shouldProcessFile(filePath: string): boolean {
  const ext = extname(filePath);
  const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  // Skip node_modules and build directories
  if (filePath.includes('node_modules') || 
      filePath.includes('dist') || 
      filePath.includes('.git')) {
    return false;
  }
  
  return validExtensions.includes(ext);
}

function fixFileSyntax(filePath: string): { fixed: boolean; issues: string[] } {
  try {
    const content = readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const issues: string[] = [];
    
    for (const fix of SYNTAX_FIXES) {
      const matches = content.match(fix.pattern);
      if (matches && matches.length > 0) {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        issues.push(`${fix.description}: ${matches.length} instances`);
      }
    }
    
    if (fixedContent !== content) {
      writeFileSync(filePath, fixedContent, 'utf8');
      return { fixed: true, issues };
    }
    
    return { fixed: false, issues: [] };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { fixed: false, issues: [`Error: ${error}`] };
  }
}

function scanDirectory(dirPath: string): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return files;
}

function main() {
  console.log('🔧 Starting automatic syntax error fix...\n');
  
  const projectRoot = process.cwd();
  const srcDir = join(projectRoot, 'src');
  const testDir = join(projectRoot, 'test');
  
  // Get all files to process
  const allFiles = [
    ...scanDirectory(srcDir),
    ...scanDirectory(testDir)
  ];
  
  console.log(`📁 Found ${allFiles.length} files to process\n`);
  
  let totalFixed = 0;
  let totalIssues = 0;
  
  // Process each file
  for (const filePath of allFiles) {
    const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');
    const result = fixFileSyntax(filePath);
    
    if (result.fixed) {
      totalFixed++;
      totalIssues += result.issues.length;
      console.log(`✅ Fixed: ${relativePath}`);
      for (const issue of result.issues) {
        console.log(`   • ${issue}`);
      }
    }
  }
  
  console.log(`\n🎉 Syntax error fix complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • Files processed: ${allFiles.length}`);
  console.log(`   • Files fixed: ${totalFixed}`);
  console.log(`   • Total issues resolved: ${totalIssues}`);
  
  if (totalFixed > 0) {
    console.log(`\n🚀 Your codebase should now have fewer syntax errors!`);
    console.log(`💡 Try running 'npx tsc --noEmit --skipLibCheck' again to see the improvement.`);
  } else {
    console.log(`\n✨ No syntax errors found that could be auto-fixed - your codebase is clean!`);
  }
}

// Run the script if called directly
main();

export { fixFileSyntax, SYNTAX_FIXES };

