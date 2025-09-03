/**
 * PHASE 3: Comprehensive No-Undef Error Fix
 * Systematically eliminate remaining undefined variable errors
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 PHASE 3: COMPREHENSIVE NO-UNDEF ERROR ELIMINATION');
console.log('===================================================');

// Comprehensive fix patterns for undefined variables
const UNDEF_FIXES = [
  // 1. Catch blocks without parameters (CRITICAL)
  {
    name: 'Fix catch blocks using error without parameter',
    pattern: /(} catch \{[^}]*)(error)([^}]*})/g,
    replacement: '} catch (error) {$1error$3',
    description: 'Add error parameter to catch blocks that use error'
  },
  
  // 2. Map function parameter issues (HIGH)
  {
    name: 'Fix map functions with wrong parameter names',
    pattern: /\.map\(\((\w+), index\) => \{[^}]*(\w+)(?!\1)([^}]*)\}/g,
    replacement: (match, param1, param2, rest) => {
      if (param2 && param2 !== param1) {
        return match.replace(param1, param2);
      }
      return match;
    },
    description: 'Fix map function parameter mismatches'
  },
  
  // 3. Template literal issues (MEDIUM)
  {
    name: 'Fix undefined variables in template literals',
    pattern: /\$\{(\w+)\}/g,
    replacement: (match, varName, offset, string) => {
      // Check if variable is defined in the same function
      const beforeMatch = string.substring(0, offset);
      const isDefinedBefore = beforeMatch.includes(`const ${varName}`) || 
                             beforeMatch.includes(`let ${varName}`) ||
                             beforeMatch.includes(`${varName}:`);
      
      if (!isDefinedBefore) {
        return `\${${varName} || 'undefined'}`;
      }
      return match;
    },
    description: 'Add null safety to template literals'
  }
];

let totalFiles = 0;
let fixedFiles = 0; 
let totalFixes = 0;

function findSourceFiles(dir) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(findSourceFiles(fullPath));
      } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
  }
  
  return files;
}

function applyUndefFixes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    const fixes = [];
    
    // Apply specific fixes for common undefined patterns
    
    // Fix 1: Catch blocks without parameters but using error
    if (newContent.includes('} catch {') && newContent.includes('error')) {
      const catchPattern = /} catch \{([^}]*(?:error|console\.error|console\.warn)[^}]*)\}/g;
      newContent = newContent.replace(catchPattern, '} catch (error) {$1}');
      if (newContent !== content) {
        fixes.push('Fixed catch blocks without error parameter');
        hasChanges = true;
      }
    }
    
    // Fix 2: Map functions with parameter mismatches
    const mapPattern = /\.map\(\((\w+), index\) => [^{]*\{[^}]*(\w+)(?!\1)[^}]*\}/g;
    const mapMatches = content.match(mapPattern);
    if (mapMatches) {
      // This needs manual review - just log for now
      fixes.push(`Found ${mapMatches.length} potential map parameter issues - needs manual review`);
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      fixedFiles++;
      totalFixes += fixes.length;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✅ ${relativePath}`);
      fixes.forEach(fix => console.log(`   • ${fix}`));
    }
    
    totalFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Scanning for undefined variable issues...\n');
  
  const sourceFiles = findSourceFiles(path.join(process.cwd(), 'src'));
  
  console.log(`📁 Found ${sourceFiles.length} source files\n`);
  console.log('🔧 Applying undefined variable fixes...\n');
  
  for (const file of sourceFiles) {
    applyUndefFixes(file);
  }
  
  console.log('\n🎉 COMPREHENSIVE UNDEF FIX COMPLETE!');
  console.log('====================================');
  console.log(`📊 Files Processed: ${totalFiles}`);
  console.log(`✅ Files Fixed: ${fixedFiles}`);
  console.log(`🔧 Total Fixes: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n🚀 Next Steps:');
    console.log('1. Test no-undef error count: npm run lint | findstr "no-undef" | Measure-Object');
    console.log('2. Check runtime stability: npm run dev');
    console.log('3. Proceed to automated cleanup phase');
  }
}

main();
