/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import ShortcutsOverlay from '../../src/components/ShortcutsOverlay'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('ShortcutsOverlay', () => {
  it('renders and filters list', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(ShortcutsOverlay, { onClose: () => {} }))
      await nextTick()
    })
    const dlg = container.querySelector('[role="dialog"]')
    expect(!!dlg).toBe(true)
    const input = container.querySelector('input') as HTMLInputElement
    input.value = 'ctrl'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(!!container.querySelector('.shortcuts-overlay__list')).toBe(true)
  })
})


