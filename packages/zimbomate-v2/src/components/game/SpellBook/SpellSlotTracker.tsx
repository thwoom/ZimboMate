/**
 * SpellSlotTracker Component for ZimboMate V2
 * Visual spell slot management with gem-like indicators
 */

import React from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { Button, Progress } from '../../ui'
import { SpellSlotGem } from './SpellSlotGem'

interface SpellSlot {
  level: number
  total: number
  used: number
  available: number
}

interface SpellSlotTrackerProps {
  slots: Record<number, { total: number; used: number }>
  onRefresh: () => void
  onSlotClick?: (level: number) => void
  className?: string
}

export function SpellSlotTracker({ 
  slots, 
  onRefresh, 
  onSlotClick,
  className = '' 
}: SpellSlotTrackerProps) {
  const spellSlots: SpellSlot[] = Object.entries(slots).map(([level, slot]) => ({
    level: parseInt(level),
    total: slot.total,
    used: slot.used,
    available: slot.total - slot.used
  }))

  const totalSlots = spellSlots.reduce((sum, slot) => sum + slot.total, 0)
  const usedSlots = spellSlots.reduce((sum, slot) => sum + slot.used, 0)
  const availableSlots = totalSlots - usedSlots

  return (
    <motion.div
      className={`spell-book-page p-4 rounded-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-display-sm text-gold-600">Spell Slots</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between text-ui-small mb-2">
          <span>Available: {availableSlots}</span>
          <span>Used: {usedSlots}/{totalSlots}</span>
        </div>
        <Progress 
          value={(availableSlots / totalSlots) * 100} 
          className="h-2"
        />
      </div>

      {/* Spell slots by level */}
      <div className="space-y-4">
        {spellSlots.map(slot => (
          <motion.div
            key={slot.level}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: slot.level * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-ui-regular font-display min-w-[60px]">
                Level {slot.level}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: slot.total }, (_, i) => (
                  <SpellSlotGem
                    key={i}
                    level={slot.level}
                    status={i < slot.used ? 'used' : 'available'}
                    onClick={() => onSlotClick?.(slot.level)}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-ui-small text-parchment-600">
              {slot.available}/{slot.total}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t border-gold-300/30">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Short Rest
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Long Rest
          </Button>
        </div>
      </div>
    </motion.div>
  )
}