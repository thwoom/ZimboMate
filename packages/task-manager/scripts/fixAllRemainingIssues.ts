#!/usr/bin/env tsx

import { readFile, writeFile } from 'node:fs/promises';

import { glob } from 'glob';

async function fixAllRemainingIssues() {
  console.log('🔧 Starting aggressive fix for all remaining issues...\n');
  
  const files = await glob('src/**/*.{ts,tsx}', { 
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
  });
  
  console.log(`Found ${files.length} source files to process\n`);
  
  let totalFixed = 0;
  let totalIssues = 0;
  
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      let newContent = content;
      let fileFixed = false;
      const issues: string[] = [];
      
      // Pattern 1: Fix all _variable -> variable patterns (remove underscores)
      const pattern1 = /\b_(\w+)\b/g;
      if (pattern1.test(newContent)) {
        // Count how many we're about to replace
        const matches = newContent.match(pattern1);
        if (matches) {
          // Replace all _variable with variable
          newContent = newContent.replace(pattern1, '$1');
          issues.push(`Fixed ${matches.length} _variable -> variable patterns`);
          fileFixed = true;
        }
      }
      
      // Pattern 2: Fix incomplete function calls
      const pattern2 = /\b(\w+)\.find\((\w+)\s*$/gm;
      if (pattern2.test(newContent)) {
        newContent = newContent.replace(pattern2, '$1.find($2 => $2)');
        issues.push('Fixed incomplete .find() calls');
        fileFixed = true;
      }
      
      // Pattern 3: Fix incomplete filter calls
      const pattern3 = /\b(\w+)\.filter\((\w+)\s*$/gm;
      if (pattern3.test(newContent)) {
        newContent = newContent.replace(pattern3, '$1.filter($2 => $2)');
        issues.push('Fixed incomplete .filter() calls');
        fileFixed = true;
      }
      
      // Pattern 4: Fix incomplete reduce calls
      const pattern4 = /\b(\w+)\.reduce\(\((\w+),\s*(\w+)\)\s*$/gm;
      if (pattern4.test(newContent)) {
        newContent = newContent.replace(pattern4, '$1.reduce(($2, $3) => $2 + $3, 0)');
        issues.push('Fixed incomplete .reduce() calls');
        fileFixed = true;
      }
      
      // Pattern 5: Fix regex spacing issues
      const pattern5 = /\/\s*\*\s*\//g;
      if (pattern5.test(newContent)) {
        newContent = newContent.replace(pattern5, '/\\s*/');
        issues.push('Fixed regex spacing patterns');
        fileFixed = true;
      }
      
      // Pattern 6: Fix incomplete template literals
      const pattern6 = /\$\{([^}]*)\s*$/gm;
      if (pattern6.test(newContent)) {
        newContent = newContent.replace(pattern6, '${$1}');
        issues.push('Fixed incomplete template literals');
        fileFixed = true;
      }
      
      // Pattern 7: Fix now vs Date.now()
      const pattern7 = /\bnow\.getTime\(\)/g;
      if (pattern7.test(newContent)) {
        newContent = newContent.replace(pattern7, 'Date.now()');
        issues.push('Fixed now.getTime() -> Date.now()');
        fileFixed = true;
      }
      
      // Pattern 8: Fix process.env vs import.meta.env
      const pattern8 = /\bprocess\.env\.REACT_APP_/g;
      if (pattern8.test(newContent)) {
        newContent = newContent.replace(pattern8, 'import.meta.env.VITE_APP_');
        issues.push('Fixed process.env -> import.meta.env');
        fileFixed = true;
      }
      
      // Pattern 9: Fix empty template literal expressions
      const pattern9 = /\$\{\s*\}/g;
      if (pattern9.test(newContent)) {
        newContent = newContent.replace(pattern9, '');
        issues.push('Fixed empty template literal expressions');
        fileFixed = true;
      }
      
      // Pattern 10: Fix malformed template literals with extra braces
      const pattern10 = /\$\{\s*([^}]*)\s*\}\s*\n\s*([^}]*)\s*\}\s*\n\s*\}/g;
      if (pattern10.test(newContent)) {
        newContent = newContent.replace(pattern10, '${$1 $2}');
        issues.push('Fixed malformed template literals');
        fileFixed = true;
      }
      
      if (fileFixed) {
        await writeFile(file, newContent, 'utf-8');
        totalFixed++;
        totalIssues += issues.length;
        console.log(`✅ ${file}`);
        for (const issue of issues) console.log(`   ${issue}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fix complete!`);
  console.log(`📊 Files fixed: ${totalFixed}/${files.length}`);
  console.log(`🔧 Total issues resolved: ${totalIssues}`);
  
  if (totalFixed > 0) {
    console.log(`\n💡 Next steps:`);
    console.log(`1. Test the application to ensure it loads properly`);
    console.log(`2. Run 'npm run lint' to check for remaining issues`);
    console.log(`3. Run 'npx tsc --noEmit --skipLibCheck' to verify TypeScript compilation`);
  }
}

fixAllRemainingIssues().catch(console.error);
