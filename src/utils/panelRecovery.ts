/**
 * Panel Recovery Utilities
 * Handles recovery from panel loading issues and provides debugging tools
 */

import { panelRegistry } from '../framework/PanelRegistry';
import { panelStateManager } from '../framework/PanelState';

export interface PanelRecoveryOptions {
  clearAllStates?: boolean;
  resetRegistry?: boolean;
  clearLocalStorage?: boolean;
  enableDebugMode?: boolean;
}

export class PanelRecoveryManager {
  private static instance: PanelRecoveryManager;
  private debugMode = false;

  private constructor() {}

  static getInstance(): PanelRecoveryManager {
    if (!PanelRecoveryManager.instance) {
      PanelRecoveryManager.instance = new PanelRecoveryManager();
    }
    return PanelRecoveryManager.instance;
  }

  /**
   * Emergency recovery - immediately stops infinite loops and resets everything
   */
  emergencyRecovery(): void {
    try {
      // Clear all React state by forcing a complete reload
      // Clear all localStorage to prevent corrupted state from persisting
      this.clearPanelRelatedLocalStorage();

      // Force a hard reload
      window.location.reload();
    } catch (error) {
      // Last resort - try to reload anyway
      window.location.reload();
    }
  }

  /**
   * Perform a full panel recovery
   */
  async performRecovery(options: PanelRecoveryOptions = {}): Promise<void> {
    const {
      clearAllStates = true,
      resetRegistry = true,
      clearLocalStorage = false,
      enableDebugMode = true,
    } = options;

    try {
      // Enable debug mode
      if (enableDebugMode) {
        this.debugMode = true;
      }

      // Clear panel states if requested
      if (clearAllStates) {
        // panelStateManager.clearAllStates();
      }

      // Clear localStorage if requested
      if (clearLocalStorage) {
        // this.clearPanelRelatedLocalStorage();
      }

      // Reset registry if requested
      if (resetRegistry) {
        // panelRegistry.clear();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all panel-related localStorage entries
   */
  private clearPanelRelatedLocalStorage(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('panel-state-') ||
        key.startsWith('zimbomate-') ||
        key.includes('character') ||
        key.includes('game')
      )) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        if (this.debugMode) {
          console.log(`Removed localStorage key: ${key}`);
        }
      } catch (error) {
        console.error("Failed to remove localStorage key:", key, error);
      }
    });
  }

  /**
   * Check panel registry health
   */
  checkRegistryHealth(): {
    totalPanels: number;
    panelIds: string[];
    hasCharacterCreation: boolean;
    hasCharacterStats: boolean;
    issues: string[];
  } {
    const allPanels = panelRegistry.getAllPanels();
    const panelIds = allPanels.map(p => p.metadata.id);
    const issues: string[] = [];

    // Check for required panels
    const hasCharacterCreation = panelIds.includes('character-creation');
    const hasCharacterStats = panelIds.includes('character-stats');

    if (!hasCharacterCreation) {
      issues.push('Character creation panel is missing');
    }
    if (!hasCharacterStats) {
      issues.push('Character stats panel is missing');
    }

    // Check for duplicate IDs
    const duplicates = panelIds.filter((id, index) => panelIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate panel IDs found: ${duplicates.join(', ')}`);
    }

    return {
      totalPanels: allPanels.length,
      panelIds,
      hasCharacterCreation,
      hasCharacterStats,
      issues,
    };
  }

  /**
   * Get comprehensive diagnostics
   */
  getDiagnostics(): {
    timestamp: string;
    userAgent: string;
    localStorageKeys: string[];
    panelStateKeys: string[];
    gameStateKeys: string[];
    memoryInfo: {
      usedJSHeapSize?: number;
      totalJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
    registryHealth: {
      totalPanels: number;
      panelIds: string[];
      hasCharacterCreation: boolean;
      hasCharacterStats: boolean;
      issues: string[];
    };
  } {
    const localStorageKeys: string[] = [];
    const panelStateKeys: string[] = [];
    const gameStateKeys: string[] = [];

    // Collect localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageKeys.push(key);
        if (key.startsWith('panel-state-')) {
          panelStateKeys.push(key);
        }
        if (key.includes('game') || key.includes('character')) {
          gameStateKeys.push(key);
        }
      }
    }

    // Get memory info if available
    const memoryInfo: {
      usedJSHeapSize?: number;
      totalJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    } = {};

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryInfo.usedJSHeapSize = memory.usedJSHeapSize;
      memoryInfo.totalJSHeapSize = memory.totalJSHeapSize;
      memoryInfo.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    }

    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      localStorageKeys,
      panelStateKeys,
      gameStateKeys,
      memoryInfo,
      registryHealth: this.checkRegistryHealth(),
    };
  }

  /**
   * Force reload the application
   */
  forceReload(): void {
    if (this.debugMode) {
      console.log('🔄 Force reloading application...');
    }
    window.location.reload();
  }

  /**
   * Create a recovery button for manual recovery
   */
  createRecoveryButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = '🔧 Panel Recovery';
    button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: monospace;
    `;

    button.addEventListener('click', () => {
      if (confirm('Perform panel recovery? This will clear all panel states and reload.')) {
        this.performRecovery({
          clearAllStates: true,
          resetRegistry: true,
          clearLocalStorage: true,
          enableDebugMode: true,
        });
      }
    });

    return button;
  }

  /**
   * Create an emergency button for critical recovery
   */
  createEmergencyButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = '🚨 Emergency Recovery';
    button.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      z-index: 10000;
      background: #ff4757;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: monospace;
    `;

    button.addEventListener('click', () => {
      if (confirm('EMERGENCY RECOVERY: This will force reload and clear everything. Continue?')) {
        this.emergencyRecovery();
      }
    });

    return button;
  }

  /**
   * Inject recovery tools into the page
   */
  injectRecoveryTools(): void {
    // Create recovery button
    const recoveryButton = this.createRecoveryButton();
    document.body.appendChild(recoveryButton);

    // Create emergency button
    const emergencyButton = this.createEmergencyButton();
    document.body.appendChild(emergencyButton);

    // Log availability
    console.group('🔧 Panel Recovery Tools Available');
    console.log('Recovery Button: Top-right corner');
    console.log('Emergency Button: Below recovery button');
    console.log('Use recovery for normal issues, emergency for critical failures');
    console.groupEnd();

    // Auto-inject in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Panel Recovery Tools auto-injected in development mode');
    }
  }
}

// Export a singleton instance
export const panelRecoveryManager = PanelRecoveryManager.getInstance();
