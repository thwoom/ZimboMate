/**
 * Performance monitoring utility for tracking application performance
 */

export interface PerformanceMetrics {
  panelSwitchTime: number;
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  panelSwitchTime: number; // milliseconds
  renderTime: number; // milliseconds
  memoryUsage: number; // MB
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds = {
    panelSwitchTime: 100, // 100ms for panel switching
    renderTime: 50, // 50ms for rendering
    memoryUsage: 100, // 100MB memory usage
  };

  /**
   * Start timing a panel switch
   */
  startPanelSwitch(): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const switchTime = endTime-startTime;

      this.recordMetric({
        panelSwitchTime: switchTime,
        renderTime: 0,
        timestamp: Date.now(),
      });

      if (switchTime > this.thresholds.panelSwitchTime) {
        console.warn(`Slow panel switch: ${switchTime.toFixed(2)}ms (threshold: ${this.thresholds.panelSwitchTime}ms)`);
      }
    };
  }

  /**
   * Start timing a render operation
   */
  startRender(): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime-startTime;

      this.recordMetric({
        panelSwitchTime: 0,
        renderTime: renderTime,
        timestamp: Date.now(),
      });

      if (renderTime > this.thresholds.renderTime) {
        console.warn(`Slow render: ${renderTime.toFixed(2)}ms (threshold: ${this.thresholds.renderTime}ms)`);
      }
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    averagePanelSwitchTime: number;
    averageRenderTime: number;
    totalMetrics: number;
    slowSwitches: number;
    slowRenders: number;
  } {
    const panelSwitches = this.metrics.filter(m => m.panelSwitchTime > 0);
    const renders = this.metrics.filter(m => m.renderTime > 0);

    const averagePanelSwitchTime = panelSwitches.length > 0
      ? panelSwitches.reduce((sum, m) => sum + m.panelSwitchTime, 0) / panelSwitches.length
      : 0;

    const averageRenderTime = renders.length > 0
      ? renders.reduce((sum, m) => sum + m.renderTime, 0) / renders.length
      : 0;

    const slowSwitches = panelSwitches.filter(m => m.panelSwitchTime > this.thresholds.panelSwitchTime).length;
    const slowRenders = renders.filter(m => m.renderTime > this.thresholds.renderTime).length;

    return {
      averagePanelSwitchTime,
      averageRenderTime,
      totalMetrics: this.metrics.length,
      slowSwitches,
      slowRenders,
    };
  }

  /**
   * Check if performance is within acceptable thresholds
   */
  isPerformanceAcceptable(): boolean {
    const stats = this.getStats();
    return (
      stats.averagePanelSwitchTime <= this.thresholds.panelSwitchTime &&
      stats.averageRenderTime <= this.thresholds.renderTime
    );
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return null;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get all metrics for analysis
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Development helper: Expose to window for debugging
if (process.env.NODE_ENV === 'development') {
  (window as Window & { performanceMonitor?: typeof performanceMonitor }).performanceMonitor = performanceMonitor;
}



