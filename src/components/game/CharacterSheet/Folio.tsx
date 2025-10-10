import type { EquipmentChange } from './FolioGearPage'
import React, { useEffect, useMemo, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import FolioBondsDebilitiesPage from './FolioBondsDebilitiesPage'
import FolioGearPage from './FolioGearPage'
import FolioHeader from './FolioHeader'
import FolioNotesPage from './FolioNotesPage'
import FolioSpellsPage from './FolioSpellsPage'
import FolioStatsPage from './FolioStatsPage'

export type FolioPage = 'stats' | 'gear' | 'spells' | 'bonds' | 'notes'

export interface FolioHighlight {
  page: FolioPage
  label?: string
  focus?: boolean
}

export interface FolioProps {
  className?: string
  defaultPage?: FolioPage
  highlight?: FolioHighlight | null
  onNoteCreated?: (title?: string) => void
  onEquipmentChange?: (change: EquipmentChange) => void
}

const pageLabels: Record<FolioPage, string> = {
  stats: 'Stats',
  gear: 'Gear',
  spells: 'Spells',
  bonds: 'Bonds & Debilities',
  notes: 'Notes',
}

/**
 * Matsu-perfect character folio: always actionable, non-skeuomorphic.
 */
export default function Folio({
  className,
  defaultPage = 'stats',
  highlight = null,
  onNoteCreated,
  onEquipmentChange,
}: FolioProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState<FolioPage>(defaultPage)

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setCurrentPage(defaultPage)
  }, [defaultPage])

  useEffect(() => {
    if (highlight?.focus && highlight.page !== currentPage) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setCurrentPage(highlight.page)
    }
  }, [highlight?.focus, highlight?.page, currentPage])

  const highlightLabel = useMemo(() => {
    if (!highlight) return null
    return highlight.label ?? `Focus: ${pageLabels[highlight.page]}`
  }, [highlight])

  return (
    <div
      data-slot='folio'
      className={cn('flex min-w-[320px] flex-col gap-3', className)}
    >
      <FolioHeader highlighted={highlight?.page === 'stats'} focusLabel={highlight?.page === 'stats' ? highlightLabel : undefined} />
      {highlight && highlight.page !== 'stats' && (
        <div className='rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary whitespace-normal break-words'>
          {highlightLabel}
        </div>
      )}
      <Tabs
        value={currentPage}
        onValueChange={(value) => setCurrentPage(value as FolioPage)}
        className='min-w-0'
      >
        <TabsList className='w-full gap-1'>
          <TabsTrigger value='stats'>Stats & Basic Moves</TabsTrigger>
          <TabsTrigger value='gear'>Gear & Load</TabsTrigger>
          <TabsTrigger value='spells'>Spells & Hold</TabsTrigger>
          <TabsTrigger value='bonds'>Bonds & Debilities</TabsTrigger>
          <TabsTrigger value='notes'>Notes</TabsTrigger>
        </TabsList>
        <TabsContent value='stats' className='min-w-0'>
          <FolioStatsPage highlighted={highlight?.page === 'stats'} />
        </TabsContent>
        <TabsContent value='gear'>
          <FolioGearPage
            highlighted={highlight?.page === 'gear'}
            onEquipmentChange={onEquipmentChange}
          />
        </TabsContent>
        <TabsContent value='spells'>
          <FolioSpellsPage highlighted={highlight?.page === 'spells'} />
        </TabsContent>
        <TabsContent value='bonds'>
          <FolioBondsDebilitiesPage highlighted={highlight?.page === 'bonds'} />
        </TabsContent>
        <TabsContent value='notes'>
          <FolioNotesPage highlighted={highlight?.page === 'notes'} onNoteCreated={onNoteCreated} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
