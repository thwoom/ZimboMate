import type { Character } from '../models/Character'
import type { Inventory } from '../models/Inventory'
import { getLoadSuggestions, getLoadSummary } from '../utils/weightCalculations'

export interface LoadOptimizationResult {
  summary: ReturnType<typeof getLoadSummary>
  suggestions: ReturnType<typeof getLoadSuggestions>
}

class WeightOptimizationService {
  getOptimization(character: Character, inventory: Inventory): LoadOptimizationResult {
    const summary = getLoadSummary(character, inventory)
    const suggestions = getLoadSuggestions(character, inventory)
    return { summary, suggestions }
  }
}

export const weightOptimizationService = new WeightOptimizationService()
