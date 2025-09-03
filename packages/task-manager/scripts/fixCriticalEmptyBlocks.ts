#!/usr/bin/env tsx
/**
 * Fix only CRITICAL empty blocks - focus on catch blocks and error handling
 * Ignore cosmetic empty blocks
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixCriticalEmptyBlocks() {
  console.log('🚨 Fixing CRITICAL empty blocks (catch blocks and error handling)...');
  
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
      
      // ONLY fix critical empty blocks that could hide errors
      const criticalPatterns = [
        // Empty catch blocks - CRITICAL (could hide real errors)
        { 
          from: /catch\s*\([^)]*\)\s*\{\s*\}/g, 
          to: 'catch (_error) {\n      // TODO: Add proper error handling\n      console.error("Unhandled error:", _error);\n    }',
          description: 'empty catch blocks'
        },
        
        // Empty error handlers - CRITICAL
        { 
          from: /\.catch\(\s*\(\s*[^)]*\s*\)\s*=>\s*\{\s*\}\s*\)/g, 
          to: '.catch((_error) => {\n      // TODO: Add proper error handling\n      console.error("Unhandled promise error:", _error);\n    })',
          description: 'empty promise catch handlers'
        },
        
        // Empty finally blocks that should have cleanup - CRITICAL
        { 
          from: /finally\s*\{\s*\}/g, 
          to: 'finally {\n      // TODO: Add cleanup logic if needed\n    }',
          description: 'empty finally blocks'
        }
      ];
      
      for (const pattern of criticalPatterns) {
        const beforeCount = (newContent.match(pattern.from) || []).length;
        if (beforeCount > 0) {
          newContent = newContent.replace(pattern.from, pattern.to);
          const afterCount = (newContent.match(pattern.from) || []).length;
          
          if (beforeCount > afterCount) {
            fileChanged = true;
            console.log(`  🚨 Fixed ${beforeCount - afterCount} ${pattern.description} in ${file}`);
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
  
  console.log(`\n🚨 Fixed critical empty blocks in ${totalFiles} files!`);
  console.log('ℹ️  Ignoring cosmetic empty blocks (function stubs, etc.)');
  return totalFixed;
}

fixCriticalEmptyBlocks().catch(console.error);
