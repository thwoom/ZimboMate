import React from 'react'
import { Tile } from '../ui/Tile'
import { SectionHeader } from '../ui/SectionHeader'
import { StatGroup, StatItem } from '../ui/StatGroup'
import { Button } from '../ui/Button'
import { useGameStore } from '../../store/GameStore'

export function CombatTile() {
  const { state } = useGameStore()
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null
  
  if (!character) return null

  const rollDamage = () => {
    // Parse damage die (e.g., "d10" -> 10)
    const dieSize = parseInt(character.damageDie?.replace('d', '') || '6')
    const roll = Math.floor(Math.random() * dieSize) + 1
    console.log(`Rolled ${character.damageDie}: ${roll}`)
    // TODO: Show in UI
  }

  return (
    <Tile variant="elevated" rows={2} cols={3} className="space-y-4">
      <SectionHeader title="Combat" />
      
      <StatGroup columns={2}>
        <StatItem 
          label="Armor" 
          value={character.armor || 0}
          color="var(--color-equipment-armor)"
        />
        <StatItem 
          label="Damage" 
          value={character.damageDie || 'd6'}
          color="var(--color-equipment-weapon)"
        />
      </StatGroup>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={rollDamage}
        >
          Roll Damage
        </Button>
      </div>
    </Tile>
  )
}