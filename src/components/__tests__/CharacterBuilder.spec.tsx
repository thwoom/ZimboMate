import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CharacterBuilder } from '../game/creation/CharacterBuilder'

describe('characterBuilder', () => {
  beforeEach(() => {
    // Use REAL localStorage for realistic testing
    vi.useRealTimers()
    localStorage.clear()
  })

  it('renders CharacterBuilder form without hanging', () => {
    render(<CharacterBuilder />)
    expect(screen.getByText('Character Builder')).toBeInTheDocument()
  })

  it('persists a draft to localStorage when clicking Save Draft', () => {
    render(<CharacterBuilder />)

    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }))

    // Check REAL localStorage - not mocked
    const draftData = localStorage.getItem('zmbv2-character-builder-draft')
    expect(draftData).toBeTruthy()
    expect(JSON.parse(draftData).class).toBe('Wizard')
  })
})
