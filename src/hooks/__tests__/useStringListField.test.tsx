import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useStringListField } from '../useStringListField'

describe('useStringListField', () => {
  it('initialises with normalised values', () => {
    const { result } = renderHook(() => useStringListField([' Alpha ', 'beta', 'ALPHA']))

    expect(result.current.items).toEqual(['alpha', 'beta'])
  })

  it('adds unique values until the limit is reached', () => {
    const { result } = renderHook(() => useStringListField([], { limit: 2 }))

    act(() => {
      expect(result.current.addItem('Ranger')).toBe(true)
      expect(result.current.addItem('ranger')).toBe(false)
      expect(result.current.addItem('Wizard')).toBe(true)
      expect(result.current.addItem('Cleric')).toBe(false)
    })

    expect(result.current.items).toEqual(['ranger', 'wizard'])
    expect(result.current.canAddMore).toBe(false)
  })

  it('removes values using the normaliser', () => {
    const { result } = renderHook(() => useStringListField(['scout', 'mage']))

    act(() => {
      result.current.removeItem(' Mage ')
    })

    expect(result.current.items).toEqual(['scout'])
  })

  it('replaces all values with a deduplicated, normalised list respecting the limit', () => {
    const { result } = renderHook(() => useStringListField(['initial'], { limit: 2 }))

    act(() => {
      result.current.replaceAll([' Bard ', 'BARD', 'Cleric'])
    })

    expect(result.current.items).toEqual(['bard', 'cleric'])
  })

  it('resets to the original initial values', () => {
    const { result } = renderHook(() => useStringListField(['ranger']))

    act(() => {
      result.current.addItem('fighter')
      result.current.reset()
    })

    expect(result.current.items).toEqual(['ranger'])
  })
})
