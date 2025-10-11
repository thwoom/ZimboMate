import type { AuthContextValue, User } from './AuthContext'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { logger } from '@/utils/logger'
import { AuthContext, USER_STORAGE_KEY } from './AuthContext'

interface AuthState {
  user: User | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'login'; user: User }
  | { type: 'logout' }
  | { type: 'setLoading'; isLoading: boolean }
  | { type: 'touch' }
  | { type: 'update'; updates: Partial<User> }

const loadStoredUser = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, isLoading: false }
  }

  try {
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!storedUser) {
      return { user: null, isLoading: false }
    }

    const userData = JSON.parse(storedUser)
    return {
      user: {
        ...userData,
        createdAt: new Date(userData.createdAt),
        lastActive: new Date(userData.lastActive),
      },
      isLoading: false,
    }
  } catch (error) {
    logger.warn(
      { error },
      'Failed to load user data from localStorage; clearing stale entry',
    )
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return { user: null, isLoading: false }
  }
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'login':
      return { user: action.user, isLoading: false }
    case 'logout':
      return { user: null, isLoading: false }
    case 'setLoading':
      return { ...state, isLoading: action.isLoading }
    case 'touch':
      return state.user
        ? {
            ...state,
            user: { ...state.user, lastActive: new Date() },
          }
        : state
    case 'update':
      return state.user
        ? {
            ...state,
            user: { ...state.user, ...action.updates, lastActive: new Date() },
          }
        : state
    default:
      return state
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, undefined, loadStoredUser)
  const { user, isLoading } = state

  useEffect(() => {
    if (!user) {
      return undefined
    }

    const interval = window.setInterval(() => {
      dispatch({ type: 'touch' })
    }, 60000)

    return () => window.clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (user) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }

    return undefined
  }, [user])

  const login = useCallback(
    async (credentials: { name: string; email?: string }) => {
      dispatch({ type: 'setLoading', isLoading: true })

      await new Promise((resolve) => setTimeout(resolve, 500))

      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: credentials.name,
        email: credentials.email,
        preferences: {
          theme: 'fantasy',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        createdAt: new Date(),
        lastActive: new Date(),
      }

      dispatch({ type: 'login', user: newUser })
    },
    [],
  )

  const logout = useCallback(() => {
    dispatch({ type: 'logout' })

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('zimbomate-characters')
      window.localStorage.removeItem('zimbomate-campaigns')
      window.localStorage.removeItem('zimbomate-preferences')
    }
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'update', updates })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
      isLoading,
    }),
    [isLoading, login, logout, updateUser, user],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
