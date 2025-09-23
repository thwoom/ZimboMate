import React, { createContext, useContext, useState, useCallback } from 'react'

export type RouteId = 
  | 'dashboard' 
  | 'character' 
  | 'dice' 
  | 'moves' 
  | 'equipment' 
  | 'session-tools' 
  | 'campaign' 
  | 'file-management' 
  | 'multiplayer' 
  | 'settings'
  | 'help'

interface NavigationContextType {
  currentRoute: RouteId
  navigate: (route: RouteId) => void
  goBack: () => void
  canGoBack: boolean
  history: RouteId[]
}

const NavigationContext = createContext<NavigationContextType | null>(null)

interface NavigationProviderProps {
  children: React.ReactNode
  initialRoute?: RouteId
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialRoute = 'character'
}) => {
  const [history, setHistory] = useState<RouteId[]>([initialRoute])
  const currentRoute = history[history.length - 1]

  const navigate = useCallback((route: RouteId) => {
    setHistory(prev => [...prev, route])
  }, [])

  const goBack = useCallback(() => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  }, [])

  const canGoBack = history.length > 1

  const value: NavigationContextType = {
    currentRoute,
    navigate,
    goBack,
    canGoBack,
    history
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

// Route configuration
export const routes: Record<RouteId, { label: string; description: string }> = {
  dashboard: {
    label: 'Dashboard',
    description: 'Overview of your character and campaign'
  },
  character: {
    label: 'Character',
    description: 'Manage your character sheet and stats'
  },
  dice: {
    label: 'Dice',
    description: 'Roll dice for moves and checks'
  },
  moves: {
    label: 'Moves',
    description: 'Browse and execute Dungeon World moves'
  },
  equipment: {
    label: 'Equipment',
    description: 'Manage inventory and equipment'
  },
  'session-tools': {
    label: 'Session Tools',
    description: 'Notes, timers, and session management'
  },
  campaign: {
    label: 'Campaign',
    description: 'Campaign management and world building'
  },
  'file-management': {
    label: 'File Management',
    description: 'Import, export, and backup your data'
  },
  multiplayer: {
    label: 'Multiplayer',
    description: 'Connect with other players'
  },
  settings: {
    label: 'Settings',
    description: 'App preferences and configuration'
  },
  help: {
    label: 'Help',
    description: 'Documentation and support'
  }
}

// Command palette integration
export const createNavigationCommands = (navigate: (route: RouteId) => void) => {
  return Object.entries(routes).map(([id, config]) => ({
    id: `nav-${id}`,
    label: `Go to ${config.label}`,
    description: config.description,
    category: 'Navigation',
    shortcut: id === 'character' ? 'Ctrl+1' : 
              id === 'dice' ? 'Ctrl+2' :
              id === 'moves' ? 'Ctrl+3' :
              id === 'equipment' ? 'Ctrl+4' :
              id === 'session-tools' ? 'Ctrl+5' :
              undefined,
    execute: () => navigate(id as RouteId)
  }))
}