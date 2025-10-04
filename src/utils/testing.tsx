import type { RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { vi } from 'vitest'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import { ThemeProvider } from '../components/ui/ThemeProvider'
import { TooltipProvider } from '../components/ui/tooltip'

// Test utilities for ZimboMate V2
// Enhanced render function with custom wrapper
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'matsu'
  withErrorBoundary?: boolean
  withQueryClient?: boolean
  withTooltips?: boolean
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const {
    theme = 'matsu',
    withErrorBoundary = true,
    withQueryClient = true,
    withTooltips = true,
    ...renderOptions
  } = options

  const queryClient = withQueryClient
    ? new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
          },
        },
      })
    : null

  const wrapWithProviders = (children: React.ReactNode) => {
    let content = children

    if (withQueryClient && queryClient) {
      content = (
        <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
      )
    }

    if (withTooltips) {
      content = (
        <TooltipProvider delayDuration={0}>{content}</TooltipProvider>
      )
    }

    content = <ThemeProvider defaultTheme={theme}>{content}</ThemeProvider>

    if (withErrorBoundary) {
      content = <ErrorBoundary>{content}</ErrorBoundary>
    }

    return <>{content}</>
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    wrapWithProviders(children)

  return {
    user: userEvent.setup({ writeToClipboard: false }),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Mock data generators for testing
export const mockCharacter = {
  id: 'test-char-1',
  name: 'Test Hero',
  class: 'Fighter',
  level: 3,
  xp: 7,
  alignment: 'Neutral',
  hp: { current: 20, max: 25 },
  load: { current: 8, max: 12 },
  attributes: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 12,
    WIS: 13,
    CHA: 11,
  },
  stats: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 12,
    WIS: 13,
    CHA: 11,
  },
  debilities: {
    weak: false,
    shaky: false,
    sick: false,
    stunned: false,
    confused: false,
    scarred: false,
  },
  bonds: [
    { id: 'bond-1', text: 'I owe Althea my life.', resolved: false },
    {
      id: 'bond-2',
      text: 'I will prove myself to the guild.',
      resolved: false,
    },
  ],
  inventory: [
    {
      id: 'sword',
      name: 'Iron Sword',
      description: 'A sturdy iron sword',
      category: 'weapon',
      weight: 2,
      equipped: true,
      damage: '1d8',
      tags: ['close', 'messy'],
    },
  ],
}

export const mockCampaign = {
  id: 'test-campaign-1',
  name: 'Test Adventure',
  description: 'A test campaign for unit testing',
  createdAt: new Date('2024-01-01'),
  sessions: [],
  npcs: [],
  locations: [],
}

// Test utilities for async operations
export function waitForLoadingToFinish() {
  return waitFor(() =>
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(),
  )
}

export function waitForErrorToAppear() {
  return waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
}

// Keyboard testing utilities
export async function pressKey(
  user: ReturnType<typeof userEvent.setup>,
  key: string,
) {
  await user.keyboard(`{${key}}`)
}

export async function pressKeyCombo(
  user: ReturnType<typeof userEvent.setup>,
  ...keys: string[]
) {
  await user.keyboard(`{${keys.join('+')}}`)
}

// Dice roll testing utilities
export function mockDiceRoll(result: number) {
  const originalRandom = Math.random
  Math.random = () => (result - 1) / 6 // Adjust for 2d6 system
  return () => {
    Math.random = originalRandom
  }
}

// Animation testing utilities
export function skipAnimations() {
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
export async function measureRenderTime(renderFn: () => void): Promise<number> {
  const start = performance.now()
  renderFn()
  await waitFor(() => {}) // Wait for render to complete
  const end = performance.now()
  return end - start
}

// Accessibility testing utilities
export async function checkAccessibility(container: HTMLElement) {
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
    const hasLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`)

    if (!hasLabel) {
      issues.push(`Form element ${index + 1} missing label`)
    }
  })

  // Check for proper heading hierarchy
  const headings = Array.from(
    container.querySelectorAll('h1, h2, h3, h4, h5, h6'),
  )
  let lastLevel = 0
  headings.forEach((heading, index) => {
    const level = Number.parseInt(heading.tagName.charAt(1))
    if (level > lastLevel + 1) {
      issues.push(
        `Heading ${index + 1} skips levels (h${lastLevel} to h${level})`,
      )
    }
    lastLevel = level
  })

  return issues
}

// Custom matchers for testing
export const customMatchers = {
  toHaveAccessibleName: (element: HTMLElement, expectedName: string) => {
    const accessibleName =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent

    return {
      pass: accessibleName === expectedName,
      message: () =>
        `Expected element to have accessible name "${expectedName}", got "${accessibleName}"`,
    }
  },

  toBeWithinPerformanceBudget: (renderTime: number, budget: number) => {
    return {
      pass: renderTime <= budget,
      message: () =>
        `Expected render time ${renderTime}ms to be within budget ${budget}ms`,
    }
  },
}

// Test data factories
export function createMockCharacter(
  overrides: Partial<typeof mockCharacter> = {},
) {
  return {
    ...mockCharacter,
    ...overrides,
    id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
}

export function createMockCampaign(
  overrides: Partial<typeof mockCampaign> = {},
) {
  return {
    ...mockCampaign,
    ...overrides,
    id: `campaign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
}

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

  equipItem: async (
    user: ReturnType<typeof userEvent.setup>,
    itemName: string,
  ) => {
    const item = screen.getByText(itemName)
    await user.click(item)
    await user.click(screen.getByRole('button', { name: /equip/i }))
  },
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
        domElement: document.createElement('canvas'),
      })),
      BoxGeometry: vi.fn(),
      MeshBasicMaterial: vi.fn(),
      Mesh: vi.fn(),
    }
  },

  // Mock Howler for audio
  mockHowler: () => {
    return {
      Howl: vi.fn(() => ({
        play: vi.fn(),
        stop: vi.fn(),
        volume: vi.fn(),
      })),
    }
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
    return localStorageMock
  },
}

// Test setup and teardown utilities
export function setupTestEnvironment() {
  // Mock implementations
  mockImplementations.mockLocalStorage()

  // Skip animations for faster tests
  const restoreAnimations = skipAnimations()

  // Setup performance monitoring
  const performanceEntries: PerformanceEntry[] = []
  const originalMark = performance.mark
  performance.mark = (name: string) => {
    performanceEntries.push({
      name,
      startTime: performance.now(),
    } as PerformanceEntry)
    return originalMark.call(performance, name)
  }

  return {
    cleanup: () => {
      restoreAnimations()
      performance.mark = originalMark
    },
    getPerformanceEntries: () => performanceEntries,
  }
}

export const testingUtils = {
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
  setupTestEnvironment,
}
