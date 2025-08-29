import { Panel, PanelMetadata } from './Panel';

/**
 * Central registry for managing all panels in the application
 */
export class PanelRegistry {
  private static instance: PanelRegistry;
  private panels: Map<string, Panel> = new Map();
  private listeners: Set<(panelId: string, action: 'register' | 'unregister') => void> = new Set();

  private constructor() {}

  static getInstance(): PanelRegistry {
    if (!PanelRegistry.instance) {
      PanelRegistry.instance = new PanelRegistry();
    }
    return PanelRegistry.instance;
  }

  /**
   * Register a new panel
   */
  register(panel: Panel): void {
    if (this.panels.has(panel.metadata.id)) {
      // In development with StrictMode, this is expected behavior
      if (process.env.NODE_ENV === 'development') {
        // Replace the existing panel silently
        this.panels.set(panel.metadata.id, panel);
        return;
      } else {
        console.warn(`Panel with id "${panel.metadata.id}" is already registered`);
        return;
      }
    }

    this.panels.set(panel.metadata.id, panel);
    this.notifyListeners(panel.metadata.id, 'register');
    
    // Call onMount if provided
    if (panel.onMount) {
      panel.onMount();
    }
  }

  /**
   * Unregister a panel
   */
  unregister(panelId: string): void {
    const panel = this.panels.get(panelId);
    if (!panel) {
      console.warn(`Panel with id "${panelId}" is not registered`);
      return;
    }

    // Call onUnmount if provided
    if (panel.onUnmount) {
      panel.onUnmount();
    }

    this.panels.delete(panelId);
    this.notifyListeners(panelId, 'unregister');
  }

  /**
   * Get a panel by ID
   */
  getPanel(panelId: string): Panel | undefined {
    return this.panels.get(panelId);
  }

  /**
   * Get all registered panels
   */
  getAllPanels(): Panel[] {
    return Array.from(this.panels.values());
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
      return priorityA - priorityB;
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
    this.listeners.forEach(listener => listener(panelId, action));
  }

  /**
   * Clear all panels (useful for testing)
   */
  clear(): void {
    this.getAllPanels().forEach(panel => {
      if (panel.onUnmount) {
        panel.onUnmount();
      }
    });
    this.panels.clear();
  }
}

// Export singleton instance
export const panelRegistry = PanelRegistry.getInstance();
