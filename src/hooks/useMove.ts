/**
 * useMove Hook for ZimboMate V2
 * Execute Dungeon World moves with full integration
 * Handles move selection, execution, outcomes, and follow-up effects
 */

import type { Attribute } from '../models/Character'
import type { CompendiumMove } from '../services/MoveCompendiumService'
import { useCallback, useMemo, useState } from 'react'
import { moveCompendiumService } from '../services/MoveCompendiumService'
import { useActiveCharacter } from './useActiveCharacter'
import { useDiceRoll } from './useDiceRoll'

export interface MoveExecutionContext {
  characterId: string
  moveId: string
  selectedOptions?: string[]
  customModifier?: number
  targetCharacterId?: string
  description?: string
}

export interface MoveExecutionResult {
  move: CompendiumMove
  rollResult: any // From useDiceRoll
  outcome: 'success' | 'partial' | 'failure'
  effects: Array<{
    type: 'condition' | 'modifier' | 'resource' | 'damage' | 'healing'
    target: string
    value: any
    description: string
  }>
  followUpOptions?: Array<{
    id: string
    name: string
    description: string
    action: () => void
  }>
}

export interface UseMoveReturn {
  // Move library
  allMoves: CompendiumMove[]
  basicMoves: CompendiumMove[]
  specialMoves: CompendiumMove[]
  classMoves: CompendiumMove[]

  // Move selection
  selectedMove: CompendiumMove | null
  selectMove: (moveId: string) => void
  clearSelection: () => void

  // Move execution
  executeMove: (context: MoveExecutionContext) => Promise<MoveExecutionResult>
  executeSelectedMove: (options?: {
    customModifier?: number
    selectedOptions?: string[]
    description?: string
  }) => Promise<MoveExecutionResult>

  // Quick move execution
  hackAndSlash: (modifier?: number) => Promise<MoveExecutionResult>
  volley: (modifier?: number) => Promise<MoveExecutionResult>
  defy: (stat: keyof Attribute, modifier?: number) => Promise<MoveExecutionResult>
  aid: (targetCharacterId: string, modifier?: number) => Promise<MoveExecutionResult>
  interfere: (targetCharacterId: string, modifier?: number) => Promise<MoveExecutionResult>

  // Move search and filtering
  searchMoves: (query: string) => CompendiumMove[]
  getMovesForClass: (className: string) => CompendiumMove[]
  getMovesForStat: (stat: keyof Attribute) => CompendiumMove[]

  // Move state
  isExecuting: boolean
  lastExecution: MoveExecutionResult | null

  // Character context
  activeCharacter: any
  availableMoves: CompendiumMove[]

  // Utility
  canExecuteMove: (moveId: string) => boolean
  getMovePrerequisites: (moveId: string) => string[]
}

/**
 * Hook for managing Dungeon World moves
 */
