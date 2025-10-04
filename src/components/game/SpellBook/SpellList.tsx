/**
 * SpellList Component for ZimboMate V2
 * Scrollable list of spells with filtering and selection
 */

import * as ScrollArea from '@radix-ui/react-scroll-area'
import { motion } from 'framer-motion'
import React, { useMemo } from 'react'
import { SpellItem } from './SpellItem'

interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string[]
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  damage?: string
  savingThrow?: string
  materialComponents?: string
  atHigherLevels?: string
  preparationStatus: 'not_prepared' | 'prepared' | 'used'
}

interface SpellListProps {
  spells: Spell[]
  selectedSpell: Spell | null
  onSpellSelect: (spell: Spell) => void
  onSpellPrepare: (spellId: string) => void
  onSpellCast: (spellId: string, level: number) => void
  searchQuery: string
  selectedSchool: string | null
  selectedLevel: number | null
  className?: string
}

export function SpellList({
  spells,
  selectedSpell,
  onSpellSelect,
  onSpellPrepare,
  onSpellCast,
  searchQuery,
  selectedSchool,
  selectedLevel,
  className = '',
}: SpellListProps) {
  // Filter spells based on search criteria
  const filteredSpells = useMemo(() => {
    return spells.filter((spell) => {
      // Search query filter
      if (
        searchQuery &&
        !spell.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !spell.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // School filter
      if (selectedSchool && spell.school !== selectedSchool) {
        return false
      }

      // Level filter
      if (selectedLevel !== null && spell.level !== selectedLevel) {
        return false
      }

      return true
    })
  }, [spells, searchQuery, selectedSchool, selectedLevel])

  // Group spells by level for better organization
  const groupedSpells = useMemo(() => {
    const groups: Record<number, Spell[]> = {}

    filteredSpells.forEach((spell) => {
      if (!groups[spell.level]) {
        groups[spell.level] = []
      }
      groups[spell.level].push(spell)
    })

    // Sort spells within each level by name
    Object.keys(groups).forEach((level) => {
      groups[Number.parseInt(level)].sort((a, b) =>
        a.name.localeCompare(b.name),
      )
    })

    return groups
  }, [filteredSpells])

  const spellLevels = Object.keys(groupedSpells)
    .map((level) => Number.parseInt(level))
    .sort((a, b) => a - b)

  if (filteredSpells.length === 0) {
    return (
      <motion.div
        className={`spell-book-page p-8 rounded-lg flex items-center justify-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className='text-center text-muted-foreground'>
          <p className='text-body-lg mb-2'>No spells found</p>
          <p className='text-ui-small'>Try adjusting your search or filters</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`spell-book-page rounded-lg ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ScrollArea.Root className='h-full'>
        <ScrollArea.Viewport className='h-full p-4'>
          <div className='space-y-6'>
            {spellLevels.map((level) => (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: level * 0.1 }}
              >
                {/* Level header */}
                <div className='flex items-center gap-3 mb-3'>
                  <h3 className='text-display-sm font-display text-gold-600'>
                    {level === 0 ? 'Cantrips' : `Level ${level}`}
                  </h3>
                  <div className='flex-1 h-px bg-gold-300/30' />
                  <span className='text-ui-small text-muted-foreground'>
                    {groupedSpells[level].length} spell
                    {groupedSpells[level].length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Spells for this level */}
                <div className='space-y-3'>
                  {groupedSpells[level].map((spell, index) => (
                    <motion.div
                      key={spell.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: level * 0.1 + index * 0.05 }}
                    >
                      <SpellItem
                        spell={spell}
                        isSelected={selectedSpell?.id === spell.id}
                        onSelect={onSpellSelect}
                        onPrepare={onSpellPrepare}
                        onCast={onSpellCast}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className='flex select-none touch-none p-0.5 bg-parchment-100 transition-colors duration-150 ease-out hover:bg-parchment-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5'
          orientation='vertical'
        >
          <ScrollArea.Thumb className="flex-1 bg-gold-400 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:translate-x-[-50%] before:translate-y-[-50%] before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className='bg-parchment-100' />
      </ScrollArea.Root>
    </motion.div>
  )
}
