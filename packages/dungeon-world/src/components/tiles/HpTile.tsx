import React from 'react'
import { Tile } from '../ui/Tile'
import { SectionHeader } from '../ui/SectionHeader'
import { Meter } from '../ui/Meter'
import { Button } from '../ui/Button'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { useGameStore } from '../../store/GameStore'

export function HpTile() {
  const { state, updateCharacter } = useGameStore()
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null
  
  if (!character) return null

  const handleHpChange = (delta: number) => {
    const newHp = Math.max(0, Math.min(character.hp.max, character.hp.current + delta))
    updateCharacter(character.id, { hp: { ...character.hp, current: newHp } })
  }

  const handleRest = () => {
    updateCharacter(character.id, { hp: { ...character.hp, current: character.hp.max } })
  }

  return (
    <Tile variant="elevated" rows={2} cols={2} className="space-y-4">
      <SectionHeader 
        title="Hit Points"
        actions={
          <Button variant="ghost" size="xs" onClick={handleRest}>
            Rest
          </Button>
        }
      />
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleHpChange(-1)}
            disabled={character.hp.current <= 0}
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">
              {character.hp.current}
            </div>
            <div className="text-sm text-text-secondary">
              / {character.hp.max}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleHpChange(1)}
            disabled={character.hp.current >= character.hp.max}
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        
        <Meter
          label=""
          current={character.hp.current}
          max={character.hp.max}
          variant="hp"
          showValues={false}
        />
      </div>
    </Tile>
  )
}