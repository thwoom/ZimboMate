/**
 * Roll History Export Utilities
 * Provides various export formats for dice roll history
 */

import { format } from 'date-fns'
import { RollResult } from '../stores/diceStore'
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
  rollTypes?: ('stat' | 'move' | 'custom')[]
  outcomes?: ('success' | 'partial' | 'failure')[]
  maxRolls?: number
}

export interface ExportResult {
  content: string
  filename: string
  mimeType: string
}

// Filter rolls based on export options
export const filterRolls = (rolls: RollResult[], options: ExportOptions): RollResult[] => {
  let filtered = [...rolls]

  // Filter by date range
  if (options.dateRange) {
    filtered = filtered.filter(roll =>
      roll.timestamp >= options.dateRange!.start.getTime() &&
      roll.timestamp <= options.dateRange!.end.getTime()
    )
  }

  // Filter by roll types
  if (options.rollTypes && options.rollTypes.length > 0) {
    filtered = filtered.filter(roll => options.rollTypes!.includes(roll.context.type))
  }

  // Filter by outcomes
  if (options.outcomes && options.outcomes.length > 0) {
    filtered = filtered.filter(roll => options.outcomes!.includes(roll.outcome))
  }

  // Limit number of rolls
  if (options.maxRolls) {
    filtered = filtered.slice(0, options.maxRolls)
  }

  return filtered
}

// Export as plain text
export const exportAsPlainText = (rolls: RollResult[], options: ExportOptions): string => {
  const lines: string[] = []

  lines.push('=== DICE ROLL HISTORY ===')
  lines.push('')

  if (rolls.length === 0) {
    lines.push('No rolls match the selected criteria.')
    return lines.join('\n')
  }

  lines.push(`Total rolls: ${rolls.length}`)
  lines.push('')

  rolls.forEach(roll => {
    let line = `${roll.description}: ${roll.total}`

    if (options.includeModifiers && roll.modifiers?.length) {
      const modText = roll.modifiers.map(m => `${m.value >= 0 ? '+' : ''}${m.value} (${m.source})`).join(', ')
      line += ` [${modText}]`
    }

    line += ` - ${roll.outcome.toUpperCase()}`

    if (options.includeEffects && (roll.effects?.xpAwarded || roll.effects?.holdGranted)) {
      const effects: string[] = []
      if (roll.effects.xpAwarded) effects.push('+1 XP')
      if (roll.effects.holdGranted) effects.push(`+${roll.effects.holdGranted} Hold`)
      line += ` • ${effects.join(', ')}`
    }

    if (options.includeTimestamps) {
      line += ` [${format(roll.timestamp, 'MMM dd, HH:mm')}]`
    }

    lines.push(line)
  })

  return lines.join('\n')
}

// Export as Markdown
export const exportAsMarkdown = (rolls: RollResult[], options: ExportOptions): string => {
  const lines: string[] = []

  lines.push('# Dice Roll History')
  lines.push('')

  if (rolls.length === 0) {
    lines.push('*No rolls match the selected criteria.*')
    return lines.join('\n')
  }

  lines.push(`**Total rolls:** ${rolls.length}`)
  lines.push('')

  // Group by date if timestamps are included
  if (options.includeTimestamps) {
    const groupedByDate = rolls.reduce((groups, roll) => {
      const date = format(roll.timestamp, 'yyyy-MM-dd')
      if (!groups[date]) groups[date] = []
      groups[date].push(roll)
      return groups
    }, {} as Record<string, RollResult[]>)

    Object.entries(groupedByDate)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([date, dateRolls]) => {
        lines.push(`## ${format(new Date(date), 'MMMM do, yyyy')}`)
        lines.push('')

        dateRolls.forEach(roll => {
          let line = `- **${roll.description}:** ${roll.total}`

          if (options.includeModifiers && roll.modifiers?.length) {
            const modText = roll.modifiers.map(m => `${m.value >= 0 ? '+' : ''}${m.value} (${m.source})`).join(', ')
            line += ` \`[${modText}]\``
          }

          const outcomeEmoji = { success: '✅', partial: '⚡', failure: '💪' }
          line += ` ${outcomeEmoji[roll.outcome]} *${roll.outcome}*`

          if (options.includeEffects && (roll.effects?.xpAwarded || roll.effects?.holdGranted)) {
            const effects: string[] = []
            if (roll.effects.xpAwarded) effects.push('🌟 +1 XP')
            if (roll.effects.holdGranted) effects.push(`🛡️ +${roll.effects.holdGranted} Hold`)
            line += ` • ${effects.join(', ')}`
          }

          line += ` *${format(roll.timestamp, 'HH:mm')}*`

          lines.push(line)
        })

        lines.push('')
      })
  } else {
    // Simple list without date grouping
    rolls.forEach(roll => {
      let line = `- **${roll.description}:** ${roll.total}`

      if (options.includeModifiers && roll.modifiers?.length) {
        const modText = roll.modifiers.map(m => `${m.value >= 0 ? '+' : ''}${m.value} (${m.source})`).join(', ')
        line += ` \`[${modText}]\``
      }

      const outcomeEmoji = { success: '✅', partial: '⚡', failure: '💪' }
      line += ` ${outcomeEmoji[roll.outcome]} *${roll.outcome}*`

      if (options.includeEffects && (roll.effects?.xpAwarded || roll.effects?.holdGranted)) {
        const effects: string[] = []
        if (roll.effects.xpAwarded) effects.push('🌟 +1 XP')
        if (roll.effects.holdGranted) effects.push(`🛡️ +${roll.effects.holdGranted} Hold`)
        line += ` • ${effects.join(', ')}`
      }

      lines.push(line)
    })
  }

  return lines.join('\n')
}

