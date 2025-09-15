import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { CharacterSheet } from './components/game/CharacterSheet'
import { MovesPanel } from './components/game/MovesPanel'
import { DiceRoller } from './components/game/DiceRoller'
import { EquipmentPanel } from './components/game/EquipmentPanel'
import './index.css'

// Mock character data for EquipmentPanel
const mockCharacter = {
  name: "Eldara Moonwhisper",
  class: "Wizard",
  level: 5,
  load: { current: 8, max: 12 },
  inventory: [
    {
      id: 'staff-of-power',
      name: 'Staff of Power',
      description: 'A magical staff crackling with arcane energy',
      category: 'weapon',
      weight: 1,
      equipped: true,
      damage: '1d8',
      tags: ['magical', 'two-handed']
    },
    {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores 2d4+2 HP when consumed',
      category: 'consumable',
      weight: 0,
      equipped: false,
      uses: 3
    }
  ]
}

export default function AnimationFixApp() {
  return (
    <Tooltip.Provider delayDuration={200} skipDelayDuration={300}>
      <div className="min-h-screen bg-gradient-to-br from-(--parchment-50) to-(--parchment-100) p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-(--parchment-900) mb-2">
              ZimboMate V2 - Animation Fix Demo
            </h1>
            <p className="text-(--parchment-700) text-lg">
              Testing AnimatePresence and key fixes for React components
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Character Sheet */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-(--parchment-800)">Character Sheet</h2>
              <CharacterSheet />
            </div>

            {/* Moves Panel */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-(--parchment-800)">Moves Panel</h2>
              <MovesPanel characterClass="wizard" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Dice Roller */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-(--parchment-800)">Dice Roller</h2>
              <DiceRoller modifier={2} />
            </div>

            {/* Equipment Panel */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-(--parchment-800)">Equipment Panel</h2>
              <EquipmentPanel
                character={mockCharacter as any}
                onItemEquip={() => {}}
                onItemUnequip={() => {}}
                onItemUse={() => {}}
                onItemDrop={() => {}}
                onInventoryUpdate={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  )
}