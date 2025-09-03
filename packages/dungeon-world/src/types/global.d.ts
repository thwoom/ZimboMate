/**
 * Global type definitions for browser APIs and DOM interfaces
 * This file extends the global scope with commonly used browser APIs
 */

declare global {
  interface Window {
    performanceMonitor?: import('../utils/PerformanceMonitor').PerformanceMonitor;
    panelDiagnostics?: import('../utils/panelDiagnostics').PanelDiagnostics;
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}

export {};