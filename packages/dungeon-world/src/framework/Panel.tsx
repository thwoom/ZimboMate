import React from 'react'

/**
 * Base interface for all panels in the application
 */
export interface PanelProps {
  /** Unique identifier for the panel */
  id: string
  /** Whether the panel is currently active / visible */
  isActive: boolean
  /** Panel-specific state that should be preserved */
  state?: unknown
  /** Callback when panel state changes */
  onStateChange?: (state: any) => void
  /** Panel state for BasePanel components */
  panelState?: unknown
}

/**
 * Metadata for panel registration
 */
export interface PanelMetadata {
  /** Unique identifier for the panel */
  id: string
  /** Display name for the panel */
  name: string
  /** Icon to display in navigation */
  icon: string
  /** Optional description */
  description?: string
  /** Loading priority (lower = higher priority) */
  priority?: number
  /** Whether to preload this panel */
  preload?: boolean
}

/**
 * Interface that all panels must implement
 */
export interface Panel {
  /** Panel metadata */
  metadata: PanelMetadata
  /** The React component for this panel */
  component: React.ComponentType <PanelProps>
  /** Called when panel is mounted */
  onMount?: () => void
  /** Called when panel is unmounted */
  onUnmount?: () => void
  /** Called when panel becomes active */
  onActivate?: () => void
  /** Called when panel becomes inactive */
  onDeactivate?: () => void
  /** Get initial state for the panel */
  getInitialState?: () => unknown
  /** Validate panel state */
  validateState?: (state: any) => boolean
}

/**
 * Base Panel Component with common functionality
 */
export abstract class BasePanel<T = unknown> extends React.Component <PanelProps & { panelState?: T }, T> {
  constructor(props: PanelProps & { panelState?: T }) {
    super(props)
    this.state = props.panelState || this.getInitialState()
  }

  abstract getInitialState(): T

  componentDidMount() {
    this.onPanelMount()
  }

  componentWillUnmount() {
    this.onPanelUnmount()
  }

  componentDidUpdate(prevProps: PanelProps) {
    if (!prevProps.isActive && this.props.isActive) {
      this.onPanelActivate()
    }
    else if (prevProps.isActive && !this.props.isActive) {
      this.onPanelDeactivate()
    }
  }

  /** Override in subclasses */
  protected onPanelMount(): void {}
  protected onPanelUnmount(): void {}
  protected onPanelActivate(): void {}
  protected onPanelDeactivate(): void {}

  /** Update panel state and notify parent */
  protected updatePanelState(state: Partial <T>) {
    this.setState(state as T, () => {
      if (this.props.onStateChange) {
        this.props.onStateChange(this.state)
      }
    })
  }
}

/**
 * HOC to wrap functional components as panels
 */
export function createPanel<T = unknown>(
  metadata: PanelMetadata,
  Component: React.FC <PanelProps & { panelState?: T }>,
  options?: {
    getInitialState?: () => T
    onMount?: () => void
    onUnmount?: () => void
    onActivate?: () => void
    onDeactivate?: () => void
  },
): Panel {
  return {
    metadata,
    component: Component,
    getInitialState: options?.getInitialState,
    onMount: options?.onMount,
    onUnmount: options?.onUnmount,
    onActivate: options?.onActivate,
    onDeactivate: options?.onDeactivate,
  }
}
