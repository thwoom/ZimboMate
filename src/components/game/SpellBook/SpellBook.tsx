/**
 * SpellBook Component for ZimboMate V2
 * Main animated spell book interface with magical effects
 */

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'
import { useSpells } from '../../../hooks/useSpells'
import { MagicalEffects } from './MagicalEffects'
import { PageNavigation } from './PageNavigation'
import { SpellBookPage } from './SpellBookPage'
import { SpellDetails } from './SpellDetails'
import { SpellList } from './SpellList'
import { SpellSearch } from './SpellSearch'
import { SpellSlotTracker } from './SpellSlotTracker'

interface SpellBookProps {
  characterId?: string
  isOpen: boolean
  onClose: () => void
  theme?: 'fantasy' | 'dark' | 'light'
  enableAnimations?: boolean
  enableAudio?: boolean
  onSpellCast?: (spell: any, level: number) => void
  onSpellPrepared?: (spell: any) => void
  onSpellUnprepared?: (spell: any) => void
}

const PAGES = ['spells', 'details', 'slots', 'prepared'] as const

type PageIndex = 0 | 1 | 2 | 3

interface SpellBookState {
  currentPage: PageIndex
  selectedSpellId: string | null
  searchQuery: string
  selectedSchool: string | null
  selectedLevel: number | null
  isAnimating: boolean
}

type SpellBookAction =
  | { type: 'setPage'; page: PageIndex }
  | { type: 'setAnimating'; isAnimating: boolean }
  | { type: 'selectSpell'; spellId: string | null }
  | { type: 'setSearch'; query: string }
  | { type: 'setSchool'; school: string | null }
  | { type: 'setLevel'; level: number | null }
  | { type: 'resetFilters' }

const spellBookReducer = (state: SpellBookState, action: SpellBookAction): SpellBookState => {
  switch (action.type) {
    case 'setPage':
      return { ...state, currentPage: action.page }
    case 'setAnimating':
      return { ...state, isAnimating: action.isAnimating }
    case 'selectSpell':
      return { ...state, selectedSpellId: action.spellId }
    case 'setSearch':
      return { ...state, searchQuery: action.query }
    case 'setSchool':
      return { ...state, selectedSchool: action.school }
    case 'setLevel':
      return { ...state, selectedLevel: action.level }
    case 'resetFilters':
      return {
        ...state,
        searchQuery: '',
        selectedSchool: null,
        selectedLevel: null,
      }
    default:
      return state
  }
}

