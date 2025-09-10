/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react'
import ConditionalContentSettings from '../../src/panels/SettingsPanel/ConditionalContentSettings'
import { GameStoreProvider } from '../../src/store/GameStore'

function nextTick() {
  return new Promise<void>(resolve => queueMicrotask(() => resolve()))
}

describe('ConditionalContentSettings (RHF + Zod)', () => {
  it('enables Apply when toggling a checkbox', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(
        React.createElement(GameStoreProvider, {},
          React.createElement(ConditionalContentSettings as any),
        ),
      )
      await nextTick()
    })

    const apply = container.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(apply?.disabled).toBe(true)

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    checkbox.click()
    await act(async () => { await nextTick() })

    expect(apply?.disabled).toBe(false)
  })
})


