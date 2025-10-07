import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from '../../../stores/themeStore'
import { useTheme } from '../ThemeContext'
import { ThemeProvider } from '../ThemeProvider'

describe('theme context', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )

  beforeEach(() => {
    window.localStorage.clear()
    useThemeStore.setState({ animations: true, sounds: true })
  })

  it('throws when used outside of ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      /useTheme must be used within a ThemeProvider/,
    )
  })

  it('exposes store values and toggles', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('matsu')
    expect(result.current.animations).toBe(true)
    expect(result.current.sounds).toBe(true)

    act(() => {
      result.current.toggleAnimations()
    })

    expect(result.current.animations).toBe(false)

    act(() => {
      result.current.toggleSounds()
    })

    expect(result.current.sounds).toBe(false)
  })
})
