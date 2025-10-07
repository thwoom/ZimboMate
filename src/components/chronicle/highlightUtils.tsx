import type { LucideIcon } from 'lucide-react'
import type {
  ChronicleDeltaLog,
  Entity,
  EntityMentionRecord,
  EntityType,
  ResourceHistoryState,
  ResourceLogEntry,
} from '@/types/chronicle'
import {
  AlertTriangle,
  Coins,
  Handshake,
  Heart,
  Sparkles,
  Target,
} from 'lucide-react'
import React from 'react'

const relativeTimeFormatter =
  typeof Intl !== 'undefined' && 'RelativeTimeFormat' in Intl
    ? new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
    : null

export function formatRelativeTimeFromNow(date: Date): string {
  if (!relativeTimeFormatter) {
    return date.toLocaleTimeString()
  }

  const diffMs = date.getTime() - Date.now()
  const absMs = Math.abs(diffMs)

  if (absMs < 60_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 1_000), 'second')
  }

  if (absMs < 3_600_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 60_000), 'minute')
  }

  if (absMs < 86_400_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 3_600_000), 'hour')
  }

  return relativeTimeFormatter.format(Math.round(diffMs / 86_400_000), 'day')
}
export interface MentionHighlight {
  entityId: string
  entityName: string
  entityType: EntityType
  record: EntityMentionRecord
}

export const EMPTY_RESOURCE_HISTORY: ResourceHistoryState = {
  xp: {},
  bonds: {},
  hold: {},
  debilities: {},
  hp: {},
  coin: {},
}

export function collectMentionHighlights(
  bundle: ChronicleDeltaLog | null,
  entities: Entity[],
): MentionHighlight[] {
  if (!bundle) return []

  const { entryId } = bundle
  const highlights: MentionHighlight[] = []

  entities.forEach((entity) => {
    const history = Array.isArray(entity.mentionHistory)
      ? entity.mentionHistory
      : []

    history.forEach((record) => {
      if (record.entryId === entryId) {
        highlights.push({
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          record,
        })
      }
    })
  })

  return highlights.sort(
    (a, b) =>
      new Date(b.record.createdAt).getTime() -
      new Date(a.record.createdAt).getTime(),
  )
}

export interface ResourceChangeContext {
  log: ResourceLogEntry
  characterId: string
}

export function collectResourceChanges(
  bundle: ChronicleDeltaLog | null,
  history: ResourceHistoryState,
): ResourceChangeContext[] {
  if (!bundle) return []

  const { bundleId } = bundle
  const collected: ResourceChangeContext[] = []

  const collectLedger = <T extends ResourceLogEntry>(ledger: Record<string, T[]>) => {
    Object.entries(ledger).forEach(([characterId, logs]) => {
      logs.forEach((log) => {
        if (log.bundleId === bundleId) {
          collected.push({ log, characterId })
        }
      })
    })
  }

  collectLedger(history.hp)
  collectLedger(history.coin)
  collectLedger(history.xp)
  collectLedger(history.bonds)
  collectLedger(history.hold)
  collectLedger(history.debilities)

  return collected.sort(
    (a, b) =>
      new Date(b.log.createdAt).getTime() - new Date(a.log.createdAt).getTime(),
  )
}

export interface ResourceChangeDisplay {
  key: string
  Icon: LucideIcon
  colorClass: string
  message: string
  detail?: string
}

export const resourceIconMeta: Record<
  ResourceLogEntry['type'],
  { Icon: LucideIcon; colorClass: string }
> = {
  hp: { Icon: Heart, colorClass: 'text-destructive' },
  coin: { Icon: Coins, colorClass: 'text-chart-4' },
  xp: { Icon: Sparkles, colorClass: 'text-primary' },
  bond: { Icon: Handshake, colorClass: 'text-accent' },
  hold: { Icon: Target, colorClass: 'text-chart-2' },
  debility: { Icon: AlertTriangle, colorClass: 'text-amber-500' },
}

export function describeResourceChange(
  entry: ResourceChangeContext,
  resolveCharacterName: (characterId?: string | null) => string,
): ResourceChangeDisplay | null {
  const { log, characterId } = entry
  const meta = resourceIconMeta[log.type]
  const characterName = resolveCharacterName(characterId)

  switch (log.type) {
    case 'hp': {
      const delta = log.delta
      const verb = delta < 0 ? 'lost' : 'gained'
      const amount = Math.abs(delta)
      return {
        key: `${log.id}-hp`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} ${verb} ${amount} HP`,
        detail: `${log.previous} → ${log.next}`,
      }
    }
    case 'coin': {
      const delta = log.amount
      const verb = delta < 0 ? 'spent' : 'received'
      const amount = Math.abs(delta)
      return {
        key: `${log.id}-coin`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} ${verb} ${amount} coin`,
        detail: `${log.previous} → ${log.next}`,
      }
    }
    case 'xp': {
      return {
        key: `${log.id}-xp`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} gained ${log.amount} XP`,
        detail: `${log.previous} → ${log.next}`,
      }
    }
    case 'bond': {
      const action = log.action === 'add' ? 'added bond' : 'resolved bond'
      return {
        key: `${log.id}-bond`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} ${action}`,
        detail: log.text,
      }
    }
    case 'hold': {
      const change = log.change
      const verb = change > 0 ? 'gained' : 'spent'
      const amount = Math.abs(change)
      return {
        key: `${log.id}-hold`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} ${verb} ${amount} hold (${log.moveName})`,
        detail: `${log.remaining} remaining`,
      }
    }
    case 'debility': {
      const action = log.action === 'add' ? 'gained' : 'cleared'
      return {
        key: `${log.id}-debility`,
        Icon: meta.Icon,
        colorClass: meta.colorClass,
        message: `${characterName} ${action} the ${log.debility} debility`,
      }
    }
    default:
      return null
  }
}

export function formatActorLabel(actor?: ChronicleDeltaLog['actor']): string {
  switch (actor) {
    case 'auto':
      return 'Auto-applied'
    case 'manual':
      return 'Applied via confirm'
    case 'user':
      return 'User action'
    case 'system':
      return 'System action'
    default:
      return 'System action'
  }
}

const MAX_MENTION_SNIPPET_LENGTH = 160

const escapeRegExp = (value: string): string =>
  value.replace(/[\^$.*+?()[\]{}|]/g, '\\$&')

export function buildMentionContext(
  record: EntityMentionRecord,
  fallback: string,
): React.ReactNode {
  const base = record.context?.trim() || fallback.trim()
  if (!base) return '-'

  const trimmed =
    base.length > MAX_MENTION_SNIPPET_LENGTH
      ? `${base.slice(0, MAX_MENTION_SNIPPET_LENGTH - 1)}.`
      : base

  if (!record.mentionText) {
    return trimmed
  }

  const pattern = new RegExp(`(${escapeRegExp(record.mentionText)})`, 'gi')
  return trimmed.split(pattern).map((segment, index) => {
    const key = `${record.entryId}-snippet-${index}`
    if (index % 2 === 1) {
      return (
        <mark key={key} className='bg-yellow-200 text-chart-4 px-1 rounded'>
          {segment}
        </mark>
      )
    }
    return <React.Fragment key={key}>{segment}</React.Fragment>
  })
}

