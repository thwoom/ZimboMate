import { motion } from 'framer-motion'
import { AlertTriangle, Bug, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import React from 'react'
import { logger } from '../../utils/logger'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from './Button'
import { Card, CardContent } from './Card'

interface ErrorInfo {
  error: Error
  errorInfo: React.ErrorInfo
  timestamp: Date
  userAgent: string
  url: string
  consoleWarnings: string[]
  consoleErrors: string[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

// Enhanced error logging
class ErrorLogger {
  private static errors: ErrorInfo[] = []
  private static consoleWarnings: string[] = []
  private static consoleErrors: string[] = []

  static logError(error: Error, errorInfo: React.ErrorInfo) {
    const errorData: ErrorInfo = {
      error,
      errorInfo,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      consoleWarnings: [...this.consoleWarnings],
      consoleErrors: [...this.consoleErrors],
    }

    this.errors.push(errorData)

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift()
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      logger.info('[ErrorBoundary] Caught error')
      logger.error('Error:', error)
      logger.error('Component Stack:', errorInfo.componentStack)
      logger.error('Error Info:', errorData)
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // sendToErrorService(errorData)
    }
  }

  static getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  static clearErrors() {
    this.errors = []
    this.consoleWarnings = []
    this.consoleErrors = []
  }

  static captureConsoleWarnings() {
    const originalWarn = logger.warn
    const originalError = logger.error

    logger.warn = (...args: unknown[]) => {
      const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')
      this.consoleWarnings.push(`[${new Date().toISOString()}] ${message}`)
      if (this.consoleWarnings.length > 20)
        this.consoleWarnings.shift()
      originalWarn(...args)
    }

    logger.error = (...args: unknown[]) => {
      const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ')
      this.consoleErrors.push(`[${new Date().toISOString()}] ${message}`)
      if (this.consoleErrors.length > 20)
        this.consoleErrors.shift()
      originalError(...args)
    }

    return () => {
      logger.warn = originalWarn
      logger.error = originalError
    }
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  errorId: string
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  errorId,
}) => {
  const [showDetails, setShowDetails] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [showConsole, setShowConsole] = React.useState(false)

  // Get the latest error info which includes console warnings
  const latestErrorInfo = React.useMemo(() => {
    const errors = ErrorLogger.getErrors()
    return errors[errors.length - 1]
  }, [error])

  const copyErrorDetails = async () => {
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    catch (err) {
      logger.error('Failed to copy error details:', err)
    }
  }

  const reportIssue = () => {
    const issueUrl = `https://github.com/your-repo/zimbomate-v2/issues/new?title=Error%20Report%20${errorId}&body=${encodeURIComponent(`
Error ID: ${errorId}
Message: ${error.message}
Stack: ${error.stack}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
    `)}`
    window.open(issueUrl, '_blank')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        <Card variant="magical">
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="w-16 h-16 mx-auto rounded-full bg-destructive/15 flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </motion.div>

              {/* Error Message */}
              <div>
                <h1 className="text-2xl font-display text-destructive mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground mb-4">
                  The magical energies seem to have gotten tangled. Don't worry,
                  your data is safe and we can get you back to adventuring!
                </p>
                <div className="text-sm text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                  Error ID:
                  {' '}
                  {errorId}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={resetErrorBoundary}
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="gap-2"
                >
                  <Bug size={16} />
                  {showDetails ? 'Hide' : 'Show'}
                  {' '}
                  Details
                </Button>

                <Button
                  variant="outline"
                  onClick={copyErrorDetails}
                  className="gap-2"
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy Error'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowConsole(!showConsole)}
                  className="gap-2"
                >
                  <Bug size={16} />
                  {showConsole ? 'Hide' : 'Show'}
                  {' '}
                  Console
                </Button>

                <Button
                  variant="outline"
                  onClick={reportIssue}
                  className="gap-2"
                >
                  <ExternalLink size={16} />
                  Report Issue
                </Button>
              </div>

              {/* Error Details */}
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 text-left"
                >
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Error Message:</h3>
                      <pre className="text-sm text-destructive whitespace-pre-wrap">
                        {error.message}
                      </pre>
                    </div>

                    <div>
                      <h3 className="font-medium text-foreground mb-2">Stack Trace:</h3>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Console Warnings & Errors */}
              {showConsole && latestErrorInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 text-left"
                >
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    {latestErrorInfo.consoleErrors.length > 0 && (
                      <div>
                        <h3 className="font-medium text-destructive mb-2">Console Errors:</h3>
                        <div className="bg-destructive/12 rounded p-3 max-h-40 overflow-auto">
                          {latestErrorInfo.consoleErrors.map((error, idx) => (
                            <pre key={idx} className="text-xs text-destructive whitespace-pre-wrap mb-1">
                              {error}
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}

                    {latestErrorInfo.consoleWarnings.length > 0 && (
                      <div>
                        <h3 className="font-medium text-chart-4 mb-2">Console Warnings:</h3>
                        <div className="bg-chart-4/12 rounded p-3 max-h-40 overflow-auto">
                          {latestErrorInfo.consoleWarnings.map((warning, idx) => (
                            <pre key={idx} className="text-xs text-chart-4 whitespace-pre-wrap mb-1">
                              {warning}
                            </pre>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!latestErrorInfo.consoleErrors.length && !latestErrorInfo.consoleWarnings.length) && (
                      <div className="text-sm text-muted-foreground">
                        No console warnings or errors captured before this error.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Recovery Suggestions */}
              <div className="text-left bg-primary/10 rounded-lg p-4">
                <h3 className="font-medium text-primary mb-2">Recovery Suggestions:</h3>
                <ul className="text-sm text-primary space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Check if you have the latest version</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• If the problem persists, please report the issue</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Main Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
}) => {
  const handleError = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Log error
    ErrorLogger.logError(error, errorInfo)

    // Call custom error handler if provided
    onError?.(error, errorInfo)

    // Store error ID for fallback component
    ;(error as any).errorId = errorId
  }, [onError])

  return (
    <ReactErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <FallbackComponent
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          errorId={(error as any).errorId || 'UNKNOWN'}
        />
      )}
      onError={handleError}
      onReset={() => {
        // Clear any error state
        ErrorLogger.clearErrors()
        // Optionally reload the page
        // window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Hook for accessing error boundary functionality
export function useErrorHandler() {
  const [errors, setErrors] = React.useState<ErrorInfo[]>([])

  React.useEffect(() => {
    const updateErrors = () => setErrors(ErrorLogger.getErrors())

    // Update errors periodically
    const interval = setInterval(updateErrors, 5000)
    updateErrors()

    return () => clearInterval(interval)
  }, [])

  return {
    errors,
    clearErrors: () => {
      ErrorLogger.clearErrors()
      setErrors([])
    },
    reportError: (error: Error, context?: string) => {
      const errorInfo: React.ErrorInfo = {
        componentStack: context || 'Manual error report',
      }
      ErrorLogger.logError(error, errorInfo)
      setErrors(ErrorLogger.getErrors())
    },
  }
}

// Async error boundary for handling promise rejections
export function setupGlobalErrorHandling() {
  const restoreConsole = ErrorLogger.captureConsoleWarnings()

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error
      ? event.reason
      : new Error(`Unhandled Promise Rejection: ${String(event.reason)}`)

    const errorInfo: React.ErrorInfo = {
      componentStack: 'Global Promise Rejection Handler',
    }
    ErrorLogger.logError(reason, errorInfo)

    // Prevent the default browser behavior
    event.preventDefault()
  }

  window.addEventListener('unhandledrejection', handleUnhandledRejection)

  const handleError = (event: ErrorEvent) => {
    const error = event.error instanceof Error
      ? event.error
      : new Error(`Global Error: ${event.message}`)

    const errorInfo: React.ErrorInfo = {
      componentStack: `File: ${event.filename}, Line: ${event.lineno}, Column: ${event.colno}`,
    }
    ErrorLogger.logError(error, errorInfo)
  }

  window.addEventListener('error', handleError)

  return () => {
    restoreConsole?.()
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('error', handleError)
  }
}

export default ErrorBoundary





