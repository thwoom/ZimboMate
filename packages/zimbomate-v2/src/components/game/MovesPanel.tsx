import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../ui'
import { Sword, Shield, Eye, Brain, Users, Zap, Book, Target, BicepsFlexed, Sparkles } from 'lucide-react'
import { MoveContextAnalyzer } from './MoveContextAnalyzer'
import { Move3DIntegration } from './Move3DIntegration'
import { Character } from '../../models/Character'

interface Move {
  id: string
  name: string
  description: string
  trigger: string
  stat: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'
  category: 'basic' | 'special' | 'class'
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const basicMoves: Move[] = [
  {
    id: 'hack-and-slash',
    name: 'Hack and Slash',
    description: 'When you attack an enemy in melee, roll+Str. On a 10+, you deal your damage to the enemy and avoid their attack. On a 7-9, you deal your damage to the enemy and the enemy makes an attack against you.',
    trigger: 'When you attack an enemy in melee',
    stat: 'strength',
    category: 'basic',
    icon: Sword
  },
  {
    id: 'volley',
    name: 'Volley',
    description: 'When you take aim and shoot at an enemy at range, roll+Dex. On a 10+, you have a clear shot—deal your damage. On a 7-9, choose one: you have to move to get the shot placing you in danger, you have to take what you can get (reduce damage), or you have to take several shots (reduce ammo).',
    trigger: 'When you take aim and shoot at an enemy at range',
    stat: 'dexterity',
    category: 'basic',
    icon: Target
  },
  {
    id: 'defend',
    name: 'Defend',
    description: 'When you stand in defense of a person, item, or location under attack, roll+Con. On a 10+, hold 3. On a 7-9, hold 1. Spend hold to redirect an attack from the thing you defend to yourself, or deal damage to the attacker equal to your level.',
    trigger: 'When you stand in defense of a person, item, or location under attack',
    stat: 'constitution',
    category: 'basic',
    icon: Shield
  },
  {
    id: 'spout-lore',
    name: 'Spout Lore',
    description: 'When you consult your accumulated knowledge about something, roll+Int. On a 10+, the GM will tell you something interesting and useful about the subject relevant to your situation. On a 7-9, the GM will only tell you something interesting—it\'s on you to make it useful.',
    trigger: 'When you consult your accumulated knowledge about something',
    stat: 'intelligence',
    category: 'basic',
    icon: Brain
  },
  {
    id: 'discern-realities',
    name: 'Discern Realities',
    description: 'When you closely study a situation or person, roll+Wis. On a 10+, ask the GM 3 questions from the list below. On a 7-9, ask 1. Take +1 forward when acting on the answers.',
    trigger: 'When you closely study a situation or person',
    stat: 'wisdom',
    category: 'basic',
    icon: Eye
  },
  {
    id: 'parley',
    name: 'Parley',
    description: 'When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a 10+, they do what you ask if you first promise what they ask of you. On a 7-9, they will do what you ask, but need some concrete assurance of your promise, right now.',
    trigger: 'When you have leverage on a GM character and manipulate them',
    stat: 'charisma',
    category: 'basic',
    icon: Users
  }
]

const wizardMoves: Move[] = [
  {
    id: 'cast-spell',
    name: 'Cast a Spell',
    description: 'When you release a spell you\'ve prepared, roll+Int. On a 10+, the spell is successfully cast and you do not forget the spell—you may cast it again later. On a 7-9, the spell is cast, but choose one: You draw unwelcome attention or put yourself in a spot. The spell disturbs the fabric of reality as it is cast—take -1 ongoing to cast a spell until the next time you Prepare Spells. After you cast it, the spell is forgotten.',
    trigger: 'When you release a spell you\'ve prepared',
    stat: 'intelligence',
    category: 'class',
    icon: Zap
  },
  {
    id: 'ritual',
    name: 'Ritual',
    description: 'When you draw on a place of power to create a magical effect, tell the GM what you\'re trying to achieve. Ritual effects are always possible, but the GM will give you one to four of the following conditions: It\'s going to take days/weeks/months. First you must ____. You\'ll need help from ____. It will require a lot of money. The best you can do is a lesser version, unreliable and limited. You and your allies will risk danger from ____. You\'ll have to disenchant ____ to do it.',
    trigger: 'When you draw on a place of power to create a magical effect',
    stat: 'intelligence',
    category: 'class',
    icon: Book
  }
]

const statIcons = {
  strength: BicepsFlexed,
  dexterity: Target,
  constitution: Shield,
  intelligence: Brain,
  wisdom: Eye,
  charisma: Users
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

  const moves = selectedCategory === 'basic' ? basicMoves : wizardMoves

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
    const move = [...basicMoves, ...wizardMoves].find(m => m.id === moveId)
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
      <Card variant="glass" padding="md">
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
                {characterClass.charAt(0).toUpperCase() + characterClass.slice(1)} Moves
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
              <Card 
                variant="parchment" 
                padding="lg"
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedMove?.id === move.id ? 'ring-2 ring-(--color-primary)/50' : ''
                }`}
                onClick={() => handleMoveClick(move)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-lg bg-(--color-primary)/20 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MoveIcon size={20} className="text-(--color-primary)" />
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
                      <p className="text-sm font-medium text-(--color-primary) mb-1">
                        Trigger:
                      </p>
                      <p className="text-sm text-(--color-text-secondary) italic">
                        {move.trigger}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-(--color-primary) mb-1">
                        Effect:
                      </p>
                      <p className="text-sm text-(--color-text-primary) leading-relaxed">
                        {move.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
            <Card variant="magical" padding="md" className="shadow-2xl">
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium">
                    Ready to use <span className="text-(--color-primary)">{selectedMove.name}</span>?
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
          modifier={character.stats[selectedMove.stat as keyof typeof character.stats]?.modifier || 0}
          onRollComplete={handleRollComplete}
          onCancel={handleCancelMove}
          isVisible={showMoveIntegration}
        />
      )}
    </div>
  )
}