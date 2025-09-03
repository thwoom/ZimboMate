#!/usr/bin/env tsx
/**
 * Fix parsing errors introduced by our regex replacements
 * This will clean up any malformed syntax from our automated fixes
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixParsingErrors() {
  console.log('🔧 Fixing parsing errors from regex replacements...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], { 
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileChanged = false;
      
      // Fix common parsing errors from our regex replacements
      const fixes = [
        // Fix malformed string literals with extra quotes
        { from: /(['"])([^'"]*)\1\1/g, to: '$1$2$1', description: 'duplicate quotes' },
        
        // Fix malformed escape sequences
        { from: /\\\\'/g, to: "\\'", description: 'double escapes' },
        { from: /\\\\"/g, to: '\\"', description: 'double escapes' },
        
        // Fix malformed comma expressions
        { from: /,\s*,/g, to: ',', description: 'duplicate commas' },
        { from: /,\s*\}/g, to: '}', description: 'trailing commas before }' },
        { from: /,\s*\]/g, to: ']', description: 'trailing commas before ]' },
        { from: /,\s*\)/g, to: ')', description: 'trailing commas before )' },
        
        // Fix malformed function parameters
        { from: /\(\s*,/g, to: '(', description: 'leading commas in params' },
        { from: /,\s*\)/g, to: ')', description: 'trailing commas in params' },
        
        // Fix malformed object properties
        { from: /{\s*,/g, to: '{', description: 'leading commas in objects' },
        { from: /,\s*}/g, to: '}', description: 'trailing commas in objects' },
        
        // Fix malformed array elements
        { from: /\[\s*,/g, to: '[', description: 'leading commas in arrays' },
        { from: /,\s*\]/g, to: ']', description: 'trailing commas in arrays' },
        
        // Fix malformed template literals
        { from: /`([^`]*)`'/g, to: '`$1`', description: 'template literal quotes' },
        { from: /'([^']*)`/g, to: '`$1`', description: 'mixed quotes in templates' },
        
        // Fix malformed semicolons
        { from: /;;\s*/g, to: '; ', description: 'double semicolons' },
        { from: /;\s*;/g, to: ';', description: 'double semicolons' },
        
        // Fix malformed variable declarations
        { from: /const\s+const\s+/g, to: 'const ', description: 'duplicate const' },
        { from: /let\s+let\s+/g, to: 'let ', description: 'duplicate let' },
        { from: /var\s+var\s+/g, to: 'var ', description: 'duplicate var' },
        
        // Fix malformed function calls
        { from: /\(\s*\(\s*/g, to: '(', description: 'double opening parens' },
        { from: /\s*\)\s*\)/g, to: ')', description: 'double closing parens' },
        
        // Fix malformed regex patterns that got corrupted
        { from: /\$1\$1/g, to: '$1', description: 'duplicate regex captures' },
        { from: /\$2\$2/g, to: '$2', description: 'duplicate regex captures' },
        { from: /\$3\$3/g, to: '$3', description: 'duplicate regex captures' },
        
        // Fix specific patterns we know got corrupted
        { from: /\$2\s*\)/g, to: ')', description: 'leftover regex captures' },
        { from: /\$1\s*\)/g, to: ')', description: 'leftover regex captures' },
        { from: /\(\s*\$2/g, to: '(', description: 'leftover regex captures' },
        { from: /\(\s*\$1/g, to: '(', description: 'leftover regex captures' },
        
        // Fix unterminated strings
        { from: /(['"])([^'"]*)\n/g, to: '$1$2$1;\n', description: 'unterminated strings' },
        
        // Fix missing semicolons after statements
        { from: /}\s*\n\s*([a-zA-Z])/g, to: '}\n$1', description: 'missing semicolons' },
        
        // Fix malformed arrow functions
        { from: /=>\s*=>/g, to: '=>', description: 'duplicate arrow operators' },
        
        // Fix malformed ternary operators
        { from: /\?\s*\?/g, to: '?', description: 'duplicate question marks' },
        { from: /:\s*:/g, to: ':', description: 'duplicate colons' }
      ];
      
      for (const fix of fixes) {
        const beforeCount = (newContent.match(fix.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(fix.from, fix.to);
          const afterCount = (newContent.match(fix.from) || []).length;
          
          if (beforeCount > afterCount) {
            fileChanged = true;
            console.log(`  ✅ Fixed ${beforeCount - afterCount} ${fix.description} in ${file}`);
          }
        }
      }
      
      if (fileChanged) {
        writeFileSync(file, newContent, 'utf-8');
        totalFiles++;
        totalFixed++;
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed parsing errors in ${totalFiles} files!`);
  return totalFixed;
}

fixParsingErrors().catch(console.error);