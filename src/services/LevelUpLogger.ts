export interface LevelUpLogPayload {
  characterId: string
  characterName: string
  characterClass: string
  levelBefore: number
  levelAfter: number
  xpSpent: number
  xpBefore: number
  xpAfter: number
  hpIncrease: number
  hpBefore: number
  hpAfter: number
  loadIncrease: number
  loadBefore: number
  loadAfter: number
  statIncreaseName?: string
  moveNames: string[]
  spellNames: string[]
}

export interface LevelUpLogOptions {
  includeNarrative?: boolean
}

/**
 * Chronicle removed: logging is now a no-op placeholder.
 */
export async function logLevelUpEvent(
  _payload: LevelUpLogPayload,
  _options: LevelUpLogOptions = {},
): Promise<string | null> {
  return null
}
