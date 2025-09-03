#!/usr/bin/env node

/**
 * Quick Fix for Common Underscore Variable Issues
 * 
 * This script fixes the most common underscore variable inconsistencies
 * that we've been encountering in the codebase.
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

// Common fixes to apply
const FIXES = [
  // Fix _forceSave -> forceSave in return statements
  {
    name: 'Return statement variable mismatch',
    pattern: /return\s*{\s*([^}]*),\s*forceSave\s*([^}]*)}/g,
    replacement: 'return { $1, _forceSave$2 }',
    description: 'Fix forceSave return statement'
  },
  
  // Fix _error -> Error in type assertions
  {
    name: 'Type assertion mismatch',
    pattern: /as\s+_error/g,
    replacement: 'as Error',
    description: 'Fix _error type assertions'
  },
  
  // Fix _errorInfo -> ErrorInfo in type definitions
  {
    name: 'ErrorInfo type definition',
    pattern: /_errorInfo\s*:\s*ErrorInfo/g,
    replacement: 'errorInfo: ErrorInfo',
    description: 'Fix _errorInfo type definitions'
  },
  
  // Fix _error -> Error in type definitions
  {
    name: 'Error type definition',
    pattern: /_error\s*:\s*Error/g,
    replacement: 'error: Error',
    description: 'Fix _error type definitions'
  },
  
  // Fix map function parameter mismatches
  {
    name: 'Map function parameter mismatch',
    pattern: /\.map\(\([^,]*,\s*_(\w+)\)\s*=>\s*\([^)]*\)\s*=>\s*\{[^}]*key=\{(\w+)\}[^}]*\}/g,
    replacement: '.map(($1, _$1) => ($2) => { ...key={_$1}... }',
    description: 'Fix map function key mismatches'
  },
  
  // Fix localStorage key variable mismatches
  {
    name: 'localStorage key variable mismatch',
    pattern: /(\w+)\s*=\s*localStorage\.key\(i\);\s*const\s+value\s*=\s*localStorage\.getItem\(\1\);\s*if\s*\(\1\)/g,
    replacement: '$1 = localStorage.key(i);\n      const value = localStorage.getItem($1);\n      if ($1)',
    description: 'Fix localStorage key variable consistency'
  },
  
  // Fix catch block parameter mismatches
  {
    name: 'Catch block parameter mismatch',
    pattern: /catch\s*\(\s*_(\w+)\s*\)/g,
    replacement: 'catch ($1)',
    description: 'Fix catch block parameter names'
  },
  
  // Fix function parameter mismatches
  {
    name: 'Function parameter mismatch',
    pattern: /\(([^)]*,\s*)_(\w+)([^)]*)\)/g,
    replacement: '($1, $2$3)',
    description: 'Fix function parameter names'
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

function applyFixes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;
    
    // Apply each fix
    for (const fix of FIXES) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        fixesApplied++;
        console.log(`  ✅ Applied: ${fix.description}`);
      }
    }
    
    // Special fix for the _forceSave issue
    if (content.includes('_forceSave') && content.includes('forceSave')) {
      // Check if _forceSave is defined but forceSave is returned
      const hasForceSaveDef = content.includes('const _forceSave =');
      const hasForceSaveReturn = content.includes('forceSave,');
      
      if (hasForceSaveDef && hasForceSaveReturn) {
        content = content.replace(/const _forceSave =/g, 'const forceSave =');
        fixesApplied++;
        console.log(`  ✅ Fixed: _forceSave -> forceSave definition`);
      }
    }
    
    // Special fix for map function index issues
    const mapIndexPattern = /\.map\(\([^,]*,\s*_(\w+)\)\s*=>\s*\([^)]*\)\s*=>\s*\{[^}]*key=\{(\w+)\}[^}]*\}/g;
    content = content.replace(mapIndexPattern, (match, underscoreParam, keyParam) => {
      if (underscoreParam === keyParam.replace('_', '')) {
        return match.replace(`key={${keyParam}}`, `key={_${underscoreParam}}`);
      }
      return match;
    });
    
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
  console.log('🔧 Quick Fix for Underscore Variable Issues...\n');
  
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
      
      // Check if file has potential issues
      const content = fs.readFileSync(file, 'utf8');
      const hasIssues = FIXES.some(fix => fix.pattern.test(content)) ||
                       content.includes('_forceSave') ||
                       content.includes('_error') ||
                       content.includes('_index');
      
      if (hasIssues) {
        console.log(`\n🔧 Fixing: ${relativePath}`);
        const fixesApplied = applyFixes(file);
        totalFixes += fixesApplied;
        
        if (fixesApplied === 0) {
          console.log(`  ℹ️  No fixes needed`);
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Fixes applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n✅ Underscore variable issues have been fixed!');
    console.log('   The application should now run without these ReferenceError issues.');
  } else {
    console.log('\n✅ No underscore variable issues were found.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test the application: npm run dev');
  console.log('   2. Check the browser console for any remaining errors');
  console.log('   3. If issues persist, run the comprehensive script: node fix-underscore-variables.js');
}

// Run the script
main();
