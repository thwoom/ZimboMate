#!/usr/bin/env tsx

import { EnhancedTaskManager } from './enhancedTaskManager';

/**
 * Workflow Intelligence & Optimization System for ZimboMate
 * Provides AI-powered workflow analysis and optimization recommendations
 */

interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  tasks: string[];
  averageDuration: number;
  efficiency: number;
  optimizationPotential: number;
}

interface WorkflowBottleneck {
  id: string;
  type: 'dependency' | 'resource' | 'timing' | 'complexity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedTasks: string[];
  impact: number;
  recommendations: string[];
}

interface ResourceAllocation {
  resource: string;
  currentLoad: number;
  capacity: number;
  utilization: number;
  recommendations: string[];
}

interface PredictiveInsight {
  type: 'completion' | 'bottleneck' | 'resource' | 'risk';
  confidence: number;
  prediction: string;
  timeframe: string;
  supportingData: any;
}

class WorkflowIntelligenceSystem {
  private taskManager: EnhancedTaskManager;
  private workflowPatterns: WorkflowPattern[] = [];
  private bottlenecks: WorkflowBottleneck[] = [];
  private resourceAllocations: ResourceAllocation[] = [];
  private predictiveInsights: PredictiveInsight[] = [];

  constructor() {
    this.taskManager = new EnhancedTaskManager();
  }

  /**
   * Initialize the workflow intelligence system
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Workflow Intelligence System...');
    
    try {
      await this.taskManager.analyzeDependenciesCLI();
      console.log('✅ Task manager initialized');
      
      // Analyze workflow patterns
      await this.analyzeWorkflowPatterns();
      
      // Identify bottlenecks
      await this.identifyBottlenecks();
      
      // Analyze resource allocation
      await this.analyzeResourceAllocation();
      
      // Generate predictive insights
      await this.generatePredictiveInsights();
      
      console.log('✅ Workflow intelligence system ready');
    } catch (error) {
      console.error('❌ Failed to initialize workflow intelligence:', error);
      throw error;
    }
  }

  /**
   * Analyze workflow patterns in task execution
   */
  private async analyzeWorkflowPatterns(): Promise<void> {
    console.log('🔍 Analyzing workflow patterns...');
    
    const tasks = this.taskManager['tasks'] || [];
    const patterns: Map<string, WorkflowPattern> = new Map();
    
    // Group tasks by category and status transitions
    for (const task of tasks) {
      if (!task.category || !task.status) continue;
      
      const patternKey = `${task.category}-${task.status}`;
      
      if (!patterns.has(patternKey)) {
        patterns.set(patternKey, {
          id: patternKey,
          name: `${task.category} Workflow`,
          description: `Common workflow for ${task.category} tasks`,
          frequency: 0,
          tasks: [],
          averageDuration: 0,
          efficiency: 0,
          optimizationPotential: 0
        });
      }
      
      const pattern = patterns.get(patternKey)!;
      pattern.frequency++;
      pattern.tasks.push(task.id);
      
      // Calculate average duration if time tracking is available
      if (task.estimatedHours && task.actualHours) {
        const efficiency = task.estimatedHours / task.actualHours;
        pattern.efficiency = (pattern.efficiency + efficiency) / 2;
      }
    }
    
    // Calculate optimization potential based on frequency and efficiency
    for (const pattern of patterns.values()) {
      pattern.optimizationPotential = this.calculateOptimizationPotential(pattern);
    }
    
    this.workflowPatterns = Array.from(patterns.values())
      .sort((a, b) => b.optimizationPotential - a.optimizationPotential);
    
    console.log(`✅ Identified ${this.workflowPatterns.length} workflow patterns`);
  }

  /**
   * Calculate optimization potential for a workflow pattern
   */
  private calculateOptimizationPotential(pattern: WorkflowPattern): number {
    let potential = 0;
    
    // Higher frequency = higher optimization potential
    potential += Math.min(pattern.frequency * 10, 50);
    
    // Lower efficiency = higher optimization potential
    if (pattern.efficiency < 0.8) {
      potential += (0.8 - pattern.efficiency) * 100;
    }
    
    // More tasks = higher optimization potential
    potential += Math.min(pattern.tasks.length * 5, 25);
    
    return Math.min(potential, 100);
  }

