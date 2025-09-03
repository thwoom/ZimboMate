# Error Boundary System

This comprehensive error boundary system provides robust error handling for the ZimboMate React application, based on the [React Error Boundary documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

## Components

### 1. `ErrorBoundary` - Main Application Error Boundary

The primary error boundary that wraps the entire application.

**Features:**

- Catches and displays rendering errors with a user-friendly interface
- Provides retry functionality
- Supports custom fallback UI
- Automatic reset on prop changes
- Development-mode error details
- Error logging and reporting
- Mobile-responsive design
- Dark mode support

**Usage:**

````tsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('App error:', error);
  }}
  resetKeys={[someStateValue]} // Reset when this changes
  resetOnPropsChange={true}    // Reset on any prop change
>
  <App />
</ErrorBoundary>
```text

### 2. `PanelErrorBoundary` - Panel-Specific Error Boundary

A lightweight error boundary designed for individual panels and components.

**Features:**
- Compact error UI suitable for panels
- Panel-specific error reporting
- Quick retry functionality
- Development error details

**Usage:**
```tsx
import PanelErrorBoundary from './components/PanelErrorBoundary';

<PanelErrorBoundary
  panelName="Equipment Panel"
  panelId="equipment"
  onError={(error, errorInfo, panelId) => {
    console.error(`Panel ${panelId} error:`, error);
  }}
>
  <YourPanelComponent />
</PanelErrorBoundary>
```text

### 3. `GlobalErrorHandler` - Catches Non-Boundary Errors

Handles errors that React Error Boundaries cannot catch:
- Unhandled Promise rejections
- Async errors
- Resource loading errors
- Event handler errors

**Features:**
- Global error queue management
- Automatic error reporting
- Session and user tracking
- Development logging
- Production error service integration

**Usage:**
```tsx
import { useErrorHandler, captureException, captureMessage } from '../utils/globalErrorHandler';

// In a component
const { captureException, captureMessage } = useErrorHandler();

// In async functions
try {
  await someAsyncOperation();
} catch (error) {
  captureException(error, 'async-operation-failed');
}

// For custom messages
captureMessage('User performed important action', 'info', 'user-action');
```text

## Error Types Handled

### ✅ Caught by Error Boundaries
- Rendering errors
- Lifecycle method errors
- Constructor errors
- Component tree errors

### ❌ NOT Caught by Error Boundaries (Use GlobalErrorHandler)
- Event handler errors
- Async/Promise errors
- setTimeout/setInterval errors
- Resource loading errors

## Implementation Guide

### 1. Application Level Setup

The main App component is wrapped with the primary ErrorBoundary:

```tsx
// App.tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send to analytics/error service
        analytics.track('app_error', { error: error.message });
      }}
      resetKeys={[currentUser, appVersion]}
    >
      <GameStoreProvider>
        {/* Your app content */}
      </GameStoreProvider>
    </ErrorBoundary>
  );
}
```text

### 2. Panel Level Setup

Wrap individual panels for granular error handling:

```tsx
// In your panel components
import PanelErrorBoundary from '../components/PanelErrorBoundary';

export const MyPanel = () => (
  <PanelErrorBoundary panelName="My Panel" panelId="my-panel">
    <div className="panel-content">
      {/* Panel content that might error */}
    </div>
  </PanelErrorBoundary>
);
```text

### 3. Global Error Handler Setup

Automatically initialized in `main.tsx`:

```tsx
// main.tsx
import './utils/globalErrorHandler'; // Auto-initializes

// Use in components for manual error handling
import { useErrorHandler } from './utils/globalErrorHandler';

const MyComponent = () => {
  const { captureException } = useErrorHandler();

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      captureException(error, 'risky-operation');
    }
  };
};
```text

## Error Reporting Integration

### Development
- Errors logged to console with full details
- Component stack traces shown
- Error boundaries display detailed error info

### Production Setup

Replace the placeholder error reporting in `GlobalErrorHandler`:

```tsx
// In globalErrorHandler.ts
private reportError(errorEntry) {
  // Replace with your error service

  // Sentry example:
  Sentry.captureException(errorEntry.error, {
    extra: errorReport,
    tags: { context: errorEntry.context }
  });

  // Bugsnag example:
  Bugsnag.notify(errorEntry.error, {
    context: errorEntry.context,
    metadata: { errorReport }
  });

  // LogRocket example:
  LogRocket.captureException(errorEntry.error);
}
```text

## Testing Error Boundaries

Use the `ErrorBoundaryDemo` component to test error boundary functionality:

```tsx
import ErrorBoundaryDemo from './components/ErrorBoundaryDemo';

// Add to your development routes
<Route path="/error-demo" component={ErrorBoundaryDemo} />
```text

## Best Practices

### 1. Error Boundary Placement
- Place at application root for global errors
- Place around major features/panels
- Don't overuse - too many can make debugging harder

### 2. Error Handling Strategy
```tsx
// Good: Specific error boundaries for different concerns
<ErrorBoundary> {/* App level */}
  <Header />
  <PanelErrorBoundary panelId="main"> {/* Feature level */}
    <MainPanel />
  </PanelErrorBoundary>
  <Footer />
</ErrorBoundary>

// Avoid: Too many nested boundaries
<ErrorBoundary>
  <ErrorBoundary>
    <ErrorBoundary>
      <Component /> {/* Hard to debug */}
    </ErrorBoundary>
  </ErrorBoundary>
</ErrorBoundary>
```text

### 3. Error Recovery
- Provide meaningful retry mechanisms
- Reset error boundaries on relevant state changes
- Guide users on how to recover

### 4. Error Reporting
- Include sufficient context for debugging
- Respect user privacy in error reports
- Implement rate limiting for error reports

## Monitoring and Alerts

Set up monitoring for:
- Error boundary activation rates
- Specific error patterns
- User impact metrics
- Recovery success rates

## Browser Support

- Modern browsers with Error Boundary support
- Graceful degradation for older browsers
- Console fallback for unsupported environments

## Related Resources

- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React 16+](https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html)
- [Production Error Tracking Services](https://sentry.io/for/react/)
````
