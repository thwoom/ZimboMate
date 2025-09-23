/**
 * Unified Roll System Component
 * Provides a central interface connecting stats, moves, and custom rolls
 * Integrates all dice system features: history, export, notifications, contextual panels
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, Plus, Settings, History, Command, Target, Zap, BookOpen } from 'lucide-react'
import { useDiceStore, type RollResult } from '../../stores/diceStore'
import { useCharacterStore } from '../../stores/characterStore'
import { type Attributes } from '../../models/Character'
import { RollableElement } from '../common/RollableElement'
import { DiceHistorySidebar } from './DiceHistorySidebar'
import { RollDisplayManager } from './RollDisplayManager'
import { QuickRollZones } from './QuickRollZones'
import { useDiceKeyboardShortcuts } from '../../hooks/useDiceKeyboardShortcuts'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { useContextualRollPanel } from './ContextualRollPanel'
import { Button } from '../ui/Button'

interface UnifiedRollSystemProps {
  characterId: string
  layout?: 'sidebar' | 'modal' | 'inline' | 'fullscreen'
  showHistory?: boolean
  showQuickRolls?: boolean
  showCustomRolls?: boolean
  className?: string
  onClose?: () => void
}

interface QuickRollOption {
  id: string
  label: string
  type: 'stat' | 'move' | 'custom'
  stat?: keyof Attributes
  moveId?: string
  modifier?: number
  icon?: string
  color?: string
  description?: string
}

const defaultQuickRolls: QuickRollOption[] = [
  {
    id: 'hack-slash',
    label: 'Hack & Slash',
    type: 'move',
    moveId: 'hack-and-slash',
    stat: 'STR',
    icon: '⚔️',
    color: 'bg-destructive/120',
    description: 'Attack an enemy in melee'
  },
  {
    id: 'volley',
    label: 'Volley',
    type: 'move',
    moveId: 'volley',
    stat: 'DEX',
    icon: '🏹',
    color: 'bg-chart-2',
    description: 'Attack an enemy at range'
  },
  {
    id: 'defy-danger',
    label: 'Defy Danger',
    type: 'move',
    moveId: 'defy-danger',
    icon: '🛡️',
    color: 'bg-primary/100',
    description: 'Act despite an imminent threat'
  },
  {
    id: 'spout-lore',
    label: 'Spout Lore',
    type: 'move',
    moveId: 'spout-lore',
    stat: 'INT',
    icon: '📚',
    color: 'bg-accent',
    description: 'Consult your accumulated knowledge'
  },
  {
    id: 'discern-realities',
    label: 'Discern Realities',
    type: 'move',
    moveId: 'discern-realities',
    stat: 'WIS',
    icon: '👁️',
    color: 'bg-indigo-500',
    description: 'Closely study a situation'
  },
  {
    id: 'parley',
    label: 'Parley',
    type: 'move',
    moveId: 'parley',
    stat: 'CHA',
    icon: '💬',
    color: 'bg-chart-4/120',
    description: 'Leverage with an NPC'
  }
]

const StatRollPanel: React.FC<{
  characterId: string
  character: any
  onRoll?: (result: RollResult) => void
}> = ({ characterId, character, onRoll }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const).map(stat => {
        const value = character?.attributes?.[stat] || 10
        const modifier = Math.floor((value - 10) / 2)

        return (
          <RollableElement
            key={stat}
            rollType="stat"
            stat={stat}
            statValue={value}
            characterId={characterId}
            onRoll={onRoll}
            className="p-3 bg-card border-2 border-border rounded-lg hover:border-primary/30 transition-colors"
          >
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {stat}
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {modifier >= 0 ? '+' : ''}{modifier}
              </div>
              <div className="text-xs text-muted-foreground">
                ({value})
              </div>
            </div>
          </RollableElement>
        )
      })}
    </div>
  )
}

const MoveRollPanel: React.FC<{
  characterId: string
  character: any
  quickRolls: QuickRollOption[]
  onRoll?: (result: RollResult) => void
}> = ({ characterId, character, quickRolls, onRoll }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {quickRolls.filter(roll => roll.type === 'move').map(roll => {
        const statValue = roll.stat ? character?.attributes?.[roll.stat] || 10 : 10

        return (
          <RollableElement
            key={roll.id}
            rollType="move"
            moveId={roll.moveId!}
            moveName={roll.label}
            stat={roll.stat!}
            characterId={characterId}
            onRoll={onRoll}
            className={`p-4 ${roll.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{roll.icon}</div>
              <div className="flex-1">
                <div className="font-semibold">{roll.label}</div>
                {roll.stat && (
                  <div className="text-sm opacity-90">
                    {roll.stat} • 2d6{statValue ? `${Math.floor((statValue - 10) / 2) >= 0 ? '+' : ''}${Math.floor((statValue - 10) / 2)}` : ''}
                  </div>
                )}
                <div className="text-xs opacity-75 mt-1">
                  {roll.description}
                </div>
              </div>
            </div>
          </RollableElement>
        )
      })}
    </div>
  )
}

const CustomRollPanel: React.FC<{
  characterId: string
  onRoll?: (result: RollResult) => void
}> = ({ characterId, onRoll }) => {
  const [customModifier, setCustomModifier] = useState(0)
  const [customLabel, setCustomLabel] = useState('')
  const { rollCustom } = useDiceStore()

  const handleCustomRoll = async () => {
    if (!customLabel.trim()) return

    try {
      const result = await rollCustom(
        customModifier,
        {
          type: 'custom',
          label: customLabel
        },
        characterId
      )
      onRoll?.(result)
      setCustomLabel('')
      setCustomModifier(0)
    } catch (error) {
      console.error('Custom roll failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Roll Description
          </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g., Athletics check, Investigate, etc."
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
            onKeyDown={(e) => e.key === 'Enter' && handleCustomRoll()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Modifier
          </label>
          <select
            value={customModifier}
            onChange={(e) => setCustomModifier(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
          >
            {Array.from({ length: 13 }, (_, i) => i - 6).map(mod => (
              <option key={mod} value={mod}>
                {mod >= 0 ? '+' : ''}{mod}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        onClick={handleCustomRoll}
        disabled={!customLabel.trim()}
        className="w-full"
      >
        <Dices size={16} className="mr-2" />
        Roll 2d6{customModifier !== 0 ? `${customModifier >= 0 ? '+' : ''}${customModifier}` : ''}
      </Button>

      {/* Quick custom roll presets */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Quick Custom Rolls</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Advantage (+1)', mod: 1 },
            { label: 'Disadvantage (-1)', mod: -1 },
            { label: 'Blessed (+2)', mod: 2 },
            { label: 'Cursed (-2)', mod: -2 }
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setCustomModifier(preset.mod)
                setCustomLabel(preset.label)
              }}
              className="p-2 text-sm bg-muted hover:bg-muted rounded border transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const UnifiedRollSystem: React.FC<UnifiedRollSystemProps> = ({
  characterId,
  layout = 'sidebar',
  showHistory = true,
  showQuickRolls = true,
  showCustomRolls = true,
  className = '',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'custom'>('moves')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null)

  const { getCharacter } = useCharacterStore()
  const character = getCharacter(characterId)

  // Initialize keyboard shortcuts
  useDiceKeyboardShortcuts(characterId)

  // Initialize drag and drop
  const { isDragging, DropZones } = useDragAndDrop(characterId)

  const handleRollResult = (result: RollResult) => {
    setLastRoll(result)
  }

  const tabs = [
    { id: 'stats' as const, label: 'Stats', icon: Target, description: 'Roll ability scores' },
    { id: 'moves' as const, label: 'Moves', icon: Zap, description: 'Roll basic moves' },
    { id: 'custom' as const, label: 'Custom', icon: Plus, description: 'Custom dice rolls' }
  ]

  const layoutClasses = {
    sidebar: 'flex h-screen bg-muted/50',
    modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
    inline: 'w-full',
    fullscreen: 'fixed inset-0 z-40 bg-card'
  }

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {/* History Sidebar */}
      {showHistory && layout === 'sidebar' && (
        <DiceHistorySidebar
          characterId={characterId}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${layout === 'sidebar' ? 'overflow-hidden' : ''}`}>
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Dices className="text-primary" />
                Dice Rolling System
              </h1>
              <p className="text-sm text-muted-foreground">
                {character ? `Rolling for ${character.name}` : 'Select character to roll'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Command size={16} className="mr-2" />
                Commands
              </Button>
              <Button variant="ghost" size="sm">
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card border-b border-border px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                    ${isActive
                      ? 'border-primary/40 text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'stats' && character && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-foreground mb-2">Ability Scores</h2>
                      <p className="text-sm text-muted-foreground">Click any stat to roll 2d6 + modifier</p>
                    </div>
                    <StatRollPanel
                      characterId={characterId}
                      character={character}
                      onRoll={handleRollResult}
                    />
                  </div>
                )}

                {activeTab === 'moves' && character && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-foreground mb-2">Basic Moves</h2>
                      <p className="text-sm text-muted-foreground">Click any move to roll with the appropriate stat</p>
                    </div>
                    <MoveRollPanel
                      characterId={characterId}
                      character={character}
                      quickRolls={defaultQuickRolls}
                      onRoll={handleRollResult}
                    />
                  </div>
                )}

                {activeTab === 'custom' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-foreground mb-2">Custom Rolls</h2>
                      <p className="text-sm text-muted-foreground">Create custom dice rolls with modifiers</p>
                    </div>
                    <CustomRollPanel
                      characterId={characterId}
                      onRoll={handleRollResult}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Roll Zones (shown during drag) */}
        <AnimatePresence>
          {isDragging && showQuickRolls && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20"
            >
              <DropZones />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Roll Display (for non-sidebar layouts) */}
      {layout !== 'sidebar' && showHistory && (
        <div className="w-80 border-l border-border bg-card">
          <RollDisplayManager
            displayMode="persistent"
            maxVisibleRolls={10}
            className="h-full"
          />
        </div>
      )}
    </div>
  )
}

// Wrapper component for easy integration
export const DiceRollingInterface: React.FC<{
  characterId: string
  variant?: 'full' | 'compact' | 'modal'
}> = ({ characterId, variant = 'full' }) => {
  const [showModal, setShowModal] = useState(false)

  if (variant === 'modal') {
    return (
      <>
        <Button onClick={() => setShowModal(true)}>
          <Dices size={16} className="mr-2" />
          Open Dice System
        </Button>

        <AnimatePresence>
          {showModal && (
            <UnifiedRollSystem
              characterId={characterId}
              layout="modal"
              onClose={() => setShowModal(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <UnifiedRollSystem
      characterId={characterId}
      layout={variant === 'compact' ? 'inline' : 'sidebar'}
      showHistory={variant === 'full'}
      showQuickRolls={true}
      showCustomRolls={variant === 'full'}
    />
  )
}



