#!/usr / bin / env tsx

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ESLintResult {
  totalProblems: number;
  errors: number;
  warnings: number;
  fixable: number;
  lastRun: string;
  status: 'clean' | 'warnings' | 'errors';
}

function runESLint(): ESLintResult {
  try {
    // Run ESLint and capture output
    const _output = execSync('npm run lint', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // If we get here, ESLint passed with no issues
    return {
      totalProblems: 0,
      errors: 0,
      warnings: 0,
      fixable: 0,
      lastRun: new Date().toISOString(),
      status: 'clean'
    };

  } catch (error: unknown) {
    // ESLint found issues, parse the output
    const _output = error.stdout || error.stderr || '';

    // Parse the summary line (e.g., "✖ 1616 problems (246 errors, 1370 warnings)")
    const summaryMatch = output.match(/✖ (\d+) problems \((\d+) errors, (\d+) warnings\)/);
    const fixableMatch = output.match(/(\d+) errors and \d + warnings potentially fixable/);

    const totalProblems = summaryMatch ? parseInt(summaryMatch[1]) : 0;
    const errors = summaryMatch ? parseInt(summaryMatch[2]) : 0;
    const warnings = summaryMatch ? parseInt(summaryMatch[3]) : 0;
    const fixable = fixableMatch ? parseInt(fixableMatch[1]) : 0;

    const _status = errors > 0 ? 'errors' : 'warnings';

    return {
      totalProblems,
      errors,
      warnings,
      fixable,
      lastRun: new Date().toISOString(),
      status
    };
  }
}

function generateESLintStatusHTML(result: ESLintResult): string {
  const statusColor = result.status === 'clean' ? '#4ade80' :
                     result.status === 'warnings' ? '#f59e0b' : '#ef4444';

  const statusIcon = result.status === 'clean' ? '✅' :
                    result.status === 'warnings' ? '⚠️' : '❌';

  const statusText = result.status === 'clean' ? 'Clean' :
                    result.status === 'warnings' ? 'Warnings' : 'Errors Found';

  return `
    <div class="card">
      <h2>🔍 Code Quality Status</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number" style="color: ${statusColor};">${statusIcon}</div>
          <div>${statusText}</div>
          <div style="margin-top: 10px; font-size: 0.9em; color: #888;">
            Last checked: ${new Date(result.lastRun).toLocaleString()}
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>📊 Total Issues</span><span><strong>${result.totalProblems}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>❌ Errors</span><span><strong>${result.errors}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>⚠️ Warnings</span><span><strong>${result.warnings}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>🔧 Auto-fixable</span><span><strong>${result.fixable}</strong></span>
          </div>
          <hr style="border-color: #404040; margin: 15px 0;">
          <div style="text-align: center; margin-top: 15px;">
            <div style="font-family: monospace; font-size: 0.9em; margin-bottom: 10px;">
              <div>npm run lint:fix</div>
              <div style="color: #888; font-size: 0.8em;">Fix ${result.fixable} issues automatically</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function main() {
  const result = runESLint();

  // Generate HTML snippet
  const htmlSnippet = generateESLintStatusHTML(result);

  // Write to file for dashboard integration
  const outputPath = join(process.cwd(), 'eslint-status.html');
  writeFileSync(outputPath, htmlSnippet);

  // Also write JSON for programmatic access
  const jsonPath = join(process.cwd(), 'eslint-status.json');
  writeFileSync(jsonPath, JSON.stringify(result, null, 2));

  if (result.fixable > 0) {
    }
}

// Run the script
main();
