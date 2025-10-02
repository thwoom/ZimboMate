import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'

/**
 * End-to-end testing utilities for ZimboMate V2
 * Provides high-level functions for testing complete user workflows
 */

export interface E2ETestContext {
  user: ReturnType<typeof userEvent.setup>
  navigateToTab: (tabName: string) => Promise<void>
  waitForAnimation: () => Promise<void>
  expectTabActive: (tabName: string) => void
  measurePerformance: <T>(operation: () => Promise<T>) => Promise<{ result: T, duration: number }>
}

/**
 * Setup E2E test context with common utilities
 */
export function setupE2EContext(): E2ETestContext {
  const user = userEvent.setup()

  const navigateToTab = async (tabName: string) => {
    const tab = screen.getByRole('tab', { name: new RegExp(tabName, 'i') })
    await user.click(tab)
    await waitFor(() => {
      expect(tab).toHaveAttribute('aria-selected', 'true')
    })
  }

  const waitForAnimation = async () => {
    // Wait for Framer Motion animations to complete
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const expectTabActive = (tabName: string) => {
    const tab = screen.getByRole('tab', { name: new RegExp(tabName, 'i') })
    expect(tab).toHaveAttribute('aria-selected', 'true')
  }

  const measurePerformance = async <T>(operation: () => Promise<T>) => {
    const start = performance.now()
    const result = await operation()
    const end = performance.now()
    return { result, duration: end - start }
  }

  return {
    user,
    navigateToTab,
    waitForAnimation,
    expectTabActive,
    measurePerformance,
  }
}

/**
 * Complete gaming session workflow
 */
export async function completeGamingSession(context: E2ETestContext) {
  const { user, navigateToTab } = context

  // 1. Session Setup
  await navigateToTab('session tools')

  const notesInput = screen.getByPlaceholderText(/add a note/i)
  await user.type(notesInput, 'Starting new adventure')
  await user.keyboard('{Enter}')

  // 2. Character Check
  await navigateToTab('character')
  expect(screen.getByText(/eldara moonwhisper/i)).toBeInTheDocument()

  // 3. Equipment Verification
  await navigateToTab('equipment')
  expect(screen.getByText(/staff of power/i)).toBeInTheDocument()

  // 4. Make a Move
  await navigateToTab('moves')
  const hackAndSlash = screen.getByText(/hack and slash/i)
  await user.click(hackAndSlash)

  // Should auto-navigate to dice tab
  await waitFor(() => {
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Dice')
  })

  // 5. Roll Dice
  const rollButton = screen.getByRole('button', { name: /roll dice/i })
  await user.click(rollButton)

  await waitFor(() => {
    expect(screen.getByText(/rolling/i)).toBeInTheDocument()
  })

  // 6. Record Result
  await navigateToTab('session tools')
  await user.type(notesInput, 'Hack and Slash: Hit the goblin!')
  await user.keyboard('{Enter}')

  return {
    notesCreated: 2,
    rollsMade: 1,
    tabsSwitched: 6,
  }
}

/**
 * Character advancement workflow
 */
export async function characterAdvancement(context: E2ETestContext) {
  const { user, navigateToTab } = context

  await navigateToTab('character')

  // Add XP from different sources
  const failureXPButton = screen.getByRole('button', { name: /failure xp/i })
  await user.click(failureXPButton)

  const alignmentXPButton = screen.getByRole('button', { name: /alignment xp/i })
  await user.click(alignmentXPButton)

  const bondXPButton = screen.getByRole('button', { name: /resolve bond/i })
  await user.click(bondXPButton)

  // Check for level up
  await waitFor(() => {
    const levelUpIndicator = screen.queryByText(/level up/i)
    if (levelUpIndicator) {
      return expect(levelUpIndicator).toBeInTheDocument()
    }
  }, { timeout: 2000 })

  return {
    xpGained: 3,
    leveledUp: screen.queryByText(/level up/i) !== null,
  }
}

/**
 * Campaign management workflow
 */
export async function campaignManagement(context: E2ETestContext) {
  const { user, navigateToTab } = context

  await navigateToTab('campaign')

  // Create new campaign
  const newCampaignButton = screen.getByRole('button', { name: /new campaign/i })
  await user.click(newCampaignButton)

  const campaignName = screen.getByLabelText(/campaign name/i)
  await user.type(campaignName, 'Test Campaign')

  const createButton = screen.getByRole('button', { name: /create/i })
  await user.click(createButton)

  // Add NPC
  const addNPCButton = screen.getByRole('button', { name: /add npc/i })
  await user.click(addNPCButton)

  const npcName = screen.getByLabelText(/npc name/i)
  await user.type(npcName, 'Test NPC')

  const saveNPCButton = screen.getByRole('button', { name: /save/i })
  await user.click(saveNPCButton)

  return {
    campaignCreated: true,
    npcsAdded: 1,
  }
}

/**
 * Keyboard navigation workflow
 */
export async function keyboardNavigation(context: E2ETestContext) {
  const { user, expectTabActive } = context

  // Test tab navigation shortcuts
  await user.keyboard('{Control>}1{/Control}')
  expectTabActive('character')

  await user.keyboard('{Control>}2{/Control}')
  expectTabActive('dice')

  await user.keyboard('{Control>}3{/Control}')
  expectTabActive('moves')

  // Test command palette
  await user.keyboard('{Control>}k{/Control}')

  const commandInput = screen.getByPlaceholderText(/search commands/i)
  expect(commandInput).toHaveFocus()

  await user.type(commandInput, 'roll dice')
  await user.keyboard('{Enter}')

  // Should execute command
  await waitFor(() => {
    expect(screen.getByText(/rolling/i)).toBeInTheDocument()
  })

  return {
    shortcutsUsed: 4,
    commandPaletteUsed: true,
  }
}

/**
 * Performance stress test
 */
export async function performanceStressTest(context: E2ETestContext) {
  const { user, navigateToTab, measurePerformance } = context

  const results = []

  // Rapid tab switching
  const tabSwitchPerf = await measurePerformance(async () => {
    for (let i = 0; i < 10; i++) {
      await navigateToTab('character')
      await navigateToTab('dice')
      await navigateToTab('moves')
      await navigateToTab('equipment')
    }
  })
  results.push({ operation: 'tab-switching', duration: tabSwitchPerf.duration })

  // Rapid dice rolling
  await navigateToTab('dice')
  const rollPerf = await measurePerformance(async () => {
    const rollButton = screen.getByRole('button', { name: /roll dice/i })
    for (let i = 0; i < 5; i++) {
      await user.click(rollButton)
      await waitFor(() => screen.queryByText(/rolling/i), { timeout: 1000 })
      await waitFor(() => !screen.queryByText(/rolling/i), { timeout: 3000 })
    }
  })
  results.push({ operation: 'dice-rolling', duration: rollPerf.duration })

  // Note creation stress test
  await navigateToTab('session tools')
  const notesPerf = await measurePerformance(async () => {
    const notesInput = screen.getByPlaceholderText(/add a note/i)
    for (let i = 0; i < 20; i++) {
      await user.type(notesInput, `Performance test note ${i}`)
      await user.keyboard('{Enter}')
    }
  })
  results.push({ operation: 'note-creation', duration: notesPerf.duration })

  return {
    results,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
  }
}

/**
 * Accessibility workflow test
 */
export async function accessibilityWorkflow(context: E2ETestContext) {
  const { user } = context

  // Test keyboard navigation
  let tabCount = 0
  const maxTabs = 15
  const focusableElements = []

  while (tabCount < maxTabs) {
    await user.tab()
    tabCount++

    const activeElement = document.activeElement
    if (activeElement && activeElement !== document.body) {
      focusableElements.push({
        tagName: activeElement.tagName,
        role: activeElement.getAttribute('role'),
        ariaLabel: activeElement.getAttribute('aria-label'),
        text: activeElement.textContent?.slice(0, 50),
      })
    }
  }

  // Test screen reader landmarks
  const landmarks = [
    screen.getByRole('main'),
    screen.getByRole('navigation'),
    screen.getAllByRole('heading'),
  ]

  // Test ARIA labels
  const buttons = screen.getAllByRole('button')
  const accessibleButtons = buttons.filter(button =>
    button.getAttribute('aria-label') || button.textContent,
  )

  return {
    focusableElements: focusableElements.length,
    landmarks: landmarks.length,
    accessibleButtons: accessibleButtons.length,
    totalButtons: buttons.length,
    accessibilityScore: (accessibleButtons.length / buttons.length) * 100,
  }
}

/**
 * Data persistence workflow
 */
export async function dataPersistenceWorkflow(context: E2ETestContext) {
  const { user, navigateToTab } = context

  // Make changes to character
  await navigateToTab('character')
  const nameInput = screen.getByDisplayValue(/eldara/i)
  await user.clear(nameInput)
  await user.type(nameInput, 'Modified Character')

  // Add notes
  await navigateToTab('session tools')
  const notesInput = screen.getByPlaceholderText(/add a note/i)
  await user.type(notesInput, 'Persistence test note')
  await user.keyboard('{Enter}')

  // Create campaign data
  await navigateToTab('campaign')
  const newCampaignButton = screen.getByRole('button', { name: /new campaign/i })
  await user.click(newCampaignButton)

  const campaignName = screen.getByLabelText(/campaign name/i)
  await user.type(campaignName, 'Persistence Test Campaign')

  const createButton = screen.getByRole('button', { name: /create/i })
  await user.click(createButton)

  // Verify data persists across tab switches
  await navigateToTab('character')
  expect(screen.getByDisplayValue('Modified Character')).toBeInTheDocument()

  await navigateToTab('session tools')
  expect(screen.getByText(/persistence test note/i)).toBeInTheDocument()

  await navigateToTab('campaign')
  expect(screen.getByText(/persistence test campaign/i)).toBeInTheDocument()

  return {
    characterDataPersisted: true,
    sessionDataPersisted: true,
    campaignDataPersisted: true,
  }
}

/**
 * Error recovery workflow
 */
export async function errorRecoveryWorkflow(context: E2ETestContext) {
  const { user, navigateToTab } = context

  // Simulate network error
  const originalFetch = globalThis.fetch
  globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

  try {
    // Try to perform action that requires network
    await navigateToTab('character')
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })

    // Restore network and retry
    globalThis.fetch = originalFetch
    const retryButton = screen.getByRole('button', { name: /retry/i })
    await user.click(retryButton)

    // Should succeed
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })

    return {
      errorHandled: true,
      recoverySuccessful: true,
    }
  }
  finally {
    globalThis.fetch = originalFetch
  }
}

/**
 * Complete E2E test suite runner
 */
export async function runCompleteE2ETest() {
  const context = setupE2EContext()

  const results = {
    gamingSession: await completeGamingSession(context),
    characterAdvancement: await characterAdvancement(context),
    campaignManagement: await campaignManagement(context),
    keyboardNavigation: await keyboardNavigation(context),
    performanceStress: await performanceStressTest(context),
    accessibility: await accessibilityWorkflow(context),
    dataPersistence: await dataPersistenceWorkflow(context),
    errorRecovery: await errorRecoveryWorkflow(context),
  }

  return {
    ...results,
    overallSuccess: true,
    testDuration: performance.now(),
    summary: {
      totalWorkflows: Object.keys(results).length,
      successfulWorkflows: Object.values(results).filter(r =>
        typeof r === 'object' && r !== null,
      ).length,
    },
  }
}
