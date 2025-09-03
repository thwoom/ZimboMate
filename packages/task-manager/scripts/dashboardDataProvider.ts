#!/usr/bin/env tsx

import { AdvancedAnalyticsSystem } from './advancedAnalytics';
import { EnhancedTaskManager } from './enhancedTaskManager';

/**
 * Dashboard Data Provider for ZimboMate
 * Provides real-time data for the dashboard by integrating with the advanced analytics system
 */

interface DashboardData {
  taskStatus: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    blockedTasks: number;
    progressPercent: number;
  };
  priorityBreakdown: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
  };
  categoryProgress: {
    category: string;
    total: number;
    completed: number;
    progress: number;
  }[];
  codeQuality: {
    eslintStatus: 'pass' | 'warnings' | 'errors';
    eslintIssues: number;
    semgrepStatus: 'secure' | 'warnings' | 'vulnerabilities';
    securityIssues: number;
  };
  performanceMetrics: {
    teamVelocity: number;
    sprintCompletion: number;
    bugResolution: number;
    codeQuality: number;
    taskCompletion: number;
    resourceUtilization: number;
  };
  riskInsights: {
    highRiskTasks: number;
    riskByCategory: Record<string, number>;
    riskTrends: { level: string; count: number }[];
  };
  complexitySummary: {
    totalTasks: number;
    complexityBreakdown: { level: string; count: number }[];
    highComplexityTasks: number;
  };
  dependencySummary: {
    totalTasks: number;
    blockedTasks: number;
    criticalPathTasks: number;
    dependencyDepth: { depth: number; count: number }[];
  };
  workflowIntelligence: {
    bottlenecks: number;
    optimizationOpportunities: number;
    automationRecommendations: string[];
  };
}

