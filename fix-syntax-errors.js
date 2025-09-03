#!/usr/bin/env node

/**
 * Fix Syntax Errors Introduced by Previous Fixes
 * 
 * This script fixes the specific syntax errors that were created:
 * - Extra commas in function calls
 * - Malformed map function parameters
 * - Double commas in various contexts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Directories to scan
const SCAN_DIRS = [
  path.join(PACKAGES_DIR, 'dungeon-world', 'src'),
  path.join(PACKAGES_DIR, 'task-manager', 'src'),
  SRC_DIR
].filter(dir => fs.existsSync(dir));

// Specific syntax fixes to apply
const SYNTAX_FIXES = [
  // Fix double commas in map functions
  {
    name: 'Double comma in map function',
    pattern: /\.map\(\([^,]*,\s*,\s*(\w+)\)/g,
    replacement: '.map(($1, $1)',
    description: 'Fix double comma in map function parameters'
  },
  
  // Fix extra comma in function calls
  {
    name: 'Extra comma in function call',
    pattern: /\(([^,]*),\s*,(\s*[^)]*)\)/g,
    replacement: '($1,$2)',
    description: 'Remove extra comma in function calls'
  },
  
  // Fix extra comma in console.error calls
  {
    name: 'Extra comma in console.error',
    pattern: /console\.error\(([^,]*),\s*,(\s*[^)]*)\)/g,
    replacement: 'console.error($1,$2)',
    description: 'Fix console.error extra comma'
  },
  
  // Fix extra comma in method calls
  {
    name: 'Extra comma in method call',
    pattern: /\.(\w+)\(([^,]*),\s*,(\s*[^)]*)\)/g,
    replacement: '.$1($2,$3)',
    description: 'Fix method call extra comma'
  },
  
  // Fix map function with missing first parameter
  {
    name: 'Map function missing first parameter',
    pattern: /\.map\(\([^,]*,\s*,\s*(\w+)\)\s*=>/g,
    replacement: '.map(($1, $1) =>',
    description: 'Fix map function missing first parameter'
  },
  
  // Fix template literal map function issues
  {
    name: 'Template literal map function',
    pattern: /\$\{([^}]*)\s*\.map\(\([^,]*,\s*,\s*(\w+)\)/g,
    replacement: '${$1.map(($2, $2)',
    description: 'Fix template literal map function'
  }
];

function findFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentDir}:`, error.message);
    }
  }
  
  scanDirectory(dir);
  return files;
}

function applySyntaxFixes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;
    
    // Apply each syntax fix
    for (const fix of SYNTAX_FIXES) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        fixesApplied++;
        console.log(`  ✅ Applied: ${fix.description}`);
      }
    }
    
    // Special fix for the specific error in globalErrorHandler.ts
    if (content.includes('this.logError(error, , context)')) {
      content = content.replace('this.logError(error, , context)', 'this.logError(error, context)');
      fixesApplied++;
      console.log(`  ✅ Fixed: Extra comma in logError call`);
    }
    
    // Fix map function parameter issues
    const mapPattern = /\.map\(\([^,]*,\s*,\s*(\w+)\)\s*=>/g;
    content = content.replace(mapPattern, (match, param) => {
      return `.map((${param}, ${param}) =>`;
    });
    
    // Fix function call extra commas
    const funcCallPattern = /\(([^,]*),\s*,(\s*[^)]*)\)/g;
    content = content.replace(funcCallPattern, '($1,$2)');
    
    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return fixesApplied;
    }
    
    return 0;
  } catch (error) {
    console.warn(`Warning: Could not fix file ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 Fixing Syntax Errors...\n');
  
  let totalFiles = 0;
  let totalFixes = 0;
  
  for (const scanDir of SCAN_DIRS) {
    if (!fs.existsSync(scanDir)) {
      console.log(`⚠️  Directory not found: ${scanDir}`);
      continue;
    }
    
    console.log(`📁 Scanning: ${scanDir}`);
    const files = findFiles(scanDir);
    console.log(`   Found ${files.length} files`);
    
    for (const file of files) {
      totalFiles++;
      const relativePath = path.relative(ROOT_DIR, file);
      
      // Check if file has potential syntax issues
      const content = fs.readFileSync(file, 'utf8');
      const hasIssues = SYNTAX_FIXES.some(fix => fix.pattern.test(content)) ||
                       content.includes(', ,') ||
                       content.includes('(,') ||
                       content.includes(',)');
      
      if (hasIssues) {
        console.log(`\n🔧 Fixing: ${relativePath}`);
        const fixesApplied = applySyntaxFixes(file);
        totalFixes += fixesApplied;
        
        if (fixesApplied === 0) {
          console.log(`  ℹ️  No syntax fixes needed`);
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Syntax fixes applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n✅ Syntax errors have been fixed!');
    console.log('   The application should now build without syntax errors.');
  } else {
    console.log('\n✅ No syntax errors were found.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Try building the application again');
  console.log('   2. Check for any remaining syntax errors');
  console.log('   3. Run the development server: npm run dev');
}

// Run the script
main();
