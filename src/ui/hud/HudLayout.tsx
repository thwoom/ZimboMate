import React from 'react'
import { Animator } from '@arwes/react-animator'
import { HudPageBackground } from './HudBackground'
import { HudPanelV2, HudSection } from './HudPanelV2'
import { HudTextV2 } from './HudTextV2'
import { HudButton } from './HudButton'
import { useSoundToggle } from '../arwes/ArwesProviders'

interface HudLayoutProps {
  children: React.ReactNode
  variant?: 'cosmic' | 'moebius' | 'minimal'
  showHeader?: boolean
  showSidebar?: boolean
  showFooter?: boolean
  title?: string
  subtitle?: string
}

export const HudLayout: React.FC<HudLayoutProps> = ({
  children,
  variant = 'cosmic',
  showHeader = true,
  showSidebar = false,
  showFooter = true,
  title = 'ZimboMate',
  subtitle = 'System Interface'
}) => {
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundToggle()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <HudPageBackground variant={variant}>
      <div className="flex flex-col h-full">
        {/* Header */}
        {showHeader && (
          <Animator duration={{ enter: 0.4, exit: 0.2 }}>
            <header className="relative z-20">
              <HudSection
                className="m-6 mb-4"
                padding={false}
                glowIntensity="low"
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-6">
                    {showSidebar && (
                      <HudButton
                        variant="secondary"
                        size="small"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                      >
                        ☰
                      </HudButton>
                    )}
                    <div>
                      <HudTextV2 
                        as="h1"
                        effect="decipher"
                        className="!text-3xl !mb-2 text-[#54DAD0] font-bold tracking-wider uppercase"
                        style={{
                          textShadow: '0 0 20px rgba(84, 218, 208, 0.5)',
                          filter: 'drop-shadow(0 0 8px rgba(84, 218, 208, 0.3))'
                        }}
                      >
                        {title}
                      </HudTextV2>
                      <HudTextV2 
                        effect="fade" 
                        className="text-sm text-gray-400"
                      >
                        {subtitle}
                      </HudTextV2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <StatusIndicator label="System" status="online" />
                    <StatusIndicator label="Network" status="connected" />
                    <HudButton
                      variant="secondary"
                      size="small"
                      onClick={toggleSound}
                    >
                      {soundEnabled ? '🔊' : '🔇'}
                    </HudButton>
                  </div>
                </div>
              </HudSection>
            </header>
          </Animator>
        )}

        {/* Main content area */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* Sidebar */}
          {showSidebar && sidebarOpen && (
            <Animator duration={{ enter: 0.3, exit: 0.2 }}>
              <aside className="relative z-10">
                <HudPanelV2
                  title="Navigation"
                  frameType="kranox"
                  className="h-full w-[320px] m-6"
                  glowIntensity="low"
                >
                  <nav className="space-y-3">
                    <NavItem label="Dashboard" active />
                    <NavItem label="Analysis" />
                    <NavItem label="Database" />
                    <NavItem label="Settings" />
                  </nav>
                </HudPanelV2>
              </aside>
            </Animator>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Footer */}
        {showFooter && (
          <Animator duration={{ enter: 0.4, exit: 0.2 }}>
            <footer className="relative z-20">
              <HudSection
                className="m-6 mt-4"
                padding={false}
                glowIntensity="low"
              >
                <div className="flex items-center justify-between p-4 text-sm">
                  <div className="flex items-center gap-6">
                    <HudTextV2 effect="none" className="text-gray-400">
                      v1.0.0
                    </HudTextV2>
                    <span className="text-gray-600">|</span>
                    <span className="text-cyan-400">100% CPU</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-green-400">64% MEM</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TimeDisplay />
                  </div>
                </div>
              </HudSection>
            </footer>
          </Animator>
        )}
      </div>

      {/* Overlay for modals/dialogs */}
      <div id="hud-overlay" className="relative z-30" />
    </HudPageBackground>
  )
}

// Status indicator component
const StatusIndicator: React.FC<{
  label: string
  status: 'online' | 'offline' | 'connected' | 'error'
}> = ({ label, status }) => {
  const statusColors = {
    online: '#4caf50',
    connected: '#54DAD0',
    offline: '#666',
    error: '#f44336'
  }

  const color = statusColors[status]

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 8px ${color}, 0 0 16px ${color}80`
        }}
      />
      <HudTextV2 
        effect="none" 
        className="text-xs text-gray-400 uppercase tracking-wider"
      >
        {label}
      </HudTextV2>
    </div>
  )
}

// Navigation item component
const NavItem: React.FC<{
  label: string
  active?: boolean
  onClick?: () => void
}> = ({ label, active = false, onClick }) => {
  return (
    <HudButton
      variant={active ? 'primary' : 'secondary'}
      fullWidth
      onClick={onClick}
      className="!justify-start"
    >
      {label}
    </HudButton>
  )
}

// Time display component
const TimeDisplay: React.FC = () => {
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <HudTextV2
      effect="none"
      className="font-mono text-sm text-cyan-400"
    >
      {time.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}
    </HudTextV2>
  )
}

// Export additional layout components
export const HudContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {children}
  </div>
)

export const HudGrid: React.FC<{
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
  className?: string
}> = ({ children, cols = 2, className = '' }) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-6 ${colsClass[cols]} ${className}`}>
      {children}
    </div>
  )
}
