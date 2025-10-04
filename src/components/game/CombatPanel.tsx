import type { CombatParticipant } from '../../stores/combatStore'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Dice6,
  Heart,
  Minus,
  Pause,
  Play,
  Plus,
  Shield,
  SkipForward,
  Sword,
  Target,
} from 'lucide-react'
import React, { useState } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import { useCombatStore } from '../../stores/combatStore'
import { Badge, Button, Card, CardContent } from '../ui'

interface CombatPanelProps {
  onRollDamage?: (weaponName: string, dice: number[]) => void
  onRollMove?: (moveName: string, moveId: string, targetId?: string) => void
}

export const CombatPanel: React.FC<CombatPanelProps> = ({
  onRollDamage,
  onRollMove,
}) => {
  const {
    currentEncounter,
    startCombat,
    endCombat,
    pauseCombat,
    resumeCombat,
    nextTurn,
    previousTurn,
    addParticipant,
    applyDamage,
    healParticipant,
    removeCondition,
    getCurrentParticipant,
    isEncounterComplete,
    getCombatSummary,
  } = useCombatStore()

  const { getActiveCharacter } = useCharacterStore()
  const [showAddParticipant, setShowAddParticipant] = useState(false)
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    type: 'monster' as const,
    hp: { current: 10, max: 10 },
    armor: 0,
    position: 'close' as const,
    isPlayer: false,
  })

  const activeCharacter = getActiveCharacter()
  const currentParticipant = getCurrentParticipant()
  const combatSummary = getCombatSummary()
  const encounterComplete = isEncounterComplete()

  const handleStartCombat = () => {
    if (!activeCharacter) return

    const playerParticipant: Omit<CombatParticipant, 'id'> = {
      name: activeCharacter.name,
      type: 'character',
      characterId: activeCharacter.id,
      hp: activeCharacter.hp,
      armor: 0, // TODO: Calculate from equipment
      conditions: [],
      position: 'close',
      isActive: true,
      isPlayer: true,
    }

    startCombat('New Encounter', [playerParticipant])
  }

  const handleAddParticipant = () => {
    if (!newParticipant.name.trim()) return

    addParticipant(newParticipant)
    setNewParticipant({
      name: '',
      type: 'monster',
      hp: { current: 10, max: 10 },
      armor: 0,
      position: 'close',
      isPlayer: false,
    })
    setShowAddParticipant(false)
  }

  const handleDamageParticipant = (participantId: string, damage: number) => {
    applyDamage(participantId, damage)
  }

  const handleHealParticipant = (participantId: string, amount: number) => {
    healParticipant(participantId, amount)
  }

  const getParticipantStatusColor = (participant: CombatParticipant) => {
    const hpPercent = (participant.hp.current / participant.hp.max) * 100
    if (hpPercent <= 0) return 'var(--red-600)'
    if (hpPercent <= 25) return 'var(--red-500)'
    if (hpPercent <= 50) return 'var(--yellow-500)'
    return 'var(--green-500)'
  }

  if (!currentEncounter) {
    return (
      <Card variant='magical'>
        <CardContent className='text-center space-y-6 p-6 pt-6'>
          <div className='space-y-2'>
            <Sword size={48} className='mx-auto text-primary' />
            <h3 className='text-xl font-display'>Combat Tracker</h3>
            <p className='text-muted-foreground'>
              Start a combat encounter to track initiative, damage, and
              conditions
            </p>
          </div>

          <Button
            variant='primary'
            size='lg'
            onClick={handleStartCombat}
            disabled={!activeCharacter}
            className='gap-2'
          >
            <Play size={20} />
            Start Combat
          </Button>

          {!activeCharacter && (
            <p className='text-sm text-muted-foreground'>
              Select a character to start combat
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Combat Header */}
      <Card variant='magical'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <h3 className='text-lg font-display'>{currentEncounter.name}</h3>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <span>
                  Round
                  {combatSummary.round}
                </span>
                <span>
                  Turn
                  {combatSummary.turn}
                </span>
                <span>{combatSummary.activeParticipants} Active</span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant={
                  currentEncounter.status === 'active' ? 'default' : 'secondary'
                }
              >
                {currentEncounter.status}
              </Badge>

              {currentEncounter.status === 'active' ? (
                <Button variant='ghost' size='sm' onClick={pauseCombat}>
                  <Pause size={16} />
                </Button>
              ) : (
                <Button variant='ghost' size='sm' onClick={resumeCombat}>
                  <Play size={16} />
                </Button>
              )}

              <Button variant='outline' size='sm' onClick={endCombat}>
                End Combat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Turn Controls */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' onClick={previousTurn}>
                <SkipForward size={16} className='rotate-180' />
              </Button>

              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>
                  Current Turn
                </div>
                <div className='font-semibold'>
                  {currentParticipant?.name || 'No active participant'}
                </div>
              </div>

              <Button variant='ghost' size='sm' onClick={nextTurn}>
                <SkipForward size={16} />
              </Button>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAddParticipant(true)}
              className='gap-2'
            >
              <Plus size={16} />
              Add Participant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <div className='space-y-3'>
        <h4 className='font-semibold'>Participants</h4>

        <div className='grid gap-3'>
          {currentEncounter.participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative ${
                index === currentEncounter.currentTurn
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
            >
              <Card variant={participant.hp.current <= 0 ? 'muted' : 'default'}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='relative'>
                        <div
                          className='w-3 h-3 rounded-full'
                          style={{
                            backgroundColor:
                              getParticipantStatusColor(participant),
                          }}
                        />
                        {index === currentEncounter.currentTurn && (
                          <div className='absolute -inset-1 rounded-full border-2 border-primary animate-pulse' />
                        )}
                      </div>

                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold'>
                            {participant.name}
                          </span>
                          {participant.isPlayer && (
                            <Badge variant='outline' size='sm'>
                              Player
                            </Badge>
                          )}
                          {participant.initiative && (
                            <Badge variant='secondary' size='sm'>
                              Init: {participant.initiative}
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Heart size={12} />
                            {participant.hp.current}/{participant.hp.max}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Shield size={12} />
                            {participant.armor}
                          </span>
                          <span className='capitalize'>
                            {participant.position}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      {/* Quick Actions */}
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleDamageParticipant(participant.id, 1)
                          }
                          disabled={participant.hp.current <= 0}
                        >
                          <Minus size={12} />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleHealParticipant(participant.id, 1)
                          }
                          disabled={
                            participant.hp.current >= participant.hp.max
                          }
                        >
                          <Plus size={12} />
                        </Button>
                      </div>

                      {/* Combat Actions */}
                      {participant.hp.current > 0 && (
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              onRollMove?.(
                                'Attack',
                                'hack-and-slash',
                                participant.id,
                              )
                            }
                            title='Attack this target'
                          >
                            <Target size={12} />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              onRollDamage?.('Weapon', [
                                Math.floor(Math.random() * 8) + 1,
                              ])
                            }
                            title='Roll damage'
                          >
                            <Dice6 size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditions */}
                  {participant.conditions.length > 0 && (
                    <div className='mt-3 flex flex-wrap gap-1'>
                      {participant.conditions.map((condition) => (
                        <Badge
                          key={condition}
                          variant='outline'
                          size='sm'
                          className='gap-1 cursor-pointer'
                          onClick={() =>
                            removeCondition(participant.id, condition)
                          }
                        >
                          <AlertTriangle size={10} />
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* HP Bar */}
                  <div className='mt-3'>
                    <div className='w-full bg-muted rounded-full h-2'>
                      <motion.div
                        className='h-2 rounded-full transition-all duration-300'
                        style={{
                          backgroundColor:
                            getParticipantStatusColor(participant),
                          width: `${Math.max(0, (participant.hp.current / participant.hp.max) * 100)}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(0, (participant.hp.current / participant.hp.max) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Participant Modal */}
      <AnimatePresence>
        {showAddParticipant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
            onClick={() => setShowAddParticipant(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='w-full max-w-md'
            >
              <Card>
                <CardContent className='p-6 space-y-4'>
                  <h3 className='text-lg font-semibold'>Add Participant</h3>

                  <div className='space-y-3'>
                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Name
                      </label>
                      <input
                        type='text'
                        value={newParticipant.name}
                        onChange={(e) =>
                          setNewParticipant((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className='w-full px-3 py-2 border rounded-md'
                        placeholder='Participant name'
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          HP
                        </label>
                        <input
                          type='number'
                          value={newParticipant.hp.max}
                          onChange={(e) => {
                            const hp = Number.parseInt(e.target.value) || 10
                            setNewParticipant((prev) => ({
                              ...prev,
                              hp: { current: hp, max: hp },
                            }))
                          }}
                          className='w-full px-3 py-2 border rounded-md'
                          min='1'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium mb-1'>
                          Armor
                        </label>
                        <input
                          type='number'
                          value={newParticipant.armor}
                          onChange={(e) =>
                            setNewParticipant((prev) => ({
                              ...prev,
                              armor: Number.parseInt(e.target.value) || 0,
                            }))
                          }
                          className='w-full px-3 py-2 border rounded-md'
                          min='0'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium mb-1'>
                        Type
                      </label>
                      <select
                        value={newParticipant.type}
                        onChange={(e) =>
                          setNewParticipant((prev) => ({
                            ...prev,
                            type: e.target.value as any,
                          }))
                        }
                        className='w-full px-3 py-2 border rounded-md'
                      >
                        <option value='monster'>Monster</option>
                        <option value='npc'>NPC</option>
                        <option value='character'>Character</option>
                      </select>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      variant='primary'
                      onClick={handleAddParticipant}
                      disabled={!newParticipant.name.trim()}
                      className='flex-1'
                    >
                      Add
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddParticipant(false)}
                      className='flex-1'
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encounter Complete */}
      {encounterComplete && (
        <Card variant='success'>
          <CardContent className='p-4 text-center'>
            <div className='space-y-2'>
              <div className='text-lg font-semibold'>Encounter Complete!</div>
              <p className='text-sm text-muted-foreground'>
                The battle has ended. You can review the results or start a new
                encounter.
              </p>
              <Button variant='primary' onClick={endCombat}>
                End Encounter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
