#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

async function fixUnderscoreVariables() {
  console.log('🔧 Starting targeted underscore variable fix...\n');
  
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
      
      if (fileFixed) {
        await writeFile(file, newContent, 'utf-8');
        totalFixed++;
        totalIssues += issues.length;
        console.log(`✅ ${file}`);
        issues.forEach(issue => console.log(`   ${issue}`));
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

fixUnderscoreVariables().catch(console.error);
