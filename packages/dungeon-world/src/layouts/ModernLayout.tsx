import React, { useState } from 'react'
import { cn } from '../lib/utils'
import { ContextSwitcher, useContext, contextConfigs } from '../components/ContextSwitcher'
import { Tile } from '../components/ui/Tile'

interface ModernLayoutProps {
  children: React.ReactNode
  inspectorContent?: React.ReactNode
}

export function ModernLayout({ children, inspectorContent }: ModernLayoutProps) {
  const { activeContext, setContext } = useContext()
  const [inspectorOpen, setInspectorOpen] = useState(true)
  
  const config = contextConfigs[activeContext]
  const showInspector = config.inspectorVisible && inspectorOpen

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 glass-subtle">
        <div className="flex h-header items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-text-primary">
              Dungeon World
            </h1>
            <div className="hidden md:block">
              <ContextSwitcher
                activeContext={activeContext}
                onContextChange={setContext}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {config.inspectorVisible && (
              <button
                onClick={() => setInspectorOpen(!inspectorOpen)}
                className="p-2 rounded-md hover:bg-surface-hover transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                title="Toggle Inspector"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile context switcher */}
        <div className="md:hidden px-6 pb-3">
          <ContextSwitcher
            activeContext={activeContext}
            onContextChange={setContext}
          />
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Content grid */}
        <main 
          className={cn(
            'flex-1 p-6 transition-all duration-300',
            showInspector && 'mr-inspector'
          )}
        >
          <div className="grid grid-cols-12 gap-4 auto-rows-[4rem]">
            {children}
          </div>
        </main>

        {/* Inspector pane */}
        {showInspector && (
          <aside className="fixed right-0 top-header bottom-0 w-inspector border-l border-border/50 glass-subtle overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Inspector
              </h2>
              {inspectorContent || (
                <div className="text-text-secondary text-sm">
                  Select an item to view details
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}