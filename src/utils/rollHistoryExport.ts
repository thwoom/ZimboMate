/* eslint-disable prefer-template */
/**
 * Roll History Export Utilities
 * Lightweight helpers for serialising dice history into plain formats
 */

import type { RollResult } from '../stores/diceStore'
import { format } from 'date-fns'
import { compatibility } from './browserCompatibility'

export type ExportFormat = 'plain' | 'markdown' | 'csv' | 'json' | 'discord' | 'rptools'

export interface ExportOptions {
  format: ExportFormat
  includeCharacterInfo?: boolean
  includeTimestamps?: boolean
  includeModifiers?: boolean
  includeEffects?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  rollTypes?: RollResult['type'][]
  outcomes?: RollResult['outcome'][]
  maxRolls?: number
}

export interface ExportResult {
  content: string
  filename: string
  mimeType: string
}

const outcomeToken: Record<RollResult['outcome'], string> = {
  success: 'success',
  partial: 'partial',
  failure: 'failure',
}

const outcomeMarker: Record<RollResult['outcome'], string> = {
  success: '[hit]',
  partial: '[mix]',
  failure: '[miss]',
}

function toDiceNotation(roll: RollResult): string {
  if (roll.modifier === 0)
    return '2d6'
  const sign = roll.modifier > 0 ? '+' : ''
  return `2d6${sign}${roll.modifier}`
}

export function filterRolls(rolls: RollResult[], options: ExportOptions): RollResult[] {
  let filtered = [...rolls]

  if (options.dateRange) {
    const startTime = options.dateRange.start.getTime()
    const endTime = options.dateRange.end.getTime()
    filtered = filtered.filter(roll => roll.timestamp >= startTime && roll.timestamp <= endTime)
  }

  if (options.rollTypes?.length) {
    const typeSet = new Set(options.rollTypes)
    filtered = filtered.filter(roll => typeSet.has(roll.type))
  }

  if (options.outcomes?.length) {
    const outcomeSet = new Set(options.outcomes)
    filtered = filtered.filter(roll => outcomeSet.has(roll.outcome))
  }

  if (typeof options.maxRolls === 'number') {
    filtered = filtered.slice(0, Math.max(1, options.maxRolls))
  }

  return filtered
}

function formatEffects(roll: RollResult): string | null {
  const effects: string[] = []
  if (roll.effects?.xpAwarded)
    effects.push('+1 XP')
  if (roll.effects?.holdGranted)
    effects.push(`+${roll.effects.holdGranted} Hold`)
  if (!effects.length)
    return null
  return effects.join(', ')
}

function buildPlainSummary(roll: RollResult, options: ExportOptions): string {
  const modifierText = roll.modifier !== 0 ? ` ${roll.modifier > 0 ? '+' : ''}${Math.abs(roll.modifier)}` : ''
  const notation = options.includeModifiers && roll.modifier !== 0 ? ` (${toDiceNotation(roll)})` : ''
  const timestamp = options.includeTimestamps ? ` [${format(roll.timestamp, 'yyyy-MM-dd HH:mm')}]` : ''
  const characterInfo = options.includeCharacterInfo ? ` - ${roll.characterId}` : ''
  const effects = options.includeEffects ? formatEffects(roll) : null

  let summary = `${roll.context.label}: ${roll.dice1} + ${roll.dice2}${modifierText} = ${roll.finalResult} (${outcomeToken[roll.outcome]})${notation}${timestamp}${characterInfo}`
  if (effects) {
    summary += ` | ${effects}`
  }

  return summary
}

export function exportAsPlainText(rolls: RollResult[], options: ExportOptions): string {
  if (rolls.length === 0)
    return 'No rolls match the selected filters.'

  const lines: string[] = []
  lines.push('=== Dice Roll History ===')
  lines.push(`Total rolls: ${rolls.length}`)
  lines.push('')

  rolls.forEach((roll) => {
    lines.push(buildPlainSummary(roll, options))
  })

  return lines.join('\n')
}

export function exportAsMarkdown(rolls: RollResult[], options: ExportOptions): string {
  if (rolls.length === 0)
    return '*No rolls to display.*'

  const includeTimestamps = options.includeTimestamps
  const grouped = includeTimestamps
    ? rolls.reduce<Record<string, RollResult[]>>((acc, roll) => {
        const key = format(roll.timestamp, 'yyyy-MM-dd')
        acc[key] = acc[key] || []
        acc[key].push(roll)
        return acc
      }, {})
    : { all: rolls }

  const lines: string[] = []
  lines.push('# Dice Roll History')
  lines.push('')

  Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .forEach(([key, groupedRolls]) => {
      if (includeTimestamps && key !== 'all') {
        lines.push(`## ${format(new Date(key), 'MMMM do, yyyy')}`)
        lines.push('')
      }

      groupedRolls.forEach((roll) => {
        const base = '- **' + roll.context.label + '** -> `' + toDiceNotation(roll) + '` = **' + roll.finalResult + '** ' + outcomeMarker[roll.outcome]
        const extras: string[] = []
        if (options.includeCharacterInfo)
          extras.push(roll.characterId)
        if (options.includeEffects) {
          const effects = formatEffects(roll)
          if (effects)
            extras.push(effects)
        }
        if (options.includeTimestamps)
          extras.push(format(roll.timestamp, 'HH:mm'))

        lines.push(extras.length ? base + ' _(' + extras.join(' | ') + ')_' : base)
      })

      lines.push('')
    })

  return lines.join('\n').trimEnd()
}

