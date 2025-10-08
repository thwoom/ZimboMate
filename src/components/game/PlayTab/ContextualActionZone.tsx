/**
 * ContextualActionZone - Adaptive Main Action Area
 *
 * The central component of the PlayTab that changes its interface based on
 * the current game mode: combat, exploration, social, or rest.
 */

import type { Character } from '../../../models/Character'
import { resolveAttributeScore } from '../../../models/Character'
import type { GameMode, PlayTabTheme } from '../PlayTab'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Brain,
  Eye,
  Heart,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
} from 'lucide-react'
import React, { useCallback } from 'react'
import { logger } from '../../../utils/logger'
import { useChronicle } from '../../chronicle/ChronicleProvider'
import { Badge, Button, Card, CardContent } from '../../ui'
import { ChronicleEnabledDiceRoller } from '../ChronicleEnabledDiceRoller'
import { StatRoller } from '../StatRoller'

interface ContextualActionZoneProps {
  character: Character
  gameMode: GameMode
  theme: PlayTabTheme
  onGameModeChange: (mode: GameMode) => void
  className?: string
}

interface CombatAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number, className?: string }>
  stat: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
  damage?: string
  color: string
}

const combatActions: CombatAction[] = [
  {
    id: 'hack-slash',
    name: 'Hack & Slash',
    description: 'Attack an enemy in melee',
    icon: Swords,
    stat: 'STR',
    damage: '1d8+STR',
    color: 'bg-destructive/120 hover:bg-destructive',
  },
  {
    id: 'volley',
    name: 'Volley',
    description: 'Shoot at range',
    icon: Target,
    stat: 'DEX',
    damage: '1d6+DEX',
    color: 'bg-chart-2 hover:bg-chart-2/85',
  },
  {
    id: 'defend',
    name: 'Defend',
    description: 'Protect yourself or ally',
    icon: Shield,
    stat: 'CON',
    color: 'bg-primary/100 hover:bg-primary',
  },
]

interface ExplorationAction {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number, className?: string }>
  stat: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
  color: string
  examples: string[]
}

const explorationActions: ExplorationAction[] = [
  {
    id: 'discern-realities',
    name: 'Discern Realities',
    description: 'Study a situation',
    icon: Eye,
    stat: 'WIS',
    color: 'bg-accent hover:bg-accent',
    examples: ['What happened here?', 'What should I be wary of?', 'What is useful or valuable?'],
  },
  {
    id: 'spout-lore',
    name: 'Spout Lore',
    description: 'Recall useful knowledge',
    icon: Brain,
    stat: 'INT',
    color: 'bg-primary/100 hover:bg-primary',
    examples: ['Ancient history', 'Monster weaknesses', 'Local customs'],
  },
  {
    id: 'defy-danger',
    name: 'Defy Danger',
    description: 'Act despite danger',
    icon: Zap,
    stat: 'DEX', // Most common, but varies
    color: 'bg-chart-4/120 hover:bg-yellow-600',
    examples: ['Dodge a trap', 'Resist poison', 'Stay calm under pressure'],
  },
]

