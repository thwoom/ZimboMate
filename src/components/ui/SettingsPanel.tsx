/**
 * Enhanced Settings Panel - Card-based Scannable Layout
 *
 * Redesigned settings interface with clear visual hierarchy,
 * scannable categories, and dedicated Chronicle settings section.
 */

import type { ChronicleSettings } from '../../types/chronicle'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  FolderOpen,
  Gamepad2,
  HelpCircle,
  Keyboard,
  Palette,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useChronicleStore } from '../../stores/chronicleStore'
import { useChronicle, useChronicleLLM } from '../chronicle/ChronicleProvider'
import { FileManagementPanel } from '../game/FileManagementPanel'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../ui'
import { AccessibilityChecker } from './AccessibilityChecker'
import { HelpSystem } from './HelpSystem'
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel'
import { PerformanceMonitor } from './PerformanceMonitor'
import { ThemeComponentShowcase } from './ThemeComponentShowcase'
import { RolloutDashboardPanel } from '../chronicle/RolloutDashboardPanel'

interface SettingsPanelProps {
  className?: string
}

interface SettingsCategory {
  id: string
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  description: string
  color: string
  expanded?: boolean
  featured?: boolean
}

type ChronicleOverlayPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'gameplay',
    title: 'Gameplay Settings',
    icon: Gamepad2,
    description:
      'Chronicle settings, keyboard shortcuts, and gameplay preferences',
    color: 'var(--primary)',
    featured: true,
  },
  {
    id: 'interface',
    title: 'Interface & Theme',
    icon: Palette,
    description: 'Theme selection, component showcase, and visual preferences',
    color: 'var(--secondary)',
  },
  {
    id: 'data',
    title: 'Data Management',
    icon: FolderOpen,
    description: 'Import, export, backup, and file management',
    color: 'var(--nature-500)',
  },
  {
    id: 'system',
    title: 'System & Performance',
    icon: Wrench,
    description: 'Performance monitoring, debug tools, and system settings',
    color: 'var(--orange-500)',
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: HelpCircle,
    description: 'Help system, guides, and keyboard shortcuts reference',
    color: 'var(--purple-500)',
  },
]

const OVERLAY_POSITIONS: ChronicleOverlayPosition[] = [
  'top-right',
  'top-left',
  'bottom-right',
  'bottom-left',
]

