import React from 'react'
import { render, screen, waitFor, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Tooltip from '@radix-ui/react-tooltip'

// Test utilities for ZimboMate V2
interface TestWrapperProps {
  children: React.ReactNode
  theme?: 'fantasy' | 'dark' | 'light'
  withErrorBoundary?: boolean
  withQueryClient?: boolean
  withTooltips?: boolean
}

// Custom test wrapper with all providers
const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  theme = 'fantasy',
  withErrorBoundary = true,
  withQueryClient = true,
  withTooltips = true
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  let wrappedChildren = children

  // Wrap with QueryClient if needed
  if (withQueryClient) {
    wrappedChildren = (
      <QueryClientProvider client={queryClient}>
        {wrappedChildren}
      </QueryClientProvider>
    )
  }

  // Wrap with Tooltips if needed
  if (withTooltips) {
    wrappedChildren = (
      <Tooltip.Provider delayDuration={0}>
        {wrappedChildren}
      </Tooltip.Provider>
    )
  }

  // Wrap with ThemeProvider
  wrappedChildren = (
    <ThemeProvider defaultTheme={theme}>
      {wrappedChildren}
    </ThemeProvider>
  )

  // Wrap with ErrorBoundary if needed
  if (withErrorBoundary) {
    wrappedChildren = (
      <ErrorBoundary>
        {wrappedChildren}
      </ErrorBoundary>
    )
  }

  return <>{wrappedChildren}</>
}

// Enhanced render function with custom wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'fantasy' | 'dark' | 'light'
  withErrorBoundary?: boolean
  withQueryClient?: boolean
  withTooltips?: boolean
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    theme = 'fantasy',
    withErrorBoundary = true,
    withQueryClient = true,
    withTooltips = true,
    ...renderOptions
  } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper
      theme={theme}
      withErrorBoundary={withErrorBoundary}
      withQueryClient={withQueryClient}
      withTooltips={withTooltips}
    >
      {children}
    </TestWrapper>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Mock data generators for testing
export const mockCharacter = {
  id: 'test-char-1',
  name: 'Test Hero',
  class: 'fighter',
  level: 3,
  hp: { current: 20, max: 25 },
  stats: {
    strength: { value: 16, modifier: 2 },
    dexterity: { value: 14, modifier: 1 },
    constitution: { value: 15, modifier: 1 },
    intelligence: { value: 12, modifier: 0 },
    wisdom: { value: 13, modifier: 1 },
    charisma: { value: 11, modifier: 0 }
  },
  load: { current: 8, max: 12 },
  inventory: [
    {
      id: 'sword',
      name: 'Iron Sword',
      description: 'A sturdy iron sword',
      category: 'weapon',
      weight: 2,
      equipped: true,
      damage: '1d8',
      tags: ['close', 'messy']
    }
  ]
}

export const mockCampaign = {
  id: 'test-campaign-1',
  name: 'Test Adventure',
  description: 'A test campaign for unit testing',
  createdAt: new Date('2024-01-01'),
  sessions: [],
  npcs: [],
  locations: []
}

// Test utilities for async operations
export const waitForLoadingToFinish = () =>
  waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument())

export const waitForErrorToAppear = () =>
  waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

// Keyboard testing utilities
export const pressKey = async (user: ReturnType<typeof userEvent.setup>, key: string) => {
  await user.keyboard(`{${key}}`)
}

export const pressKeyCombo = async (
  user: ReturnType<typeof userEvent.setup>,
  ...keys: string[]
) => {
  await user.keyboard(`{${keys.join('+')}}`)
}

// Dice roll testing utilities
export const mockDiceRoll = (result: number) => {
  const originalRandom = Math.random
  Math.random = () => (result - 1) / 6 // Adjust for 2d6 system
  return () => {
    Math.random = originalRandom
  }
}

