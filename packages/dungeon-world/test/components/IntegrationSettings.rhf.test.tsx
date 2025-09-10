/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import IntegrationSettings from '../../src/panels/SettingsPanel/IntegrationSettings'
import { GameStoreProvider } from '../../src/store/GameStore'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('IntegrationSettings (RHF + Zod)', () => {
  it('validates tooltip delay and disables Apply until dirty', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(GameStoreProvider, {},
          React.createElement(IntegrationSettings as any),
        ),
      )
      await nextTick()
    })

    const apply = container.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(apply?.disabled).toBe(true)

    const input = container.querySelector('input[type="number"]') as HTMLInputElement
    input.value = '-1'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await act(async () => { await nextTick() })

    expect(apply?.disabled).toBe(false)
  })
})


