/**
 * Quick Roll Zones Component
 * Provides dedicated drop zones for drag & drop dice rolling
 * Desktop-optimized with visual feedback and multiple zone types
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, Target, Zap, Plus } from 'lucide-react'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'

interface QuickRollZonesProps {
  characterId: string
  className?: string
  compact?: boolean
}

export const QuickRollZones: React.FC<QuickRollZonesProps> = ({
  characterId,
  className = '',
  compact = false
}) => {
  const { isDragging, activeDropZone, getDropZoneProps } = useDragAndDrop(characterId)

  if (!isDragging) {
    return null // Only show zones when dragging
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}
      >
        <div className="bg-card rounded-xl shadow-2xl border border-border p-4">
          <div className="text-center mb-3">
            <div className="text-sm font-medium text-foreground  flex items-center justify-center gap-2">
              <Target size={16} className="text-primary" />
              Drop to Roll
            </div>
            <div className="text-xs text-muted-foreground ">
              Drag stats, moves, or items here
            </div>
          </div>

          <div className={`flex gap-3 ${compact ? 'flex-col' : ''}`}>
            {/* Quick Roll Zone */}
            <motion.div
              {...getDropZoneProps('quick-roll')}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg min-w-[100px] min-h-[80px]
                ${activeDropZone === 'quick-roll'
                  ? 'bg-primary/10 border-primary/30 border-2 border-dashed scale-105'
                  : 'bg-muted/50  border-2 border-border border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-primary/10
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Dices size={24} className={`mb-2 ${
                activeDropZone === 'quick-roll' ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'quick-roll' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Quick Roll
              </div>
            </motion.div>

            {/* Advantage Zone */}
            <motion.div
              {...getDropZoneProps('advantage-roll')}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg min-w-[100px] min-h-[80px]
                ${activeDropZone === 'advantage-roll'
                  ? 'bg-chart-2/15 border-chart-2/30 border-2 border-dashed scale-105'
                  : 'bg-muted/50  border-2 border-border border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-chart-2/12
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Plus size={24} className={`mb-2 ${
                activeDropZone === 'advantage-roll' ? 'text-chart-2' : 'text-muted-foreground'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'advantage-roll' ? 'text-chart-2' : 'text-muted-foreground'
              }`}>
                +1 Bonus
              </div>
            </motion.div>

            {/* Power Roll Zone */}
            <motion.div
              {...getDropZoneProps('power-roll')}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg min-w-[100px] min-h-[80px]
                ${activeDropZone === 'power-roll'
                  ? 'bg-chart-4/15 border-yellow-400 border-2 border-dashed scale-105'
                  : 'bg-muted/50  border-2 border-border border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-chart-4/12
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Zap size={24} className={`mb-2 ${
                activeDropZone === 'power-roll' ? 'text-chart-4' : 'text-muted-foreground'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'power-roll' ? 'text-chart-4' : 'text-muted-foreground'
              }`}>
                Power Roll
              </div>
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-center">
            <div className="text-xs text-muted-foreground ">
              Drop here to roll with modifiers
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}





