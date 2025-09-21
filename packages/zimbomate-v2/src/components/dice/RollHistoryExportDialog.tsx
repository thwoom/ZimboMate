/**
 * Roll History Export Dialog Component
 * Provides user interface for exporting dice roll history in various formats
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Copy, Eye, X, Calendar, Filter, Settings, FileText } from 'lucide-react'
import { useDiceStore } from '../../stores/diceStore'
import {
  exportRollHistory,
  copyExportToClipboard,
  downloadExport,
  getExportPreview,
  filterRolls,
  type ExportFormat,
  type ExportOptions
} from '../../utils/rollHistoryExport'
import { Button } from '../ui/Button'

interface RollHistoryExportDialogProps {
  isOpen: boolean
  onClose: () => void
  characterId?: string
  className?: string
}

const formatOptions: { value: ExportFormat; label: string; description: string; icon: string }[] = [
  {
    value: 'plain',
    label: 'Plain Text',
    description: 'Simple text format for basic sharing',
    icon: '📄'
  },
  {
    value: 'markdown',
    label: 'Markdown',
    description: 'Formatted text with headers and styling',
    icon: '📝'
  },
  {
    value: 'csv',
    label: 'CSV',
    description: 'Spreadsheet-compatible data format',
    icon: '📊'
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data for developers',
    icon: '🔧'
  },
  {
    value: 'discord',
    label: 'Discord',
    description: 'Optimized for Discord chat with emojis',
    icon: '💬'
  },
  {
    value: 'rptools',
    label: 'RPTools',
    description: 'MapTool/RPTools dice notation format',
    icon: '🎲'
  }
]

export const RollHistoryExportDialog: React.FC<RollHistoryExportDialogProps> = ({
  isOpen,
  onClose,
  characterId,
  className = ''
}) => {
  const { getAllRolls, getActiveCharacterId } = useDiceStore()

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeCharacterInfo: true,
    includeTimestamps: true,
    includeModifiers: true,
    includeEffects: true,
    maxRolls: 50
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  const targetCharacterId = characterId || getActiveCharacterId()
  const allRolls = getAllRolls()

  // Filter rolls for the target character if specified
  const characterRolls = useMemo(() => {
    if (!targetCharacterId) return allRolls
    return allRolls.filter(roll => roll.characterId === targetCharacterId)
  }, [allRolls, targetCharacterId])

  const filteredRolls = useMemo(() => {
    return filterRolls(characterRolls, exportOptions)
  }, [characterRolls, exportOptions])

  const exportPreview = useMemo(() => {
    if (!showPreview) return ''
    return getExportPreview(filteredRolls, exportOptions, 15)
  }, [filteredRolls, exportOptions, showPreview])

  const handleFormatChange = (format: ExportFormat) => {
    setExportOptions(prev => ({ ...prev, format }))
  }

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleCopyToClipboard = async () => {
    setIsExporting(true)
    setExportSuccess(null)

    try {
      const success = await copyExportToClipboard(filteredRolls, exportOptions)
      if (success) {
        setExportSuccess('Copied to clipboard!')
        setTimeout(() => setExportSuccess(null), 3000)
      } else {
        throw new Error('Copy failed')
      }
    } catch (error) {
      console.error('Export to clipboard failed:', error)
      setExportSuccess('Copy failed - please try download instead')
      setTimeout(() => setExportSuccess(null), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = () => {
    setIsExporting(true)
    setExportSuccess(null)

    try {
      downloadExport(filteredRolls, exportOptions)
      setExportSuccess('Download started!')
      setTimeout(() => setExportSuccess(null), 3000)
    } catch (error) {
      console.error('Download failed:', error)
      setExportSuccess('Download failed - please try again')
      setTimeout(() => setExportSuccess(null), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDateRangeChange = (range: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date()
    let dateRange: { start: Date; end: Date } | undefined

    switch (range) {
      case 'today':
        dateRange = {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        }
        break
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        dateRange = { start: weekStart, end: now }
        break
      case 'month':
        const monthStart = new Date(now)
        monthStart.setDate(now.getDate() - 30)
        dateRange = { start: monthStart, end: now }
        break
      case 'all':
      default:
        dateRange = undefined
        break
    }

    setExportOptions(prev => ({ ...prev, dateRange }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          className={`
            relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden
            bg-white dark:bg-gray-800
            rounded-xl shadow-2xl
            flex flex-col
            ${className}
          `}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-500" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Export Roll History
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredRolls.length} rolls • Export in your preferred format
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex">
            {/* Options Panel */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {formatOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFormatChange(option.value)}
                        className={`
                          p-3 text-left rounded-lg border transition-all
                          ${exportOptions.format === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{option.icon}</span>
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    <Calendar size={16} className="inline mr-2" />
                    Time Period
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Time', description: `${characterRolls.length} rolls` },
                      { value: 'month', label: 'Last 30 Days', description: 'Recent activity' },
                      { value: 'week', label: 'Last 7 Days', description: 'This week' },
                      { value: 'today', label: 'Today', description: 'Today only' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleDateRangeChange(option.value as any)}
                        className={`
                          w-full p-2 text-left rounded border transition-all
                          ${!exportOptions.dateRange && option.value === 'all'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : exportOptions.dateRange && option.value !== 'all'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Options */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    <Settings size={16} className="inline mr-2" />
                    Include Data
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'includeTimestamps' as const, label: 'Timestamps', description: 'When rolls were made' },
                      { key: 'includeModifiers' as const, label: 'Modifiers', description: 'Stat bonuses and penalties' },
                      { key: 'includeEffects' as const, label: 'Effects', description: 'XP and Hold awards' },
                      { key: 'includeCharacterInfo' as const, label: 'Character Data', description: 'Character and roll context' }
                    ].map(option => (
                      <label key={option.key} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={exportOptions[option.key] as boolean}
                          onChange={(e) => handleOptionChange(option.key, e.target.checked)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Rolls */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    <Filter size={16} className="inline mr-2" />
                    Limit Rolls
                  </label>
                  <select
                    value={exportOptions.maxRolls || ''}
                    onChange={(e) => handleOptionChange('maxRolls', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded"
                  >
                    <option value="">All rolls</option>
                    <option value="10">Last 10 rolls</option>
                    <option value="25">Last 25 rolls</option>
                    <option value="50">Last 50 rolls</option>
                    <option value="100">Last 100 rolls</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="flex-1 flex flex-col">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Preview</h3>
                  <p className="text-sm text-gray-500">{filteredRolls.length} rolls will be exported</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye size={16} className="mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                {showPreview ? (
                  <div className="h-full overflow-y-auto p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded border">
                      {exportPreview}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Eye size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Click "Show Preview" to see export format</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    {exportSuccess && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {exportSuccess}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      disabled={isExporting || filteredRolls.length === 0}
                    >
                      <Copy size={16} className="mr-2" />
                      Copy to Clipboard
                    </Button>

                    <Button
                      onClick={handleDownload}
                      disabled={isExporting || filteredRolls.length === 0}
                    >
                      <Download size={16} className="mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}