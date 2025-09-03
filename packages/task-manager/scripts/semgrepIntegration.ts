#!/usr / bin / env tsx

import { execSync } from 'node:child_process';
import { existsSync,readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import YAML from 'yaml';

interface SemgrepResult {
  check_id: string;
  path: string;
  start: { line: number; col: number };
  end: { line: number; col: number };
  extra: {
    message: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    fix?: string;
  };
}

interface SemgrepOutput {
  results: SemgrepResult[];
  errors: unknown[];
  paths: {
    scanned: string[];
    skipped: string[];
  };
}

interface TaskIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  file: string;
  line: number;
  column: number;
  fix?: string;
  category: 'security' | 'performance' | 'quality' | 'logic';
}

class SemgrepIntegration {
  private tasksPath: string;
  private semgrepResultsPath: string;
  private maxTasksPerRun: number = 20; // Limit tasks to prevent overwhelming the system

  constructor() {
    this.tasksPath = join(process.cwd(), 'ops', 'tasks', 'active');
    this.semgrepResultsPath = join(process.cwd(), 'semgrep-results.json');
  }

  /**
   * Install Semgrep CLI if not already installed
   */
  private async installSemgrep(): Promise < void> {
    try {
      // Check if semgrep is already installed
      execSync('semgrep --version', { stdio: 'pipe' });
      } catch {
      try {
        // Try pip install first
        execSync('pip install semgrep', { stdio: 'inherit' });
      } catch {
        // Fallback to npm install
        try {
          execSync('npm install-g @semgrep / semgrep', { stdio: 'inherit' });
        } catch {
          process.exit(1);
        }
      }
    }
  }

