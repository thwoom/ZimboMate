import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Settings, Users, NotebookPen, Package } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import * as Checkbox from '@radix-ui/react-checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ExportFormat } from '../../fileManagementMockData'

interface ExportOptions {
  format: ExportFormat
  includeCharacters: boolean
  includeCampaigns: boolean
  includeNotes: boolean
  includeSettings: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

interface ExportPanelProps {
  onExport: (data: any, format: ExportFormat) => void
  operationInProgress: boolean
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  onExport,
  operationInProgress
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: ExportFormat.JSON,
    includeCharacters: true,
    includeCampaigns: true,
    includeNotes: false,
    includeSettings: false
  })

  const [selectedPreset, setSelectedPreset] = useState<string>('custom')

  const exportPresets = [
    {
      id: 'all',
      name: 'Export All Data',
      description: 'Complete backup of all your data',
      icon: Package,
      options: {
        includeCharacters: true,
        includeCampaigns: true,
        includeNotes: true,
        includeSettings: true
      }
    },
    {
      id: 'characters',
      name: 'Characters Only',
      description: 'Export only character data',
      icon: Users,
      options: {
        includeCharacters: true,
        includeCampaigns: false,
        includeNotes: false,
        includeSettings: false
      }
    },
    {
      id: 'campaigns',
      name: 'Campaign Data',
      description: 'Export campaigns and related notes',
      icon: NotebookPen,
      options: {
        includeCharacters: false,
        includeCampaigns: true,
        includeNotes: true,
        includeSettings: false
      }
    }
  ]

  const formatOptions = [
    { value: ExportFormat.JSON, label: 'JSON', description: 'JavaScript Object Notation' },
    { value: ExportFormat.CSV, label: 'CSV', description: 'Comma Separated Values' },
    { value: ExportFormat.XML, label: 'XML', description: 'Extensible Markup Language' },
    { value: ExportFormat.PDF, label: 'PDF', description: 'Portable Document Format' }
  ]

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = exportPresets.find(p => p.id === presetId)
    if (preset) {
      setExportOptions(prev => ({
        ...prev,
        ...preset.options
      }))
    }
  }

  const handleExport = () => {
    const exportData = {
      characters: exportOptions.includeCharacters ? ['character1', 'character2'] : [],
      campaigns: exportOptions.includeCampaigns ? ['campaign1'] : [],
      notes: exportOptions.includeNotes ? ['notes1', 'notes2'] : [],
      settings: exportOptions.includeSettings ? { theme: 'fantasy' } : null,
      exportedAt: new Date().toISOString(),
      format: exportOptions.format
    }

    onExport(exportData, exportOptions.format)
  }

  const getEstimatedSize = (): string => {
    let size = 0
    if (exportOptions.includeCharacters) size += 50 // KB
    if (exportOptions.includeCampaigns) size += 200
    if (exportOptions.includeNotes) size += 30
    if (exportOptions.includeSettings) size += 5
    
    return size > 1000 ? `${(size / 1000).toFixed(1)} MB` : `${size} KB`
  }

  return (
    <div className="space-y-6">
      {/* Export Presets */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Quick Export Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportPresets.map((preset) => {
              const Icon = preset.icon
              const isSelected = selectedPreset === preset.id
              
              return (
                <motion.div
                  key={preset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50 bg-surface hover:bg-surface-elevated'
                      }
                    `}
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon 
                        size={20} 
                        style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                      />
                      <h3 className="font-medium">{preset.name}</h3>
                    </div>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {preset.description}
                    </p>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Select Data to Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'includeCharacters', label: 'Characters', icon: Users, count: 3 },
                { key: 'includeCampaigns', label: 'Campaigns', icon: NotebookPen, count: 2 },
                { key: 'includeNotes', label: 'Session Notes', icon: FileText, count: 15 },
                { key: 'includeSettings', label: 'App Settings', icon: Settings, count: 1 }
              ].map((item) => {
                const Icon = item.icon
                const isChecked = exportOptions[item.key as keyof ExportOptions] as boolean
                
                return (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox.Root
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          setExportOptions(prev => ({
                            ...prev,
                            [item.key]: checked
                          }))
                          setSelectedPreset('custom')
                        }}
                        className="w-5 h-5 border-2 rounded flex items-center justify-center"
                        style={{
                          borderColor: 'var(--color-primary)',
                          backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent'
                        }}
                      >
                        <Checkbox.Indicator>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-white"
                          >
                            ✓
                          </motion.div>
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <Icon size={18} style={{ color: 'var(--color-text-secondary)' }} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Badge variant="secondary">{item.count} items</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export Format & Options */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">File Format</label>
                <Select.Root 
                  value={exportOptions.format} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as ExportFormat }))}
                >
                  <Select.Trigger 
                    className="w-full p-3 border rounded-lg flex items-center justify-between"
                    style={{ 
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-surface)'
                    }}
                  >
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content 
                    className="bg-surface border border-border rounded-lg shadow-lg z-50"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    {formatOptions.map((format) => (
                      <Select.Item 
                        key={format.value} 
                        value={format.value}
                        className="p-3 hover:bg-surface-elevated cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div 
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {format.description}
                          </div>
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                <h4 className="font-medium mb-2">Export Summary</h4>
                <div className="space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <div>Estimated size: <span className="font-medium">{getEstimatedSize()}</span></div>
                  <div>Format: <span className="font-medium">{exportOptions.format.toUpperCase()}</span></div>
                  <div>
                    Items: <span className="font-medium">
                      {[
                        exportOptions.includeCharacters && 'Characters',
                        exportOptions.includeCampaigns && 'Campaigns',
                        exportOptions.includeNotes && 'Notes',
                        exportOptions.includeSettings && 'Settings'
                      ].filter(Boolean).join(', ') || 'None selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card variant="magical">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Ready to Export</h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Your data will be packaged and downloaded as a {exportOptions.format.toUpperCase()} file
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleExport}
              disabled={operationInProgress || (!exportOptions.includeCharacters && !exportOptions.includeCampaigns && !exportOptions.includeNotes && !exportOptions.includeSettings)}
              className="gap-2"
            >
              <Download size={20} />
              {operationInProgress ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}