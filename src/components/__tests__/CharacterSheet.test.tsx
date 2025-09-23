import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, mockCharacter, simulateUserFlow, setupTestEnvironment } from '../../utils/testing'
import { CharacterSheet } from '../game/CharacterSheet'

// Mock the stores
vi.mock('../../stores/characterStore', () => ({
  useCharacterStore: vi.fn(() => ({
    characters: [mockCharacter],
    activeCharacterId: mockCharacter.id,
    updateCharacter: vi.fn(),
    addCharacter: vi.fn(),
    removeCharacter: vi.fn(),
    setActiveCharacter: vi.fn()
  }))
}))

vi.mock('../../stores/gameStateStore', () => ({
  useGameStateStore: vi.fn(() => ({
    rollHistory: [],
    addRoll: vi.fn(),
    clearHistory: vi.fn()
  }))
}))

describe('CharacterSheet', () => {
  let testEnv: ReturnType<typeof setupTestEnvironment>

  beforeEach(() => {
    testEnv = setupTestEnvironment()
  })

  afterEach(() => {
    testEnv.cleanup()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders character sheet with basic information', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      expect(screen.getByText(mockCharacter.name)).toBeInTheDocument()
      expect(screen.getByText(`Level ${mockCharacter.level}`)).toBeInTheDocument()
      expect(screen.getByText(mockCharacter.class)).toBeInTheDocument()
    })

    it('displays character stats correctly', async () => {
      renderWithProviders(<CharacterSheet />)

      // Check that all stats are displayed
      expect(screen.getByText('STR')).toBeInTheDocument()
      expect(screen.getByText('DEX')).toBeInTheDocument()
      expect(screen.getByText('CON')).toBeInTheDocument()
      expect(screen.getByText('INT')).toBeInTheDocument()
      expect(screen.getByText('WIS')).toBeInTheDocument()
      expect(screen.getByText('CHA')).toBeInTheDocument()

      // Check stat values
      expect(screen.getByText('+2')).toBeInTheDocument() // STR modifier
      expect(screen.getByText('+1')).toBeInTheDocument() // DEX modifier
    })

    it('displays HP and load information', async () => {
      renderWithProviders(<CharacterSheet />)

      expect(screen.getByText(`${mockCharacter.hp.current}/${mockCharacter.hp.max}`)).toBeInTheDocument()
      expect(screen.getByText(`${mockCharacter.load.current}/${mockCharacter.load.max}`)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('allows editing character name', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const nameElement = screen.getByDisplayValue(mockCharacter.name)
      await user.clear(nameElement)
      await user.type(nameElement, 'New Hero Name')

      expect(nameElement).toHaveValue('New Hero Name')
    })

    it('handles HP adjustment', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const healButton = screen.getByRole('button', { name: /heal/i })
      await user.click(healButton)

      // Should trigger HP increase
      await waitFor(() => {
        expect(screen.getByText(/healed/i)).toBeInTheDocument()
      })
    })

    it('handles damage application', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const damageButton = screen.getByRole('button', { name: /damage/i })
      await user.click(damageButton)

      // Should open damage dialog
      await waitFor(() => {
        expect(screen.getByText(/apply damage/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper keyboard navigation', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      // Tab through interactive elements
      await user.tab()
      expect(document.activeElement).toHaveAttribute('role', 'button')

      await user.tab()
      expect(document.activeElement).toHaveAttribute('type', 'text')
    })

    it('has proper ARIA labels', () => {
      renderWithProviders(<CharacterSheet />)

      expect(screen.getByLabelText(/character name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hit points/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/load/i)).toBeInTheDocument()
    })

    it('supports screen readers', () => {
      renderWithProviders(<CharacterSheet />)

      // Check for proper headings
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()

      // Check for proper regions
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders within performance budget', async () => {
      const renderTime = await measureRenderTime(() => {
        renderWithProviders(<CharacterSheet />)
      })

      expect(renderTime).toBeLessThan(50) // 50ms budget
    })

    it('handles rapid updates efficiently', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const nameInput = screen.getByDisplayValue(mockCharacter.name)
      
      // Rapid typing should not cause performance issues
      const startTime = performance.now()
      
      for (let i = 0; i < 10; i++) {
        await user.type(nameInput, 'a')
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Error Handling', () => {
    it('handles missing character data gracefully', () => {
      // Mock empty character data
      vi.mocked(useCharacterStore).mockReturnValue({
        characters: [],
        activeCharacterId: null,
        updateCharacter: vi.fn(),
        addCharacter: vi.fn(),
        removeCharacter: vi.fn(),
        setActiveCharacter: vi.fn()
      })

      renderWithProviders(<CharacterSheet />)

      expect(screen.getByText(/no character selected/i)).toBeInTheDocument()
    })

    it('handles invalid stat values', () => {
      const invalidCharacter = {
        ...mockCharacter,
        stats: {
          ...mockCharacter.stats,
          strength: { value: -1, modifier: -5 } // Invalid stat
        }
      }

      vi.mocked(useCharacterStore).mockReturnValue({
        characters: [invalidCharacter],
        activeCharacterId: invalidCharacter.id,
        updateCharacter: vi.fn(),
        addCharacter: vi.fn(),
        removeCharacter: vi.fn(),
        setActiveCharacter: vi.fn()
      })

      renderWithProviders(<CharacterSheet />)

      // Should handle invalid stats gracefully
      expect(screen.getByText(invalidCharacter.name)).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('integrates with dice rolling system', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const rollButton = screen.getByRole('button', { name: /roll/i })
      await user.click(rollButton)

      // Should trigger dice roll
      await waitFor(() => {
        expect(screen.getByText(/rolling/i)).toBeInTheDocument()
      })
    })

    it('integrates with equipment system', async () => {
      const { user } = renderWithProviders(<CharacterSheet />)

      const equipmentTab = screen.getByRole('tab', { name: /equipment/i })
      await user.click(equipmentTab)

      // Should show equipment panel
      await waitFor(() => {
        expect(screen.getByText(/inventory/i)).toBeInTheDocument()
      })
    })
  })

  describe('Data Persistence', () => {
    it('saves character changes automatically', async () => {
      const mockUpdateCharacter = vi.fn()
      vi.mocked(useCharacterStore).mockReturnValue({
        characters: [mockCharacter],
        activeCharacterId: mockCharacter.id,
        updateCharacter: mockUpdateCharacter,
        addCharacter: vi.fn(),
        removeCharacter: vi.fn(),
        setActiveCharacter: vi.fn()
      })

      const { user } = renderWithProviders(<CharacterSheet />)

      const nameInput = screen.getByDisplayValue(mockCharacter.name)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')

      // Should trigger save after debounce
      await waitFor(() => {
        expect(mockUpdateCharacter).toHaveBeenCalledWith(
          mockCharacter.id,
          expect.objectContaining({ name: 'Updated Name' })
        )
      }, { timeout: 2000 })
    })
  })
})

// Helper function for measuring render time
async function measureRenderTime(renderFn: () => void): Promise<number> {
  const start = performance.now()
  renderFn()
  await waitFor(() => {}) // Wait for render to complete
  const end = performance.now()
  return end - start
}