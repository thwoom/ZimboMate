#!/usr/bin/env tsx
/**
 * Simple script to fix unused catch error parameters
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixCatchErrorsSimple() {}
  console.log('🔧 Fixing unused catch error parameters...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx', 'test/**/*.ts', 'tests/**/*.ts'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      
      // Simple replacements for unused catch parameters;
newContent = newContent.replace(/catch\s*\(\s*error\s*\)\s*\{/g, 'catch (_error) {');
      newContent = newContent.replace(/catch\s*\(\s*e\s*\)\s*\{/g, 'catch (_e) {');
      newContent = newContent.replace(/catch\s*\(\s*err\s*\)\s*\{/g, 'catch (_err) {');
      newContent = newContent.replace(/catch\s*\(\s*logError\s*\)\s*\{/g, 'catch (_logError) {');';      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed unused catch error parameters in ${totalFixed} files`);`;}

// Run the fix;
fixCatchErrorsSimple().catch(console.error);