// Export as CSV
export const exportAsCSV = (rolls: RollResult[], options: ExportOptions): string => {
  const headers: string[] = ['Description', 'Total', 'Dice1', 'Dice2', 'Outcome']

  if (options.includeModifiers) {
    headers.push('Modifiers', 'ModifierTotal')
  }

  if (options.includeTimestamps) {
    headers.push('Timestamp', 'Date', 'Time')
  }

  if (options.includeEffects) {
    headers.push('XP_Awarded', 'Hold_Granted')
  }

  if (options.includeCharacterInfo) {
    headers.push('Character_ID', 'Roll_Type')
  }

  const rows: string[] = [headers.join(',')]

  rolls.forEach(roll => {
    const row: string[] = [
      `"${roll.description.replace(/"/g, '""')}"`,
      roll.total.toString(),
      roll.dice1.toString(),
      roll.dice2.toString(),
      roll.outcome
    ]

    if (options.includeModifiers) {
      const modifierText = roll.modifiers?.map(m => `${m.source}:${m.value}`).join(';') || ''
      const modifierTotal = roll.modifiers?.reduce((sum, m) => sum + m.value, 0) || 0
      row.push(`"${modifierText}"`, modifierTotal.toString())
    }

    if (options.includeTimestamps) {
      const date = new Date(roll.timestamp)
      row.push(
        roll.timestamp.toString(),
        format(date, 'yyyy-MM-dd'),
        format(date, 'HH:mm:ss')
      )
    }

    if (options.includeEffects) {
      row.push(
        roll.effects?.xpAwarded ? 'true' : 'false',
        roll.effects?.holdGranted?.toString() || '0'
      )
    }

    if (options.includeCharacterInfo) {
      row.push(
        roll.characterId || '',
        roll.context.type
      )
    }

    rows.push(row.join(','))
  })

  return rows.join('\n')
}

// Export as JSON
export const exportAsJSON = (rolls: RollResult[], options: ExportOptions): string => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRolls: rolls.length,
      options: {
        includeCharacterInfo: options.includeCharacterInfo,
        includeTimestamps: options.includeTimestamps,
        includeModifiers: options.includeModifiers,
        includeEffects: options.includeEffects
      }
    },
    rolls: rolls.map(roll => {
      const exportRoll: any = {
        id: roll.id,
        description: roll.description,
        total: roll.total,
        dice1: roll.dice1,
        dice2: roll.dice2,
        outcome: roll.outcome
      }

      if (options.includeModifiers && roll.modifiers) {
        exportRoll.modifiers = roll.modifiers
      }

      if (options.includeTimestamps) {
        exportRoll.timestamp = roll.timestamp
        exportRoll.date = new Date(roll.timestamp).toISOString()
      }

      if (options.includeEffects && roll.effects) {
        exportRoll.effects = roll.effects
      }

      if (options.includeCharacterInfo) {
        exportRoll.characterId = roll.characterId
        exportRoll.context = roll.context
      }

      return exportRoll
    })
  }

  return JSON.stringify(exportData, null, 2)
}

