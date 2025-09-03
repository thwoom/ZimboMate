#!/usr / bin / env tsx

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';

function fixCommonIssues(content: string, filePath: string): { content: string; fixes: number } {
  let _fixes = 0;
  let newContent = content;

  // Fix 1: Remove trailing whitespace
  newContent = newContent.replace(/[ \t]+$/gm, '');
  fixes += (content.match(/[ \t]+$/gm) || []).length;

  // Fix 2: Ensure consistent spacing around operators
  newContent = newContent.replace(/(\w)\s*([+\-*/=<>!&|])\s*(\w)/g, '$1 $2 $3');
  fixes += (content.match(/(\w)\s*([+\-*/=<>!&|])\s*(\w)/g) || []).length;

  // Fix 3: Remove multiple empty lines
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
  const { content: newContent, fixes } = fixCommonIssues(content, filePath);

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
    } else {
    }

  `);
  }

main();
