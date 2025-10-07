import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth, USER_STORAGE_KEY } from '../AuthContext'
import { AuthProvider } from '../AuthProvider'

describe('auth context', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('throws when used outside of AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      /useAuth must be used within an AuthProvider/,
    )
  })

  it('exposes default auth state and handles login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      const loginPromise = result.current.login({
        name: 'Test User',
        email: 'test@example.com',
      })
      await vi.runAllTimersAsync()
      await loginPromise
    })

    expect(result.current.user?.name).toBe('Test User')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(window.localStorage.getItem(USER_STORAGE_KEY)).toContain('Test User')
  })

  it('logs out and clears stored user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      const loginPromise = result.current.login({ name: 'Player One' })
      await vi.runAllTimersAsync()
      await loginPromise
    })

    expect(window.localStorage.getItem(USER_STORAGE_KEY)).not.toBeNull()

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(window.localStorage.getItem(USER_STORAGE_KEY)).toBeNull()
  })
})
