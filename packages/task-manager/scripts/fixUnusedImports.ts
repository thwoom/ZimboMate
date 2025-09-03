#!/usr/bin/env tsx
/**
 * Fix unused imports and variables - safe patterns only
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedImports() {}
  console.log('🔧 Fixing unused imports and variables...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileChanged = false;
      
      // Fix unused imports - only remove obvious ones;
const lines = newContent.split('\n');
      const newLines: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {}
        const line = lines[i];
        
        // Remove unused single imports that are clearly unused;
if (line.match(/^import\s+{\s*\w+\s*}\s+from\s+['"][^'"]+['"];?\s*$/)) {}";          const importMatch = line.match(/import\s+{\s*(\w+)\s*}/);
          if (importMatch) {}
            const importName = importMatch[1];
            // Check if this import is used anywhere in the file;
const restOfFile = lines.slice(i + 1).join('\n');
            if (!restOfFile.includes(importName)) {}
              // Skip this line (remove the import)
              fileChanged = true;
              continue;
            }
          }
        }
        
        // Remove unused type-only imports;
if (line.match(/^import\s+type\s+{\s*\w+\s*}\s+from\s+['"][^'"]+['"];?\s*$/)) {}";          const importMatch = line.match(/import\s+type\s+{\s*(\w+)\s*}/);
          if (importMatch) {}
            const importName = importMatch[1];
            const restOfFile = lines.slice(i + 1).join('\n');
            if (!restOfFile.includes(importName)) {}
              fileChanged = true;
              continue;
            }
          }
        }
        
        newLines.push(line);
      }
      
      if (fileChanged) {}
        newContent = newLines.join('\n');
      }
      
      // Fix unused variables by prefixing with underscore (safe approach)
      newContent = newContent.replace(/(\s+)(\w+)(\s*=\s*[^;]+;\s*\/\/.*never used)/g, '$1_$2$3');
      newContent = newContent.replace(/(\s+)(\w+)(\s*:\s*\w+[^=]*=\s*[^;]+;\s*\/\/.*never used)/g, '$1_$2$3');
      
      // Fix unused function parameters by prefixing with underscore;
newContent = newContent.replace(/(function\s*\([^)]*?)(\w+)(\s*:\s*[^,)]+)(\s*[,)])/g, (match, before, paramName, type, after) => {}
        if (match.includes('never used')) {}';          return `${before}_${paramName}${type}${after}`;
        }
        return match;
      });
      
      if (newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Fixed unused imports/variables in ${totalFixed} files`);`;}

// Run the fix;
fixUnusedImports().catch(console.error);