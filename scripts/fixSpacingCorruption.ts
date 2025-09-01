#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface SpacingFix {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  description: string;
}

const SPACING_FIXES: SpacingFix[] = [
  // Import path fixes
  {
    pattern: /from ['"]\.\.?\/[^'"]* \/ [^'"]*['"]/g,
    replacement: (match: string) => match.replace(/ \/ /g, '/'),
    description: 'Fix import path spacing (e.g., "./components / Button" -> "./components/Button")'
  },
  {
    pattern: /import ['"][^'"]* \/ [^'"]*['"]/g,
    replacement: (match: string) => match.replace(/ \/ /g, '/'),
    description: 'Fix import statement spacing'
  },
  
  // CSS class fixes
  {
    pattern: /className=['"][^'"]*-[^'"]*['"]/g,
    replacement: (match: string) => match.replace(/-/g, '-'),
    description: 'Fix CSS class spacing (e.g., "theme-toggle" -> "theme-toggle")'
  },
  
  // JSX attribute fixes
  {
    pattern: /aria-label=/g,
    replacement: 'aria-label=',
    description: 'Fix aria-label attribute spacing'
  },
  {
    pattern: /aria-describedby=/g,
    replacement: 'aria-describedby=',
    description: 'Fix aria-describedby attribute spacing'
  },
  {
    pattern: /data-[a-zA-Z-]*=/g,
    replacement: (match: string) => match.replace(/data-/g, 'data-'),
    description: 'Fix data-* attribute spacing'
  },
  
  // Function parameter spacing
  {
    pattern: /: [a-zA-Z<>\[\]{}|&, ]* > /g,
    replacement: (match: string) => match.replace(/ > /g, '>'),
    description: 'Fix generic type parameter spacing'
  },
  
  // String literal spacing
  {
    pattern: /['"][^'"]*-[^'"]*['"]/g,
    replacement: (match: string) => {
      // Only fix if it's not already a valid path or URL
      if (match.includes('://') || match.startsWith('http')) return match;
      return match.replace(/-/g, '-');
    },
    description: 'Fix string literal spacing (e.g., "high-contrast" -> "high-contrast")'
  },
  
  // Comment spacing
  {
    pattern: /\/\/ [a-zA-Z0-9_]*-[a-zA-Z0-9_]*/g,
    replacement: (match: string) => match.replace(/-/g, '-'),
    description: 'Fix comment spacing'
  },
  
  // Variable name spacing
  {
    pattern: /[a-zA-Z_][a-zA-Z0-9_]*-[a-zA-Z0-9_]*/g,
    replacement: (match: string) => {
      // Only fix if it looks like a corrupted variable name
      if (match.includes(' - ') && !match.includes('(') && !match.includes('[')) {
        return match.replace(/-/g, '-');
      }
      return match;
    },
    description: 'Fix variable name spacing'
  }
];

function shouldProcessFile(filePath: string): boolean {
  const ext = extname(filePath);
  const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html'];
  
  // Skip node_modules and build directories
  if (filePath.includes('node_modules') || 
      filePath.includes('dist') || 
      filePath.includes('.git')) {
    return false;
  }
  
  return validExtensions.includes(ext);
}

function fixFileSpacing(filePath: string): { fixed: boolean; issues: string[] } {
  try {
    const content = readFileSync(filePath, 'utf8');
    let fixedContent = content;
    const issues: string[] = [];
    
    SPACING_FIXES.forEach(fix => {
      const matches = content.match(fix.pattern);
      if (matches && matches.length > 0) {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement as any);
        issues.push(`${fix.description}: ${matches.length} instances`);
      }
    });
    
    if (fixedContent !== content) {
      writeFileSync(filePath, fixedContent, 'utf8');
      return { fixed: true, issues };
    }
    
    return { fixed: false, issues: [] };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { fixed: false, issues: [`Error: ${error}`] };
  }
}

function scanDirectory(dirPath: string): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return files;
}

function main() {
  console.log('🔧 Starting automatic spacing corruption fix...\n');
  
  const projectRoot = process.cwd();
  const srcDir = join(projectRoot, 'src');
  const scriptsDir = join(projectRoot, 'scripts');
  
  // Get all files to process
  const allFiles = [
    ...scanDirectory(srcDir),
    ...scanDirectory(scriptsDir)
  ];
  
  console.log(`📁 Found ${allFiles.length} files to process\n`);
  
  let totalFixed = 0;
  let totalIssues = 0;
  
  // Process each file
  allFiles.forEach(filePath => {
    const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');
    const result = fixFileSpacing(filePath);
    
    if (result.fixed) {
      totalFixed++;
      totalIssues += result.issues.length;
      console.log(`✅ Fixed: ${relativePath}`);
      result.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
  });
  
  console.log(`\n🎉 Spacing corruption fix complete!`);
  console.log(`📊 Summary:`);
  console.log(`   • Files processed: ${allFiles.length}`);
  console.log(`   • Files fixed: ${totalFixed}`);
  console.log(`   • Total issues resolved: ${totalIssues}`);
  
  if (totalFixed > 0) {
    console.log(`\n🚀 Your codebase should now be free of spacing corruption!`);
    console.log(`💡 Try running 'npm run dev' again to see if the syntax errors are resolved.`);
  } else {
    console.log(`\n✨ No spacing corruption found-your codebase is clean!`);
  }
}

// Run the script if called directly
main();

export { fixFileSpacing, SPACING_FIXES };
