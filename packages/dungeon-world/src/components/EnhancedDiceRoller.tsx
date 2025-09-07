/**
 * Enhanced Dice Roller Component * Supports all dice types, modifiers, and advanced rolling features
 */

import type {
  EnhancedDiceRoll,
  RollType,
} from '../services/DiceRollingService'

import React, { useState } from 'react'
import {
  diceRollingService,
} from '../services/DiceRollingService'

import DiceAnimation from './DiceAnimation'
import './EnhancedDiceRoller.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../utils/motion'

interface EnhancedDiceRollerProps {
  onRoll?: (roll: EnhancedDiceRoll) => void
  defaultExpression?: string
  showHistory?: boolean
  compact?: boolean
  showAnimation?: boolean
  animationTheme?: 'classic' | 'neon' | 'wood' | 'metal' | 'bone'
  soundEnabled?: boolean
}

const EnhancedDiceRoller: React.FC <EnhancedDiceRollerProps> = ({
  onRoll,
  defaultExpression = '2d6',
  showHistory = true,
  compact = false,
  showAnimation = true,
  animationTheme = 'classic',
  soundEnabled = true,
}) => {
  const [expression, setExpression] = useState(defaultExpression)
  const [modifier, setModifier] = useState(0)
  const [targetNumber, setTargetNumber] = useState <number | undefined>()
  const [rollType, setRollType] = useState <RollType>('custom')
  const [advantage, setAdvantage] = useState(false)
  const [disadvantage, setDisadvantage] = useState(false)
  const [lastRoll, setLastRoll] = useState <EnhancedDiceRoll | null>(null)
  const [rollHistory, setRollHistory] = useState <EnhancedDiceRoll[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Quick dice buttons
  const quickDice: { label: string, expression: string, type: RollType }[] = [
    { label: '2d6', expression: '2d6', type: 'move' },
    { label: '1d4', expression: '1d4', type: 'damage' },
    { label: '1d6', expression: '1d6', type: 'damage' },
    { label: '1d8', expression: '1d8', type: 'damage' },
    { label: '1d10', expression: '1d10', type: 'damage' },
    { label: '1d12', expression: '1d12', type: 'damage' },
    { label: '1d20', expression: '1d20', type: 'target' },
  ]

  const handleRoll = () => {
    try {
      let roll: EnhancedDiceRoll

      if (rollType === 'target' && targetNumber !== undefined) {
        // Parse expression for target rolls
        const diceExpr = diceRollingService.parseDiceExpression(expression)
        roll = diceRollingService.rollTarget(targetNumber, diceExpr.type, diceExpr.count, modifier, {
          advantage,
          disadvantage,
          type: rollType,
        })
      }
      else {
        // Regular roll
        roll = diceRollingService.rollFromString(expression, {
          modifier,
          advantage,
          disadvantage,
          type: rollType,
          targetNumber,
        })
      }

      setLastRoll(roll)
      setRollHistory(prev => [roll, ...prev.slice(0, 9)]) // Keep last 10 rolls
      onRoll?.(roll)
    }
    catch {
      alert(`Invalid dice expression: ${expression}`)
    }
  }

  const handleReroll = () => {
    if (lastRoll) {
      const reroll = diceRollingService.rerollDice(lastRoll, { spendXP: true })
      setLastRoll(reroll)
      setRollHistory(prev => [reroll, ...prev.slice(0, 9)])
      onRoll?.(reroll)
    }
  }

  const handleQuickDice = (quickDice: { expression: string, type: RollType }) => {
    setExpression(quickDice.expression)
    setRollType(quickDice.type)
    if (quickDice.type === 'target') {
      setTargetNumber(targetNumber || 15)
    }
    else {
      setTargetNumber(undefined)
    }
  }

  const _getRollResultColor = (roll: EnhancedDiceRoll): string => {
    if (roll.rollResult) {
      switch (roll.rollResult) {
        case 'success': return 'var(--color-roll-success)'
        case 'partial': return 'var(--color-roll-partial)'
        case 'failure': return 'var(--color-roll-failure)'
      }
    }
    if (roll.success !== undefined) {
      return roll.success ? 'var(--color-roll-success)' : 'var(--color-roll-failure)'
    }
    return 'var(--color-text-primary)'
  }

  const prefersReduced = useReducedMotion()

  if (compact) {
    return (
      <div className="enhanced-dice-roller compact">
        {/* Dice Animation for Compact Mode */}
        {showAnimation && lastRoll && (
          <div className="dice-animation-section compact">
            <DiceAnimation
              roll={lastRoll}
              theme={animationTheme}
              size="small"
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        <motion.div className="quick-dice-grid" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
          {quickDice.map((dice, index) => (
            <motion.button
              key={index}
              className="quick-dice-btn"
              onClick={() => {
                handleQuickDice(dice)
                setTimeout(handleRoll, 100)
              }}
              variants={itemFadeIn}
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            >
              {dice.label}
            </motion.button>
          ))}
        </motion.div>
        {lastRoll && (
          <motion.div className="last-roll-compact" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <span className={`roll-result-text ${lastRoll.rollResult || (lastRoll.success !== undefined ? (lastRoll.success ? 'success' : 'failure') : 'neutral')}`}>
              {diceRollingService.formatEnhancedRoll(lastRoll)}
            </span>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="enhanced-dice-roller">
      <div className="dice-roller-header">
        <h3>🎲 Enhanced Dice Roller</h3>
        <motion.button
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
          whileHover={prefersReduced ? undefined : { scale: 1.02 }}
          whileTap={prefersReduced ? undefined : { scale: 0.98 }}
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </motion.button>
      </div>

      {/* Quick Dice Buttons */}
      <div className="quick-dice-section">
        <h4> Quick Dice</h4>
        <motion.div className="quick-dice-grid" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
          {quickDice.map((dice, index) => (
            <motion.button
              key={index}
              className={`quick-dice-btn ${expression === dice.expression ? 'active' : ''}`}
              onClick={() => handleQuickDice(dice)}
              variants={itemFadeIn}
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            >
              {dice.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Main Roll Controls */}
      <div className="roll-controls">
        <div className="expression-input">
          <label> Dice Expression:</label>
          <input
            type="text"
            value={expression}
            onChange={e => setExpression(e.target.value)}
            placeholder="e.g., 2d6, 1d8 + 2, 3d4"
          />
        </div>

        <div className="modifier-input">
          <label> Modifier:</label>
          <input
            type="number"
            value={modifier}
            onChange={e => setModifier(Number.parseInt(e.target.value) || 0)}
            aria-label="Dice roll modifier"
          />
        </div>

        {rollType === 'target' && (
          <div className="target-input">
            <label> Target Number:</label>
            <input
              type="number"
              value={targetNumber || ''}
              onChange={e => setTargetNumber(Number.parseInt(e.target.value) || undefined)}
              placeholder="15"
            />
          </div>
        )}
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="advanced-options">
          <div className="roll-type-select">
            <label> Roll Type:</label>
            <Select value={rollType} onValueChange={(v) => setRollType(v as RollType)}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="move">Move (2d6)</SelectItem>
                <SelectItem value="damage">Damage</SelectItem>
                <SelectItem value="stat">Stat Roll</SelectItem>
                <SelectItem value="target">Target Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="advantage-controls">
            <label>
              <input
                type="checkbox"
                checked={advantage}
                onChange={(e) => {
                  setAdvantage(e.target.checked)
                  if (e.target.checked)
                    setDisadvantage(false)
                }}
              />
              Advantage
            </label>
            <label>
              <input
                type="checkbox"
                checked={disadvantage}
                onChange={(e) => {
                  setDisadvantage(e.target.checked)
                  if (e.target.checked)
                    setAdvantage(false)
                }}
              />
              Disadvantage
            </label>
          </div>
        </div>
      )}

      {/* Roll Button */}
      <div className="roll-actions">
        <motion.button className="roll-btn primary" onClick={handleRoll} whileHover={prefersReduced ? undefined : { scale: 1.03 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          🎲 Roll
          {' '}
          {expression}
          {modifier !== 0 && (modifier > 0 ? '+' : '')}
          {modifier !== 0 && modifier}
        </motion.button>
        {lastRoll && (
          <motion.button className="reroll-btn secondary" onClick={handleReroll} whileHover={prefersReduced ? undefined : { scale: 1.03 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            🔄 Reroll (Spend XP)
          </motion.button>
        )}
      </div>

      {/* Dice Animation */}
      {showAnimation && lastRoll && (
        <div className="dice-animation-section">
          <DiceAnimation
            roll={lastRoll}
            theme={animationTheme}
            size={compact ? 'small' : 'medium'}
            soundEnabled={soundEnabled}
          />
        </div>
      )}

      {/* Last Roll Display */}
      {lastRoll && (
        <motion.div className="last-roll-display" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
          <h4> Last Roll:</h4>
          <div className={`roll-result roll-result-text ${lastRoll.rollResult || (lastRoll.success !== undefined ? (lastRoll.success ? 'success' : 'failure') : 'neutral')}`}>
            <div className="roll-expression">
              {lastRoll.expression.count}
              {lastRoll.expression.type}
              {lastRoll.modifier !== 0 && ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}`}
            </div>
            <div className="roll-breakdown">
              Rolled: [
              {lastRoll.results.join(', ')}
              ] =
              {' '}
              {lastRoll.total}
              {lastRoll.modifier !== 0 && ` ${lastRoll.modifier >= 0 ? '+' : ''}${lastRoll.modifier}`}
              =
              {' '}
              <strong>{lastRoll.finalResult}</strong>
            </div>
            {lastRoll.rollResult && (
              <div className="roll-outcome">
                {lastRoll.rollResult === 'success' && '✅ Success (10+)'}
                {lastRoll.rollResult === 'partial' && '⚠️ Partial Success (7-9)'}
                {lastRoll.rollResult === 'failure' && '❌ Failure (6-)'}
              </div>
            )}
            {lastRoll.success !== undefined && (
              <div className="roll-outcome">
                {lastRoll.success ? '✅ Success' : '❌ Failure'}
                {lastRoll.targetNumber && ` (Target: ${lastRoll.targetNumber})`}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Roll History */}
      {showHistory && rollHistory.length > 0 && (
        <motion.div className="roll-history" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
          <h4> Recent Rolls:</h4>
          <div className="history-list">
            {rollHistory.slice(0, 5).map(roll => (
              <motion.div key={roll.id} className="history-item" variants={itemFadeIn}>
                <span className="history-expression">
                  {roll.expression.count}
                  {roll.expression.type}
                  {roll.modifier !== 0 && (roll.modifier > 0 ? '+' : '')}
                  {roll.modifier !== 0 && roll.modifier}
                </span>
                <span className={`history-result roll-result-text ${roll.rollResult || (roll.success !== undefined ? (roll.success ? 'success' : 'failure') : 'neutral')}`}>
                  {roll.finalResult}
                </span>
                {roll.rollResult && (
                  <span className="history-outcome">
                    {roll.rollResult === 'success' && '✅'}
                    {roll.rollResult === 'partial' && '⚠️'}
                    {roll.rollResult === 'failure' && '❌'}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default EnhancedDiceRoller