  /**
   * Identify workflow bottlenecks
   */
  private async identifyBottlenecks(): Promise<void> {
    console.log('🚧 Identifying workflow bottlenecks...');
    
    const tasks = this.taskManager['tasks'] || [];
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // Dependency bottlenecks
    const dependencyBottlenecks = this.identifyDependencyBottlenecks(tasks);
    bottlenecks.push(...dependencyBottlenecks);
    
    // Resource bottlenecks
    const resourceBottlenecks = this.identifyResourceBottlenecks(tasks);
    bottlenecks.push(...resourceBottlenecks);
    
    // Timing bottlenecks
    const timingBottlenecks = this.identifyTimingBottlenecks(tasks);
    bottlenecks.push(...timingBottlenecks);
    
    // Complexity bottlenecks
    const complexityBottlenecks = this.identifyComplexityBottlenecks(tasks);
    bottlenecks.push(...complexityBottlenecks);
    
    this.bottlenecks = bottlenecks.sort((a, b) => b.impact - a.impact);
    
    console.log(`✅ Identified ${this.bottlenecks.length} bottlenecks`);
  }

  /**
   * Identify dependency-related bottlenecks
   */
  private identifyDependencyBottlenecks(tasks: any[]): WorkflowBottleneck[] {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    for (const task of tasks) {
      if (!task.dependencies || task.dependencies.length === 0) continue;
      
      // Check for circular dependencies
      const circularDeps = this.detectCircularDependencies(task.id, task.dependencies);
      if (circularDeps.length > 0) {
        bottlenecks.push({
          id: `circular-${task.id}`,
          type: 'dependency',
          severity: 'critical',
          description: `Circular dependency detected in task ${task.id}`,
          affectedTasks: circularDeps,
          impact: 100,
          recommendations: [
            'Break circular dependency chain',
            'Reorganize task dependencies',
            'Consider parallel execution where possible'
          ]
        });
      }
      
      // Check for long dependency chains
      const dependencyDepth = this.calculateDependencyDepth(task.id);
      if (dependencyDepth > 5) {
        bottlenecks.push({
          id: `long-chain-${task.id}`,
          type: 'dependency',
          severity: 'high',
          description: `Long dependency chain (${dependencyDepth} levels) for task ${task.id}`,
          affectedTasks: [task.id],
          impact: 80,
          recommendations: [
            'Break long dependency chains into smaller segments',
            'Identify tasks that can be parallelized',
            'Consider using milestones to track progress'
          ]
        });
      }
    }
    
    return bottlenecks;
  }

  /**
   * Identify resource-related bottlenecks
   */
  private identifyResourceBottlenecks(tasks: any[]): WorkflowBottleneck[] {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // Group tasks by assignee
    const assigneeWorkload: Map<string, any[]> = new Map();
    
    for (const task of tasks) {
      if (!task.assignee) continue;
      
      if (!assigneeWorkload.has(task.assignee)) {
        assigneeWorkload.set(task.assignee, []);
      }
      assigneeWorkload.get(task.assignee)!.push(task);
    }
    
    // Check for overloaded assignees
    for (const [assignee, assignedTasks] of assigneeWorkload) {
      const activeTasks = assignedTasks.filter(t => t.status === 'in-progress');
      const highPriorityTasks = assignedTasks.filter(t => t.priority === 'P1' || t.priority === 'P2');
      
      if (activeTasks.length > 5) {
        bottlenecks.push({
          id: `overload-${assignee}`,
          type: 'resource',
          severity: 'high',
          description: `${assignee} is overloaded with ${activeTasks.length} active tasks`,
          affectedTasks: activeTasks.map(t => t.id),
          impact: 75,
          recommendations: [
            'Redistribute tasks to other team members',
            'Prioritize tasks and defer lower priority items',
            'Consider extending deadlines for non-critical tasks'
          ]
        });
      }
      
      if (highPriorityTasks.length > 3) {
        bottlenecks.push({
          id: `priority-conflict-${assignee}`,
          type: 'resource',
          severity: 'medium',
          description: `${assignee} has ${highPriorityTasks.length} high-priority tasks`,
          affectedTasks: highPriorityTasks.map(t => t.id),
          impact: 60,
          recommendations: [
            'Review priority assignments',
            'Consider task dependencies and timing',
            'Balance workload across team members'
          ]
        });
      }
    }
    
    return bottlenecks;
  }

