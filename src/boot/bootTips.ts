export interface BootTip {
  id: string
  title: string
  body: string
}

export const bootTips: BootTip[] = [
  {
    id: 'story-modes',
    title: 'Story Modes',
    body: 'Use the Mode Selector in the header to toggle between sheet-only play experiences.',
  },
  {
    id: 'dice-magic',
    title: 'Dice Magic',
    body: 'Hit the D key while focused on the board to open the dice HUD.',
  },
  {
    id: 'session-journal',
    title: 'Session Journal',
    body: 'Use the right-rail notes and session tools to keep a quick log of what happened.',
  },
  {
    id: 'offline-friendly',
    title: 'Offline Friendly',
    body: 'All stores sync locally first, so you can keep playing even when offline.',
  },
]