export function useMove(): UseMoveReturn {
  const { activeCharacter } = useActiveCharacter()
  const { roll } = useDiceRoll()

  const [selectedMove, setSelectedMove] = useState<CompendiumMove | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastExecution, setLastExecution] = useState<MoveExecutionResult | null>(null)

  // Get all moves from the compendium
  const allMoves = useMemo(() => {
    return moveCompendiumService.getAllMoves()
  }, [])

  // Categorize moves
  const basicMoves = useMemo(() => {
    return allMoves.filter(move => move.type === 'basic')
  }, [allMoves])

  const specialMoves = useMemo(() => {
    return allMoves.filter(move => move.type === 'special')
  }, [allMoves])

  const classMoves = useMemo(() => {
    if (!activeCharacter)
      return []
    return allMoves.filter(move =>
      move.type === 'class'
      && move.classes?.includes(activeCharacter.class.toLowerCase()),
    )
  }, [allMoves, activeCharacter])

  // Available moves for the active character
  const availableMoves = useMemo(() => {
    if (!activeCharacter)
      return []

    return allMoves.filter((move) => {
      // Basic moves are always available
      if (move.type === 'basic')
        return true

      // Special moves are situational
      if (move.type === 'special')
        return true

      // Class moves must match character class
      if (move.type === 'class') {
        return move.classes?.includes(activeCharacter.class.toLowerCase()) || false
      }
      return false
    })
  }, [allMoves, activeCharacter])

  // Move selection
  const selectMove = useCallback((moveId: string) => {
    const move = moveCompendiumService.getMove(moveId)
    setSelectedMove(move || null)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMove(null)
  }, [])

  // Main move execution function
  const executeMove = useCallback(async (context: MoveExecutionContext): Promise<MoveExecutionResult> => {
    if (!activeCharacter) {
      throw new Error('No active character')
    }

    setIsExecuting(true)

    try {
      const move = moveCompendiumService.getMove(context.moveId)
      if (!move) {
        throw new Error(`Move not found: ${context.moveId}`)
      }

      // Determine the stat to roll with
      const rollStat = move.stat as keyof Attribute | undefined

      // Execute the roll
      const rollResult = await roll({
        stat: rollStat,
        modifier: context.customModifier,
        moveId: context.moveId,
        moveName: move.name,
        description: context.description || `${move.name} move`,
        characterId: context.characterId,
      })

      // Determine outcome
      const outcome = rollResult.result as 'success' | 'partial' | 'failure'

      // Apply move effects based on outcome
      const effects = await applyMoveEffects(move, outcome, rollResult, context)

      // Create follow-up options if needed
      const followUpOptions = createFollowUpOptions(move, outcome, context)

      const result: MoveExecutionResult = {
        move,
        rollResult,
        outcome,
        effects,
        followUpOptions,
      }

      setLastExecution(result)
      return result
    }
    finally {
      setIsExecuting(false)
    }
  }, [activeCharacter, roll])

  // Execute selected move
  const executeSelectedMove = useCallback(async (options = {}) => {
    if (!selectedMove || !activeCharacter) {
      throw new Error('No move selected or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: selectedMove.id,
      ...options,
    })
  }, [selectedMove, activeCharacter, executeMove])

  // Quick move execution functions
  const hackAndSlash = useCallback(async (modifier = 0) => {
    const hackAndSlashMove = allMoves.find(m => m.name.toLowerCase().includes('hack and slash'))
    if (!hackAndSlashMove || !activeCharacter) {
      throw new Error('Hack and Slash move not found or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: hackAndSlashMove.id,
      customModifier: modifier,
    })
  }, [allMoves, activeCharacter, executeMove])

  const volley = useCallback(async (modifier = 0) => {
    const volleyMove = allMoves.find(m => m.name.toLowerCase().includes('volley'))
    if (!volleyMove || !activeCharacter) {
      throw new Error('Volley move not found or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: volleyMove.id,
      customModifier: modifier,
    })
  }, [allMoves, activeCharacter, executeMove])

  const defy = useCallback(async (stat: keyof Attribute, modifier = 0) => {
    const defyMove = allMoves.find(m => m.name.toLowerCase().includes('defy danger'))
    if (!defyMove || !activeCharacter) {
      throw new Error('Defy Danger move not found or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: defyMove.id,
      customModifier: modifier,
      description: `Defy Danger with ${stat}`,
    })
  }, [allMoves, activeCharacter, executeMove])

  const aid = useCallback(async (targetCharacterId: string, modifier = 0) => {
    const aidMove = allMoves.find(m => m.name.toLowerCase().includes('aid'))
    if (!aidMove || !activeCharacter) {
      throw new Error('Aid move not found or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: aidMove.id,
      targetCharacterId,
      customModifier: modifier,
    })
  }, [allMoves, activeCharacter, executeMove])

  const interfere = useCallback(async (targetCharacterId: string, modifier = 0) => {
    const interfereMove = allMoves.find(m => m.name.toLowerCase().includes('interfere'))
    if (!interfereMove || !activeCharacter) {
      throw new Error('Interfere move not found or no active character')
    }
    return executeMove({
      characterId: activeCharacter.id,
      moveId: interfereMove.id,
      targetCharacterId,
      customModifier: modifier,
    })
  }, [allMoves, activeCharacter, executeMove])

  // Search and filtering
  const searchMoves = useCallback((query: string) => {
    return moveCompendiumService.searchMoves({ query })
  }, [])

  const getMovesForClass = useCallback((className: string) => {
    return allMoves.filter(move =>
      move.classes?.includes(className.toLowerCase()),
    )
  }, [allMoves])

  const getMovesForStat = useCallback((stat: keyof Attribute) => {
    return allMoves.filter(move => move.stat === stat)
  }, [allMoves])

  // Utility functions
  const canExecuteMove = useCallback((moveId: string) => {
    if (!activeCharacter)
      return false

    const move = moveCompendiumService.getMove(moveId)
    if (!move)
      return false

    // Check prerequisites
    const validation = moveCompendiumService.validateMoveExecution(move, activeCharacter)
    return validation.canExecute
  }, [activeCharacter])

  const getMovePrerequisites = useCallback((moveId: string) => {
    const move = moveCompendiumService.getMove(moveId)
    if (!move || !activeCharacter)
      return []

    const validation = moveCompendiumService.validateMoveExecution(move, activeCharacter)
    return validation.missingPrerequisites
  }, [activeCharacter])

  return {
    // Move library
    allMoves,
    basicMoves,
    specialMoves,
    classMoves,

    // Move selection
    selectedMove,
    selectMove,
    clearSelection,

    // Move execution
    executeMove,
    executeSelectedMove,

    // Quick move execution
    hackAndSlash,
    volley,
    defy,
    aid,
    interfere,

    // Move search and filtering
    searchMoves,
    getMovesForClass,
    getMovesForStat,

    // Move state
    isExecuting,
    lastExecution,

    // Character context
    activeCharacter,
    availableMoves,

    // Utility
    canExecuteMove,
    getMovePrerequisites,
  }
}

// Helper function to apply move effects
async function applyMoveEffects(
  _move: CompendiumMove,
  _outcome: 'success' | 'partial' | 'failure',
  _rollResult: any,
  _context: MoveExecutionContext,
): Promise<Array<{
  type: 'condition' | 'modifier' | 'resource' | 'damage' | 'healing'
  target: string
  value: any
  description: string
}>> {
  const effects: Array<{
    type: 'condition' | 'modifier' | 'resource' | 'damage' | 'healing'
    target: string
    value: any
    description: string
  }> = []

  // This would be expanded based on specific move implementations
  // For now, return basic effects structure

  return effects
}

// Helper function to create follow-up options
function createFollowUpOptions(
  _move: CompendiumMove,
  _outcome: 'success' | 'partial' | 'failure',
  _context: MoveExecutionContext,
): Array<{
  id: string
  name: string
  description: string
  action: () => void
}> | undefined {
  // This would be expanded based on specific move requirements
  // Some moves have follow-up choices, especially on 7-9 results

  return undefined
}
