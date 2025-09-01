/**
 * Panel Diagnostics Tool * Helps identify and fix panel loading issues
 */

import { panelRegistry } from '../framework/PanelRegistry';
import { panelStateManager } from '../framework/PanelState';

export class PanelDiagnostics {
  private static instance: PanelDiagnostics;

  private constructor() {}

  static getInstance(): PanelDiagnostics {
    if (!PanelDiagnostics.instance) {
      PanelDiagnostics.instance = new PanelDiagnostics();
    }
    return PanelDiagnostics.instance;
  }

  /**
   * Run comprehensive diagnostics
   */
  runDiagnostics(): {
    registry: unknown;
    localStorage: unknown;
    memory: unknown;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check registry health
    const registry = this.checkRegistry();
    if (registry.issues.length > 0) {
      issues.push(...registry.issues);
    }

    // Check localStorage
    const localStorage = this.checkLocalStorage();
    if (localStorage.issues.length > 0) {
      issues.push(...localStorage.issues);
    }

    // Check memory usage
    const memory = this.checkMemory();

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push('Run panelRecoveryManager.performRecovery() to fix issues');
    }
    if (memory.usedJSHeapSize && memory.usedJSHeapSize > 50 * 1024 * 1024) {
      recommendations.push('Memory usage is high-consider refreshing the page');
    }

    return {
      registry,
      localStorage,
      memory,
      issues,
      recommendations,
    };
  }

  /**
   * Check panel registry
   */
  private checkRegistry(): {
    totalPanels: number;
    panelIds: string[];
    issues: string[];
  } {
    const allPanels = panelRegistry.getAllPanels();
    const panelIds = allPanels.map(p => p.metadata.id);
    const issues: string[] = [];

    // Check for required panels
    const requiredPanels = ['character-stats', 'character-creation'];
    requiredPanels.forEach(required => {
      if (!panelIds.includes(required)) {
        issues.push(`Missing required panel: ${required}`);
      }
    });

    // Check for duplicate IDs
    const duplicates = panelIds.filter((id, index) => panelIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate panel IDs: ${duplicates.join(', ')}`);
    }

    return {
      totalPanels: allPanels.length,
      panelIds,
      issues,
    };
  }

  /**
   * Check localStorage
   */
  private checkLocalStorage(): {
    totalKeys: number;
    panelStateKeys: string[];
    gameStateKeys: string[];
    issues: string[];
  } {
    const panelStateKeys: string[] = [];
    const gameStateKeys: string[] = [];
    const issues: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (key) {
        if (key.startsWith('panel-state-')) {
          panelStateKeys.push(key);

          // Check for corrupted panel state
          try {
            if (value) {
              JSON.parse(value);
            }
          } catch (error) {
            issues.push(`Corrupted panel state: ${key}`);
          }
        } else if (key.startsWith('zimbomate-')) {
          gameStateKeys.push(key);
        }
      }
    }

    return {
      totalKeys: localStorage.length,
      panelStateKeys,
      gameStateKeys,
      issues,
    };
  }

  /**
   * Check memory usage
   */
  private checkMemory(): {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  } {
    if ('memory' in performance) {
      const mem = (performance as string).memory;
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
      };
    }
    return {};
  }

  /**
   * Quick fix for common issues
   */
  async quickFix(): Promise < void> {
    // // // Clear corrupted panel states
    const corruptedStates: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('panel-state-')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value);
          }
        } catch (error) {
          corruptedStates.push(key);
        }
      }
    }

    // Remove corrupted states
    corruptedStates.forEach(key => {
      // // localStorage.removeItem(key);
    });

    // Clear all panel states if there are many corrupted ones
    if (corruptedStates.length > 3) {
      // panelStateManager.clearAllStates();
    }
  }

  /**
   * Create diagnostic report
   */
  createReport(): string {
    const diagnostics = this.runDiagnostics();

    let report = '📊 Panel Diagnostics Report\n';
    report += '='.repeat(50) + '\n\n';

    // Registry info
    report += '📋 Registry:\n';
    report += `  Total panels: ${diagnostics.registry.totalPanels}\n`;
    report += `  Panel IDs: ${diagnostics.registry.panelIds.join(', ')}\n`;
    if (diagnostics.registry.issues.length > 0) {
      report += `  Issues: ${diagnostics.registry.issues.join(', ')}\n`;
    }
    report += '\n';

    // localStorage info
    report += '💾 LocalStorage:\n';
    report += `  Total keys: ${diagnostics.localStorage.totalKeys}\n`;
    report += `  Panel state keys: ${diagnostics.localStorage.panelStateKeys.length}\n`;
    report += `  Game state keys: ${diagnostics.localStorage.gameStateKeys.length}\n`;
    if (diagnostics.localStorage.issues.length > 0) {
      report += `  Issues: ${diagnostics.localStorage.issues.join(', ')}\n`;
    }
    report += '\n';

    // Memory info
    if (diagnostics.memory.usedJSHeapSize) {
      report += '🧠 Memory:\n';
      report += `  Used: ${Math.round(diagnostics.memory.usedJSHeapSize / 1024 / 1024)}MB\n`;
      report += `  Total: ${Math.round(diagnostics.memory.totalJSHeapSize / 1024 / 1024)}MB\n`;
      report += `  Limit: ${Math.round(diagnostics.memory.jsHeapSizeLimit / 1024 / 1024)}MB\n\n`;
    }

    // Issues and recommendations
    if (diagnostics.issues.length > 0) {
      report += '⚠️ Issues Found:\n';
      diagnostics.issues.forEach(issue => {
        report += ` -${issue}\n`;
      });
      report += '\n';
    }

    if (diagnostics.recommendations.length > 0) {
      report += '💡 Recommendations:\n';
      diagnostics.recommendations.forEach(rec => {
        report += ` -${rec}\n`;
      });
      report += '\n';
    }

    return report;
  }

  /**
   * Inject diagnostic tools into the page
   */
  injectDiagnosticTools(): void {
    // Add diagnostic button
    const button = document.createElement('button');
    button.textContent = '🔍 Diagnose';
    button.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      z-index: 10000;
      background: #2196f3;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;

          button.addEventListener('click', () => {
        const report = this.createReport();
        // alert('Diagnostic report logged to console. Press F12 to view.');
      });

    document.body.appendChild(button);

    // Make available globally
    (window as any).panelDiagnostics = this;
  }
}

// Export singleton instance
export const panelDiagnostics = PanelDiagnostics.getInstance();
