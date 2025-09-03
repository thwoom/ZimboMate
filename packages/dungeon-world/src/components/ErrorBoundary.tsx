import type { ErrorInfo, ReactNode } from 'react'
import React, { Component } from 'react'

import './ErrorBoundary.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array <string | number>
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
  copied: boolean
  showAdvancedDetails: boolean
  copyFormat: 'cursor-ai' | 'technical' | 'github'
  showCopyDropdown: boolean
  errorHistory: Array<{
    error: Error
    timestamp: number
    eventId: string
    userActions?: string[]
  }>
}

class ErrorBoundary extends Component <Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      copied: false,
      showAdvancedDetails: false,
      copyFormat: 'cursor-ai',
      showCopyDropdown: false,
      errorHistory: [],
    }
  }

  static getDerivedStateFromError(error: Error): Partial <State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    const eventId = this.state.eventId || `error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

    // Add to error history
    const errorEntry = {
      error,
      timestamp: Date.now(),
      eventId,
      userActions: this.getUserActionHistory(),
    }

    this.setState(prevState => ({
      error,
      errorInfo,
      eventId,
      errorHistory: [...prevState.errorHistory, errorEntry].slice(-5), // Keep last 5 errors
    }))

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In a real app, you might want to log this to an error reporting service
    this.logErrorToService(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((resetKey, idx) =>
        prevProps.resetKeys?.[idx] !== resetKey,
      )

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }

    // Reset error boundary when unknown props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      copied: false,
      showAdvancedDetails: false,
      showCopyDropdown: false,
      // Keep errorHistory for debugging
    })
  }

  handleRetry = () => {
    this.resetErrorBoundary()
  }

  handleReload = () => {
    window.location.reload()
  }

  copyErrorToClipboard = async (format?: 'cursor-ai' | 'technical' | 'github') => {
    const selectedFormat = format || this.state.copyFormat
    let content: string

    switch (selectedFormat) {
      case 'cursor-ai':
        content = this.generateCursorAIPrompt()
        break
      case 'github':
        content = this.generateGitHubIssueBody()
        break
      case 'technical':
      default:
        content = this.generateErrorReport()
        break
    }

    try {
      await navigator.clipboard.writeText(content)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    }
    catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    }
  }

  generateGitHubIssueBody = (): string => {
    const { error, errorInfo, eventId } = this.state
    const userActions = this.getUserActionHistory()

    return `## 🐛 Bug Report

### Error Information
- **Type:** ${error?.name || 'Unknown'}
- **Message:** ${error?.message || 'No message available'}
- **Event ID:** ${eventId}
- **URL:** ${window.location.href}

### Steps to Reproduce
${userActions.length > 0 ? userActions.map((action, index) => `${index + 1}. ${action || 'No action'}`).join('\n') : '1. [Please describe the steps to reproduce]'}

### Expected Behavior
[Describe what you expected to happen]

### Actual Behavior
Error occurred: ${error?.message || 'Unknown error'}

### Stack Trace
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

### Component Stack
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

### Environment
- **Browser:** ${navigator.userAgent}
- **Platform:** ${navigator.platform}
- **Timestamp:** ${new Date().toISOString()}

### Additional Context
[Add unknown other context about the problem here]`
  }

  generateErrorReport = (): string => {
    const { error, errorInfo, eventId } = this.state
    const timestamp = new Date().toISOString()

    return `# Error Report-ZimboMate

## Event Details
- **Event ID:** ${eventId}
- **Timestamp:** ${timestamp}
- **URL:** ${window.location.href}
- **User Agent:** ${navigator.userAgent}

## Error Information
- **Message:** ${error?.message || 'Unknown error'}
- **Type:** ${error?.name || 'Error'}

## Stack Trace
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

## Component Stack
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

## Recent User Actions
${this.getUserActionHistory().map(action => `- ${action || 'No action'}`).join('\n')}

