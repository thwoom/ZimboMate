#!/usr/bin/env tsx
/**
 * Apply Unicorn ESLint plugin modern JS patterns
 * These are safe auto-fixable improvements to modernize the codebase
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnicornPatterns() {
  console.log('🦄 Applying Unicorn modern JS patterns...');
  
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
      
      // Unicorn auto-fixable patterns
      const unicornFixes = [
        // prefer-number-properties: isNaN -> Number.isNaN
        {
          from: /\bisNaN\(/g,
          to: 'Number.isNaN(',
          description: 'isNaN → Number.isNaN'
        },
        
        // prefer-number-properties: isFinite -> Number.isFinite
        {
          from: /\bisFinite\(/g,
          to: 'Number.isFinite(',
          description: 'isFinite → Number.isFinite'
        },
        
        // prefer-number-properties: parseInt -> Number.parseInt
        {
          from: /\bparseInt\(/g,
          to: 'Number.parseInt(',
          description: 'parseInt → Number.parseInt'
        },
        
        // prefer-number-properties: parseFloat -> Number.parseFloat
        {
          from: /\bparseFloat\(/g,
          to: 'Number.parseFloat(',
          description: 'parseFloat → Number.parseFloat'
        },
        
        // prefer-string-starts-ends-with: indexOf === 0 -> startsWith
        {
          from: /\.indexOf\(([^)]+)\)\s*===\s*0/g,
          to: '.startsWith($1)',
          description: 'indexOf === 0 → startsWith'
        },
        
        // prefer-string-starts-ends-with: indexOf !== -1 -> includes
        {
          from: /\.indexOf\(([^)]+)\)\s*!==\s*-1/g,
          to: '.includes($1)',
          description: 'indexOf !== -1 → includes'
        },
        
        // prefer-string-starts-ends-with: indexOf > -1 -> includes
        {
          from: /\.indexOf\(([^)]+)\)\s*>\s*-1/g,
          to: '.includes($1)',
          description: 'indexOf > -1 → includes'
        },
        
        // prefer-string-slice: substring -> slice
        {
          from: /\.substring\(/g,
          to: '.slice(',
          description: 'substring → slice'
        },
        
        // prefer-array-some: find + Boolean -> some
        {
          from: /Boolean\(([^)]+)\.find\(/g,
          to: '$1.some(',
          description: 'Boolean(find) → some'
        },
        
        // prefer-array-find: filter[0] -> find
        {
          from: /\.filter\(([^)]+)\)\[0\]/g,
          to: '.find($1)',
          description: 'filter[0] → find'
        },
        
        // prefer-spread: apply -> spread
        {
          from: /\.apply\(null,\s*([^)]+)\)/g,
          to: '(...$1)',
          description: 'apply(null, args) → ...spread'
        },
        
        // prefer-spread: apply with this -> spread
        {
          from: /\.apply\(this,\s*([^)]+)\)/g,
          to: '(...$1)',
          description: 'apply(this, args) → ...spread'
        },
        
        // throw-new-error: throw Error -> throw new Error
        {
          from: /throw\s+Error\(/g,
          to: 'throw new Error(',
          description: 'throw Error → throw new Error'
        },
        
        // throw-new-error: throw TypeError -> throw new TypeError
        {
          from: /throw\s+TypeError\(/g,
          to: 'throw new TypeError(',
          description: 'throw TypeError → throw new TypeError'
        },
        
        // prefer-ternary: simple if-else -> ternary
        {
          from: /if\s*\(([^)]+)\)\s*\{\s*return\s+([^;]+);\s*\}\s*else\s*\{\s*return\s+([^;]+);\s*\}/g,
          to: 'return $1 ? $2 : $3;',
          description: 'if-else return → ternary'
        },
        
        // no-array-for-each: forEach -> for...of (simple cases)
        {
          from: /\.forEach\(\s*([^,)]+)\s*=>\s*\{([^}]+)\}\s*\)/g,
          to: ' { for (const $1 of this) {$2} }',
          description: 'forEach → for...of'
        }
      ];
      
      for (const fix of unicornFixes) {
        const beforeCount = (newContent.match(fix.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(fix.from, fix.to);
          const afterCount = (newContent.match(fix.from) || []).length;
          
          if (beforeCount > afterCount) {
            fileChanged = true;
            console.log(`  ✅ Applied ${beforeCount - afterCount} ${fix.description} in ${file}`);
          }
        }
      }
      
      // Additional modern patterns
      const modernPatterns = [
        // Prefer const over let when not reassigned
        {
          from: /let\s+(\w+)\s*=\s*([^;]+);(?![^]*\1\s*=)/g,
          to: 'const $1 = $2;',
          description: 'let → const (not reassigned)'
        },
        
        // Remove unnecessary escape characters
        {
          from: /\\'/g,
          to: "'",
          description: 'remove unnecessary escapes'
        }
      ];
      
      for (const pattern of modernPatterns) {
        const beforeCount = (newContent.match(pattern.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(pattern.from, pattern.to);
          const afterCount = (newContent.match(pattern.from) || []).length;
          
          if (beforeCount > afterCount) {
            fileChanged = true;
            console.log(`  ✅ Applied ${beforeCount - afterCount} ${pattern.description} in ${file}`);
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
  
  console.log(`\n🦄 Applied Unicorn patterns to ${totalFiles} files!`);
  return totalFixed;
}

fixUnicornPatterns().catch(console.error);
