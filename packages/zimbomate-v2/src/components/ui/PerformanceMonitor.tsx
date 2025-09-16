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
  const { start, stop, isMonitoring, getReport, getMetrics } = usePerformanceMonitor()
  const [report, setReport] = React.useState(getReport())
  const [showDetails, setShowDetails] = React.useState(false)

  // Update report every 2 seconds when monitoring
  React.useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      setReport(getReport())
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring, getReport])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (value >= thresholds.warning) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <AlertTriangle className="w-4 h-4 text-red-600" />
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={className}>
      <Card variant="magical" padding="lg">
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Performance Monitor</h3>
                  <p className="text-sm text-gray-600">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">FPS</span>
                    </div>
                    {getStatusIcon(report.fps.current, { good: 45, warning: 30 })}
                  </div>
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold ${getStatusColor(report.fps.current, { good: 45, warning: 30 })}`}>
                      {report.fps.current.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    {getStatusIcon(200 - report.memory.current, { good: 100, warning: 50 })}
                  </div>
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold ${getStatusColor(200 - report.memory.current, { good: 100, warning: 50 })}`}>
                      {report.memory.current.toFixed(1)}MB
                    </div>
                    <div className="text-xs text-gray-500">
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Components</span>
                    </div>
                    {report.components.length > 0 && getStatusIcon(
                      50 - Math.max(...report.components.map(c => c.averageRenderTime)), 
                      { good: 40, warning: 30 }
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">
                      {report.components.length}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tracked components
                    </div>
                    {report.components.length > 0 && (
                      <div className="text-xs text-gray-500">
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
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Performance Warnings</span>
                </div>
                <ul className="space-y-1">
                  {report.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
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
                          <div key={component.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{component.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {component.renderCount} renders
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {component.averageRenderTime.toFixed(2)}ms avg
                              </span>
                              {component.averageRenderTime > 10 ? (
                                <TrendingUp className="w-3 h-3 text-red-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Performance Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Optimization Tips</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
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