## Browser Information
- **Platform:** ${navigator.platform}
- **Language:** ${navigator.language}
- **Cookies Enabled:** ${navigator.cookieEnabled}
- **Online:** ${navigator.onLine}

---
*Generated by ZimboMate Error Boundary*`
  }

  generateCursorAIPrompt = (): string => {
    const { error, errorInfo } = this.state
    const userActions = this.getUserActionHistory()
    const suggestions = this.getErrorSuggestions()

    return `I'm getting a React error in my ZimboMate application and need help debugging it. Here are the details:

## 🚨 Error Details
**Error Type:** ${error?.name || 'Unknown'}
**Error Message:** ${error?.message || 'No message available'}
**Location:** ${window.location.pathname}

## 📋 Stack Trace
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

## 🔧 Component Stack
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

## 👤 What I Was Doing (Recent Actions)
${userActions.length > 0 ? userActions.map(action => `- ${action || 'No action'}`).join('\n') : '- No recent actions recorded'}

## 🤔 What I Think Might Be Wrong
${suggestions.length > 0 ? suggestions.map(suggestion => `- ${suggestion || 'No suggestion'}`).join('\n') : '- Not sure what\'s causing this'}

## 🛠️ My Setup
- **Framework:** React with TypeScript
- **Project:** ZimboMate (RPG character management app)
- **Browser:** ${navigator.userAgent.split(' ')[0]}
- **Current Page:** ${window.location.pathname}

## ❓ What I Need Help With
Please help me:
1. Understand what's causing this error
2. Fix the underlying issue
3. Prevent similar errors in the future
4. Improve error handling if needed

