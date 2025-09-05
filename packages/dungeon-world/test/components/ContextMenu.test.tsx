/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import ContextMenu from '../../src/components/ContextMenu'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('ContextMenu', () => {
  it('navigates items with arrow keys and selects with Enter', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    const onClose = vi.fn()
    const onSelect = vi.fn()
    await act(async () => {
      root.render(
        React.createElement(ContextMenu, {
          x: 10,
          y: 10,
          onClose,
          items: [
            { id: 'a', label: 'First', onSelect },
            { id: 'b', label: 'Second', onSelect },
          ],
        }),
      )
      await nextTick()
    })
    const menu = container.querySelector('[role="menu"]') as HTMLElement
    expect(!!menu).toBe(true)
    const key = (k: string) => window.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
    key('ArrowDown')
    key('Enter')
    expect(onSelect).toHaveBeenCalled()
  })
})


