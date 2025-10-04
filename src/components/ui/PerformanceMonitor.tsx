import type { FC } from 'react'

interface PerformanceMonitorProps {
  className?: string
}

/**
 * Placeholder performance monitor. The full telemetry dashboard was retired
 * while we revisit the instrumentation strategy, so this returns nothing and
 * stays lint-clean until the feature comes back.
 */
export const PerformanceMonitor: FC<PerformanceMonitorProps> = () => null

export default PerformanceMonitor
