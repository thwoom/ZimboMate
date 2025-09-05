/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { GameStoreProvider } from '../../src/store/GameStore'
import { usePanelState } from '../../src/hooks/usePanelState'
import { act } from 'react'

function Comp() {
  const [state, setState] = usePanelState('panel-x', { expanded: false })
  return React.createElement('button', {
    onClick: () => setState({ expanded: !state.expanded }),
    'data-expanded': String(state.expanded),
  }, 'toggle')
}

describe('usePanelState', () => {
  it('persists and updates panel state', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(GameStoreProvider, null, React.createElement(Comp)))
    })
    const btn = container.querySelector('button') as HTMLButtonElement | null
    expect(!!btn).toBe(true)
    expect(btn!.getAttribute('data-expanded')).toBe('false')
    await act(async () => {
      btn!.click()
    })
    expect(btn!.getAttribute('data-expanded')).toBe('true')
  })
})


