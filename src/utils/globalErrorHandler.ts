// Global error handler for errors that Error Boundaries can't catch
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: Array<{ error: Error; timestamp: number; context?: string }> = [];
  private maxQueueSize = 50;

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.logError(error, 'unhandled-promise-rejection');
      
      // Prevent the default browser behavior (logging to console)
      // event.preventDefault();
    });

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Uncaught Error:', event.error);
      
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message);
      
      this.logError(error, 'uncaught-error');
    });

    // Handle resource loading errors (images, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        const error = new Error(`Resource failed to load: ${target.tagName} - ${target.getAttribute('src') || target.getAttribute('href')}`);
        this.logError(error, 'resource-load-error');
      }
    }, true); // Use capture phase to catch resource errors
  }

  public logError(error: Error, context?: string): void {
    const errorEntry = {
      error,
      timestamp: Date.now(),
      context
    };

    // Add to queue
    this.errorQueue.push(errorEntry);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Global Error Handler - ${context || 'Unknown Context'}`);
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      console.error('Timestamp:', new Date(errorEntry.timestamp).toISOString());
      console.groupEnd();
    }

    // In production, you would send this to your error tracking service
    this.reportError(errorEntry);
  }

  private reportError(errorEntry: { error: Error; timestamp: number; context?: string }): void {
    // TODO: Replace with your actual error reporting service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    
    const errorReport = {
      message: errorEntry.error.message,
      stack: errorEntry.error.stack,
      context: errorEntry.context,
      timestamp: errorEntry.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(), // If you have user tracking
      sessionId: this.getSessionId(),
      buildVersion: process.env.REACT_APP_VERSION || 'unknown'
    };

    // Example: Send to your error tracking service
    // errorTrackingService.captureException(errorEntry.error, {
    //   extra: errorReport,
    //   tags: {
    //     context: errorEntry.context
    //   }
    // });

    console.log('Error report prepared:', errorReport);
  }

  public getRecentErrors(limit: number = 10): Array<{ error: Error; timestamp: number; context?: string }> {
    return this.errorQueue.slice(-limit);
  }

  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  private getCurrentUserId(): string | null {
    // TODO: Implement user ID retrieval from your auth system
    return localStorage.getItem('userId') || null;
  }

  private getSessionId(): string {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Method to manually report errors from try-catch blocks
  public captureException(error: Error, context?: string): void {
    this.logError(error, context);
  }

  // Method to report custom messages
  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string): void {
    const error = new Error(message);
    error.name = `CustomMessage_${level}`;
    this.logError(error, context);
  }
}

// Initialize the global error handler
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Export convenience functions
export const captureException = (error: Error, context?: string) => 
  globalErrorHandler.captureException(error, context);

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) => 
  globalErrorHandler.captureMessage(message, level, context);

// React hook for error handling in components
export const useErrorHandler = () => {
  return {
    captureException: (error: Error, context?: string) => {
      globalErrorHandler.captureException(error, context);
    },
    captureMessage: (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) => {
      globalErrorHandler.captureMessage(message, level, context);
    },
    getRecentErrors: (limit?: number) => globalErrorHandler.getRecentErrors(limit)
  };
};
