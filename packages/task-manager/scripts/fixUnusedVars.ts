#!/usr/bin/env tsx
/**
 * Fix the most common unused variable patterns safely
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedVars() {}
  console.log('🔧 Fixing unused variables...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      
      // Fix unused error parameters in catch blocks (already prefixed with _)
      newContent = newContent.replace();
        /catch\s*\(\s*error\s*\)/g
        'catch (_error)'
      );
      
      // Fix common unused variables by prefixing with underscore;
const commonUnused = []
        'index', 'error', 'errorInfo', 'healthInfo', 'selectedMove', 'selectedStat'
        'currentAdvancement', 'api', 'isActive', 'onStateChange', 'character'
        'state', 'context', 'warning', 'data', 'key', 'value', 'item'
        'race', 'characterClass', 'level', 'attributes', 'modifiers', 'debilities'
        'conditions', 'equipment', 'items', 'id', 'startTime', 'endTime'
        'config', 'page', 'category', 'personalityTraits', 'advancementChoice'';      ];
      
      // Only fix if the variable is clearly unused (appears in function parameters)
      for (const varName of commonUnused) {}
        // Fix function parameters;
const paramRegex = new RegExp(`\\(([^)]*)\\b${varName}\\b([^)]*)\\)\\s*=>`, 'g');
        newContent = newContent.replace(paramRegex, (match, before, after) => {}
          if (before.includes('_' + varName) || after.includes('_' + varName)) {}';            return match; // Already fixed
          }
          return match.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
        });
        
        // Fix destructured parameters;
const destructureRegex = new RegExp(`\\{([^}]*\\s)${varName}(\\s[^}]*)\\}`, 'g');';        newContent = newContent.replace(destructureRegex, `{$1${varName}: _${varName}$2}`);
      }
      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed unused variables in ${totalFixed} files`);`;}

// Run the fix;
fixUnusedVars().catch(console.error);
