import React from 'react'

import { logger } from './logger'

interface PerformanceMemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize?: number
  jsHeapSizeLimit?: number
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemoryInfo
}

/**
 * Performance monitoring utilities for ZimboMate V2
 * Tracks FPS, memory usage, and component render times
 */

interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  renderTime: number
  timestamp: number
}

interface ComponentMetrics {
  name: string
  renderCount: number
  totalRenderTime: number
  averageRenderTime: number
  lastRenderTime: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private componentMetrics = new Map<string, ComponentMetrics>()
  private fpsCounter = 0
  private lastFpsTime = performance.now()
  private isMonitoring = false
  private rafId: number | null = null

  start() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.trackFPS()
    this.trackMemory()
  }

  stop() {
    this.isMonitoring = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private trackFPS() {
    const now = performance.now()
    this.fpsCounter++

    if (now - this.lastFpsTime >= 1000) {
      const fps = Math.round(
        (this.fpsCounter * 1000) / (now - this.lastFpsTime),
      )
      this.fpsCounter = 0
      this.lastFpsTime = now

      // Log warning if FPS drops below 30
      if (fps < 30) {
        logger.warn(`⚠️ Low FPS detected: ${fps}fps`)
      }

      this.addMetric({
        fps,
        memoryUsage: this.getMemoryUsage(),
        renderTime: 0,
        timestamp: now,
      })
    }

    if (this.isMonitoring) {
      this.rafId = requestAnimationFrame(() => this.trackFPS())
    }
  }

  private trackMemory() {
    const perf = performance as PerformanceWithMemory
    const { memory } = perf
    if (memory && typeof memory.usedJSHeapSize === 'number') {
      return memory.usedJSHeapSize / 1024 / 1024
    }
    return 0
  }

  private getMemoryUsage(): number {
    return this.trackMemory()
  }

  private addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  // Track component render performance
  trackComponentRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now()
    const result = renderFn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    const existing = this.componentMetrics.get(componentName)
    if (existing) {
      existing.renderCount++
      existing.totalRenderTime += renderTime
      existing.averageRenderTime =
        existing.totalRenderTime / existing.renderCount
      existing.lastRenderTime = renderTime
    } else {
      this.componentMetrics.set(componentName, {
        name: componentName,
        renderCount: 1,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime,
        lastRenderTime: renderTime,
      })
    }

    // Log warning for slow renders
    if (renderTime > 16) {
      // 60fps = 16.67ms per frame
      logger.warn(
        `🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`,
      )
    }

    return result
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getComponentMetrics(): ComponentMetrics[] {
    return Array.from(this.componentMetrics.values())
  }

  getCurrentFPS(): number {
    const recent = this.metrics.slice(-5)
    if (recent.length === 0) return 0
    return recent.reduce((sum, m) => sum + m.fps, 0) / recent.length
  }

  getAverageMemoryUsage(): number {
    const recent = this.metrics.slice(-10)
    if (recent.length === 0) return 0
    return recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length
  }

  // Get performance report
  getReport(): {
    fps: { current: number; average: number; min: number }
    memory: { current: number; average: number; max: number }
    components: ComponentMetrics[]
    warnings: string[]
  } {
    const fps = this.metrics.map((m) => m.fps)
    const memory = this.metrics.map((m) => m.memoryUsage)
    const warnings: string[] = []

    const currentFPS = this.getCurrentFPS()
    const avgMemory = this.getAverageMemoryUsage()

    if (currentFPS < 30) warnings.push(`Low FPS: ${currentFPS.toFixed(1)}`)
    if (avgMemory > 100)
      warnings.push(`High memory usage: ${avgMemory.toFixed(1)}MB`)

    // Check for slow components
    this.componentMetrics.forEach((comp) => {
      if (comp.averageRenderTime > 10) {
        warnings.push(
          `Slow component: ${comp.name} (${comp.averageRenderTime.toFixed(2)}ms avg)`,
        )
      }
    })

    return {
      fps: {
        current: currentFPS,
        average:
          fps.length > 0 ? fps.reduce((a, b) => a + b, 0) / fps.length : 0,
        min: fps.length > 0 ? Math.min(...fps) : 0,
      },
      memory: {
        current: this.getMemoryUsage(),
        average: avgMemory,
        max: memory.length > 0 ? Math.max(...memory) : 0,
      },
      components: this.getComponentMetrics(),
      warnings,
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [isMonitoring, setIsMonitoring] = React.useState(false)

  React.useEffect(() => {
    if (isMonitoring) {
      performanceMonitor.start()
    } else {
      performanceMonitor.stop()
    }

    return () => performanceMonitor.stop()
  }, [isMonitoring])

  return {
    start: () => setIsMonitoring(true),
    stop: () => setIsMonitoring(false),
    isMonitoring,
    getReport: () => performanceMonitor.getReport(),
    getMetrics: () => performanceMonitor.getMetrics(),
  }
}

// Higher-order component for performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
) {
  const displayName =
    componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component'

  const PerformanceTrackedComponent = (props: P) => {
    return performanceMonitor.trackComponentRender(displayName, () => (
      <WrappedComponent {...props} />
    ))
  }

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${displayName})`
  return PerformanceTrackedComponent
}

// Performance optimization utilities
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Args) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number,
): (...args: Args) => void {
  let inThrottle = false

  return (...args: Args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Memory leak detection
export function detectMemoryLeaks() {
  const perf = performance as PerformanceWithMemory
  const initialMemory = perf.memory?.usedJSHeapSize ?? 0
  return {
    check: () => {
      const currentMemory = perf.memory?.usedJSHeapSize ?? 0
      const increase = currentMemory - initialMemory

      if (increase > 50 * 1024 * 1024) {
        // 50MB increase
        logger.warn(
          `🚨 Potential memory leak detected: ${(increase / 1024 / 1024).toFixed(2)}MB increase`,
        )
        return true
      }
      return false
    },
  }
}

// Auto-start performance monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.start()

  // Log performance report every 30 seconds
  setInterval(() => {
    const report = performanceMonitor.getReport()
    if (report.warnings.length > 0) {
      logger.info('🔍 Performance Report')
      logger.info(
        `FPS: ${report.fps.current.toFixed(1)} (avg: ${report.fps.average.toFixed(1)})`,
      )
      logger.info(
        `Memory: ${report.memory.current.toFixed(1)}MB (avg: ${report.memory.average.toFixed(1)}MB)`,
      )
      logger.warn('Warnings:', report.warnings)
      logger.info()
    }
  }, 30000)
}
