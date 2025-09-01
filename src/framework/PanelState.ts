/**
 * Panel state management utilities
 */

export interface PanelStateManager {
  /** Save panel state to storage */
  saveState(panelId: string, state: unknown): void;
  /** Load panel state from storage */
  loadState(panelId: string): unknown;
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

  saveState(panelId: string, state: unknown): void {
    try {
      const key = this.getStorageKey(panelId);
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      }
  }

  loadState(panelId: string): unknown {
    try {
      const key = this.getStorageKey(panelId);
      const storedState = localStorage.getItem(key);
      return storedState ? JSON.parse(storedState) : null;
    } catch (error) {
      return null;
    }
  }

  clearState(panelId: string): void {
    try {
      const key = this.getStorageKey(panelId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error clearing state for panel", panelId + ":", error);
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
  private states: Map < string, unknown> = new Map();

  saveState(panelId: string, state: unknown): void {
    this.states.set(panelId, state);
  }

  loadState(panelId: string): unknown {
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
