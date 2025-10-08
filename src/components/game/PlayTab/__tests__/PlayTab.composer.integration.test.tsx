import type { Character } from '@/models/Character'
import type { DeltaOperation } from '@/services/llm'
import { act, screen, waitFor, within } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'
import { ChronicleProvider } from '@/components/chronicle/ChronicleProvider'
import * as chronicleService from '@/services/chronicle'
import { useCharacterStore } from '@/stores/characterStore'
import { useChronicleStore } from '@/stores/chronicleStore'
import { renderWithProviders } from '@/utils/testing'
import { PlayTab } from '../../PlayTab'

const getLlmMockControls = () =>
  (globalThis as any).__LLM_MOCK__ as
    | {
        reset?: () => void
        setNextProposeResult?: (
          factory: ((request: any) => any) | undefined,
        ) => void
      }
    | undefined

const baseCharacter = {
  id: 'char-1',
  name: 'Test Hero',
  class: 'Fighter',
  race: 'Human',
  level: 1,
  alignment: 'Good',
  attributes: {
    STR: 1,
    DEX: 1,
    CON: 1,
    INT: 1,
    WIS: 1,
    CHA: 1,
  },
  debilities: {
    weak: false,
    shaky: false,
    sick: false,
    stunned: false,
    confused: false,
    scarred: false,
  },
  hp: {
    current: 20,
    max: 20,
  },
  armor: 0,
  damageDie: 'd8',
  xp: 0,
  load: {
    current: 0,
    max: 9,
  },
  baseLoad: 9,
  coin: 0,
  bonds: [],
  advancements: [],
  knownMoves: [],
  conditions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Character

beforeAll(() => {
  process.env.LLM_UNIFIED = 'true'
})

describe('playTab composer integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    const controls = getLlmMockControls()
    controls?.reset?.()

    act(() => {
      const chronicleState = useChronicleStore.getState()
      chronicleState.clearDeltaLog()
      useChronicleStore.setState({
        pendingDeltaBundle: null,
        auditLog: [],
      })
      useCharacterStore.setState({
        characters: [baseCharacter],
        activeCharacterId: baseCharacter.id,
      })
    })

    ;(globalThis as any).__TAURI__ = {}
    ;(globalThis as any).__TAURI_IPC__ = {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as any).__TAURI__
    delete (globalThis as any).__TAURI_IPC__
  })

  const renderPlayTab = () =>
    renderWithProviders(
      <ChronicleProvider defaultEnabled={false}>
        <PlayTab />
      </ChronicleProvider>,
    )

  it('shows the proposed narrative and humanized checklist entries', async () => {
    const controls = getLlmMockControls()
    const operations: DeltaOperation[] = [
      { type: 'mark_xp', characterId: baseCharacter.id, amount: 1 },
      {
        type: 'add_item',
        characterId: baseCharacter.id,
        item: { name: 'Ancient Sword' },
      },
      {
        type: 'link_entity',
        fromId: 'entity-aria',
        toId: 'entity-lysa',
        relationship: {
          type: 'ally',
          confidence: 0.9,
          strength: 2,
        },
      },
    ]

    controls?.setNextProposeResult?.(() => ({
      bundle: {
        entryId: 'entry-checklist',
        narrative: 'The hero presses the attack and steadies the line.',
        ops: operations,
        usage: { inputTokens: 24, outputTokens: 18, totalTokens: 42 },
        reasoning: 'Mock reasoning',
        idempotencyKey: 'bundle-checklist',
        model: 'gpt-5-mock',
        createdAt: '2025-10-08T19:00:00.000Z',
      },
      warnings: [],
    }))

    const { user } = renderPlayTab()

    const chronicleInput = await screen.findByPlaceholderText(
      /what happens in your adventure/i,
    )
    await user.type(chronicleInput, 'We hold the bridge while Kara rallies.')

    const submitButton = screen.getByRole('button', { name: /add to chronicle/i })
    await user.click(submitButton)

    await screen.findByText('The hero presses the attack and steadies the line.')

    expect(screen.getByText('Test Hero marks 1 XP')).toBeInTheDocument()
    expect(screen.getByText('Test Hero gains Ancient Sword')).toBeInTheDocument()
    expect(
      screen.getByText(/links entity-aria to entity-lysa \(ally\)/i),
    ).toBeInTheDocument()
  })

  it('applies a bundle and exposes undo through the automation log', async () => {
    const controls = getLlmMockControls()
    const operations: DeltaOperation[] = [
      { type: 'mark_xp', characterId: baseCharacter.id, amount: 1 },
      {
        type: 'add_item',
        characterId: baseCharacter.id,
        item: { name: 'Ancient Sword' },
      },
      {
        type: 'link_entity',
        fromId: 'entity-aria',
        toId: 'entity-lysa',
        relationship: {
          type: 'ally',
          status: 'active',
        },
      },
    ]

    controls?.setNextProposeResult?.(() => ({
      bundle: {
        entryId: 'entry-apply',
        narrative: 'Chronicle captures the rallying cry of the heroes.',
        ops: operations,
        usage: { inputTokens: 18, outputTokens: 16, totalTokens: 34 },
        reasoning: 'Mock reasoning',
        idempotencyKey: 'bundle-apply',
        model: 'gpt-5-mock',
        createdAt: '2025-10-08T20:00:00.000Z',
      },
      warnings: [],
    }))

    const applySpy = vi
      .spyOn(chronicleService, 'applyChronicleDeltaBundle')
      .mockResolvedValue({
        bundleId: 'bundle-apply',
        appliedOps: operations,
        skippedOps: [],
        undoHandle: {
          bundleId: 'bundle-apply',
          issuedAt: '2025-10-08T20:00:30.000Z',
        },
      })

    const undoSpy = vi
      .spyOn(chronicleService, 'undoChronicleBundle')
      .mockResolvedValue(true)

    const { user } = renderPlayTab()

    const chronicleInput = await screen.findByPlaceholderText(
      /what happens in your adventure/i,
    )
    await user.type(chronicleInput, 'We rally the line and seize the moment.')

    const submitButton = screen.getByRole('button', { name: /add to chronicle/i })
    await user.click(submitButton)

    const checklistHeader = await screen.findByText('Proposed updates')
    const checklistSection =
      checklistHeader.parentElement?.parentElement ?? checklistHeader.parentElement

    expect(checklistSection).toBeTruthy()

    const checkboxes = within(checklistSection as HTMLElement).getAllByRole(
      'checkbox',
    )
    for (const checkbox of checkboxes) {
      await user.click(checkbox)
    }

    const applyButton = screen.getByRole('button', { name: /apply selected/i })
    await user.click(applyButton)

    await waitFor(() => {
      expect(applySpy).toHaveBeenCalledTimes(1)
    })

    const automationHeading = await screen.findByRole('heading', {
      name: /automation log/i,
    })
    const automationSection = automationHeading.parentElement?.parentElement
    expect(automationSection).toBeTruthy()

    const undoButton = await within(automationSection as HTMLElement).findByRole(
      'button',
      { name: /^undo$/i },
    )

    await user.click(undoButton)

    await waitFor(() => {
      expect(undoSpy).toHaveBeenCalledWith('bundle-apply')
    })

    await waitFor(() => {
      expect(useChronicleStore.getState().deltaHistory).toHaveLength(0)
    })
  })

  it('hides automation log when LLM_UNIFIED flag is disabled', async () => {
    process.env.LLM_UNIFIED = 'false'

    const { user } = renderPlayTab()

    const chronicleInput = await screen.findByPlaceholderText(
      /what happens in your adventure/i,
    )
    await user.type(chronicleInput, 'We scout the ridge quietly.')

    const submitButton = screen.getByRole('button', { name: /add to chronicle/i })
    await user.click(submitButton)

    expect(screen.queryByText(/automation log/i)).not.toBeInTheDocument()

    process.env.LLM_UNIFIED = 'true'
  })
})
