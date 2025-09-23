import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../ui'
import { Sword, Shield, Eye, Brain, Users, Zap, Book, Target, BicepsFlexed, Sparkles } from 'lucide-react'
import { MoveContextAnalyzer } from './MoveContextAnalyzer'
import { Move3DIntegration } from './Move3DIntegration'
import { RollableMove } from '../common/RollableElement'
import { Character, type Attributes } from '../../models/Character'
import { getMovesForClass, getStartingMovesForClass } from '../../models/ClassMoves'
import { BASIC_MOVES } from '../../models/Move'

interface Move {
  id: string
  name: string
  description: string
  trigger: string
  stat: keyof Attributes
  category: 'basic' | 'special' | 'class'
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const basicMoves: Move[] = [
  {
    id: 'hack-and-slash',
    name: 'Hack and Slash',
    description: 'When you attack an enemy in melee, roll+Str. On a 10+, you deal your damage to the enemy and avoid their attack. On a 7-9, you deal your damage to the enemy and the enemy makes an attack against you.',
    trigger: 'When you attack an enemy in melee',
    stat: 'STR',
    category: 'basic',
    icon: Sword
  },
  {
    id: 'volley',
    name: 'Volley',
    description: 'When you take aim and shoot at an enemy at range, roll+Dex. On a 10+, you have a clear shot—deal your damage. On a 7-9, choose one: you have to move to get the shot placing you in danger, you have to take what you can get (reduce damage), or you have to take several shots (reduce ammo).',
    trigger: 'When you take aim and shoot at an enemy at range',
    stat: 'DEX',
    category: 'basic',
    icon: Target
  },
  {
    id: 'defend',
    name: 'Defend',
    description: 'When you stand in defense of a person, item, or location under attack, roll+Con. On a 10+, hold 3. On a 7-9, hold 1. Spend hold to redirect an attack from the thing you defend to yourself, or deal damage to the attacker equal to your level.',
    trigger: 'When you stand in defense of a person, item, or location under attack',
    stat: 'CON',
    category: 'basic',
    icon: Shield
  },
  {
    id: 'spout-lore',
    name: 'Spout Lore',
    description: 'When you consult your accumulated knowledge about something, roll+Int. On a 10+, the GM will tell you something interesting and useful about the subject relevant to your situation. On a 7-9, the GM will only tell you something interesting—it\'s on you to make it useful.',
    trigger: 'When you consult your accumulated knowledge about something',
    stat: 'INT',
    category: 'basic',
    icon: Brain
  },
  {
    id: 'discern-realities',
    name: 'Discern Realities',
    description: 'When you closely study a situation or person, roll+Wis. On a 10+, ask the GM 3 questions from the list below. On a 7-9, ask 1. Take +1 forward when acting on the answers.',
    trigger: 'When you closely study a situation or person',
    stat: 'WIS',
    category: 'basic',
    icon: Eye
  },
  {
    id: 'parley',
    name: 'Parley',
    description: 'When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a 10+, they do what you ask if you first promise what they ask of you. On a 7-9, they will do what you ask, but need some concrete assurance of your promise, right now.',
    trigger: 'When you have leverage on a GM character and manipulate them',
    stat: 'CHA',
    category: 'basic',
    icon: Users
  }
]

// Convert our comprehensive moves to the local Move interface format
const convertMoveFormat = (move: any): Move => ({
  id: move.id || move.name.toLowerCase().replace(/\s+/g, '-'),
  name: move.name,
  description: move.description + (move.onSuccess ? ` On 10+: ${move.onSuccess}` : '') + (move.onPartial ? ` On 7-9: ${move.onPartial}` : ''),
  trigger: move.trigger,
  stat: move.rollStat?.toLowerCase() || 'strength',
  category: move.category,
  icon: getIconForMove(move)
})

const getIconForMove = (move: any) => {
  if (move.name.includes('Spell') || move.name.includes('Magic')) return Zap
  if (move.name.includes('Slash') || move.name.includes('Attack')) return Sword
  if (move.name.includes('Defend') || move.name.includes('Shield')) return Shield
  if (move.name.includes('Lore') || move.name.includes('Knowledge')) return Brain
  if (move.name.includes('Track') || move.name.includes('Hunt')) return Eye
  if (move.name.includes('Parley') || move.name.includes('Charm')) return Users
  return Sparkles
}

const statIcons = {
  STR: BicepsFlexed,
  DEX: Target,
  CON: Shield,
  INT: Brain,
  WIS: Eye,
  CHA: Users
}

interface MovesPanelProps {
  character: Character
  characterClass?: string
  onMoveSelect?: (move: Move) => void
  onRollComplete?: (result: any) => void
}

interface GameContext {
  inCombat: boolean
  hasEnemiesNearby: boolean
  lowHealth: boolean
  hasSpellsReady: boolean
  hasAllies: boolean
  inDanger: boolean
  exploringNew: boolean
  socialSituation: boolean
}

export const MovesPanel: React.FC<MovesPanelProps> = ({
  character,
  characterClass = 'wizard',
  onMoveSelect,
  onRollComplete
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'class'>('basic')
  const [selectedMove, setSelectedMove] = useState<Move | null>(null)
  const [showMoveIntegration, setShowMoveIntegration] = useState(false)
  const [showContextAnalyzer, setShowContextAnalyzer] = useState(true)

  // Get moves based on character class and category
  const moves = useMemo(() => {
    if (selectedCategory === 'basic') {
      return basicMoves
    } else {
      const classMoves = getMovesForClass(character.class || characterClass)
      return classMoves.map(convertMoveFormat)
    }
  }, [selectedCategory, character.class, characterClass])

  // Analyze current game context
  const gameContext = useMemo((): GameContext => {
    const healthPercentage = character.hp.current / character.hp.max
    
    return {
      inCombat: false, // This would come from game state
      hasEnemiesNearby: false, // This would come from game state
      lowHealth: healthPercentage < 0.5,
      hasSpellsReady: character.class === 'wizard', // Simplified check
      hasAllies: false, // This would come from game state
      inDanger: healthPercentage < 0.3,
      exploringNew: true, // This would come from game state
      socialSituation: false // This would come from game state
    }
  }, [character])

  const handleMoveClick = (move: Move) => {
    setSelectedMove(move)
    onMoveSelect?.(move)
  }

  const handleMoveSuggestion = (moveId: string) => {
    const allMoves = [
      ...basicMoves,
      ...getMovesForClass(character.class || characterClass).map(convertMoveFormat)
    ]
    const move = allMoves.find(m => m.id === moveId)
    if (move) {
      setSelectedMove(move)
      onMoveSelect?.(move)
    }
  }

  const handleExecuteMove = () => {
    if (selectedMove) {
      setShowMoveIntegration(true)
    }
  }

  const handleRollComplete = (result: any) => {
    setShowMoveIntegration(false)
    setSelectedMove(null)
    onRollComplete?.(result)
  }

  const handleCancelMove = () => {
    setShowMoveIntegration(false)
  }

  return (
    <div className="space-y-6">
      {/* Context Analyzer */}
      {showContextAnalyzer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <MoveContextAnalyzer
            character={character}
            gameContext={gameContext}
            onMoveSuggestion={handleMoveSuggestion}
          />
        </motion.div>
      )}

      {/* Category Selector */}
      <Card variant="surface">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'basic' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('basic')}
              >
                Basic Moves
              </Button>
              <Button
                variant={selectedCategory === 'class' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('class')}
              >
                {(character.class || characterClass).charAt(0).toUpperCase() + (character.class || characterClass).slice(1)} Moves
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContextAnalyzer(!showContextAnalyzer)}
              className="gap-2"
            >
              <Brain size={16} />
              {showContextAnalyzer ? 'Hide' : 'Show'} Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Moves List */}
      <motion.div
        className="grid gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={selectedCategory}
      >
        {moves.map((move, index) => {
          const StatIcon = statIcons[move.stat]
          const MoveIcon = move.icon
          
          return (
            <motion.div
              key={move.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RollableMove
                moveId={move.id}
                moveName={move.name}
                stat={move.stat}
                characterId="eldara-moonwhisper" // TODO: Use actual character ID
                onRoll={handleRollComplete}
                enableRightClick={true}
                showHoverDice={true}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedMove?.id === move.id ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                <Card
                  variant="parchment"
                  onClick={() => handleMoveClick(move)}
                >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MoveIcon size={20} className="text-primary" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-lg">{move.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <StatIcon size={12} className="mr-1" />
                            {move.stat.slice(0, 3).toUpperCase()}
                          </Badge>
                          <Badge 
                            variant={move.category === 'basic' ? 'default' : 'magical'} 
                            className="text-xs"
                          >
                            {move.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">
                        Trigger:
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        {move.trigger}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">
                        Effect:
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {move.description}
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveClick(move)
                        }}
                        className="min-w-[80px]"
                      >
                        {move.name}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </RollableMove>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Selected Move Action */}
      <AnimatePresence key={selectedMove?.id || 'no-move'}>
        {selectedMove && (
          <motion.div
            key={`selected-move-${selectedMove.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card variant="magical" className="shadow-2xl">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">
                    Ready to use <span className="text-primary">{selectedMove.name}</span>?
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleExecuteMove}
                    className="gap-2 magical-glow"
                  >
                    <Sparkles size={16} />
                    Execute Move
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMove(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Move Integration */}
      {selectedMove && (
        <Move3DIntegration
          moveId={selectedMove.id}
          moveName={selectedMove.name}
          stat={selectedMove.stat}
          modifier={(() => {
            const s: any = (character as any).stats?.[selectedMove.stat as any]
            if (typeof s === 'number') return Math.floor((s - 10) / 2)
            if (s && typeof s.modifier === 'number') return s.modifier
            if (s && typeof s.value === 'number') return Math.floor(((s.value as number) - 10) / 2)
            return 0
          })()}
          onRollComplete={handleRollComplete}
          onCancel={handleCancelMove}
          isVisible={showMoveIntegration}
        />
      )}
    </div>
  )
}