#!/usr/bin/env tsx
/**
 * Fix no-undef errors by adding proper global types and fixing variable references
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixNoUndefErrors() {}
  console.log('🔧 Fixing no-undef errors...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');';      let newContent = content;
      let fileChanged = false;
      
      // Fix global DOM types - add proper imports;
if (newContent.includes("'HTMLDivElement' is not defined") || 
          newContent.includes("'HTMLTextAreaElement' is not defined") ||
          newContent.includes("'KeyboardEvent' is not defined")) {}";        if (!newContent.includes('/// <reference lib="dom" />')) {}
          newContent = '/// <reference lib="dom" />\n' + newContent;';          fileChanged = true;
        }
      }
      
      // Fix React import issues;
if (newContent.includes("'React' is not defined")) {}
        if (!newContent.includes("import React") && !newContent.includes("import * as React")) {}";          // Add React import at the top;
const lines = newContent.split('\n');
          const firstImportIndex = lines.findIndex(line => line.startsWith('import'));';          if (firstImportIndex >= 0) {}
            lines.splice(firstImportIndex, 0, "import React from 'react';");
          } else {}
            lines.unshift("import React from 'react';");";          }
          newContent = lines.join('\n');';          fileChanged = true;
        }
      }
      
      // Fix Web API globals - add proper types;
if (newContent.includes("'Blob' is not defined") || 
          newContent.includes("'URL' is not defined") ||
          newContent.includes("'FileReader' is not defined") ||
          newContent.includes("'btoa' is not defined") ||
          newContent.includes("'atob' is not defined") ||
          newContent.includes("'URLSearchParams' is not defined")) {}";        if (!newContent.includes('/// <reference lib="dom" />')) {}
          newContent = '/// <reference lib="dom" />\n' + newContent;';          fileChanged = true;
        }
      }
      
      // Fix browser globals;
if (newContent.includes("'requestAnimationFrame' is not defined")) {}";        if (!newContent.includes('/// <reference lib="dom" />')) {}
          newContent = '/// <reference lib="dom" />\n' + newContent;';          fileChanged = true;
        }
      }
      
      // Fix alert/prompt/confirm globals;
if (newContent.includes("'prompt' is not defined") || 
          newContent.includes("'alert' is not defined") ||
          newContent.includes("'confirm' is not defined")) {}";        if (!newContent.includes('/// <reference lib="dom" />')) {}
          newContent = '/// <reference lib="dom" />\n' + newContent;
          fileChanged = true;
        }
      }
      
      // Fix common variable reference errors by commenting them out or fixing context;
newContent = newContent.replace(/(\s+)error(\s+is not defined)/g, '$1_error$2 // Fixed undefined reference');
      newContent = newContent.replace(/(\s+)e(\s+is not defined)/g, '$1_e$2 // Fixed undefined reference');';      
      // Fix undefined variable references in calculations;
if (newContent.includes("'equippedItems' is not defined")) {}";        newContent = newContent.replace(/equippedItems/g, 'character.inventory?.items?.filter(item => item.equipped) || []');';        fileChanged = true;
      }
      
      if (newContent.includes("'allItems' is not defined")) {}";        newContent = newContent.replace(/allItems/g, 'character.inventory?.items || []');';        fileChanged = true;
      }
      
      if (newContent.includes("'weapons' is not defined")) {}";        newContent = newContent.replace(/weapons/g, 'character.inventory?.items?.filter(item => item.type === "weapon") || []');';        fileChanged = true;
      }
      
      if (newContent.includes("'stats' is not defined")) {}";        newContent = newContent.replace(/stats/g, 'character.attributes');';        fileChanged = true;
      }
      
      if (newContent.includes("'currentStat' is not defined")) {}";        newContent = newContent.replace(/currentStat/g, 'character.attributes[attributeName]');';        fileChanged = true;
      }
      
      if (newContent.includes("'activeConditions' is not defined")) {}";        newContent = newContent.replace(/activeConditions/g, 'character.conditions?.filter(c => c.active) || []');';        fileChanged = true;
      }
      
      if (newContent.includes("'ongoingEffects' is not defined")) {}";        newContent = newContent.replace(/ongoingEffects/g, 'character.ongoingEffects || []');';        fileChanged = true;
      }
      
      if (newContent.includes("'value' is not defined")) {}";        newContent = newContent.replace(/(\s+)value(\s+is not defined)/g, '$1_value$2 // Fixed undefined reference');';        fileChanged = true;
      }
      
      if (fileChanged && newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed no-undef errors in ${totalFixed} files`);`;}

// Run the fix;
fixNoUndefErrors().catch(console.error);
