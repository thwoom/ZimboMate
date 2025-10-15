import type { CharacterClass } from '@/models/Character'
import { logger } from '@/utils/logger'

export interface LevelUpTelemetryEvent {
  id: string
  recordedAt: string
  event: 'level_up.confirmed'
  characterId: string
  characterClass: CharacterClass
  newLevel: number
  applied: {
    stat: boolean
    move: boolean
    spells: boolean
  }
}

type LevelUpTelemetrySubscriber = (event: LevelUpTelemetryEvent) => void

export interface PublishLevelUpTelemetryInput {
  characterId: string
  characterClass: CharacterClass
  newLevel: number
  applied: {
    stat: boolean
    move: boolean
    spells: boolean
  }
  recordedAt?: string
  eventId?: string
}

const HISTORY_LIMIT = 100
const WINDOW_EVENT = 'zimbomate:level-up-telemetry'

const history: LevelUpTelemetryEvent[] = []
const subscribers = new Set<LevelUpTelemetrySubscriber>()

function cloneEvent(event: LevelUpTelemetryEvent): LevelUpTelemetryEvent {
  return JSON.parse(JSON.stringify(event)) as LevelUpTelemetryEvent
}

function dispatchToWindow(event: LevelUpTelemetryEvent) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<LevelUpTelemetryEvent>(WINDOW_EVENT, { detail: event }))
}

export function publishLevelUpTelemetry(input: PublishLevelUpTelemetryInput): LevelUpTelemetryEvent {
  const timestamp = input.recordedAt ?? new Date().toISOString()
  const id =
    input.eventId ??
    `level-up-${input.characterId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const event: LevelUpTelemetryEvent = {
    id,
    recordedAt: timestamp,
    event: 'level_up.confirmed',
    characterId: input.characterId,
    characterClass: input.characterClass,
    newLevel: input.newLevel,
    applied: {
      stat: Boolean(input.applied.stat),
      move: Boolean(input.applied.move),
      spells: Boolean(input.applied.spells),
    },
  }

  history.unshift(event)
  if (history.length > HISTORY_LIMIT) {
    history.length = HISTORY_LIMIT
  }

  logger.info('analytics.level_up_confirmed', event)

  subscribers.forEach((subscriber) => {
    try {
      subscriber(cloneEvent(event))
    } catch (error) {
      logger.error('[levelUpTelemetry] subscriber failed', error)
    }
  })

  dispatchToWindow(event)

  return event
}

export function subscribeLevelUpTelemetry(
  subscriber: LevelUpTelemetrySubscriber,
): () => void {
  subscribers.add(subscriber)
  return () => subscribers.delete(subscriber)
}

export function getLevelUpTelemetryHistory(limit = HISTORY_LIMIT): LevelUpTelemetryEvent[] {
  if (limit <= 0) return []
  return history.slice(0, Math.min(limit, HISTORY_LIMIT)).map(cloneEvent)
}

export function getLevelUpTelemetryEventName(): string {
  return WINDOW_EVENT
}

export function __resetLevelUpTelemetryForTests(): void {
  history.length = 0
  subscribers.clear()
}

