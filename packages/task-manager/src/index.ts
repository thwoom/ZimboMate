// Main entry point for the Task Manager package
export { EnhancedTaskManager } from '../scripts/enhancedTaskManager';
export { default as TaskManager } from '../scripts/taskManager';

// Export types
export type { ComplexityScore, DependencyAnalysis, EnhancedTask, RiskAssessment } from '../scripts/enhancedTaskManager';

// Export utility functions
export * from '../scripts/taskCompletionWorkflow';
export * from '../scripts/taskHelpers';

// Dashboard functionality
export * from '../scripts/dashboardAPI';
export * from '../scripts/singleDashboard';

// Semgrep integration
export * from '../scripts/semgrepIntegration';

// Workflow automation
export * from '../scripts/workflowAutomation';
export * from '../scripts/workflowIntelligence';

// Analytics
export * from '../scripts/advancedAnalytics';
