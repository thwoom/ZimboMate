import { Panel, PanelMetadata } from './Panel';
import { lazy, ComponentType, LazyExoticComponent } from 'react';

export type LazyPanel = {
  metadata: PanelMetadata;
  component: LazyExoticComponent<ComponentType<any>>;
  onMount?: () => void;
  onUnmount?: () => void;
};

/**
 * Central registry for managing all panels in the application
 */
export class PanelRegistry {
  private static instance: PanelRegistry;
  private panels: Map<string, Panel> = new Map();
  private lazyPanels: Map<string, LazyPanel> = new Map();
  private listeners: Set<(panelId: string, action: 'register' | 'unregister') => void> = new Set();

  private constructor() {}

  static getInstance(): PanelRegistry {
    if (!PanelRegistry.instance) {
      PanelRegistry.instance = new PanelRegistry();
    }
    return PanelRegistry.instance;
  }

  /**
   * Register a lazy-loaded panel
   */
  registerLazy(lazyPanel: LazyPanel): void {
    if (this.lazyPanels.has(lazyPanel.metadata.id) || this.panels.has(lazyPanel.metadata.id)) {
      if (process.env.NODE_ENV === 'development') {
        this.lazyPanels.set(lazyPanel.metadata.id, lazyPanel);
        return;
      } else {
        console.warn(`Panel with id "${lazyPanel.metadata.id}" is already registered`);
        return;
      }
    }

    this.lazyPanels.set(lazyPanel.metadata.id, lazyPanel);
    this.notifyListeners(lazyPanel.metadata.id, 'register');
    
    if (lazyPanel.onMount) {
      lazyPanel.onMount();
    }
  }

  /**
   * Register a new panel (legacy support)
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
   * Get a lazy panel by ID
   */
  getLazyPanel(panelId: string): LazyPanel | undefined {
    return this.lazyPanels.get(panelId);
  }

  /**
   * Check if panel is lazy-loaded
   */
  isLazyPanel(panelId: string): boolean {
    return this.lazyPanels.has(panelId);
  }

  /**
   * Get all registered panels
   */
  getAllPanels(): Panel[] {
    return Array.from(this.panels.values());
  }

  /**
   * Get all panel metadata (including lazy panels)
   */
  getAllPanelMetadata(): PanelMetadata[] {
    const regularMetadata = this.getAllPanels().map(panel => panel.metadata);
    const lazyMetadata = Array.from(this.lazyPanels.values()).map(panel => panel.metadata);
    return [...regularMetadata, ...lazyMetadata];
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
   * Check if a panel is registered (regular or lazy)
   */
  hasPanel(panelId: string): boolean {
    return this.panels.has(panelId) || this.lazyPanels.has(panelId);
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
    this.lazyPanels.forEach(panel => {
      if (panel.onUnmount) {
        panel.onUnmount();
      }
    });
    this.panels.clear();
    this.lazyPanels.clear();
  }
}

// Export singleton instance
export const panelRegistry = PanelRegistry.getInstance();
