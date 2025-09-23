import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, HardDrive, Zap, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from './Card'
import { Button } from './Button'
import { Badge } from './Badge'
import { Progress } from './Progress'
import { usePerformanceMonitor } from '@/utils/performance'

interface PerformanceMonitorProps {
  className?: string
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className }) => {
  // PERFORMANCE: Monitor completely removed to reduce overhead
  return null

  // Update report every 2 seconds when monitoring
  React.useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setReport(getReport())
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring, getReport])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-chart-2'
    if (value >= thresholds.warning) return 'text-chart-4'
    return 'text-destructive'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-chart-2" />
    if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-chart-4" />
    return <AlertTriangle className="w-4 h-4 text-destructive" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2)) } ${ sizes[i]}`
  }

  return (
    <div className={className}>
      <Card variant="magical">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Performance Monitor</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time performance metrics and optimization insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </Badge>
                <Button
                  variant={isMonitoring ? 'outline' : 'primary'}
                  size="sm"
                  onClick={isMonitoring ? stop : start}
                >
                  {isMonitoring ? 'Stop' : 'Start'} Monitoring
                </Button>
              </div>
            </div>

            {/* Performance Metrics */}
            {isMonitoring && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* FPS Metric */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">FPS</span>
                    </div>
                    {getStatusIcon(report.fps.current, { good: 45, warning: 30 })}
                  </div>
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold ${getStatusColor(report.fps.current, { good: 45, warning: 30 })}`}>
                      {report.fps.current.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {report.fps.average.toFixed(1)} | Min: {report.fps.min.toFixed(1)}
                    </div>
                    <Progress 
                      value={Math.min(report.fps.current, 60)} 
                      max={60} 
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Memory Metric */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    {getStatusIcon(200 - report.memory.current, { good: 100, warning: 50 })}
                  </div>
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold ${getStatusColor(200 - report.memory.current, { good: 100, warning: 50 })}`}>
                      {report.memory.current.toFixed(1)}MB
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {report.memory.average.toFixed(1)}MB | Max: {report.memory.max.toFixed(1)}MB
                    </div>
                    <Progress 
                      value={report.memory.current} 
                      max={200} 
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Component Performance */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-chart-2" />
                      <span className="text-sm font-medium">Components</span>
                    </div>
                    {report.components.length > 0 && getStatusIcon(
                      50 - Math.max(...report.components.map(c => c.averageRenderTime)), 
                      { good: 40, warning: 30 }
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-chart-2">
                      {report.components.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tracked components
                    </div>
                    {report.components.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Slowest: {Math.max(...report.components.map(c => c.averageRenderTime)).toFixed(2)}ms
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Warnings */}
            {report.warnings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-chart-4/12 border border-chart-4/30 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-chart-4" />
                  <span className="font-medium text-chart-4">Performance Warnings</span>
                </div>
                <ul className="space-y-1">
                  {report.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-chart-4">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Detailed View Toggle */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Detailed Metrics
              </Button>
            </div>

            {/* Detailed Metrics */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Component Performance Details */}
                {report.components.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Component Performance</h4>
                    <div className="space-y-2">
                      {report.components
                        .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
                        .slice(0, 10)
                        .map((component, index) => (
                          <div key={component.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{component.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {component.renderCount} renders
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {component.averageRenderTime.toFixed(2)}ms avg
                              </span>
                              {component.averageRenderTime > 10 ? (
                                <TrendingUp className="w-3 h-3 text-destructive" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-chart-2" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Performance Tips */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <h4 className="font-medium text-primary mb-2">Optimization Tips</h4>
                  <ul className="space-y-1 text-sm text-primary">
                    <li>• Keep FPS above 30 for smooth animations</li>
                    <li>• Memory usage should stay below 100MB for optimal performance</li>
                    <li>• Component render times should be under 10ms</li>
                    <li>• Use React.memo() for expensive components</li>
                    <li>• Implement virtualization for large lists</li>
                    <li>• Optimize 3D scenes by reducing polygon count</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerformanceMonitor




