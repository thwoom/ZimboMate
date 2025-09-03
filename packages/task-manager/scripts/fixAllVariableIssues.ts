#!/usr/bin/env tsx

import { readFile, writeFile } from 'node:fs/promises';

import { glob } from 'glob';

async function fixAllVariableIssues() {
  console.log('🔧 Starting comprehensive variable issue fix...\n');
  
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
      
      // Pattern 1: const _var = ...; if (!var) -> if (!_var)
      const pattern1 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*if\s*\(\s*!\s*(\1)\s*\)/g;
      if (pattern1.test(newContent)) {
        newContent = newContent.replace(pattern1, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\b`, 'g'), varName);
        });
        issues.push('Fixed if (!variable) -> if (!_variable)');
        fileFixed = true;
      }
      
      // Pattern 2: const _var = ...; var.property -> _var.property
      const pattern2 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\./g;
      if (pattern2.test(newContent)) {
        newContent = newContent.replace(pattern2, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\.`, 'g'), `${varName}.`);
        });
        issues.push('Fixed variable.property -> _variable.property');
        fileFixed = true;
      }
      
      // Pattern 3: const _var = ...; var[ -> _var[
      const pattern3 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\[/g;
      if (pattern3.test(newContent)) {
        newContent = newContent.replace(pattern3, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\[`, 'g'), `${varName}[`);
        });
        issues.push('Fixed variable[ -> _variable[');
        fileFixed = true;
      }
      
      // Pattern 4: const _var = ...; var = -> _var =
      const pattern4 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\s*=/g;
      if (pattern4.test(newContent)) {
        newContent = newContent.replace(pattern4, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\s*=`, 'g'), `${varName} =`);
        });
        issues.push('Fixed variable = -> _variable =');
        fileFixed = true;
      }
      
      // Pattern 5: const _var = ...; handlers.get(var) -> handlers.get(_var)
      const pattern5 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\.get\(/g;
      if (pattern5.test(newContent)) {
        newContent = newContent.replace(pattern5, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\.get\\(`, 'g'), `${varName}.get(`);
        });
        issues.push('Fixed variable.get( -> _variable.get(');
        fileFixed = true;
      }
      
      // Pattern 6: const _var = ...; handlers.has(var) -> handlers.has(_var)
      const pattern6 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\.has\(/g;
      if (pattern6.test(newContent)) {
        newContent = newContent.replace(pattern6, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\.has\\(`, 'g'), `${varName}.has(`);
        });
        issues.push('Fixed variable.has( -> _variable.has(');
        fileFixed = true;
      }
      
      // Pattern 7: const _var = ...; handlers.set(var, -> handlers.set(_var,
      const pattern7 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\.set\(/g;
      if (pattern7.test(newContent)) {
        newContent = newContent.replace(pattern7, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\.set\\(`, 'g'), `${varName}.set(`);
        });
        issues.push('Fixed variable.set( -> _variable.set(');
        fileFixed = true;
      }
      
      // Pattern 8: const _var = ...; handlers.delete(var) -> handlers.delete(_var)
      const pattern8 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\.delete\(/g;
      if (pattern8.test(newContent)) {
        newContent = newContent.replace(pattern8, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\.delete\\(`, 'g'), `${varName}.delete(`);
        });
        issues.push('Fixed variable.delete( -> _variable.delete(');
        fileFixed = true;
      }
      
      // Pattern 9: const _var = ...; var -> _var (general replacement)
      const pattern9 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\b/g;
      if (pattern9.test(newContent)) {
        newContent = newContent.replace(pattern9, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          return match.replace(new RegExp(`\\b${withoutUnderscore}\\b`, 'g'), varName);
        });
        issues.push('Fixed variable -> _variable (general)');
        fileFixed = true;
      }
      
      // Pattern 10: const _var = ...; var.property -> _var.property (more flexible)
      const pattern10 = /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\b/g;
      if (pattern10.test(newContent)) {
        newContent = newContent.replace(pattern10, (match, varName) => {
          const withoutUnderscore = varName.replace('_', '');
          // Replace all occurrences of the variable without underscore with the one with underscore
          const regex = new RegExp(`\\b${withoutUnderscore}\\b`, 'g');
          return match.replace(regex, varName);
        });
        issues.push('Fixed variable -> _variable (flexible)');
        fileFixed = true;
      }
      
      // Pattern 11: Fix incomplete function calls
      const pattern11 = /\b(\w+)\.find\((\w+)\s*$/gm;
      if (pattern11.test(newContent)) {
        newContent = newContent.replace(pattern11, '$1.find($2 => $2)');
        issues.push('Fixed incomplete .find() calls');
        fileFixed = true;
      }
      
      // Pattern 12: Fix incomplete filter calls
      const pattern12 = /\b(\w+)\.filter\((\w+)\s*$/gm;
      if (pattern12.test(newContent)) {
        newContent = newContent.replace(pattern12, '$1.filter($2 => $2)');
        issues.push('Fixed incomplete .filter() calls');
        fileFixed = true;
      }
      
      // Pattern 13: Fix incomplete reduce calls
      const pattern13 = /\b(\w+)\.reduce\(\((\w+),\s*(\w+)\)\s*$/gm;
      if (pattern13.test(newContent)) {
        newContent = newContent.replace(pattern13, '$1.reduce(($2, $3) => $2 + $3, 0)');
        issues.push('Fixed incomplete .reduce() calls');
        fileFixed = true;
      }
      
      // Pattern 14: Fix regex spacing issues
      const pattern14 = /\/\s*\*\s*\//g;
      if (pattern14.test(newContent)) {
        newContent = newContent.replace(pattern14, '/\\s*/');
        issues.push('Fixed regex spacing patterns');
        fileFixed = true;
      }
      
      // Pattern 15: Fix incomplete template literals
      const pattern15 = /\$\{([^}]*)\s*$/gm;
      if (pattern15.test(newContent)) {
        newContent = newContent.replace(pattern15, '${$1}');
        issues.push('Fixed incomplete template literals');
        fileFixed = true;
      }
      
      // Pattern 16: Fix now vs Date.now()
      const pattern16 = /\bnow\.getTime\(\)/g;
      if (pattern16.test(newContent)) {
        newContent = newContent.replace(pattern16, 'Date.now()');
        issues.push('Fixed now.getTime() -> Date.now()');
        fileFixed = true;
      }
      
      // Pattern 17: Fix process.env vs import.meta.env
      const pattern17 = /\bprocess\.env\.REACT_APP_/g;
      if (pattern17.test(newContent)) {
        newContent = newContent.replace(pattern17, 'import.meta.env.VITE_APP_');
        issues.push('Fixed process.env -> import.meta.env');
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
    console.log(`1. Run 'npm run lint' to check for remaining issues`);
    console.log(`2. Run 'npx tsc --noEmit --skipLibCheck' to verify TypeScript compilation`);
    console.log(`3. Test the application to ensure it loads properly`);
  }
}

fixAllVariableIssues().catch(console.error);
