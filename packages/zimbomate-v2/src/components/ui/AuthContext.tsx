import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: { name: string; email?: string }) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('zimbomate-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastActive: new Date(userData.lastActive)
          })
        }
      } catch (error) {
        console.warn('Failed to load user data from localStorage:', error)
        localStorage.removeItem('zimbomate-user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Update lastActive timestamp periodically
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setUser(prev => prev ? { ...prev, lastActive: new Date() } : null)
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [user])

  // Persist user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('zimbomate-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('zimbomate-user')
    }
  }, [user])

  const login = useCallback(async (credentials: { name: string; email?: string }) => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: credentials.name,
      email: credentials.email,
      preferences: {
        theme: 'fantasy',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      createdAt: new Date(),
      lastActive: new Date()
    }
    
    setUser(newUser)
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('zimbomate-user')
    // Clear other user-specific data
    localStorage.removeItem('zimbomate-characters')
    localStorage.removeItem('zimbomate-campaigns')
    localStorage.removeItem('zimbomate-preferences')
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates, lastActive: new Date() } : null)
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to get current user ID for services
export const getCurrentUserId = (): string | null => {
  try {
    const storedUser = localStorage.getItem('zimbomate-user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      return userData.id
    }
  } catch (error) {
    console.warn('Failed to get current user ID:', error)
  }
  return null
}

// Guest user creation for offline usage
export const createGuestUser = (): User => {
  return {
    id: `guest-${Date.now()}`,
    name: 'Guest Player',
    preferences: {
      theme: 'fantasy',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    createdAt: new Date(),
    lastActive: new Date()
  }
}