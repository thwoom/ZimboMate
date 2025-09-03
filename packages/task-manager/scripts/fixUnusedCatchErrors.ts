#!/usr/bin/env tsx
/**
 * Fix unused error parameters in catch blocks - very safe fix
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function fixUnusedCatchErrors() {}
  console.log('🔧 Fixing unused error parameters in catch blocks...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx', 'test/**/*.ts', 'tests/**/*.ts'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileChanged = false;
      
      // Fix unused error parameters in catch blocks;
const patterns = []
        // Standard error parameter
        { from: /catch\s*\(\s*error\s*\)\s*\{[^}]*\}\s*(?=\s*\/\/.*never used)/g, to: 'catch (_error) {' }
        // Other common error parameter names
        { from: /catch\s*\(\s*e\s*\)\s*\{[^}]*\}\s*(?=\s*\/\/.*never used)/g, to: 'catch (_e) {' }
        // More specific patterns based on ESLint output
        { from: /'error' is defined but never used\. Allowed unused caught errors must match \/\^_\/u/g, to: '' }
        // Direct replacements for specific patterns
        { from: /catch\s*\(\s*error\s*\)\s*\{(\s*)\}/g, to: 'catch (_error) {$1}' }
        { from: /catch\s*\(\s*e\s*\)\s*\{(\s*)\}/g, to: 'catch (_e) {$1}' }';      ];
      
      // Apply safer, more targeted replacements;
if (content.includes("'error' is defined but never used. Allowed unused caught errors must match /^_/u")) {}";        // Replace specific unused error parameters;
newContent = newContent.replace(/catch\s*\(\s*error\s*\)/g, 'catch (_error)');';        fileChanged = true;
      }
      
      if (content.includes("'e' is defined but never used. Allowed unused caught errors must match /^_/u")) {}";        newContent = newContent.replace(/catch\s*\(\s*e\s*\)/g, 'catch (_e)');';        fileChanged = true;
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
  
  console.log(`\n🎉 Fixed unused catch error parameters in ${totalFixed} files`);`;}

// Run the fix;
fixUnusedCatchErrors().catch(console.error);
