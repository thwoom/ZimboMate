import type { SecretaryAction, SecretaryParseResult } from './types'

const DEBILITY_MAP: Record<string, string> = {
  weak: 'Weak',
  shaky: 'Shaky',
  sick: 'Sick',
  stunned: 'Stunned',
  confused: 'Confused',
  scarred: 'Scarred',
}

function clampDamage(value: number) {
  if (!Number.isFinite(value)) return null
  if (value > 50) return 50
  if (value < -50) return -50
  return value
}

function parseDamage(text: string): SecretaryAction[] {
  const actions: SecretaryAction[] = []
  const damageRegex =
    /\b(?:take|took|suffer(?:ed)?|receive(?:d)?|los(?:e|t)|hit for)\s+(-?\d+)\s*(?:hp|health|damage|dmg)?/gi
  let match: RegExpExecArray | null
  while ((match = damageRegex.exec(text)) !== null) {
    const raw = Number(match[1])
    const amt = clampDamage(-Math.abs(raw))
    if (amt === null) continue
    actions.push({
      type: 'hpDelta',
      amount: amt,
      confidence: 0.9,
      from: 'rules',
      note: 'Detected damage',
    })
  }
  return actions
}

function parseXp(text: string): SecretaryAction[] {
  const actions: SecretaryAction[] = []
  const xpRegex = /\b(mark|gain|earn)\s+(?:\+)?(\d+)\s*xp\b/gi
  let match: RegExpExecArray | null
  while ((match = xpRegex.exec(text)) !== null) {
    const amt = Number(match[2])
    if (!Number.isFinite(amt) || amt <= 0 || amt > 10) continue
    actions.push({
      type: 'xpGain',
      amount: amt,
      confidence: 0.85,
      from: 'rules',
      note: 'Detected XP gain',
    })
  }
  // Dungeon World miss rule: “on a miss, mark XP”
  if (/\bmiss\b/i.test(text) && /\broll|\bdice|\b2d6/i.test(text)) {
    actions.push({
      type: 'xpGain',
      amount: 1,
      confidence: 0.65,
      from: 'rules',
      note: 'Likely miss → 1 XP',
    })
  }
  return actions
}

function parseDebility(text: string): SecretaryAction[] {
  const actions: SecretaryAction[] = []
  const debilityRegex =
    /\b(?:become|became|is|am|are|got|gain|suffer|takes?)\s+(weak|shaky|sick|stunned|confused|scarred)\b/gi
  let match: RegExpExecArray | null
  while ((match = debilityRegex.exec(text)) !== null) {
    const key = match[1].toLowerCase()
    const debility = DEBILITY_MAP[key]
    if (!debility) continue
    actions.push({
      type: 'addDebility',
      debility: debility as any,
      confidence: 0.8,
      from: 'rules',
    })
  }

  const clearRegex = /\b(remove|clear|shake off|recover from)\s+(weak|shaky|sick|stunned|confused|scarred)\b/gi
  while ((match = clearRegex.exec(text)) !== null) {
    const debility = DEBILITY_MAP[match[2].toLowerCase()]
    if (!debility) continue
    actions.push({
      type: 'removeDebility',
      debility: debility as any,
      confidence: 0.75,
      from: 'rules',
    })
  }

  return actions
}

function parseEntities(text: string): SecretaryAction[] {
  const actions: SecretaryAction[] = []
  // naïve: capture “a/an/the <word>” that looks like a creature/object when damage mentioned
  const entityRegex = /\b(?:a|an|the)\s+([A-Za-z][A-Za-z'-]{2,24})\b/gi
  const found = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = entityRegex.exec(text)) !== null) {
    const name = match[1]
    if (found.has(name.toLowerCase())) continue
    if (/hp|xp|damage|hit/i.test(text)) {
      found.add(name.toLowerCase())
      actions.push({
        type: 'addTag',
        entityName: name,
        tagType: 'npc',
        confidence: 0.45,
        from: 'rules',
        note: 'Guessed NPC from narration',
      })
    }
  }
  return actions
}

export function parseWithRules(text: string): SecretaryParseResult {
  const normalized = text.trim()
  const actions: SecretaryAction[] = [
    ...parseDamage(normalized),
    ...parseXp(normalized),
    ...parseDebility(normalized),
    ...parseEntities(normalized),
  ]

  const maxConfidence = actions.reduce((max, a) => Math.max(max, a.confidence), 0)
  const avgConfidence =
    actions.length === 0
      ? 0
      : actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length
  const confidence = Math.max(maxConfidence, avgConfidence)

  return {
    text: normalized,
    actions,
    confidence,
    createdAt: Date.now(),
  }
}
