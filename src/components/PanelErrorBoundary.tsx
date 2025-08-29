import React, { Component, ErrorInfo, ReactNode } from 'react';
import './PanelErrorBoundary.css';

interface Props {
  children: ReactNode;
  panelName: string;
  panelId: string;
  onError?: (error: Error, errorInfo: ErrorInfo, panelId: string) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Panel Error in ${this.props.panelName}:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.props.panelId);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default panel error UI
      return (
        <div className="panel-error-boundary">
          <div className="panel-error-boundary__content">
            <div className="panel-error-boundary__icon">⚠️</div>
            <h3 className="panel-error-boundary__title">
              {this.props.panelName} Error
            </h3>
            <p className="panel-error-boundary__message">
              This panel encountered an error and couldn't load properly.
            </p>
            <button 
              className="panel-error-boundary__retry"
              onClick={this.handleRetry}
            >
              Retry Panel
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="panel-error-boundary__details">
                <summary>Error Details (Dev)</summary>
                <pre className="panel-error-boundary__error">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PanelErrorBoundary;
