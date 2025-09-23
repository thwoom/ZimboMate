/**
 * Dice System Component Exports
 * Central export point for all dice rolling system components
 */

// Core system components
export { UnifiedRollSystem, DiceRollingInterface } from './UnifiedRollSystem'
export { DiceHistorySidebar } from './DiceHistorySidebar'
export { RollDisplayManager } from './RollDisplayManager'

// Roll interaction components
export { ContextualRollPanel, useContextualRollPanel } from './ContextualRollPanel'
export { QuickRollZones } from './QuickRollZones'

// Export functionality
export { RollHistoryExportDialog } from './RollHistoryExportDialog'

// UI components
export { NotificationManager, NotificationSettings } from '../ui/NotificationManager'

// Rollable element wrapper (re-export from common)
export { RollableElement, RollableStat, RollableMove, RollableCustom } from '../common/RollableElement'

// Types and utilities
export type {
  ExportFormat,
  ExportOptions,
  ExportResult
} from '../../utils/rollHistoryExport'

export {
  exportRollHistory,
  copyExportToClipboard,
  downloadExport,
  getExportPreview
} from '../../utils/rollHistoryExport'

// Hooks
export { useDiceKeyboardShortcuts } from '../../hooks/useDiceKeyboardShortcuts'
export { useDragAndDrop } from '../../hooks/useDragAndDrop'
export { useLazyHover, useLazyHoverManager, useHoverPerformanceMonitor } from '../../hooks/useLazyHover'

// Browser compatibility
export { compatibility, ProgressiveEnhancement, BrowserFeatures, initCompatibility } from '../../utils/browserCompatibility'

// Stores (re-export for convenience)
export { useDiceStore } from '../../stores/diceStore'
export { useNotificationStore, notifyDiceRoll, notifyXPAward, notifyHoldGranted, notifyLevelUp } from '../../stores/notificationStore'
export { useXPStore } from '../../stores/xpStore'
export { useHoldStore } from '../../stores/holdStore'

// Move stat detection
export { getStatOptionsForMove, MOVE_STAT_MAPPING, CLASS_MOVES } from '../../utils/moveStatDetection'