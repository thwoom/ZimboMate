import React, { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button,
  Input,
  Progress,
  Badge
} from '../ui'
import { Heart, Zap, Star, Sword, Shield, Eye, Brain, BicepsFlexed, Users, Sparkles } from 'lucide-react'

interface CharacterStats {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

interface CharacterData {
  name: string
  class: string
  level: number
  hp: { current: number; max: number }
  mana: { current: number; max: number }
  experience: { current: number; max: number }
  stats: CharacterStats
}

const mockCharacter: CharacterData = {
  name: "Eldara Moonwhisper",
  class: "Wizard",
  level: 5,
  hp: { current: 32, max: 45 },
  mana: { current: 28, max: 40 },
  experience: { current: 2750, max: 3000 },
  stats: {
    strength: 8,
    dexterity: 12,
    constitution: 14,
    intelligence: 18,
    wisdom: 16,
    charisma: 10
  }
}

const statIcons = {
  strength: BicepsFlexed,
  dexterity: Eye,
  constitution: Heart,
  intelligence: Brain,
  wisdom: Eye,
  charisma: Users
}

export const CharacterSheet: React.FC = () => {
  const [character, setCharacter] = useState<CharacterData>(mockCharacter)
  const [isEditing, setIsEditing] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)

  const getStatModifier = (stat: number): string => {
    const modifier = Math.floor((stat - 10) / 2)
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const handleStatChange = (stat: keyof CharacterStats, value: number) => {
    setCharacter(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: Math.max(1, Math.min(20, value))
      }
    }))
  }

  const handleQuickAction = (action: string) => {
    console.log(`Performing action: ${action}`)
  }

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <Card variant="magical" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {character.name}
                <Sparkles size={20} className="text-(--color-primary)" />
              </CardTitle>
              <CardDescription className="text-lg">
                Level {character.level} {character.class}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="experience">
                <Star size={14} />
                Level {character.level}
              </Badge>
              <Button 
                variant={isEditing ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Health */}
            <Progress
              variant="health"
              value={character.hp.current}
              max={character.hp.max}
              showLabel
              label="Health Points"
            />
            
            {/* Mana */}
            <Progress
              variant="mana"
              value={character.mana.current}
              max={character.mana.max}
              showLabel
              label="Mana Points"
            />
            
            {/* Experience */}
            <Progress
              variant="experience"
              value={character.experience.current}
              max={character.experience.max}
              showLabel
              label="Experience"
            />
          </div>
        </CardContent>
      </Card>

      {/* Character Stats */}
      <Card variant="parchment" padding="lg">
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
          <CardDescription>
            Core character attributes and modifiers
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(character.stats).map(([statName, statValue]) => {
              const StatIcon = statIcons[statName as keyof CharacterStats]
              const modifier = getStatModifier(statValue)
              const isHovered = hoveredStat === statName
              
              return (
                <Card 
                  key={statName}
                  variant="glass" 
                  padding="md" 
                  className={`text-center transition-all duration-300 cursor-pointer ${
                    isHovered ? 'ring-2 ring-(--color-primary)/50 scale-105' : ''
                  }`}
                  onMouseEnter={() => setHoveredStat(statName)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <StatIcon 
                        size={16} 
                        className={`text-(--color-primary) transition-colors duration-300 ${
                          isHovered ? 'text-(--color-primary)' : ''
                        }`} 
                      />
                      <span className="text-sm font-medium font-ui capitalize">
                        {statName.slice(0, 3)}
                      </span>
                    </div>
                    
                    {isEditing ? (
                      <Input
                        type="number"
                        value={statValue}
                        onChange={(e) => handleStatChange(
                          statName as keyof CharacterStats, 
                          parseInt(e.target.value) || 0
                        )}
                        className="text-center h-8"
                        min="1"
                        max="20"
                      />
                    ) : (
                      <div className="text-2xl font-bold font-display">
                        {statValue}
                      </div>
                    )}
                    
                    <Badge 
                      variant={parseInt(modifier) >= 0 ? "success" : "secondary"}
                      className="text-xs"
                    >
                      {modifier}
                    </Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common character actions and abilities
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { variant: "primary", icon: Sword, label: "Attack", action: "attack" },
              { variant: "secondary", icon: Shield, label: "Defend", action: "defend" },
              { variant: "magical", icon: Zap, label: "Cast Spell", action: "cast-spell" },
              { variant: "outline", icon: Heart, label: "Heal", action: "heal" },
              { variant: "ghost", icon: Eye, label: "Investigate", action: "investigate" }
            ].map(({ variant, icon: Icon, label, action }) => (
              <Button 
                key={action}
                variant={variant as any}
                onClick={() => handleQuickAction(action)}
                className="transition-transform hover:scale-105"
              >
                <Icon size={16} />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}