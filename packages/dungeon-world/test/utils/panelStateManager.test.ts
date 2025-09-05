/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { LocalStoragePanelStateManager } from '../../src/framework/PanelState'

describe('LocalStoragePanelStateManager', () => {
  it('saves and loads state', () => {
    const mgr = new LocalStoragePanelStateManager()
    mgr.saveState('p1', { a: 1 })
    const loaded = mgr.loadState('p1') as any
    expect(loaded.a).toBe(1)
    mgr.clearState('p1')
    const empty = mgr.loadState('p1')
    expect(empty).toBeNull()
  })
})


