import { screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App.Complete'
import {
  renderWithProviders,
  setupTestEnvironment,
} from '../../../utils/testing'

// Mock complex dependencies
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='canvas'>{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ scene: {}, camera: {}, gl: {} })),
}))

vi.mock('howler', () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
  })),
}))

describe.skip('end-to-End User Workflows', () => {
  let testEnv: ReturnType<typeof setupTestEnvironment>

  beforeEach(() => {
    testEnv = setupTestEnvironment()
  })

  afterEach(() => {
    testEnv.cleanup()
    vi.clearAllMocks()
  })

  describe('complete Gaming Session Workflow', () => {
    it('supports a full Dungeon World gaming session', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Session Setup - Create notes for the session
      await user.click(screen.getByRole('tab', { name: /session tools/i }))

      const notesInput = screen.getByPlaceholderText(/add a note/i)
      await user.type(notesInput, 'Starting adventure in the Whispering Woods')
      await user.keyboard('{Enter}')

      // 2. Character Preparation - Check character stats
      await user.click(screen.getByRole('tab', { name: /character/i }))

      expect(screen.getByText('Eldara Moonwhisper')).toBeInTheDocument()
      expect(screen.getByText('Level 5')).toBeInTheDocument()

      // 3. Equipment Check - Verify inventory
      await user.click(screen.getByRole('tab', { name: /equipment/i }))

      expect(screen.getByText('Staff of Power')).toBeInTheDocument()
      expect(screen.getByText('Healing Potion')).toBeInTheDocument()

      // 4. First Move - Discern Realities
      await user.click(screen.getByRole('tab', { name: /moves/i }))

      const discernRealities = screen.getByText(/discern realities/i)
      await user.click(discernRealities)

      // Should switch to dice tab
      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
          'Dice',
        )
      })

      // 5. Make the roll
      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      await waitFor(() => {
        expect(screen.getByText(/rolling/i)).toBeInTheDocument()
      })

      // 6. Record the outcome in notes
      await user.click(screen.getByRole('tab', { name: /session tools/i }))

      await user.type(notesInput, 'Discern Realities: Spotted goblin tracks')
      await user.keyboard('{Enter}')

      // 7. Combat Preparation - Check bonds
      await user.click(screen.getByRole('tab', { name: /character/i }))

      const bondSection = screen.getByText(/bonds/i)
      expect(bondSection).toBeInTheDocument()

      // 8. Take damage during combat
      const damageButton = screen.getByRole('button', { name: /damage/i })
      await user.click(damageButton)

      // Apply 3 damage
      const damageInput = screen.getByLabelText(/damage amount/i)
      await user.type(damageInput, '3')

      const applyButton = screen.getByRole('button', { name: /apply/i })
      await user.click(applyButton)

      // HP should be reduced
      await waitFor(() => {
        expect(screen.getByText(/15.*25/)).toBeInTheDocument() // 18-3=15 HP
      })

      // 9. Use healing potion
      await user.click(screen.getByRole('tab', { name: /equipment/i }))

      const healingPotion = screen.getByText('Healing Potion')
      await user.click(healingPotion)

      const useButton = screen.getByRole('button', { name: /use/i })
      await user.click(useButton)

      // 10. Gain XP from failure
      await user.click(screen.getByRole('tab', { name: /character/i }))

      const xpButton = screen.getByRole('button', { name: /add xp/i })
      await user.click(xpButton)

      // 11. End session notes
      await user.click(screen.getByRole('tab', { name: /session tools/i }))

      await user.type(notesInput, 'Session ended at the goblin camp entrance')
      await user.keyboard('{Enter}')

      // Verify session was recorded properly
      expect(screen.getByText(/whispering woods/i)).toBeInTheDocument()
      expect(screen.getByText(/goblin tracks/i)).toBeInTheDocument()
      expect(screen.getByText(/goblin camp/i)).toBeInTheDocument()
    })
  })

  describe('character Advancement Workflow', () => {
    it('supports complete character leveling process', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Check current XP
      expect(
        screen.getByText(/xp[^\n\r7\u2028\u2029]*7.*10/i),
      ).toBeInTheDocument() // 7/10 XP

      // 2. Gain XP from different sources
      // Failure XP
      const failureXPButton = screen.getByRole('button', {
        name: /failure xp/i,
      })
      await user.click(failureXPButton)

      // Alignment XP
      const alignmentXPButton = screen.getByRole('button', {
        name: /alignment xp/i,
      })
      await user.click(alignmentXPButton)

      // Bond XP
      const resolveBondButton = screen.getByRole('button', {
        name: /resolve bond/i,
      })
      await user.click(resolveBondButton)

      // 3. Should trigger level up (7+1+1+1=10 XP)
      await waitFor(() => {
        expect(screen.getByText(/level up/i)).toBeInTheDocument()
      })

      // 4. Complete level up process
      const levelUpButton = screen.getByRole('button', { name: /level up/i })
      await user.click(levelUpButton)

      // Choose stat increase
      const statIncreaseButton = screen.getByRole('button', {
        name: /increase strength/i,
      })
      await user.click(statIncreaseButton)

      // Choose new move
      const newMoveButton = screen.getByRole('button', {
        name: /select move/i,
      })
      await user.click(newMoveButton)

      // 5. Verify level up completed
      await waitFor(() => {
        expect(screen.getByText('Level 6')).toBeInTheDocument()
        expect(
          screen.getByText(/xp[^\n\r0\u2028\u2029]*0.*11/i),
        ).toBeInTheDocument() // Reset XP for next level
      })
    })
  })

  describe('campaign Management Workflow', () => {
    it('supports complete campaign creation and management', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Create new campaign
      await user.click(screen.getByRole('tab', { name: /campaign/i }))

      const newCampaignButton = screen.getByRole('button', {
        name: /new campaign/i,
      })
      await user.click(newCampaignButton)

      // Fill campaign details
      const campaignName = screen.getByLabelText(/campaign name/i)
      await user.type(campaignName, 'The Sunless Citadel')

      const campaignDescription = screen.getByLabelText(/description/i)
      await user.type(campaignDescription, 'A classic dungeon crawl adventure')

      const createButton = screen.getByRole('button', {
        name: /create campaign/i,
      })
      await user.click(createButton)

      // 2. Add NPCs
      const addNPCButton = screen.getByRole('button', { name: /add npc/i })
      await user.click(addNPCButton)

      const npcName = screen.getByLabelText(/npc name/i)
      await user.type(npcName, 'Meepo the Kobold')

      const npcRole = screen.getByLabelText(/role/i)
      await user.type(npcRole, 'Guide')

      const saveNPCButton = screen.getByRole('button', { name: /save npc/i })
      await user.click(saveNPCButton)

      // 3. Add locations
      const addLocationButton = screen.getByRole('button', {
        name: /add location/i,
      })
      await user.click(addLocationButton)

      const locationName = screen.getByLabelText(/location name/i)
      await user.type(locationName, 'The Twilight Grove')

      const locationDescription = screen.getByLabelText(/location description/i)
      await user.type(
        locationDescription,
        'A mystical grove where druids once gathered',
      )

      const saveLocationButton = screen.getByRole('button', {
        name: /save location/i,
      })
      await user.click(saveLocationButton)

      // 4. Record session
      const recordSessionButton = screen.getByRole('button', {
        name: /record session/i,
      })
      await user.click(recordSessionButton)

      const sessionNotes = screen.getByLabelText(/session notes/i)
      await user.type(sessionNotes, 'Party entered the citadel and met Meepo')

      const saveSessionButton = screen.getByRole('button', {
        name: /save session/i,
      })
      await user.click(saveSessionButton)

      // 5. Verify campaign data
      expect(screen.getByText('The Sunless Citadel')).toBeInTheDocument()
      expect(screen.getByText('Meepo the Kobold')).toBeInTheDocument()
      expect(screen.getByText('The Twilight Grove')).toBeInTheDocument()
    })
  })

  describe('file Management Workflow', () => {
    it('supports complete data backup and restore process', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Navigate to file management
      await user.click(screen.getByRole('tab', { name: /file management/i }))

      // 2. Create backup
      await user.click(screen.getByRole('tab', { name: /backup/i }))

      const createBackupButton = screen.getByRole('button', {
        name: /create backup/i,
      })
      await user.click(createBackupButton)

      await waitFor(() => {
        expect(screen.getByText(/backup created/i)).toBeInTheDocument()
      })

      // 3. Export data
      await user.click(screen.getByRole('tab', { name: /export/i }))

      const exportFormatSelect = screen.getByLabelText(/export format/i)
      await user.click(exportFormatSelect)
      await user.click(screen.getByText('JSON'))

      const exportButton = screen.getByRole('button', { name: /export/i })
      await user.click(exportButton)

      await waitFor(() => {
        expect(screen.getByText(/export complete/i)).toBeInTheDocument()
      })

      // 4. Import data
      await user.click(screen.getByRole('tab', { name: /import/i }))

      // Simulate file drop
      const dropZone = screen.getByText(/drop files here/i)
      const file = new File(['{"characters": []}'], 'backup.json', {
        type: 'application/json',
      })

      // Mock file drop event
      Object.defineProperty(dropZone, 'files', {
        value: [file],
        writable: false,
      })

      const importButton = screen.getByRole('button', { name: /import/i })
      await user.click(importButton)

      await waitFor(() => {
        expect(screen.getByText(/import complete/i)).toBeInTheDocument()
      })
    })
  })

  describe('multiplayer Session Workflow', () => {
    it('supports joining and participating in multiplayer sessions', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Navigate to multiplayer
      await user.click(screen.getByRole('tab', { name: /multiplayer/i }))

      // 2. Start multiplayer session
      const startSessionButton = screen.getByRole('button', {
        name: /start multiplayer session/i,
      })
      await user.click(startSessionButton)

      // Fill session details
      const sessionName = screen.getByLabelText(/session name/i)
      await user.type(sessionName, 'Epic Adventure Night')

      const maxPlayers = screen.getByLabelText(/max players/i)
      await user.clear(maxPlayers)
      await user.type(maxPlayers, '4')

      const createSessionButton = screen.getByRole('button', {
        name: /create session/i,
      })
      await user.click(createSessionButton)

      // 3. Verify session created
      await waitFor(() => {
        expect(
          screen.getByText(/connected to.*epic adventure night/i),
        ).toBeInTheDocument()
      })

      // 4. Share dice roll
      await user.click(screen.getByRole('tab', { name: /dice/i }))

      const shareRollCheckbox = screen.getByLabelText(/share with party/i)
      await user.click(shareRollCheckbox)

      const rollButton = screen.getByRole('button', { name: /roll dice/i })
      await user.click(rollButton)

      // 5. Verify roll was shared
      await waitFor(() => {
        expect(screen.getByText(/shared with party/i)).toBeInTheDocument()
      })
    })
  })

  describe('accessibility Workflow', () => {
    it('supports complete keyboard-only navigation', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Navigate using only keyboard shortcuts
      await user.keyboard('{Control>}2{/Control}') // Dice tab
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Dice',
      )

      await user.keyboard('{Control>}3{/Control}') // Moves tab
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Moves',
      )

      await user.keyboard('{Control>}4{/Control}') // Equipment tab
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
        'Equipment',
      )

      // 2. Use command palette
      await user.keyboard('{Control>}k{/Control}')

      const commandInput = screen.getByPlaceholderText(/search commands/i)
      expect(commandInput).toHaveFocus()

      await user.type(commandInput, 'roll dice')
      await user.keyboard('{Enter}')

      // Should execute roll dice command
      await waitFor(() => {
        expect(screen.getByText(/rolling/i)).toBeInTheDocument()
      })

      // 3. Navigate with Tab key
      await user.keyboard('{Escape}') // Close command palette

      let tabCount = 0
      while (tabCount < 10) {
        await user.tab()
        tabCount++

        // Should always have focus on interactive element
        const activeElement = document.activeElement
        expect(activeElement).not.toBe(document.body)
        expect(activeElement?.tagName).toMatch(/BUTTON|INPUT|SELECT|TEXTAREA|A/)
      }
    })
  })

  describe('error Recovery Workflow', () => {
    it('handles and recovers from various error scenarios', async () => {
      const { user } = renderWithProviders(<App />)

      // 1. Simulate network error during save
      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      // Try to save character changes
      const nameInput = screen.getByDisplayValue(/eldara/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Test Character')

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText(/save failed/i)).toBeInTheDocument()
      })

      // 2. Retry save
      const retryButton = screen.getByRole('button', { name: /retry/i })

      // Restore fetch
      globalThis.fetch = originalFetch

      await user.click(retryButton)

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument()
      })

      // 3. Handle component error
      // This would be handled by the error boundary in real scenarios
      expect(screen.getByText('Test Character')).toBeInTheDocument()
    })
  })

  describe('performance Under Load', () => {
    it('maintains responsiveness during intensive operations', async () => {
      const { user } = renderWithProviders(<App />)

      const startTime = performance.now()

      // Perform multiple intensive operations
      for (let i = 0; i < 5; i++) {
        // Make dice rolls
        await user.click(screen.getByRole('tab', { name: /dice/i }))
        const rollButton = screen.getByRole('button', { name: /roll dice/i })
        await user.click(rollButton)

        // Add session notes
        await user.click(screen.getByRole('tab', { name: /session tools/i }))
        const notesInput = screen.getByPlaceholderText(/add a note/i)
        await user.type(notesInput, `Performance test note ${i}`)
        await user.keyboard('{Enter}')

        // Switch to character tab
        await user.click(screen.getByRole('tab', { name: /character/i }))
      }

      const endTime = performance.now()

      // Should complete all operations within reasonable time
      expect(endTime - startTime).toBeLessThan(5000) // 5 second limit

      // UI should remain responsive
      expect(screen.getByText('Eldara Moonwhisper')).toBeInTheDocument()
    })
  })
})
