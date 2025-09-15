import React from 'react'
import { BicepsFlexed, Feather, Shield, Brain, Eye, Sparkles } from 'lucide-react'

interface AbilityScore {
  name: string
  value: number
  modifier: number
  icon: React.ComponentType<{ size?: number; className?: string }>
}

interface AbilityScoresProps {
  abilities: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }
}

const AbilityScores: React.FC<AbilityScoresProps> = ({ abilities }) => {
  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const abilityScores: AbilityScore[] = [
    { name: 'STR', value: abilities.STR, modifier: getModifier(abilities.STR), icon: BicepsFlexed },
    { name: 'DEX', value: abilities.DEX, modifier: getModifier(abilities.DEX), icon: Feather },
    { name: 'CON', value: abilities.CON, modifier: getModifier(abilities.CON), icon: Shield },
    { name: 'INT', value: abilities.INT, modifier: getModifier(abilities.INT), icon: Brain },
    { name: 'WIS', value: abilities.WIS, modifier: getModifier(abilities.WIS), icon: Eye },
    { name: 'CHA', value: abilities.CHA, modifier: getModifier(abilities.CHA), icon: Sparkles },
  ]

  return (
    <div className="glass-panel rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Ability Scores</h2>
      <div className="grid grid-cols-3 gap-4">
        {abilityScores.map((ability) => {
          const IconComponent = ability.icon
          return (
            <div
              key={ability.name}
              className="glass-surface rounded-lg p-4 text-center hover:glass-hover transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col items-center gap-2">
                <IconComponent size={24} className="text-white/80" />
                <div className="text-sm font-medium text-white/70">{ability.name}</div>
                <div className="text-2xl font-bold text-white">{ability.value}</div>
                <div className="text-sm font-medium text-white/60">
                  {formatModifier(ability.modifier)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AbilityScores