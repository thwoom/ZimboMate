/**
 * Unified Rollable Element Component
 * Provides consistent dice rolling interface for any rollable element
 * Supports stats, moves, custom rolls with desktop-optimized interactions
 */

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useDiceStore, type RollContext } from '../../stores/diceStore'
import { type Attributes } from '../../models/Character'
import { Button } from '../ui'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { useContextualRollPanel } from '../dice/ContextualRollPanel'

interface RollableElementProps {
  children: React.ReactNode

  // Roll configuration
  rollType: 'stat' | 'move' | 'custom'
  characterId: string

  // Stat roll props
  stat?: keyof Attributes
  statValue?: number
  customLabel?: string

  // Move roll props
  moveId?: string
  moveName?: string

  // Custom roll props
  modifier?: number
  context?: RollContext

  // Styling
  className?: string
  hoverClassName?: string
  activeClassName?: string

  // Behavior
  disabled?: boolean
  showHoverDice?: boolean
  showModifier?: boolean
  enableRightClick?: boolean
  enableDoubleClick?: boolean
  enableDragDrop?: boolean
  showContextualResult?: boolean // Show contextual roll panel on successful roll

  // Callbacks
  onRoll?: (result: any) => void
  onHover?: (isHovering: boolean) => void
}

const getStatModifier = (value: number): number => {
  return Math.floor((value - 10) / 2)
}

const getModifierDisplay = (modifier: number): string => {
  if (modifier === 0) return '±0'
  return modifier > 0 ? `+${modifier}` : `${modifier}`
}

const getModifierColor = (modifier: number): string => {
  if (modifier > 0) return 'text-chart-2'
  if (modifier < 0) return 'text-destructive'
  return 'text-chart-4'
}

