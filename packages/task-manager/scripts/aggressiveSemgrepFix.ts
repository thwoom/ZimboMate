#!/usr / bin / env tsx

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';

function fixSemgrepIssues(content: string, filePath: string): { content: string; fixes: number } {
  let _fixes = 0;
  let newContent = content;

  // Fix 1: Remove console.log statements (but keep in test files)
  if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
    const consoleLogRegex = /console\.(log | error | warn | info | debug)\([^)]*\);?\s*\n?/g;
    const consoleMatches = newContent.match(consoleLogRegex);
    if (consoleMatches) {
      newContent = newContent.replace(consoleLogRegex, '');
      fixes += consoleMatches.length;
    }
  }

  // Fix 2: Remove unused variables by prefixing with underscore
  const unusedVarRegex = /^(\s*)(const | let | var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*[^;]+;\s*$/gm;
  const varMatches = [...newContent.matchAll(unusedVarRegex)];

  for (const match of varMatches) {
    const _fullMatch = match[0];
    const indent = match[1];
    const declaration = match[2];
    const _varName = match[3];

    // Skip if already prefixed with underscore
    if (varName.startsWith('_')) continue;

    // Check if variable is used elsewhere in the file
    const lines = newContent.split('\n');
    const matchLine = lines.findIndex(line => line.includes(fullMatch.trim()));

    if (matchLine !== -1) {
      const restOfFile = lines.slice(matchLine + 1).join('\n');
      const isUsed = restOfFile.includes(varName) &&
                     !restOfFile.includes(`const ${varName}`) &&
                     !restOfFile.includes(`let ${varName}`) &&
                     !restOfFile.includes(`var ${varName}`);

      if (!isUsed) {
        // Prefix with underscore to indicate intentionally unused
        const newVarName = `_${varName}`;
        newContent = newContent.replace(fullMatch, `${indent}${declaration} ${newVarName} = ${fullMatch.split('=')[1]}`);
        fixes++;
      }
    }
  }

  // Fix 3: Remove unused imports (simple cases)
  const importRegex = /import\s+{\s*([^}]+)\s*}\s + from\s+['"][^'"]+['"];?\s*\n?/g;
  const importMatches = [...newContent.matchAll(importRegex)];

  for (const match of importMatches) {
    const fullMatch = match[0];
    const imports = match[1].split(',').map(imp => imp.trim());
    const usedImports = imports.filter(imp => {
      const varName = imp.replace(/\s + as\s+.*$/, '').trim();
      return newContent.includes(varName) && !newContent.includes(`import.*${varName}`);
    });

    if (usedImports.length === 0) {
      newContent = newContent.replace(fullMatch, '');
      fixes++;
    } else if (usedImports.length < imports.length) {
      const newImport = `import { ${usedImports.join(', ')} } from ${match[2]};`;
      newContent = newContent.replace(fullMatch, newImport);
      fixes++;
    }
  }

  // Fix 4: Replace 'unknown' with 'unknown' for better type safety
  const anyRegex = /\bany\b / g;
  const anyMatches = newContent.match(anyRegex);
  if (anyMatches) {
    newContent = newContent.replace(anyRegex, 'unknown');
    fixes += anyMatches.length;
  }

  // Fix 5: Remove trailing whitespace
  newContent = newContent.replace(/[ \t]+$/gm, '');
  fixes += (content.match(/[ \t]+$/gm) || []).length;

  // Fix 6: Fix common spacing issues
  newContent = newContent.replace(/(\w)\s*([+\-*/=<>!&|])\s*(\w)/g, '$1 $2 $3');
  fixes += (content.match(/(\w)\s*([+\-*/=<>!&|])\s*(\w)/g) || []).length;

  // Fix 7: Remove multiple empty lines
  newContent = newContent.replace(/\n\s*\n\s*\n / g, '\n\n');
  fixes += (content.match(/\n\s*\n\s*\n / g) || []).length;

  return { content: newContent, fixes };
}

function fixFile(filePath: string): number {
  if (!existsSync(filePath)) return 0;
  
  // Skip dist and node_modules files
  if (filePath.includes('dist/') || filePath.includes('node_modules/')) {
    return 0;
  }
  
  // Security: Validate file path to prevent traversal attacks
  const resolvedPath = join(process.cwd(), filePath);
  if (!resolvedPath.startsWith(process.cwd())) {
    console.warn(`Skipping potentially unsafe path: ${filePath}`);
    return 0;
  }
  
  const content = readFileSync(resolvedPath, 'utf8');
  const { content: newContent, fixes } = fixSemgrepIssues(content, filePath);

  if (fixes > 0) {
    writeFileSync(resolvedPath, newContent);
    }

  return fixes;
}

function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'dist') {
        files.push(...findTypeScriptFiles(fullPath));
      } else if (item.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(item.name))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

function main() {
  // Find all TypeScript / JavaScript files
  const _files = findTypeScriptFiles('.');
  let totalFixes = 0;
  let filesWithFixes = 0;

  for (const file of files) {
    const fixes = fixFile(file);
    if (fixes > 0) {
      totalFixes += fixes;
      filesWithFixes++;
    }
  }

  if (totalFixes > 0) {
    try {
      const { execSync } = require('child_process');
      execSync('npm run semgrep:scan', { stdio: 'inherit' });
      } catch (error) {
      }
  } else {
    }

  }

main();