// Export for Discord (formatted text with emojis)
export const exportAsDiscord = (rolls: RollResult[], options: ExportOptions): string => {
  const lines: string[] = []

  lines.push('🎲 **Dice Roll Session** 🎲')
  lines.push('')

  if (rolls.length === 0) {
    lines.push('*No rolls to display.*')
    return lines.join('\n')
  }

  // Summary statistics
  const stats = {
    total: rolls.length,
    successes: rolls.filter(r => r.outcome === 'success').length,
    partials: rolls.filter(r => r.outcome === 'partial').length,
    failures: rolls.filter(r => r.outcome === 'failure').length,
    totalXP: rolls.filter(r => r.effects?.xpAwarded).length,
    totalHold: rolls.reduce((sum, r) => sum + (r.effects?.holdGranted || 0), 0)
  }

  lines.push(`📊 **Session Summary:**`)
  lines.push(`• ${stats.total} total rolls`)
  lines.push(`• ✅ ${stats.successes} successes • ⚡ ${stats.partials} partials • 💪 ${stats.failures} failures`)
  if (stats.totalXP > 0) lines.push(`• 🌟 ${stats.totalXP} XP awarded`)
  if (stats.totalHold > 0) lines.push(`• 🛡️ ${stats.totalHold} Hold gained`)
  lines.push('')

  // Recent rolls (limit to prevent Discord message length issues)
  const recentRolls = rolls.slice(0, Math.min(10, rolls.length))

  lines.push(`📜 **Recent Rolls:**`)
  recentRolls.forEach((roll, i) => {
    const outcomeEmoji = { success: '✅', partial: '⚡', failure: '💪' }
    let line = `${i + 1}. **${roll.description}:** \`${roll.total}\` ${outcomeEmoji[roll.outcome]}`

    if (roll.effects?.xpAwarded) line += ' 🌟'
    if (roll.effects?.holdGranted) line += ` 🛡️+${roll.effects.holdGranted}`

    lines.push(line)
  })

  if (rolls.length > 10) {
    lines.push(`*...and ${rolls.length - 10} more rolls*`)
  }

  return lines.join('\n')
}

// Export for RPTools/MapTool (dice notation format)
export const exportAsRPTools = (rolls: RollResult[], options: ExportOptions): string => {
  const lines: string[] = []

  lines.push('; RPTools/MapTool Dice Roll Log')
  lines.push('; Generated by ZimboMate')
  lines.push('')

  rolls.forEach((roll, i) => {
    const modifier = roll.modifiers?.reduce((sum, m) => sum + m.value, 0) || 0
    const diceNotation = modifier === 0 ? '2d6' : `2d6${modifier >= 0 ? '+' : ''}${modifier}`

    lines.push(`; Roll ${i + 1}: ${roll.description}`)
    lines.push(`/roll ${diceNotation} ; Result: ${roll.total} (${roll.outcome})`)

    if (roll.effects?.xpAwarded || roll.effects?.holdGranted) {
      const effects: string[] = []
      if (roll.effects.xpAwarded) effects.push('XP+1')
      if (roll.effects.holdGranted) effects.push(`Hold+${roll.effects.holdGranted}`)
      lines.push(`; Effects: ${effects.join(', ')}`)
    }

    lines.push('')
  })

  return lines.join('\n')
}

// Main export function
export const exportRollHistory = (rolls: RollResult[], options: ExportOptions): ExportResult => {
  const filteredRolls = filterRolls(rolls, options)
  let content: string
  let filename: string
  let mimeType: string

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')

  switch (options.format) {
    case 'markdown':
      content = exportAsMarkdown(filteredRolls, options)
      filename = `dice-rolls_${timestamp}.md`
      mimeType = 'text/markdown'
      break

    case 'csv':
      content = exportAsCSV(filteredRolls, options)
      filename = `dice-rolls_${timestamp}.csv`
      mimeType = 'text/csv'
      break

    case 'json':
      content = exportAsJSON(filteredRolls, options)
      filename = `dice-rolls_${timestamp}.json`
      mimeType = 'application/json'
      break

    case 'discord':
      content = exportAsDiscord(filteredRolls, options)
      filename = `dice-rolls_discord_${timestamp}.txt`
      mimeType = 'text/plain'
      break

    case 'rptools':
      content = exportAsRPTools(filteredRolls, options)
      filename = `dice-rolls_rptools_${timestamp}.txt`
      mimeType = 'text/plain'
      break

    default: // 'plain'
      content = exportAsPlainText(filteredRolls, options)
      filename = `dice-rolls_${timestamp}.txt`
      mimeType = 'text/plain'
      break
  }

  return { content, filename, mimeType }
}

// Copy export to clipboard
export const copyExportToClipboard = async (rolls: RollResult[], options: ExportOptions): Promise<boolean> => {
  const exportResult = exportRollHistory(rolls, options)
  return compatibility.copyToClipboard(exportResult.content)
}

// Download export as file
export const downloadExport = (rolls: RollResult[], options: ExportOptions): void => {
  const exportResult = exportRollHistory(rolls, options)

  const blob = new Blob([exportResult.content], { type: exportResult.mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = exportResult.filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Get export preview (first few lines)
export const getExportPreview = (rolls: RollResult[], options: ExportOptions, maxLines: number = 10): string => {
  const exportResult = exportRollHistory(rolls.slice(0, Math.min(5, rolls.length)), options)
  const lines = exportResult.content.split('\n')
  const preview = lines.slice(0, maxLines).join('\n')

  if (lines.length > maxLines) {
    return preview + '\n...'
  }

  return preview
}