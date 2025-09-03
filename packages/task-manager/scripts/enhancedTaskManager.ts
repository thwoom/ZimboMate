#!/usr/bin/env tsx

import * as YAML from 'yaml';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Enhanced Task Manager for ZimboMate
 * Provides advanced task management with complexity scoring, risk analysis, and dependency management
 */

interface EnhancedTask {
  id: string;
  title: string;
  intent: string;
  status: 'open' | 'in_progress' | 'done' | 'blocked';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  complexity_level: 'low' | 'medium' | 'high' | 'critical';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  actual_hours?: number;
  deps: string[];
  assignee?: string;
  dueDate?: string;
  started_at?: string;
  done_at?: string;
  tags: string[];
  notes?: string;
}

interface DependencyAnalysis {
  taskId: string;
  dependencies: string[];
  dependents: string[];
  depth: number;
  isBlocked: boolean;
  blockingTasks: string[];
  criticalPath: boolean;
}

interface ComplexityScore {
  taskId: string;
  technicalComplexity: number;
  businessComplexity: number;
  teamComplexity: number;
  overallScore: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

interface RiskAssessment {
  taskId: string;
  technicalRisk: number;
  workflowRisk: number;
  timingRisk: number;
  overallRisk: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationStrategies: string[];
}

class EnhancedTaskManager {
  private tasks: EnhancedTask[] = [];
  private dependencyCache: Map<string, DependencyAnalysis> = new Map();
  private complexityCache: Map<string, ComplexityScore> = new Map();
  private riskCache: Map<string, RiskAssessment> = new Map();
  private _filePath: string;

  constructor() {
    this._filePath = join(__dirname, '..', 'ops', 'tasks.yaml');
    this.loadTasks();
  }

  /**
   * Load tasks from YAML file
   */
  private loadTasks(): void {
    try {
      if (existsSync(this._filePath)) {
        const fileContent = readFileSync(this._filePath, 'utf8');
        const data = YAML.parse(fileContent);
        this.tasks = data.tasks || [];
        console.log(`✅ Loaded ${this.tasks.length} tasks from ${this._filePath}`);
      } else {
        console.log(`⚠️ No tasks file found at ${this._filePath}`);
        this.tasks = [];
          }
        } catch (error) {
      console.error('❌ Error loading tasks:', error);
      this.tasks = [];
    }
  }

  /**
   * Save tasks to YAML file
   */
  private saveTasks(): void {
    try {
      const data = { tasks: this.tasks };
      const yamlContent = YAML.stringify(data, { indent: 2 });
      writeFileSync(this._filePath, yamlContent, 'utf8');
      } catch (error) {
      console.error('❌ Error saving tasks:', error);
    }
  }

  /**
   * Get all tasks
   */
  getTasks(): EnhancedTask[] {
    return this.tasks;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): EnhancedTask | null {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Add new task
   */
  addTask(task: Omit<EnhancedTask, 'id'>): string {
    const id = `T-${Date.now()}`;
    const newTask: EnhancedTask = {
      ...task,
      id,
      tags: task.tags || [],
      status: task.status || 'open'
    };
    
    this.tasks.push(newTask);
    this.saveTasks();
    
    // Clear caches
    this.dependencyCache.clear();
    this.complexityCache.clear();
    this.riskCache.clear();
    
    console.log(`✅ Added task ${id}: ${task.title}`);
    return id;
  }

  /**
   * Update task
   */
  updateTask(taskId: string, updates: Partial<EnhancedTask>): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`❌ Task ${taskId} not found`);
      return false;
    }

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    this.saveTasks();
    
    // Clear caches
    this.dependencyCache.clear();
    this.complexityCache.clear();
    this.riskCache.clear();
    
