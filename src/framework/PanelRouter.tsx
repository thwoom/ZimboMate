import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { PanelProps } from './Panel';
import { panelRegistry } from './PanelRegistry';
import { panelStateManager } from './PanelState';
import { PanelLoader } from '../components/PanelLoader';
import './PanelRouter.css';

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
  [panelId: string]: any;
}

/**
 * Component that handles panel routing and rendering
 */
export const PanelRouter: React.FC<PanelRouterProps> = ({
  activePanelId,
  onPanelChange,
  loadingComponent,
  errorComponent = <div className="panel-error">Failed to load panel</div>,
  enableTransitions = true,
}) => {
  const [panelStates, setPanelStates] = useState<PanelStates>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousPanelId, setPreviousPanelId] = useState<string | null>(null);

  // Load initial states from storage
  useEffect(() => {
    const loadedStates: PanelStates = {};
    
    // Handle regular panels
    panelRegistry.getAllPanels().forEach(panel => {
      const savedState = panelStateManager.loadState(panel.metadata.id);
      if (savedState) {
        loadedStates[panel.metadata.id] = savedState;
      } else if (panel.getInitialState) {
        loadedStates[panel.metadata.id] = panel.getInitialState();
      }
    });
    
    // Lazy panels don't have initial state until loaded
    setPanelStates(loadedStates);
  }, []);

  // Handle panel state changes
  const handlePanelStateChange = useCallback((panelId: string, state: any) => {
    setPanelStates(prev => ({
      ...prev,
      [panelId]: state,
    }));
    // Save to localStorage
    panelStateManager.saveState(panelId, state);
  }, []);

  // Handle panel activation
  useEffect(() => {
    const panel = panelRegistry.getPanel(activePanelId) || panelRegistry.getLazyPanel(activePanelId);
    if (panel) {
      // Handle transition
      if (enableTransitions && previousPanelId && previousPanelId !== activePanelId) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 300); // Match CSS transition duration
      }

      // Deactivate previous panel
      if (previousPanelId && previousPanelId !== activePanelId) {
        const prevPanel = panelRegistry.getPanel(previousPanelId);
        if (prevPanel?.onDeactivate) {
          prevPanel.onDeactivate();
        }
      }

      // Activate new panel (only for regular panels)
      if ('onActivate' in panel && panel.onActivate) {
        panel.onActivate();
      }

      // Initialize panel state if not exists (only for regular panels)
      if (!panelStates[activePanelId] && 'getInitialState' in panel && panel.getInitialState) {
        setPanelStates(prev => ({
          ...prev,
          [activePanelId]: panel.getInitialState!(),
        }));
      }

      setPreviousPanelId(activePanelId);

      // Notify parent
      if (onPanelChange) {
        onPanelChange(activePanelId);
      }
    }
  }, [activePanelId, previousPanelId, panelStates, onPanelChange, enableTransitions]);

  // Get the active panel (regular or lazy)
  const activePanel = panelRegistry.getPanel(activePanelId);
  const lazyPanel = panelRegistry.getLazyPanel(activePanelId);
  
  if (!activePanel && !lazyPanel) {
    return <div className="panel-not-found">Panel not found: {activePanelId}</div>;
  }

  const PanelComponent = activePanel ? activePanel.component : lazyPanel!.component;
  const panelMetadata = activePanel ? activePanel.metadata : lazyPanel!.metadata;
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
      <ErrorBoundary fallback={errorComponent}>
        <Suspense fallback={loadingComponent || <PanelLoader panelName={panelMetadata.name} />}>
          <div className="panel-container">
            <PanelComponent {...panelProps} panelState={panelStates[activePanelId]} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Error boundary for panel rendering
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Panel error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return this.props.children;
  }
}