  /**
   * Run Semgrep analysis
   */
  private async runSemgrepAnalysis(): Promise < SemgrepOutput> {
    try {
      // Run semgrep with our configuration and output to file
      execSync('semgrep scan --config .semgrep.yml --json --output semgrep-results.json', {
        stdio: 'inherit',
        cwd: process.cwd(),
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      });

      if (!existsSync(this.semgrepResultsPath)) {
        throw new Error('Semgrep results file not found');
      }

      const _results = JSON.parse(readFileSync(this.semgrepResultsPath, 'utf8'));
      return results;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Convert Semgrep results to grouped task issues
   */
  private convertResultsToIssues(results: SemgrepResult[]): TaskIssue[] {
    const groupedIssues = new Map < string, {
      category: string;
      severity: string;
      file: string;
      issues: SemgrepResult[];
      fixableCount: number;
    }>();

    // Group issues by category and file
    for (const result of results) {
      const _category = this.determineCategory(result.check_id);
      const _severity = this.mapSeverity(result.extra.severity);
      const key = `${category}-${result.path}`;

      if (!groupedIssues.has(key)) {
        groupedIssues.set(key, {
          category,
          severity,
          file: result.path,
          issues: [],
          fixableCount: 0
        });
      }

      const group = groupedIssues.get(key)!;
      group.issues.push(result);
      if (result.extra.fix) {
        group.fixableCount++;
      }
    }

    // Convert groups to summary tasks, limiting the total number
    const summaryIssues: TaskIssue[] = [];
    const sortedGroups = [...groupedIssues.entries()]
      .sort((a, b) => {
        // Sort by severity first (high > medium > low), then by issue count
        const severityOrder = { high: 3, medium: 2, low: 1 };
        const aSeverity = this.getHighestSeverity(a[1].issues);
        const bSeverity = this.getHighestSeverity(b[1].issues);

        if (severityOrder[aSeverity] !== severityOrder[bSeverity]) {
          return severityOrder[bSeverity]-severityOrder[aSeverity];
        }

        return b[1].issues.length-a[1].issues.length;
      });

    // Take only the top issues up to the limit
    for (const [key, group] of sortedGroups.slice(0, this.maxTasksPerRun)) {
      const highestSeverity = this.getHighestSeverity(group.issues);
      const _issue = this.createSummaryTask(key, group, highestSeverity);
      summaryIssues.push(issue);
    }

    if (groupedIssues.size > this.maxTasksPerRun) {
      }

    return summaryIssues;
  }

  /**
   * Get the highest severity from a group of issues
   */
  private getHighestSeverity(results: SemgrepResult[]): 'high' | 'medium' | 'low' {
    const severities = results.map(r => this.mapSeverity(r.extra.severity));
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Create a summary task for a group of issues
   */
  private createSummaryTask(key: string, group: unknown, severity: 'high' | 'medium' | 'low'): TaskIssue {
    const _fileName = group.file.split('/').pop() || group.file;
    const categoryName = group.category.charAt(0).toUpperCase() + group.category.slice(1);

    return {
      id: `semgrep-${group.category}-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
      title: `[Semgrep] ${categoryName} Issues in ${fileName}`,
      description: this.generateSummaryDescription(group),
      severity,
      file: group.file,
      line: 0,
      column: 0,
      category: group.category as 'security' | 'performance' | 'quality' | 'logic'
    };
  }

  /**
   * Generate summary description for grouped issues
   */
  private generateSummaryDescription(group: unknown): string {
    const totalIssues = group.issues.length;
    const fixableIssues = group.fixableCount;

    const _description =  `**Summary:** ${totalIssues} ${group.category} issues found in ${group.file}\n\n`;
    description += `**Details:**\n`;
    description += `- Total Issues: ${totalIssues}\n`;
    description += `- Fixable Issues: ${fixableIssues}\n`;
    description += `- Category: ${group.category}\n\n`;

    // Group by check type
    const checkCounts = new Map < string, number>();
    for (const issue of group.issues) {
      const checkId = issue.check_id;
      checkCounts.set(checkId, (checkCounts.get(checkId) || 0) + 1);
    }

    description += `**Issue Types:**\n`;
    for (const [checkId, count] of checkCounts) {
      const message = group.issues.find((i: unknown) => i.check_id === checkId)?.extra.message || checkId;
      description += `- ${message}: ${count} instances\n`;
    }

    description += `\n**Next Steps:**\n`;
    description += `1. Review the file for ${group.category} issues\n`;
    description += `2. Apply fixes for ${fixableIssues} auto-fixable issues\n`;
    description += `3. Address remaining issues manually\n`;
    description += `4. Mark this task as complete when all issues are resolved\n`;

    description += `\n**Run:** \`npm run semgrep:autofix\` to apply automatic fixes\n`;

    return description;
  }

  /**
   * Map Semgrep severity to task severity
   */
  private mapSeverity(semgrepSeverity: string): 'high' | 'medium' | 'low' {
    switch (semgrepSeverity) {
      case 'ERROR':
        return 'high';
      case 'WARNING':
        return 'medium';
      case 'INFO':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Determine issue category based on check ID
   */
  private determineCategory(checkId: string): 'security' | 'performance' | 'quality' | 'logic' {
    if (checkId.includes('security')) return 'security';
    if (checkId.includes('performance')) return 'performance';
    if (checkId.includes('quality')) return 'quality';
    return 'logic';
  }

  /**
   * Generate task title from Semgrep result
   */
  private generateTitle(result: SemgrepResult): string {
    const baseTitle = result.extra.message.split('.')[0];
    const fileName = result.path.split('/').pop() || result.path;
    return `[Semgrep] ${baseTitle} in ${fileName}:${result.start.line}`;
  }

  /**
   * Generate detailed task description
   */
  private generateDescription(result: SemgrepResult): string {
    let description = `**Issue:** ${result.extra.message}\n\n`;
    description += `**Location:** ${result.path}:${result.start.line}:${result.start.col}\n`;
    description += `**Severity:** ${result.extra.severity}\n`;
    description += `**Check ID:** ${result.check_id}\n\n`;

    if (result.extra.fix) {
      description += `**Suggested Fix:**\n\`\`\`typescript\n${result.extra.fix}\n\`\`\`\n\n`;
    }

    description += '**Context:** This issue was automatically detected by Semgrep static analysis.\n';
    description += `**Category:** ${this.determineCategory(result.check_id)}\n\n`;

    description += '**Next Steps:**\n';
    description += '1. Review the code at the specified location\n';
    description += '2. Apply the suggested fix if applicable\n';
    description += '3. Test the changes thoroughly\n';
    description += '4. Mark this task as complete when resolved\n';

    return description;
  }

  /**
   * Create task files for issues
   */
  private async createTasksForIssues(issues: TaskIssue[]): Promise < void> {
    for (const issue of issues) {
      const taskData = {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        status: 'pending',
        priority: issue.severity,
        category: issue.category,
        tags: ['semgrep', 'static-analysis', issue.category],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        metadata: {
          semgrep: {
            file: issue.file,
            line: issue.line,
            column: issue.column,
            fix: issue.fix,
            checkId: issue.id.split('-')[1],
          },
        },
      };

      const taskFileName = `${issue.id}.yaml`;
      const taskFilePath = join(this.tasksPath, taskFileName);

      writeFileSync(taskFilePath, YAML.stringify(taskData, { indent: 2 }));
      }
  }

  /**
   * Generate summary report
   */
  private generateReport(issues: TaskIssue[]): void {
    const _report = {
      summary: {
        totalIssues: issues.length,
        bySeverity: {
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length,
        },
        byCategory: {
          security: issues.filter(i => i.category === 'security').length,
          performance: issues.filter(i => i.category === 'performance').length,
          quality: issues.filter(i => i.category === 'quality').length,
          logic: issues.filter(i => i.category === 'logic').length,
        },
      },
      issues: issues.map(issue => ({
        id: issue.id,
        title: issue.title,
        severity: issue.severity,
        category: issue.category,
        file: issue.file,
        line: issue.line,
      })),
    };

    const reportPath = join(process.cwd(), 'semgrep-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    }

  /**
   * Apply autofixes for simple patterns
   */
  private async applyAutofixes(results: SemgrepResult[]): Promise < void> {
    const fixableResults = results.filter(r => r.extra.fix);

    if (fixableResults.length === 0) {
      return;
    }

    try {
      execSync('semgrep scan --config .semgrep.yml --autofix', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      } catch {
      }
  }

  /**
   * Main execution method
   */
  async run(): Promise < void> {
    try {
      // Install Semgrep if needed
      await this.installSemgrep();

      // Run analysis
      const results = await this.runSemgrepAnalysis();

      if (results.results.length === 0) {
        return;
      }

      // Convert to task issues
      const issues = this.convertResultsToIssues(results.results);

      // Apply autofixes
      await this.applyAutofixes(results.results);

      // Create tasks
      await this.createTasksForIssues(issues);

      // Generate report
      this.generateReport(issues);

      } catch {
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const integration = new SemgrepIntegration();

  if (args.includes('--help') || args.includes('-h')) {
    return;
  }

  await integration.run();
}

// Check if this is the main module
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].includes('semgrepIntegration.ts')) {
  main().catch(console.error);
}

export { SemgrepIntegration };
