/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import Tooltip from '../../src/components/Tooltip'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('Tooltip', () => {
  it('adds aria-describedby when visible', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(Tooltip, { content: 'hello' }, React.createElement('button', null, 'btn')),
      )
      await nextTick()
    })
    const btn = container.querySelector('button') as HTMLButtonElement | null
    expect(!!btn).toBe(true)
    await act(async () => {
      btn!.focus()
      await nextTick()
    })
    const describedby = btn!.getAttribute('aria-describedby')
    expect(!!describedby).toBe(true)
  })
})