const CombatMode: React.FC<{
  character: Character
  onAction: (action: CombatAction) => void
}> = ({ character, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display text-destructive mb-2">⚔️ Combat Mode</h3>
        <p className="text-sm text-muted-foreground ">
          Choose your combat action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {combatActions.map((action, index) => {
          const Icon = action.icon
          const statValue = resolveAttributeScore(character.attributes?.[action.stat], 10)
          const modifier = Math.floor((statValue - 10) / 2)

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className={`h-auto p-4 flex flex-col gap-3 w-full text-left hover:shadow-lg ${action.color} hover:text-white transition-all`}
                onClick={() => onAction(action)}
              >
                <Icon size={24} />
                <div>
                  <div className="font-medium">{action.name}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                  {action.damage && (
                    <div className="text-xs font-mono mt-1">
                      {action.damage.replace(action.stat, modifier >= 0 ? `+${modifier}` : `${modifier}`)}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="self-start">
                  {action.stat}
                  {' '}
                  {modifier >= 0 ? '+' : ''}
                  {modifier}
                </Badge>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Damage Roll */}
      <Card variant="surface">
        <div className="text-center">
          <h4 className="font-medium mb-2">Quick Damage Roll</h4>
          <ChronicleEnabledDiceRoller
            characterName={character.name}
            modifier={0}
            showChronicleIntegration={false}
            className="max-w-md mx-auto"
          />
        </div>
      </Card>
    </div>
  )
}

const ExplorationMode: React.FC<{
  character: Character
  onAction: (action: ExplorationAction) => void
}> = ({ character, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display text-chart-2 mb-2">🗺️ Exploration Mode</h3>
        <p className="text-sm text-muted-foreground ">
          Investigate your surroundings
        </p>
      </div>

      {/* Stat Rolling Interface */}
      <StatRoller
        characterName={character.name}
        statModifiers={{
          STR: Math.floor((resolveAttributeScore(character.attributes?.STR, 10) - 10) / 2),
          DEX: Math.floor((resolveAttributeScore(character.attributes?.DEX, 10) - 10) / 2),
          CON: Math.floor((resolveAttributeScore(character.attributes?.CON, 10) - 10) / 2),
          INT: Math.floor((resolveAttributeScore(character.attributes?.INT, 10) - 10) / 2),
          WIS: Math.floor((resolveAttributeScore(character.attributes?.WIS, 10) - 10) / 2),
          CHA: Math.floor((resolveAttributeScore(character.attributes?.CHA, 10) - 10) / 2),
        }}
      />

      {/* Common Exploration Actions */}
      <div className="grid grid-cols-1 gap-3">
        {explorationActions.map((action, index) => {
          const Icon = action.icon
          const statValue = resolveAttributeScore(character.attributes?.[action.stat], 10)
          const modifier = Math.floor((statValue - 10) / 2)

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="surface">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{action.name}</h4>
                      <Badge variant="secondary">
                        {action.stat}
                        {' '}
                        {modifier >= 0 ? '+' : ''}
                        {modifier}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground  mb-2">
                      {action.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Examples:</strong>
                      {' '}
                      {action.examples.join(', ')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAction(action)}
                    className={action.color}
                  >
                    Roll
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const SocialMode: React.FC<{
  character: Character
  onAction: (actionId: string) => void
}> = ({ character: _character, onAction }) => {
  const chaModifier = Math.floor((resolveAttributeScore(character.attributes?.CHA, 10) - 10) / 2)
  const wisModifier = Math.floor((resolveAttributeScore(character.attributes?.WIS, 10) - 10) / 2)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display text-primary mb-2">🤝 Social Mode</h3>
        <p className="text-sm text-muted-foreground ">
          Interact with NPCs and build relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parley */}
        <Card variant="surface">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary/100 rounded-full flex items-center justify-center text-white">
              <Users size={20} />
            </div>
            <div>
              <h4 className="font-medium">Parley</h4>
              <p className="text-sm text-muted-foreground ">
                Negotiate or persuade
              </p>
            </div>
            <Badge variant="secondary">
              CHA
              {' '}
              {chaModifier >= 0 ? '+' : ''}
              {chaModifier}
            </Badge>
            <Button
              className="w-full bg-primary/100 hover:bg-primary"
              onClick={() => onAction('parley')}
            >
              Roll Parley
            </Button>
          </div>
        </Card>

        {/* Read Person */}
        <Card variant="surface">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-accent rounded-full flex items-center justify-center text-white">
              <Eye size={20} />
            </div>
            <div>
              <h4 className="font-medium">Read Person</h4>
              <p className="text-sm text-muted-foreground ">
                Understand motivations
              </p>
            </div>
            <Badge variant="secondary">
              WIS
              {' '}
              {wisModifier >= 0 ? '+' : ''}
              {wisModifier}
            </Badge>
            <Button
              className="w-full bg-accent hover:bg-accent"
              onClick={() => onAction('read-person')}
            >
              Roll Read
            </Button>
          </div>
        </Card>
      </div>

      {/* Bond Management Quick Access */}
      <Card variant="parchment">
        <div className="text-center">
          <h4 className="font-medium mb-3">Active Bonds</h4>
          <p className="text-sm text-muted-foreground  mb-3">
            Manage your relationships with party members
          </p>
          <Button
            variant="outline"
            onClick={() => onAction('manage-bonds')}
          >
            <Heart size={16} className="mr-2" />
            Manage Bonds
          </Button>
        </div>
      </Card>
    </div>
  )
}

const RestMode: React.FC<{
  character: Character
  onAction: (actionId: string) => void
}> = ({ character: _character, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display text-accent mb-2">🏕️ Rest Mode</h3>
        <p className="text-sm text-muted-foreground ">
          Recover and prepare for the next challenge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="magical">
          <div className="text-center space-y-3">
            <Heart size={32} className="mx-auto text-destructive" />
            <div>
              <h4 className="font-medium">Heal</h4>
              <p className="text-sm text-muted-foreground ">
                Recover hit points
              </p>
            </div>
            <Button
              className="w-full bg-destructive/120 hover:bg-destructive"
              onClick={() => onAction('heal')}
            >
              Rest & Heal
            </Button>
          </div>
        </Card>

        <Card variant="magical">
          <div className="text-center space-y-3">
            <Sparkles size={32} className="mx-auto text-primary" />
            <div>
              <h4 className="font-medium">Prepare</h4>
              <p className="text-sm text-muted-foreground ">
                Ready spells & equipment
              </p>
            </div>
            <Button
              className="w-full bg-primary/100 hover:bg-primary"
              onClick={() => onAction('prepare')}
            >
              Prepare
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export const ContextualActionZone: React.FC<ContextualActionZoneProps> = ({
  character,
  gameMode,
  theme,
  onGameModeChange: _onGameModeChange,
  className = '',
}) => {
  const { promptForChronicle } = useChronicle()

  const handleCombatAction = useCallback((action: CombatAction) => {
    logger.info('Combat action:', action)
    promptForChronicle(
      `${character.name} attempts to ${action.name.toLowerCase()}`,
      'combat_action',
      character.name,
    )
  }, [character.name, promptForChronicle])

  const handleExplorationAction = useCallback((action: ExplorationAction) => {
    logger.info('Exploration action:', action)
    promptForChronicle(
      `${character.name} tries to ${action.name.toLowerCase()}`,
      'exploration_action',
      character.name,
    )
  }, [character.name, promptForChronicle])

  const handleSocialAction = useCallback((actionId: string) => {
    logger.info('Social action:', actionId)
    promptForChronicle(
      `${character.name} engages in social interaction`,
      'social_action',
      character.name,
    )
  }, [character.name, promptForChronicle])

  const handleRestAction = useCallback((actionId: string) => {
    logger.info('Rest action:', actionId)
    promptForChronicle(
      `${character.name} takes time to rest and recover`,
      'rest_action',
      character.name,
    )
  }, [character.name, promptForChronicle])

  const cardVariant
    = theme === 'combat'
      ? 'elevated'
      : theme === 'dungeon'
        ? 'parchment'
        : theme === 'tavern'
          ? 'magical'
          : 'glass'

  return (
    <Card
      variant={cardVariant}
      className={`h-full overflow-y-auto ${className}`}
    >
      <CardContent>
        <AnimatePresence mode="wait">
          {gameMode === 'combat' && (
            <motion.div
              key="combat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CombatMode character={character} onAction={handleCombatAction} />
            </motion.div>
          )}

          {gameMode === 'exploration' && (
            <motion.div
              key="exploration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExplorationMode character={character} onAction={handleExplorationAction} />
            </motion.div>
          )}

          {gameMode === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SocialMode character={character} onAction={handleSocialAction} />
            </motion.div>
          )}

          {gameMode === 'rest' && (
            <motion.div
              key="rest"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RestMode character={character} onAction={handleRestAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

export default ContextualActionZone
