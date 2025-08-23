import React from 'react'
import { AmbientLayer } from '../ui/hud/AmbientLayer'
import { HudPanel } from '../ui/hud/HudPanel'
import { HudSection } from '../ui/hud/HudSection'
import { HudText } from '../ui/hud/HudText'
import { SoundToggle } from '../ui/hud/SoundToggle'

export const HudDemo: React.FC = () => {
  const handleButtonClick = (category: string) => {
    console.log(`${category} button clicked`)
  }

  const handleButtonHover = () => {
    // Sound removed - UI only
  }

  const handleNotify = () => {
    console.log('Notification triggered')
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#001215' }}>
      <AmbientLayer />
      
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <HudText.Heading level={1}>
            ARWES HUD SYSTEM
          </HudText.Heading>
          <SoundToggle />
        </div>

        <HudText.Body className="mb-8 max-w-2xl">
          This demonstration showcases the Arwes HUD integration with animated panels, 
          staggered entrances, and interactive sound feedback. All components follow 
          the cyan accent palette and sci-fi aesthetic.
        </HudText.Body>

        {/* Main content grid with staggered panels */}
        <HudSection staggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <HudPanel 
            title="System Status" 
            subtitle="All systems operational"
            decor={<span className="text-green-400">●</span>}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <HudText.Label>Power Level:</HudText.Label>
                <span className="text-[#54DAD0]">98%</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Network:</HudText.Label>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Security:</HudText.Label>
                <span className="text-[#54DAD0]">SECURE</span>
              </div>
            </div>
          </HudPanel>

          <HudPanel 
            title="Navigation" 
            subtitle="Coordinate system"
            decor={<span className="text-blue-400">▲</span>}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <HudText.Label>X-Axis:</HudText.Label>
                <span className="text-[#54DAD0] font-mono">+127.45</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Y-Axis:</HudText.Label>
                <span className="text-[#54DAD0] font-mono">-89.12</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Z-Axis:</HudText.Label>
                <span className="text-[#54DAD0] font-mono">+45.67</span>
              </div>
            </div>
          </HudPanel>

          <HudPanel 
            title="Communications" 
            subtitle="Signal strength"
            decor={<span className="text-yellow-400">◆</span>}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <HudText.Label>Primary:</HudText.Label>
                <span className="text-green-400">STRONG</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Secondary:</HudText.Label>
                <span className="text-yellow-400">MODERATE</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Emergency:</HudText.Label>
                <span className="text-[#54DAD0]">READY</span>
              </div>
            </div>
          </HudPanel>

          <HudPanel 
            title="Diagnostics" 
            subtitle="System health"
            decor={<span className="text-[#54DAD0]">◇</span>}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <HudText.Label>CPU Usage:</HudText.Label>
                <span className="text-[#54DAD0]">23%</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Memory:</HudText.Label>
                <span className="text-[#54DAD0]">67%</span>
              </div>
              <div className="flex justify-between">
                <HudText.Label>Temperature:</HudText.Label>
                <span className="text-green-400">NORMAL</span>
              </div>
            </div>
          </HudPanel>

          <HudPanel 
            title="Mission Control" 
            subtitle="Operational commands"
            decor={<span className="text-red-400">■</span>}
          >
            <div className="space-y-3">
              <button
                onClick={() => handleButtonClick('primary')}
                onMouseEnter={handleButtonHover}
                className="w-full px-4 py-2 bg-[#54DAD0] bg-opacity-20 border border-[#54DAD0] text-[#54DAD0] hover:bg-opacity-30 transition-all duration-200"
              >
                PRIMARY ACTION
              </button>
              <button
                onClick={() => handleButtonClick('secondary')}
                onMouseEnter={handleButtonHover}
                className="w-full px-4 py-2 bg-transparent border border-gray-400 text-gray-300 hover:bg-gray-400 hover:bg-opacity-10 transition-all duration-200"
              >
                SECONDARY
              </button>
            </div>
          </HudPanel>

          <HudPanel 
            title="Alerts" 
            subtitle="System notifications"
            decor={<span className="text-orange-400">⚠</span>}
          >
            <div className="space-y-3">
              <HudText.Body className="text-sm">
                No active alerts detected.
              </HudText.Body>
              <button
                onClick={handleNotify}
                onMouseEnter={handleButtonHover}
                className="w-full px-4 py-2 bg-orange-400 bg-opacity-20 border border-orange-400 text-orange-400 hover:bg-opacity-30 transition-all duration-200"
              >
                TEST NOTIFICATION
              </button>
            </div>
          </HudPanel>
        </HudSection>

        {/* Footer info */}
        <HudSection className="mt-12">
          <HudPanel title="Integration Notes">
            <div className="space-y-2 text-sm">
              <HudText.Body>
                • Panels animate with staggered entrance (90ms delay between siblings)
              </HudText.Body>
              <HudText.Body>
                • Text reveals scale with content length (20ms per character, 200-800ms range)
              </HudText.Body>
              <HudText.Body>
                • Sound categories: click, hover, transition, notify, typing
              </HudText.Body>
              <HudText.Body>
                • Ambient layer drifts at 1-2px/sec with subtle noise texture
              </HudText.Body>
              <HudText.Body>
                • All animations use linear easing for crisp sci-fi feel
              </HudText.Body>
            </div>
          </HudPanel>
        </HudSection>
      </div>
    </div>
  )
}
