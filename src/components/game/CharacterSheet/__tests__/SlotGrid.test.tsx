import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import SlotGrid from '../widgets/SlotGrid'

describe('slot grid', () => {
  it('renders slots with accessible labels', () => {
    render(
      <SlotGrid
        slots={[
          { id: 'main', label: 'Main Hand' },
          { id: 'off', label: 'Off Hand', itemName: 'Iron Shield' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Main Hand: empty' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Off Hand: Iron Shield' }).className,
    ).toContain('bg-card')
  })

  it('applies error styling when requested', () => {
    render(
      <SlotGrid
        state='error'
        slots={[{ id: 'armor', label: 'Armor' }]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Armor: empty' }).className).toContain(
      'bg-destructive/10',
    )
  })
})
