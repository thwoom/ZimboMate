import { createContext, use } from 'react'
import { logger } from '@/utils/logger'

export interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  preferences: {
    theme: string
    language: string
    timezone: string
  }
  createdAt: Date
  lastActive: Date
}

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: { name: string; email?: string }) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

export const USER_STORAGE_KEY = 'zimbomate-user'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export function getCurrentUserId(): string | null {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)

    if (storedUser) {
      const userData = JSON.parse(storedUser)
      return userData.id
    }
  } catch (error) {
    logger.warn({ error }, 'Failed to get current user ID')
  }

  return null
}

export function createGuestUser(): User {
  return {
    id: `guest-${Date.now()}`,
    name: 'Guest Player',
    preferences: {
      theme: 'fantasy',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    createdAt: new Date(),
    lastActive: new Date(),
  }
}
