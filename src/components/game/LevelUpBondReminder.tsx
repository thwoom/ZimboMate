import type { BondReminderFocusDetail } from '@/constants/events'
import { ArrowRight, HeartHandshake, Sparkles } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { shallow } from 'zustand/shallow'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BOND_REMINDER_FOCUS_EVENT } from '@/constants/events'
import { useCharacterStore } from '@/stores/characterStore'

const reminderSelector = (state: ReturnType<typeof useCharacterStore>) => ({
  reminder: state.bondReminders[0] ?? null,
  dismissBondReminder: state.dismissBondReminder,
})

export default function LevelUpBondReminder(): JSX.Element | null {
  const { reminder, dismissBondReminder } = useCharacterStore(reminderSelector, shallow)
  const reminderId = reminder?.id

  const appliedSummary = useMemo(() => {
    if (!reminder) {
      return []
    }
    return [
      { label: 'Stat increase', applied: reminder.applied.stat },
      { label: 'New move', applied: reminder.applied.move },
      { label: 'Spell updates', applied: reminder.applied.spells },
    ]
  }, [reminder])

  const handleDismiss = useCallback(() => {
    if (reminderId) {
      dismissBondReminder(reminderId)
    }
  }, [dismissBondReminder, reminderId])

  const handleReviewBonds = useCallback(() => {
    if (!reminder) {
      return
    }

    if (typeof window !== 'undefined') {
      const detail: BondReminderFocusDetail = {
        characterId: reminder.characterId,
        level: reminder.level,
        applied: reminder.applied,
      }
      window.dispatchEvent(new CustomEvent(BOND_REMINDER_FOCUS_EVENT, { detail }))
    }

    dismissBondReminder(reminder.id)
  }, [dismissBondReminder, reminder])

  if (!reminder) {
    return null
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleDismiss()
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='space-y-2'>
          <DialogTitle className='flex items-center gap-2 text-balance'>
            <Sparkles className='size-5 text-primary' aria-hidden='true' />
            Level Up Complete - Revisit Bonds
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            Dungeon World asks every hero to reflect on their relationships after advancing.
            Take a moment to update {reminder.characterName}&apos;s bonds at level {reminder.level}.
          </DialogDescription>
        </DialogHeader>

        <div className='rounded-md border border-border/70 bg-muted/40 px-4 py-3 space-y-2'>
          <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
            <HeartHandshake className='size-4 text-chart-3' aria-hidden='true' />
            Advancement Snapshot
          </div>
          <ul className='space-y-1 text-sm'>
            {appliedSummary.map((entry) => (
              <li key={entry.label} className='flex items-center gap-2'>
                <Badge variant={entry.applied ? 'default' : 'outline'} size='sm'>
                  {entry.applied ? 'Applied' : 'Skipped'}
                </Badge>
                <span>{entry.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <Button variant='ghost' onClick={handleDismiss}>
            Later
          </Button>
          <Button variant='primary' onClick={handleReviewBonds}>
            <ArrowRight className='mr-2 size-4' aria-hidden='true' />
            Go To Bonds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