// Animation testing utilities
export const skipAnimations = () => {
  const originalRAF = window.requestAnimationFrame
  const originalCAF = window.cancelAnimationFrame
  
  window.requestAnimationFrame = (callback) => {
    callback(0)
    return 0
  }
  window.cancelAnimationFrame = () => {}
  
  return () => {
    window.requestAnimationFrame = originalRAF
    window.cancelAnimationFrame = originalCAF
  }
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now()
  renderFn()
  await waitFor(() => {}) // Wait for render to complete
  const end = performance.now()
  return end - start
}

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  // Check for basic accessibility requirements
  const issues: string[] = []
  
  // Check for missing alt text on images
  const images = container.querySelectorAll('img')
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push(`Image ${index + 1} missing alt text`)
    }
  })
  
  // Check for missing labels on form elements
  const inputs = container.querySelectorAll('input, select, textarea')
  inputs.forEach((input, index) => {
    const hasLabel = input.getAttribute('aria-label') || 
                    input.getAttribute('aria-labelledby') ||
                    container.querySelector(`label[for="${input.id}"]`)
    
    if (!hasLabel) {
      issues.push(`Form element ${index + 1} missing label`)
    }
  })
  
  // Check for proper heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  let lastLevel = 0
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    if (level > lastLevel + 1) {
      issues.push(`Heading ${index + 1} skips levels (h${lastLevel} to h${level})`)
    }
    lastLevel = level
  })
  
  return issues
}

// Custom matchers for testing
export const customMatchers = {
  toHaveAccessibleName: (element: HTMLElement, expectedName: string) => {
    const accessibleName = element.getAttribute('aria-label') ||
                          element.getAttribute('aria-labelledby') ||
                          element.textContent
    
    return {
      pass: accessibleName === expectedName,
      message: () => `Expected element to have accessible name "${expectedName}", got "${accessibleName}"`
    }
  },
  
  toBeWithinPerformanceBudget: (renderTime: number, budget: number) => {
    return {
      pass: renderTime <= budget,
      message: () => `Expected render time ${renderTime}ms to be within budget ${budget}ms`
    }
  }
}

// Test data factories
export const createMockCharacter = (overrides: Partial<typeof mockCharacter> = {}) => ({
  ...mockCharacter,
  ...overrides,
  id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
})

export const createMockCampaign = (overrides: Partial<typeof mockCampaign> = {}) => ({
  ...mockCampaign,
  ...overrides,
  id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
})

// Integration test helpers
export const simulateUserFlow = {
  createCharacter: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /create character/i }))
    await user.type(screen.getByLabelText(/character name/i), 'Test Hero')
    await user.selectOptions(screen.getByLabelText(/class/i), 'fighter')
    await user.click(screen.getByRole('button', { name: /create/i }))
    await waitForLoadingToFinish()
  },
  
  rollDice: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /roll dice/i }))
    await waitFor(() => expect(screen.getByText(/result/i)).toBeInTheDocument())
  },
  
  equipItem: async (user: ReturnType<typeof userEvent.setup>, itemName: string) => {
    const item = screen.getByText(itemName)
    await user.click(item)
    await user.click(screen.getByRole('button', { name: /equip/i }))
  }
}

// Mock implementations for external dependencies
export const mockImplementations = {
  // Mock Three.js for 3D components
  mockThreeJS: () => {
    // This should be handled at the test file level with vi.mock()
    return {
      Scene: vi.fn(),
      PerspectiveCamera: vi.fn(),
      WebGLRenderer: vi.fn(() => ({
        setSize: vi.fn(),
        render: vi.fn(),
        domElement: document.createElement('canvas')
      })),
      BoxGeometry: vi.fn(),
      MeshBasicMaterial: vi.fn(),
      Mesh: vi.fn()
    }
  },

  // Mock Howler for audio
  mockHowler: () => {
    return {
      Howl: vi.fn(() => ({
        play: vi.fn(),
        stop: vi.fn(),
        volume: vi.fn()
      }))
    }
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
    return localStorageMock
  }
}

// Test setup and teardown utilities
export const setupTestEnvironment = () => {
  // Mock implementations
  mockImplementations.mockLocalStorage()
  
  // Skip animations for faster tests
  const restoreAnimations = skipAnimations()
  
  // Setup performance monitoring
  const performanceEntries: PerformanceEntry[] = []
  const originalMark = performance.mark
  performance.mark = (name: string) => {
    performanceEntries.push({ name, startTime: performance.now() } as PerformanceEntry)
    return originalMark.call(performance, name)
  }
  
  return {
    cleanup: () => {
      restoreAnimations()
      performance.mark = originalMark
    },
    getPerformanceEntries: () => performanceEntries
  }
}

export default {
  renderWithProviders,
  mockCharacter,
  mockCampaign,
  waitForLoadingToFinish,
  waitForErrorToAppear,
  pressKey,
  pressKeyCombo,
  mockDiceRoll,
  skipAnimations,
  measureRenderTime,
  checkAccessibility,
  customMatchers,
  createMockCharacter,
  createMockCampaign,
  simulateUserFlow,
  mockImplementations,
  setupTestEnvironment
}