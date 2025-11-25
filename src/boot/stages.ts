import type { BootStageDefinition } from './types'
import { BadgeCheck, BookOpenCheck, Map, Sparkles, Waves, Waypoints, Zap } from 'lucide-react'

export const BOOT_STAGE_DEFINITIONS: BootStageDefinition[] = [
  {
    id: 'themeTokens',
    label: 'Infusing Matsu Palette',
    description: 'Applying theme tokens and CSS vars',
    weight: 8,
    icon: Sparkles,
  },
  {
    id: 'fontFace',
    label: 'Binding Signature Fonts',
    description: 'Loading Nunito and Cinzel families',
    weight: 10,
    icon: BookOpenCheck,
  },
  {
    id: 'storeHydration',
    label: 'Restoring Journals',
    description: 'Rehydrating local campaign stores',
    weight: 20,
    icon: Waypoints,
  },
  {
    id: 'characterData',
    label: 'Summoning Characters',
    description: 'Preparing recent characters and drafts',
    weight: 18,
    icon: BadgeCheck,
  },
  {
    id: 'routePrefetch',
    label: 'Charting Play Routes',
    description: 'Prefetching primary panes and assets',
    weight: 14,
    icon: Map,
  },
  {
    id: 'fxReady',
    label: 'Priming Dice & Effects',
    description: 'Warming animation and toast systems',
    weight: 10,
    icon: Zap,
  },
  {
    id: 'finalize',
    label: 'Setting the Table',
    description: 'Final instrumentation before handoff',
    weight: 4,
    icon: Sparkles,
  },
]
