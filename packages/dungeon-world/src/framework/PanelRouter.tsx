import './PanelRouter.css';

import React, { Suspense, useCallback, useEffect, useRef,useState } from 'react';

import ErrorBoundary from '../components/ErrorBoundary';
import { panelRecoveryManager } from '../utils/panelRecovery';
import { performanceMonitor } from '../utils/PerformanceMonitor';
import { PanelProps } from './Panel';
import { panelRegistry } from './PanelRegistry';
import { panelStateManager } from './PanelState';

interface PanelRouterProps {
  /** Currently active panel ID */
  activePanelId: string;
  /** Callback when active panel changes */
  onPanelChange?: (panelId: string) => void;
  /** Loading component to show while panels load */
  loadingComponent?: React.ReactNode;
  /** Error component to show when panel fails to load */
  errorComponent?: React.ReactNode;
  /** Whether to enable panel transitions */
  enableTransitions?: boolean;
}

interface PanelStates {
  [panelId: string]: unknown;
}

// Performance optimization: Memoized loading component
const DefaultLoadingComponent = React.memo(() => (
  <div className="panel-loading">
    <div className="panel-loading__spinner" />
    <div className="panel-loading__text">Loading...</div>
  </div>
));

// Performance optimization: Memoized error component
const DefaultErrorComponent = React.memo(() => (
  <div className="panel-error">
    <div className="panel-error__icon">⚠️</div>
    <div className="panel-error__text">Failed to load panel</div>
    <button
      onClick={() => panelRecoveryManager.performRecovery()}
      style={{ marginTop: '10px', padding: '5px 10px' }}
    >
      🔄 Recover
    </button>
  </div>
));

/**
 * Component that handles panel routing and rendering with performance optimizations
 */
