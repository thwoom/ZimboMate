#!/usr/bin/env tsx

/**
 * PHASE 2: Deep Analysis & Categorization for Dungeon World
 * Comprehensive error analysis and categorization system
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ErrorCategory {
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  fixStrategy: 'automated' | 'manual' | 'mixed';
  estimatedEffort: 'low' | 'medium' | 'high';
  runtimeImpact: 'blocking' | 'degraded' | 'cosmetic';
}

interface ErrorPattern {
  rule: string;
  count: number;
  files: string[];
  category: ErrorCategory;
  examples: string[];
  fixRecommendation: string;
}

interface ComprehensiveAnalysis {
  timestamp: string;
  totalErrors: number;
  totalWarnings: number;
  totalFiles: number;
  errorsByCategory: Record<string, ErrorPattern[]>;
  priorityMatrix: Record<string, number>;
  automationOpportunities: string[];
  manualReviewRequired: string[];
  recommendations: string[];
}

class DungeonWorldErrorAnalyzer {
  private dungeonWorldPath: string;
  private analysis: ComprehensiveAnalysis;

  constructor() {
    this.dungeonWorldPath = join(process.cwd(), '..', 'dungeon-world');
    this.analysis = {
      timestamp: new Date().toISOString(),
      totalErrors: 0,
      totalWarnings: 0,
      totalFiles: 0,
      errorsByCategory: {},
      priorityMatrix: {},
      automationOpportunities: [],
      manualReviewRequired: [],
      recommendations: []
    };
  }

  /**
   * Execute comprehensive error analysis
   */
  async executeAnalysis(): Promise<ComprehensiveAnalysis> {
    console.log('🔬 PHASE 2: DEEP ANALYSIS & CATEGORIZATION');
    console.log('==========================================');
    console.log(`📁 Target: ${this.dungeonWorldPath}`);
    console.log('');

    // Step 1: Run ESLint analysis on dungeon-world
    console.log('📊 Step 1: Running ESLint analysis...');
    const lintResults = await this.runLintAnalysis();
    
    // Step 2: Categorize errors by type and impact
    console.log('🏷️  Step 2: Categorizing errors...');
    const categorizedErrors = this.categorizeErrors(lintResults);
    
    // Step 3: Analyze automation opportunities
    console.log('🤖 Step 3: Analyzing automation opportunities...');
    const automationAnalysis = this.analyzeAutomationOpportunities(categorizedErrors);
    
    // Step 4: Generate recommendations
    console.log('💡 Step 4: Generating recommendations...');
    const recommendations = this.generateRecommendations(categorizedErrors, automationAnalysis);
    
    // Step 5: Create priority matrix
    console.log('📈 Step 5: Creating priority matrix...');
    const priorityMatrix = this.createPriorityMatrix(categorizedErrors);
    
    // Compile final analysis
    this.analysis = {
      timestamp: new Date().toISOString(),
      totalErrors: lintResults.totalErrors,
      totalWarnings: lintResults.totalWarnings,
      totalFiles: lintResults.totalFiles,
      errorsByCategory: categorizedErrors,
      priorityMatrix,
      automationOpportunities: automationAnalysis.opportunities,
      manualReviewRequired: automationAnalysis.manualRequired,
      recommendations
    };

    return this.analysis;
  }

  /**
   * Run ESLint analysis on dungeon-world project
   */
  private async runLintAnalysis(): Promise<any> {
    try {
      // Change to dungeon-world directory and run lint
      const command = `cd "${this.dungeonWorldPath}" && npm run lint 2>&1`;
      const output = execSync(command, { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });

      return this.parseLintOutput(output);
    } catch (error: any) {
      // ESLint returns non-zero exit code when issues are found
      const output = error.stdout || error.stderr || '';
      return this.parseLintOutput(output);
    }
  }

  /**
   * Parse ESLint output into structured data
   */
  private parseLintOutput(output: string): any {
    const lines = output.split('\n');
    const errors: any[] = [];
    const warnings: any[] = [];
    const fileSet = new Set<string>();

    for (const line of lines) {
      if (line.includes('error') || line.includes('warning')) {
        const isWarning = line.includes('warning');
        const ruleMatch = line.match(/\s+([a-z-/@]+)$/);
        const fileMatch = line.match(/^([^:]+):/);
        
        if (ruleMatch && fileMatch) {
          const rule = ruleMatch[1];
          const file = fileMatch[1].replace(/.*dungeon-world[\\\/]/, '');
          fileSet.add(file);
          
          const errorInfo = {
            rule,
            file,
            line,
            isWarning
          };
          
          if (isWarning) {
            warnings.push(errorInfo);
          } else {
            errors.push(errorInfo);
          }
        }
      }
    }

    return {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      totalFiles: fileSet.size,
      errors,
      warnings
    };
  }

  /**
   * Categorize errors by type and impact
   */
  private categorizeErrors(lintResults: any): Record<string, ErrorPattern[]> {
    const categories: Record<string, ErrorPattern[]> = {
      'Critical Runtime Errors': [],
      'Type Safety Issues': [],
      'Code Quality Issues': [],
      'Performance Issues': [],
      'Accessibility Issues': [],
      'Test File Issues': [],
      'Cosmetic Issues': []
    };

    // Define error categories
    const errorRuleMapping: Record<string, string> = {
      '@typescript-eslint/no-unused-vars': 'Code Quality Issues',
      'no-undef': 'Critical Runtime Errors',
      '@typescript-eslint/no-explicit-any': 'Type Safety Issues',
      'no-empty': 'Code Quality Issues',
      'react/no-unescaped-entities': 'Accessibility Issues',
      'no-console': 'Code Quality Issues',
      '@typescript-eslint/no-empty-interface': 'Type Safety Issues',
      'prefer-const': 'Code Quality Issues',
      'jsx-a11y/select-has-accessible-name': 'Accessibility Issues',
      'unused-imports/no-unused-imports': 'Code Quality Issues',
      '@typescript-eslint/no-unsafe-function-type': 'Type Safety Issues'
    };

    // Group errors by rule
    const errorsByRule: Record<string, any[]> = {};
    
    [...lintResults.errors, ...lintResults.warnings].forEach(error => {
      if (!errorsByRule[error.rule]) {
        errorsByRule[error.rule] = [];
      }
      errorsByRule[error.rule].push(error);
    });

    // Categorize each rule
    Object.entries(errorsByRule).forEach(([rule, errors]) => {
      const category = errorRuleMapping[rule] || 'Code Quality Issues';
      const files = [...new Set(errors.map(e => e.file))];
      
      const errorPattern: ErrorPattern = {
        rule,
        count: errors.length,
        files,
        category: this.getErrorCategory(rule),
        examples: errors.slice(0, 3).map(e => `${e.file}:${e.line}`),
        fixRecommendation: this.getFixRecommendation(rule)
      };

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(errorPattern);
    });

    return categories;
  }

  /**
   * Get error category details
   */
  private getErrorCategory(rule: string): ErrorCategory {
    const categoryMap: Record<string, ErrorCategory> = {
      'no-undef': {
        name: 'Critical Runtime Errors',
        description: 'Undefined variables that cause runtime failures',
        priority: 'critical',
        fixStrategy: 'automated',
        estimatedEffort: 'low',
        runtimeImpact: 'blocking'
      },
      '@typescript-eslint/no-unused-vars': {
        name: 'Code Quality Issues',
        description: 'Unused variables that clutter code',
        priority: 'medium',
        fixStrategy: 'automated',
        estimatedEffort: 'low',
        runtimeImpact: 'cosmetic'
      },
      '@typescript-eslint/no-explicit-any': {
        name: 'Type Safety Issues',
        description: 'Type safety violations that reduce code quality',
        priority: 'medium',
        fixStrategy: 'manual',
        estimatedEffort: 'medium',
        runtimeImpact: 'degraded'
      },
      'jsx-a11y/select-has-accessible-name': {
        name: 'Accessibility Issues',
        description: 'Accessibility violations affecting user experience',
        priority: 'high',
        fixStrategy: 'automated',
        estimatedEffort: 'low',
        runtimeImpact: 'degraded'
      }
    };

    return categoryMap[rule] || {
      name: 'Code Quality Issues',
      description: 'General code quality improvements',
      priority: 'medium',
      fixStrategy: 'mixed',
      estimatedEffort: 'medium',
      runtimeImpact: 'cosmetic'
    };
  }

  /**
   * Get fix recommendation for specific rule
   */
  private getFixRecommendation(rule: string): string {
    const recommendations: Record<string, string> = {
      'no-undef': 'CRITICAL: Fix variable references immediately - these cause runtime errors',
      '@typescript-eslint/no-unused-vars': 'AUTO: Run automated unused variable cleaner',
      '@typescript-eslint/no-explicit-any': 'MANUAL: Replace any types with specific types',
      'jsx-a11y/select-has-accessible-name': 'AUTO: Add aria-label attributes to select elements',
      'no-empty': 'AUTO: Add TODO comments or proper error handling to empty blocks',
      'prefer-const': 'AUTO: Run ESLint auto-fix',
      'unused-imports/no-unused-imports': 'AUTO: Run import cleaner script',
      'react/no-unescaped-entities': 'AUTO: Run React entity escaper'
    };

    return recommendations[rule] || 'Review and fix manually';
  }

  /**
   * Analyze automation opportunities
   */
  private analyzeAutomationOpportunities(categorizedErrors: Record<string, ErrorPattern[]>): any {
    const opportunities: string[] = [];
    const manualRequired: string[] = [];

    Object.entries(categorizedErrors).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.category.fixStrategy === 'automated' && pattern.count > 5) {
          opportunities.push(
            `${pattern.rule}: ${pattern.count} issues across ${pattern.files.length} files - HIGH AUTOMATION VALUE`
          );
        } else if (pattern.category.fixStrategy === 'manual' && pattern.count > 10) {
          manualRequired.push(
            `${pattern.rule}: ${pattern.count} issues - REQUIRES MANUAL REVIEW`
          );
        }
      });
    });

    return { opportunities, manualRequired };
  }

  /**
   * Generate comprehensive recommendations
   */
  private generateRecommendations(categorizedErrors: Record<string, ErrorPattern[]>, automationAnalysis: any): string[] {
    const recommendations: string[] = [];

    // Critical recommendations
    Object.entries(categorizedErrors).forEach(([category, patterns]) => {
      const criticalPatterns = patterns.filter(p => p.category.priority === 'critical');
      if (criticalPatterns.length > 0) {
        recommendations.push(`🚨 IMMEDIATE: Fix ${criticalPatterns.length} critical runtime error patterns in ${category}`);
      }
    });

    // Automation recommendations
    if (automationAnalysis.opportunities.length > 0) {
      recommendations.push(`🤖 HIGH VALUE: ${automationAnalysis.opportunities.length} error patterns can be automated`);
    }

    // Strategic recommendations
    recommendations.push('📊 STRATEGY: Focus on source files first, test files second');
    recommendations.push('🎯 PRIORITY: Runtime errors > Type safety > Code quality > Cosmetic');
    recommendations.push('⚡ EFFICIENCY: Use automated fixes for bulk issues, manual for complex logic');

    return recommendations;
  }

  /**
   * Create priority matrix
   */
  private createPriorityMatrix(categorizedErrors: Record<string, ErrorPattern[]>): Record<string, number> {
    const matrix: Record<string, number> = {};

    Object.entries(categorizedErrors).forEach(([category, patterns]) => {
      const totalCount = patterns.reduce((sum, p) => sum + p.count, 0);
      const avgPriority = patterns.reduce((sum, p) => {
        const priorityScore = p.category.priority === 'critical' ? 4 :
                             p.category.priority === 'high' ? 3 :
                             p.category.priority === 'medium' ? 2 : 1;
        return sum + priorityScore;
      }, 0) / patterns.length;

      matrix[category] = Math.round(totalCount * avgPriority);
    });

    return matrix;
  }

  /**
   * Generate comprehensive report
   */
  generateReport(): string {
    const report = `
# PHASE 2: COMPREHENSIVE ERROR ANALYSIS REPORT
Generated: ${this.analysis.timestamp}

## 📊 OVERVIEW
- **Total Errors**: ${this.analysis.totalErrors}
- **Total Warnings**: ${this.analysis.totalWarnings}  
- **Files Affected**: ${this.analysis.totalFiles}

## 🎯 ERROR CATEGORIZATION

${Object.entries(this.analysis.errorsByCategory).map(([category, patterns]) => `
### ${category}
${patterns.map(p => `
- **${p.rule}**: ${p.count} issues in ${p.files.length} files
  - Priority: ${p.category.priority}
  - Fix Strategy: ${p.category.fixStrategy}
  - Runtime Impact: ${p.category.runtimeImpact}
  - Recommendation: ${p.fixRecommendation}
`).join('')}
`).join('')}

## 🤖 AUTOMATION OPPORTUNITIES
${this.analysis.automationOpportunities.map(opp => `- ${opp}`).join('\n')}

## 👨‍💻 MANUAL REVIEW REQUIRED  
${this.analysis.manualReviewRequired.map(req => `- ${req}`).join('\n')}

## 🎯 PRIORITY MATRIX
${Object.entries(this.analysis.priorityMatrix)
  .sort(([,a], [,b]) => b - a)
  .map(([category, score]) => `- **${category}**: ${score} priority points`)
  .join('\n')}

## 💡 RECOMMENDATIONS
${this.analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## 🚀 NEXT ACTIONS
1. **Execute automated fixes** for high-value automation opportunities
2. **Manual review** for complex type safety issues
3. **Focus on source files** over test files for runtime stability
4. **Implement error prevention** system for long-term stability
`;

    return report;
  }

  /**
   * Save analysis results
   */
  saveResults(): void {
    // Save JSON for programmatic access
    const jsonPath = join(process.cwd(), 'dungeon-world-error-analysis.json');
    writeFileSync(jsonPath, JSON.stringify(this.analysis, null, 2));

    // Save markdown report for human review
    const reportPath = join(process.cwd(), 'dungeon-world-error-analysis.md');
    writeFileSync(reportPath, this.generateReport());

    console.log('\n📁 Analysis Results Saved:');
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Report: ${reportPath}`);
  }
}

/**
 * Execute Phase 2 analysis
 */
async function executePhase2() {
  const analyzer = new DungeonWorldErrorAnalyzer();
  
  try {
    const analysis = await analyzer.executeAnalysis();
    analyzer.saveResults();
    
    console.log('\n🎉 PHASE 2: DEEP ANALYSIS COMPLETE!');
    console.log('===================================');
    console.log(`📊 Total Issues Analyzed: ${analysis.totalErrors + analysis.totalWarnings}`);
    console.log(`🎯 Categories Identified: ${Object.keys(analysis.errorsByCategory).length}`);
    console.log(`🤖 Automation Opportunities: ${analysis.automationOpportunities.length}`);
    console.log(`👨‍💻 Manual Review Items: ${analysis.manualReviewRequired.length}`);
    
    console.log('\n🔍 TOP PRIORITY CATEGORIES:');
    Object.entries(analysis.priorityMatrix)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, score]) => {
        console.log(`   ${category}: ${score} priority points`);
      });
    
    console.log('\n💡 TOP RECOMMENDATIONS:');
    analysis.recommendations.slice(0, 5).forEach(rec => {
      console.log(`   ${rec}`);
    });
    
    console.log('\n🚀 Ready for Phase 3: Systematic Error Elimination');
    
  } catch (error) {
    console.error('❌ Phase 2 analysis failed:', error);
    throw error;
  }
}

// Execute Phase 2
executePhase2().catch(console.error);
