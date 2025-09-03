#!/usr/bin/env tsx

/**
 * Fix Runtime Errors in Dungeon World Application
 * Applies all patterns learned from manual debugging to eliminate runtime errors
 */

import fs from 'fs';
import path from 'path';

// Target the dungeon-world package
const DUNGEON_WORLD_ROOT = path.join(process.cwd(), '..', 'dungeon-world');
const SRC_DIR = path.join(DUNGEON_WORLD_ROOT, 'src');

console.log('🎯 DUNGEON WORLD RUNTIME ERROR ELIMINATION');
console.log('==========================================');
console.log(`📁 Target: ${DUNGEON_WORLD_ROOT}`);
console.log(`📁 Source: ${SRC_DIR}`);
console.log('');

// Critical runtime error patterns from our successful manual fixes
const RUNTIME_ERROR_PATTERNS = [
  // 1. Variable Reference Errors (CRITICAL - cause immediate runtime failures)
  {
    name: 'Fix _api variable definitions',
    pattern: /const\s+_api\s*=\s*createPanelAPI/g,
    replacement: 'const api = createPanelAPI',
    description: 'Fix _api → api variable definitions',
    priority: 'critical'
  },
  {
    name: 'Fix _state variable definitions',
    pattern: /const\s+_state\s*=/g,
    replacement: 'const state =',
    description: 'Fix _state → state variable definitions',
    priority: 'critical'
  },
  {
    name: 'Fix _id usage in createPanel',
    pattern: /id:\s*_id,/g,
    replacement: 'id: id,',
    description: 'Fix _id → id in createPanel',
    priority: 'critical'
  },
  {
    name: 'Fix _startTime definitions',
    pattern: /const\s+_startTime\s*=/g,
    replacement: 'const startTime =',
    description: 'Fix timing variables',
    priority: 'critical'
  },
  {
    name: 'Fix _endTime definitions',
    pattern: /const\s+_endTime\s*=/g,
    replacement: 'const endTime =',
    description: 'Fix timing variables',
    priority: 'critical'
  },
  
  // 2. Error Type Issues (HIGH - cause type errors)
  {
    name: 'Fix _error type casting',
    pattern: /\(e\s+as\s+_error\)/g,
    replacement: '(e as Error)',
    description: 'Fix error type casting',
    priority: 'high'
  },
  {
    name: 'Fix _errorInfo type references',
    pattern: /React\._errorInfo/g,
    replacement: 'React.ErrorInfo',
    description: 'Fix React error info types',
    priority: 'high'
  },
  {
    name: 'Fix catch parameter naming',
    pattern: /catch\s*\(\s*_error\s*\)/g,
    replacement: 'catch (error)',
    description: 'Fix catch block parameters',
    priority: 'high'
  },
  
  // 3. Map Function Issues (MEDIUM - cause iteration errors)
  {
    name: 'Fix duplicate index parameters',
    pattern: /\.map\(\(index,\s*index\)/g,
    replacement: '.map((item, index)',
    description: 'Fix map function parameters',
    priority: 'medium'
  },
  {
    name: 'Fix question map parameters',
    pattern: /questions\.map\(\(index,\s*index\)/g,
    replacement: 'questions.map((question, index)',
    description: 'Fix question map parameters',
    priority: 'medium'
  },
  {
    name: 'Fix suggestion map parameters', 
    pattern: /suggestions\.map\(\(index,\s*index\)/g,
    replacement: 'suggestions.map((suggestion, index)',
    description: 'Fix suggestion map parameters',
    priority: 'medium'
  },
  
  // 4. Function Call Issues (MEDIUM - cause call errors)
  {
    name: 'Fix extra commas in console calls',
    pattern: /console\.error\([^,]+,\s*,/g,
    replacement: (match) => match.replace(', ,', ','),
    description: 'Remove extra commas in console calls',
    priority: 'medium'
  },
  
  // 5. Null Safety Issues (LOW - defensive programming)
  {
    name: 'Add error message null checks',
    pattern: /\{error\.message\}/g,
    replacement: '{error?.message || "Unknown error"}',
    description: 'Add null safety for error messages',
    priority: 'low'
  }
];

// Statistics tracking
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

function applyFixes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    const appliedFixes = [];
    
    // Apply each pattern
    for (const fix of RUNTIME_ERROR_PATTERNS) {
      const beforeContent = newContent;
      
      if (typeof fix.replacement === 'string') {
        newContent = newContent.replace(fix.pattern, fix.replacement);
      } else {
        newContent = newContent.replace(fix.pattern, fix.replacement);
      }
      
      if (newContent !== beforeContent) {
        const matches = beforeContent.match(fix.pattern);
        const count = matches ? matches.length : 0;
        appliedFixes.push(`${fix.description}: ${count} fixes`);
        fixStats[fix.name] = (fixStats[fix.name] || 0) + count;
        totalFixes += count;
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      fixedFiles++;
      
      const relativePath = path.relative(DUNGEON_WORLD_ROOT, filePath);
      console.log(`✅ ${relativePath}`);
      appliedFixes.forEach(fix => console.log(`   • ${fix}`));
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Scanning Dungeon World source files...\n');
  
  // Find all source files
  const sourceFiles = findAllFiles(SRC_DIR);
  
  console.log(`📁 Found ${sourceFiles.length} source files to process\n`);
  console.log('🔧 Applying runtime error fixes...\n');
  
  // Process all files
  for (const file of sourceFiles) {
    applyFixes(file);
  }
  
  // Print comprehensive summary
  console.log('\n🎉 RUNTIME ERROR ELIMINATION COMPLETE!');
  console.log('======================================');
  console.log(`📊 Files Processed: ${totalFiles}`);
  console.log(`✅ Files Fixed: ${fixedFiles}`);
  console.log(`🔧 Total Fixes Applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n📋 Fixes by Pattern:');
    Object.entries(fixStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([pattern, count]) => {
        console.log(`   ${pattern}: ${count} fixes`);
      });
    
    console.log('\n🚀 PHASE 1 COMPLETE - Next Actions:');
    console.log('1. 🔍 Test application: cd ../dungeon-world && npm run dev');
    console.log('2. 📊 Check build status: npm run build');
    console.log('3. 🔍 Monitor browser console for remaining runtime errors');
    console.log('4. 📈 Run Phase 2 analysis');
  } else {
    console.log('\n✨ No runtime error patterns found - application appears stable!');
    console.log('🔍 Proceeding to Phase 2: Deep Analysis');
  }
  
  console.log('\n🎯 Runtime Error Elimination - Phase 1 Complete');
}

main().catch(console.error);
