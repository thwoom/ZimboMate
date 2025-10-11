import type { ReactNode } from 'react'
import type { Character } from '@/models/Character'
import type { ChronicleDeltaLog } from '@/types/chronicle'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import * as chronicleService from '@/services/chronicle'
import { useCharacterStore } from '@/stores/characterStore'
import { useChronicleStore } from '@/stores/chronicleStore'
import { PlayTab } from '../../PlayTab'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
}))

vi.mock('@/components/chronicle/ChronicleProvider', () => ({
  // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
  useChronicleLLM: () => ({
    proposeEntryDeltas: vi.fn(),
    applyDeltaBundle: vi.fn(),
    isProposing: false,
    isApplyingBundle: false,
    lastProgressEvent: null,
    lastTelemetryEvent: null,
    settings: {},
    _updateSettings: vi.fn(),
  }),
}))

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

const setupActiveCharacter = () => {
  act(() => {
    useCharacterStore.setState({
      characters: [baseCharacter],
      activeCharacterId: baseCharacter.id,
    })
  })
}

const renderPlayTab = async () => {
  await act(async () => {
    render(<PlayTab />)
  })
}

describe('playTab automation log polish', () => {
  const defaultClearDeltaLog = useChronicleStore.getState().clearDeltaLog

  beforeEach(() => {
    vi.restoreAllMocks()
    act(() => {
      useChronicleStore.setState({
        deltaHistory: [],
        clearDeltaLog: defaultClearDeltaLog,
        pendingDeltaBundle: null,
      })
      useCharacterStore.setState({
        characters: [],
        activeCharacterId: null,
      })
    })
    setupActiveCharacter()
    ;(globalThis as any).__TAURI__ = {}
  })

  afterEach(() => {
    act(() => {
      useChronicleStore.setState({
        deltaHistory: [],
        clearDeltaLog: defaultClearDeltaLog,
        pendingDeltaBundle: null,
      })
      useCharacterStore.setState({
        characters: [],
        activeCharacterId: null,
      })
    })
    delete (globalThis as any).__TAURI__
  })

  it('invokes undo flow and clears the delta log entry', async () => {
    const clearDeltaLog = vi.fn()
    const deltaLog: ChronicleDeltaLog = {
      bundleId: 'bundle-1',
      entryId: 'entry-1',
      appliedOps: [],
      skippedOps: [],
      createdAt: new Date().toISOString(),
      undoHandle: {
        bundleId: 'bundle-1',
        issuedAt: new Date().toISOString(),
      },
    }
    act(() => {
      useChronicleStore.setState({
        deltaHistory: [deltaLog],
        clearDeltaLog,
      })
    })

    const undoSpy = vi
      .spyOn(chronicleService, 'undoChronicleBundle')
      .mockResolvedValue(true)

    await renderPlayTab()

    const undoButton = await screen.findByRole('button', { name: /undo/i })
    fireEvent.click(undoButton)

    await waitFor(() => {
      expect(undoSpy).toHaveBeenCalledWith('bundle-1')
      expect(clearDeltaLog).toHaveBeenCalledWith('bundle-1')
    })
  })

  it('dismisses a log entry without an undo handle', async () => {
    const clearDeltaLog = vi.fn()
    const deltaLog: ChronicleDeltaLog = {
      bundleId: 'bundle-2',
      entryId: 'entry-2',
      appliedOps: [],
      skippedOps: [],
      createdAt: new Date().toISOString(),
    }
    act(() => {
      useChronicleStore.setState({
        deltaHistory: [deltaLog],
        clearDeltaLog,
      })
    })

    await renderPlayTab()

    const dismissButton = await screen.findByRole('button', {
      name: /^dismiss$/i,
    })
    fireEvent.click(dismissButton)

    expect(clearDeltaLog).toHaveBeenCalledWith('bundle-2')
  })

  it('shows the Tauri guard and hides it after dismissal', async () => {
    delete (globalThis as any).__TAURI__
    act(() => {
      useChronicleStore.setState({ deltaHistory: [] })
    })

    await renderPlayTab()

    const guardHeading = await screen.findByText('Desktop bridge unavailable')
    expect(guardHeading).toBeInTheDocument()

    const dismissGuard = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissGuard)

    await waitFor(() => {
      expect(
        screen.queryByText('Desktop bridge unavailable'),
      ).not.toBeInTheDocument()
    })
  })
})
