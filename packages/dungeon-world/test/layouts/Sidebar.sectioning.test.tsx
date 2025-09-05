/* @vitest-environment jsdom */
import React from 'react'
import { describe, it, expect } from 'vitest'
import ReactDOM from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import App from '../../src/App'

function nextTick() { return new Promise<void>(r => queueMicrotask(() => r())) }

// Shim matchMedia for ThemeService
if (!(window as any).matchMedia) {
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })
}

describe('Sidebar sectioning (stable)', () => {
  it('renders nav with section headers', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactDOM.createRoot(container)
    await act(async () => {
      root.render(React.createElement(App))
    })
    await nextTick()

    const nav = container.querySelector('.sidebar__nav')
    expect(!!nav).toBe(true)

    const headers = Array.from(container.querySelectorAll('.sidebar__section-header')) as HTMLButtonElement[]
    expect(headers.length > 0).toBe(true)

    root.unmount()
  })
})


