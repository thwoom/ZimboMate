#!/usr/bin/env tsx
/**
 * Fix React unescaped entities in JSX files
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixReactEntities() {}
  console.log('🔧 Fixing React unescaped entities...');
  
  const files = await glob(['src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');';      let newContent = content;
      
      // Fix single quotes in JSX text (not in strings or attributes)
      // Only fix obvious cases like "don't" -> "don&apos;t"";      newContent = newContent.replace();
        /(\w)'(\w)/g
        '$1&apos;$2'';      );
      
      // Fix double quotes in JSX text;
newContent = newContent.replace();
        /(\w)"(\w)/g";        '$1&quot;$2'
      );
      
      // Fix specific common patterns;
newContent = newContent.replace();
        /don't/g
        'don&apos;t'
      );
      
      newContent = newContent.replace();
        /can't/g
        'can&apos;t'
      );
      
      newContent = newContent.replace();
        /won't/g
        'won&apos;t'';      );
      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed React unescaped entities in ${totalFixed} files`);`;}

// Run the fix;
fixReactEntities().catch(console.error);
