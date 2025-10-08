import { act, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/utils/testing'
import { ChronicleOverlay } from '../ChronicleOverlay'
import { useChronicleStore } from '@/stores/chronicleStore'
import { useCharacterStore } from '@/stores/characterStore'
import { buildEntityLinkFixture } from '../../../../tests/fixtures/chronicle/entityLinkFixtures'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>(
    'framer-motion',
  )
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: new Proxy(
      {},
      {
        get: () =>
          ({
            children,
            layout: _layout,
            initial: _initial,
            animate: _animate,
            exit: _exit,
            transition: _transition,
            ...rest
          }: {
            children?: React.ReactNode
            layout?: unknown
            initial?: unknown
            animate?: unknown
            exit?: unknown
            transition?: unknown
          }) => React.createElement('div', rest, children),
      },
    ),
  }
})

vi.mock('../ChronicleProvider', () => ({
  useChronicleLLM: () => ({
    isProposing: false,
    isApplyingBundle: false,
    lastProgressEvent: null,
    lastTelemetryEvent: null,
  }),
}))

vi.mock('@/services/ChronicleActionListenerService', () => ({
  chronicleActionListener: {
    getActivePrompts: vi.fn(() => []),
    acceptPrompt: vi.fn(),
    dismissPrompt: vi.fn(),
  },
}))

vi.mock('@/services/ChronicleContextIntelligence', () => ({
  contextIntelligence: {
    recordUserBehavior: vi.fn(),
  },
}))

describe('ChronicleOverlay entity link highlights', () => {
  const chronicleStore = useChronicleStore
  const characterStore = useCharacterStore

  beforeAll(() => {
    process.env.LLM_UNIFIED = 'true'
  })

  beforeEach(() => {
    const fixture = buildEntityLinkFixture()

    act(() => {
      chronicleStore.getState().clearAll()
      chronicleStore.setState((current) => ({
        ...current,
        entries: [fixture.entry],
        entities: fixture.entities,
        relationships: fixture.relationships,
        deltaHistory: [fixture.deltaLog],
        auditLog: [],
        pendingDeltaBundle: null,
      }))
    })

    act(() => {
      characterStore.setState((current) => ({
        ...current,
        characters: [],
        activeCharacterId: null,
      }))
    })
  })

  afterEach(() => {
    act(() => {
      chronicleStore.getState().clearDeltaLog()
      chronicleStore.getState().clearAuditLog()
    })
  })

  it('shows linked entity badges for recent mention highlights', async () => {
    renderWithProviders(<ChronicleOverlay isEnabled />, {
      withAuth: false,
      withTooltips: false,
    })

    expect(await screen.findByText(/latest mentions/i)).toBeInTheDocument()
    const mentionLabels = await screen.findAllByText('Aria Dawnsong')
    expect(mentionLabels.length).toBeGreaterThan(0)

    const linkHeadings = await screen.findAllByText(/linked entities/i)
    expect(linkHeadings.length).toBeGreaterThan(0)
    const linkedNames = screen.getAllByText('Lysa Valen')
    expect(linkedNames.length).toBeGreaterThan(0)
    const relationshipBadges = screen.getAllByText(/ally/i)
    expect(relationshipBadges.length).toBeGreaterThan(0)
  })

  it('hides automation card content when LLM_UNIFIED is disabled', async () => {
    process.env.LLM_UNIFIED = 'false'

    renderWithProviders(<ChronicleOverlay isEnabled />, {
      withAuth: false,
      withTooltips: false,
    })

    expect(screen.queryByText(/latest chronicle update/i)).not.toBeInTheDocument()

    process.env.LLM_UNIFIED = 'true'
  })
})
