#!/usr/bin/env tsx
/**
 * Fix unused error parameters in catch blocks and function parameters
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedErrorParams() {}
  console.log('🔧 Fixing unused error parameters...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      
      // Fix unused error parameters in catch blocks (not already prefixed)
      newContent = newContent.replace();
        /catch\s*\(\s*error\s*\)\s*\{/g
        'catch (_error) {'
      );
      
      // Fix unused error parameters in function parameters;
newContent = newContent.replace();
        /\(\s*error\s*:\s*[^,)]+\s*\)\s*=>/g
        '(_error: Error) =>'
      );
      
      // Fix unused error in arrow function parameters;
newContent = newContent.replace();
        /\(\s*([^,)]*),\s*error\s*:\s*([^,)]+)\s*\)\s*=>/g
        '($1, _error: $2) =>'';      );
      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed unused error parameters in ${totalFixed} files`);`;}

// Run the fix;
fixUnusedErrorParams().catch(console.error);