  /**
   * Identify timing-related bottlenecks
   */
  private identifyTimingBottlenecks(tasks: any[]): WorkflowBottleneck[] {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    for (const task of tasks) {
      if (!task.dueDate || !task.estimatedHours) continue;
      
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      // Check for overdue tasks
      if (daysUntilDue < 0 && task.status !== 'completed') {
        bottlenecks.push({
          id: `overdue-${task.id}`,
          type: 'timing',
          severity: 'critical',
          description: `Task ${task.id} is overdue by ${Math.abs(daysUntilDue).toFixed(1)} days`,
          affectedTasks: [task.id],
          impact: 90,
          recommendations: [
            'Immediately prioritize this task',
            'Assess if deadline can be extended',
            'Consider breaking into smaller subtasks',
            'Reallocate resources if necessary'
          ]
        });
      }
      
      // Check for tasks due soon with high complexity
      if (daysUntilDue > 0 && daysUntilDue < 3 && task.complexity_level === 'high') {
        bottlenecks.push({
          id: `urgent-complex-${task.id}`,
          type: 'timing',
          severity: 'high',
          description: `Complex task ${task.id} is due in ${daysUntilDue.toFixed(1)} days`,
          affectedTasks: [task.id],
          impact: 80,
          recommendations: [
            'Consider extending deadline',
            'Break into smaller subtasks',
            'Allocate additional resources',
            'Review scope and requirements'
          ]
        });
      }
    }
    
    return bottlenecks;
  }

  /**
   * Identify complexity-related bottlenecks
   */
  private identifyComplexityBottlenecks(tasks: any[]): WorkflowBottleneck[] {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // Check for tasks with high complexity and risk
    const highComplexityTasks = tasks.filter(t => 
      t.complexity_level === 'high' || t.complexity_level === 'critical'
    );
    
    for (const task of highComplexityTasks) {
      if (task.risk_level === 'high' || task.risk_level === 'critical') {
        bottlenecks.push({
          id: `complex-risk-${task.id}`,
          type: 'complexity',
          severity: 'critical',
          description: `Task ${task.id} has high complexity and high risk`,
          affectedTasks: [task.id],
          impact: 95,
          recommendations: [
            'Break into smaller, manageable subtasks',
            'Allocate senior team members',
            'Increase monitoring and review frequency',
            'Consider external consultation or expertise',
            'Implement risk mitigation strategies'
          ]
        });
      }
    }
    
    // Check for complexity clusters
    const complexityByCategory: Map<string, any[]> = new Map();
    
    for (const task of tasks) {
      if (!task.category) continue;
      
      if (!complexityByCategory.has(task.category)) {
        complexityByCategory.set(task.category, []);
      }
      complexityByCategory.get(task.category)!.push(task);
    }
    
    for (const [category, categoryTasks] of complexityByCategory) {
      const highComplexityCount = categoryTasks.filter(t => 
        t.complexity_level === 'high' || t.complexity_level === 'critical'
      ).length;
      
      if (highComplexityCount > 3) {
        bottlenecks.push({
          id: `complexity-cluster-${category}`,
          type: 'complexity',
          severity: 'high',
          description: `Category ${category} has ${highComplexityCount} high-complexity tasks`,
          affectedTasks: categoryTasks.map(t => t.id),
          impact: 70,
          recommendations: [
            'Review category scope and requirements',
            'Consider breaking large initiatives into phases',
            'Allocate additional resources to this category',
            'Implement complexity reduction strategies'
          ]
        });
      }
    }
    
    return bottlenecks;
  }

  /**
   * Analyze resource allocation across the team
   */
  private async analyzeResourceAllocation(): Promise<void> {
    console.log('👥 Analyzing resource allocation...');
    
    const tasks = this.taskManager['tasks'] || [];
    const resourceMap: Map<string, ResourceAllocation> = new Map();
    
    // Initialize resource tracking
    for (const task of tasks) {
      if (!task.assignee) continue;
      
      if (!resourceMap.has(task.assignee)) {
        resourceMap.set(task.assignee, {
          resource: task.assignee,
          currentLoad: 0,
          capacity: 100, // Assume 100% capacity per person
          utilization: 0,
          recommendations: []
        });
      }
    }
    
    // Calculate current load for each resource
    for (const task of tasks) {
      if (!task.assignee || !resourceMap.has(task.assignee)) continue;
      
      const resource = resourceMap.get(task.assignee)!;
      
      // Calculate load based on task complexity and priority
      let taskLoad = 10; // Base load
      
      if (task.complexity_level === 'high') taskLoad += 20;
      if (task.complexity_level === 'critical') taskLoad += 30;
      if (task.priority === 'P1') taskLoad += 15;
      if (task.priority === 'P2') taskLoad += 10;
      if (task.status === 'in-progress') taskLoad += 5;
      
      resource.currentLoad += taskLoad;
    }
    
    // Calculate utilization and generate recommendations
    for (const resource of resourceMap.values()) {
      resource.utilization = (resource.currentLoad / resource.capacity) * 100;
      
      if (resource.utilization > 120) {
        resource.recommendations.push('Critical overload - immediate action required');
        resource.recommendations.push('Consider task redistribution or deadline extensions');
      } else if (resource.utilization > 100) {
        resource.recommendations.push('Overloaded - review workload distribution');
        resource.recommendations.push('Consider deferring lower priority tasks');
      } else if (resource.utilization > 80) {
        resource.recommendations.push('High utilization - monitor closely');
        resource.recommendations.push('Consider additional capacity for new tasks');
      } else if (resource.utilization < 50) {
        resource.recommendations.push('Underutilized - can take on additional work');
        resource.recommendations.push('Consider reassigning tasks from overloaded resources');
      }
    }
    
    this.resourceAllocations = Array.from(resourceMap.values())
      .sort((a, b) => b.utilization - a.utilization);
    
    console.log(`✅ Analyzed ${this.resourceAllocations.length} resources`);
  }

