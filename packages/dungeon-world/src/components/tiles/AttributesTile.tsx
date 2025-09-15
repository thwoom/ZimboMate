import React from 'react'
import { Tile } from '../ui/Tile'
import { SectionHeader } from '../ui/SectionHeader'
import { StatGroup, StatItem } from '../ui/StatGroup'
import { useGameStore } from '../../store/GameStore'

const attributeColors = {
  STR: 'var(--color-stat-str)',
  DEX: 'var(--color-stat-dex)',
  CON: 'var(--color-stat-con)',
  INT: 'var(--color-stat-int)',
  WIS: 'var(--color-stat-wis)',
  CHA: 'var(--color-stat-cha)',
}

export function AttributesTile() {
  const { state } = useGameStore()
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null
  
  if (!character) return null

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  const rollAttribute = (attribute: keyof typeof character.attributes) => {
    window.dispatchEvent(new CustomEvent('command:roll-attribute', { 
      detail: { attribute } 
    }))
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