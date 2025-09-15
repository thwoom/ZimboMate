import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { GameStoreProvider } from './store/GameStore'
import { ModernLayout } from './layouts/ModernLayout'
import { CommandPalette } from './components/ui/CommandPalette'
import { HpTile } from './components/tiles/HpTile'
import { AttributesTile } from './components/tiles/AttributesTile'
import { commandBus } from './lib/commandBus'
import { registerCoreCommands, useCommandHandlers } from './lib/commands'
import { initializeTheme } from './lib/utils'
import './index.css'

function ModernApp() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commands, setCommands] = useState(commandBus.getCommands())

  // Initialize command handlers
  useCommandHandlers()

  // Subscribe to command changes
  useEffect(() => {
    const unsubscribe = commandBus.subscribe(() => {
      setCommands(commandBus.getCommands())
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    // Initialize theme system
    initializeTheme()
    
    // Register core commands
    registerCoreCommands()
  }, [])

  return (
    <GameStoreProvider>
      <Router>
        <ModernLayout
          inspectorContent={
            <div className="space-y-4">
              <div className="p-4 glass rounded-lg">
                <h3 className="font-semibold text-text-primary mb-2">Character Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Level:</span>
                    <span className="text-text-primary">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Class:</span>
                    <span className="text-text-primary">Fighter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Alignment:</span>
                    <span className="text-text-primary">Chaotic Good</span>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={
              <>
                <HpTile />
                <AttributesTile />
                {/* Add more tiles here */}
              </>
            } />
          </Routes>
        </ModernLayout>

        {/* Command Palette */}
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          commands={commands}
        />
      </Router>
    </GameStoreProvider>
  )
}

export default ModernApp