export function exportAsCSV(rolls: RollResult[], options: ExportOptions): string {
  const header = [
    'timestamp',
    'characterId',
    'type',
    'label',
    'dice1',
    'dice2',
    'modifier',
    'total',
    'outcome',
    'effects',
  ]

  const rows = rolls.map((roll) => {
    const effects = options.includeEffects ? (formatEffects(roll) ?? '') : ''
    return [
      format(roll.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      roll.characterId,
      roll.type,
      roll.context.label.replace(/"/g, '""'),
      roll.dice1.toString(),
      roll.dice2.toString(),
      roll.modifier.toString(),
      roll.finalResult.toString(),
      roll.outcome,
      effects.replace(/"/g, '""'),
    ]
  })

  return [header, ...rows]
    .map(row => row.map(value => '"' + value + '"').join(','))
    .join('\n')
}

export function exportAsJSON(rolls: RollResult[]): string {
  return JSON.stringify(rolls, null, 2)
}

export function exportAsDiscord(rolls: RollResult[], options: ExportOptions): string {
  if (rolls.length === 0)
    return 'No rolls yet.'

  const lines: string[] = []
  lines.push('**Dice Highlights**')

  rolls.slice(0, 10).forEach((roll) => {
    const summary = '- **' + roll.context.label + '** -> `' + roll.finalResult + '` (' + roll.type + ') ' + outcomeMarker[roll.outcome]
    const extras: string[] = []
    if (options.includeModifiers && roll.modifier !== 0)
      extras.push(toDiceNotation(roll))
    const effects = options.includeEffects ? formatEffects(roll) : null
    if (effects)
      extras.push(effects)
    if (options.includeCharacterInfo)
      extras.push(roll.characterId)

    lines.push(extras.length ? summary + ' _(' + extras.join(' | ') + ')_' : summary)
  })

  if (rolls.length > 10) {
    lines.push('...and ' + (rolls.length - 10) + ' more rolls')
  }

  return lines.join('\n')
}

export function exportAsRPTools(rolls: RollResult[]): string {
  if (rolls.length === 0)
    return '; No rolls to export'

  const lines: string[] = []
  lines.push('; RPTools / MapTool dice export generated by ZimboMate')
  lines.push('; ================================================')

  rolls.forEach((roll, index) => {
    lines.push('; Roll ' + (index + 1) + ': ' + roll.context.label)
    lines.push('/roll ' + toDiceNotation(roll) + ' ; Result: ' + roll.finalResult + ' (' + roll.outcome + ')')
    const effects = formatEffects(roll)
    if (effects) {
      lines.push('; Effects: ' + effects)
    }
    lines.push('')
  })

  return lines.join('\n').trimEnd()
}

export function exportRollHistory(rolls: RollResult[], options: ExportOptions): ExportResult {
  const filteredRolls = filterRolls(rolls, options)
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')

  let content: string
  let filename: string
  let mimeType: string

  switch (options.format) {
    case 'markdown':
      content = exportAsMarkdown(filteredRolls, options)
      filename = 'dice-rolls_' + timestamp + '.md'
      mimeType = 'text/markdown'
      break
    case 'csv':
      content = exportAsCSV(filteredRolls, options)
      filename = 'dice-rolls_' + timestamp + '.csv'
      mimeType = 'text/csv'
      break
    case 'json':
      content = exportAsJSON(filteredRolls)
      filename = 'dice-rolls_' + timestamp + '.json'
      mimeType = 'application/json'
      break
    case 'discord':
      content = exportAsDiscord(filteredRolls, options)
      filename = 'dice-rolls_discord_' + timestamp + '.txt'
      mimeType = 'text/plain'
      break
    case 'rptools':
      content = exportAsRPTools(filteredRolls)
      filename = 'dice-rolls_rptools_' + timestamp + '.txt'
      mimeType = 'text/plain'
      break
    default:
      content = exportAsPlainText(filteredRolls, options)
      filename = 'dice-rolls_' + timestamp + '.txt'
      mimeType = 'text/plain'
      break
  }

  return { content, filename, mimeType }
}

export async function copyExportToClipboard(rolls: RollResult[], options: ExportOptions): Promise<boolean> {
  const exportResult = exportRollHistory(rolls, options)
  return compatibility.copyToClipboard(exportResult.content)
}

export function downloadExport(rolls: RollResult[], options: ExportOptions): void {
  const exportResult = exportRollHistory(rolls, options)
  const blob = new Blob([exportResult.content], { type: exportResult.mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = exportResult.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function getExportPreview(rolls: RollResult[], options: ExportOptions, maxLines: number = 10): string {
  const previewRolls = rolls.slice(0, Math.min(5, rolls.length))
  const exportResult = exportRollHistory(previewRolls, options)
  const lines = exportResult.content.split('\n')
  if (lines.length <= maxLines)
    return exportResult.content
  return lines.slice(0, maxLines).join('\n') + '\n...'
}
