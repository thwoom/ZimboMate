import type { Character } from '../../models/Character'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CharacterSheet } from '../game/CharacterSheet'

const useCharacterStoreMock = vi.fn()
const useXPStoreMock = vi.fn()

vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: () => useCharacterStoreMock(),
}))

vi.mock('../../stores/xpStore', () => ({
  useXPStore: () => useXPStoreMock(),
}))

const baseCharacter: Character = {
  id: 'hero-1',
  name: 'Test Hero',
  class: 'Fighter',
  race: 'Human',
  level: 3,
  alignment: 'Neutral',
  alignmentMove: undefined,
  attributes: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 12,
    WIS: 13,
    CHA: 11,
  },
  debilities: {
    weak: false,
    shaky: false,
    sick: false,
    stunned: false,
    confused: false,
    scarred: false,
  },
  hp: { current: 20, max: 25 },
  armor: 2,
  baseArmor: undefined,
  damageDie: 'd10',
  xp: 7,
  load: { current: 8, max: 12 },
  baseLoad: 12,
  coin: 0,
  bonds: [],
  advancements: [],
  knownMoves: [],
  availableMoves: [],
  knownSpells: [],
  preparedSpells: [],
  deity: undefined,
  compendiumClasses: [],
  raceMoves: [],
  customMoves: [],
  conditions: [],
  inventory: [],
  notes: '',
  looks: '',
  backstory: '',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('characterSheet', () => {
  const updateCharacter = vi.fn()

  beforeEach(() => {
    useCharacterStoreMock.mockReturnValue({
      getActiveCharacter: () => baseCharacter,
      updateCharacter,
    })
    useXPStoreMock.mockReturnValue({
      characterXP: {},
      characterLevel: {},
    })
    updateCharacter.mockClear()
  })

  it('renders core character information', () => {
    render(<CharacterSheet />)

    expect(screen.getByText('Test Hero')).toBeInTheDocument()
    expect(screen.getAllByText(/Level 3/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Fighter/).length).toBeGreaterThan(0)
    expect(screen.getByText('Neutral')).toBeInTheDocument()
  })

  it('shows ability scores and modifiers', () => {
    render(<CharacterSheet />)

    expect(screen.getByText('STR')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
    expect(screen.getByText('DEX')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
  })

  it('allows editing stats and calls updateCharacter', async () => {
    const user = userEvent.setup()
    render(<CharacterSheet />)

    const editButton = screen.getByRole('button', { name: /edit stats/i })
    await user.click(editButton)

    const strengthInput = screen.getByDisplayValue('16') as HTMLInputElement
    await user.clear(strengthInput)
    await user.type(strengthInput, '17')

    expect(updateCharacter).toHaveBeenCalled()
    const lastCall = updateCharacter.mock.calls.at(-1)
    expect(lastCall?.[0]).toBe(baseCharacter.id)
    expect(lastCall?.[1]?.attributes?.STR).toBeGreaterThan(16)
  })
})
