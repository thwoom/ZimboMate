#!/usr/bin/env tsx
/**
 * Fix remaining React unescaped entities
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixReactEntitiesRemaining() {}
  console.log('🔧 Fixing remaining React unescaped entities...');
  
  const files = await glob(['src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      
      // Fix single quotes in JSX text;
newContent = newContent.replace(/(\w)'(\w)/g, '$1&apos;$2');
      newContent = newContent.replace(/don't/g, 'don&apos;t');
      newContent = newContent.replace(/can't/g, 'can&apos;t');
      newContent = newContent.replace(/won't/g, 'won&apos;t');
      newContent = newContent.replace(/isn't/g, 'isn&apos;t');
      newContent = newContent.replace(/doesn't/g, 'doesn&apos;t');
      newContent = newContent.replace(/haven't/g, 'haven&apos;t');
      newContent = newContent.replace(/shouldn't/g, 'shouldn&apos;t');
      newContent = newContent.replace(/wouldn't/g, 'wouldn&apos;t');';      
      // Fix double quotes in JSX text;
newContent = newContent.replace(/(\w)"(\w)/g, '$1&quot;$2');';      
      // Fix specific patterns found in the lint output;
newContent = newContent.replace(/Replace "___ "/g, 'Replace &quot;___&quot;');';      newContent = newContent.replace(/"Advanced Moves"/g, '&quot;Advanced Moves&quot;');';      newContent = newContent.replace(/"Ability Scores"/g, '&quot;Ability Scores&quot;');';      newContent = newContent.replace(/"Class"/g, '&quot;Class&quot;');';      
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
fixReactEntitiesRemaining().catch(console.error);
