import type { EquipmentChange, FolioHighlight, FolioPage } from '../Folio'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Folio from '../Folio'

const mocks = vi.hoisted(() => ({
  header: vi.fn(),
  stats: vi.fn(),
  gear: vi.fn(),
  spells: vi.fn(),
  bonds: vi.fn(),
  notes: vi.fn(),
}))

vi.mock('../FolioHeader', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean; focusLabel?: string }) => {
    mocks.header(props)
    return (
      <div data-testid='folio-header' data-highlighted={props.highlighted}>
        {props.focusLabel ? <span>{props.focusLabel}</span> : null}
      </div>
    )
  },
}))
vi.mock('../FolioStatsPage', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean }) => {
    mocks.stats(props)
    return <div data-testid='stats-page' data-highlighted={props.highlighted} />
  },
}))
vi.mock('../FolioGearPage', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean; onEquipmentChange?: (change: EquipmentChange) => void }) => {
    mocks.gear(props)
    return (
      <div data-testid='gear-page' data-highlighted={props.highlighted}>
        <button type='button' onClick={() => props.onEquipmentChange?.({ slot: 'main_hand', action: 'equip', itemName: 'Iron Sword' })}>
          equip
        </button>
      </div>
    )
  },
}))
vi.mock('../FolioSpellsPage', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean }) => {
    mocks.spells(props)
    return <div data-testid='spells-page' data-highlighted={props.highlighted} />
  },
}))
vi.mock('../FolioBondsDebilitiesPage', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean }) => {
    mocks.bonds(props)
    return <div data-testid='bonds-page' data-highlighted={props.highlighted} />
  },
}))
vi.mock('../FolioNotesPage', () => ({
  __esModule: true,
  default: (props: { highlighted?: boolean; onNoteCreated?: (title?: string) => void }) => {
    mocks.notes(props)
    return (
      <div data-testid='notes-page' data-highlighted={props.highlighted}>
        <button type='button' onClick={() => props.onNoteCreated?.('Journal Entry')}>
          save-note
        </button>
      </div>
    )
  },
}))

afterEach(() => {
  cleanup()
  Object.values(mocks).forEach((mockFn) => mockFn.mockClear())
})

function renderFolio(highlight: FolioHighlight | null, defaultPage: FolioPage = 'stats') {
  return render(
    <Folio
      defaultPage={defaultPage}
      highlight={highlight}
      onNoteCreated={vi.fn()}
      onEquipmentChange={vi.fn()}
    />,
  )
}

const renderWithCallbacks = (params: {
  onNoteCreated?: (title?: string) => void
  onEquipmentChange?: (change: EquipmentChange) => void
} = {}) =>
  render(
    <Folio
      defaultPage='gear'
      highlight={null}
      onNoteCreated={params.onNoteCreated}
      onEquipmentChange={params.onEquipmentChange}
    />,
  )

describe('folio highlight behaviour', () => {
  it('focuses the highlighted tab when focus=true', async () => {
    renderFolio({ page: 'gear', label: 'Equip sword', focus: true })

    const gearTab = await screen.findByRole('tab', { name: /Gear & Load/i })
    await waitFor(() => expect(gearTab).toHaveAttribute('data-state', 'active'))
    expect(mocks.gear).toHaveBeenCalledWith(expect.objectContaining({ highlighted: true }))
  })

  it('shows header label for stats highlight', () => {
    renderFolio({ page: 'stats', label: 'HP check', focus: false })
    expect(screen.getByText('HP check')).toBeInTheDocument()
    expect(mocks.header).toHaveBeenCalledWith(expect.objectContaining({ highlighted: true, focusLabel: 'HP check' }))
  })

  it('shows banner for non-stats highlight without forcing focus', async () => {
    renderFolio({ page: 'notes', label: 'Mention detected', focus: false })
    expect(await screen.findByText('Mention detected')).toBeInTheDocument()
    const notesTab = screen.getByRole('tab', { name: /Notes/i })
    expect(notesTab).toHaveAttribute('data-state', 'inactive')
  })

  it('invokes onNoteCreated callback when FolioNotesPage requests save', () => {
    const onNoteCreated = vi.fn()
    renderWithCallbacks({ onNoteCreated })
    fireEvent.click(screen.getByText('save-note'))
    expect(onNoteCreated).toHaveBeenCalledWith('Journal Entry')
  })

  it('invokes onEquipmentChange callback when FolioGearPage triggers change', () => {
    const onEquipmentChange = vi.fn()
    renderWithCallbacks({ onEquipmentChange })
    fireEvent.click(screen.getByText('equip'))
    expect(onEquipmentChange).toHaveBeenCalledWith({ slot: 'main_hand', action: 'equip', itemName: 'Iron Sword' })
  })
})
