import type { Character } from '@/models/Character'
import type { ServiceSpell } from '@/services/SpellCastingService'
import type { LevelUpWizardStep } from '@/stores/characterStore'

import { ArrowRight, BookOpen, CheckCircle2, Info, Shield, Sparkles, Wand2 } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { shallow } from 'zustand/shallow'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/Progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { spellCastingService } from '@/services/SpellCastingService'
import {
  LEVEL_UP_WIZARD_STEPS,
  useCharacterStore,
} from '@/stores/characterStore'

interface LevelUpWizardProps {
  characterId?: string
}

interface StepMetadata {
  title: string
  description: string
  icon: React.ReactNode
}

const STEP_METADATA: Record<LevelUpWizardStep, StepMetadata> = {
  overview: {
    title: 'Overview',
    description: 'Review what changes when you advance.',
    icon: <Sparkles className='size-4 text-primary' />,
  },
  stat: {
    title: 'Stat Increase',
    description: 'Optionally raise an ability score (max 18).',
    icon: <Shield className='size-4 text-chart-2' />,
  },
  move: {
    title: 'New Move',
    description: 'Select one advanced move unlocked at this level.',
    icon: <Wand2 className='size-4 text-chart-4' />,
  },
  spells: {
    title: 'Spellbook',
    description: 'Add spells granted at this level.',
    icon: <BookOpen className='size-4 text-chart-3' />,
  },
  review: {
    title: 'Review & Confirm',
    description: 'Validate your choices and finalize the level-up.',
    icon: <CheckCircle2 className='size-4 text-success' />,
  },
}

interface StoreSlice {
  activeCharacterId: string | null
  pendingAdvancements: ReturnType<typeof useCharacterStore.getState>['pendingAdvancements']
  updateLevelUpDraft: ReturnType<typeof useCharacterStore.getState>['updateLevelUpDraft']
  applyLevelUpChoices: ReturnType<typeof useCharacterStore.getState>['applyLevelUpChoices']
  cancelLevelUp: ReturnType<typeof useCharacterStore.getState>['cancelLevelUp']
  clearError: ReturnType<typeof useCharacterStore.getState>['clearError']
  error: ReturnType<typeof useCharacterStore.getState>['error']
  characters: Character[]
}