    console.log(`✅ Updated task ${taskId}`);
    return true;
  }

  /**
   * Delete task
   */
  deleteTask(taskId: string): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`❌ Task ${taskId} not found`);
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    this.saveTasks();
    
    // Clear caches
    this.dependencyCache.clear();
    this.complexityCache.clear();
    this.riskCache.clear();
    
    console.log(`✅ Deleted task ${taskId}`);
    return true;
  }

  /**
   * Analyze dependencies for a task
   */
  private analyzeDependencies(taskId: string): DependencyAnalysis {
    if (this.dependencyCache.has(taskId)) {
      return this.dependencyCache.get(taskId)!;
    }

    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const dependencies = task.deps || [];
    const dependents = this.tasks
      .filter(t => t.deps && t.deps.includes(taskId))
      .map(t => t.id);

    const depth = this.calculateDependencyDepth(taskId);
    const isBlocked = dependencies.some(depId => {
      const dep = this.getTask(depId);
      return dep && dep.status !== 'done';
    });

    const blockingTasks = dependencies.filter(depId => {
      const dep = this.getTask(depId);
      return dep && dep.status !== 'done';
    });

    const analysis: DependencyAnalysis = {
      taskId,
      dependencies,
      dependents,
      depth,
      isBlocked,
      blockingTasks,
      criticalPath: depth > 3 // Consider deep dependencies as critical path
    };

    this.dependencyCache.set(taskId, analysis);
    return analysis;
  }

  /**
   * Calculate dependency depth for a task
   */
  private calculateDependencyDepth(taskId: string): number {
    const task = this.getTask(taskId);
    if (!task || !task.deps || task.deps.length === 0) {
      return 0;
    }

    const depths = task.deps.map(depId => this.calculateDependencyDepth(depId));
    return Math.max(...depths) + 1;
  }

  /**
   * Get dependency analysis for a task
   */
  getDependencyAnalysis(taskId: string): DependencyAnalysis {
    return this.analyzeDependencies(taskId);
  }

  /**
   * Get all dependency analyses
   */
  getAllDependencyAnalyses(): DependencyAnalysis[] {
    return this.tasks.map(t => this.analyzeDependencies(t.id));
  }

  /**
   * Calculate complexity score for a task
   */
  private calculateTaskComplexity(taskId: string): ComplexityScore {
    if (this.complexityCache.has(taskId)) {
      return this.complexityCache.get(taskId)!;
    }

    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Technical complexity factors
    let technicalComplexity = 0;
    const technicalFactors: string[] = [];
    
    if (task.estimated_hours > 40) {
      technicalComplexity += 30;
      technicalFactors.push('Large time estimate');
    }
    if (task.deps && task.deps.length > 5) {
      technicalComplexity += 25;
      technicalFactors.push('Many dependencies');
    }
    if (task.tags.includes('refactor') || task.tags.includes('migration')) {
      technicalComplexity += 20;
      technicalFactors.push('Refactoring/migration work');
    }

    // Business complexity factors
    let businessComplexity = 0;
    const businessFactors: string[] = [];
    
    if (task.priority === 'P0') {
      businessComplexity += 25;
      businessFactors.push('Highest priority');
    }
    if (task.category === 'feature' || task.category === 'enhancement') {
      businessComplexity += 15;
      businessFactors.push('Feature development');
    }

    // Team complexity factors
    let teamComplexity = 0;
    const teamFactors: string[] = [];
    
    if (!task.assignee) {
      teamComplexity += 20;
      teamFactors.push('Unassigned');
    }
    if (task.tags.includes('cross-team')) {
      teamComplexity += 15;
      teamFactors.push('Cross-team coordination');
    }

    const overallScore = Math.min(100, technicalComplexity + businessComplexity + teamComplexity);
    
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore < 25) level = 'low';
    else if (overallScore < 50) level = 'medium';
    else if (overallScore < 75) level = 'high';
    else level = 'critical';

    const score: ComplexityScore = {
      taskId,
      technicalComplexity,
      businessComplexity,
      teamComplexity,
      overallScore,
      level,
      factors: [...technicalFactors, ...businessFactors, ...teamFactors]
    };

    this.complexityCache.set(taskId, score);
    return score;
  }

  /**
   * Get complexity score for a task
   */
  getTaskComplexity(taskId: string): ComplexityScore {
    return this.calculateTaskComplexity(taskId);
  }

  /**
   * Get all complexity scores
   */
  getAllComplexityScores(): ComplexityScore[] {
    return this.tasks.map(t => this.calculateTaskComplexity(t.id));
  }

  /**
   * Calculate risk assessment for a task
   */
  private calculateTaskRisk(taskId: string): RiskAssessment {
    if (this.riskCache.has(taskId)) {
      return this.riskCache.get(taskId)!;
    }

    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const complexity = this.getTaskComplexity(taskId);
    const dependencies = this.getDependencyAnalysis(taskId);

    // Technical risk factors
    let technicalRisk = 0;
    const technicalRiskFactors: string[] = [];
    
    if (complexity.level === 'critical') {
      technicalRisk += 40;
      technicalRiskFactors.push('Critical complexity level');
    }
    if (dependencies.depth > 5) {
      technicalRisk += 25;
      technicalRiskFactors.push('Deep dependency chain');
    }
    if (task.tags.includes('legacy') || task.tags.includes('technical-debt')) {
      technicalRisk += 20;
      technicalRiskFactors.push('Legacy/technical debt work');
    }

    // Workflow risk factors
    let workflowRisk = 0;
    const workflowRiskFactors: string[] = [];
    
    if (dependencies.isBlocked) {
      workflowRisk += 30;
      workflowRiskFactors.push('Currently blocked');
    }
    if (dependencies.blockingTasks.length > 3) {
      workflowRisk += 20;
      workflowRiskFactors.push('Many blocking tasks');
    }
    if (!task.assignee) {
      workflowRisk += 15;
      workflowRiskFactors.push('Unassigned task');
    }

    // Timing risk factors
    let timingRisk = 0;
    const timingRiskFactors: string[] = [];
    
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDue < 0) {
        timingRisk += 35;
        timingRiskFactors.push('Overdue');
      } else if (daysUntilDue < 3) {
        timingRisk += 25;
        timingRiskFactors.push('Due soon');
      } else if (daysUntilDue < 7) {
        timingRisk += 15;
        timingRiskFactors.push('Due this week');
      }
    }

    const overallRisk = Math.min(100, technicalRisk + workflowRisk + timingRisk);
    
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (overallRisk < 25) level = 'low';
    else if (overallRisk < 50) level = 'medium';
    else if (overallRisk < 75) level = 'high';
    else level = 'critical';

    // Generate mitigation strategies
    const mitigationStrategies: string[] = [];
    if (technicalRisk > 50) {
      mitigationStrategies.push('Break into smaller subtasks');
      mitigationStrategies.push('Allocate senior team members');
      mitigationStrategies.push('Increase code review frequency');
    }
    if (workflowRisk > 50) {
      mitigationStrategies.push('Resolve blocking dependencies');
      mitigationStrategies.push('Assign task to available team member');
      mitigationStrategies.push('Consider task prioritization');
    }
    if (timingRisk > 50) {
      mitigationStrategies.push('Review and adjust deadlines');
      mitigationStrategies.push('Allocate additional resources');
      mitigationStrategies.push('Consider scope reduction');
    }

    const assessment: RiskAssessment = {
      taskId,
      technicalRisk,
      workflowRisk,
      timingRisk,
      overallRisk,
      level,
      riskFactors: [...technicalRiskFactors, ...workflowRiskFactors, ...timingRiskFactors],
      mitigationStrategies
    };

    this.riskCache.set(taskId, assessment);
    return assessment;
  }

  /**
   * Get risk assessment for a task
   */
  getTaskRisk(taskId: string): RiskAssessment {
    return this.calculateTaskRisk(taskId);
  }

  /**
   * Get all risk assessments
   */
  getAllRiskAssessments(): RiskAssessment[] {
    return this.tasks.map(t => this.calculateTaskRisk(t.id));
  }

  /**
   * Get risk insights for dashboard
   */
  getRiskInsights(): {
    highRiskTasks: RiskAssessment[];
    riskByCategory: Record<string, RiskAssessment[]>;
    riskTrends: { level: string; count: number }[];
  } {
    const allRisks = this.getAllRiskAssessments();
    
    const highRiskTasks = allRisks.filter(r => r.level === 'high' || r.level === 'critical');
    
    const riskByCategory: Record<string, RiskAssessment[]> = {};
    allRisks.forEach(risk => {
      const task = this.getTask(risk.taskId);
      if (task && task.category) {
        if (!riskByCategory[task.category]) {
          riskByCategory[task.category] = [];
        }
        riskByCategory[task.category].push(risk);
      }
    });
    
    const riskTrends = [
      { level: 'low', count: allRisks.filter(r => r.level === 'low').length },
      { level: 'medium', count: allRisks.filter(r => r.level === 'medium').length },
      { level: 'high', count: allRisks.filter(r => r.level === 'high').length },
      { level: 'critical', count: allRisks.filter(r => r.level === 'critical').length }
    ];
    
    return {
      highRiskTasks,
      riskByCategory,
      riskTrends
    };
  }

  /**
   * Get complexity summary for dashboard
   */
  getComplexitySummary(): {
    totalTasks: number;
    complexityBreakdown: { level: string; count: number }[];
    highComplexityTasks: ComplexityScore[];
  } {
    const allComplexities = this.getAllComplexityScores();
    
    const complexityBreakdown = [
      { level: 'low', count: allComplexities.filter(c => c.level === 'low').length },
      { level: 'medium', count: allComplexities.filter(c => c.level === 'medium').length },
      { level: 'high', count: allComplexities.filter(c => c.level === 'high').length },
      { level: 'critical', count: allComplexities.filter(c => c.level === 'critical').length }
    ];
    
    const highComplexityTasks = allComplexities.filter(c => c.level === 'high' || c.level === 'critical');
    
    return {
      totalTasks: this.tasks.length,
      complexityBreakdown,
      highComplexityTasks
    };
  }

  /**
   * Get dependency summary for dashboard
   */
  getDependencySummary(): {
    totalTasks: number;
    blockedTasks: DependencyAnalysis[];
    criticalPathTasks: DependencyAnalysis[];
    dependencyDepth: { depth: number; count: number }[];
  } {
    const allDependencies = this.getAllDependencyAnalyses();
    
    const blockedTasks = allDependencies.filter(d => d.isBlocked);
    const criticalPathTasks = allDependencies.filter(d => d.criticalPath);
    
    const depthMap = new Map<number, number>();
    allDependencies.forEach(d => {
      depthMap.set(d.depth, (depthMap.get(d.depth) || 0) + 1);
    });
    
    const dependencyDepth = Array.from(depthMap.entries())
      .map(([depth, count]) => ({ depth, count }))
      .sort((a, b) => a.depth - b.depth);
    
    return {
      totalTasks: this.tasks.length,
      blockedTasks,
      criticalPathTasks,
      dependencyDepth
    };
  }

  /**
   * CLI command handler
   */
  public runCommand(command: string, args: string[] = []): void {
    switch (command) {
      case 'complexity':
        if (args[0]) {
          const complexity = this.getTaskComplexity(args[0]);
          console.log(`Complexity for ${args[0]}:`, complexity);
        } else {
          const summary = this.getComplexitySummary();
          console.log('Complexity Summary:', summary);
        }
        break;
        
      case 'risk':
        if (args[0]) {
          const risk = this.getTaskRisk(args[0]);
          console.log(`Risk for ${args[0]}:`, risk);
        } else {
          const insights = this.getRiskInsights();
          console.log('Risk Insights:', insights);
        }
        break;
        
      case 'deps':
        if (args[0]) {
          const deps = this.getDependencyAnalysis(args[0]);
          console.log(`Dependencies for ${args[0]}:`, deps);
        } else {
          const summary = this.getDependencySummary();
          console.log('Dependency Summary:', summary);
        }
        break;
        
      case 'list':
        this.tasks.forEach(task => {
          console.log(`${task.id}: ${task.title} (${task.status}, ${task.priority})`);
        });
        break;
        
      default:
        console.log('Available commands: complexity, risk, deps, list');
        break;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
const manager = new EnhancedTaskManager();
const [command, ...args] = process.argv.slice(2);
manager.runCommand(command || 'help', args);
}

export { EnhancedTaskManager };
