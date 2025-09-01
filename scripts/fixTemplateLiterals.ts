#!/usr/bin/env tsx

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';

async function fixTemplateLiterals() {
  console.log('🔧 Starting template literal fix...\n');
  
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
      
      // Pattern 1: Fix empty template literal expressions ${}
      const pattern1 = /\$\{\s*\}/g;
      if (pattern1.test(newContent)) {
        newContent = newContent.replace(pattern1, '');
        issues.push('Fixed empty template literal expressions ${}');
        fileFixed = true;
      }
      
      // Pattern 2: Fix malformed template literals with empty content
      const pattern2 = /\$\{\s*\n\s*([^}]*)\s*\}\s*\n\s*([^}]*)\s*\}\s*\n\s*\}/g;
      if (pattern2.test(newContent)) {
        newContent = newContent.replace(pattern2, '${$1 $2}');
        issues.push('Fixed malformed multi-line template literals');
        fileFixed = true;
      }
      
      // Pattern 3: Fix template literals with missing closing brace
      const pattern3 = /\$\{([^}]*)\s*$/gm;
      if (pattern3.test(newContent)) {
        newContent = newContent.replace(pattern3, '${$1}');
        issues.push('Fixed incomplete template literals');
        fileFixed = true;
      }
      
      // Pattern 4: Fix template literals with extra spaces and braces
      const pattern4 = /\$\{\s*([^}]*)\s*\}\s*\n\s*([^}]*)\s*\}\s*\n\s*\}/g;
      if (pattern4.test(newContent)) {
        newContent = newContent.replace(pattern4, '${$1 $2}');
        issues.push('Fixed template literals with extra braces');
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
    console.log(`1. Test the application to ensure it loads properly`);
    console.log(`2. Run 'npm run lint' to check for remaining issues`);
  }
}

fixTemplateLiterals().catch(console.error);
