import React, { lazy } from 'react';
import { Panel, PanelMetadata } from './Panel';
import { panelRegistry } from './PanelRegistry';

/**
 * Configuration for lazy loading a panel
 */
export interface LazyPanelConfig {
  metadata: PanelMetadata;
  loader: () => Promise<{ default: Panel }>;
  fallback?: React.ReactNode;
}

/**
 * Create a lazily loaded panel
 */
export function createLazyPanel(config: LazyPanelConfig): Panel {
  // Create a lazy component wrapper
  const LazyComponent = lazy(async() => {
    const module = await config.loader();
    const panel = module.default;

    // Return a module with default export that is the component
    return {
      default: panel.component,
    };
  });

  // Create the panel object with lazy-loaded component
  const lazyPanel: Panel = {
    metadata: config.metadata,
    component: (props) => (
      <React.Suspense fallback={config.fallback || <div > Loading panel...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    ),
    // Lazy load the actual panel methods
    onMount: async() => {
      const module = await config.loader();
      const panel = module.default;
      if (panel.onMount) {
        panel.onMount();
      }
    },
    onUnmount: async() => {
      const module = await config.loader();
      const panel = module.default;
      if (panel.onUnmount) {
        panel.onUnmount();
      }
    },
    onActivate: async() => {
      const module = await config.loader();
      const panel = module.default;
      if (panel.onActivate) {
        panel.onActivate();
      }
    },
    onDeactivate: async() => {
      const module = await config.loader();
      const panel = module.default;
      if (panel.onDeactivate) {
        panel.onDeactivate();
      }
    },
    getInitialState: async() => {
      const module = await config.loader();
      const panel = module.default;
      return panel.getInitialState ? panel.getInitialState() : undefined;
    },
  };

  return lazyPanel;
}

/**
 * Preload a panel to improve performance
 */
export async function preloadPanel(panelId: string): Promise < void> {
  const panel = panelRegistry.getPanel(panelId);
  if (!panel) {
    return;
  }

  // If it's a lazy panel, trigger the loader
  if (panel.component) {
    // Try to render the component to trigger lazy loading
    try {
      const TestComponent = panel.component;
      // This will trigger the lazy import
      await new Promise((resolve) => {
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

        // Render and immediately unmount to trigger loading
        import('react-dom/client').then(({ createRoot }) => {
                                          const root = createRoot(container);
                                          root.render(
                                            <TestComponent
                                              id={panelId}
                                              isActive={false}
                                            />,
                                          );

                                          setTimeout(() => {
                                            root.unmount();
                                            document.body.removeChild(container);
                                            resolve(undefined);
                                          }, 0);
                                        }).catch($ERROR => {
          }).catch($ERROR => {
          }).catch($ERROR => {
          }).catch($ERROR => {
          });
      });
    } catch (error) {
      }
  }
}

/**
 * Preload multiple panels
 */
export async function preloadPanels(panelIds: string[]): Promise < void> {
  await Promise.all(panelIds.map(preloadPanel));
}

/**
 * Auto-preload panels marked with preload flag
 */
export async function autoPreloadPanels(): Promise < void> {
  const panels = panelRegistry.getAllPanels();
  const panelsToPreload = panels
    .filter(panel => panel.metadata.preload)
    .map(panel => panel.metadata.id);

  if (panelsToPreload.length > 0) {
    await preloadPanels(panelsToPreload);
  }
}
