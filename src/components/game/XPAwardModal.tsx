/**
 * XP Award Modal - Modal dialog for awarding experience points to characters
 */

import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trophy, Users, Plus, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../ui'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { useCharacterStore } from '../../stores/characterStore'
import type { Character } from '../../models/Character'

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

const XP_PRESETS = [
  { label: 'Minor Achievement', amount: 1, description: 'Small progress or minor success' },
  { label: 'Significant Progress', amount: 2, description: 'Good roleplay or problem solving' },
  { label: 'Major Milestone', amount: 3, description: 'Completing major objectives' },
  { label: 'Session Completion', amount: 1, description: 'End of session bonus' }
]

export const XPAwardModal: React.FC<XPAwardModalProps> = ({
  isOpen,
  onClose,
  onAwarded
}) => {
  const characters = useCharacterStore(state => state.characters)
  const addXP = useCharacterStore(state => state.addXP)

  const [characterAwards, setCharacterAwards] = useState<CharacterXPAward[]>([])
  const [globalXP, setGlobalXP] = useState<number>(1)
  const [globalReason, setGlobalReason] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [awardMode, setAwardMode] = useState<'global' | 'individual'>('global')

  // Initialize character awards when modal opens
  useEffect(() => {
    if (isOpen) {
      setCharacterAwards(
        characters.map(character => ({
          character,
          xpAmount: 1,
          selected: true,
          reason: ''
        }))
      )
      setGlobalXP(1)
      setGlobalReason('')
      setAwardMode('global')
    }
  }, [isOpen, characters])

  const handleGlobalXPChange = (amount: number) => {
    setGlobalXP(amount)
    setCharacterAwards(prev =>
      prev.map(award => ({
        ...award,
        xpAmount: amount
      }))
    )
  }

  const handleIndividualXPChange = (characterId: string, amount: number) => {
    setCharacterAwards(prev =>
      prev.map(award =>
        award.character.id === characterId
          ? { ...award, xpAmount: Math.max(0, Math.min(10, amount)) }
          : award
      )
    )
  }

  const handleToggleCharacter = (characterId: string) => {
    setCharacterAwards(prev =>
      prev.map(award =>
        award.character.id === characterId
          ? { ...award, selected: !award.selected }
          : award
      )
    )
  }

  const handleReasonChange = (characterId: string, reason: string) => {
    setCharacterAwards(prev =>
      prev.map(award =>
        award.character.id === characterId
          ? { ...award, reason }
          : award
      )
    )
  }

  const handlePresetXP = (amount: number, description: string) => {
    if (awardMode === 'global') {
      handleGlobalXPChange(amount)
      setGlobalReason(description)
    } else {
      setCharacterAwards(prev =>
        prev.map(award => ({
          ...award,
          xpAmount: amount,
          reason: description
        }))
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedAwards = characterAwards.filter(award => award.selected && award.xpAmount > 0)

    if (selectedAwards.length === 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const totalXPAwarded = selectedAwards.reduce((sum, award) => sum + award.xpAmount, 0)

      // Award XP to each selected character
      for (const award of selectedAwards) {
        const reason = awardMode === 'global'
          ? globalReason || 'Session XP Award'
          : award.reason || 'Individual XP Award'

        addXP(
          award.character.id,
          award.xpAmount,
          'Session Award',
          reason
        )
      }

      onAwarded?.(totalXPAwarded, selectedAwards.length)
      onClose()
    } catch (error) {
      console.error('Error awarding XP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCharacters = characterAwards.filter(award => award.selected)
  const totalXPToAward = selectedCharacters.reduce((sum, award) => sum + award.xpAmount, 0)

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[90vh] overflow-y-auto">
          <Card variant="magical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Award Experience Points</CardTitle>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Award Mode Toggle */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Award Method</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={awardMode === 'global' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAwardMode('global')}
                    >
                      <Users size={16} />
                      Global Award
                    </Button>
                    <Button
                      type="button"
                      variant={awardMode === 'individual' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setAwardMode('individual')}
                    >
                      <Star size={16} />
                      Individual Awards
                    </Button>
                  </div>
                </div>

                {/* XP Presets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {XP_PRESETS.map(preset => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="justify-start h-auto p-3"
                        onClick={() => handlePresetXP(preset.amount, preset.description)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-xs text-muted-foreground">{preset.amount} XP - {preset.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Global Settings */}
                {awardMode === 'global' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">XP Amount</label>
                        <Input
                          type="number"
                          value={globalXP}
                          onChange={(e) => handleGlobalXPChange(parseInt(e.target.value) || 0)}
                          min="0"
                          max="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Total XP</label>
                        <div className="px-3 py-2 bg-muted rounded-lg text-sm font-medium">
                          {totalXPToAward} XP to {selectedCharacters.length} character{selectedCharacters.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reason</label>
                      <Input
                        value={globalReason}
                        onChange={(e) => setGlobalReason(e.target.value)}
                        placeholder="Why are you awarding this XP?"
                      />
                    </div>
                  </div>
                )}

                {/* Character Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} />
                    Characters ({selectedCharacters.length}/{characterAwards.length} selected)
                  </label>

                  {characterAwards.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No characters found</p>
                      <p className="text-xs">Create characters first to award XP</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {characterAwards.map((award) => (
                        <Card key={award.character.id} variant="surface">
                          <CardContent className="p-4 pt-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={award.selected}
                                onChange={() => handleToggleCharacter(award.character.id)}
                                className="h-4 w-4"
                              />
                              <div className="flex-1">
                                <div className="font-medium">{award.character.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Level {award.character.level} • Current XP: {award.character.xp}
                                </div>
                              </div>

                              {awardMode === 'individual' && (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    type="number"
                                    value={award.xpAmount}
                                    onChange={(e) => handleIndividualXPChange(award.character.id, parseInt(e.target.value) || 0)}
                                    min="0"
                                    max="10"
                                    className="w-20"
                                  />
                                  <span className="text-sm">XP</span>
                                </div>
                              )}

                              {awardMode === 'global' && (
                                <div className="text-sm font-medium">
                                  +{award.xpAmount} XP
                                </div>
                              )}
                            </div>

                            {awardMode === 'individual' && award.selected && (
                              <div className="mt-3">
                                <Input
                                  value={award.reason}
                                  onChange={(e) => handleReasonChange(award.character.id, e.target.value)}
                                  placeholder="Reason for this character's XP..."
                                  className="text-sm"
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
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedCharacters.length > 0 ? (
                      <>
                        Awarding <span className="font-medium">{totalXPToAward} total XP</span> to{' '}
                        <span className="font-medium">{selectedCharacters.length}</span> character
                        {selectedCharacters.length !== 1 ? 's' : ''}
                      </>
                    ) : (
                      'Select characters to award XP'
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting || selectedCharacters.length === 0 || totalXPToAward === 0}
                      className="min-w-20"
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
