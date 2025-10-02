import type { RollResult } from '../../stores/diceStore'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDummyCharacter } from '../../models/Character'
import { useCharacterStore } from '../../stores/characterStore'
import { useDiceStore } from '../../stores/diceStore'
import { UnifiedRollSystem } from '../dice/UnifiedRollSystem'

const CHARACTER_ID = 'test-character'

function resetStores() {
  const diceStore = useDiceStore.getState()
  diceStore.clearAllHistory()
  useDiceStore.setState({ currentRoll: null, isRolling: false })

  useCharacterStore.setState(state => ({
    ...state,
    characters: [],
    activeCharacterId: null,
  }))
}

describe('unifiedRollSystem', () => {
  beforeEach(() => {
    resetStores()

    const character = {
      ...createDummyCharacter(),
      id: CHARACTER_ID,
      attributes: { STR: 16, DEX: 12, CON: 10, INT: 11, WIS: 9, CHA: 8 },
    }

    useCharacterStore.setState(state => ({
      ...state,
      characters: [character],
      activeCharacterId: CHARACTER_ID,
    }))
  })

  afterEach(() => {
    cleanup()
    resetStores()
    vi.restoreAllMocks()
  })

  it('rolls a stat when the stat button is clicked', async () => {
    const mockRoll: RollResult = {
      version: 1,
      id: 'roll-1',
      timestamp: Date.now(),
      characterId: CHARACTER_ID,
      type: 'stat',
      dice1: 3,
      dice2: 4,
      diceTotal: 7,
      modifier: 2,
      finalResult: 9,
      outcome: 'partial',
      context: { label: 'STR Roll', stat: 'STR', description: 'Rolling STR' },
      effects: {},
    }

    const rollStatSpy = vi
      .spyOn(useDiceStore.getState(), 'rollStat')
      .mockResolvedValue(mockRoll)

    render(<UnifiedRollSystem characterId={CHARACTER_ID} />)

    const strengthButton = screen.getByRole('button', { name: /STR/i })
    fireEvent.click(strengthButton)

    await waitFor(() => expect(rollStatSpy).toHaveBeenCalledWith('STR', CHARACTER_ID, undefined))
    await screen.findByText(/Last roll/i)
    expect(screen.getByText(/STR Roll/i)).toBeInTheDocument()
  })

  it('submits a custom roll when the form is completed', async () => {
    const mockRoll: RollResult = {
      version: 1,
      id: 'roll-2',
      timestamp: Date.now(),
      characterId: CHARACTER_ID,
      type: 'custom',
      dice1: 2,
      dice2: 6,
      diceTotal: 8,
      modifier: 1,
      finalResult: 9,
      outcome: 'success',
      context: { label: 'Aid another', description: 'Helping a friend' },
      effects: {},
    }

    const rollCustomSpy = vi
      .spyOn(useDiceStore.getState(), 'rollCustom')
      .mockResolvedValue(mockRoll)

    render(<UnifiedRollSystem characterId={CHARACTER_ID} />)

    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Aid another' } })
    fireEvent.change(screen.getByLabelText(/Notes/i), { target: { value: 'Helping a friend' } })
    fireEvent.change(screen.getByLabelText(/Modifier/i), { target: { value: '1' } })

    fireEvent.click(screen.getByRole('button', { name: /Roll custom/i }))

    await waitFor(() =>
      expect(rollCustomSpy).toHaveBeenCalledWith({
        characterId: CHARACTER_ID,
        modifier: 1,
        context: { label: 'Aid another', description: 'Helping a friend' },
      }),
    )

    expect(await screen.findByText(/Aid another/)).toBeInTheDocument()
  })
})
