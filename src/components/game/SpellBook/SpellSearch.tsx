/**
 * SpellSearch Component for ZimboMate V2
 * Advanced spell search and filtering functionality
 */

import * as Select from '@radix-ui/react-select'
import { motion } from 'framer-motion'
import { Filter, Search, X } from 'lucide-react'
import React from 'react'
import { Button, Input } from '../../ui'

interface SpellSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSchool: string | null
  onSchoolChange: (school: string | null) => void
  selectedLevel: number | null
  onLevelChange: (level: number | null) => void
  onClearFilters: () => void
  className?: string
}

const spellSchools = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
]

const spellLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function SpellSearch({
  searchQuery,
  onSearchChange,
  selectedSchool,
  onSchoolChange,
  selectedLevel,
  onLevelChange,
  onClearFilters,
  className = '',
}: SpellSearchProps) {
  const hasActiveFilters = selectedSchool || selectedLevel !== null || searchQuery

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search spells..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {/* School filter */}
        <div className="flex-1">
          <Select.Root
            value={selectedSchool || ''}
            onValueChange={value => onSchoolChange(value || null)}
          >
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 text-ui-regular bg-parchment-100 border border-parchment-300 rounded-lg hover:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400">
              <Select.Value placeholder="All Schools" />
              <Select.Icon>
                <Filter size={14} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-parchment-50 border border-parchment-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                <Select.Viewport className="p-1">
                  <Select.Item value="" className="px-3 py-2 text-ui-regular hover:bg-parchment-100 rounded cursor-pointer">
                    <Select.ItemText>All Schools</Select.ItemText>
                  </Select.Item>
                  {spellSchools.map(school => (
                    <Select.Item
                      key={school}
                      value={school}
                      className="px-3 py-2 text-ui-regular hover:bg-parchment-100 rounded cursor-pointer"
                    >
                      <Select.ItemText>
                        {school.charAt(0).toUpperCase() + school.slice(1)}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Level filter */}
        <div className="flex-1">
          <Select.Root
            value={selectedLevel?.toString() || ''}
            onValueChange={value => onLevelChange(value ? Number.parseInt(value) : null)}
          >
            <Select.Trigger className="w-full flex items-center justify-between px-3 py-2 text-ui-regular bg-parchment-100 border border-parchment-300 rounded-lg hover:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400">
              <Select.Value placeholder="All Levels" />
              <Select.Icon>
                <Filter size={14} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-parchment-50 border border-parchment-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                <Select.Viewport className="p-1">
                  <Select.Item value="" className="px-3 py-2 text-ui-regular hover:bg-parchment-100 rounded cursor-pointer">
                    <Select.ItemText>All Levels</Select.ItemText>
                  </Select.Item>
                  {spellLevels.map(level => (
                    <Select.Item
                      key={level}
                      value={level.toString()}
                      className="px-3 py-2 text-ui-regular hover:bg-parchment-100 rounded cursor-pointer"
                    >
                      <Select.ItemText>
                        {level === 0 ? 'Cantrip' : `Level ${level}`}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="px-3"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {searchQuery && (
            <div className="px-2 py-1 bg-gold-100 text-gold-800 rounded text-ui-small">
              Search: "
              {searchQuery}
              "
            </div>
          )}
          {selectedSchool && (
            <div className="px-2 py-1 bg-accent/15 text-magic-800 rounded text-ui-small">
              School:
              {' '}
              {selectedSchool.charAt(0).toUpperCase() + selectedSchool.slice(1)}
            </div>
          )}
          {selectedLevel !== null && (
            <div className="px-2 py-1 bg-nature-100 text-nature-800 rounded text-ui-small">
              Level:
              {' '}
              {selectedLevel === 0 ? 'Cantrip' : selectedLevel}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
