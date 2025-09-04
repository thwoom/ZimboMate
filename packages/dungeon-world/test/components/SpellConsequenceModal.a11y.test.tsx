/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import SpellConsequenceModal from '../../src/components/SpellConsequenceModal'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('SpellConsequenceModal a11y/keyboard', () => {
  it('renders dialog with aria attributes and traps focus, ESC closes', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    await act(async () => {
      root.render(
        React.createElement(SpellConsequenceModal, {
          isOpen: true,
          spellName: 'Magic Missile',
          casterClass: 'Wizard',
          onConfirm,
          onCancel,
        }),
      )
      await nextTick()
    })

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(!!dialog).toBe(true)
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(!!dialog.getAttribute('aria-labelledby')).toBe(true)
    expect(!!dialog.getAttribute('aria-describedby')).toBe(true)

    const focusables = dialog.querySelectorAll<HTMLElement>('button, input')
    expect(focusables.length > 0).toBe(true)
    // simulate Tab from last to wrap to first
    focusables[focusables.length - 1].focus()
    const evt = new KeyboardEvent('keydown', { key: 'Tab' })
    document.dispatchEvent(evt)
    expect(document.activeElement === focusables[0]).toBe(true)

    // ESC closes
    const esc = new KeyboardEvent('keydown', { key: 'Escape' })
    document.dispatchEvent(esc)
    expect(onCancel).toHaveBeenCalled()
  })
})


