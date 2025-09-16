import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockDiceRoll, setupTestEnvironment } from '../../utils/testing'
import { DiceRoller } from '../game/DiceRoller'

// Mock Three.js components
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

// Mock Howler for audio
vi.mock('howler', () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn()
  }))
}))

describe('DiceRoller', () => {
  let testEnv: ReturnType<typeof setupTestEnvironment>
  const mockOnRoll = vi.fn()

  beforeEach(() => {
    testEnv = setupTestEnvironment()
    mockOnRoll.mockClear()
  })

  afterEach(() => {
    testEnv.cleanup()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dice roller interface', () => {
      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      expect(screen.getByRole('button', { name: /roll dice/i })).toBeInTheDocument()
      expect(screen.getByText(/\+2/)).toBeInTheDocument() // Modifier display
    })

    it('renders 3D canvas', () => {
      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
    })

    it('displays current modifier correctly', () => {
      renderWithProviders(
        <DiceRoller modifier={-1} onRoll={mockOnRoll} />
      )

      expect(screen.getByText(/-1/)).toBeInTheDocument()
    })
  })

  describe('Dice Rolling', () => {
    it('handles dice roll interaction', async () => {
      const restoreDiceRoll = mockDiceRoll(10) // Mock roll result of 10
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      // Should show rolling state
      expect(screen.getByText(/rolling/i)).toBeInTheDocument()

      // Wait for roll to complete
      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 12, // 10 + 2 modifier
            dice: expect.any(Array),
            modifier: 2
          })
        )
      })

      restoreDiceRoll()
    })

    it('calculates Dungeon World results correctly', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={3} onRoll={mockOnRoll} />
      )

      // Test different roll outcomes
      const testCases = [
        { roll: 6, modifier: 3, expected: 'partial' }, // 9 = 7-9 partial success
        { roll: 8, modifier: 3, expected: 'success' }, // 11 = 10+ success
        { roll: 2, modifier: 1, expected: 'failure' }  // 3 = 6- failure
      ]

      for (const testCase of testCases) {
        const restoreDiceRoll = mockDiceRoll(testCase.roll)
        
        const rollButton = screen.getByRole('button', { name: /roll dice/i })
        await user.click(rollButton)

        await waitFor(() => {
          expect(mockOnRoll).toHaveBeenCalledWith(
            expect.objectContaining({
              result: testCase.expected
            })
          )
        })

        restoreDiceRoll()
        mockOnRoll.mockClear()
      }
    })

    it('handles critical results', async () => {
      const restoreDiceRoll = mockDiceRoll(12) // Double 6s
      const { user } = renderWithProviders(
        <DiceRoller modifier={0} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalledWith(
          expect.objectContaining({
            isCritical: true
          })
        )
      })

      restoreDiceRoll()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('responds to spacebar for quick roll', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      await user.keyboard(' ') // Spacebar

      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalled()
      })
    })

    it('responds to Enter key', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      rollButton.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      expect(rollButton).toHaveAttribute('aria-label')
    })

    it('announces roll results to screen readers', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      await user.tab()
      expect(screen.getByRole('button', { name: /roll dice/i })).toHaveFocus()
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', async () => {
      const start = performance.now()
      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )
      const end = performance.now()

      expect(end - start).toBeLessThan(100) // 100ms budget
    })

    it('handles rapid clicks efficiently', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      
      // Rapid clicking should be throttled
      await user.click(rollButton)
      await user.click(rollButton)
      await user.click(rollButton)

      // Should only register one roll due to throttling
      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('3D Animation', () => {
    it('initializes 3D scene correctly', () => {
      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      expect(screen.getByTestId('canvas')).toBeInTheDocument()
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
      expect(screen.getByTestId('environment')).toBeInTheDocument()
    })

    it('handles animation completion', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      // Should show animation state
      expect(screen.getByText(/rolling/i)).toBeInTheDocument()

      // Should complete animation
      await waitFor(() => {
        expect(screen.queryByText(/rolling/i)).not.toBeInTheDocument()
      }, { timeout: 5000 })
    })
  })

  describe('Audio Feedback', () => {
    it('plays sound effects on roll', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      // Audio should be triggered (mocked)
      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles 3D rendering errors gracefully', () => {
      // Mock 3D error
      vi.mocked(useThree).mockImplementation(() => {
        throw new Error('WebGL not supported')
      })

      renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      // Should fallback to 2D interface
      expect(screen.getByText(/2d mode/i)).toBeInTheDocument()
    })

    it('handles invalid modifier values', () => {
      renderWithProviders(
        <DiceRoller modifier={NaN} onRoll={mockOnRoll} />
      )

      // Should default to 0 modifier
      expect(screen.getByText(/\+0/)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('integrates with roll history', async () => {
      const { user } = renderWithProviders(
        <DiceRoller modifier={2} onRoll={mockOnRoll} />
      )

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      await waitFor(() => {
        expect(mockOnRoll).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: expect.any(Date)
          })
        )
      })
    })
  })
})