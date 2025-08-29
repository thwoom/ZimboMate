import React, { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import PanelErrorBoundary from './PanelErrorBoundary';

// Component that throws an error when triggered
const BuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error thrown by BuggyComponent!');
  }
  
  return <div>✅ Component is working fine!</div>;
};

// Component that throws an async error
const AsyncBuggyComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      // Simulate an async error (these won't be caught by error boundaries)
      setTimeout(() => {
        throw new Error('This is an async error - it won\'t be caught by error boundaries!');
      }, 100);
    }
  }, [shouldThrow]);
  
  return <div>🔄 Async component loaded</div>;
};

const ErrorBoundaryDemo: React.FC = () => {
  const [throwRenderError, setThrowRenderError] = useState(false);
  const [throwPanelError, setThrowPanelError] = useState(false);
  const [throwAsyncError, setThrowAsyncError] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Error Boundary Demo</h1>
      <p>This demo shows how error boundaries work in different scenarios.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>1. Application-Level Error Boundary</h2>
        <p>This error will be caught by the main app error boundary:</p>
        <button 
          onClick={() => setThrowRenderError(!throwRenderError)}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: throwRenderError ? '#e53e3e' : '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {throwRenderError ? 'Stop Error' : 'Throw Render Error'}
        </button>
        
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.log('Demo error boundary caught:', error.message);
          }}
        >
          <BuggyComponent shouldThrow={throwRenderError} />
        </ErrorBoundary>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>2. Panel-Level Error Boundary</h2>
        <p>This error will be caught by a panel-specific error boundary:</p>
        <button 
          onClick={() => setThrowPanelError(!throwPanelError)}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: throwPanelError ? '#e53e3e' : '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {throwPanelError ? 'Stop Panel Error' : 'Throw Panel Error'}
        </button>
        
        <PanelErrorBoundary
          panelName="Demo Panel"
          panelId="demo-panel"
          onError={(error, errorInfo, panelId) => {
            console.log(`Panel ${panelId} error:`, error.message);
          }}
        >
          <div style={{ 
            border: '1px solid #e2e8f0', 
            padding: '1rem', 
            borderRadius: '8px',
            backgroundColor: '#f7fafc'
          }}>
            <h3>Demo Panel Content</h3>
            <BuggyComponent shouldThrow={throwPanelError} />
          </div>
        </PanelErrorBoundary>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>3. Async Errors (Not Caught by Error Boundaries)</h2>
        <p>⚠️ These errors won't be caught by error boundaries - check the console:</p>
        <button 
          onClick={() => setThrowAsyncError(!throwAsyncError)}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            backgroundColor: throwAsyncError ? '#e53e3e' : '#ed8936',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {throwAsyncError ? 'Stop Async Error' : 'Throw Async Error'}
        </button>
        
        <ErrorBoundary>
          <AsyncBuggyComponent shouldThrow={throwAsyncError} />
        </ErrorBoundary>
      </div>

      <div style={{ 
        backgroundColor: '#e6fffa', 
        border: '1px solid #38b2ac', 
        padding: '1rem', 
        borderRadius: '8px' 
      }}>
        <h3>📝 Error Boundary Notes:</h3>
        <ul style={{ marginLeft: '1rem' }}>
          <li>Error boundaries catch errors during rendering, in lifecycle methods, and in constructors</li>
          <li>They do NOT catch errors in event handlers, async code, or errors thrown during server-side rendering</li>
          <li>For async errors, use try-catch blocks or global error handlers</li>
          <li>Error boundaries only catch errors in components below them in the tree</li>
          <li>In development, you'll see the error overlay first - click the X to see the error boundary</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
