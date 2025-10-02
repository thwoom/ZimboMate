/**
 * Hold Manager Component
 * Displays and manages hold points from various Dungeon World moves
 */

import type { HoldEntry } from '../../stores/holdStore'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronRight, Eye, Minus, Shield } from 'lucide-react'
import React, { useState } from 'react'
import { HOLD_MOVES, useHoldStore } from '../../stores/holdStore'
import { Badge, Button, Card, CardContent, CardHeader } from '../ui'

interface HoldManagerProps {
  characterId: string
  className?: string
  compact?: boolean
}

const MOVE_ICONS: Record<string, React.ComponentType<any>> = {
  'defend': Shield,
  'discern-realities': Eye,
  'spout-lore': BookOpen,
}

export const HoldManager: React.FC<HoldManagerProps> = ({
  characterId,
  className = '',
  compact = false,
}) => {
  const { getHoldsForCharacter, spendHold } = useHoldStore()
  const holds = getHoldsForCharacter(characterId)
  const [expandedHolds, setExpandedHolds] = useState<Set<string>>(new Set())

  const toggleHoldExpansion = (holdId: string) => {
    setExpandedHolds((prev) => {
      const next = new Set(prev)
      if (next.has(holdId)) {
        next.delete(holdId)
      }
      else {
        next.add(holdId)
      }
      return next
    })
  }

  const handleSpendHold = (hold: HoldEntry, optionId: string, amount: number = 1) => {
    const success = spendHold(characterId, hold.id, optionId, amount)
    if (success) {
      console.log(`Spent ${amount} hold on ${optionId}`)
    }
  }

  if (holds.length === 0) {
    return (
      <Card className={`${className} opacity-75`}>
        <CardContent className="p-4 text-center">
          <div className="text-muted-foreground  text-sm">
            No active holds
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Use Defend, Discern Realities, or Spout Lore to gain hold
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    const totalHold = holds.reduce((sum, hold) => sum + hold.amount, 0)

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Shield size={16} className="text-primary" />
        <span className="text-sm font-medium">
          {totalHold}
          {' '}
          Hold
        </span>
        <div className="flex gap-1">
          {holds.map((hold) => {
            const Icon = MOVE_ICONS[hold.moveId] || Shield
            return (
              <Badge key={hold.id} variant="secondary" className="text-xs">
                <Icon size={10} className="mr-1" />
                {hold.amount}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h3 className="font-semibold">Hold Management</h3>
          </div>
          <Badge variant="outline">
            {holds.reduce((sum, hold) => sum + hold.amount, 0)}
            {' '}
            total
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {holds.map((hold) => {
              const Icon = MOVE_ICONS[hold.moveId] || Shield
              const isExpanded = expandedHolds.has(hold.id)
              const moveInfo = HOLD_MOVES[hold.moveId]

              return (
                <motion.div
                  key={hold.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="border rounded-lg p-3 bg-muted/50 "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-primary" />
                      <div>
                        <div className="font-medium text-sm">{hold.moveName}</div>
                        <div className="text-xs text-muted-foreground">
                          {hold.amount}
                          {' '}
                          /
                          {hold.maxAmount}
                          {' '}
                          hold
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: hold.maxAmount }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < hold.amount
                                ? 'bg-primary'
                                : 'bg-gray-300 '
                            }`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHoldExpansion(hold.id)}
                        className="p-1"
                        disabled={hold.amount === 0}
                      >
                        {isExpanded
                          ? (
                              <ChevronDown size={14} />
                            )
                          : (
                              <ChevronRight size={14} />
                            )}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && moveInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-border"
                      >
                        <div className="text-xs text-muted-foreground  mb-3">
                          {hold.description}
                        </div>

                        <div className="space-y-2">
                          {moveInfo.options.map(option => (
                            <div
                              key={option.id}
                              className="flex items-start justify-between p-2 bg-card rounded border"
                            >
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {option.label}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {option.description}
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSpendHold(hold, option.id, option.cost)}
                                disabled={hold.amount < option.cost}
                                className="ml-3 text-xs px-2 py-1"
                              >
                                <Minus size={12} className="mr-1" />
                                {option.cost}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {holds.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Click expand to spend hold • Hold is granted by successful moves
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact hold display for character sheets
export const HoldDisplay: React.FC<{
  characterId: string
  className?: string
}> = ({ characterId, className = '' }) => {
  return <HoldManager characterId={characterId} className={className} compact />
}
