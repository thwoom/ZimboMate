#!/usr / bin / env tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  intent?: string;
  deps?: string[];
  artifacts?: string[];
  acceptance?: string[];
  steps?: string[];
  progress?: string;
  done_at?: string;
}

interface ESLintResult {
  totalProblems: number;
  errors: number;
  warnings: number;
  fixable: number;
  lastRun: string;
  status: 'clean' | 'warnings' | 'errors';
}

interface SemgrepResult {
  totalIssues: number;
  security: number;
  quality: number;
  logic: number;
  fixable: number;
  lastRun: string;
  status: 'clean' | 'warnings' | 'errors';
  criticalIssues: number;
}

interface TaskCompletionReport {
  taskId: string;
  taskTitle: string;
  completionDate: string;
  eslintStatus: ESLintResult;
  semgrepStatus: SemgrepResult;
  codeQualityScore: number;
  securityScore: number;
  overallScore: number;
  recommendations: string[];
}

function getESLintStatus(): ESLintResult | null {
  try {
    // Try to get ESLint status from the status file first
    const statusFile = join(process.cwd(), 'eslint-status.json');
    if (existsSync(statusFile)) {
      const _content = readFileSync(statusFile, 'utf8');
      return JSON.parse(content);
    }

    // If no status file, run ESLint to get current status
    execSync('npm run lint:status', { stdio: 'pipe' });

    // Read the generated status
    if (existsSync(statusFile)) {
      const _content = readFileSync(statusFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    }

  return null;
}

function getSemgrepStatus(): SemgrepResult | null {
  try {
    // Try to get Semgrep status from the report file first
    const reportFile = join(process.cwd(), 'semgrep-report.json');
    if (existsSync(reportFile)) {
      const _content = readFileSync(reportFile, 'utf8');
      const _report = JSON.parse(content);

      return {
        totalIssues: report.summary?.totalIssues || 0,
        security: report.summary?.byCategory?.security || 0,
        quality: report.summary?.byCategory?.quality || 0,
        logic: report.summary?.byCategory?.logic || 0,
        fixable: report.summary?.fixableIssues || 0,
        lastRun: report.generatedAt || new Date().toISOString(),
        status: (report.summary?.totalIssues || 0) === 0 ? 'clean' :
                (report.summary?.byCategory?.security || 0) > 0 ? 'errors' : 'warnings',
        criticalIssues: report.summary?.byCategory?.security || 0
      };
    }

    // If no report file, run Semgrep to get current status
    execSync('npm run semgrep:report', { stdio: 'pipe' });

    // Read the generated report
    if (existsSync(reportFile)) {
      const content = readFileSync(reportFile, 'utf8');
      const _report = JSON.parse(content);

      return {
        totalIssues: report.summary?.totalIssues || 0,
        security: report.summary?.byCategory?.security || 0,
        quality: report.summary?.byCategory?.quality || 0,
        logic: report.summary?.byCategory?.logic || 0,
        fixable: report.summary?.fixableIssues || 0,
        lastRun: report.generatedAt || new Date().toISOString(),
        status: (report.summary?.totalIssues || 0) === 0 ? 'clean' :
                (report.summary?.byCategory?.security || 0) > 0 ? 'errors' : 'warnings',
        criticalIssues: report.summary?.byCategory?.security || 0
      };
    }
  } catch (error) {
    }

  return null;
}

function calculateCodeQualityScore(eslintResult: ESLintResult): number {
  if (eslintResult.status === 'clean') return 100;

  // Calculate score based on errors and warnings
  const errorPenalty = eslintResult.errors * 5; // 5 points per error
  const warningPenalty = eslintResult.warnings * 1; // 1 point per warning

  const _score = Math.max(0, 100-errorPenalty-warningPenalty);
  return Math.round(score);
}

function calculateSecurityScore(semgrepResult: SemgrepResult): number {
  if (semgrepResult.status === 'clean') return 100;

  // Calculate score based on security issues (heavily weighted)
  const securityPenalty = semgrepResult.security * 20; // 20 points per security issue
  const qualityPenalty = semgrepResult.quality * 3; // 3 points per quality issue
  const logicPenalty = semgrepResult.logic * 2; // 2 points per logic issue

  const score = Math.max(0, 100-securityPenalty-qualityPenalty-logicPenalty);
  return Math.round(score);
}

function calculateOverallScore(codeQualityScore: number, securityScore: number): number {
  // Weight security more heavily (60% security, 40% code quality)
  const _overallScore =  (securityScore * 0.6) + (codeQualityScore * 0.4);
  return Math.round(overallScore);
}

function generateRecommendations(eslintResult: ESLintResult, semgrepResult: SemgrepResult): string[] {
  const recommendations: string[] = [];

  // ESLint recommendations
  if (eslintResult.fixable > 0) {
    recommendations.push(`Run 'npm run lint:fix' to automatically fix ${eslintResult.fixable} ESLint issues`);
  }

  if (eslintResult.errors > 0) {
    recommendations.push(`Address ${eslintResult.errors} ESLint errors before completing the task`);
  }

  if (eslintResult.warnings > 0) {
    recommendations.push(`Consider addressing ${eslintResult.warnings} ESLint warnings for better code quality`);
  }

  // Semgrep recommendations
  if (semgrepResult.fixable > 0) {
    recommendations.push(`Run 'npm run semgrep:autofix' to automatically fix ${semgrepResult.fixable} security issues`);
  }

  if (semgrepResult.security > 0) {
    recommendations.push(`🚨 CRITICAL: Address ${semgrepResult.security} security issues before completing the task`);
  }

  if (semgrepResult.quality > 0) {
    recommendations.push(`Consider addressing ${semgrepResult.quality} code quality issues found by Semgrep`);
  }

  if (semgrepResult.logic > 0) {
    recommendations.push(`Review ${semgrepResult.logic} logic issues found by Semgrep`);
  }

  // Overall status
  if (eslintResult.status === 'clean' && semgrepResult.status === 'clean') {
    recommendations.push('🎉 Code quality and security are excellent ! Ready for completion.');
  } else if (semgrepResult.security === 0) {
    recommendations.push('✅ No security issues found. Code is safe to complete.');
  }

  return recommendations;
}

function generateTaskCompletionReport(taskId: string, taskTitle: string): TaskCompletionReport {
  const _eslintStatus = getESLintStatus();
  const _semgrepStatus = getSemgrepStatus();

  if (!eslintStatus) {
    throw new Error('Could not get ESLint status');
  }

  if (!semgrepStatus) {
    throw new Error('Could not get Semgrep status');
  }

  const _codeQualityScore = calculateCodeQualityScore(eslintStatus);
  const _securityScore = calculateSecurityScore(semgrepStatus);
  const _overallScore = calculateOverallScore(codeQualityScore, securityScore);
  const recommendations = generateRecommendations(eslintStatus, semgrepStatus);

  return {
    taskId,
    taskTitle,
    completionDate: new Date().toISOString(),
    eslintStatus,
    semgrepStatus,
    codeQualityScore,
    securityScore,
    overallScore,
    recommendations
  };
}

function generateCompletionReportHTML(report: TaskCompletionReport): string {
  const eslintStatusColor = report.eslintStatus.status === 'clean' ? '#4ade80' :
                           report.eslintStatus.status === 'warnings' ? '#f59e0b' : '#ef4444';

  const eslintStatusIcon = report.eslintStatus.status === 'clean' ? '✅' :
                          report.eslintStatus.status === 'warnings' ? '⚠️' : '❌';

  const semgrepStatusColor = report.semgrepStatus.status === 'clean' ? '#4ade80' :
                            report.semgrepStatus.status === 'warnings' ? '#f59e0b' : '#ef4444';

  const semgrepStatusIcon = report.semgrepStatus.status === 'clean' ? '✅' :
                           report.semgrepStatus.status === 'warnings' ? '⚠️' : '❌';

  const overallScoreColor = report.overallScore >= 90 ? '#4ade80' :
                           report.overallScore >= 70 ? '#f59e0b' : '#ef4444';

  const securityScoreColor = report.securityScore >= 90 ? '#4ade80' :
                            report.securityScore >= 70 ? '#f59e0b' : '#ef4444';

  const codeQualityScoreColor = report.codeQualityScore >= 90 ? '#4ade80' :
                               report.codeQualityScore >= 70 ? '#f59e0b' : '#ef4444';

  return `<!DOCTYPE html>
<html>
<head>
  <title > Task Completion Report-${report.taskId}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width = device-width, initial-scale = 1">
  <style > body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 20px; background: #1a1a1a; color: #e0e0e0; }
    .report { max-width: 800px; margin: 0 auto; }
    .card { background: #2d2d2d; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #404040; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .stat { text-align: center; padding: 10px; }
    .big-number { font-size: 2em; font-weight: bold; }
    .recommendation { background: #1f2937; padding: 10px; border-radius: 4px; margin: 5px 0; border-left: 4px solid #4ade80; }
    .command { font-family: 'Consolas', 'Monaco', monospace; background: #1f2937; padding: 8px 12px; border-radius: 4px; margin: 5px 0; }
    h1, h2, h3 { color: #f0f0f0; }
    .header { text-align: center; margin-bottom: 30px; }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>📋 Task Completion Report</h1>
      <h2>${report.taskId}-${report.taskTitle}</h2>
      <p > Generated: ${new Date(report.completionDate).toLocaleString()}</p>
    </div>

    <div class="card">
      <h2>🎯 Overall Assessment</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number" style="color: ${overallScoreColor};">${report.overallScore}/100</div>
          <div > Overall Score</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: ${securityScoreColor};">${report.securityScore}/100</div>
          <div > Security Score</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: ${codeQualityScoreColor};">${report.codeQualityScore}/100</div>
          <div > Code Quality</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: ${semgrepStatusColor};">${semgrepStatusIcon}</div>
          <div > Security Status</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🔒 Security Analysis (Semgrep)</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number" style="color: #ef4444;">${report.semgrepStatus.security}</div>
          <div > Security Issues</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #f59e0b;">${report.semgrepStatus.quality}</div>
          <div > Quality Issues</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #60a5fa;">${report.semgrepStatus.logic}</div>
          <div > Logic Issues</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #4ade80;">${report.semgrepStatus.fixable}</div>
          <div > Auto-fixable</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📊 Code Quality Analysis (ESLint)</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number" style="color: ${eslintStatusColor};">${eslintStatusIcon}</div>
          <div > ESLint Status</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #60a5fa;">${report.eslintStatus.totalProblems}</div>
          <div > Total Issues</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #ef4444;">${report.eslintStatus.errors}</div>
          <div > Errors</div>
        </div>
        <div class="stat">
          <div class="big-number" style="color: #f59e0b;">${report.eslintStatus.warnings}</div>
          <div > Warnings</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📊 Detailed Results</h2>
      <h3>🔒 Security (Semgrep)</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>🚨 Security Issues</span><span><strong>${report.semgrepStatus.security}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>⚠️ Quality Issues</span><span><strong>${report.semgrepStatus.quality}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>🔍 Logic Issues</span><span><strong>${report.semgrepStatus.logic}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>🔧 Auto-fixable</span><span><strong>${report.semgrepStatus.fixable}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <span>📅 Last Scanned</span><span><strong>${new Date(report.semgrepStatus.lastRun).toLocaleString()}</strong></span>
      </div>

      <h3>📝 Code Quality (ESLint)</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>❌ Errors</span><span><strong>${report.eslintStatus.errors}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>⚠️ Warnings</span><span><strong>${report.eslintStatus.warnings}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>🔧 Auto-fixable</span><span><strong>${report.eslintStatus.fixable}</strong></span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>📅 Last Checked</span><span><strong>${new Date(report.eslintStatus.lastRun).toLocaleString()}</strong></span>
      </div>
    </div>

    <div class="card">
      <h2>💡 Recommendations</h2>
      ${report.recommendations.map(rec => `}
        <div class="recommendation">${rec}</div>
      `).join('')}
    </div>

    <div class="card">
      <h2>🛠️ Quick Actions</h2>

      <h3>🔒 Security Actions</h3>
      <div class="command">npm run semgrep:autofix</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 15px;">Auto-fix ${report.semgrepStatus.fixable} security issues</div>

      <div class="command">npm run semgrep:scan</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 15px;">Re-run security scan</div>

      <div class="command">npm run semgrep:report</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 20px;">Generate detailed security report</div>

      <h3>📝 Code Quality Actions</h3>
      <div class="command">npm run lint:fix</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 15px;">Auto-fix ${report.eslintStatus.fixable} ESLint issues</div>

      <div class="command">npm run lint</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 15px;">Re-check code quality</div>

      <div class="command">npm run lint:status</div>
      <div style="color: #888; font-size: 0.8em; margin-bottom: 15px;">Generate updated ESLint status</div>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #888;">
      <p>🔄 Report generated at ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    process.exit(1);
  }

  const taskId = args[0];
  const taskTitle = args.slice(1).join(' ');

  try {
    const report = generateTaskCompletionReport(taskId, taskTitle);

    // Generate HTML report
    const _html = generateCompletionReportHTML(report);
    const htmlPath = join(process.cwd(), `task-completion-${taskId}.html`);
    writeFileSync(htmlPath, html);

    // Generate JSON report
    const jsonPath = join(process.cwd(), `task-completion-${taskId}.json`);
    writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    if (report.recommendations.length > 0) {
      report.recommendations.forEach(rec => );
    }

  } catch (error) {
    process.exit(1);
  }
}

// Run the script
main();
