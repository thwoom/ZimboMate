import type { PanelProps } from '../../framework/Panel'

import type { Spell as ServiceSpell, SpellClass } from '../../services/Spells'

import React, { useState } from 'react'
import SpellConsequenceModal from '../../components/SpellConsequenceModal'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { spellCastingService } from '../../services/SpellCastingService'
import { getSpellsForClass } from '../../services/Spells'
import { useGameStore } from '../../store/GameStore'
import './SpellPanel.css'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp, staggerContainer, itemFadeIn } from '../../utils/motion'

interface SpellPanelState {
  selectedCategory: 'all' | 'prepared' | 'available' | 'cantrips'
  searchTerm: string
  showSpellDetails: boolean
}

const SpellPanel: React.FC <PanelProps> = ({ id }) => {
  const _api = createPanelAPI(id)
  const { state: gameState, updateCharacter } = useGameStore()
  const [panelState, setPanelState] = useState <SpellPanelState>({
    selectedCategory: 'all',
    searchTerm: '',
    showSpellDetails: false,
  })

  const [spellModal, setSpellModal] = useState<{ open: boolean, spell?: ServiceSpell }>({ open: false })

  // Get active character
  const character = gameState.activeCharacterId
    ? gameState.characters[gameState.activeCharacterId]
    : null

  // Spellcasting context
  const isCaster = Boolean(character && (character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Immolator'))
  const knownSpells: ServiceSpell[] = character && isCaster ? getSpellsForClass(character.class as SpellClass) : []
  const preparedIds = (character?.preparedSpells || [])
  const preparedSpells = knownSpells.filter(s => preparedIds.includes(s.id))
  const cantrips = knownSpells.filter(s => s.level === 0)
  const leveledSpells = knownSpells.filter(s => s.level > 0)

  // Calculate spell budget and usage
  const budget = character ? spellCastingService.getPreparationBudget(character) : 0
  const current = character ? spellCastingService.calculatePreparedLevels(preparedSpells) : 0
  const hasStrain = character ? (character.conditions || []).includes('spellcasting-strain') : false

  const levelCost = (spell: ServiceSpell) => spell.level === 0 ? 0 : spell.level

  const updateState = (updates: Partial <SpellPanelState>) => {
    setPanelState(prev => ({ ...prev, ...updates }))
  }

  const onTogglePrepare = (spellId: string) => {
    if (!character)
      return
    const next = preparedIds.includes(spellId)
      ? preparedIds.filter(id => id !== spellId)
      : [...preparedIds, spellId]
    try {
      const updated = spellCastingService.prepareSpells(character, next);
      (updateCharacter as string)(character.id, { preparedSpells: updated.preparedSpells, conditions: updated.conditions })
    }
    catch (e) {
      alert((e as Error).message)
    }
  }

  const onPrepareSpells = () => {
    if (!character)
      return
    // This is the explicit "Prepare Spells" action that clears strain
    const updated = spellCastingService.prepareSpells(character, preparedIds);
    (updateCharacter as string)(character.id, { conditions: updated.conditions })
  }

  const onCommune = () => {
    if (!character)
      return
    // This is the explicit "Commune" action that clears strain
    const updated = spellCastingService.prepareSpells(character, preparedIds);
    (updateCharacter as string)(character.id, { conditions: updated.conditions })
  }

  const onCast = (spell: ServiceSpell) => {
    if (!character)
      return
    try {
      const { roll, updated, tier } = spellCastingService.castPreparedSpell(character, spell)
      if (tier === '7-9') {
        setSpellModal({ open: true, spell });
        (updateCharacter as string)(character.id, { xp: updated.xp })
      }
      else {
        (updateCharacter as string)(character.id, { xp: updated.xp })
      }
    }
    catch (e) {
      alert((e as Error).message)
    }
  }

  const onConsequenceConfirm = (consequence: 'unwelcome-attention' | 'forget' | 'strain') => {
    if (!character || !spellModal.spell)
      return
    const updated = spellCastingService.applySevenToNineConsequence(character, spellModal.spell, consequence);
    (updateCharacter as string)(character.id, {
      preparedSpells: updated.preparedSpells,
      conditions: updated.conditions,
    })
    setSpellModal({ open: false })
  }

  const getFilteredSpells = () => {
    let spells = knownSpells

    // Filter by category
    switch (panelState.selectedCategory) {
      case 'prepared':
        spells = preparedSpells
        break
      case 'available':
        spells = leveledSpells.filter(s => !preparedIds.includes(s.id))
        break
      case 'cantrips':
        spells = cantrips
        break
      default:
        spells = knownSpells
    }

    // Filter by search
    if (panelState.searchTerm) {
      const searchLower = panelState.searchTerm.toLowerCase()
      spells = spells.filter(spell =>
        spell.name.toLowerCase().includes(searchLower)
        || spell.description.toLowerCase().includes(searchLower),
      )
    }

    return spells
  }

  const prefersReduced = useReducedMotion()

  if (!character) {
    return (
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>✨ Spells</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="no-character">
              <p> No character selected. Create or select a character to manage spells.</p>
            </div>
          </CardContent>
        </Card>
      </HUDFrame>
    )
  }

  if (!isCaster) {
    return (
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>✨ Spells</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="no-spells">
              <p>
                {character.name}
                {' '}
                (
                {character.class}
                ) does not cast spells.
              </p>
            </div>
          </CardContent>
        </Card>
      </HUDFrame>
    )
  }

  const filteredSpells = getFilteredSpells()

  return (
    <HUDFrame className="p-4">
      <div className="flex items-center justify-between pb-4 border-b border-[--color-border]">
        <h2 className="text-xl font-semibold">✨ Spells</h2>
        <div className="text-sm flex gap-2 items-center">
          <span className="font-semibold">{character.name}</span>
          <span className="text-[--color-muted-foreground] italic">({character.class})</span>
        </div>
      </div>

      {/* Spell Budget */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="font-semibold mb-2">Prepared levels: {current} / {budget} (cantrips / rotes don't count)</div>
          <Progress value={current} max={Math.max(1, budget)} aria-label={`Prepared ${current} of ${budget}`} />
          <div className="text-xs text-[--color-muted-foreground] mt-2">Level {character.level} + 1 = {budget} total levels</div>
        </CardContent>
      </Card>

      {/* Spellcasting Status and Actions */}
      <Card className="mb-4">
        <CardContent className="p-4">
          {hasStrain && (
            <div className="flex items-center gap-2 p-2 rounded-[--radius] border border-[--color-warning] bg-[--color-warning-bg] text-[--color-warning-text] mb-3">
              <span className="text-base">⚠️</span>
              <span className="text-sm">You have spellcasting strain (-1 ongoing to Cast a Spell)</span>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            {character.class === 'Wizard' && (
              <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                <Button
                  onClick={onPrepareSpells}
                  title={hasStrain ? 'Prepare Spells-This will clear your spellcasting strain' : 'Prepare Spells-Refresh your spell preparation'}
                  variant={hasStrain ? 'secondary' : 'default'}
                >
                  {hasStrain ? '🔮 Prepare Spells (Clear Strain)' : '🔮 Prepare Spells'}
                </Button>
              </motion.div>
            )}
            {character.class === 'Cleric' && (
              <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                <Button
                  onClick={onCommune}
                  title={hasStrain ? 'Commune-This will clear your spellcasting strain' : 'Commune-Refresh your granted spells'}
                  variant={hasStrain ? 'secondary' : 'default'}
                >
                  {hasStrain ? '🙏 Commune (Clear Strain)' : '🙏 Commune'}
                </Button>
              </motion.div>
            )}
            {character.class === 'Immolator' && (
              <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                <Button
                  onClick={onPrepareSpells}
                  title={hasStrain ? 'Prepare Spells-This will clear your spellcasting strain' : 'Prepare Spells-Refresh your spell preparation'}
                  variant={hasStrain ? 'secondary' : 'default'}
                >
                  {hasStrain ? '🔥 Prepare Spells (Clear Strain)' : '🔥 Prepare Spells'}
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search spells..."
              value={panelState.searchTerm}
              onChange={e => updateState({ searchTerm: e.target.value })}
            />
            <Tabs value={panelState.selectedCategory} onValueChange={(v) => updateState({ selectedCategory: v as SpellPanelState['selectedCategory'] })}>
              <TabsList>
                {(['all', 'prepared', 'available', 'cantrips'] as const).map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Spell List */}
      <motion.div className="spell-list" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {filteredSpells.length === 0
          ? (
              <Card>
                <CardContent className="p-6">
                  <div className="no-spells-found">
                    <p> No spells found matching your criteria.</p>
                  </div>
                </CardContent>
              </Card>
            )
          : (
              filteredSpells.map((spell) => {
                const isPrepared = preparedIds.includes(spell.id)
                const wouldExceed = !isPrepared && (current + levelCost(spell) > budget)
                const prepareDisabled = !isPrepared && wouldExceed
                const prepareTitle = prepareDisabled
                  ? `Preparing this would exceed your budget (${current}+${levelCost(spell)} > ${budget})`
                  : undefined
                const castDisabled = spell.level !== 0 && !isPrepared
                const castTitle = castDisabled
                  ? 'You must prepare this spell before casting (DW rule)'
                  : undefined

                return (
                  <motion.div key={spell.id} variants={itemFadeIn}>
                    <Card className={isPrepared ? 'border-[--color-success] bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)]' : ''}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">{spell.name}</CardTitle>
                        <div className="text-xs text-[--color-muted-foreground] bg-[--color-muted] px-2 py-1 rounded-[--radius-sm]">
                          {spell.level === 0 ? 'Cantrip / Rote' : `Level ${spell.level}`}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="spell-description">{spell.description}</div>
                        <div className="flex gap-2 mb-2">
                          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                            <Button
                              variant={isPrepared ? 'secondary' : 'default'}
                              onClick={() => !prepareDisabled && onTogglePrepare(spell.id)}
                              disabled={prepareDisabled}
                              title={prepareTitle}
                            >
                              {isPrepared ? '✓ Prepared' : 'Prepare'}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                            <Button
                              onClick={() => onCast(spell)}
                              disabled={castDisabled}
                              title={castTitle}
                            >
                              Cast
                            </Button>
                          </motion.div>
                        </div>
                        {isPrepared && (
                          <div className="flex justify-end">
                            <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-[--radius-sm] bg-[--color-success] text-[--color-text-inverse]">Prepared</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
      </motion.div>

      {/* Spell Consequence Modal */}
      <SpellConsequenceModal
        isOpen={spellModal.open}
        spellName={spellModal.spell?.name || ''}
        casterClass={character.class as 'Wizard' | 'Cleric'}
        onConfirm={onConsequenceConfirm}
        onCancel={() => setSpellModal({ open: false })}
      />
    </HUDFrame>
  )
}

export default createPanel(
  {
    id: 'spells',
    name: 'Spells',
    icon: '✨',
    description: 'Manage spell preparation and casting',
    priority: 4,
  },
  SpellPanel,
)
