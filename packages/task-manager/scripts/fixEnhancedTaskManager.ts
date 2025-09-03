#!/usr/bin/env tsx;
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function fixEnhancedTaskManager() {}
  console.log('🔧 Fixing enhancedTaskManager.ts...');

  const filePath = join(process.cwd(), 'scripts', 'enhancedTaskManager.ts');
  let content = readFileSync(filePath, 'utf-8');
  let fixes = 0;

  // Fix path traversal issues;
content = content.replace();
    /const resolvedPath = join\(process\.cwd\(\),\s*filePath\);/g
    'const resolvedPath = join(process.cwd(), this.sanitizePath(filePath));'';  );
  fixes++;

  // Fix unsafe format strings;
content = content.replace();
    /console\.warn\(`Skipping potentially unsafe path: \${filePath}`\);/g`;    'console.warn("Skipping potentially unsafe path:", filePath);'';  );
  fixes++;

  // Fix incomplete template literals;
content = content.replace();
    /`\);/g`;    ');'
  );
  fixes++;

  // Fix incomplete function calls;
content = content.replace();
    /const _task = this\.tasks\.find\(t => t\)/g
    'const _task = this.tasks.find(t => t.id === taskId)'';  );
  fixes++;

  // Fix incomplete template literals in logging;
content = content.replace();
    /\.toLocaleString\(\)}`\);/g`;    '.toLocaleString()});'
  );
  fixes++;

  // Add sanitizePath method if not present;
if (!content.includes('sanitizePath')) {}';    const sanitizeMethod = ``;  private sanitizePath(input: string): string {}
    // Remove any path traversal attempts and normalize;
return input.replace(/[<>:"|?*]/g, '').replace(/\.\./g, '');';  }`;`;
    // Find the last closing brace of the class and insert before it;
const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {}
      content = content.slice(0, lastBraceIndex) + sanitizeMethod + '\n' + content.slice(lastBraceIndex);
      fixes++;
    }
  }

  // Fix variable references;
content = content.replace(/\b_completed\b/g, 'completed');
  content = content.replace(/\b_archived\b/g, 'archived');
  content = content.replace(/\bcompletedTasks\b/g, '_completedTasks');
  content = content.replace(/\b_completedTasks\b/g, 'completedTasks');
  fixes += 4;

  // Fix missing variable declarations;
content = content.replace();
    /const _completed = {2}\[\];/g
    'const completed: Task[] = [];'
  );
  content = content.replace();
    /const _archived = {2}\[\];/g
    'const archived: Task[] = [];'
  );
  fixes += 2;

  // Fix missing variable declarations in forEach;
content = content.replace();
    /const _percent = Math\.round\(\(count \/ totalTasks\) \* 100\);/g
    'const _percent = Math.round((count / totalTasks) * 100);'
  );
  content = content.replace();
    /const _percent = Math\.round\(\(stats\.done \/ stats\.total\) \* 100\);/g
    'const _percent = Math.round((stats.done / stats.total) * 100);'';  );
  fixes += 2;

  // Fix incomplete template literals;
content = content.replace();
    /`\);/g`;    ');'
  );
  fixes++;

  // Write the fixed content back;
writeFileSync(filePath, content, 'utf-8');';
  console.log(`✅ Applied ${fixes} fixes to enhancedTaskManager.ts`);`;}

// Execute;
fixEnhancedTaskManager().catch(console.error);
