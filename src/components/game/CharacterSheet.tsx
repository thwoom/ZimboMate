import type { Attributes } from '../../models/Character'
import {
  AlertTriangle,
  BicepsFlexed,
  Brain,
  Edit3,
  Eye,
  Heart,
  Scale,
  Star,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'
import { getXPThreshold } from '../../models/Character'
import { useCharacterStore } from '../../stores/characterStore'
import { useXPStore } from '../../stores/xpStore'
import { Badge, Button, Card, CardContent, Input, Progress } from '../ui'

// Use the standard Attributes from Character model
type CharacterStats = Attributes

interface CharacterData {
  id: string
  name: string
  class: string
  level: number
  hp: { current: number; max: number }
  xp: number // Dungeon World uses simple XP, not current/max
  stats: CharacterStats
}

const mockCharacter: CharacterData = {
  id: 'eldara-moonwhisper',
  name: 'Eldara Moonwhisper',
  class: 'Wizard',
  level: 5,
  hp: { current: 16, max: 18 }, // Corrected: Base 4 + Constitution 14 = 18
  xp: 11, // Corrected: Level 5 character with 11 XP (needs 12 to level up: 5+7)
  stats: {
    STR: 8,
    DEX: 12,
    CON: 14,
    INT: 18,
    WIS: 16,
    CHA: 10,
  },
}

const statIcons = {
  STR: BicepsFlexed,
  DEX: Eye,
  CON: Heart,
  INT: Brain,
  WIS: Eye,
  CHA: Users,
}

// Helper function to get active debilities
function getActiveDebilities(character: any) {
  if (!character.debilities) return []

  const debilityList = [
    { key: 'weak', name: 'Weak', color: 'text-error' },
    { key: 'shaky', name: 'Shaky', color: 'text-(--orange-600)' },
    { key: 'sick', name: 'Sick', color: 'text-success' },
    { key: 'stunned', name: 'Stunned', color: 'text-(--magic-600)' },
    { key: 'confused', name: 'Confused', color: 'text-info' },
    { key: 'scarred', name: 'Scarred', color: 'text-muted-foreground' },
  ]

  return debilityList.filter((debility) => character.debilities[debility.key])
}

// Helper function to get active bonds summary
function getActiveBonds(character: any) {
  if (!character.bonds) return []
  return character.bonds.filter((bond: any) => !bond.resolved).slice(0, 3) // Show max 3
}

export const CharacterSheet: React.FC = () => {
  // Connect to character store
  const { getActiveCharacter, updateCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter()

  // Convert store character to display format if needed
  const character = activeCharacter
    ? {
        id: activeCharacter.id,
        name: activeCharacter.name,
        class: activeCharacter.class,
        level: activeCharacter.level,
        hp: activeCharacter.hp,
        xp: activeCharacter.xp,
        stats: activeCharacter.attributes, // Use attributes from store
      }
    : mockCharacter // Fallback to mock for demo

  // Ensure stats are numbers, not {value, modifier} objects
  const normalizedStats = React.useMemo(() => {
    const stats = character.stats || {}
    const normalized: Attributes = {
      STR: typeof stats.STR === 'object' ? stats.STR.value : stats.STR || 10,
      DEX: typeof stats.DEX === 'object' ? stats.DEX.value : stats.DEX || 10,
      CON: typeof stats.CON === 'object' ? stats.CON.value : stats.CON || 10,
      INT: typeof stats.INT === 'object' ? stats.INT.value : stats.INT || 10,
      WIS: typeof stats.WIS === 'object' ? stats.WIS.value : stats.WIS || 10,
      CHA: typeof stats.CHA === 'object' ? stats.CHA.value : stats.CHA || 10,
    }
    return normalized
  }, [character.stats])

  // Use normalized stats for display
  const displayCharacter = { ...character, stats: normalizedStats }

  const [isEditing, setIsEditing] = useState(false)

  // Connect to XP store for display only
  const { characterXP, characterLevel } = useXPStore()

  // Use real-time data if available, otherwise fall back to character data
  const realTimeXP =
    characterXP[displayCharacter.id] !== undefined
      ? characterXP[displayCharacter.id]
      : displayCharacter.xp
  const realTimeLevel =
    characterLevel[displayCharacter.id] !== undefined
      ? characterLevel[displayCharacter.id]
      : displayCharacter.level

  // Get essential info for display
  const activeDebilities = getActiveDebilities(character)
  const activeBonds = getActiveBonds(character)
  const alignment = character.alignment || 'Neutral'

  const getStatModifier = (stat: number): string => {
    const modifier = Math.floor((stat - 10) / 2)
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const handleStatChange = (stat: keyof Attributes, value: number) => {
    const clampedValue = Math.max(1, Math.min(20, value))
    if (activeCharacter) {
      updateCharacter(displayCharacter.id, {
        attributes: {
          ...activeCharacter.attributes,
          [stat]: clampedValue,
        },
      })
    }
  }

  return (
    <div className='space-y-4'>
      {/* Compact Header with Key Info */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Character Identity */}
        <Card variant='magical' className='lg:col-span-2'>
          <CardContent className='p-4 pt-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-xl font-display font-bold flex items-center gap-2'>
                  {displayCharacter.name}
                  <Button
                    variant={isEditing ? 'secondary' : 'ghost'}
                    size='sm'
                    aria-label={isEditing ? 'Stop editing stats' : 'Edit stats'}
                    onClick={() => setIsEditing(!isEditing)}
                    className='opacity-60 hover:opacity-100 h-6 w-6 p-0'
                  >
                    <Edit3 size={12} />
                  </Button>
                </h1>
                <div className='text-sm text-muted-foreground flex items-center gap-2'>
                  Level {realTimeLevel} {displayCharacter.class}
                  {/* Alignment indicator */}
                  <Badge variant='secondary' className='gap-1 text-xs'>
                    <Scale size={10} />
                    {alignment}
                  </Badge>
                  {/* Debility warnings */}
                  {activeDebilities.length > 0 && (
                    <Badge variant='destructive' className='gap-1 text-xs'>
                      <AlertTriangle size={10} />
                      {activeDebilities.length} Debil
                      {activeDebilities.length === 1 ? 'ity' : 'ities'}
                    </Badge>
                  )}
                </div>
              </div>
              <Badge variant='experience' className='shrink-0'>
                <Star size={12} />
                Level {realTimeLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Health & XP */}
        <Card variant='surface'>
          <CardContent className='p-4 pt-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium'>Health</span>
              <span className='text-xs font-mono'>
                {displayCharacter.hp.current}/{displayCharacter.hp.max}
              </span>
            </div>
            <Progress
              variant='health'
              value={displayCharacter.hp.current}
              max={displayCharacter.hp.max}
              className='h-2'
            />

            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium'>Experience</span>
              <span className='text-xs font-mono'>
                {realTimeXP}/{getXPThreshold(realTimeLevel)}
              </span>
            </div>
            <Progress
              variant='experience'
              value={realTimeXP}
              max={getXPThreshold(realTimeLevel)}
              className='h-2'
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Character Sheet Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
        {/* Left Column - Stats */}
        <div className='space-y-3'>
          <Card variant='parchment'>
            <CardContent className='p-3 pt-3'>
              <h3 className='text-sm font-semibold mb-3 text-center'>
                Ability Scores
              </h3>
              <div className='space-y-2'>
                {Object.entries(displayCharacter.stats).map(
                  ([statName, statValue]) => {
                    const StatIcon = statIcons[statName as keyof Attributes]
                    const modifier = getStatModifier(statValue)

                    return (
                      <div
                        key={statName}
                        className='flex items-center gap-2 p-2 rounded bg-background/50'
                      >
                        <StatIcon size={14} className='text-primary shrink-0' />
                        <div className='flex-1 flex items-center justify-between'>
                          <span className='text-xs font-medium'>
                            {statName}
                          </span>
                          <div className='flex items-center gap-2'>
                            {isEditing ? (
                              <Input
                                type='number'
                                value={statValue}
                                onChange={(e) =>
                                  handleStatChange(
                                    statName as keyof Attributes,
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                className='w-12 h-6 text-xs text-center p-0'
                                min='1'
                                max='20'
                              />
                            ) : (
                              <span className='text-sm font-bold w-6 text-center'>
                                {statValue}
                              </span>
                            )}
                            <Badge
                              variant={
                                Number.parseInt(modifier) >= 0
                                  ? 'success'
                                  : 'secondary'
                              }
                              className='text-xs min-w-8 justify-center'
                            >
                              {modifier}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Columns - Moves & Equipment */}
        <div className='lg:col-span-2 grid md:grid-cols-2 gap-4'>
          {/* Class Moves */}
          <Card variant='elevated'>
            <CardContent className='p-3 pt-3'>
              <h3 className='text-sm font-semibold mb-3'>Class Moves</h3>
              <div className='space-y-2 text-xs'>
                <div>
                  <div className='font-medium mb-1'>Starting:</div>
                  <ul className='space-y-0.5 text-muted-foreground'>
                    <li>
                      • Cast a Spell
                      {realTimeLevel >= 1 && (
                        <span className='text-chart-2'>✓</span>
                      )}
                    </li>
                    <li>
                      • Spellbook
                      {realTimeLevel >= 1 && (
                        <span className='text-chart-2'>✓</span>
                      )}
                    </li>
                    <li>
                      • Prepare Spells
                      {realTimeLevel >= 1 && (
                        <span className='text-chart-2'>✓</span>
                      )}
                    </li>
                    <li>• Ritual</li>
                  </ul>
                </div>
                {realTimeLevel >= 6 && (
                  <div>
                    <div className='font-medium mb-1'>Advanced (6+):</div>
                    <ul className='space-y-0.5 text-muted-foreground'>
                      <li>• Prodigy</li>
                      <li>• Empowered Magic</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card variant='elevated'>
            <CardContent className='p-3 pt-3'>
              <h3 className='text-sm font-semibold mb-3'>Equipment</h3>
              <div className='space-y-2 text-xs'>
                <div>
                  <div className='font-medium mb-1'>Weapons:</div>
                  <ul className='space-y-0.5 text-muted-foreground'>
                    <li>
                      • Staff
                      <span className='text-xs opacity-60'>
                        (close, two-handed)
                      </span>
                    </li>
                    <li>
                      • Dagger
                      <span className='text-xs opacity-60'>(hand)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <div className='font-medium mb-1'>Armor & Gear:</div>
                  <ul className='space-y-0.5 text-muted-foreground'>
                    <li>
                      • Leather armor
                      <span className='text-xs opacity-60'>
                        (1 armor, worn)
                      </span>
                    </li>
                    <li>• Spellbook</li>
                    <li>
                      • Dungeon rations
                      <span className='text-xs opacity-60'>(5 uses)</span>
                    </li>
                    <li>• Healing potion</li>
                    <li>• Adventuring gear</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bonds & Notes */}
        <Card variant='parchment'>
          <CardContent className='p-3 pt-3 space-y-3 text-xs'>
            <h3 className='text-sm font-semibold mb-3'>Bonds & Status</h3>
            {/* Active Bonds */}
            <div>
              <div className='font-medium mb-1 flex items-center justify-between'>
                Active Bonds
                {activeBonds.length > 0 && (
                  <Badge variant='default' className='text-xs'>
                    {activeBonds.length}
                  </Badge>
                )}
              </div>
              <div className='space-y-1 text-muted-foreground'>
                {activeBonds.length > 0 ? (
                  activeBonds.map((bond: any) => (
                    <div
                      key={bond.id ?? `${bond.text}-${bond.characterName ?? 'unknown'}`}
                      className='text-xs'
                    >
                      •{' '}
                      {bond.text.length > 40
                        ? `${bond.text.slice(0, 40)}...`
                        : bond.text}
                      {bond.characterName && (
                        <span className='text-primary ml-1'>
                          ({bond.characterName})
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='text-xs italic'>No active bonds</div>
                )}
              </div>
            </div>

            {/* Active Debilities */}
            {activeDebilities.length > 0 && (
              <div>
                <div className='font-medium mb-1 text-chart-4'>
                  Active Debilities:
                </div>
                <div className='flex flex-wrap gap-1'>
                  {activeDebilities.map((debility) => (
                    <Badge
                      key={debility.key}
                      variant='destructive'
                      className={`text-xs ${debility.color}`}
                    >
                      {debility.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div className='font-medium mb-1'>Notes:</div>
              <div className='p-2 rounded bg-background/50 min-h-16 text-muted-foreground italic text-xs'>
                Character background, important story details, campaign notes...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
