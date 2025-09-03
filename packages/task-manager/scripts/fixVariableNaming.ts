#!/usr/bin/env tsx

import { readFile,writeFile } from 'node:fs/promises';

import { glob } from 'glob';

interface VariableFix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const VARIABLE_FIXES: VariableFix[] = [
  // Fix variables declared with _ but used without
  {
    pattern: /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*if\s*\(\s*!\s*(\1)\s*\)/g,
    replacement: (match, varName) => match.replace(new RegExp(`\\b${varName.replace('_', '')}\\b`, 'g'), varName),
    description: 'Fix if (!variable) where variable should be _variable'
  },
  {
    pattern: /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\./g,
    replacement: (match, varName) => match.replace(new RegExp(`\\b${varName.replace('_', '')}\\.`, 'g'), `${varName}.`),
    description: 'Fix variable.property where variable should be _variable'
  },
  {
    pattern: /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\[/g,
    replacement: (match, varName) => match.replace(new RegExp(`\\b${varName.replace('_', '')}\\[`, 'g'), `${varName}[`),
    description: 'Fix variable[index] where variable should be _variable'
  },
  {
    pattern: /\bconst\s+(_\w+)\s*=\s*[^;]+;\s*\n\s*(\1)\s*=/g,
    replacement: (match, varName) => match.replace(new RegExp(`\\b${varName.replace('_', '')}\\s*=`, 'g'), `${varName} =`),
    description: 'Fix variable = where variable should be _variable'
  },
  // Fix incomplete function calls
  {
    pattern: /\b(\w+)\.find\((\w+)\s*$/gm,
    replacement: '$1.find($2 => $2)',
    description: 'Fix incomplete .find() calls'
  },
  {
    pattern: /\b(\w+)\.filter\((\w+)\s*$/gm,
    replacement: '$1.filter($2 => $2)',
    description: 'Fix incomplete .filter() calls'
  },
  {
    pattern: /\b(\w+)\.reduce\(\((\w+),\s*(\w+)\)\s*$/gm,
    replacement: '$1.reduce(($2, $3) => $2 + $3, 0)',
    description: 'Fix incomplete .reduce() calls'
  },
  // Fix regex spacing issues
  {
    pattern: /\/\s*\*\s*\//g,
    replacement: '/\\s*/',
    description: 'Fix regex spacing patterns'
  },
  // Fix incomplete template literals
  {
    pattern: /\$\{([^}]*)\s*$/gm,
    replacement: '${$1}',
    description: 'Fix incomplete template literals'
  }
];

async function findSourceFiles(): Promise<string[]> {
  const patterns = [
    'src/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}',
    'test/**/*.{ts,tsx,js,jsx}'
  ];
  
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] });
    files.push(...matches);
  }
  
  return files;
}

async function fixFile(filePath: string): Promise<{ fixed: boolean; issues: string[] }> {
  try {
    const content = await readFile(filePath, 'utf-8');
    let newContent = content;
    const issues: string[] = [];
    
    for (const fix of VARIABLE_FIXES) {
      const matches = newContent.match(fix.pattern);
      if (matches) {
        const before = newContent;
        newContent = newContent.replace(fix.pattern, fix.replacement as any);
        if (newContent !== before) {
          issues.push(`Fixed: ${fix.description}`);
        }
      }
    }
    
    if (newContent !== content) {
      await writeFile(filePath, newContent, 'utf-8');
      return { fixed: true, issues };
    }
    
    return { fixed: false, issues: [] };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { fixed: false, issues: [`Error: ${error}`] };
  }
}

async function main() {
  console.log('🔧 Starting comprehensive variable naming fix...\n');
  
  const files = await findSourceFiles();
  console.log(`Found ${files.length} source files to process\n`);
  
  let totalFixed = 0;
  let totalIssues = 0;
  
  for (const file of files) {
    const result = await fixFile(file);
    if (result.fixed) {
      totalFixed++;
      totalIssues += result.issues.length;
      console.log(`✅ ${file}`);
      for (const issue of result.issues) console.log(`   ${issue}`);
    }
  }
  
  console.log(`\n🎉 Fix complete!`);
  console.log(`📊 Files fixed: ${totalFixed}/${files.length}`);
  console.log(`🔧 Total issues resolved: ${totalIssues}`);
  
  if (totalFixed > 0) {
    console.log(`\n💡 Next steps:`);
    console.log(`1. Run 'npm run lint' to check for remaining issues`);
    console.log(`2. Run 'npx tsc --noEmit --skipLibCheck' to verify TypeScript compilation`);
    console.log(`3. Test the application to ensure it loads properly`);
  }
}

// Run the main function
main().catch(console.error);
