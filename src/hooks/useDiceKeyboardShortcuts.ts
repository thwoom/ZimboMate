/**
 * Dice Keyboard Shortcuts Hook
 * Provides desktop-optimized keyboard shortcuts for quick dice rolling
 * S = STR, D = DEX, C = CON, I = INT, W = WIS, H = CHA
 */

import type { Attributes } from '../models/Character'
import { useCallback, useEffect } from 'react'
import { useDiceStore } from '../stores/diceStore'
import { logger } from '../utils/logger'

interface DiceKeyboardShortcutsOptions {
  characterId: string
  enabled?: boolean
  modifierKey?: 'ctrl' | 'alt' | 'shift' | 'none'
}

const STAT_SHORTCUTS: Record<string, keyof Attributes> = {
  KeyS: 'STR', // S for Strength
  KeyD: 'DEX', // D for Dexterity
  KeyC: 'CON', // C for Constitution
  KeyI: 'INT', // I for Intelligence
  KeyW: 'WIS', // W for Wisdom
  KeyH: 'CHA', // H for CHArisma
}

const MOVE_SHORTCUTS: Record<
  string,
  { moveId: string; stat: keyof Attributes }
> = {
  KeyQ: { moveId: 'hack-and-slash', stat: 'STR' }, // Q for Quick attack
  KeyE: { moveId: 'defend', stat: 'CON' }, // E for dEfend
  KeyR: { moveId: 'volley', stat: 'DEX' }, // R for Ranged attack
  KeyT: { moveId: 'discern-realities', stat: 'WIS' }, // T for Truth/perception
  KeyY: { moveId: 'spout-lore', stat: 'INT' }, // Y for knowledgE (Y sounds like "why")
  KeyU: { moveId: 'parley', stat: 'CHA' }, // U for persUade
}

export function useDiceKeyboardShortcuts({
  characterId,
  enabled = true,
  modifierKey = 'none',
}: DiceKeyboardShortcutsOptions) {
  const { rollStat, rollMove, rollCustom, isRolling } = useDiceStore()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if we're typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      // Don't trigger if already rolling
      if (isRolling) {
        return
      }

      if (!characterId) {
        return
      }

      // Handle custom modifier shortcuts early to prevent navigation handlers
      if (
        event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        event.key >= '1' &&
        event.key <= '6'
      ) {
        event.preventDefault()
        event.stopPropagation()
        const baseModifier = Number.parseInt(event.key, 10)
        const modifier = event.shiftKey ? -baseModifier : baseModifier
        const label =
          modifier > 0
            ? `Custom Modifier +${modifier}`
            : `Custom Modifier ${modifier}`

        logger.info('dice_shortcut_custom_roll', {
          modifier,
          characterId,
        })

        void rollCustom({
          modifier,
          characterId,
          context: {
            label,
            description: 'Keyboard shortcut custom modifier roll',
          },
        })
        return
      }

      // Check modifier key requirement
      const hasCorrectModifier = (() => {
        switch (modifierKey) {
          case 'ctrl':
            return event.ctrlKey && !event.altKey && !event.shiftKey
          case 'alt':
            return event.altKey && !event.ctrlKey && !event.shiftKey
          case 'shift':
            return event.shiftKey && !event.ctrlKey && !event.altKey
          case 'none':
            return (
              !event.ctrlKey &&
              !event.altKey &&
              !event.shiftKey &&
              !event.metaKey
            )
          default:
            return false
        }
      })()

      if (!hasCorrectModifier) {
        return
      }

      const code = event.code

      // Handle stat shortcuts
      if (STAT_SHORTCUTS[code]) {
        event.preventDefault()
        const stat = STAT_SHORTCUTS[code]
        logger.info('dice_shortcut_stat_roll', { stat, characterId })
        rollStat(stat, characterId, `${stat} (Keyboard Shortcut)`)
        return
      }

      // Handle move shortcuts (only with Shift modifier)
      if (event.shiftKey && MOVE_SHORTCUTS[code]) {
        event.preventDefault()
        const { moveId, stat } = MOVE_SHORTCUTS[code]
        logger.info('dice_shortcut_move_roll', { moveId, stat, characterId })
        rollMove({
          moveId,
          stat,
          characterId,
          label: `${moveId} (Keyboard Shortcut)`,
        })
      }
    },
    [characterId, rollStat, rollMove, rollCustom, isRolling, modifierKey],
  )

  useEffect(() => {
    if (!enabled) return

    const listenerOptions: AddEventListenerOptions = {
      passive: false,
      capture: true,
    }
    document.addEventListener('keydown', handleKeyDown, listenerOptions)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, listenerOptions)
    }
  }, [enabled, handleKeyDown])

  // Return shortcut information for display in help/tooltips
  const getShortcutInfo = useCallback(() => {
    const modifierText =
      modifierKey === 'none' ? '' : `${modifierKey.toUpperCase()} + `

    return {
      stats: Object.entries(STAT_SHORTCUTS).map(([key, stat]) => ({
        key: key.replace('Key', ''),
        description: `${modifierText}${key.replace('Key', '')} → Roll ${stat}`,
        stat,
      })),
      moves: Object.entries(MOVE_SHORTCUTS).map(([key, { moveId, stat }]) => ({
        key: key.replace('Key', ''),
        description: `SHIFT + ${key.replace('Key', '')} → ${moveId.replace('-', ' ')} (${stat})`,
        moveId,
        stat,
      })),
      custom: [
        {
          key: 'CTRL + 1-6',
          description: 'Custom roll with positive modifier',
        },
        {
          key: 'CTRL + SHIFT + 1-6',
          description: 'Custom roll with negative modifier',
        },
      ],
    }
  }, [modifierKey])

  return {
    getShortcutInfo,
    enabled,
    isRolling,
  }
}
