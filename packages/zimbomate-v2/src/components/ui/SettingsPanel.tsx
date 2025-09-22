/**
 * Enhanced Settings Panel - Card-based Scannable Layout
 *
 * Redesigned settings interface with clear visual hierarchy,
 * scannable categories, and dedicated Chronicle settings section.
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Gamepad2,
  Palette,
  FolderOpen,
  Wrench,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Toggle,
  Keyboard,
  Dice6,
  Save,
  Download,
  Upload,
  Monitor,
  Sparkles,
  Clock,
  MapPin,
  FileText,
  Users
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '../ui'
import { KeyboardShortcutsPanel } from './KeyboardShortcutsPanel'
import { PerformanceMonitor } from './PerformanceMonitor'
import { AccessibilityChecker } from './AccessibilityChecker'
import { HelpSystem } from './HelpSystem'
import { DemoQuickAccess } from './DemoQuickAccess'
import { FileManagementPanel } from '../game/FileManagementPanel'
import { ThemeComponentShowcase } from './ThemeComponentShowcase'
import { useChronicle } from '../chronicle/ChronicleProvider'

interface SettingsPanelProps {
  className?: string
  onDemoNavigate?: (demoId: string, demoTitle: string) => void
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

const ExpandableSettingsCard: React.FC<{
  category: SettingsCategory
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ category, isExpanded, onToggle, children }) => {
  const Icon = category.icon

  return (
    <Card variant="glass" padding="none" className="overflow-hidden">
      <motion.div
        className="cursor-pointer"
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: category.color, opacity: 0.2 }}
              >
                <Icon size={20} style={{ color: category.color }} />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {category.title}
                  {category.featured && (
                    <Badge variant="secondary" className="text-xs">
                      Enhanced
                    </Badge>
                  )}
                </CardTitle>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {category.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} style={{ color: 'var(--color-text-muted)' }} />
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
            className="overflow-hidden"
          >
            <CardContent className="pt-0 border-t border-gray-200 dark:border-gray-700">
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
    setMaxPrompts
  } = useChronicle()

  const [autoSave, setAutoSave] = useState(true)
  const [diceSound, setDiceSound] = useState(true)
  const [quickRolls, setQuickRolls] = useState(true)

  return (
    <div className="space-y-6">
      {/* Chronicle Settings - Featured */}
      <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-blue-600" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">Chronicle Settings</h4>
          <Badge variant="default" className="text-xs">Featured</Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Chronicle Overlay</label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Show contextual chronicle prompts during gameplay
              </p>
            </div>
            <Button
              variant={isOverlayEnabled ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleOverlay()}
            >
              {isOverlayEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {isOverlayEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Overlay Position</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Where chronicle prompts appear on screen
                  </p>
                </div>
                <select
                  value={overlayPosition}
                  onChange={(e) => setOverlayPosition(e.target.value as any)}
                  className="px-3 py-1 rounded border text-sm"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Max Prompts</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Maximum number of prompts shown at once
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMaxPrompts(Math.max(1, maxPrompts - 1))}
                    disabled={maxPrompts <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm">{maxPrompts}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMaxPrompts(Math.min(5, maxPrompts + 1))}
                    disabled={maxPrompts >= 5}
                  >
                    +
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Other Gameplay Settings */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 rounded-lg"
             style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <div>
            <label className="text-sm font-medium">Auto-save</label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Automatically save character data
            </p>
          </div>
          <Button
            variant={autoSave ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAutoSave(!autoSave)}
          >
            {autoSave ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg"
             style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <div>
            <label className="text-sm font-medium">Dice Sound Effects</label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Play sounds when rolling dice
            </p>
          </div>
          <Button
            variant={diceSound ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDiceSound(!diceSound)}
          >
            {diceSound ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg"
             style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <div>
            <label className="text-sm font-medium">Quick Rolls</label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Enable keyboard shortcuts for stat rolls
            </p>
          </div>
          <Button
            variant={quickRolls ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setQuickRolls(!quickRolls)}
          >
            {quickRolls ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg"
             style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
          <div>
            <label className="text-sm font-medium">Keyboard Shortcuts</label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              View and customize keyboard shortcuts
            </p>
          </div>
          <Button variant="outline" size="sm">
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
  onDemoNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['gameplay'])
  const [themeShowcaseOpen, setThemeShowcaseOpen] = useState(false)

  const categories: SettingsCategory[] = [
    {
      id: 'gameplay',
      title: 'Gameplay Settings',
      icon: Gamepad2,
      description: 'Chronicle settings, keyboard shortcuts, and gameplay preferences',
      color: 'var(--color-primary)',
      featured: true
    },
    {
      id: 'interface',
      title: 'Interface & Theme',
      icon: Palette,
      description: 'Theme selection, component showcase, and visual preferences',
      color: 'var(--color-secondary)'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: FolderOpen,
      description: 'Import, export, backup, and file management',
      color: 'var(--nature-500)'
    },
    {
      id: 'system',
      title: 'System & Performance',
      icon: Wrench,
      description: 'Performance monitoring, debug tools, and system settings',
      color: 'var(--orange-500)'
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      description: 'Help system, demos, and keyboard shortcuts reference',
      color: 'var(--purple-500)'
    }
  ]

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    return categories.filter(category =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const renderCategoryContent = (categoryId: string) => {
    switch (categoryId) {
      case 'gameplay':
        return <GameplaySettingsContent />

      case 'interface':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg"
                 style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
              <div>
                <label className="text-sm font-medium">Theme Showcase</label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Preview all themes and components
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setThemeShowcaseOpen(true)}
                className="gap-2"
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
          <div className="space-y-4">
            <PerformanceMonitor />
          </div>
        )

      case 'help':
        return (
          <div className="space-y-4">
            <HelpSystem />
            <KeyboardShortcutsPanel />
            {onDemoNavigate && (
              <DemoQuickAccess onDemoNavigate={onDemoNavigate} />
            )}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display mb-2">Settings</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Customize your ZimboMate experience
            </p>
          </div>
          <Badge variant="default" className="magical-glow">
            Enhanced ✨
          </Badge>
        </div>

        {/* Search */}
        <Card variant="glass" padding="sm">
          <CardContent>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-primary)',
                  borderOpacity: 0.2,
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className="space-y-4">
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
          <Card variant="glass" padding="lg">
            <CardContent>
              <div className="text-center py-8">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No settings found</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
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