/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest'
import { registerShortcut, setActiveScope } from '../../src/utils/KeyboardShortcuts'

describe('KeyboardShortcuts', () => {
  const keydown = (key: string, opts: Partial<KeyboardEvent> = {}) => {
    const event = new window.KeyboardEvent('keydown', { key, ...opts })
    window.dispatchEvent(event)
  }

  it('invokes handler for simple key', () => {
    const fn = vi.fn()
    const unregister = registerShortcut({ combo: 'k', handler: fn, preventDefault: true })
    keydown('k')
    expect(fn).toHaveBeenCalledOnce()
    unregister()
  })

  it('respects scope', async () => {
    const fn = vi.fn()
    const unregister = registerShortcut({ combo: 'm', handler: fn, scope: 'moves' })
    setActiveScope('inventory')
    keydown('m')
    expect(fn).not.toHaveBeenCalled()
    setActiveScope('moves')
    await new Promise(r => setTimeout(r, 30))
    keydown('m')
    expect(fn).toHaveBeenCalledOnce()
    unregister()
    setActiveScope(null)
  })

  it('supports ctrl modifier', async () => {
    const fn = vi.fn()
    const unregister = registerShortcut({ combo: 'ctrl+alt+k', handler: fn })
    await new Promise(r => setTimeout(r, 30))
    keydown('k', { ctrlKey: true, altKey: true })
    expect(fn).toHaveBeenCalledOnce()
    unregister()
  })
})