class DashboardDataProvider {
  private advancedAnalytics: AdvancedAnalyticsSystem;
  private taskManager: EnhancedTaskManager;
  private dataCache: DashboardData | null = null;
  private lastUpdate: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.advancedAnalytics = new AdvancedAnalyticsSystem();
    this.taskManager = new EnhancedTaskManager();
  }

  /**
   * Initialize the data provider
   */
  async initialize(): Promise<void> {
    try {
      await this.advancedAnalytics.initialize();
      console.log('✅ Dashboard data provider initialized');
    } catch (error) {
      console.error('❌ Failed to initialize dashboard data provider:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    // Check cache first
    if (this.dataCache && this.lastUpdate && 
        (Date.now() - this.lastUpdate.getTime()) < this.CACHE_DURATION) {
      return this.dataCache;
    }

    try {
      const data = await this.generateDashboardData();
      this.dataCache = data;
      this.lastUpdate = new Date();
      return data;
    } catch (error) {
      console.error('❌ Error generating dashboard data:', error);
      // Return cached data if available, otherwise throw
      if (this.dataCache) {
        return this.dataCache;
      }
      throw error;
    }
  }

  /**
   * Generate comprehensive dashboard data
   */
  private async generateDashboardData(): Promise<DashboardData> {
    const tasks = this.taskManager.getTasks();
    
    // Task Status
    const taskStatus = this.generateTaskStatus(tasks);
    
    // Priority Breakdown
    const priorityBreakdown = this.generatePriorityBreakdown(tasks);
    
    // Category Progress
    const categoryProgress = this.generateCategoryProgress(tasks);
    
    // Code Quality (simulated for now)
    const codeQuality = this.generateCodeQualityStatus();
    
    // Performance Metrics from Advanced Analytics
    const performanceMetrics = this.generatePerformanceMetrics();
    
    // Risk Insights
    const riskInsights = this.generateRiskInsights();
    
    // Complexity Summary
    const complexitySummary = this.generateComplexitySummary();
    
    // Dependency Summary
    const dependencySummary = this.generateDependencySummary();
    
    // Workflow Intelligence
    const workflowIntelligence = this.generateWorkflowIntelligence();

    return {
      taskStatus,
      priorityBreakdown,
      categoryProgress,
      codeQuality,
      performanceMetrics,
      riskInsights,
      complexitySummary,
      dependencySummary,
      workflowIntelligence
    };
  }

  /**
   * Generate task status data
   */
  private generateTaskStatus(tasks: any[]): DashboardData['taskStatus'] {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'open').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      blockedTasks,
      progressPercent
    };
  }

  /**
   * Generate priority breakdown data
   */
  private generatePriorityBreakdown(tasks: any[]): DashboardData['priorityBreakdown'] {
    const breakdown = { P0: 0, P1: 0, P2: 0, P3: 0 };
    
    tasks.forEach(task => {
      if (task.priority && breakdown.hasOwnProperty(task.priority)) {
        breakdown[task.priority as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  }

  /**
   * Generate category progress data
   */
  private generateCategoryProgress(tasks: any[]): DashboardData['categoryProgress'] {
    const categoryMap = new Map<string, { total: number; completed: number }>();
    
    tasks.forEach(task => {
      const category = task.category || 'uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, completed: 0 });
      }
      
      const cat = categoryMap.get(category)!;
      cat.total++;
      if (task.status === 'done') {
        cat.completed++;
      }
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  }

  /**
   * Generate code quality status (simulated)
   */
  private generateCodeQualityStatus(): DashboardData['codeQuality'] {
    // Simulate ESLint status
    const eslintIssues = Math.floor(Math.random() * 10);
    let eslintStatus: 'pass' | 'warnings' | 'errors';
    if (eslintIssues === 0) eslintStatus = 'pass';
    else if (eslintIssues <= 3) eslintStatus = 'warnings';
    else eslintStatus = 'errors';

    // Simulate Semgrep status
    const securityIssues = Math.floor(Math.random() * 5);
    let semgrepStatus: 'secure' | 'warnings' | 'vulnerabilities';
    if (securityIssues === 0) semgrepStatus = 'secure';
    else if (securityIssues <= 2) semgrepStatus = 'warnings';
    else semgrepStatus = 'vulnerabilities';

    return {
      eslintStatus,
      eslintIssues,
      semgrepStatus,
      securityIssues
    };
  }

  /**
   * Generate performance metrics from advanced analytics
   */
  private generatePerformanceMetrics(): DashboardData['performanceMetrics'] {
    const metrics = this.advancedAnalytics.getPerformanceMetrics();
    
    return {
      teamVelocity: metrics.find(m => m.id === 'team-velocity')?.value || 0,
      sprintCompletion: metrics.find(m => m.id === 'sprint-completion')?.value || 0,
      bugResolution: metrics.find(m => m.id === 'bug-resolution')?.value || 0,
      codeQuality: metrics.find(m => m.id === 'code-quality')?.value || 0,
      taskCompletion: metrics.find(m => m.id === 'task-completion')?.value || 0,
      resourceUtilization: metrics.find(m => m.id === 'resource-utilization')?.value || 0
    };
  }

  /**
   * Generate risk insights
   */
  private generateRiskInsights(): DashboardData['riskInsights'] {
    const riskData = this.taskManager.getRiskInsights();
    
    return {
      highRiskTasks: riskData.highRiskTasks.length,
      riskByCategory: Object.fromEntries(
        Object.entries(riskData.riskByCategory).map(([category, risks]) => [
          category, 
          risks.length
        ])
      ),
      riskTrends: riskData.riskTrends
    };
  }

  /**
   * Generate complexity summary
   */
  private generateComplexitySummary(): DashboardData['complexitySummary'] {
    const complexityData = this.taskManager.getComplexitySummary();
    
    return {
      totalTasks: complexityData.totalTasks,
      complexityBreakdown: complexityData.complexityBreakdown,
      highComplexityTasks: complexityData.highComplexityTasks.length
    };
  }

  /**
   * Generate dependency summary
   */
  private generateDependencySummary(): DashboardData['dependencySummary'] {
    const dependencyData = this.taskManager.getDependencySummary();
    
    return {
      totalTasks: dependencyData.totalTasks,
      blockedTasks: dependencyData.blockedTasks.length,
      criticalPathTasks: dependencyData.criticalPathTasks.length,
      dependencyDepth: dependencyData.dependencyDepth
    };
  }

  /**
   * Generate workflow intelligence data
   */
  private generateWorkflowIntelligence(): DashboardData['workflowIntelligence'] {
    // Get automation recommendations from workflow automation
    const recommendations = [
      'Implement automated status updates',
      'Set up dependency tracking alerts',
      'Automate task prioritization',
      'Enable workflow templates'
    ];

    return {
      bottlenecks: Math.floor(Math.random() * 5) + 1, // Simulated for now
      optimizationOpportunities: Math.floor(Math.random() * 8) + 3,
      automationRecommendations: recommendations
    };
  }

  /**
   * Get specific data sections
   */
  async getTaskStatus() {
    const data = await this.getDashboardData();
    return data.taskStatus;
  }

  async getPriorityBreakdown() {
    const data = await this.getDashboardData();
    return data.priorityBreakdown;
  }

  async getCategoryProgress() {
    const data = await this.getDashboardData();
    return data.categoryProgress;
  }

  async getCodeQualityStatus() {
    const data = await this.getDashboardData();
    return data.codeQuality;
  }

  async getPerformanceMetrics() {
    const data = await this.getDashboardData();
    return data.performanceMetrics;
  }

  async getRiskInsights() {
    const data = await this.getDashboardData();
    return data.riskInsights;
  }

  async getComplexitySummary() {
    const data = await this.getDashboardData();
    return data.complexitySummary;
  }

  async getDependencySummary() {
    const data = await this.getDashboardData();
    return data.dependencySummary;
  }

  async getWorkflowIntelligence() {
    const data = await this.getDashboardData();
    return data.workflowIntelligence;
  }

  /**
   * Force refresh of cached data
   */
  async refreshData(): Promise<void> {
    this.dataCache = null;
    this.lastUpdate = null;
    await this.getDashboardData();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.advancedAnalytics.cleanup();
      console.log('✅ Dashboard data provider cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up dashboard data provider:', error);
    }
  }
}

// CLI execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const provider = new DashboardDataProvider();
  
  (async () => {
    try {
      await provider.initialize();
      
      console.log('\n📊 DASHBOARD DATA OVERVIEW');
      console.log('='.repeat(60));
      
      const data = await provider.getDashboardData();
      
      console.log(`\n📋 Task Status:`);
      console.log(`  Total Tasks: ${data.taskStatus.totalTasks}`);
      console.log(`  Completed: ${data.taskStatus.completedTasks}`);
      console.log(`  In Progress: ${data.taskStatus.inProgressTasks}`);
      console.log(`  Progress: ${data.taskStatus.progressPercent}%`);
      
      console.log(`\n⚡ Priority Breakdown:`);
      Object.entries(data.priorityBreakdown).forEach(([priority, count]) => {
        console.log(`  ${priority}: ${count} tasks`);
      });
      
      console.log(`\n📂 Category Progress:`);
      data.categoryProgress.forEach(cat => {
        console.log(`  ${cat.category}: ${cat.completed}/${cat.total} (${cat.progress}%)`);
      });
      
      console.log(`\n🔍 Code Quality:`);
      console.log(`  ESLint: ${data.codeQuality.eslintStatus} (${data.codeQuality.eslintIssues} issues)`);
      console.log(`  Semgrep: ${data.codeQuality.semgrepStatus} (${data.codeQuality.securityIssues} issues)`);
      
      console.log(`\n📈 Performance Metrics:`);
      console.log(`  Team Velocity: ${data.performanceMetrics.teamVelocity}`);
      console.log(`  Sprint Completion: ${data.performanceMetrics.sprintCompletion}%`);
      console.log(`  Code Quality: ${data.performanceMetrics.codeQuality}/100`);
      
      console.log(`\n🚨 Risk Insights:`);
      console.log(`  High Risk Tasks: ${data.riskInsights.highRiskTasks}`);
      console.log(`  Risk Categories: ${Object.keys(data.riskInsights.riskByCategory).length}`);
      
      console.log(`\n🧠 Workflow Intelligence:`);
      console.log(`  Bottlenecks: ${data.workflowIntelligence.bottlenecks}`);
      console.log(`  Optimization Opportunities: ${data.workflowIntelligence.optimizationOpportunities}`);
      
    } catch (error) {
      console.error('❌ Dashboard data provider failed:', error);
      process.exit(1);
    } finally {
      await provider.cleanup();
    }
  })();
}

export { DashboardDataProvider };
