import { Panel, PanelMetadata } from './Panel';

/**
 * Central registry for managing all panels in the application
 */
export class PanelRegistry {
  private static instance: PanelRegistry;
  private panels: Map < string, Panel> = new Map();
  private listeners: Set<(panelId: string, action: 'register' | 'unregister') => void> = new Set();
  private registrationErrors: Array<{ panelId: string; error: Error; timestamp: number }> = [];

  private constructor() {}

  static getInstance(): PanelRegistry {
    if (!PanelRegistry.instance) {
      PanelRegistry.instance = new PanelRegistry();
    }
    return PanelRegistry.instance;
  }

  /**
   * Register a new panel with enhanced error handling
   */
  register(panel: Panel): void {
    try {
      // Validate panel structure
      if (!panel || !panel.metadata || !panel.metadata.id) {
        throw new Error('Invalid panel structure: missing metadata or id');
      }

      if (!panel.component) {
        throw new Error(`Panel ${panel.metadata.id} is missing component`);
      }

      if (this.panels.has(panel.metadata.id)) {
        // In development with StrictMode, this is expected behavior
        if (process.env.NODE_ENV === 'development') {
          // Replace the existing panel silently
          this.panels.set(panel.metadata.id, panel);
          return;
        } else {
          return;
        }
      }

      this.panels.set(panel.metadata.id, panel);
      this.notifyListeners(panel.metadata.id, 'register');

      // Call onMount if provided with error handling
      if (panel.onMount) {
        try {
          panel.onMount();
        } catch (error) {
          this.registrationErrors.push({
            panelId: panel.metadata.id,
            error: error instanceof Error ? error : new Error(String(_error)),
            timestamp: Date.now(),
          });
        }
      }

      } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(_error));
      this.registrationErrors.push({
        panelId: panel?.metadata?.id || 'unknown',
        error: errorObj,
        timestamp: Date.now(),
      });

      // In development, throw the error to help with debugging
      if (process.env.NODE_ENV === 'development') {
        throw errorObj;
      }
    }
  }

  /**
   * Unregister a panel with enhanced error handling
   */
  unregister(panelId: string): void {
    try {
      const panel = this.panels.get(panelId);
      if (!panel) {
        return;
      }

      // Call onUnmount if provided with error handling
      if (panel.onUnmount) {
        try {
          panel.onUnmount();
        } catch (error) {
          console.error("Error in panel onUnmount for", panelId + ":", error);
        }
      }

      this.panels.delete(panelId);
      this.notifyListeners(panelId, 'unregister');
      } catch {
      }
  }

  /**
   * Get a panel by ID with validation
   */
  getPanel(panelId: string): Panel | undefined {
    if (!panelId) {
      return undefined;
    }

    const panel = this.panels.get(panelId);
    if (!panel) {
      return undefined;
    }

    return panel;
  }

  /**
   * Get all registered panels
   */
  getAllPanels(): Panel[] {
    return [...this.panels.values()];
  }

  /**
   * Get all panel metadata
   */
  getAllPanelMetadata(): PanelMetadata[] {
    return this.getAllPanels().map(panel => panel.metadata);
  }

  /**
   * Get panels sorted by priority
   */
  getPanelsByPriority(): Panel[] {
    return this.getAllPanels().sort((a, b) => {
      const priorityA = a.metadata.priority ?? 999;
      const priorityB = b.metadata.priority ?? 999;
      return priorityA-priorityB;
    });
  }

  /**
   * Check if a panel is registered
   */
  hasPanel(panelId: string): boolean {
    return this.panels.has(panelId);
  }

  /**
   * Add a listener for registry changes
   */
  addListener(listener: (panelId: string, action: 'register' | 'unregister') => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(panelId: string, action: 'register' | 'unregister'): void {
    for (const listener of this.listeners) {
      try {
        listener(panelId, action);
      } catch {
        }
    }
  }

  /**
   * Clear all panels with enhanced error handling
   */
  clear(): void {
    for (const panel of this.getAllPanels()) {
      try {
        if (panel.onUnmount) {
          panel.onUnmount();
        }
      } catch {
        }
    }

    this.panels.clear();
    }

  /**
   * Get registration errors for debugging
   */
  getRegistrationErrors(): Array<{ panelId: string; error: Error; timestamp: number }> {
    return [...this.registrationErrors];
  }

  /**
   * Clear registration errors
   */
  clearRegistrationErrors(): void {
    this.registrationErrors = [];
  }

  /**
   * Get registry health information
   */
  getHealthInfo(): {
    totalPanels: number;
    panelIds: string[];
    registrationErrors: number;
    hasRequiredPanels: boolean;
  } {
    const allPanels = this.getAllPanels();
    const panelIds = allPanels.map(p => p.metadata.id);

    // Check for required panels
    const requiredPanels = ['character-stats', 'character-creation'];
    const hasRequiredPanels = requiredPanels.every(id => panelIds.includes(id));

    return {
      totalPanels: allPanels.length,
      panelIds,
      registrationErrors: this.registrationErrors.length,
      hasRequiredPanels,
    };
  }
}

// Export singleton instance
export const panelRegistry = PanelRegistry.getInstance();



