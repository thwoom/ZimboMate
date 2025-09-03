import type { TemporaryModifier } from '../models/Modifiers'

import { useCallback } from 'react'
import { cleanupModifiers, isModifierExpired } from '../models/Modifiers'
import { useGameStore } from '../store/GameStore'

export function useModifiers() {
  const { state, dispatch } = useGameStore()
  const modifiers = state.modifiers

  const addModifier = useCallback((modifier: Omit <TemporaryModifier, 'id'>) => {
    const newModifier: TemporaryModifier = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      ...modifier,
      createdAt: new Date(),
      active: true,
    }

    dispatch({
      type: 'ADD_MODIFIER',
      payload: newModifier,
    })
  }, [dispatch])

  const removeModifier = useCallback((id: string) => {
    dispatch({
      type: 'REMOVE_MODIFIER',
      payload: id,
    })
  }, [dispatch])

  const updateModifier = useCallback((id: string, updates: Partial <TemporaryModifier>) => {
    dispatch({
      type: 'UPDATE_MODIFIER',
      payload: { id, updates },
    })
  }, [dispatch])

  const clearExpiredModifiers = useCallback(() => {
    const cleaned = cleanupModifiers(modifiers.modifiers)
    dispatch({
      type: 'SET_MODIFIERS',
      payload: {
        modifiers: cleaned,
        lastUpdated: new Date(),
      },
    })
  }, [modifiers, dispatch])

  const clearAllModifiers = useCallback(() => {
    dispatch({
      type: 'CLEAR_MODIFIERS',
    })
  }, [dispatch])

  const applyForwardModifier = useCallback((value: number, source = 'Manual') => {
    // Remove unknown existing forward modifiers
    const existingForward = modifiers.modifiers.filter(m => m.type === 'forward')
    for (const m of existingForward) removeModifier(m.id)

    // Add new forward modifier
    addModifier({
      name: 'Forward',
      value,
      type: 'forward',
      source,
      target: 'next-roll',
      expiry: 'used',
      createdAt: new Date(),
      active: true,
    })
  }, [modifiers, addModifier, removeModifier])

  const consumeForwardModifier = useCallback(() => {
    const forwardMod = modifiers.modifiers.find(m => m.type === 'forward')
    if (forwardMod) {
      removeModifier(forwardMod.id)
    }
  }, [modifiers, removeModifier])

  const getActiveModifiers = useCallback(() => {
    const _now = new Date()
    return modifiers.modifiers.filter(m => m.active && !isModifierExpired(m, now))
  }, [modifiers])

  const getTotalModifier = useCallback((type: TemporaryModifier['type']) => {
    const activeModifiers = getActiveModifiers()
    return activeModifiers
      .filter(m => m.type === type)
      .reduce((sum, m) => sum + m.value, 0)
  }, [getActiveModifiers])

  return {
    modifiers,
    activeModifiers: getActiveModifiers(),
    addModifier,
    removeModifier,
    updateModifier,
    clearExpiredModifiers,
    clearAllModifiers,
    applyForwardModifier,
    consumeForwardModifier,
    getTotalModifier,
    totalOngoing: getTotalModifier('ongoing'),
    totalForward: getTotalModifier('forward'),
    totalHold: getTotalModifier('hold'),
  }
}
