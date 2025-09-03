// Enhanced Error Analytics Service for ZimboMate
export interface ErrorPattern {
  id: string;
  pattern: RegExp;
  description: string;
  category: 'common' | 'critical' | 'performance' | 'user-action';
  suggestions: string[];
  documentation?: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  errorsByTime: Array<{ timestamp: number; count: number }>;
  topErrors: Array<{ message: string; count: number; lastSeen: number }>;
  userImpact: {
    affectedUsers: number;
    sessionsWithErrors: number;
    averageErrorsPerSession: number;
  };
}

export interface ErrorInsight {
  type: 'pattern' | 'spike' | 'regression' | 'new-error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  data?: unknown;
}

class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService;
  private errorPatterns: ErrorPattern[] = [];
  private errorHistory: Array<{
    error: Error;
    timestamp: number;
    component?: string;
    userId?: string;
    sessionId: string;
    context?: Record < string, unknown>;
  }> = [];

  private constructor() {
    this.initializePatterns();
    this.loadStoredErrors();
  }

  public static getInstance(): ErrorAnalyticsService {
    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService();
    }
    return ErrorAnalyticsService.instance;
  }

  private initializePatterns(): void {
    this.errorPatterns = [
      {
        id: 'null-property-access',
        pattern: /Cannot read propert(y | ies) .* of (null | undefined)/,
        description: 'Null / Undefined Property Access',
        category: 'common',
        suggestions: [
          'Use optional chaining (?.) operator',
          'Add null checks before property access',
          'Initialize variables with default values',
          'Use nullish coalescing (??) operator',
        ],
        documentation: 'https://developer.mozilla.org / en-US / docs / Web / JavaScript / Reference / Operators / Optional_chaining',
      },
      {
        id: 'function-not-found',
        pattern: /.* is not a function/,
        description: 'Function Call on Non-Function',
        category: 'common',
        suggestions: [
          'Verify the variable is actually a function',
          'Check import / export statements',
          'Ensure proper function binding in class methods',
          'Check for typos in function names',
        ],
      },
      {
        id: 'react-hooks-order',
        pattern: /Rendered (more | fewer) hooks than expected/,
        description: 'React Hooks Rules Violation',
        category: 'critical',
        suggestions: [
          'Ensure hooks are called in the same order every render',
          'Don\'t call hooks inside loops, conditions, or nested functions',
          'Move conditional logic inside hooks, not around them',
          'Review React Hooks rules documentation',
        ],
        documentation: 'https://reactjs.org / docs / hooks-rules.html',
      },
      {
        id: 'infinite-render',
        pattern: /Maximum update depth exceeded/,
        description: 'Infinite Re-render Loop',
        category: 'critical',
        suggestions: [
          'Check useEffect dependencies array',
          'Avoid calling setState in render methods',
          'Use useCallback for function dependencies',
          'Memoize expensive calculations with useMemo',
        ],
      },
      {
        id: 'network-error',
        pattern: /(NetworkError | fetch.*failed | ERR_NETWORK)/,
        description: 'Network / API Error',
        category: 'user-action',
        suggestions: [
          'Implement proper error handling for API calls',
          'Add retry logic for failed requests',
          'Show user-friendly error messages',
          'Check network connectivity',
        ],
      },
      {
        id: 'memory-leak',
        pattern: /(out of memory | Maximum call stack)/,
        description: 'Memory / Performance Issue',
        category: 'performance',
        suggestions: [
          'Check for memory leaks in event listeners',
          'Clean up subscriptions in useEffect cleanup',
          'Avoid creating objects in render methods',
          'Use React.memo for expensive components',
        ],
      },
    ];
  }

  private loadStoredErrors(): void {
    try {
      const stored = localStorage.getItem('zimbomate_error_history');
      if (stored) {
        this.errorHistory = JSON.parse(stored).slice(-100); // Keep last 100 errors
      }
    } catch {
      }
  }

  private saveErrors(): void {
    try {
      localStorage.setItem('zimbomate_error_history', JSON.stringify(this.errorHistory));
    } catch {
      }
  }

  public recordError(
    error: Error,
    component?: string,
    context?: Record < string, unknown>,
  ): void {
    const errorEntry = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      timestamp: Date.now(),
      component,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      context,
    };

    this.errorHistory.push(errorEntry);

    // Keep only last 100 errors in memory
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }

    this.saveErrors();
  }

  public analyzeError(error: _error): {
    patterns: ErrorPattern[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    suggestions: string[];
  } {
    const matchedPatterns = this.errorPatterns.filter(pattern =>
      pattern.pattern.test(error.message) || pattern.pattern.test(error.stack || ''),
    );

    const severity = this.calculateSeverity(error, matchedPatterns);
    const _category = matchedPatterns[0]?.category || 'unknown';
    const suggestions = matchedPatterns.flatMap(p => p.suggestions);

    return {
      patterns: matchedPatterns,
      severity,
      category,
      suggestions: [...new Set(suggestions)], // Remove duplicates
    };
  }

  private calculateSeverity(error: Error, patterns: ErrorPattern[]): 'low' | 'medium' | 'high' | 'critical' {
    if (patterns.some(p => p.category === 'critical')) return 'critical';
    if (patterns.some(p => p.category === 'performance')) return 'high';
    if (patterns.some(p => p.category === 'common')) return 'medium';
    return 'low';
  }

  public getMetrics(): ErrorMetrics {
    const _now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const recentErrors = this.errorHistory.filter(e => e.timestamp >= last24Hours);
    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};
    const topErrorsMap: Record < string, { count: number; lastSeen: number }> = {};

    for (const entry of recentErrors) {
      // Count by error type
      const errorType = entry.error.name || 'Unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      // Count by component
      if (entry.component) {
        errorsByComponent[entry.component] = (errorsByComponent[entry.component] || 0) + 1;
      }

      // Track top errors
      const errorKey = entry.error.message;
      if (!topErrorsMap[errorKey]) {
        topErrorsMap[errorKey] = { count: 0, lastSeen: 0 };
      }
      topErrorsMap[errorKey].count++;
      topErrorsMap[errorKey].lastSeen = Math.max(topErrorsMap[errorKey].lastSeen, entry.timestamp);
    }

    const topErrors = Object.entries(topErrorsMap)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count-a.count)
      .slice(0, 10);

    const uniqueUsers = new Set(recentErrors.map(e => e.userId).filter(Boolean)).size;
    const uniqueSessions = new Set(recentErrors.map(e => e.sessionId)).size;

    return {
      totalErrors: recentErrors.length,
      errorsByType,
      errorsByComponent,
      errorsByTime: this.getErrorTimeline(recentErrors),
      topErrors,
      userImpact: {
        affectedUsers: uniqueUsers,
        sessionsWithErrors: uniqueSessions,
        averageErrorsPerSession: uniqueSessions>0 ? recentErrors.length / uniqueSessions : 0,
      },
    };
  }

  private getErrorTimeline(errors: typeof this.errorHistory): Array<{ timestamp: number; count: number }> {
    const hourlyBuckets: Record < number, number> = {};

    for (const error of errors) {
      const hour = Math.floor(error.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);
      hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
    }

    return Object.entries(hourlyBuckets)
      .map(([timestamp, count]) => ({ timestamp: Number.parseInt(timestamp), count }))
      .sort((a, b) => a.timestamp-b.timestamp);
  }

  public getInsights(): ErrorInsight[] {
    const metrics = this.getMetrics();
    const insights: ErrorInsight[] = [];

    // Check for error spikes
    const timeline = metrics.errorsByTime;
    if (timeline.length >= 2) {
      const recent = timeline[timeline.length-1];
      const previous = timeline[timeline.length-2];

      if (recent.count > previous.count * 2 && recent.count > 5) {
        insights.push({
          type: 'spike',
          severity: 'high',
          title: 'Error Spike Detected',
          description: `Error count increased from ${previous.count} to ${recent.count} in the last hour`,
          recommendation: 'Investigate recent deployments or system changes',
        });
      }
    }

    // Check for new error patterns
    const recentErrors = this.errorHistory.slice(-10);
    const newErrorTypes = new Set(recentErrors.map(e => e.error.name));
    if (newErrorTypes.size > 3) {
      insights.push({
        type: 'new-error',
        severity: 'medium',
        title: 'Multiple New Error Types',
        description: `${newErrorTypes.size} different error types in recent activity`,
        recommendation: 'Review recent code changes for potential issues',
      });
    }

    // Check for high user impact
    if (metrics.userImpact.affectedUsers > 5) {
      insights.push({
        type: 'pattern',
        severity: 'critical',
        title: 'High User Impact',
        description: `${metrics.userImpact.affectedUsers} users affected by errors`,
        recommendation: 'Prioritize fixing the most common errors affecting users',
      });
    }

    return insights;
  }

  public searchErrors(query: string, filters?: {
    component?: string;
    errorType?: string;
    timeRange?: { start: number; end: number };
  }): typeof this.errorHistory {
    let results = this.errorHistory;

    // Apply filters
    if (filters?.component) {
      results = results.filter(e => e.component === filters.component);
    }

    if (filters?.errorType) {
      results = results.filter(e => e.error.name === filters.errorType);
    }

    if (filters?.timeRange) {
      results = results.filter(e =>
        e.timestamp >= filters.timeRange!.start &&
        e.timestamp <= filters.timeRange!.end,
      );
    }

    // Apply text search
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(e =>
        e.error.message.toLowerCase().includes(queryLower) ||
        e.error.stack?.toLowerCase().includes(queryLower) ||
        e.component?.toLowerCase().includes(queryLower),
      );
    }

    return results.sort((a, b) => b.timestamp-a.timestamp);
  }

  private getCurrentUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  public clearHistory(): void {
    this.errorHistory = [];
    localStorage.removeItem('zimbomate_error_history');
  }

  public exportErrorData(): string {
    return JSON.stringify({
      errors: this.errorHistory,
      metrics: this.getMetrics(),
      insights: this.getInsights(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }
}

export const errorAnalyticsService = ErrorAnalyticsService.getInstance();



