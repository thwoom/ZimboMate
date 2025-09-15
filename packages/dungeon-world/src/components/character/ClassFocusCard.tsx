import React from 'react'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export interface ClassFocusCardProps {
  characterClass: string
  classFeatures?: string[]
  className?: string
}

export function ClassFocusCard({
  characterClass,
  classFeatures = [],
  className
}: ClassFocusCardProps) {
  // Default class features based on common D&D classes
  const getDefaultFeatures = (charClass: string): string[] => {
    const features: Record<string, string[]> = {
      'Fighter': ['Signature Weapon', 'Armor Mastery', 'Improved Damage'],
      'Wizard': ['Spellbook', 'Ritual Casting', 'Arcane Research'],
      'Cleric': ['Divine Guidance', 'Turn Undead', 'Commune'],
      'Thief': ['Trap Expert', 'Backstab', 'Flexible Morals'],
      'Ranger': ['Hunt and Track', 'Called Shot', 'Animal Companion'],
      'Paladin': ['Lay on Hands', 'Armored', 'I Am the Law'],
      'Bard': ['Arcane Art', 'Bardic Lore', 'Charming and Open'],
      'Druid': ['Born of the Soil', 'By Nature Sustained', 'Spirit Tongue'],
      'Barbarian': ['The Upper Hand', 'What Are You Waiting For?', 'Herculean Appetites'],
      'Immolator': ['Burning Brand', 'Fighting Fire with Fire', 'Zuko Style']
    }
    return features[charClass] || ['Class Features', 'Special Abilities', 'Unique Traits']
  }

  const features = classFeatures.length > 0 ? classFeatures : getDefaultFeatures(characterClass)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AcademicCapIcon className="w-4 h-4 text-secondary" />
          {characterClass} Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-surface/50 rounded-md"
            >
              <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" />
              <span className="text-sm text-text-primary font-medium">
                {feature}
              </span>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-text-tertiary text-center">
            Class-specific abilities and features
          </div>
        </div>
      </CardContent>
    </Card>
  )
}