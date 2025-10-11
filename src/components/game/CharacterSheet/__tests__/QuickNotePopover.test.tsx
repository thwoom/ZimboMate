import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import QuickNotePopover from '../widgets/QuickNotePopover'

describe('quick note popover', () => {
  it('submits trimmed notes and closes after save', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <QuickNotePopover title=' Rescue Log ' onSubmit={handleSubmit}>
        <button type='button'>Add note</button>
      </QuickNotePopover>,
    )

    await user.click(screen.getByRole('button', { name: 'Add note' }))

    const textarea = await screen.findByPlaceholderText(
      'Keep it short and actionable.',
    )
    await user.type(textarea, '  Found the hidden vault.  ')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(handleSubmit).toHaveBeenCalledWith({
      title: 'Rescue Log',
      body: 'Found the hidden vault.',
    })

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Keep it short and actionable.'),
      ).toBeNull()
    })
  })

  it('keeps popover open while saving asynchronously', async () => {
    const user = userEvent.setup()
    let resolveSubmit: () => void
    const handleSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )

    render(
      <QuickNotePopover onSubmit={handleSubmit}>
        <button type='button'>Add note</button>
      </QuickNotePopover>,
    )

    await user.click(screen.getByRole('button', { name: 'Add note' }))
    const textarea = await screen.findByPlaceholderText(
      'Keep it short and actionable.',
    )
    await user.type(textarea, 'Delayed save')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()

    await act(async () => {
      resolveSubmit?.()
    })

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /saving/i })).toBeNull()
    })
  })
})