export const RollableElement: React.FC<RollableElementProps> = ({
  children,
  rollType,
  characterId,
  stat,
  statValue,
  customLabel,
  moveId,
  moveName,
  modifier: customModifier,
  context: customContext,
  className = '',
  hoverClassName = 'hover:bg-slate-100 hover:shadow-md',
  activeClassName = 'ring-2 ring-gray-400 ring-opacity-60',
  disabled = false,
  showHoverDice = true,
  showModifier = true,
  enableRightClick = true,
  enableDoubleClick = true,
  enableDragDrop = true,
  showContextualResult = true,
  onRoll,
  onHover
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showRightClickMenu, setShowRightClickMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const elementRef = useRef<HTMLDivElement>(null)

  const { rollStat, rollMove, rollCustom, isRolling, rerollWithSameContext } = useDiceStore()
  const { getDraggableProps } = useDragAndDrop(characterId)
  const { showPanel, PanelComponent } = useContextualRollPanel()

  // Calculate modifier based on roll type
  const effectiveModifier = (() => {
    if (rollType === 'stat' && statValue) {
      return getStatModifier(statValue)
    }
    if (rollType === 'custom' && typeof customModifier === 'number') {
      return customModifier
    }
    // For moves, we'll get the modifier from the character stats during roll
    return 0
  })()

  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    setIsHovered(true)
    onHover?.(true)
  }, [disabled, onHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setShowRightClickMenu(false)
    onHover?.(false)
  }, [onHover])

  const executeRoll = useCallback(async () => {
    console.log('🚀 RollableElement executeRoll called:', { rollType, stat, characterId, disabled, isRolling })
    if (disabled || isRolling) {
      console.log('⛔ executeRoll blocked:', { disabled, isRolling })
      return
    }

    try {
      let result
      console.log('🎯 Executing roll...')

      if (rollType === 'stat' && stat) {
        console.log('📊 Calling rollStat with:', { stat, characterId, customLabel })
        result = await rollStat(stat, characterId, customLabel)
        console.log('📊 rollStat result:', result)
      } else if (rollType === 'move' && moveId && stat) {
        console.log('⚔️ Calling rollMove with:', { moveId, stat, characterId })
        result = await rollMove(moveId, stat, characterId)
        console.log('⚔️ rollMove result:', result)
      } else if (rollType === 'custom' && customContext) {
        console.log('🎲 Calling rollCustom with:', { customModifier, customContext, characterId })
        result = await rollCustom(customModifier || 0, customContext, characterId)
        console.log('🎲 rollCustom result:', result)
      } else {
        console.warn('⚠️ No valid roll condition matched:', { rollType, stat, moveId, customContext })
      }

      if (result) {
        console.log('✅ Roll successful, processing result:', result)
        // Show contextual roll panel if enabled and element ref is available
        if (showContextualResult && elementRef.current) {
          showPanel(result, elementRef.current, 'bottom')
        }

        if (onRoll) {
          onRoll(result)
        }
      } else {
        console.warn('⚠️ No result returned from roll')
      }
    } catch (error) {
      console.error('❌ Roll failed:', error)
    }
  }, [rollType, stat, characterId, customLabel, moveId, customModifier, customContext, disabled, isRolling, rollStat, rollMove, rollCustom, onRoll])

  const handleClick = useCallback((e: React.MouseEvent) => {
    console.log('🖱️ RollableElement handleClick called:', { rollType, target: e.target })

    // For moves, only handle clicks if they're not on buttons or interactive elements
    if (rollType === 'move') {
      const target = e.target as Element
      const isButton = target.closest('button')
      const isInteractive = target.closest('[role="button"], a, input, select, textarea')

      if (isButton || isInteractive) {
        console.log('⛔ Click blocked - interactive element detected')
        return // Don't interfere with existing click handlers
      }
    }

    console.log('✅ Click proceeding to executeRoll')
    e.preventDefault()
    executeRoll()
  }, [executeRoll, rollType])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!enableDoubleClick) return
    e.preventDefault()
    executeRoll()
  }, [enableDoubleClick, executeRoll])

  const handleRightClick = useCallback((e: React.MouseEvent) => {
    if (!enableRightClick || disabled) return

    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowRightClickMenu(true)
  }, [enableRightClick, disabled])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      executeRoll()
    }
  }, [disabled, executeRoll])

  // Close right-click menu when clicking outside
  const handleMenuClose = useCallback(() => {
    setShowRightClickMenu(false)
  }, [])

  React.useEffect(() => {
    if (showRightClickMenu) {
      document.addEventListener('click', handleMenuClose)
      document.addEventListener('contextmenu', handleMenuClose)
      return () => {
        document.removeEventListener('click', handleMenuClose)
        document.removeEventListener('contextmenu', handleMenuClose)
      }
    }
  }, [showRightClickMenu, handleMenuClose])

  // Get drag and drop props if enabled
  const dragProps = enableDragDrop ? getDraggableProps({
    type: rollType,
    stat,
    statValue,
    moveId,
    moveName,
    modifier: customModifier,
    label: customLabel || (rollType === 'stat' ? stat : rollType === 'move' ? moveName : 'Custom Roll')
  }) : {}

  return (
    <>
      <motion.div
        ref={elementRef}
        className={`
          relative cursor-pointer transition-all duration-200 select-none
          ${className}
          ${isHovered ? hoverClassName : ''}
          ${isRolling ? activeClassName : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${dragProps.className || ''}
        `}
        {...dragProps}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
        style={{ pointerEvents: 'auto' }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Roll ${rollType === 'stat' ? `${stat} stat` : rollType === 'move' ? `${moveName || moveId} move` : 'custom dice'}`}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        {children}

        {/* Hover Dice Indicator */}
        <AnimatePresence>
          {showHoverDice && isHovered && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-2 -right-2 z-10"
            >
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg border border-border">
                <Dices size={12} />
                2d6
                {showModifier && (
                  <span className={`font-semibold ${getModifierColor(effectiveModifier)}`}>
                    {getModifierDisplay(effectiveModifier)}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rolling Animation Overlay - Subtle and Non-Jarring */}
        <AnimatePresence>
          {isRolling && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] rounded flex items-center justify-center z-20"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.1, 1],
                  opacity: [0, 1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.3, 1]
                }}
                className="relative"
              >
                <Dices className="text-muted-foreground drop-shadow-sm" size={18} />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-card/20 rounded-full blur-sm -z-10" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Click Context Menu */}
      <AnimatePresence>
        {showRightClickMenu && (
          <>
            {/* Invisible backdrop to catch clicks */}
            <div
              className="fixed inset-0 z-40"
              onClick={handleMenuClose}
              onContextMenu={handleMenuClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 bg-card rounded-lg shadow-xl border border-border py-2 min-w-[200px]"
              style={{
                left: Math.min(menuPosition.x, window.innerWidth - 220),
                top: Math.min(menuPosition.y, window.innerHeight - 300),
              }}
            >
              <div className="px-3 py-2 border-b border-border">
                <div className="text-sm font-medium text-foreground ">
                  {rollType === 'stat' ? `${stat?.toUpperCase()} Roll` :
                   rollType === 'move' ? moveName || moveId :
                   'Custom Roll'}
                </div>
                <div className="text-xs text-muted-foreground ">
                  2d6{getModifierDisplay(effectiveModifier)}
                  {rollType === 'stat' && ` • ${stat} check`}
                  {rollType === 'move' && ` • ${stat} based`}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3 py-2 text-sm hover:bg-muted hover:bg-muted"
                onClick={() => {
                  executeRoll()
                  handleMenuClose()
                }}
              >
                <Dices size={14} className="mr-2" />
                Roll 2d6{getModifierDisplay(effectiveModifier)}
              </Button>

              {rollType === 'stat' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 py-2 text-sm hover:bg-muted hover:bg-muted"
                    onClick={() => {
                      navigator.clipboard.writeText(`${stat} roll: 2d6${getModifierDisplay(effectiveModifier)}`)
                      handleMenuClose()
                    }}
                  >
                    📋 Copy Roll Format
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 py-2 text-sm hover:bg-muted hover:bg-muted"
                    onClick={() => {
                      navigator.clipboard.writeText(`Rolling ${stat}: [[2d6${getModifierDisplay(effectiveModifier)}]]`)
                      handleMenuClose()
                    }}
                  >
                    🎲 Copy Dice Notation
                  </Button>
                </>
              )}

              {rollType === 'move' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 py-2 text-sm hover:bg-muted hover:bg-muted"
                    onClick={() => {
                      navigator.clipboard.writeText(`${moveName}: 2d6${getModifierDisplay(effectiveModifier)} (${stat})`)
                      handleMenuClose()
                    }}
                  >
                    📋 Copy Move Roll
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-3 py-2 text-sm hover:bg-muted hover:bg-muted"
                    onClick={() => {
                      // TODO: Show move description in a modal
                      console.log('Show move description for:', moveName)
                      handleMenuClose()
                    }}
                  >
                    📖 View Move Details
                  </Button>
                </>
              )}

              <div className="border-t border-border mt-1 pt-1">
                <div className="px-3 py-1 text-xs text-muted-foreground ">
                  {rollType === 'stat' ? 'Left-click: Roll • Double-click: Roll' :
                   rollType === 'move' ? 'Left-click: Select • Right-click: Menu' :
                   'Left-click: Roll'}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contextual Roll Panel */}
      {PanelComponent}
    </>
  )
}

// Convenience components for common use cases
export const RollableStat: React.FC<{
  children: React.ReactNode
  stat: keyof Attributes
  statValue: number
  characterId: string
  className?: string
  customLabel?: string
  onRoll?: (result: any) => void
}> = ({ children, stat, statValue, characterId, className, customLabel, onRoll }) => (
  <RollableElement
    rollType="stat"
    stat={stat}
    statValue={statValue}
    characterId={characterId}
    customLabel={customLabel}
    className={className}
    onRoll={onRoll}
  >
    {children}
  </RollableElement>
)

export const RollableMove: React.FC<{
  children: React.ReactNode
  moveId: string
  moveName: string
  stat: keyof Attributes
  characterId: string
  className?: string
  onRoll?: (result: any) => void
}> = ({ children, moveId, moveName, stat, characterId, className, onRoll }) => (
  <RollableElement
    rollType="move"
    moveId={moveId}
    moveName={moveName}
    stat={stat}
    characterId={characterId}
    className={className}
    onRoll={onRoll}
  >
    {children}
  </RollableElement>
)

export const RollableCustom: React.FC<{
  children: React.ReactNode
  modifier: number
  context: RollContext
  characterId: string
  className?: string
  onRoll?: (result: any) => void
}> = ({ children, modifier, context, characterId, className, onRoll }) => (
  <RollableElement
    rollType="custom"
    modifier={modifier}
    context={context}
    characterId={characterId}
    className={className}
    onRoll={onRoll}
  >
    {children}
  </RollableElement>
)



