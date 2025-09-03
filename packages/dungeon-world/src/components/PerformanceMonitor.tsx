import React, { useEffect, useState } from 'react'

import './PerformanceMonitor.css'

interface PerformanceMetrics {
  calculationTime: number
  renderTime: number
  cacheHitRate: number
  memoryUsage: number
  activeCalculations: number
}

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics
  cacheStats?: {
    size: number
    hitRate: number
    oldestEntry: Date | null
  }
  onClearCache?: () => void
  compact?: boolean
}

export const PerformanceMonitor: React.FC <PerformanceMonitorProps> = ({
  metrics,
  cacheStats,
  onClearCache,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [history, setHistory] = useState <PerformanceMetrics[]>([])

  // Track performance history
  useEffect(() => {
    setHistory(prev => [...prev.slice(-19), metrics].slice(-20))
  }, [metrics])

  const getPerformanceColor = (time: number) => {
    if (time < 16)
      return 'good' // 60fps
    if (time < 33)
      return 'warning' // 30fps
    return 'bad'
  }

  const formatTime = (ms: number) => {
    return ms < 1 ? `${(ms * 1000).toFixed(0)}μs` : `${ms.toFixed(1)}ms`
  }

  const formatMemory = (bytes: number) => {
    if (bytes < 1024)
      return `${bytes}B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const avgCalculationTime = history.length > 0
    ? history.reduce((sum, m) => sum + m.calculationTime, 0) / history.length
    : 0

  if (compact && !isExpanded) {
    return (
      <div
        className="performance-monitor compact"
        onClick={() => setIsExpanded(true)}
      >
        <span className="monitor-icon">📊</span>
        <span className="monitor-summary">
          Calc:
          {' '}
          {formatTime(metrics.calculationTime)}
          {' '}
          |
          Cache:
          {' '}
          {cacheStats?.size || 0}
          {' '}
          items
        </span>
        <button className="expand-btn">▶</button>
      </div>
    )
  }

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3> Performance Monitor</h3>
        {compact && (
          <button
            className="collapse-btn"
            onClick={() => setIsExpanded(false)}
          >
            ▼
          </button>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <label> Calculation Time</label>
          <div className={`metric-value ${getPerformanceColor(metrics.calculationTime)}`}>
            {formatTime(metrics.calculationTime)}
          </div>
          <div className="metric-detail">
            Avg:
            {' '}
            {formatTime(avgCalculationTime)}
          </div>
        </div>

        <div className="metric">
          <label> Render Time</label>
          <div className={`metric-value ${getPerformanceColor(metrics.renderTime)}`}>
            {formatTime(metrics.renderTime)}
          </div>
        </div>

        <div className="metric">
          <label> Active Calculations</label>
          <div className="metric-value">
            {metrics.activeCalculations}
          </div>
        </div>

        <div className="metric">
          <label> Memory Usage</label>
          <div className="metric-value">
            {formatMemory(metrics.memoryUsage)}
          </div>
        </div>
      </div>

      {cacheStats && (
        <div className="cache-section">
          <h4> Cache Statistics</h4>
          <div className="cache-stats">
            <div className="cache-stat">
              <label> Size</label>
              <span>
                {cacheStats.size}
                {' '}
                entries
              </span>
            </div>
            <div className="cache-stat">
              <label> Hit Rate</label>
              <span>
                {(cacheStats.hitRate * 100).toFixed(1)}
                %
              </span>
            </div>
            <div className="cache-stat">
              <label> Oldest Entry</label>
              <span>
                {cacheStats.oldestEntry
                  ? `${Math.floor((Date.now() - cacheStats.oldestEntry.getTime()) / 1000)}s ago`
                  : 'Empty'}
              </span>
            </div>
          </div>
          {onClearCache && (
            <button onClick={onClearCache} className="clear-cache-btn">
              Clear Cache
            </button>
          )}
        </div>
      )}

      <div className="performance-graph">
        <h4> Calculation Time History</h4>
        <div className="graph">
          {history.map((item, index) => (
            <div
              key={index}
              className={`graph-bar ${getPerformanceColor(metric.calculationTime)}`}
              style={{
                height: `${Math.min(100, (metric.calculationTime / 50) * 100)}%`,
              }}
              title={`${formatTime(metric.calculationTime)}`}
            />
          ))}
        </div>
        <div className="graph-labels">
          <span> 0ms</span>
          <span> 25ms</span>
          <span> 50ms</span>
        </div>
      </div>
    </div>
  )
}
