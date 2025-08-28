/**
 * Panel state management utilities
 */

export interface PanelStateManager {
  /** Save panel state to storage */
  saveState(panelId: string, state: any): void;
  /** Load panel state from storage */
  loadState(panelId: string): any;
  /** Clear panel state */
  clearState(panelId: string): void;
  /** Clear all panel states */
  clearAllStates(): void;
}

/**
 * Local storage based panel state manager
 */
export class LocalStoragePanelStateManager implements PanelStateManager {
  private readonly storagePrefix = 'panel-state-';

  saveState(panelId: string, state: any): void {
    try {
      const key = this.getStorageKey(panelId);
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to save panel state for ${panelId}:`, error);
    }
  }

  loadState(panelId: string): any {
    try {
      const key = this.getStorageKey(panelId);
      const storedState = localStorage.getItem(key);
      return storedState ? JSON.parse(storedState) : null;
    } catch (error) {
      console.error(`Failed to load panel state for ${panelId}:`, error);
      return null;
    }
  }

  clearState(panelId: string): void {
    try {
      const key = this.getStorageKey(panelId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear panel state for ${panelId}:`, error);
    }
  }

  clearAllStates(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all panel states:', error);
    }
  }

  private getStorageKey(panelId: string): string {
    return `${this.storagePrefix}${panelId}`;
  }
}

/**
 * In-memory panel state manager (useful for testing)
 */
export class InMemoryPanelStateManager implements PanelStateManager {
  private states: Map<string, any> = new Map();

  saveState(panelId: string, state: any): void {
    this.states.set(panelId, state);
  }

  loadState(panelId: string): any {
    return this.states.get(panelId) || null;
  }

  clearState(panelId: string): void {
    this.states.delete(panelId);
  }

  clearAllStates(): void {
    this.states.clear();
  }
}

// Export default state manager
export const panelStateManager = new LocalStoragePanelStateManager();