export const LevelUpWizard: React.FC<LevelUpWizardProps> = ({
  characterId,
}) => {
  const {
    activeCharacterId,
    pendingAdvancements,
    updateLevelUpDraft,
    applyLevelUpChoices,
    cancelLevelUp,
    clearError,
    error,
    characters,
  } = useCharacterStore(
    (state) =>
      ({
        activeCharacterId: state.activeCharacterId,
        pendingAdvancements: state.pendingAdvancements,
        updateLevelUpDraft: state.updateLevelUpDraft,
        applyLevelUpChoices: state.applyLevelUpChoices,
        cancelLevelUp: state.cancelLevelUp,
        clearError: state.clearError,
        error: state.error,
        characters: state.characters,
      }) as StoreSlice,
    shallow,
  )

  const pendingCharacterIds = useMemo(
    () => Object.keys(pendingAdvancements),
    [pendingAdvancements],
  )

  const requestedCharacterId = characterId ?? activeCharacterId ?? null

  const fallbackCharacterId =
    pendingCharacterIds.length > 0 ? pendingCharacterIds[0] : null

  const effectiveCharacterId =
    requestedCharacterId &&
    pendingAdvancements[requestedCharacterId]
      ? requestedCharacterId
      : fallbackCharacterId
  const pending = effectiveCharacterId
    ? pendingAdvancements[effectiveCharacterId]
    : undefined

  const character = useMemo(() => {
    if (!effectiveCharacterId) return undefined
    return characters.find((entry) => entry.id === effectiveCharacterId)
  }, [characters, effectiveCharacterId])

  const [isOpen, setIsOpen] = useReducer(
    (_previous: boolean, next: boolean) => next,
    false,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const pendingKeyRef = useRef<string | null>(null)

  const pendingKey = pending
    ? `${pending.characterId}-${pending.createdAt}`
    : null

  const openWizard = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeWizard = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (pendingKey && pendingKey !== pendingKeyRef.current) {
      openWizard()
      pendingKeyRef.current = pendingKey
    } else if (!pendingKey) {
      closeWizard()
      pendingKeyRef.current = null
    }
  }, [closeWizard, openWizard, pendingKey])

  useEffect(() => {
    if (!pending || !effectiveCharacterId) {
      return
    }
    const draftStep = pending.draft?.activeStep
    if (!draftStep || !LEVEL_UP_WIZARD_STEPS.includes(draftStep)) {
      updateLevelUpDraft(effectiveCharacterId, { activeStep: 'overview' })
    }
  }, [pending, effectiveCharacterId, updateLevelUpDraft])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        openWizard()
      } else {
        // Show confirmation dialog when trying to close
        setCancelDialogOpen(true)
      }
    },
    [openWizard, setCancelDialogOpen],
  )

  const statOptions = useMemo(
    () =>
      pending?.availableOptions.filter((option) => option.type === 'stat') ??
      [],
    [pending?.availableOptions],
  )

  const moveOptions = useMemo(
    () =>
      pending?.availableOptions.filter((option) => option.type === 'move') ??
      [],
    [pending?.availableOptions],
  )

  const spellProgression =
    character?.class === 'Wizard'
      ? pending?.spellProgression?.wizard
      : character?.class === 'Cleric'
        ? pending?.spellProgression?.cleric
        : undefined

  const requiredSpellCount =
    character?.class === 'Wizard'
      ? spellProgression?.newSpellsKnown ?? 0
      : 0

  const hasSpellStep =
    character?.class === 'Wizard' || character?.class === 'Cleric'

  const includeSpellStep =
    hasSpellStep &&
    (requiredSpellCount > 0 || Boolean(spellProgression?.notes))

  const wizardSpellChoices: ServiceSpell[] = useMemo(() => {
    if (!character || character.class !== 'Wizard' || !pending) {
      return []
    }
    const known = new Set(character.knownSpells ?? [])
    const spells = spellCastingService.getAvailableSpells(
      character.class,
      pending.levelAfter,
    )
    return spells
      .filter((spell) => !known.has(spell.id))
      .sort((a, b) =>
        a.level === b.level
          ? a.name.localeCompare(b.name)
          : a.level - b.level,
      )
  }, [character, pending])

  const groupedWizardSpells = useMemo(() => {
    if (!wizardSpellChoices.length) return []
    const groups = new Map<number, ServiceSpell[]>()
    for (const spell of wizardSpellChoices) {
      if (!groups.has(spell.level)) {
        groups.set(spell.level, [])
      }
      groups.get(spell.level)!.push(spell)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0])
  }, [wizardSpellChoices])

  const draft = pending?.draft
  const selectedStat = draft?.statIncreaseId ?? ''
  const selectedMoveId = draft?.moveIds?.[0] ?? ''
  const selectedSpells = useMemo(
    () => draft?.spellSelections ?? [],
    [draft?.spellSelections],
  )
  const chronicleEnabled =
    typeof draft?.chronicleEnabled === 'boolean'
      ? draft.chronicleEnabled
      : true
  const currentStep =
    draft?.activeStep && LEVEL_UP_WIZARD_STEPS.includes(draft.activeStep)
      ? draft.activeStep
      : 'overview'

  const steps = useMemo(() => {
    const derivedSteps: LevelUpWizardStep[] = ['overview']
    if (statOptions.length > 0) {
      derivedSteps.push('stat')
    }
    if (moveOptions.length > 0) {
      derivedSteps.push('move')
    }
    if (includeSpellStep) {
      derivedSteps.push('spells')
    }
    derivedSteps.push('review')
    return derivedSteps
  }, [statOptions.length, moveOptions.length, includeSpellStep])

  useEffect(() => {
    if (!pending || !effectiveCharacterId) return
    if (!steps.includes(currentStep)) {
      updateLevelUpDraft(effectiveCharacterId, { activeStep: steps[0] })
    }
  }, [
    currentStep,
    steps,
    pending,
    effectiveCharacterId,
    updateLevelUpDraft,
  ])

  const stepIndex = steps.indexOf(currentStep)
  const isLastStep = currentStep === 'review'

  const moveSelectionValid =
    moveOptions.length === 0 || Boolean(selectedMoveId)
  const spellSelectionValid =
    !(
      character?.class === 'Wizard' &&
      requiredSpellCount > 0
    ) || selectedSpells.length === requiredSpellCount

  const readyToConfirm = moveSelectionValid && spellSelectionValid

  const canAdvance =
    currentStep === 'move'
      ? moveSelectionValid
      : currentStep === 'spells'
        ? spellSelectionValid
        : true

  const setActiveStep = useCallback(
    (step: LevelUpWizardStep) => {
      if (!effectiveCharacterId) return
      updateLevelUpDraft(effectiveCharacterId, { activeStep: step })
    },
    [effectiveCharacterId, updateLevelUpDraft],
  )

  const handleNext = useCallback(() => {
    if (!canAdvance) return
    const next = steps[stepIndex + 1]
    if (next) {
      setActiveStep(next)
    }
  }, [canAdvance, setActiveStep, steps, stepIndex])

  const handleBack = useCallback(() => {
    const prev = steps[stepIndex - 1]
    if (prev) {
      setActiveStep(prev)
    }
  }, [setActiveStep, steps, stepIndex])

  const handleStatChange = useCallback(
    (value: string) => {
      if (!effectiveCharacterId) return
      const statIncreaseId = value === 'none' ? undefined : value
      updateLevelUpDraft(effectiveCharacterId, { statIncreaseId })
    },
    [effectiveCharacterId, updateLevelUpDraft],
  )

  const handleMoveSelect = useCallback(
    (moveId: string) => {
      if (!effectiveCharacterId) return
      updateLevelUpDraft(effectiveCharacterId, { moveIds: [moveId] })
    },
    [effectiveCharacterId, updateLevelUpDraft],
  )

  const handleSpellToggle = useCallback(
    (spellId: string) => {
      if (!effectiveCharacterId) return
      const current = new Set(selectedSpells)
      if (current.has(spellId)) {
        current.delete(spellId)
      } else {
        if (
          character?.class === 'Wizard' &&
          requiredSpellCount > 0 &&
          current.size >= requiredSpellCount
        ) {
          return
        }
        current.add(spellId)
      }
      updateLevelUpDraft(effectiveCharacterId, {
        spellSelections: Array.from(current),
      })
    },
    [
      effectiveCharacterId,
      character?.class,
      requiredSpellCount,
      selectedSpells,
      updateLevelUpDraft,
    ],
  )

  const handleChronicleToggle = useCallback(
    (value: boolean) => {
      if (!effectiveCharacterId) return
      updateLevelUpDraft(effectiveCharacterId, {
        chronicleEnabled: value,
      })
    },
    [effectiveCharacterId, updateLevelUpDraft],
  )

  const handleConfirm = useCallback(async () => {
    if (!effectiveCharacterId || !pending) return
    setIsSubmitting(true)
    try {
      await Promise.resolve(
        applyLevelUpChoices(effectiveCharacterId, {
          statIncreaseId: selectedStat || undefined,
          moveIds: selectedMoveId ? [selectedMoveId] : [],
          spellSelections: selectedSpells,
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    effectiveCharacterId,
    pending,
    applyLevelUpChoices,
    selectedStat,
    selectedMoveId,
    selectedSpells,
  ])

  const confirmCancelLevelUp = useCallback(() => {
    if (!effectiveCharacterId) return
    cancelLevelUp(effectiveCharacterId)
    clearError()
    closeWizard()
    setCancelDialogOpen(false)
  }, [
    cancelLevelUp,
    clearError,
    closeWizard,
    effectiveCharacterId,
    setCancelDialogOpen,
  ])

  const dismissCancelDialog = useCallback(() => {
    setCancelDialogOpen(false)
    openWizard()
  }, [setCancelDialogOpen, openWizard])

  if (!pending || !character) {
    return null
  }

  const spellLimitReached =
    character.class === 'Wizard' &&
    requiredSpellCount > 0 &&
    selectedSpells.length >= requiredSpellCount

  const progressPercent = Math.round(
    ((stepIndex + 1) / steps.length) * 100,
  )

  const hpAfter = character.hp.max + pending.hpIncrease
  const loadAfter = character.load.max + pending.loadIncrease

  const spellStepNotes = spellProgression?.notes

  const renderOverview = () => (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Sparkles className='size-5 text-primary' />
            {character.name} Advances to Level {pending.levelAfter}
          </CardTitle>
          <CardDescription>
            Spend {pending.xpCost} XP to unlock new moves and boons.
            Your XP will roll over automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-2'>
          <div className='rounded-md border border-border p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Level
            </p>
            <div className='mt-1 flex items-center gap-2 text-lg font-semibold'>
              {pending.levelBefore}
              <ArrowRight className='size-4 text-muted-foreground' />
              {pending.levelAfter}
            </div>
          </div>
          <div className='rounded-md border border-border p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              XP Spend
            </p>
            <div className='mt-1 flex items-center gap-2 text-lg font-semibold'>
              {pending.xpCost} XP
              <Badge variant='secondary'>Remaining: {Math.max(0, pending.xpBefore - pending.xpCost)}</Badge>
            </div>
          </div>
          <div className='rounded-md border border-border p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Max HP
            </p>
            <div className='mt-1 text-lg font-semibold'>
              {character.hp.max} → {hpAfter}
              {pending.hpIncrease > 0 && (
                <Badge variant='outline' className='ml-2 text-success'>
                  +{pending.hpIncrease}
                </Badge>
              )}
            </div>
          </div>
          <div className='rounded-md border border-border p-3'>
            <p className='text-xs uppercase tracking-wide text-muted-foreground'>
              Max Load
            </p>
            <div className='mt-1 text-lg font-semibold'>
              {character.load.max} → {loadAfter}
              {pending.loadIncrease > 0 && (
                <Badge variant='outline' className='ml-2 text-chart-1'>
                  +{pending.loadIncrease}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {spellStepNotes && (
        <Alert>
          <Info className='size-4' />
          <AlertTitle>Spellcasting Update</AlertTitle>
          <AlertDescription>{spellStepNotes}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  const renderStatStep = () => (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        You may raise one ability score by +1 (maximum 18). Leave this
        blank if you’d prefer to keep your current scores.
      </p>
      <RadioGroup
        value={selectedStat || 'none'}
        onValueChange={handleStatChange}
      >
        <Card
          data-testid='stat-option-none'
          className={cn(
            'border-dashed',
            !selectedStat && 'border-primary/50 bg-primary/5',
          )}
        >
          <CardContent className='flex items-center justify-between p-4'>
            <div>
              <p className='font-medium'>No stat increase</p>
              <p className='text-sm text-muted-foreground'>
                Skip this bonus for now.
              </p>
            </div>
            <RadioGroupItem value='none' aria-label='No stat increase' />
          </CardContent>
        </Card>
        {statOptions.map((option) => (
          <Card
            key={option.id}
            data-testid={`stat-option-${option.id}`}
            className={cn(
              'transition-colors',
              selectedStat === option.id
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/60',
            )}
          >
            <CardContent className='flex items-start justify-between gap-3 p-4'>
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-foreground'>{option.name}</p>
                <p className='text-sm text-muted-foreground break-words'>
                  {option.description}
                </p>
              </div>
              <RadioGroupItem value={option.id} aria-label={option.name} />
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  )

  const renderMoveStep = () => (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        Choose one advanced move. Moves you already know are hidden.
      </p>
      <div className='grid gap-3'>
        {moveOptions.map((option) => {
          const selected = selectedMoveId === option.id
          return (
            <button
              key={option.id}
              type='button'
              onClick={() => handleMoveSelect(option.id)}
              data-testid={`move-option-${option.id}`}
              className={cn(
                'rounded-md border border-border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                selected
                  ? 'border-primary bg-primary/5 shadow-primary/20'
                  : 'hover:border-primary/60',
              )}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <p className='font-semibold text-foreground'>{option.name}</p>
                  <p className='text-sm text-muted-foreground break-words'>
                    {option.description}
                  </p>
                  {option.prerequisites && (
                    <p className='mt-2 text-xs text-muted-foreground'>
                      Prerequisites: {JSON.stringify(option.prerequisites)}
                    </p>
                  )}
                </div>
                {selected && (
                  <Badge variant='primary' className='shrink-0'>
                    Selected
                  </Badge>
                )}
              </div>
            </button>
          )
        })}
        {moveOptions.length === 0 && (
          <Card>
            <CardContent className='p-4 text-sm text-muted-foreground'>
              No eligible moves found. Check that you meet prerequisites.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const renderSpellStep = () => {
    if (character.class !== 'Wizard') {
      return (
        <div className='space-y-3'>
          <Alert>
            <Info className='size-4' />
            <AlertTitle>Divine Communion</AlertTitle>
            <AlertDescription>
              Clerics prepare spells during Commune. Review the notes
              above for your new spell capacity—no additional selection is
              required now.
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>
              Add {requiredSpellCount} spell
              {requiredSpellCount !== 1 ? 's' : ''} of level{' '}
              ≤ {pending.levelAfter} to your spellbook.
            </p>
          </div>
          <Badge variant='secondary'>
            {selectedSpells.length}/{requiredSpellCount} selected
          </Badge>
        </div>
        <ScrollArea className='h-[320px] rounded-md border border-border'>
          <div className='divide-y divide-border'>
            {groupedWizardSpells.map(([level, spells]) => (
              <div key={level} className='p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-semibold'>
                    Level {level} Spells
                  </p>
                  <Badge variant='outline'>{spells.length}</Badge>
                </div>
                <div className='grid gap-2'>
                  {spells.map((spell) => {
                    const checked = selectedSpells.includes(spell.id)
                    const disableCheckbox =
                      !checked && spellLimitReached
                    return (
                      <label
                        key={spell.id}
                        data-testid={`spell-option-${spell.id}`}
                        className={cn(
                          'flex items-start gap-3 rounded-md border border-border p-3 transition-colors',
                          checked
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/40',
                          disableCheckbox && 'opacity-50',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleSpellToggle(spell.id)}
                          disabled={disableCheckbox}
                          aria-label={spell.name}
                        />
                        <div className='min-w-0 flex-1'>
                          <p className='font-medium'>{spell.name}</p>
                          <p className='text-xs text-muted-foreground break-words'>
                            {spell.description}
                          </p>
                          {spell.tags?.length ? (
                            <div className='mt-2 flex flex-wrap gap-1'>
                              {spell.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant='outline'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
            {!groupedWizardSpells.length && (
              <div className='p-4 text-sm text-muted-foreground'>
                No new spell options are available at this level.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  const renderReview = () => (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Summary</CardTitle>
          <CardDescription>
            Confirm your selections before applying the level-up.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold'>Stat Increase</p>
              <p className='text-sm text-muted-foreground'>
                {selectedStat
                  ? statOptions.find((opt) => opt.id === selectedStat)
                      ?.name ?? 'Unknown stat choice'
                  : 'No stat increase selected'}
              </p>
            </div>
            <Badge variant='outline'>Optional</Badge>
          </div>
          <Separator />
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold'>Advanced Move</p>
              <p className='text-sm text-muted-foreground'>
                {selectedMoveId
                  ? moveOptions.find((opt) => opt.id === selectedMoveId)
                      ?.name ?? 'Unknown move'
                  : 'No move selected'}
              </p>
            </div>
            <Badge variant='primary'>Required</Badge>
          </div>
          {includeSpellStep && (
            <>
              <Separator />
              <div>
                <p className='text-sm font-semibold'>Spell Additions</p>
                {character.class === 'Wizard' ? (
                  <ul className='mt-1 space-y-1 text-sm text-muted-foreground'>
                    {selectedSpells.length ? (
                      selectedSpells.map((spellId) => {
                        const spell = wizardSpellChoices.find(
                          (item) => item.id === spellId,
                        )
                        return (
                          <li key={spellId}>
                            {spell?.name ?? spellId} (Level{' '}
                            {spell?.level ?? '?'})
                          </li>
                        )
                      })
                    ) : (
                      <li>No new spells selected</li>
                    )}
                  </ul>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    Cleric spell slots update automatically during
                    Commune.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className='flex items-center justify-between rounded-md border border-border p-4'>
        <div>
          <p className='text-sm font-semibold'>Chronicle Logging</p>
          <p className='text-xs text-muted-foreground'>
            Include a detailed chronicle entry. A concise timeline summary is
            always recorded automatically.
          </p>
        </div>
        <Switch
          checked={chronicleEnabled}
          onCheckedChange={handleChronicleToggle}
        />
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 'overview':
        return renderOverview()
      case 'stat':
        return renderStatStep()
      case 'move':
        return renderMoveStep()
      case 'spells':
        return renderSpellStep()
      case 'review':
        return renderReview()
      default:
        return null
    }
  }

  const headerMetadata = STEP_METADATA[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid='level-up-wizard'
        className='max-w-4xl max-h-[90vh] flex flex-col border-border/80 bg-background p-0 shadow-lg sm:rounded-xl overflow-hidden [&>button]:text-foreground [&>button:hover]:text-foreground'
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className='shrink-0 space-y-2 border-b border-border/60 bg-muted/30 px-6 py-4 text-left'>
          <DialogTitle className='flex items-center gap-2 text-lg text-foreground'>
            <Sparkles className='size-5 shrink-0 text-primary' />
            <span className='truncate'>Level Up Wizard · {character.name}</span>
          </DialogTitle>
          <DialogDescription className='flex flex-wrap items-center gap-2 text-sm'>
            <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary shrink-0'>
              Step {stepIndex + 1} of {steps.length}
            </span>
            <span className='inline-flex items-center gap-2 text-muted-foreground shrink-0'>
              {headerMetadata.icon}
              {headerMetadata.title}
            </span>
            <span className='text-xs text-muted-foreground min-w-0'>
              {headerMetadata.description}
            </span>
          </DialogDescription>
          <Progress
            value={progressPercent}
            variant='experience'
            className='h-2'
          />
        </DialogHeader>

        <div className='flex flex-col gap-5 px-6 py-5 overflow-y-auto min-h-0'>
          {error && (
            <Alert variant='destructive'>
              <AlertTitle>Cannot Apply Level-Up</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='flex items-center justify-between gap-2'>
            {steps.map((step, index) => {
              const metadata = STEP_METADATA[step]
              const status =
                index < stepIndex
                  ? 'complete'
                  : index === stepIndex
                    ? 'current'
                    : 'upcoming'
              const isLast = index === steps.length - 1
              
              return (
                <React.Fragment key={step}>
                  <div className='flex flex-col items-center gap-1.5'>
                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full border-2 transition-all',
                        status === 'current' && 'border-primary bg-primary text-primary-foreground shadow-sm',
                        status === 'complete' && 'border-chart-4 bg-chart-4 text-foreground',
                        status === 'upcoming' && 'border-border bg-background text-muted-foreground',
                      )}
                    >
                      {status === 'complete' ? (
                        <CheckCircle2 className='size-4' />
                      ) : (
                        metadata.icon
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium transition-colors hidden sm:block',
                        status === 'current' && 'text-foreground',
                        status === 'complete' && 'text-muted-foreground',
                        status === 'upcoming' && 'text-muted-foreground/60',
                      )}
                    >
                      {metadata.title}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 transition-colors',
                        status === 'complete' ? 'bg-chart-4' : 'bg-border',
                      )}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <ScrollArea className='flex-1 min-h-0'>
            <div className='pr-4'>{renderStep()}</div>
          </ScrollArea>
        </div>

        <DialogFooter className='shrink-0 border-t border-border/60 bg-muted/20 px-6 py-4'>
          <div className='flex w-full items-center justify-between gap-4'>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Info className='size-4 shrink-0' />
              <span className='hidden sm:inline'>Choices save automatically. Close to resume later.</span>
              <span className='sm:hidden'>Auto-saved</span>
            </div>
            <div className='flex items-center gap-2'>
              {stepIndex > 0 && (
                <Button
                  data-testid='wizard-back'
                  variant='outline'
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {!isLastStep && (
                <Button
                  data-testid='wizard-next'
                  variant='primary'
                  onClick={handleNext}
                  disabled={!canAdvance}
                >
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button
                  data-testid='wizard-confirm'
                  variant='primary'
                  onClick={handleConfirm}
                  disabled={!readyToConfirm || isSubmitting}
                >
                  {isSubmitting ? 'Applying…' : 'Confirm Level-Up'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>

        <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => !open && dismissCancelDialog()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close level-up wizard?</AlertDialogTitle>
              <AlertDialogDescription>
                Your selections are saved automatically. You can resume later, or discard this level-up entirely.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={dismissCancelDialog}>
                Resume editing
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmCancelLevelUp}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                Discard level-up
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
