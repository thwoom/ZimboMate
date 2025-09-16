import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockCharacter, setupTestEnvironment } from '../../../utils/testing'
import App from '../../../App.Complete'

// Mock all the complex 3D and audio components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ scene: {}, camera: {}, gl: {} }))
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  ContactShadows: () => <div data-testid="contact-shadows" />
}))

vi.mock('howler', () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn()
  }))
}))

describe('App Integration Tests', () => {
  let testEnv: ReturnType<typeof setupTestEnvironment>

  beforeEach(() => {
    testEnv = setupTestEnvironment()
  })

  afterEach(() => {
    testEnv.cleanup()
    vi.clearAllMocks()
  })

  describe('Tab Navigation Integration', () => {
    it('navigates between all tabs correctly', async () => {
      const { user } = renderWithProviders(<App />)

      // Start on character tab (default)
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Character')

      // Navigate to dice tab
      await user.click(screen.getByRole('tab', { name: /dice/i }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument()
      })

      // Navigate to moves tab
      await user.click(screen.getByRole('tab', { name: /moves/i }))
      await waitFor(() => {
        expect(screen.getByText(/moves/i)).toBeInTheDocument()
      })

      // Navigate to equipment tab
      await user.click(screen.getByRole('tab', { name: /equipment/i }))
      await waitFor(() => {
        expect(screen.getByText(/inventory/i)).toBeInTheDocument()
      })

      // Navigate to session tools tab
      await user.click(screen.getByRole('tab', { name: /session tools/i }))
      await waitFor(() => {
        expect(screen.getByText(/notes/i)).toBeInTheDocument()
      })

      // Navigate to campaign tab
      await user.click(screen.getByRole('tab', { name: /campaign/i }))
      await waitFor(() => {
        expect(screen.getByText(/campaign/i)).toBeInTheDocument()
      })
    })

    it('maintains state when switching tabs', async () => {
      const { user } = renderWithProviders(<App />)

      // Make changes in character tab
      const nameInput = screen.getByDisplayValue(/eldara/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Test Hero')

      // Switch to dice tab and back
      await user.click(screen.getByRole('tab', { name: /dice/i }))
      await user.click(screen.getByRole('tab', { name: /character/i }))

      // State should be preserved
      expect(screen.getByDisplayValue('Test Hero')).toBeInTheDocument()
    })
  })

  describe('Cross-Component Integration', () => {
    it('integrates character sheet with dice roller', async () => {
      const { user } = renderWithProviders(<App />)

      // Click a stat roll button in character sheet
      const strRollButton = screen.getByRole('button', { name: /roll strength/i })
      await user.click(strRollButton)

      // Should switch to dice tab with correct modifier
      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Dice')
        expect(screen.getByText(/\+1/)).toBeInTheDocument() // STR modifier
      })
    })

    it('integrates moves panel with dice roller', async () => {
      const { user } = renderWithProviders(<App />)

      // Navigate to moves tab
      await user.click(screen.getByRole('tab', { name: /moves/i }))

      // Select a move
      const hackAndSlashMove = screen.getByText(/hack and slash/i)
      await user.click(hackAndSlashMove)

      // Should switch to dice tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Dice')
      })
    })

    it('integrates session tools with roll history', async () => {
      const { user } = renderWithProviders(<App />)

      // Go to dice tab and make a roll
      await user.click(screen.getByRole('tab', { name: /dice/i }))
      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      // Go to session tools and check roll history
      await user.click(screen.getByRole('tab', { name: /session tools/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/roll history/i)).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Shortcuts Integration', () => {
    it('handles global keyboard shortcuts', async () => {
      const { user } = renderWithProviders(<App />)

      // Test Ctrl+1 for character tab
      await user.keyboard('{Control>}1{/Control}')
      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Character')
      })

      // Test Ctrl+2 for dice tab
      await user.keyboard('{Control>}2{/Control}')
      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Dice')
      })

      // Test Ctrl+K for command palette
      await user.keyboard('{Control>}k{/Control}')
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search commands/i)).toBeInTheDocument()
      })
    })

    it('handles context-specific shortcuts', async () => {
      const { user } = renderWithProviders(<App />)

      // Go to dice tab
      await user.click(screen.getByRole('tab', { name: /dice/i }))

      // Test spacebar for quick roll
      await user.keyboard(' ')
      await waitFor(() => {
        expect(screen.getByText(/rolling/i)).toBeInTheDocument()
      })
    })
  })

  describe('Theme Integration', () => {
    it('applies theme consistently across components', async () => {
      const { user } = renderWithProviders(<App />)

      // Toggle theme
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(themeToggle)

      // Check that theme is applied to different components
      await waitFor(() => {
        const characterSheet = screen.getByTestId('character-sheet')
        expect(characterSheet).toHaveClass('dark')
      })

      // Switch tabs and verify theme persistence
      await user.click(screen.getByRole('tab', { name: /dice/i }))
      await waitFor(() => {
        const diceRoller = screen.getByTestId('dice-roller')
        expect(diceRoller).toHaveClass('dark')
      })
    })
  })

  describe('Error Boundary Integration', () => {
    it('handles component errors gracefully', async () => {
      // Mock a component to throw an error
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      const AppWithError = () => (
        <div>
          <App />
          <ErrorComponent />
        </div>
      )

      renderWithProviders(<AppWithError />)

      // Should show error boundary fallback
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      })

      // Should provide recovery options
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  describe('Performance Integration', () => {
    it('maintains performance across tab switches', async () => {
      const { user } = renderWithProviders(<App />)

      const startTime = performance.now()

      // Rapidly switch between tabs
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('tab', { name: /dice/i }))
        await user.click(screen.getByRole('tab', { name: /character/i }))
        await user.click(screen.getByRole('tab', { name: /moves/i }))
        await user.click(screen.getByRole('tab', { name: /equipment/i }))
      }

      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(2000) // Should complete within 2 seconds
    })

    it('handles memory efficiently during extended use', async () => {
      const { user } = renderWithProviders(<App />)

      // Simulate extended use
      for (let i = 0; i < 10; i++) {
        // Make dice rolls
        await user.click(screen.getByRole('tab', { name: /dice/i }))
        const rollButton = screen.getByRole('button', { name: /roll dice/i })
        await user.click(rollButton)

        // Add notes
        await user.click(screen.getByRole('tab', { name: /session tools/i }))
        const notesInput = screen.getByPlaceholderText(/add a note/i)
        await user.type(notesInput, `Test note ${i}`)

        // Switch back to character
        await user.click(screen.getByRole('tab', { name: /character/i }))
      }

      // Memory usage should remain reasonable
      const memoryInfo = (performance as any).memory
      if (memoryInfo) {
        expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024) // 50MB limit
      }
    })
  })

  describe('Data Flow Integration', () => {
    it('maintains data consistency across components', async () => {
      const { user } = renderWithProviders(<App />)

      // Update character HP in character sheet
      const healButton = screen.getByRole('button', { name: /heal/i })
      await user.click(healButton)

      // Switch to equipment tab and verify HP is updated there too
      await user.click(screen.getByRole('tab', { name: /equipment/i }))
      await waitFor(() => {
        expect(screen.getByText(/hp.*19/i)).toBeInTheDocument() // HP should be increased
      })
    })

    it('synchronizes XP across different sources', async () => {
      const { user } = renderWithProviders(<App />)

      // Add XP from alignment
      const alignmentXPButton = screen.getByRole('button', { name: /alignment xp/i })
      await user.click(alignmentXPButton)

      // Add XP from bond resolution
      const bondXPButton = screen.getByRole('button', { name: /resolve bond/i })
      await user.click(bondXPButton)

      // Check that total XP is updated correctly
      await waitFor(() => {
        expect(screen.getByText(/xp.*2/i)).toBeInTheDocument() // Should show combined XP
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains keyboard navigation across the entire app', async () => {
      const { user } = renderWithProviders(<App />)

      // Tab through the entire interface
      let tabCount = 0
      const maxTabs = 20 // Reasonable limit

      while (tabCount < maxTabs) {
        await user.tab()
        tabCount++
        
        // Should always have a focused element
        expect(document.activeElement).not.toBe(document.body)
      }
    })

    it('provides consistent screen reader experience', () => {
      renderWithProviders(<App />)

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)

      // Check for proper landmarks
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })
})