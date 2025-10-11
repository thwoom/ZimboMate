import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import InlineCounters from '../widgets/InlineCounters'

const baseProps = {
  armor: 1,
  ammo: 2,
  hold: 0,
  hp: { current: 9, max: 10 },
  xp: 3,
}

describe('inline counters', () => {
  it('emits bounded HP adjustments and ignores overflows', async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()

    const { rerender } = render(
      <InlineCounters
        {...baseProps}
        hp={{ current: 9, max: 10 }}
        onAdjust={onAdjust}
      />,
    )

    await user.click(screen.getByRole('button', { name: /increase hp/i }))
    expect(onAdjust).toHaveBeenLastCalledWith({ kind: 'hp', delta: 1 })

    rerender(
      <InlineCounters
        {...baseProps}
        hp={{ current: 10, max: 10 }}
        onAdjust={onAdjust}
      />,
    )

    await user.click(screen.getByRole('button', { name: /increase hp/i }))
    expect(onAdjust).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /decrease hp/i }))
    expect(onAdjust).toHaveBeenCalledTimes(2)
    expect(onAdjust).toHaveBeenLastCalledWith({ kind: 'hp', delta: -1 })

    rerender(
      <InlineCounters
        {...baseProps}
        hp={{ current: 0, max: 10 }}
        onAdjust={onAdjust}
      />,
    )

    await user.click(screen.getByRole('button', { name: /decrease hp/i }))
    expect(onAdjust).toHaveBeenCalledTimes(2)
  })

  it('emits XP decrement only when XP is available', async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()

    const { rerender } = render(
      <InlineCounters {...baseProps} xp={2} onAdjust={onAdjust} />,
    )

    await user.click(screen.getByRole('button', { name: /decrease xp/i }))
    expect(onAdjust).toHaveBeenCalledWith({ kind: 'xp', delta: -1 })

    rerender(<InlineCounters {...baseProps} xp={0} onAdjust={onAdjust} />)

    await user.click(screen.getByRole('button', { name: /decrease xp/i }))
    expect(onAdjust).toHaveBeenCalledTimes(1)
  })

  it('supports ammo and hold deltas with guards', async () => {
    const user = userEvent.setup()
    const onAdjust = vi.fn()

    const { rerender } = render(
      <InlineCounters {...baseProps} ammo={1} hold={0} onAdjust={onAdjust} />,
    )

    await user.click(screen.getByRole('button', { name: /decrease ammo/i }))
    expect(onAdjust).toHaveBeenCalledWith({ kind: 'ammo', delta: -1 })

    rerender(
      <InlineCounters {...baseProps} ammo={0} hold={0} onAdjust={onAdjust} />,
    )

    await user.click(screen.getByRole('button', { name: /decrease ammo/i }))
    expect(onAdjust).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /increase hold/i }))
    expect(onAdjust).toHaveBeenCalledTimes(2)
    expect(onAdjust).toHaveBeenLastCalledWith({ kind: 'hold', delta: 1 })

    await user.click(screen.getByRole('button', { name: /decrease hold/i }))
    expect(onAdjust).toHaveBeenCalledTimes(2)
  })
})