export function SpellBook({
  characterId,
  isOpen,
  onClose,
  theme: _theme = 'fantasy',
  enableAnimations = true,
  enableAudio: _enableAudio = true,
  onSpellCast,
  onSpellPrepared,
  onSpellUnprepared: _onSpellUnprepared,
}: SpellBookProps) {
  // Spell management
  const {
    allSpells,
    preparedSpells,
    spellSlots,
    castSpell,
    prepareSpell,
    unprepareSpell: _unprepareSpell,
    longRest,
    shortRest: _shortRest,
    isCasting,
    character: _character,
  } = useSpells(characterId)

  const [state, dispatch] = useReducer(spellBookReducer, {
    currentPage: 0,
    selectedSpellId: null,
    searchQuery: '',
    selectedSchool: null,
    selectedLevel: null,
    isAnimating: false,
  })
  const {
    currentPage,
    selectedSpellId,
    searchQuery,
    selectedSchool,
    selectedLevel,
    isAnimating,
  } = state
  const animationTimeoutRef = useRef<number | null>(null)
  const totalPages = PAGES.length

  // Page navigation with animation
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage === currentPage || isAnimating) {
        return
      }

      dispatch({ type: 'setAnimating', isAnimating: true })

      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current)
      }

      animationTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: 'setPage', page: newPage as PageIndex })
        dispatch({ type: 'setAnimating', isAnimating: false })
      }, 400)
    },
    [currentPage, isAnimating],
  )

  // Spell actions
  const handleSpellSelect = useCallback(
    (spell: any) => {
      dispatch({ type: 'selectSpell', spellId: spell?.id ?? null })
      if (currentPage !== 1) {
        handlePageChange(1) // Go to details page
      }
    },
    [currentPage, handlePageChange],
  )

  const handleSpellPrepare = useCallback(async (spellId: string) => {
    const spell = allSpells.find(s => s.id === spellId)
    if (!spell)
      return

    try {
      prepareSpell(spellId)
      onSpellPrepared?.(spell)
    }
    catch (error) {
      console.error('Failed to prepare spell:', error)
    }
  }, [allSpells, prepareSpell, onSpellPrepared])

  const handleSpellCast = useCallback(async (spellId: string, level: number) => {
    const spell = allSpells.find(s => s.id === spellId)
    if (!spell)
      return

    try {
      await castSpell(spellId, { upcast: level > spell.level })
      onSpellCast?.(spell, level)
    }
    catch (error) {
      console.error('Failed to cast spell:', error)
    }
  }, [allSpells, castSpell, onSpellCast])

  // Search and filter functions
  const handleClearFilters = useCallback(() => {
    dispatch({ type: 'resetFilters' })
  }, [])

  const selectedSpell = useMemo(() => {
    if (!selectedSpellId) {
      return null
    }

    return allSpells.find((spell) => spell.id === selectedSpellId) ?? null
  }, [allSpells, selectedSpellId])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (allSpells.length === 0) {
      dispatch({ type: 'selectSpell', spellId: null })
      return
    }

    if (!selectedSpellId) {
      dispatch({ type: 'selectSpell', spellId: allSpells[0].id })
      return
    }

    if (!allSpells.some((spell) => spell.id === selectedSpellId)) {
      dispatch({
        type: 'selectSpell',
        spellId: allSpells[0]?.id ?? null,
      })
    }
  }, [allSpells, selectedSpellId])

  const handleSlotRefresh = useCallback(() => {
    longRest()
  }, [longRest])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    ArrowLeft: () => currentPage > 0 && handlePageChange(currentPage - 1),
    ArrowRight: () => currentPage < totalPages - 1 && handlePageChange(currentPage + 1),
    Escape: onClose,
    1: () => handlePageChange(0),
    2: () => handlePageChange(1),
    3: () => handlePageChange(2),
    4: () => handlePageChange(3),
  })


  const currentSpellSchool = selectedSpell?.school || 'evocation'

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-4 md:inset-8 lg:inset-16 z-50 focus:outline-none">
          <motion.div
            className="spell-book-container w-full h-full relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Magical effects overlay */}
            <MagicalEffects
              isActive={enableAnimations}
              intensity="medium"
              spellSchool={currentSpellSchool}
            />

            {/* Page navigation */}
            <PageNavigation
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onClose={onClose}
            />

            {/* Book pages */}
            <div className="flex h-full pt-16">
              {/* Left page */}
              <div className="flex-1 p-6 relative">
                <SpellBookPage
                  isVisible={currentPage === 0 || currentPage === 2}
                  isAnimating={isAnimating}
                  animationDirection="left"
                >
                  {currentPage === 0 && (
                    <div className="h-full flex flex-col">
                      <SpellSearch
                        searchQuery={searchQuery}
                        onSearchChange={(value) => dispatch({ type: 'setSearch', query: value })}
                        selectedSchool={selectedSchool}
                        onSchoolChange={(value) => dispatch({ type: 'setSchool', school: value })}
                        selectedLevel={selectedLevel}
                        onLevelChange={(value) => dispatch({ type: 'setLevel', level: value })}
                        onClearFilters={handleClearFilters}
                        className="mb-4"
                      />
                      <SpellList
                        spells={allSpells}
                        selectedSpell={selectedSpell}
                        onSpellSelect={handleSpellSelect}
                        onSpellPrepare={handleSpellPrepare}
                        onSpellCast={handleSpellCast}
                        searchQuery={searchQuery}
                        selectedSchool={selectedSchool}
                        selectedLevel={selectedLevel}
                        className="flex-1"
                      />
                    </div>
                  )}

                  {currentPage === 2 && (
                    <SpellSlotTracker
                      slots={spellSlots.reduce((acc, slot) => {
                        acc[slot.level] = { total: slot.total, used: slot.used }
                        return acc
                      }, {} as Record<number, { total: number, used: number }>)}
                      onRefresh={handleSlotRefresh}
                      className="h-full"
                    />
                  )}
                </SpellBookPage>
              </div>

              {/* Book spine */}
              <div className="w-4 bg-gradient-to-b from-gold-600 to-gold-800 relative">
                <div className="absolute inset-y-0 left-0 w-1 bg-gold-400" />
                <div className="absolute inset-y-0 right-0 w-1 bg-gold-900" />
              </div>

              {/* Right page */}
              <div className="flex-1 p-6 relative">
                <SpellBookPage
                  isVisible={currentPage === 1 || currentPage === 3}
                  isAnimating={isAnimating}
                  animationDirection="right"
                >
                  {currentPage === 1 && (
                    <SpellDetails
                      spell={selectedSpell}
                      onCast={handleSpellCast}
                      onPrepare={handleSpellPrepare}
                      className="h-full"
                    />
                  )}

                  {currentPage === 3 && (
                    <SpellList
                      spells={preparedSpells}
                      selectedSpell={selectedSpell}
                      onSpellSelect={handleSpellSelect}
                      onSpellPrepare={handleSpellPrepare}
                      onSpellCast={handleSpellCast}
                      searchQuery=""
                      selectedSchool={null}
                      selectedLevel={null}
                      className="h-full"
                    />
                  )}
                </SpellBookPage>
              </div>
            </div>

            {/* Loading overlay */}
            <AnimatePresence>
              {isCasting && (
                <motion.div
                  className="absolute inset-0 bg-magic-500/20 backdrop-blur-sm flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-display-md font-display text-accent"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    Casting Spell...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

