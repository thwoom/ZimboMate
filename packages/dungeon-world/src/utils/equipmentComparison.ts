import type { Item } from '../models/Equipment'

export interface ComparisonMetric {
  key: string
  label: string
  a?: number | string
  b?: number | string
}

export function compareItems(a: Item, b: Item): ComparisonMetric[] {
  return [
    { key: 'weight', label: 'Weight', a: a.weight, b: b.weight },
    { key: 'value', label: 'Coins', a: a.value ?? 0, b: b.value ?? 0 },
    { key: 'category', label: 'Category', a: a.category, b: b.category },
  ]
}
