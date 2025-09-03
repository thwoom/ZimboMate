#!/usr/bin/env node

/**
 * Fix Underscore Variable Inconsistencies
 * 
 * This script systematically finds and fixes issues where variables are defined
 * with _ prefix but referenced without it, or vice versa.
 * 
 * Common patterns:
 * - _forceSave defined but forceSave returned
 * - _error defined but error referenced
 * - _index defined but index used in map functions
 * - _character defined but character referenced
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = process.cwd();
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// File patterns to scan
const FILE_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx'
];

// Directories to scan
const SCAN_DIRS = [
  path.join(PACKAGES_DIR, 'dungeon-world', 'src'),
  path.join(PACKAGES_DIR, 'task-manager', 'src'),
  SRC_DIR
].filter(dir => fs.existsSync(dir));

// Common variable patterns to fix
const VARIABLE_PATTERNS = [
  // Function/variable definitions vs usage
  { pattern: /const\s+(_\w+)\s*=/g, replacement: 'const $1 =', description: 'Underscore variable definitions' },
  { pattern: /let\s+(_\w+)\s*=/g, replacement: 'let $1 =', description: 'Underscore variable definitions' },
  { pattern: /var\s+(_\w+)\s*=/g, replacement: 'var $1 =', description: 'Underscore variable definitions' },
  
  // Function parameters
  { pattern: /\(([^)]*,\s*)_(\w+)([^)]*)\)/g, replacement: '($1, $2$3)', description: 'Underscore function parameters' },
  
  // Map function parameters
  { pattern: /\.map\(\([^,]*,\s*_(\w+)\)/g, replacement: '.map(($1, _$1)', description: 'Map function underscore parameters' },
  
  // Return statements with mismatched names
  { pattern: /return\s*{\s*([^}]*),\s*(\w+)([^}]*)}/g, replacement: 'return { $1, $2$3 }', description: 'Return statements' },
  
  // Object destructuring
  { pattern: /{\s*(\w+):\s*_(\w+)\s*}/g, replacement: '{ $1: $2 }', description: 'Object destructuring' },
  
  // Type assertions
  { pattern: /as\s+_(\w+)/g, replacement: 'as $1', description: 'Type assertions' },
  
  // Catch block parameters
  { pattern: /catch\s*\(\s*_(\w+)\s*\)/g, replacement: 'catch ($1)', description: 'Catch block parameters' }
];

// Specific fixes for common patterns
const SPECIFIC_FIXES = [
  // Error handling patterns
  {
    pattern: /(_error)\s*:\s*Error/g,
    replacement: 'error: Error',
    description: 'Error type definitions'
  },
  {
    pattern: /(_errorInfo)\s*:\s*ErrorInfo/g,
    replacement: 'errorInfo: ErrorInfo',
    description: 'ErrorInfo type definitions'
  },
  
  // Map function patterns
  {
    pattern: /\.map\(\([^,]*,\s*_(\w+)\)\s*=>\s*\([^)]*\)\s*=>\s*\{[^}]*key=\{(\w+)\}[^}]*\}/g,
    replacement: '.map(($1, _$1) => ($2) => { ...key={_$1}... }',
    description: 'Map functions with key mismatches'
  },
  
  // Variable reference mismatches
  {
    pattern: /(\w+)\s*=\s*localStorage\.key\(i\);\s*const\s+value\s*=\s*localStorage\.getItem\(\1\);\s*if\s*\(\1\)/g,
    replacement: '$1 = localStorage.key(i);\n      const value = localStorage.getItem($1);\n      if ($1)',
    description: 'localStorage key variable mismatches'
  }
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '*.min.js',
  '*.bundle.js'
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => 
    filePath.includes(pattern) || 
    filePath.endsWith(pattern.replace('*', ''))
  );
}

function findFiles(dir, patterns) {
  const files = [];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!shouldExcludeFile(fullPath)) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          for (const pattern of patterns) {
            if (item.match(pattern.replace('**/*', '.*'))) {
              if (!shouldExcludeFile(fullPath)) {
                files.push(fullPath);
              }
              break;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${currentDir}:`, error.message);
    }
  }
  
  scanDirectory(dir);
  return files;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for common patterns
    for (const pattern of VARIABLE_PATTERNS) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        issues.push({
          type: 'pattern',
          pattern: pattern.description,
          matches: matches.length,
          file: filePath
        });
      }
    }
    
    // Check for specific issues
    for (const fix of SPECIFIC_FIXES) {
      const matches = content.match(fix.pattern);
      if (matches) {
        issues.push({
          type: 'specific',
          pattern: fix.description,
          matches: matches.length,
          file: filePath
        });
      }
    }
    
    // Check for variable definition vs usage mismatches
    const varDefs = content.match(/const\s+(_\w+)\s*=/g) || [];
    const varRefs = content.match(/\b(\w+)\b/g) || [];
    
    for (const def of varDefs) {
      const varName = def.match(/const\s+(_\w+)\s*=/)[1];
      const cleanName = varName.replace('_', '');
      
      // Check if clean name is referenced
      const cleanNameRefs = varRefs.filter(ref => ref === cleanName);
      if (cleanNameRefs.length > 0) {
        issues.push({
          type: 'mismatch',
          pattern: `Variable ${varName} defined but ${cleanName} referenced`,
          matches: cleanNameRefs.length,
          file: filePath,
          details: `${varName} -> ${cleanName}`
        });
      }
    }
    
    return issues;
  } catch (error) {
    console.warn(`Warning: Could not analyze file ${filePath}:`, error.message);
    return [];
  }
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;
    
    // Apply specific fixes
    for (const fix of SPECIFIC_FIXES) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        fixesApplied++;
      }
    }
    
    // Apply variable name consistency fixes
    const varDefs = content.match(/const\s+(_\w+)\s*=/g) || [];
    
    for (const def of varDefs) {
      const varName = def.match(/const\s+(_\w+)\s*=/)[1];
      const cleanName = varName.replace('_', '');
      
      // Check if this variable is referenced without underscore
      const cleanNameRefs = content.match(new RegExp(`\\b${cleanName}\\b`, 'g')) || [];
      
      if (cleanNameRefs.length > 0) {
        // Fix the definition to remove underscore
        const newDef = def.replace(varName, cleanName);
        content = content.replace(def, newDef);
        fixesApplied++;
        
        console.log(`  Fixed: ${varName} -> ${cleanName} in ${path.basename(filePath)}`);
      }
    }
    
    // Fix map function parameter mismatches
    const mapPattern = /\.map\(\(([^,]*),\s*_(\w+)\)\s*=>/g;
    content = content.replace(mapPattern, (match, firstParam, secondParam) => {
      const cleanSecondParam = secondParam.replace('_', '');
      return `.map((${firstParam}, ${cleanSecondParam}) =>`;
    });
    
    // Fix return statement mismatches
    const returnPattern = /return\s*{\s*([^}]*),\s*(\w+)([^}]*)}/g;
    content = content.replace(returnPattern, (match, before, varName, after) => {
      // Check if varName should have underscore
      const varDefs = content.match(new RegExp(`const\\s+(_${varName})\\s*=`, 'g')) || [];
      if (varDefs.length > 0) {
        return `return { ${before}, _${varName}${after} }`;
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
  console.log('🔍 Fixing Underscore Variable Inconsistencies...\n');
  
  let totalFiles = 0;
  let totalIssues = 0;
  let totalFixes = 0;
  
  for (const scanDir of SCAN_DIRS) {
    if (!fs.existsSync(scanDir)) {
      console.log(`⚠️  Directory not found: ${scanDir}`);
      continue;
    }
    
    console.log(`📁 Scanning: ${scanDir}`);
    const files = findFiles(scanDir, FILE_PATTERNS);
    console.log(`   Found ${files.length} files`);
    
    for (const file of files) {
      totalFiles++;
      const issues = analyzeFile(file);
      
      if (issues.length > 0) {
        totalIssues += issues.reduce((sum, issue) => sum + issue.matches, 0);
        console.log(`\n🔧 Fixing: ${path.relative(ROOT_DIR, file)}`);
        
        for (const issue of issues) {
          console.log(`   ${issue.pattern}: ${issue.matches} instances`);
        }
        
        const fixesApplied = fixFile(file);
        totalFixes += fixesApplied;
        
        if (fixesApplied > 0) {
          console.log(`   ✅ Applied ${fixesApplied} fixes`);
        }
      }
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Issues found: ${totalIssues}`);
  console.log(`   Fixes applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n✅ Underscore variable inconsistencies have been fixed!');
    console.log('   The application should now run without these ReferenceError issues.');
  } else {
    console.log('\n✅ No underscore variable inconsistencies were found.');
  }
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test the application to ensure it runs without errors');
  console.log('   2. Check the browser console for any remaining issues');
  console.log('   3. Run the development server: npm run dev');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { analyzeFile, fixFile, findFiles };
