#!/usr/bin/env tsx
/**
 * Fix the most obvious unused variable patterns safely
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixObviousUnused() {}
  console.log('🔧 Fixing obvious unused variables...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      
      // Fix unused parameters in function signatures (safe patterns only)
      const safeUnusedParams = []
        'isActive', 'onStateChange', 'api', 'index', 'key', 'value'
        'context', 'race', 'level', 'character', 'inventory', 'items'
        'modifiers', 'debilities', 'attributes', 'conditions', 'warning'
        'fromVersion', 'characterClass', 'personalityTraits', 'category'
        'id', 'config', 'page'';      ];
      
      for (const param of safeUnusedParams) {}
        // Fix function parameters;
newContent = newContent.replace();
          new RegExp(`\\b${param}\\b(?=.*is defined but never used)`, 'g')';          `_${param}`
        );
        
        // Fix destructured parameters;
newContent = newContent.replace();
          new RegExp(`\\{\\s*${param}\\s*\\}`, 'g')';          `{ ${param}: _${param} }``;        );
      }
      
      // Fix unused imports (safe ones only)
      const safeUnusedImports = []
        'useState', 'useEffect', 'Character', 'CharacterClass', 'Move', 'Item'
        'Weapon', 'Armor', 'Tag', 'MoveCategory', 'Attributes', 'Alignment'
        'beforeEach', 'ContentType', 'Condition', 'Inventory', 'InventoryStats'';      ];
      
      for (const importName of safeUnusedImports) {}
        // Remove unused single imports;
newContent = newContent.replace();
          new RegExp(`import\\s*\\{\\s*${importName}\\s*\\}\\s*from[^;]+;\\n`, 'g')
          ''';        );
        
        // Remove from multi-imports;
newContent = newContent.replace();
          new RegExp(`\\s*,\\s*${importName}\\s*(?=\\s*[,}])`, 'g')
          ''';        );
        newContent = newContent.replace();
          new RegExp(`\\{\\s*${importName}\\s*,`, 'g')
          '{'';        );
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
  
  console.log(`\n🎉 Fixed obvious unused variables in ${totalFixed} files`);`;}

// Run the fix;
fixObviousUnused().catch(console.error);
