import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import MoveChips from '../MoveChips'

describe('MoveChips', () => {
  it('rolls immediately when a move has a predefined stat', () => {
    const onRoll = vi.fn()
    render(
      <MoveChips
        moves={[{ id: 'hack', name: 'Hack & Slash', stat: 'STR' }]}
        onRoll={onRoll}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Hack & Slash/i }))

    expect(onRoll).toHaveBeenCalledWith({
      moveId: 'hack',
      name: 'Hack & Slash',
      stat: 'STR',
    })
  })

  it('opens the stat picker when a move needs a chosen stat', async () => {
    const onRoll = vi.fn()
    render(
      <MoveChips
        moves={[{ id: 'defy-danger', name: 'Defy Danger', stat: null }]}
        onRoll={onRoll}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Defy Danger/i }))

    const dexOption = await screen.findByRole('button', { name: 'DEX' })
    fireEvent.click(dexOption)

    expect(onRoll).toHaveBeenCalledWith({
      moveId: 'defy-danger',
      name: 'Defy Danger',
      stat: 'DEX',
    })
  })
})
