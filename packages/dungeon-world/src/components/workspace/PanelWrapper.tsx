import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'

export interface PanelWrapperProps {
  panelId: string
  isActive: boolean
  className?: string
  children: React.ReactNode
}

function PanelErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="p-6 border-danger">
      <div className="text-center space-y-4">
        <div className="text-danger text-lg font-semibold">
          Panel Error
        </div>
        <div className="text-text-secondary text-sm">
          {error.message}
        </div>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-danger text-text-inverse rounded-md text-sm hover:bg-danger-hover transition-colors"
        >
          Try Again
        </button>
      </div>
    </Card>
  )
}

function PanelLoadingFallback() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-surface rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-surface rounded"></div>
          <div className="h-4 bg-surface rounded w-5/6"></div>
          <div className="h-4 bg-surface rounded w-4/6"></div>
        </div>
      </div>
    </Card>
  )
}

export function PanelWrapper({
  panelId,
  isActive,
  className,
  children
}: PanelWrapperProps) {
  return (
    <div
      className={cn(
        "panel-wrapper transition-all duration-300",
        !isActive && "opacity-50 pointer-events-none",
        className
      )}
      data-panel-id={panelId}
      data-panel-active={isActive}
    >
      <ErrorBoundary
        FallbackComponent={PanelErrorFallback}
        onReset={() => {
          // Optionally reload the panel or reset its state
          console.log(`Resetting panel: ${panelId}`)
        }}
      >
        <Suspense fallback={<PanelLoadingFallback />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}