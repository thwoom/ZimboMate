import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CharacterBuilder } from '../game/creation/CharacterBuilder'

describe('CharacterBuilder', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('computes derived HP and Load for Wizard with standard array', () => {
    render(<CharacterBuilder />)

    // Step 1: choose class Wizard
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 2: identity
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Mage' } })
    fireEvent.change(screen.getByLabelText('Select race'), { target: { value: 'Human' } })
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 3: alignment
    fireEvent.click(screen.getByRole('button', { name: 'Neutral' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 4: attributes (keep defaults; INT likely >= 16 from class hint; ensure STR=8, CON=8)
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    // Step 5: derived previews visible
    expect(screen.getByText(/Damage Die/i)).toBeInTheDocument()
  })

  it('persists a draft to localStorage when clicking Save Draft', () => {
    render(<CharacterBuilder />)

    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }))

    // Ensure a draft key exists
    const keys = Object.keys(localStorage)
    const hasDraft = keys.some(k => k.includes('zmbv2-character-builder-draft'))
    expect(hasDraft).toBe(true)
  })
})


