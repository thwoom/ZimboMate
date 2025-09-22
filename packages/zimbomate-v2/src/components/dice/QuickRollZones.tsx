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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-4">
          <div className="text-center mb-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2">
              <Target size={16} className="text-blue-600" />
              Drop to Roll
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
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
                  ? 'bg-blue-100 border-blue-400 border-2 border-dashed scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Dices size={24} className={`mb-2 ${
                activeDropZone === 'quick-roll' ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'quick-roll' ? 'text-blue-700' : 'text-gray-600'
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
                  ? 'bg-green-100 border-green-400 border-2 border-dashed scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-green-50 dark:hover:bg-gray-600
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Plus size={24} className={`mb-2 ${
                activeDropZone === 'advantage-roll' ? 'text-green-600' : 'text-gray-500'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'advantage-roll' ? 'text-green-700' : 'text-gray-600'
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
                  ? 'bg-yellow-100 border-yellow-400 border-2 border-dashed scale-105'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 border-dashed'
                }
                transition-all duration-200 cursor-pointer hover:bg-yellow-50 dark:hover:bg-gray-600
              `}
              whileHover={{ scale: 1.05 }}
            >
              <Zap size={24} className={`mb-2 ${
                activeDropZone === 'power-roll' ? 'text-yellow-600' : 'text-gray-500'
              }`} />
              <div className={`text-xs font-medium ${
                activeDropZone === 'power-roll' ? 'text-yellow-700' : 'text-gray-600'
              }`}>
                Power Roll
              </div>
            </motion.div>
          </div>

          {/* Instructions */}
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Drop here to roll with modifiers
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}