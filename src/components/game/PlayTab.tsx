/**
 * PlayTab - Story-forward tabletop dash where the secretary and folio stay in sync.
 */

import type { FolioHighlight } from '@/components/game/CharacterSheet/Folio'
import type { EquipmentChange } from '@/components/game/CharacterSheet/FolioGearPage'
import type { BondReminderFocusDetail } from '@/constants/events'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RollHUD } from '@/components/dice/RollHUD'
import Folio from '@/components/game/CharacterSheet/Folio'
import { RightRail, SplitPane } from '@/components/layout'
import { BOND_REMINDER_FOCUS_EVENT } from '@/constants/events'
import { cn } from '@/lib/utils'
import { useCharacterStore } from '../../stores/characterStore'
import { useCapabilities } from '@/hooks/useCapabilities'
import { Button, Card, CardContent } from '../ui'
import { NonChronicleRightRail } from './NonChronicleRightRail'
import { SecretaryPanel } from '@/components/secretary/SecretaryPanel'

interface PlayTabProps {
  className?: string
}


const SLOT_LABELS: Record<string, string> = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  armor: 'Armor',
}

export const PlayTab: React.FC<PlayTabProps> = ({
  className = '',
}) => {
  useCapabilities()
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()
  const [transientFolioHighlight, setTransientFolioHighlight] =
    useState<FolioHighlight | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashFolioHighlight = useCallback(
    (highlight: FolioHighlight, duration = 3000) => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      setTransientFolioHighlight({ ...highlight, focus: true })
      highlightTimeoutRef.current = setTimeout(() => {
        setTransientFolioHighlight(null)
      }, duration)
    },
    [],
  )

  useEffect(() => {
    const handler: EventListener = (event) => {
      const customEvent = event as CustomEvent<BondReminderFocusDetail>
      const levelLabel =
        typeof customEvent.detail?.level === 'number'
          ? `Level ${customEvent.detail.level}: revisit bonds`
          : 'Review bonds after level up'
      flashFolioHighlight(
        {
          page: 'bonds',
          label: levelLabel,
          focus: true,
        },
        6000,
      )
    }

    window.addEventListener(BOND_REMINDER_FOCUS_EVENT, handler)
    return () => {
      window.removeEventListener(BOND_REMINDER_FOCUS_EVENT, handler)
    }
  }, [flashFolioHighlight])

  const folioHighlight: FolioHighlight | null = transientFolioHighlight

  const handleNoteCreated = useCallback(
    (noteTitle?: string) => {
      const label = noteTitle ? `Saved note: ${noteTitle}` : 'Note saved'
      flashFolioHighlight({ page: 'notes', label, focus: true })
    },
    [flashFolioHighlight],
  )

  const handleFolioEquipmentChange = useCallback(
    ({ slot, action, itemName }: EquipmentChange) => {
      const slotLabel = SLOT_LABELS[slot] ?? slot
      const baseName = itemName ?? 'item'
      const label =
        action === 'equip'
          ? `Equipped ${baseName} (${slotLabel})`
          : `Unequipped ${baseName} (${slotLabel})`
      flashFolioHighlight({ page: 'gear', label, focus: true })
    },
    [flashFolioHighlight],
  )

  if (!activeCharacter) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('p-4', className)}
      >
        <Card variant='magical'>
          <CardContent className='p-6 pt-6'>
            <div className='space-y-4 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                <BookOpen size={24} className='text-muted-foreground' />
              </div>
              <div>
                <h2 className='mb-2 text-lg font-display'>
                  Ready to Play?
                </h2>
                <p className='mb-4 text-sm text-muted-foreground'>
                  Create or select a character to begin your session.
                </p>
                <Button variant='primary' size='sm'>
                  Create Character
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col overflow-x-hidden bg-background',
        className,
      )}
    >
      <SplitPane
        className='flex-1 min-h-0 gap-4 overflow-hidden p-4 md:p-6'
        showGutter={false}
        left={
          <Folio
            highlight={folioHighlight}
            onNoteCreated={handleNoteCreated}
            onEquipmentChange={handleFolioEquipmentChange}
            className='h-full min-h-0'
          />
        }
        right={
          <RightRail
            className='h-full min-h-0'
            header={
              <div className='space-y-3 px-6 py-4'>
                <motion.div
                  className='w-full'
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <RollHUD characterId={activeCharacter?.id} className='w-full' />
                </motion.div>
              </div>
            }
          >
            <div className='flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-6'>
              <SecretaryPanel />
              <NonChronicleRightRail />
            </div>
          </RightRail>
        }
      />
    </div>
  )
}

export default PlayTab












