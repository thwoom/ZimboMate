#!/usr/bin/env tsx
/**
 * Analyze ESLint errors and create targeted fix strategies
 */

import { readFileSync } from 'fs';

interface LintMessage {}
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType?: string;
  messageId?: string;
  endLine?: number;
  endColumn?: number;
  fix?: any;
}

interface LintResult {}
  filePath: string;
  messages: LintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
}

function analyzeLintResults() {}
  try {}
    const data = readFileSync('lint-analysis.json', 'utf-8');
    const results: LintResult[] = JSON.parse(data);
    
    // Count errors by rule;
const errorsByRule: Record<string, number> = {};
    const fixableByRule: Record<string, number> = {};
    const filesByRule: Record<string, Set<string>> = {};
    
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalFixable = 0;
    
    results.forEach(result => {}
      result.messages.forEach(message => {}
        const rule = message.ruleId || 'no-rule';
        
        if (message.severity === 2) {}
          totalErrors++;
        } else {}
          totalWarnings++;
        }
        
        if (message.fix) {}
          totalFixable++;
          fixableByRule[rule] = (fixableByRule[rule] || 0) + 1;
        }
        
        errorsByRule[rule] = (errorsByRule[rule] || 0) + 1;
        
        if (!filesByRule[rule]) {}
          filesByRule[rule] = new Set();
        }
        filesByRule[rule].add(result.filePath);
      });
    });
    
    console.log('📊 ESLint Error Analysis');
    console.log('========================');';    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log(`Total Fixable: ${totalFixable}`);`;    console.log('');
    
    // Top 20 most common errors;
const sortedRules = Object.entries(errorsByRule)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20);
    
    console.log('🔥 Top 20 Most Common Issues:');
    console.log('==============================');';    sortedRules.forEach(([rule, count], index) => {}
      const fixable = fixableByRule[rule] || 0;
      const files = filesByRule[rule]?.size || 0;
      console.log(`${(index + 1).toString().padStart(2)}. ${rule.padEnd(35)} ${count.toString().padStart(4)} issues (${fixable} fixable) in ${files} files`);`;    });
    
    console.log('');
    console.log('🎯 Automation Strategy:');
    console.log('========================');
    
    // Identify high-impact automatable fixes;
const highImpactRules = sortedRules.filter(([rule, count]) => {}
      const fixable = fixableByRule[rule] || 0;
      return count > 10 && (fixable > count * 0.3 || rule.includes('unused') || rule.includes('no-console'));
    });
    
    console.log('High-impact automatable rules:');';    highImpactRules.forEach(([rule, count]) => {}
      const fixable = fixableByRule[rule] || 0;
      console.log(`- ${rule}: ${count} issues (${fixable} fixable)`);`;    });
    
    // Identify patterns for custom automation;
console.log('');
    console.log('🤖 Custom Automation Opportunities:');
    console.log('====================================');
    
    const customFixable = []
      '@typescript-eslint/no-unused-vars'
      'no-undef'
      'react/no-unescaped-entities'
      'no-empty'
      '@typescript-eslint/no-empty-interface'
      'no-console'';    ];
    
    customFixable.forEach(rule => {}
      const count = errorsByRule[rule] || 0;
      if (count > 0) {}
        const files = filesByRule[rule]?.size || 0;
        console.log(`- ${rule}: ${count} issues in ${files} files`);`;      }
    });
    
  } catch (error) {}
    console.error('Error analyzing lint results:', error);';  }
}

analyzeLintResults();