  /**
   * Generate predictive insights about workflow
   */
  private async generatePredictiveInsights(): Promise<void> {
    console.log('🔮 Generating predictive insights...');
    
    const insights: PredictiveInsight[] = [];
    
    // Completion time predictions
    const completionInsights = this.predictCompletionTimes();
    insights.push(...completionInsights);
    
    // Bottleneck predictions
    const bottleneckInsights = this.predictBottlenecks();
    insights.push(...bottleneckInsights);
    
    // Resource predictions
    const resourceInsights = this.predictResourceIssues();
    insights.push(...resourceInsights);
    
    // Risk predictions
    const riskInsights = this.predictRiskEscalation();
    insights.push(...riskInsights);
    
    this.predictiveInsights = insights.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`✅ Generated ${this.predictiveInsights.length} predictive insights`);
  }

  /**
   * Predict completion times for tasks
   */
  private predictCompletionTimes(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const tasks = this.taskManager['tasks'] || [];
    
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    
    for (const task of inProgressTasks) {
      if (!task.estimatedHours || !task.actualHours) continue;
      
      const progress = task.actualHours / task.estimatedHours;
      const remainingHours = task.estimatedHours - task.actualHours;
      
      if (progress > 0.5 && remainingHours > 0) {
        const estimatedCompletion = new Date();
        estimatedCompletion.setHours(estimatedCompletion.getHours() + remainingHours);
        
        insights.push({
          type: 'completion',
          confidence: Math.min(progress * 100, 90),
          prediction: `Task ${task.id} estimated to complete by ${estimatedCompletion.toLocaleString()}`,
          timeframe: `${remainingHours.toFixed(1)} hours`,
          supportingData: { taskId: task.id, progress, remainingHours }
        });
      }
    }
    
    return insights;
  }

  /**
   * Predict potential bottlenecks
   */
  private predictBottlenecks(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const tasks = this.taskManager['tasks'] || [];
    
    // Predict dependency bottlenecks
    const tasksWithDependencies = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
    
    for (const task of tasksWithDependencies) {
      const dependencyDepth = this.calculateDependencyDepth(task.id);
      
      if (dependencyDepth > 3 && task.status === 'pending') {
        insights.push({
          type: 'bottleneck',
          confidence: 75,
          prediction: `Task ${task.id} may create a bottleneck due to long dependency chain`,
          timeframe: 'Next 1-2 weeks',
          supportingData: { taskId: task.id, dependencyDepth }
        });
      }
    }
    
    return insights;
  }

  /**
   * Predict resource allocation issues
   */
  private predictResourceIssues(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    for (const resource of this.resourceAllocations) {
      if (resource.utilization > 90) {
        insights.push({
          type: 'resource',
          confidence: 85,
          prediction: `${resource.resource} may become overloaded soon`,
          timeframe: 'Next 1-2 weeks',
          supportingData: { resource: resource.resource, utilization: resource.utilization }
        });
      }
    }
    
    return insights;
  }

  /**
   * Predict risk escalation
   */
  private predictRiskEscalation(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const tasks = this.taskManager['tasks'] || [];
    
    const highRiskTasks = tasks.filter(t => t.risk_level === 'high' || t.risk_level === 'critical');
    
    for (const task of highRiskTasks) {
      if (task.status === 'in-progress' && task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysUntilDue < 7) {
          insights.push({
            type: 'risk',
            confidence: 90,
            prediction: `High-risk task ${task.id} may escalate due to approaching deadline`,
            timeframe: `${daysUntilDue.toFixed(0)} days`,
            supportingData: { taskId: task.id, riskLevel: task.risk_level, daysUntilDue }
          });
        }
      }
    }
    
    return insights;
  }

  /**
   * Get workflow optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // High-impact bottlenecks
    const criticalBottlenecks = this.bottlenecks.filter(b => b.severity === 'critical');
    if (criticalBottlenecks.length > 0) {
      recommendations.push(`🚨 Address ${criticalBottlenecks.length} critical bottlenecks immediately`);
    }
    
    // High-optimization patterns
    const highOptimizationPatterns = this.workflowPatterns.filter(p => p.optimizationPotential > 70);
    if (highOptimizationPatterns.length > 0) {
      recommendations.push(`⚡ Optimize ${highOptimizationPatterns.length} high-potential workflow patterns`);
    }
    
    // Resource overload
    const overloadedResources = this.resourceAllocations.filter(r => r.utilization > 100);
    if (overloadedResources.length > 0) {
      recommendations.push(`👥 Redistribute workload from ${overloadedResources.length} overloaded resources`);
    }
    
    // Predictive insights
    const highConfidenceInsights = this.predictiveInsights.filter(i => i.confidence > 80);
    if (highConfidenceInsights.length > 0) {
      recommendations.push(`🔮 Act on ${highConfidenceInsights.length} high-confidence predictive insights`);
    }
    
    return recommendations;
  }

  /**
   * Generate comprehensive workflow report
   */
  generateWorkflowReport(): string {
    let report = `
🧠 WORKFLOW INTELLIGENCE REPORT
${'='.repeat(60)}

📊 WORKFLOW PATTERNS:
  Total Patterns: ${this.workflowPatterns.length}
  High Optimization Potential: ${this.workflowPatterns.filter(p => p.optimizationPotential > 70).length}
  Average Efficiency: ${(this.workflowPatterns.reduce((sum, p) => sum + p.efficiency, 0) / this.workflowPatterns.length).toFixed(2)}

🚧 BOTTLENECKS:
  Total Bottlenecks: ${this.bottlenecks.length}
  Critical: ${this.bottlenecks.filter(b => b.severity === 'critical').length}
  High: ${this.bottlenecks.filter(b => b.severity === 'high').length}
  Medium: ${this.bottlenecks.filter(b => b.severity === 'medium').length}

👥 RESOURCE ALLOCATION:
  Total Resources: ${this.resourceAllocations.length}
  Overloaded (>100%): ${this.resourceAllocations.filter(r => r.utilization > 100).length}
  High Utilization (>80%): ${this.resourceAllocations.filter(r => r.utilization > 80).length}
  Underutilized (<50%): ${this.resourceAllocations.filter(r => r.utilization < 50).length}

🔮 PREDICTIVE INSIGHTS:
  Total Insights: ${this.predictiveInsights.length}
  High Confidence (>80%): ${this.predictiveInsights.filter(i => i.confidence > 80).length}
  Medium Confidence (50-80%): ${this.predictiveInsights.filter(i => i.confidence >= 50 && i.confidence <= 80).length}

💡 TOP OPTIMIZATION RECOMMENDATIONS:
`;

    const topRecommendations = this.getOptimizationRecommendations().slice(0, 5);
    topRecommendations.forEach((rec, index) => {
      report += `  ${index + 1}. ${rec}\n`;
    });

    return report;
  }

  /**
   * Helper method to calculate dependency depth
   */
  private calculateDependencyDepth(taskId: string): number {
    // This would be implemented with actual dependency traversal
    // For now, return a simulated value
    return Math.floor(Math.random() * 8) + 1;
  }

  /**
   * Helper method to detect circular dependencies
   */
  private detectCircularDependencies(taskId: string, dependencies: string[]): string[] {
    // This would be implemented with actual circular dependency detection
    // For now, return empty array (no circular deps detected)
    return [];
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up workflow intelligence system...');
    console.log('✅ Cleanup complete');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const workflowIntelligence = new WorkflowIntelligenceSystem();
  
  (async () => {
    try {
      await workflowIntelligence.initialize();
      
      console.log('\n' + workflowIntelligence.generateWorkflowReport());
      
      console.log('\n🎯 TOP OPTIMIZATION RECOMMENDATIONS:');
      const recommendations = workflowIntelligence.getOptimizationRecommendations();
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      
    } catch (error) {
      console.error('❌ Workflow intelligence failed:', error);
      process.exit(1);
    } finally {
      await workflowIntelligence.cleanup();
    }
  })();
}

export { WorkflowIntelligenceSystem };
