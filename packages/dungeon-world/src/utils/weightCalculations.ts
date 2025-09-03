import type { Character } from '../models/Character'
import type { Inventory } from '../models/Inventory'
import {
  calculateCoinWeight,
  calculateDetailedLoad,
  suggestLoadOptimization,
} from './calculations/loadCalculations'

export function getLoadSummary(character: Character, inventory: Inventory) {
  return calculateDetailedLoad(character, inventory)
}

export function getLoadSuggestions(character: Character, inventory: Inventory) {
  return suggestLoadOptimization(character, inventory)
}

export function getCoinWeight(coins: number) {
  return calculateCoinWeight(coins)
}
