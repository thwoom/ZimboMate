import React from 'react'
import { weightOptimizationService } from '../services/WeightOptimizationService'
import { useGameStore, useCharacter, useInventory } from '../store/GameStore'

export function LoadOptimizer() {
  const { state } = useGameStore()
  const character = useCharacter()
  const inventory = useInventory()

  if (!character || !inventory)
    return null

  const { summary, suggestions } = weightOptimizationService.getOptimization(character, inventory)

  return (
    <div className="load-optimizer">
      <h3>Load Optimization</h3>
      <div className="load-optimizer__summary">
        <div>Max Load: {summary.maxLoad}</div>
        <div>Current Load: {summary.currentLoad.toFixed(2)}</div>
        <div>Status: {summary.status}</div>
        <div>Usage: {summary.percentage.toFixed(0)}%</div>
      </div>
      <div className="load-optimizer__suggestions">
        {suggestions.length === 0 ? (
          <p>No suggestions. Your load is optimal.</p>
        ) : (
          <ul>
            {suggestions.map((s, i) => (
              <li key={i}>
                <strong>{s.impact}</strong>: {s.suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default LoadOptimizer


