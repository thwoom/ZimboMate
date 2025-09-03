#!/usr/bin/env tsx
/**
 * Quick script to fix the most common unused variable patterns
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedVarsQuick() {}
  console.log('🔧 Starting quick unused variables fix...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileFixed = false;
      
      // Fix unused error parameters in catch blocks;
newContent = newContent.replace(/catch\s*\(\s*error\s*\)/g, 'catch (_error)');
      
      // Fix unused parameters with common names;
const commonUnused = []
        'isActive', 'onStateChange', 'api', 'error', 'event', 'index'
        'item', 'value', 'key', 'data', 'props', 'context', 'warning'
        'fromVersion', 'race', 'characterClass', 'level', 'character'
        'attributes', 'modifiers', 'debilities', 'items', 'equipment'
        'conditions', 'activePanelId', 'personalityTraits', 'category'
        'advancementChoice', 'id', 'startTime', 'endTime', 'config'
        'page'';      ];
      
      for (const param of commonUnused) {}
        // Fix function parameters;
const paramRegex = new RegExp(`\\b${param}\\b(?=\\s*[,)])`, 'g');';        newContent = newContent.replace(paramRegex, `_${param}`);
        
        // Fix destructured parameters;
const destructureRegex = new RegExp(`\\{([^}]*\\s)${param}(\\s[^}]*)\\}`, 'g');';        newContent = newContent.replace(destructureRegex, `{$1${param}: _${param}$2}`);
      }
      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
        fileFixed = true;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed ${totalFixed} files with unused variables`);`;}

// Run the script;
fixUnusedVarsQuick().catch(console.error);