Can you analyze this error and provide a solution? If you need to see specific files or more context, just let me know what to share.`
  }

  getUserActionHistory = (): string[] => {
    // Get recent user actions from localStorage or a tracking service
    const actions = JSON.parse(localStorage.getItem('userActions') || '[]')
    return actions.slice(-10) // Last 10 actions
  }

  createGitHubIssue = () => {
    const errorReport = this.generateErrorReport()
    const title = encodeURIComponent(`Bug: ${this.state.error?.message || 'Unhandled Error'}`)
    const body = encodeURIComponent(`## Bug Report\n\n${errorReport}\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n\n## Actual Behavior\n\n`)

    const githubUrl = `https://github.com / YOUR_USERNAME / ZimboMate / issues / new?title=${title}&body=${body}&labels = bug,error-boundary`
    window.open(githubUrl, 'blank')
  }

  toggleAdvancedDetails = () => {
    this.setState(prevState => ({
      showAdvancedDetails: !prevState.showAdvancedDetails,
    }))
  }

  searchStackOverflow = () => {
    const query = encodeURIComponent(`${this.state.error?.name || 'React Error'} ${this.state.error?.message || ''}`)
    const url = `https://stackoverflow.com / search?q=${query}`
    window.open(url, 'blank')
  }

  getErrorSuggestions = (): string[] => {
    const error = this.state.error
    if (!error)
      return []

    const suggestions: string[] = []

    if (error.message.includes('Cannot read property')) {
      suggestions.push('Check for null / undefined values before accessing properties')
      suggestions.push('Use optional chaining (?.) operator')
      suggestions.push('Add proper null checks or default values')
    }

    if (error.message.includes('is not a function')) {
      suggestions.push('Verify the function exists and is properly imported')
      suggestions.push('Check if the variable is actually a function')
      suggestions.push('Ensure proper binding of class methods')
    }

    if (error.message.includes('Maximum update depth exceeded')) {
      suggestions.push('Check for infinite re-renders in useEffect or setState')
      suggestions.push('Add proper dependencies to useEffect')
      suggestions.push('Avoid calling setState in render methods')
    }

    if (error.stack?.includes('hooks')) {
      suggestions.push('Ensure hooks are called at the top level of components')
      suggestions.push('Don\'t call hooks inside loops, conditions, or nested functions')
      suggestions.push('Check React hooks rules')
    }

    return suggestions
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a production app, you would send this to your error tracking service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    }

    // For now, just log to console
    console.group('🚨 Error Report')
    console.groupEnd()

    // TODO: Replace with actual error service
    // errorTrackingService.captureException(error, { extra: errorReport });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              ⚠️
            </div>

            <h1 className="error-boundary__title">
              Oops ! Something went wrong
            </h1>

            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. The error has been logged
              and we'll look into it.
            </p>

            <div className="error-boundary__actions">
              <button
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleRetry}
              >
                🔄 Try Again
              </button>

              <button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReload}
              >
                🔃 Reload Page
              </button>

              <div className="error-boundary__copy-group">
                <button
                  className={`error-boundary__button error-boundary__button--copy ${this.state.copied ? 'copied' : ''}`}
                  onClick={() => this.copyErrorToClipboard()}
                  title={`Copy error for ${this.state.copyFormat === 'cursor-ai' ? 'Cursor AI' : this.state.copyFormat}`}
                >
                  {this.state.copied ? '✅ Copied!' : `📋 Copy for ${this.state.copyFormat === 'cursor-ai' ? 'AI' : this.state.copyFormat}`}
                </button>

                <button
                  className="error-boundary__copy-dropdown-toggle"
                  onClick={() => this.setState(prev => ({ showCopyDropdown: !prev.showCopyDropdown }))}
                  title="Choose copy format"
                >
                  ▼
                </button>

                {this.state.showCopyDropdown && (
                  <div className="error-boundary__copy-dropdown">
                    <button
                      className={`copy-option ${this.state.copyFormat === 'cursor-ai' ? 'active' : ''}`}
                      onClick={() => {
                        this.setState({ copyFormat: 'cursor-ai', showCopyDropdown: false })
                        this.copyErrorToClipboard('cursor-ai')
                      }}
                    >
                      🤖 Cursor AI Prompt
                      {' '}
                      <span className="copy-option-desc">Perfect for pasting into AI assistants</span>
                    </button>

                    <button
                      className={`copy-option ${this.state.copyFormat === 'github' ? 'active' : ''}`}
                      onClick={() => {
                        this.setState({ copyFormat: 'github', showCopyDropdown: false })
                        this.copyErrorToClipboard('github')
                      }}
                    >
                      🐛 GitHub Issue
                      {' '}
                      <span className="copy-option-desc">Formatted for bug reports</span>
                    </button>

                    <button
                      className={`copy-option ${this.state.copyFormat === 'technical' ? 'active' : ''}`}
                      onClick={() => {
                        this.setState({ copyFormat: 'technical', showCopyDropdown: false })
                        this.copyErrorToClipboard('technical')
                      }}
                    >
                      🔧 Technical Report
                      {' '}
                      <span className="copy-option-desc">Detailed technical information</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="error-boundary__quick-actions">
              <button
                className="error-boundary__quick-action"
                onClick={this.createGitHubIssue}
                title="Create GitHub issue"
              >
                🐛 Report Bug
              </button>

              <button
                className="error-boundary__quick-action"
                onClick={this.searchStackOverflow}
                title="Search Stack Overflow"
              >
                🔍 Search Help
              </button>

              <button
                className="error-boundary__quick-action"
                onClick={this.toggleAdvancedDetails}
                title="Toggle advanced debugging info"
              >
                🔧
                {' '}
                {this.state.showAdvancedDetails ? 'Hide' : 'Show'}
                {' '}
                Debug
              </button>
            </div>

            {/* Error Suggestions */}
            {this.getErrorSuggestions().length > 0 && (
              <div className="error-boundary__suggestions">
                <h3>💡 Possible Solutions:</h3>
                <ul>
                  {this.getErrorSuggestions().map((suggestion, index) => (
                    <li key={index}>{suggestion || 'No suggestion'}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Advanced debugging info */}
            {this.state.showAdvancedDetails && (
              <div className="error-boundary__advanced">
                <div className="error-boundary__debug-tabs">
                  <div className="error-boundary__tab-content">
                    <div className="error-boundary__error-section">
                      <h3>🔍 Error Analysis:</h3>
                      <div className="error-boundary__analysis">
                        <div className="analysis-item">
                          <strong> Error Type:</strong>
                          {' '}
                          {this.state.error?.name || 'Unknown'}
                        </div>
                        <div className="analysis-item">
                          <strong> Severity:</strong>
                          <span className={`severity ${this.state.error?.stack?.includes('TypeError') ? 'high' : 'medium'}`}>
                            {this.state.error?.stack?.includes('TypeError') ? 'High' : 'Medium'}
                          </span>
                        </div>
                        <div className="analysis-item">
                          <strong> Likely Cause:</strong>
                          {this.state.error?.message.includes('Cannot read property')
                            ? 'Null / Undefined Access'
                            : this.state.error?.message.includes('is not a function')
                              ? 'Function Call Error'
                              : 'Runtime Error'}
                        </div>
                      </div>
                    </div>

                    <div className="error-boundary__error-section">
                      <h3>📊 Error Context:</h3>
                      <div className="error-boundary__context-grid">
                        <div className="context-item">
                          <strong> Timestamp:</strong>
                          {' '}
                          {new Date().toLocaleString()}
                        </div>
                        <div className="context-item">
                          <strong> Page:</strong>
                          {' '}
                          {window.location.pathname}
                        </div>
                        <div className="context-item">
                          <strong> User Agent:</strong>
                          {' '}
                          {navigator.userAgent.split(' ')[0]}
                        </div>
                        <div className="context-item">
                          <strong> Viewport:</strong>
                          {' '}
                          {window.innerWidth}
                          x
                          {window.innerHeight}
                        </div>
                      </div>
                    </div>

                    {this.state.errorHistory.length > 0 && (
                      <div className="error-boundary__error-section">
                        <h3>📈 Error History:</h3>
                        <div className="error-boundary__history">
                          {this.state.errorHistory.map((entry, index) => (
                            <div key={entry.eventId} className="history-item">
                              <div className="history-header">
                                <span className="history-index">
                                  #
                                  {index + 1}
                                </span>
                                <span className="history-time">
                                  {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="history-message">{entry.error.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Development-only error details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  🛠️ Raw Error Details (Development Only)
                </summary>

                <div className="error-boundary__error-info">
                  <div className="error-boundary__error-section">
                    <h3> Error Message:</h3>
                    <pre className="error-boundary__code">
                      {this.state.error?.message}
                    </pre>
                  </div>

                  <div className="error-boundary__error-section">
                    <h3> Stack Trace:</h3>
                    <pre className="error-boundary__code">
                      {this.state.error?.stack}
                    </pre>
                  </div>

                  {this.state.errorInfo && (
                    <div className="error-boundary__error-section">
                      <h3> Component Stack:</h3>
                      <pre className="error-boundary__code">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="error-boundary__error-section">
                    <h3> Event ID:</h3>
                    <code className="error-boundary__event-id">
                      {this.state.eventId}
                    </code>
                  </div>

                  <div className="error-boundary__error-section">
                    <h3> Full Error Report:</h3>
                    <textarea
                      className="error-boundary__report-text"
                      value={this.generateErrorReport()}
                      readOnly
                      rows={10}
                    />
                  </div>
                </div>
              </details>
            )}

            <div className="error-boundary__footer">
              <p className="error-boundary__footer-text">
                If this problem persists, please contact support with Event ID:
                <code className="error-boundary__event-id">
                  {this.state.eventId}
                </code>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook version for functional components (React 16.8+)
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // In a real app, you would report this to your error service
    // errorTrackingService.captureException(error, { extra: errorInfo });

    // You could also trigger a state update to show an error message
    throw error // Re-throw to trigger error boundary
  }
}

// Higher-order component version
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType <P>,
  errorBoundaryProps?: Omit <Props, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
