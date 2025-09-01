import React, { Component, ErrorInfo, ReactNode } from 'react';
import { panelRecoveryManager } from '../utils/panelRecovery';

interface Props {
  children: ReactNode;
  panelName: string;
  panelId: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class PanelErrorBoundary extends Component < Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({ error, errorInfo });

    // Log to recovery manager
    try {
      panelRecoveryManager.captureException?.(error, `panel-${this.props.panelId}`);
    } catch (logError) {
      }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleRecover = async() => {
    try {
      await panelRecoveryManager.performRecovery({
        clearAllStates: false,
        resetRegistry: false,
        clearLocalStorage: false,
        enableDebugMode: true,
      });
      this.handleRetry();
    } catch (error) {
      }
  };

  handleFullRecovery = async() => {
    try {
      await panelRecoveryManager.performRecovery({
        clearAllStates: true,
        resetRegistry: true,
        clearLocalStorage: true,
        enableDebugMode: true,
      });
      panelRecoveryManager.forceReload();
    } catch (error) {
      }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="panel-error-boundary">
          <div className="panel-error-boundary__header">
            <div className="panel-error-boundary__icon">⚠️</div>
            <h3 > Panel Error: {this.props.panelName}</h3>
          </div>

          <div className="panel-error-boundary__content">
            <p > Something went wrong while loading this panel.</p>

            {this.state.error && (
              <details className="panel-error-boundary__details">
                <summary > Error Details</summary>
                <pre className="panel-error-boundary__error">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="panel-error-boundary__stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>

          <div className="panel-error-boundary__actions">
            <button
              onClick={this.handleRetry}
              className="panel-error-boundary__button panel-error-boundary__button--retry"
            >
              🔄 Retry
            </button>

            <button
              onClick={this.handleRecover}
              className="panel-error-boundary__button panel-error-boundary__button--recover"
            >
              🛠️ Recover Panel
            </button>

            <button
              onClick={this.handleFullRecovery}
              className="panel-error-boundary__button panel-error-boundary__button--full-recovery"
            >
              🔄 Full Recovery
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add styles for the error boundary
const styles = `
.panel-error-boundary {
  padding: 20px;
  border: 2px solid #ff4444;
  border-radius: 8px;
  background: #fff5f5;
  margin: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.panel-error-boundary__header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.panel-error-boundary__icon {
  font-size: 24px;
  margin-right: 10px;
}

.panel-error-boundary__header h3 {
  margin: 0;
  color: #d32f2f;
}

.panel-error-boundary__content {
  margin-bottom: 20px;
}

.panel-error-boundary__details {
  margin-top: 10px;
}

.panel-error-boundary__error,
.panel-error-boundary__stack {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin-top: 5px;
}

.panel-error-boundary__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.panel-error-boundary__button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.panel-error-boundary__button--retry {
  background: #2196f3;
  color: white;
}

.panel-error-boundary__button--retry:hover {
  background: #1976d2;
}

.panel-error-boundary__button--recover {
  background: #ff9800;
  color: white;
}

.panel-error-boundary__button--recover:hover {
  background: #f57c00;
}

.panel-error-boundary__button--full-recovery {
  background: #f44336;
  color: white;
}

.panel-error-boundary__button--full-recovery:hover {
  background: #d32f2f;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