function formatOverlayPosition(position: ChronicleOverlayPosition) {
  return position
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const ExpandableSettingsCard: React.FC<{
  category: SettingsCategory
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ category, isExpanded, onToggle, children }) => {
  const Icon = category.icon

  return (
    <Card variant='surface' className='overflow-hidden'>
      <motion.div
        className='cursor-pointer'
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className='w-10 h-10 rounded-lg flex items-center justify-center'
                style={{ backgroundColor: category.color, opacity: 0.2 }}
              >
                <Icon size={20} style={{ color: category.color }} />
              </div>
              <div>
                <CardTitle className='text-lg flex items-center gap-2'>
                  {category.title}
                  {category.featured && (
                    <Badge variant='secondary' className='text-xs'>
                      Enhanced
                    </Badge>
                  )}
                </CardTitle>
                <p className='text-sm mt-1 text-muted-foreground'>
                  {category.description}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className='text-muted-foreground' size={20} />
              </motion.div>
            </div>
          </div>
        </CardHeader>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <CardContent className='pt-0 border-t border-border '>
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

const GameplaySettingsContent: React.FC = () => {
  const {
    isOverlayEnabled,
    toggleOverlay,
    overlayPosition,
    setOverlayPosition,
    maxPrompts,
    setMaxPrompts,
  } = useChronicle()
  const {
    settings,
    updateSettings,
    sessionCostCents,
    remainingCostBudgetCents,
    isCostGuardrailActive,
    resetSessionCost,
  } = useChronicleLLM()
  const {
    clearAutomationHistory,
    endBundleApply,
    deltaHistoryCount,
    auditLogCount,
    snapshotCount,
    exportBundleSnapshots,
    latestBundleId,
  } = useChronicleStore((state) => ({
    clearAutomationHistory: state.clearAutomationHistory,
    endBundleApply: state.endBundleApply,
    deltaHistoryCount: state.deltaHistory.length,
    auditLogCount: state.auditLog.length,
    snapshotCount: state.bundleSnapshots.length,
    exportBundleSnapshots: state.exportBundleSnapshots,
    latestBundleId: state.deltaHistory[0]?.bundleId ?? null,
  }))

  const autoApplyPolicy = useMemo(
    () => settings.autoApplyPolicy ?? {},
    [settings.autoApplyPolicy],
  )
  const toneOptions: Array<ChronicleSettings['tone']> = [
    'gritty',
    'heroic',
    'terse',
  ]
  const verbosityOptions: Array<ChronicleSettings['verbosity']> = [
    'short',
    'standard',
    'long',
  ]
  const autoApplyConfig = [
    { key: 'mark_xp', label: 'XP on miss' },
    { key: 'add_item', label: 'Loot pickups' },
    { key: 'apply_damage', label: 'Damage adjustments' },
    { key: 'spend_ammo', label: 'Ammo & Hold' },
  ] as const
  const autoApplyOptions = ['auto', 'confirm', 'off'] as const

  const updateAutoApply = useCallback(
    (
      key: (typeof autoApplyConfig)[number]['key'],
      value: (typeof autoApplyOptions)[number],
    ) => {
      updateSettings({
        autoApplyPolicy: {
          ...autoApplyPolicy,
          [key]: value,
        },
      })
    },
    [autoApplyPolicy, updateSettings],
  )

  const [autoSave, setAutoSave] = useState(true)
  const [diceSound, setDiceSound] = useState(true)
  const [quickRolls, setQuickRolls] = useState(true)
  const [costCapInput, setCostCapInputState] = useReducer(
    (_: string, next: string) => next,
    settings.costCapCents != null
      ? (settings.costCapCents / 100).toFixed(2)
      : '',
  )

  const syncCostCapInput = useCallback(() => {
    setCostCapInputState(
      settings.costCapCents != null
        ? (settings.costCapCents / 100).toFixed(2)
        : '',
    )
  }, [settings.costCapCents])

  useEffect(() => {
    syncCostCapInput()
  }, [syncCostCapInput])

  const costCapDisplay = useMemo(() => {
    if (settings.costCapCents == null) return null
    return (settings.costCapCents / 100).toFixed(2)
  }, [settings.costCapCents])

  const sessionSpendDisplay = useMemo(
    () => (sessionCostCents / 100).toFixed(2),
    [sessionCostCents],
  )

  const remainingBudgetDisplay = useMemo(() => {
    if (remainingCostBudgetCents == null) return null
    return (remainingCostBudgetCents / 100).toFixed(2)
  }, [remainingCostBudgetCents])

  const guardrailBadgeVariant = isCostGuardrailActive
    ? 'destructive'
    : costCapDisplay
      ? 'primary'
      : 'outline'

  const [snapshotCopyState, setSnapshotCopyState] = useState<
    'idle' | 'copied' | 'error'
  >('idle')

  useEffect(() => {
    if (snapshotCopyState === 'copied') {
      const timeout = setTimeout(() => setSnapshotCopyState('idle'), 2000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [snapshotCopyState])

  const hasAutomationHistory =
    deltaHistoryCount > 0 || auditLogCount > 0 || snapshotCount > 0

  const handleClearAutomationLog = useCallback(() => {
    clearAutomationHistory()
    endBundleApply()
  }, [clearAutomationHistory, endBundleApply])

  const handleResetSessionCost = useCallback(() => {
    resetSessionCost()
  }, [resetSessionCost])

  const handleExportLatestSnapshot = useCallback(async () => {
    if (!latestBundleId) {
      setSnapshotCopyState('error')
      return
    }

    const payload = exportBundleSnapshots(latestBundleId)
    if (!payload) {
      setSnapshotCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(payload)
      setSnapshotCopyState('copied')
    } catch (error) {
      console.error('[settings] Failed to copy snapshot payload', error)
      setSnapshotCopyState('error')
    }
  }, [exportBundleSnapshots, latestBundleId])

  const commitCostCap = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (trimmed === '') {
        updateSettings({ costCapCents: undefined })
        return
      }
      const parsed = Number.parseFloat(trimmed)
      if (Number.isNaN(parsed) || parsed < 0) {
        return
      }
      updateSettings({ costCapCents: Math.round(parsed * 100) })
    },
    [updateSettings],
  )

  return (
    <div className='space-y-6'>
      {/* Chronicle Settings - Featured */}
      <div className='p-4 rounded-lg border-2 border-primary/30 bg-primary/10/50 '>
        <div className='flex items-center gap-2 mb-4'>
          <BookOpen size={20} className='text-primary' />
          <h4 className='font-semibold text-primary '>Chronicle Settings</h4>
          <Badge variant='default' className='text-xs'>
            Featured
          </Badge>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium'>Chronicle Overlay</label>
              <p className='text-xs text-muted-foreground '>
                Show contextual chronicle prompts during gameplay
              </p>
            </div>
            <Button
              variant={isOverlayEnabled ? 'primary' : 'outline'}
              size='sm'
              onClick={() => toggleOverlay()}
            >
              {isOverlayEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {isOverlayEnabled && (
            <>
              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-sm font-medium'>
                    Overlay Position
                  </label>
                  <p className='text-xs text-muted-foreground '>
                    Where chronicle prompts appear on screen
                  </p>
                </div>
                <select
                  value={overlayPosition}
                  onChange={(event) =>
                    setOverlayPosition(
                      event.target.value as ChronicleOverlayPosition,
                    )
                  }
                  className='px-3 py-1 rounded border text-sm'
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {OVERLAY_POSITIONS.map((position) => (
                    <option key={position} value={position}>
                      {formatOverlayPosition(position)}
                    </option>
                  ))}
                </select>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-sm font-medium'>Max Prompts</label>
                  <p className='text-xs text-muted-foreground '>
                    Maximum number of prompts shown at once
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setMaxPrompts(Math.max(1, maxPrompts - 1))}
                    disabled={maxPrompts <= 1}
                  >
                    -
                  </Button>
                  <span className='w-8 text-center text-sm'>{maxPrompts}</span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setMaxPrompts(Math.min(5, maxPrompts + 1))}
                    disabled={maxPrompts >= 5}
                  >
                    +
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium'>Narrative Tone</label>
              <p className='text-xs text-muted-foreground '>
                Choose how Chronicle phrases summaries.
              </p>
            </div>
            <div className='flex gap-2'>
              {toneOptions.map((option) => (
                <Button
                  key={option}
                  variant={settings.tone === option ? 'primary' : 'outline'}
                  size='sm'
                  onClick={() => updateSettings({ tone: option })}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium'>Narrative Verbosity</label>
              <p className='text-xs text-muted-foreground '>
                Set Chronicle entry length.
              </p>
            </div>
            <div className='flex gap-2'>
              {verbosityOptions.map((option) => (
                <Button
                  key={option}
                  variant={
                    settings.verbosity === option ? 'primary' : 'outline'
                  }
                  size='sm'
                  onClick={() => updateSettings({ verbosity: option })}
                >
                  {option === 'short'
                    ? 'Short'
                    : option === 'standard'
                      ? 'Standard'
                      : 'Long'}
                </Button>
              ))}
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <label className='text-sm font-medium'>Auto-equip weapons</label>
              <p className='text-xs text-muted-foreground '>
                Equip weapon-tagged loot automatically when slots allow.
              </p>
            </div>
            <Button
              variant={settings.autoEquipWeapons ? 'primary' : 'outline'}
              size='sm'
              onClick={() =>
                updateSettings({ autoEquipWeapons: !settings.autoEquipWeapons })
              }
            >
              {settings.autoEquipWeapons ? 'On' : 'Off'}
            </Button>
          </div>

          <div>
            <label className='text-sm font-medium'>
              Auto-apply Preferences
            </label>
            <p className='text-xs text-muted-foreground '>
              Choose which deltas Chronicle applies without prompting.
            </p>
            <div className='space-y-2 mt-2'>
              {autoApplyConfig.map(({ key, label }) => {
                const choice = (autoApplyPolicy[key] ??
                  'confirm') as (typeof autoApplyOptions)[number]
                return (
                  <div key={key} className='flex items-center justify-between'>
                    <span className='text-sm'>{label}</span>
                    <div className='flex gap-2'>
                      {autoApplyOptions.map((option) => (
                        <Button
                          key={option}
                          variant={choice === option ? 'primary' : 'outline'}
                          size='sm'
                          onClick={() => updateAutoApply(key, option)}
                        >
                          {option === 'auto'
                            ? 'Auto'
                            : option === 'confirm'
                              ? 'Confirm'
                              : 'Off'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className='flex items-start justify-between gap-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <label className='text-sm font-medium'>Cost Guardrail</label>
                <Badge variant={guardrailBadgeVariant} className='text-xs'>
                  {costCapDisplay
                    ? isCostGuardrailActive
                      ? `Cap $${costCapDisplay} (Hit)`
                      : `Cap $${costCapDisplay} / Spent $${sessionSpendDisplay}`
                    : `Off / Spent $${sessionSpendDisplay}`}
                </Badge>
              </div>
              <p className='text-xs text-muted-foreground '>
                Set a GPT-5 spend limit per session (USD). Chronicle falls back
                to templates when the cap is reached.
              </p>
              {costCapDisplay && (
                <p className='text-xs text-muted-foreground '>
                  {isCostGuardrailActive
                    ? 'Guardrail engaged — GPT-5 calls now return template responses.'
                    : `Remaining budget $${remainingBudgetDisplay ?? '0.00'}`}
                </p>
              )}
            </div>
            <div className='flex flex-col items-end gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>$</span>
                <input
                  type='number'
                  min='0'
                  step='0.50'
                  value={costCapInput}
                  onChange={(event) => setCostCapInputState(event.target.value)}
                  onBlur={() => commitCostCap(costCapInput)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.currentTarget.blur()
                    }
                  }}
                  placeholder='0.00'
                  className='w-24 rounded border px-2 py-1 text-sm'
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    setCostCapInputState('')
                    updateSettings({ costCapCents: undefined })
                  }}
                  disabled={!costCapInput}
                >
                  Clear
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleResetSessionCost}
                  disabled={sessionCostCents === 0}
                >
                  Reset Spend
                </Button>
              </div>
            </div>
          </div>

          <div className='flex items-start justify-between'>
            <div>
              <label className='text-sm font-medium'>Automation Log</label>
              <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                <Badge variant='outline' className='font-normal'>
                  Bundles {deltaHistoryCount}
                </Badge>
                <Badge variant='outline' className='font-normal'>
                  Snapshots {snapshotCount}
                </Badge>
                <Badge variant='outline' className='font-normal'>
                  Audit {auditLogCount}
                </Badge>
                <Badge
                  variant={settings.autoEquipWeapons ? 'primary' : 'outline'}
                  className='font-normal'
                >
                  Auto-equip {settings.autoEquipWeapons ? 'On' : 'Off'}
                </Badge>
                <Badge variant={guardrailBadgeVariant} className='font-normal'>
                  {costCapDisplay
                    ? isCostGuardrailActive
                      ? `Guardrail hit (Spent $${sessionSpendDisplay})`
                      : `Guardrail $${costCapDisplay} / Spent $${sessionSpendDisplay}`
                    : `Guardrail off / Spent $${sessionSpendDisplay}`}
                </Badge>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={handleExportLatestSnapshot}
                disabled={!latestBundleId || snapshotCount === 0}
              >
                {snapshotCopyState === 'copied'
                  ? 'Snapshot Copied'
                  : snapshotCopyState === 'error'
                    ? 'Snapshot Unavailable'
                    : 'Copy Latest Snapshot'}
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={handleClearAutomationLog}
                disabled={!hasAutomationHistory}
              >
                Clear Log
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Other Gameplay Settings */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div className='flex items-center justify-between p-3 rounded-lg bg-popover'>
          <div>
            <label className='text-sm font-medium'>Auto-save</label>
            <p className='text-xs text-muted-foreground '>
              Automatically save character data
            </p>
          </div>
          <Button
            variant={autoSave ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setAutoSave(!autoSave)}
          >
            {autoSave ? 'On' : 'Off'}
          </Button>
        </div>

        <div className='flex items-center justify-between p-3 rounded-lg bg-popover'>
          <div>
            <label className='text-sm font-medium'>Dice Sound Effects</label>
            <p className='text-xs text-muted-foreground '>
              Play sounds when rolling dice
            </p>
          </div>
          <Button
            variant={diceSound ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setDiceSound(!diceSound)}
          >
            {diceSound ? 'On' : 'Off'}
          </Button>
        </div>

        <div className='flex items-center justify-between p-3 rounded-lg bg-popover'>
          <div>
            <label className='text-sm font-medium'>Quick Rolls</label>
            <p className='text-xs text-muted-foreground '>
              Enable keyboard shortcuts for stat rolls
            </p>
          </div>
          <Button
            variant={quickRolls ? 'primary' : 'outline'}
            size='sm'
            onClick={() => setQuickRolls(!quickRolls)}
          >
            {quickRolls ? 'On' : 'Off'}
          </Button>
        </div>

        <div className='flex items-center justify-between p-3 rounded-lg bg-popover'>
          <div>
            <label className='text-sm font-medium'>Keyboard Shortcuts</label>
            <p className='text-xs text-muted-foreground '>
              View and customize keyboard shortcuts
            </p>
          </div>
          <Button variant='outline' size='sm'>
            <Keyboard size={16} />
            Configure
          </Button>
        </div>
      </div>
    </div>
  )
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'gameplay',
  ])
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_CATEGORIES

    return SETTINGS_CATEGORIES.filter(
      (category) =>
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const renderCategoryContent = (categoryId: string) => {
    switch (categoryId) {
      case 'gameplay':
        return <GameplaySettingsContent />

      case 'interface':
        return (
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-3 rounded-lg bg-popover'>
              <div>
                <label className='text-sm font-medium'>Theme Showcase</label>
                <p className='text-xs text-muted-foreground '>
                  Preview all themes and components
                </p>
              </div>
              <Button
                variant='primary'
                size='sm'
                onClick={() => setThemeShowcaseOpen(true)}
                className='gap-2'
              >
                <Sparkles size={16} />
                Open Showcase
              </Button>
            </div>
            <AccessibilityChecker />
          </div>
        )

      case 'data':
        return <FileManagementPanel />

      case 'system':
        return (
          <div className='space-y-4'>
            <RolloutDashboardPanel />
            <PerformanceMonitor />
          </div>
        )

      case 'help':
        return (
          <div className='space-y-4'>
            <HelpSystem />
            <KeyboardShortcutsPanel />
            <div
              className='p-4 rounded-lg border'
              style={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
              }}
            >
              <h4 className='text-sm font-semibold mb-2'>
                Need more assistance?
              </h4>
              <p className='text-xs mb-3 text-muted-foreground'>
                Explore the in-app help center, review the latest release notes,
                or reach out to your GM for tailored guidance.
              </p>
              <ul className='text-xs space-y-2 text-muted-foreground'>
                <li>
                  • Use the Command Palette (<kbd>Ctrl</kbd>/<kbd>⌘</kbd> +
                  <kbd>K</kbd>) to jump to tools quickly.
                </li>
                <li>
                  • Visit the Knowledge Base from the Help menu for setup
                  walkthroughs and FAQs.
                </li>
                <li>
                  • Join the community Discord to share rulings, house rules,
                  and collaborative campaigns.
                </li>
              </ul>
            </div>
          </div>
        )

      default:
        return <div>Settings content coming soon...</div>
    }
  }

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-display mb-2'>Settings</h2>
            <p className='text-muted-foreground'>
              Customize your ZimboMate experience
            </p>
          </div>
          <Badge variant='default' className='magical-glow'>
            Enhanced ✨
          </Badge>
        </div>

        {/* Search */}
        <Card variant='surface'>
          <CardContent className='p-4'>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground'
              />
              <input
                type='text'
                placeholder='Search settings...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-lg border transition-colors'
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--primary)',
                  borderOpacity: 0.2,
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className='space-y-4'>
          {filteredCategories.map((category) => (
            <ExpandableSettingsCard
              key={category.id}
              category={category}
              isExpanded={expandedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
            >
              {renderCategoryContent(category.id)}
            </ExpandableSettingsCard>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <Card variant='surface'>
            <CardContent className='p-6'>
              <div className='text-center py-8'>
                <Search size={48} className='mx-auto mb-4 opacity-30' />
                <h3 className='text-lg font-semibold mb-2'>
                  No settings found
                </h3>
                <p className='text-muted-foreground'>
                  Try adjusting your search query
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Theme Showcase Modal */}
      <ThemeComponentShowcase
        isOpen={themeShowcaseOpen}
        onClose={() => setThemeShowcaseOpen(false)}
      />
    </>
  )
}

export default SettingsPanel
