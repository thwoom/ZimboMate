// User Action Tracking Service for Enhanced Error Context
export interface UserAction {
  id: string;
  type: 'click' | 'navigation' | 'input' | 'api-call' | 'error' | 'custom';
  timestamp: number;
  description: string;
  element?: string;
  data?: Record < string, unknown>;
  sessionId: string;
}

class UserActionTracker {
  private static instance: UserActionTracker;
  private actions: UserAction[] = [];
  private maxActions = 50; // Keep last 50 actions
  private isTracking = true;

  private constructor() {
    this.initializeTracking();
    this.loadStoredActions();
  }

  public static getInstance(): UserActionTracker {
    if (!UserActionTracker.instance) {
      UserActionTracker.instance = new UserActionTracker();
    }
    return UserActionTracker.instance;
  }

  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      if (!this.isTracking) return;

      const target = event.target as HTMLElement;
      const description = this.getElementDescription(target);

      this.recordAction({
        type: 'click',
        description: `Clicked: ${description}`,
        element: target.tagName.toLowerCase(),
        data: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        },
      });
    });

    // Track navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      UserActionTracker.getInstance().recordAction({
        type: 'navigation',
        description: `Navigated to: ${args[2] || window.location.pathname}`,
        data: { url: args[2] || window.location.pathname },
      });
      return originalPushState.apply(history, args);
    };

    history.replaceState = function(...args) {
      UserActionTracker.getInstance().recordAction({
        type: 'navigation',
        description: `Replaced state: ${args[2] || window.location.pathname}`,
        data: { url: args[2] || window.location.pathname },
      });
      return originalReplaceState.apply(history, args);
    };

    // Track form inputs (debounced)
    let inputTimeout: NodeJS.Timeout;
    document.addEventListener('input', (event) => {
      if (!this.isTracking) return;

      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const target = event.target as HTMLInputElement;
        if (target.type !== 'password') { // Don't track passwords
          this.recordAction({
            type: 'input',
            description: `Input in: ${this.getElementDescription(target)}`,
            element: target.tagName.toLowerCase(),
            data: {
              inputType: target.type,
              name: target.name,
              id: target.id,
            },
          });
        }
      }, 1000);
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.recordAction({
        type: 'error',
        description: `JavaScript Error: ${event.message}`,
        data: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordAction({
        type: 'error',
        description: `Unhandled Promise Rejection: ${event.reason}`,
        data: {
          reason: String(event.reason),
        },
      });
    });
  }

  private getElementDescription(element: HTMLElement): string {
    // Try to get a meaningful description of the element
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    if (element.textContent && element.textContent.length < 50) {
      return `"${element.textContent.trim()}"`;
    }
    if (element.getAttribute('aria-label')) {
      return `[${element.getAttribute('aria-label')}]`;
    }
    if (element.getAttribute('data-testid')) {
      return `[data-testid="${element.getAttribute('data-testid')}"]`;
    }

    return element.tagName.toLowerCase();
  }

  public recordAction(action: Omit < UserAction, 'id' | 'timestamp' | 'sessionId'>): void {
    if (!this.isTracking) return;

    const fullAction: UserAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
    };

    this.actions.push(fullAction);

    // Keep only the last N actions
    if (this.actions.length > this.maxActions) {
      this.actions = this.actions.slice(-this.maxActions);
    }

    this.saveActions();
  }

  public getRecentActions(limit = 10): UserAction[] {
    return this.actions.slice(-limit).reverse(); // Most recent first
  }

  public getActionsForTimeRange(start: number, end: number): UserAction[] {
    return this.actions.filter(action =>
      action.timestamp >= start && action.timestamp <= end,
    );
  }

  public getActionsByType(type: UserAction['type']): UserAction[] {
    return this.actions.filter(action => action.type === type);
  }

  public getActionsBeforeError(errorTimestamp: number, lookbackMs = 30000): UserAction[] {
    const _startTime = errorTimestamp-lookbackMs;
    return this.actions.filter(action =>
      action.timestamp >= startTime && action.timestamp <= errorTimestamp,
    );
  }

  public generateUserJourney(): string[] {
    const recentActions = this.getRecentActions(20);
    return recentActions.map(action => {
      const time = new Date(action.timestamp).toLocaleTimeString();
      return `${time}: ${action.description}`;
    });
  }

  public startTracking(): void {
    this.isTracking = true;
  }

  public stopTracking(): void {
    this.isTracking = false;
  }

  public clearActions(): void {
    this.actions = [];
    this.saveActions();
  }

  private loadStoredActions(): void {
    try {
      const stored = localStorage.getItem('zimbomate_user_actions');
      if (stored) {
        this.actions = JSON.parse(stored).slice(-this.maxActions);
      }
    } catch {
      }
  }

  private saveActions(): void {
    try {
      localStorage.setItem('zimbomate_user_actions', JSON.stringify(this.actions));
    } catch {
      }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // React-specific tracking methods
  public trackComponentMount(componentName: string, props?: Record < string, unknown>): void {
    this.recordAction({
      type: 'custom',
      description: `Component mounted: ${componentName}`,
      data: { componentName, props },
    });
  }

  public trackComponentUnmount(componentName: string): void {
    this.recordAction({
      type: 'custom',
      description: `Component unmounted: ${componentName}`,
      data: { componentName },
    });
  }

  public trackApiCall(url: string, method: string, status?: number): void {
    this.recordAction({
      type: 'api-call',
      description: `API ${method} ${url}${status ? ` (${status})` : ''}`,
      data: { url, method, status },
    });
  }

  public trackCustomEvent(description: string, data?: Record < string, unknown>): void {
    this.recordAction({
      type: 'custom',
      description,
      data,
    });
  }

  // Hook for React components
  public useActionTracker() {
    return {
      trackClick: (description: string, data?: Record < string, unknown>) =>
        this.recordAction({ type: 'click', description, data }),
      trackNavigation: (description: string, data?: Record < string, unknown>) =>
        this.recordAction({ type: 'navigation', description, data }),
      trackCustom: (description: string, data?: Record < string, unknown>) =>
        this.recordAction({ type: 'custom', description, data }),
    };
  }
}

export const userActionTracker = UserActionTracker.getInstance();

// React Hook
export function useUserActionTracker() {
  return userActionTracker.useActionTracker();
}



