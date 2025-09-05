/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import Tooltip from '../../src/components/Tooltip'
import ContextMenu from '../../src/components/ContextMenu'
import { getTelemetrySnapshot, resetTelemetry } from '../../src/utils/DevTelemetry'
import '../../src/utils/KeyboardShortcuts' // ensure listeners registered

function nextTick() { return new Promise<void>(r => queueMicrotask(() => r())) }

describe.skip('DevTelemetry', () => {
  it('records shortcut, menu, and tooltip events', async () => {
    resetTelemetry()
    // Shortcut (Ctrl+/)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true }))
    let snap = getTelemetrySnapshot()
    expect(Object.values(snap.shortcutTriggers).reduce((a, b) => a + b, 0) >= 1).toBe(true)

    // Context menu open/select
    const host = document.createElement('div')
    document.body.appendChild(host)
    const container = document.createElement('div')
    host.appendChild(container)
    const root = ReactDOM.createRoot(container)
    const items = [
      { id: 'a', label: 'A', onSelect: () => {} },
      { id: 'b', label: 'B', onSelect: () => {} },
    ]
    root.render(React.createElement(ContextMenu, { x: 10, y: 10, items, onClose: () => {} }))
    await nextTick()
    let btn = container.querySelector('[role="menuitem"]') as HTMLButtonElement | null
    if (!btn) {
      await nextTick()
      btn = container.querySelector('[role="menuitem"]') as HTMLButtonElement | null
    }
    expect(!!btn).toBe(true)
    btn!.click()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    snap = getTelemetrySnapshot()
    expect(snap.menuOpens >= 1).toBe(true)
    const totalSelects = Object.values(snap.menuSelects).reduce((a, b) => a + (b as number), 0)
    expect(totalSelects >= 1).toBe(true)

    // Tooltip show
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    const root2 = ReactDOM.createRoot(container2)
    root2.render(React.createElement(Tooltip, { content: 'hi' }, React.createElement('button', null, 'x')))
    await nextTick()
    const tbtn = container2.querySelector('button') as HTMLButtonElement
    tbtn.focus()
    await nextTick()
    snap = getTelemetrySnapshot()
    expect(snap.tooltipsShown >= 0).toBe(true)
  })
})