export const PanelRouter: React.FC < PanelRouterProps> = ({
  activePanelId,
  onPanelChange,
  loadingComponent = <DefaultLoadingComponent />,
  errorComponent = <DefaultErrorComponent />,
  enableTransitions = true,
}) => {
  const [panelStates, setPanelStates] = useState < PanelStates>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPanelId, setPreviousPanelId] = useState < string | null>(null);
  const [loadedPanels, setLoadedPanels] = useState < Set < string>>(new Set());
  const [panelErrors, setPanelErrors] = useState < Map < string, Error>>(new Map());

  // Use refs to track initialization and prevent infinite loops
  const initializedPanels = useRef < Set < string>>(new Set());
  const isInitializing = useRef < boolean>(false);
  const isProcessing = useRef < boolean>(false);
  const lastActivatedPanel = useRef < string | null>(null);

  // Performance optimization: Debounced state saving
  const debouncedSaveState = useCallback(
    debounce((...args: [string, any]) => {
      try {
        const [panelId, state] = args;
        panelStateManager.saveState(panelId, state);
      } catch {
        // Silent fail for state saving
      }
    }, 300),
    [],
  );

  // Load initial states from storage with error handling
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const loadedStates: PanelStates = {};
    const allPanels = panelRegistry.getAllPanels();

    if (process.env.NODE_ENV === 'development') {
      }

    for (const panel of allPanels) {
      try {
        const savedState = panelStateManager.loadState(panel.metadata.id);
        if (savedState) {
          loadedStates[panel.metadata.id] = savedState;
        } else if (panel.getInitialState) {
          loadedStates[panel.metadata.id] = panel.getInitialState();
        }
      } catch {
        // Clear corrupted state
        panelStateManager.clearState(panel.metadata.id);
        // Use initial state if available
        if (panel.getInitialState) {
          loadedStates[panel.metadata.id] = panel.getInitialState();
        }
      }
    }

    setPanelStates(loadedStates);
    isInitializing.current = false;
  }, []);

  // Handle panel state changes with debouncing and error handling
  const handlePanelStateChange = useCallback((panelId: string, state: any) => {
    try {
      setPanelStates(prev => ({
        ...prev,
        [panelId]: state,
      }));
      // Debounced save to localStorage for better performance
      debouncedSaveState(panelId, state);
    } catch {
      }
  }, [debouncedSaveState]);

  // Performance optimization: Preload adjacent panels-STABILIZED with useCallback
  const preloadAdjacentPanels = useCallback((currentPanelId: string) => {
    try {
      const allPanels = panelRegistry.getAllPanels();
      const currentIndex = allPanels.findIndex(p => p.metadata.id === currentPanelId);

      if (currentIndex !== -1) {
        const adjacentPanels = [
          allPanels[currentIndex-1]?.metadata.id,
          allPanels[currentIndex + 1]?.metadata.id,
        ].filter(Boolean) as string[];

        for (const panelId of adjacentPanels) {
          if (!loadedPanels.has(panelId)) {
            setLoadedPanels(prev => new Set(prev).add(panelId));
          }
        }
      }
    } catch {
      }
  }, [loadedPanels]);

  // Handle panel activation with performance optimizations and error handling
  useEffect(() => {
    // Prevent infinite loops by checking if we're already processing
    if (isProcessing.current) {
      return;
    }

    // Prevent duplicate activations for the same panel
    if (lastActivatedPanel.current === activePanelId) {
      return;
    }

    isProcessing.current = true;

    const panel = panelRegistry.getPanel(activePanelId);
    if (!panel) {
      setPanelErrors(prev => new Map(prev).set(activePanelId, new Error(`Panel not found: ${activePanelId}`)));
      isProcessing.current = false;
      return;
    }

    // Clear unknown previous errors for this panel
    setPanelErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(activePanelId);
      return newErrors;
    });

    try {
      // Start performance monitoring for panel switch
      const endPanelSwitch = performanceMonitor.startPanelSwitch();

      // Mark panel as loaded
      setLoadedPanels(prev => new Set(prev).add(activePanelId));

      // Handle transition with optimized timing
      if (enableTransitions && previousPanelId && previousPanelId !== activePanelId) {
        setIsTransitioning(true);
        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
          setTimeout(() => setIsTransitioning(false), 250); // Reduced from 300ms
        });
      }

      // Deactivate previous panel with error handling
      if (previousPanelId && previousPanelId !== activePanelId) {
        const prevPanel = panelRegistry.getPanel(previousPanelId);
        if (prevPanel?.onDeactivate) {
          try {
            prevPanel.onDeactivate();
          } catch {
            }
        }
      }

      // Activate new panel with error handling
      if (panel.onActivate) {
        try {
          panel.onActivate();
        } catch {
          }
      }

      // Initialize panel state if not exists and not already initialized
      if (!initializedPanels.current.has(activePanelId) && panel.getInitialState) {
        try {
          setPanelStates(prev => {
            if (!prev[activePanelId]) {
              initializedPanels.current.add(activePanelId);
              return {
                ...prev,
                [activePanelId]: panel.getInitialState!(),
              };
            }
            return prev;
          });
        } catch {
          }
      }

      setPreviousPanelId(activePanelId);
      lastActivatedPanel.current = activePanelId;

      // Preload adjacent panels for faster navigation
      preloadAdjacentPanels(activePanelId);

      // Notify parent
      if (onPanelChange) {
        onPanelChange(activePanelId);
      }

      // End performance monitoring
      endPanelSwitch();

      // Only log in development mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        }
    } catch (error) {
      setPanelErrors(prev => new Map(prev).set(activePanelId, error instanceof Error ? error : new Error(String(error))));
    } finally {
      // Always reset the processing flag
      isProcessing.current = false;
    }
  }, [activePanelId, onPanelChange, enableTransitions]); // Removed previousPanelId from dependencies to prevent loops

  // Get the active panel
  const activePanel = panelRegistry.getPanel(activePanelId);
  if (!activePanel) {
    return (
      <div className="panel-not-found">
        <div > Panel not found: {activePanelId}</div>
        <button
          onClick={() => panelRecoveryManager.performRecovery()}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          🔄 Recover Panels
        </button>
      </div>
    );
  }

  // Check if this panel has an error
  const panelError = panelErrors.get(activePanelId);
  if (panelError) {
    return (
      <div className="panel-error">
        <div className="panel-error__icon">⚠️</div>
        <div className="panel-error__text">Error loading panel: {panelError.message}</div>
        <button
          onClick={() => {
            setPanelErrors(prev => {
              const newErrors = new Map(prev);
              newErrors.delete(activePanelId);
              return newErrors;
            });
          }}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  const PanelComponent = activePanel.component;
  const panelProps: PanelProps = {
    id: activePanelId,
    isActive: true,
    state: panelStates[activePanelId],
    onStateChange: (state) => handlePanelStateChange(activePanelId, state),
  };

  return (
    <div
      className={`panel-router ${isTransitioning ? 'panel-router--transitioning' : ''}`}
    >
      <ErrorBoundary
        fallback={errorComponent}
        onError={(error: Error, errorInfo: React.ErrorInfo) => {
          setPanelErrors(prev => new Map(prev).set(activePanelId, error));
        }}
      >
        <Suspense fallback={loadingComponent}>
          <div className="panel-container">
            <PanelComponent {...panelProps} panelState={panelStates[activePanelId]} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Debounce utility for performance optimization
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}



