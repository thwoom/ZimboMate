import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../../App.Complete'
import { useChronicleStore } from '@/stores/chronicleStore'
import {
  renderWithProviders,
  setupTestEnvironment,
} from '../../../utils/testing'

vi.mock('../../../services/chatgptNoteEnhancer', () => {
  class MockEnhancer {
    onProgress?: (progress: {
      progress: number
      text: string
      stage: string
    }) => void

    async initialize() {
      this.onProgress?.({ progress: 100, text: 'Mock ready', stage: 'ready' })
    }

    async enhance(note: string) {
      return { enhancedText: `${note} (enhanced)`, actions: [] }
    }

    async isInitialized() {
      return true
    }

    isReady() {
      return true
    }

    async dispose() {
      this.onProgress = undefined
    }
  }

  return { ChatGPTNoteEnhancer: MockEnhancer }
})

describe('app Integration Tests', () => {
  let testEnv: ReturnType<typeof setupTestEnvironment>

  beforeEach(() => {
    testEnv = setupTestEnvironment()
    useChronicleStore.setState({
      auditLog: [],
      deltaHistory: [],
      pendingDeltaBundle: null,
    })
  })

  afterEach(() => {
    testEnv.cleanup()
    vi.clearAllMocks()
  })

  const renderApp = () => {
    const utils = renderWithProviders(<App />)
    return { ...utils, user: userEvent.setup() }
  }

  it('renders the active theme status badge', async () => {
    renderApp()

    const badge = await screen.findByRole('status', { name: /active theme/i })
    expect(badge).toHaveTextContent(/matsu/i)
  })

  it('navigates between the primary tabs and shows contextual content', async () => {
    const { user } = renderApp()

    await screen.findByRole('button', { name: /character/i })

    await user.click(screen.getByRole('button', { name: /character/i }))
    await screen.findByText(/attributes/i)

    await user.click(screen.getByRole('button', { name: /dice/i }))
    await screen.findByText(/unified dice roller/i)

    await user.click(screen.getByRole('button', { name: /game management/i }))
    await screen.findByText(/campaign chronicle/i)

    await user.click(screen.getByRole('button', { name: /settings/i }))
    await screen.findByText(/interface & theme/i)
  })

  it('opens the command palette with the keyboard shortcut', async () => {
    const { user } = renderApp()

    await user.keyboard('{Control>}k{/Control}')
    await screen.findByPlaceholderText(/search commands/i)
  })
})


