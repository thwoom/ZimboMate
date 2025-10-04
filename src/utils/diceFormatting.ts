import type { RollResult } from '../stores/diceStore'

function toModifierSegment(modifier: number): string {
  if (modifier === 0) return ''
  const sign = modifier > 0 ? '+' : ''
  return ` ${sign}${modifier}`
}

export function formatRollSummary(roll: RollResult): string {
  const modifierSegment = toModifierSegment(roll.modifier)
  return `${roll.context.label}: ${roll.dice1} + ${roll.dice2}${modifierSegment} = ${roll.finalResult} (${roll.outcome})`
}
