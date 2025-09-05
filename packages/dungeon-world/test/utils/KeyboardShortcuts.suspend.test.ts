/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { registerShortcut } from '../../src/utils/KeyboardShortcuts'

describe('KeyboardShortcuts suspension', () => {
  it('does not trigger when a dialog is present', () => {
    const fn = vi.fn()
    const unregister = registerShortcut({ combo: 'x', handler: fn })
    // add a dialog element
    const dlg = document.createElement('div')
    dlg.setAttribute('role', 'dialog')
    document.body.appendChild(dlg)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))
    expect(fn).not.toHaveBeenCalled()
    unregister()
    dlg.remove()
  })
})


