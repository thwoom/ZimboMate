import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('applies a starter template from the quick actions', async () => {
    const user = userEvent.setup()
    render(<CharacterBuilder />)

    const [templateButton] = screen.getAllByRole('button', {
      name: /load template/i,
    })
    await user.click(templateButton)

    const templateOption = await screen.findByTestId(
      'character-template-kara-stonewarden',
    )
    await user.click(templateOption)

    const reviewIntro = screen.getByText(
      'Review your character and click Create.',
    )
    const reviewList = reviewIntro.nextElementSibling as HTMLElement
    const summaryItems = within(reviewList)
      .getAllByRole('listitem')
      .map((item) => item.textContent ?? '')

    expect(summaryItems.some((text) => text.includes('Kara Stonewarden'))).toBe(
      true,
    )
    expect(
      summaryItems.some(
        (text) => text.includes('Class') && text.includes('Fighter'),
      ),
    ).toBe(true)
  })

  it('randomizes a character draft with deterministic output when Math.random is stubbed', () => {
    const sequence = [
      0.02, // class -> Fighter
      0.1, // race -> Human
      0.3, // alignment -> Lawful
      0.4, // name -> Borin Ironhide
      0.5, // look -> Weathered face...
      0.05,
      0.25,
      0.75,
      0.33,
      0.6, // attribute shuffles
      0.15,
      0.45,
      0.23, // bond shuffle
      0.56,
      0.78, // bond id generation
    ]
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockImplementation(() => (sequence.shift() ?? 0.42))

    try {
      render(<CharacterBuilder />)

      const [randomizeButton] = screen.getAllByTestId('character-randomize')
      fireEvent.click(randomizeButton)

      const reviewIntro = screen.getByText(
        'Review your character and click Create.',
      )
      const reviewList = reviewIntro.nextElementSibling as HTMLElement
      const summaryItems = within(reviewList)
        .getAllByRole('listitem')
        .map((item) => item.textContent ?? '')

      expect(summaryItems.some((text) => text.includes('Borin Ironhide'))).toBe(
        true,
      )
      expect(
        summaryItems.some(
          (text) => text.includes('Class') && text.includes('Fighter'),
        ),
      ).toBe(true)
      expect(
        summaryItems.some(
          (text) => text.includes('Alignment') && text.includes('Lawful'),
        ),
      ).toBe(true)
    } finally {
      randomSpy.mockRestore()
    }
  })
})
