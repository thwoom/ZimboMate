export const BOND_REMINDER_FOCUS_EVENT = 'zimbomate:focus-bonds' as const

export interface BondReminderFocusDetail {
  characterId: string
  level: number
  applied: {
    stat: boolean
    move: boolean
    spells: boolean
  }
}

