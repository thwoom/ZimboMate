/**
 * XP Award Modal - Modal dialog for awarding experience points to characters
 */

import type { Character } from '../../models/Character'
import * as Dialog from '@radix-ui/react-dialog'
import { Star, Trophy, Users, X } from 'lucide-react'
import React, { useEffect, useReducer } from 'react'
import { useCharacterStore } from '../../stores/characterStore'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { Input } from '../ui/Input'

interface XPAwardModalProps {
  isOpen: boolean
  onClose: () => void
  onAwarded?: (totalXPAwarded: number, charactersAffected: number) => void
}

interface CharacterXPAward {
  character: Character
  xpAmount: number
  selected: boolean
  reason: string
}

type AwardMode = 'global' | 'individual'

interface AwardState {
  characterAwards: CharacterXPAward[]
  globalXP: number
  globalReason: string
  awardMode: AwardMode
  isSubmitting: boolean
}

type AwardAction =
  | { type: 'reset'; characters: Character[] }
  | { type: 'setGlobalXP'; amount: number }
  | { type: 'setGlobalReason'; reason: string }
  | { type: 'setAwardMode'; mode: AwardMode }
  | { type: 'setCharacterXP'; characterId: string; amount: number }
  | { type: 'toggleCharacter'; characterId: string }
  | { type: 'setCharacterReason'; characterId: string; reason: string }
  | { type: 'applyIndividualPreset'; amount: number; reason: string }
  | { type: 'setSubmitting'; isSubmitting: boolean }

const awardReducer = (state: AwardState, action: AwardAction): AwardState => {
  switch (action.type) {
    case 'reset':
      return {
        characterAwards: action.characters.map((character) => ({
          character,
          xpAmount: 1,
          selected: true,
          reason: '',
        })),
        globalXP: 1,
        globalReason: '',
        awardMode: 'global',
        isSubmitting: false,
      }
    case 'setGlobalXP':
      return {
        ...state,
        globalXP: action.amount,
        characterAwards: state.characterAwards.map((award) => ({
          ...award,
          xpAmount: action.amount,
        })),
      }
    case 'setGlobalReason':
      return { ...state, globalReason: action.reason }
    case 'setAwardMode':
      return { ...state, awardMode: action.mode }
    case 'setCharacterXP':
      return {
        ...state,
        characterAwards: state.characterAwards.map((award) =>
          award.character.id === action.characterId
            ? {
                ...award,
                xpAmount: Math.max(0, Math.min(10, action.amount)),
              }
            : award,
        ),
      }
    case 'toggleCharacter':
      return {
        ...state,
        characterAwards: state.characterAwards.map((award) =>
          award.character.id === action.characterId
            ? { ...award, selected: !award.selected }
            : award,
        ),
      }
    case 'setCharacterReason':
      return {
        ...state,
        characterAwards: state.characterAwards.map((award) =>
          award.character.id === action.characterId
            ? { ...award, reason: action.reason }
            : award,
        ),
      }
    case 'applyIndividualPreset':
      return {
        ...state,
        characterAwards: state.characterAwards.map((award) => ({
          ...award,
          xpAmount: action.amount,
          reason: action.reason,
        })),
      }
    case 'setSubmitting':
      return { ...state, isSubmitting: action.isSubmitting }
    default:
      return state
  }
}

const XP_PRESETS = [
  {
    label: 'Minor Achievement',
    amount: 1,
    description: 'Small progress or minor success',
  },
  {
    label: 'Significant Progress',
    amount: 2,
    description: 'Good roleplay or problem solving',
  },
  {
    label: 'Major Milestone',
    amount: 3,
    description: 'Completing major objectives',
  },
  {
    label: 'Session Completion',
    amount: 1,
    description: 'End of session bonus',
  },
]

