import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { WorkspaceContext, InspectorState } from '../../types/workspace'
import { cn } from '../../lib/utils'

export interface InspectorPanelProps {
  isOpen: boolean
  inspectorState: InspectorState
  selectedItem?: any
  context: WorkspaceContext
  activePanelId: string
  onClose: () => void
}

export function InspectorPanel({
  isOpen,
  inspectorState,
  selectedItem,
  context,
  activePanelId,
  onClose
}: InspectorPanelProps) {
  if (inspectorState === InspectorState.CLOSED) {
    return null
  }

  const getContextualContent = () => {
    switch (context) {
      case WorkspaceContext.PLAY:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🎲 Roll 2d6
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  ❤️ Add HP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  ⭐ Add XP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🛡️ Take Damage
                </Button>
              </CardContent>
            </Card>
            
            {activePanelId === 'character-stats' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Character Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">HP:</span>
                      <span className="text-text-primary">18/24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">XP:</span>
                      <span className="text-text-primary">12/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Armor:</span>
                      <span className="text-text-primary">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Load:</span>
                      <span className="text-text-primary">8/13</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
        
      case WorkspaceContext.PREP:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Character Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📈 Level Up
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    ⚔️ Learn Move
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🎒 Manage Equipment
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    ✨ Prepare Spells
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case WorkspaceContext.BUILD:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Character Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="text-text-secondary">
                    Create and customize your character using the available tools.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      case WorkspaceContext.REFERENCE:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📖 Basic Moves
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    ⚔️ Combat Rules
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🛡️ Equipment Tags
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    ✨ Spell List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Inspector Panel */}
      <aside className={cn(
        "fixed right-0 top-0 z-50 h-full w-80 border-l border-border/50 glass-subtle transition-transform duration-300 md:relative md:z-auto",
        isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
            <h2 className="text-sm font-medium text-text-primary">
              Inspector
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              title="Close Inspector"
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedItem ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Selected Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-text-secondary">
                      {JSON.stringify(selectedItem, null, 2)}
                    </div>
                  </CardContent>
                </Card>
                {getContextualContent()}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="text-text-secondary text-sm">
                    Select an item to view details
                  </div>
                </div>
                {getContextualContent()}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}