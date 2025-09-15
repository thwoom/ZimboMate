import React from 'react'
import { Tile } from '../ui/Tile'
import { SectionHeader } from '../ui/SectionHeader'
import { Meter } from '../ui/Meter'
import { Button } from '../ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGameStore } from '../../store/GameStore'

export function XpTile() {
  const { state, updateCharacter } = useGameStore()
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null
  
  if (!character) return null

  const xpThreshold = character.level + 7
  const canLevelUp = character.xp >= xpThreshold

  const handleAddXp = () => {
    updateCharacter(character.id, { xp: character.xp + 1 })
  }

  return (
    <Tile variant="elevated" rows={1} cols={3} className="flex items-center space-x-4">
      <div className="flex-1 space-y-2">
        <SectionHeader title="Experience" />
        <Meter
          label=""
          current={character.xp}
          max={xpThreshold}
          variant="xp"
          showValues={true}
          size="sm"
        />
        {canLevelUp && (
          <div className="text-xs text-warning font-medium">
            Ready to level up!
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleAddXp}
        className="flex items-center gap-1"
      >
        <PlusIcon className="w-3 h-3" />
        XP
      </Button>
    </Tile>
  )
}