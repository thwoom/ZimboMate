/**
 * PHASE 3.1: Fix Critical Catch Block Parameter Issues
 * Systematically fix catch blocks missing error parameters
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 PHASE 3.1: FIXING CRITICAL CATCH BLOCK ERRORS');
console.log('================================================');
console.log('');

// Patterns for catch block issues that cause 'error is not defined'
const CATCH_BLOCK_FIXES = [
  {
    name: 'Fix catch blocks without parameters',
    pattern: /} catch \{([^}]*console\.[^(]*\([^,]*error[^)]*\))/g,
    replacement: '} catch (error) {$1',
    description: 'Add error parameter to catch blocks that use error variable'
  },
  {
    name: 'Fix catch blocks with empty parameters',
    pattern: /} catch \(\) \{([^}]*console\.[^(]*\([^,]*error[^)]*\))/g,
    replacement: '} catch (error) {$1',
    description: 'Add error parameter to catch blocks with empty parameters'
  },
  {
    name: 'Fix catch blocks using _error without parameter',
    pattern: /} catch \{([^}]*_error)/g,
    replacement: '} catch (error) {$1',
    description: 'Add error parameter where _error is used'
  }
];

// Additional runtime error patterns
const RUNTIME_ERROR_FIXES = [
  {
    name: 'Fix undefined React imports',
    pattern: /^(?!.*import.*React)(.*(React\.|<))/gm,
    replacement: "import React from 'react';\n$1",
    description: 'Add missing React imports where JSX is used'
  },
  {
    name: 'Fix missing useState imports',
    pattern: /useState/g,
    test: (content) => content.includes('useState') && !content.includes('import.*useState'),
    replacement: (content) => content.replace(/import React from 'react';/, "import React, { useState } from 'react';"),
    description: 'Add useState to React imports'
  }
];

let totalFiles = 0;
let fixedFiles = 0;
let totalFixes = 0;
const fixStats = {};

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return ['.ts', '.tsx', '.js', '.jsx'].includes(ext) && 
         !filePath.includes('node_modules') &&
         !filePath.includes('dist');
}

function findAllFiles(dir) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(findAllFiles(fullPath));
      } else if (shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return files;
}

function fixCatchBlocks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    const appliedFixes = [];
    
    // Apply catch block fixes
    for (const fix of CATCH_BLOCK_FIXES) {
      const beforeContent = newContent;
      newContent = newContent.replace(fix.pattern, fix.replacement);
      
      if (newContent !== beforeContent) {
        const matches = beforeContent.match(fix.pattern);
        const count = matches ? matches.length : 0;
        appliedFixes.push(`${fix.description}: ${count} fixes`);
        fixStats[fix.name] = (fixStats[fix.name] || 0) + count;
        totalFixes += count;
        hasChanges = true;
      }
    }
    
    // Apply additional runtime fixes
    for (const fix of RUNTIME_ERROR_FIXES) {
      if (fix.test && !fix.test(newContent)) continue;
      
      const beforeContent = newContent;
      newContent = newContent.replace(fix.pattern, fix.replacement);
      
      if (newContent !== beforeContent) {
        appliedFixes.push(fix.description);
        fixStats[fix.name] = (fixStats[fix.name] || 0) + 1;
        totalFixes += 1;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      fixedFiles++;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}`);
      appliedFixes.forEach(fix => console.log(`   • ${fix}`));
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Scanning for catch block and runtime error issues...\n');
  
  // Find all source files
  const sourceFiles = findAllFiles(path.join(process.cwd(), 'src'));
  
  console.log(`📁 Found ${sourceFiles.length} source files to process\n`);
  console.log('🔧 Fixing critical catch block and runtime errors...\n');
  
  // Process all files
  for (const file of sourceFiles) {
    fixCatchBlocks(file);
  }
  
  // Print comprehensive summary
  console.log('\n🎉 PHASE 3.1: CRITICAL CATCH BLOCK FIXES COMPLETE!');
  console.log('==================================================');
  console.log(`📊 Files Processed: ${totalFiles}`);
  console.log(`✅ Files Fixed: ${fixedFiles}`);
  console.log(`🔧 Total Fixes Applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n📋 Fixes by Type:');
    Object.entries(fixStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count} fixes`);
      });
    
    console.log('\n🎯 IMPACT: Should significantly reduce no-undef errors');
    console.log('🚀 Next: Run lint analysis to measure improvement');
  } else {
    console.log('\n✨ No catch block issues found - moving to next error pattern');
  }
}

// Execute Phase 3.1
main();
