import React from 'react'
import { Tile } from '../ui/Tile'
import { SectionHeader } from '../ui/SectionHeader'
import { StatGroup, StatItem } from '../ui/StatGroup'
import { usePreviewStore } from '../PreviewProvider'

const attributeColors = {
  STR: 'var(--color-stat-str)',
  DEX: 'var(--color-stat-dex)',
  CON: 'var(--color-stat-con)',
  INT: 'var(--color-stat-int)',
  WIS: 'var(--color-stat-wis)',
  CHA: 'var(--color-stat-cha)',
}

export function PreviewAttributesTile() {
  const { character, setRollResult } = usePreviewStore()

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  const rollAttribute = (attribute: keyof typeof character.attributes) => {
    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const modifier = getModifier(character.attributes[attribute])
    const total = roll1 + roll2 + modifier
    
    setRollResult(`${attribute}: ${roll1} + ${roll2} + ${modifier} = ${total}`)
  }

  return (
    <Tile variant="elevated" rows={3} cols={2} className="space-y-4">
      <SectionHeader title="Attributes" />
      
      <StatGroup columns={2}>
        {Object.entries(character.attributes).map(([attr, score]) => {
          const modifier = getModifier(score)
          return (
            <StatItem
              key={attr}
              label={attr}
              value={score}
              modifier={modifier}
              color={attributeColors[attr as keyof typeof attributeColors]}
              onClick={() => rollAttribute(attr as keyof typeof character.attributes)}
            />
          )
        })}
      </StatGroup>
    </Tile>
  )
}