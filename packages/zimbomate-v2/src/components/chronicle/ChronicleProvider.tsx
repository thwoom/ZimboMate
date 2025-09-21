/**
 * Chronicle Provider
 *
 * Provides the contextual Chronicle system across the entire app.
 * Manages the overlay system, action listening, and context intelligence.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ChronicleOverlay } from './ChronicleOverlay'
import { chronicleActionListener, type ActionContext, type ChronicleActionType } from '../../services/ChronicleActionListenerService'
import { contextIntelligence } from '../../services/ChronicleContextIntelligence'
import { useChronicleStore } from '../../stores/chronicleStore'

interface ChronicleContextValue {
  // Core functionality
  emitAction: (context: ActionContext) => void
  isOverlayEnabled: boolean
  toggleOverlay: (enabled?: boolean) => void

  // Convenience methods for common actions
  emitDiceRoll: (params: {
    characterName?: string
    stat?: string
    moveName?: string
    result: 'success' | 'partial' | 'failure'
    total: number
    modifier: number
    dice: number[]
  }) => void

  emitEquipmentAction: (params: {
    characterName?: string
    action: 'use' | 'equip' | 'unequip' | 'drop' | 'acquire'
    itemName: string
    itemType?: string
    quantity?: number
  }) => void

  emitCombatAction: (params: {
    characterName?: string
    action: 'attack' | 'defend' | 'move_combat' | 'use_ability'
    target?: string
    weapon?: string
    damage?: number
  }) => void

  // Settings
  overlayPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  setOverlayPosition: (position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') => void
  maxPrompts: number
  setMaxPrompts: (max: number) => void
}

const ChronicleContext = createContext<ChronicleContextValue | null>(null)

interface ChronicleProviderProps {
  children: React.ReactNode
  defaultEnabled?: boolean
  overlayPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxPrompts?: number
}

export const ChronicleProvider: React.FC<ChronicleProviderProps> = ({
  children,
  defaultEnabled = true,
  overlayPosition: defaultPosition = 'top-right',
  maxPrompts: defaultMaxPrompts = 2
}) => {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(defaultEnabled)
  const [overlayPosition, setOverlayPosition] = useState(defaultPosition)
  const [maxPrompts, setMaxPrompts] = useState(defaultMaxPrompts)

  const chronicleStore = useChronicleStore()

  // Initialize services
  useEffect(() => {
    chronicleActionListener.setEnabled(isOverlayEnabled)
  }, [isOverlayEnabled])

  // Core action emitter
  const emitAction = useCallback((context: ActionContext) => {
    // Enrich context with current session info
    const enrichedContext: ActionContext = {
      ...context,
      timestamp: context.timestamp || new Date(),
      sessionId: context.sessionId || chronicleStore.currentSessionId || undefined
    }

    chronicleActionListener.emitAction(enrichedContext)
  }, [chronicleStore.currentSessionId])

  // Convenience method for dice rolls
  const emitDiceRoll = useCallback((params: {
    characterName?: string
    stat?: string
    moveName?: string
    result: 'success' | 'partial' | 'failure'
    total: number
    modifier: number
    dice: number[]
  }) => {
    const actionType: ChronicleActionType = params.moveName
      ? 'move_roll'
      : params.stat
        ? 'stat_roll'
        : 'dice_roll'

    emitAction({
      actionType,
      timestamp: new Date(),
      characterName: params.characterName,
      diceRoll: {
        type: params.moveName ? 'move' : params.stat ? 'stat' : 'custom',
        stat: params.stat,
        moveName: params.moveName,
        result: params.result,
        total: params.total,
        modifier: params.modifier,
        dice: params.dice
      }
    })
  }, [emitAction])

  // Convenience method for equipment actions
  const emitEquipmentAction = useCallback((params: {
    characterName?: string
    action: 'use' | 'equip' | 'unequip' | 'drop' | 'acquire'
    itemName: string
    itemType?: string
    quantity?: number
  }) => {
    const actionType: ChronicleActionType = params.action === 'use'
      ? 'equipment_use'
      : 'equipment_equip'

    emitAction({
      actionType,
      timestamp: new Date(),
      characterName: params.characterName,
      equipment: {
        action: params.action,
        itemName: params.itemName,
        itemType: params.itemType,
        quantity: params.quantity
      }
    })
  }, [emitAction])

  // Convenience method for combat actions
  const emitCombatAction = useCallback((params: {
    characterName?: string
    action: 'attack' | 'defend' | 'move_combat' | 'use_ability'
    target?: string
    weapon?: string
    damage?: number
  }) => {
    emitAction({
      actionType: 'combat_action',
      timestamp: new Date(),
      characterName: params.characterName,
      combat: {
        action: params.action,
        target: params.target,
        weapon: params.weapon,
        damage: params.damage
      }
    })
  }, [emitAction])

  // Toggle overlay
  const toggleOverlay = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !isOverlayEnabled
    setIsOverlayEnabled(newEnabled)
    chronicleActionListener.setEnabled(newEnabled)
  }, [isOverlayEnabled])

  const contextValue: ChronicleContextValue = {
    emitAction,
    isOverlayEnabled,
    toggleOverlay,
    emitDiceRoll,
    emitEquipmentAction,
    emitCombatAction,
    overlayPosition,
    setOverlayPosition,
    maxPrompts,
    setMaxPrompts
  }

  return (
    <ChronicleContext.Provider value={contextValue}>
      {children}
      <ChronicleOverlay
        isEnabled={isOverlayEnabled}
        position={overlayPosition}
        maxPrompts={maxPrompts}
      />
    </ChronicleContext.Provider>
  )
}

// Hook for using the Chronicle system
export const useChronicle = () => {
  const context = useContext(ChronicleContext)
  if (!context) {
    throw new Error('useChronicle must be used within a ChronicleProvider')
  }
  return context
}

// Higher-order component for easy integration
export const withChronicle = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return React.forwardRef<any, T>((props, ref) => (
    <ChronicleProvider>
      <Component {...props} ref={ref} />
    </ChronicleProvider>
  ))
}

// Specialized hooks for common use cases

// Hook for dice rolling components
export const useChronicleForDice = () => {
  const { emitDiceRoll } = useChronicle()
  return { chronicleDiceRoll: emitDiceRoll }
}

// Hook for equipment components
export const useChronicleForEquipment = () => {
  const { emitEquipmentAction } = useChronicle()
  return { chronicleEquipmentAction: emitEquipmentAction }
}

// Hook for combat components
export const useChronicleForCombat = () => {
  const { emitCombatAction } = useChronicle()
  return { chronicleCombatAction: emitCombatAction }
}

// Hook for manual chronicle prompts
export const useChroniclePrompt = () => {
  const { emitAction } = useChronicle()

  const promptForChronicle = useCallback((
    message: string,
    actionType: ChronicleActionType = 'session_milestone',
    characterName?: string
  ) => {
    emitAction({
      actionType,
      timestamp: new Date(),
      characterName,
      gameState: {
        currentScene: message
      }
    })
  }, [emitAction])

  return { promptForChronicle }
}