export const XPAwardModal: React.FC<XPAwardModalProps> = ({
  isOpen,
  onClose,
  onAwarded,
}) => {
  const characters = useCharacterStore((state) => state.characters)
  const addXP = useCharacterStore((state) => state.addXP)

  const [state, dispatch] = useReducer(awardReducer, {
    characterAwards: [],
    globalXP: 1,
    globalReason: '',
    awardMode: 'global',
    isSubmitting: false,
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    dispatch({ type: 'reset', characters })
    setIsSubmitting(false)
  }, [characters, isOpen])

  const { characterAwards, globalXP, globalReason, awardMode, isSubmitting } =
    state

  const handleGlobalXPChange = (amount: number) => {
    dispatch({ type: 'setGlobalXP', amount })
  }

  const handleIndividualXPChange = (characterId: string, amount: number) => {
    dispatch({ type: 'setCharacterXP', characterId, amount })
  }

  const handleToggleCharacter = (characterId: string) => {
    dispatch({ type: 'toggleCharacter', characterId })
  }

  const handleReasonChange = (characterId: string, reason: string) => {
    dispatch({ type: 'setCharacterReason', characterId, reason })
  }

  const handlePresetXP = (amount: number, description: string) => {
    if (awardMode === 'global') {
      dispatch({ type: 'setGlobalXP', amount })
      dispatch({ type: 'setGlobalReason', reason: description })
    } else {
      dispatch({ type: 'applyIndividualPreset', amount, reason: description })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedAwards = characterAwards.filter(
      (award) => award.selected && award.xpAmount > 0,
    )

    if (selectedAwards.length === 0) {
      return
    }

    dispatch({ type: 'setSubmitting', isSubmitting: true })

    try {
      const totalXPAwarded = selectedAwards.reduce(
        (sum, award) => sum + award.xpAmount,
        0,
      )

      // Award XP to each selected character
      for (const award of selectedAwards) {
        const reason =
          awardMode === 'global'
            ? globalReason || 'Session XP Award'
            : award.reason || 'Individual XP Award'

        addXP(award.character.id, award.xpAmount, 'Session Award', reason)
      }

      onAwarded?.(totalXPAwarded, selectedAwards.length)
      onClose()
    } catch (error) {
      console.error('Error awarding XP:', error)
    } finally {
      dispatch({ type: 'setSubmitting', isSubmitting: false })
    }
  }
  const selectedCharacters = characterAwards.filter((award) => award.selected)
  const totalXPToAward = selectedCharacters.reduce(
    (sum, award) => sum + award.xpAmount,
    0,
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
        <Dialog.Content className='fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto'>
          <Card variant='magical'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <div className='flex items-center gap-3'>
                <Trophy className='h-5 w-5 text-primary' />
                <CardTitle className='text-xl'>
                  Award Experience Points
                </CardTitle>
              </div>
              <Dialog.Close asChild>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                  <X className='h-4 w-4' />
                </Button>
              </Dialog.Close>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Award Mode Toggle */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Award Method</label>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant={awardMode === 'global' ? 'primary' : 'ghost'}
                      size='sm'
                      onClick={() =>
                        dispatch({ type: 'setAwardMode', mode: 'global' })
                      }
                    >
                      <Users size={16} />
                      Global Award
                    </Button>
                    <Button
                      type='button'
                      variant={awardMode === 'individual' ? 'primary' : 'ghost'}
                      size='sm'
                      onClick={() =>
                        dispatch({ type: 'setAwardMode', mode: 'individual' })
                      }
                    >
                      <Star size={16} />
                      Individual Awards
                    </Button>
                  </div>
                </div>

                {/* XP Presets */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium'>Quick Presets</label>
                  <div className='grid grid-cols-2 gap-2'>
                    {XP_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type='button'
                        variant='outline'
                        size='sm'
                        className='justify-start h-auto p-3'
                        onClick={() =>
                          handlePresetXP(preset.amount, preset.description)
                        }
                      >
                        <div className='text-left'>
                          <div className='font-medium'>{preset.label}</div>
                          <div className='text-xs text-muted-foreground'>
                            {preset.amount} XP - {preset.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Global Settings */}
                {awardMode === 'global' && (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>XP Amount</label>
                        <Input
                          type='number'
                          value={globalXP}
                          onChange={(e) =>
                            handleGlobalXPChange(
                              Number.parseInt(e.target.value) || 0,
                            )
                          }
                          min='0'
                          max='10'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>Total XP</label>
                        <div className='px-3 py-2 bg-muted rounded-lg text-sm font-medium'>
                          {totalXPToAward} XP to
                          {selectedCharacters.length} character
                          {selectedCharacters.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Reason</label>
                      <Input
                        value={globalReason}
                        onChange={(e) =>
                          dispatch({
                            type: 'setGlobalReason',
                            reason: e.target.value,
                          })
                        }
                        placeholder='Why are you awarding this XP?'
                      />
                    </div>
                  </div>
                )}

                {/* Character Selection */}
                <div className='space-y-3'>
                  <label className='text-sm font-medium flex items-center gap-2'>
                    <Users size={16} />
                    Characters ({selectedCharacters.length}/
                    {characterAwards.length} selected)
                  </label>

                  {characterAwards.length === 0 ? (
                    <div className='text-center py-6 text-muted-foreground'>
                      <Users size={32} className='mx-auto mb-2 opacity-50' />
                      <p>No characters found</p>
                      <p className='text-xs'>
                        Create characters first to award XP
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {characterAwards.map((award) => (
                        <Card key={award.character.id} variant='surface'>
                          <CardContent className='p-4 pt-4'>
                            <div className='flex items-center gap-4'>
                              <input
                                type='checkbox'
                                checked={award.selected}
                                onChange={() =>
                                  handleToggleCharacter(award.character.id)
                                }
                                className='h-4 w-4'
                              />
                              <div className='flex-1'>
                                <div className='font-medium'>
                                  {award.character.name}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Level {award.character.level} • Current XP:{' '}
                                  {award.character.xp}
                                </div>
                              </div>

                              {awardMode === 'individual' && (
                                <div className='flex gap-2 items-center'>
                                  <Input
                                    type='number'
                                    value={award.xpAmount}
                                    onChange={(e) =>
                                      handleIndividualXPChange(
                                        award.character.id,
                                        Number.parseInt(e.target.value) || 0,
                                      )
                                    }
                                    min='0'
                                    max='10'
                                    className='w-20'
                                  />
                                  <span className='text-sm'>XP</span>
                                </div>
                              )}

                              {awardMode === 'global' && (
                                <div className='text-sm font-medium'>
                                  +{award.xpAmount} XP
                                </div>
                              )}
                            </div>

                            {awardMode === 'individual' && award.selected && (
                              <div className='mt-3'>
                                <Input
                                  value={award.reason}
                                  onChange={(e) =>
                                    handleReasonChange(
                                      award.character.id,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Reason for this character's XP..."
                                  className='text-sm'
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex items-center justify-between pt-4'>
                  <div className='text-sm text-muted-foreground'>
                    {selectedCharacters.length > 0 ? (
                      <>
                        Awarding{' '}
                        <span className='font-medium'>
                          {totalXPToAward} total XP
                        </span>{' '}
                        to{' '}
                        <span className='font-medium'>
                          {selectedCharacters.length}
                        </span>{' '}
                        character
                        {selectedCharacters.length !== 1 ? 's' : ''}
                      </>
                    ) : (
                      'Select characters to award XP'
                    )}
                  </div>
                  <div className='flex gap-3'>
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='primary'
                      disabled={
                        isSubmitting ||
                        selectedCharacters.length === 0 ||
                        totalXPToAward === 0
                      }
                      className='min-w-20'
                    >
                      {isSubmitting ? 'Awarding...' : 'Award XP'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
