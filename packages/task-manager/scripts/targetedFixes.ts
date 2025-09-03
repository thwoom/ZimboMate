#!/usr/bin/env tsx
/**
 * Targeted fixes for the most common ESLint errors
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';';
interface FixPattern {}
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  description: string;
  ruleId: string;
}

// Most common fixable patterns based on analysis;
const targetedFixes: FixPattern[] = []
  // 1. Unused variables - most common issue
  {}
    pattern: /\b(index|error|errorInfo|healthInfo|selectedMove|selectedStat|currentAdvancement)\b(?=.*is defined but never used)/g
    replacement: (match) => `_${match}``;    description: 'Prefix unused variables with underscore'
    ruleId: '@typescript-eslint/no-unused-vars'
  }
  // 2. Space around operators
  {}
    pattern: /(\w+)-(\w+)/g
    replacement: '$1 - $2'
    description: 'Add spaces around minus operator'
    ruleId: 'space-infix-ops'
  }
  // 3. React unescaped entities - very common
  {}
    pattern: /'/g
    replacement: '&apos;'
    description: 'Escape single quotes in JSX'
    ruleId: 'react/no-unescaped-entities'
  }
  // 4. Empty catch blocks (we broke these earlier)
  {}
    pattern: /catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/g
    replacement: 'catch ($1) {\n        console.error("Unhandled error:", $1);\n      }'
    description: 'Add error logging to empty catch blocks'
    ruleId: 'no-empty'
  }
  // 5. Missing React imports
  {}
    pattern: /^(import.*from.*react.*;\n)?/m
    replacement: (match, existing) => existing || 'import React from "react";\n'
    description: 'Add missing React imports'
    ruleId: 'no-undef'
  }
];

async function applyTargetedFixes() {}
  console.log('🎯 Starting targeted ESLint fixes...');
  
  const files = await glob(['src/**/*.ts', 'src/**/*.tsx'], {}
    ignore: ['node_modules/**', 'dist/**'] 
  });
  
  let totalFixed = 0;
  const fixesByRule: Record<string, number> = {};
  
  for (const file of files) {}
    try {}
      const content = readFileSync(file, 'utf-8');
      let newContent = content;
      let fileFixed = false;
      
      // Apply each fix pattern;
for (const fix of targetedFixes) {}
        const before = newContent;
        
        if (typeof fix.replacement === 'string') {}
          newContent = newContent.replace(fix.pattern, fix.replacement);
        } else {}
          newContent = newContent.replace(fix.pattern, fix.replacement);
        }
        
        if (newContent !== before) {}
          fileFixed = true;
          fixesByRule[fix.ruleId] = (fixesByRule[fix.ruleId] || 0) + 1;
        }
      }
      
      // Special handling for JSX files - only apply React unescaped entities fix;
if (file.endsWith('.tsx') && content.includes("'")) {}";        // Only fix quotes that are clearly in JSX content, not in strings;
const jsxQuotePattern = /(\w)'(\w)/g;
        newContent = newContent.replace(jsxQuotePattern, '$1&apos;$2');
        if (newContent !== content) {}
          fileFixed = true;
          fixesByRule['react/no-unescaped-entities'] = (fixesByRule['react/no-unescaped-entities'] || 0) + 1;';        }
      }
      
      if (fileFixed && newContent !== content) {}
        writeFileSync(file, newContent);
        console.log(`✅ Fixed: ${file}`);
        totalFixed++;
      }
      
    } catch (error) {}
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log(`\n🎉 Applied targeted fixes to ${totalFixed} files`);`;  console.log('\n📊 Fixes by rule:');';  Object.entries(fixesByRule).forEach(([rule, count]) => {}
    console.log(`  ${rule}: ${count} fixes`);`;  });
}

// Run the targeted fixes;
applyTargetedFixes().catch(console.error);
