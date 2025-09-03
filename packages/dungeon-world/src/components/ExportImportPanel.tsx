import type { GameState } from '../models/GameState'

import type { ImportResult } from '../services/StateExportImport'

import React, { useRef, useState } from 'react'
import { stateExportImport } from '../services/StateExportImport'
import './ExportImportPanel.css'

interface ExportImportPanelProps {
  gameState: GameState
  onImport: (state: GameState) => void
}

export const ExportImportPanel: React.FC <ExportImportPanelProps> = ({
  gameState,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportOptions, setExportOptions] = useState({
    includeCalculations: true,
    includeHistory: false,
    notes: '',
  })
  const [importResult, setImportResult] = useState <ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef <HTMLInputElement>(null)

  // Export handlers
  const _handleExport = () => {
    try {
      const exportData = stateExportImport.exportState(gameState, exportOptions)
      const blob = new Blob([exportData], { type: 'application / json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dungeon-world-save-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    catch {
      alert('Failed to export game state')
    }
  }

  const handleCopyToClipboard = () => {
    try {
      const exportData = stateExportImport.exportState(gameState, exportOptions)
      navigator.clipboard.writeText(exportData)
      alert('Game state copied to clipboard!')
    }
    catch {
      alert('Failed to copy to clipboard')
    }
  }

  // Import handlers
  const handleFileSelect = (event: React.ChangeEvent <HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result as string
      await processImport(content)
    }
    reader.readAsText(file)
  }

  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText()
      await processImport(text)
    }
    catch {
      alert('Failed to paste from clipboard')
    }
  }

  const processImport = async (jsonData: string) => {
    setIsProcessing(true)
    setImportResult(null)

    try {
      // Create backup first
      const backup = stateExportImport.createBackup(gameState)
      sessionStorage.setItem('import-backup', backup)

      // Process import
      const result = await stateExportImport.importState(jsonData)
      setImportResult(result)

      if (result.success && result.state) {
        // Let user review before applying
      }
    }
    catch {
      setImportResult({
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        fixedIssues: [],
      })
    }
    finally {
      setIsProcessing(false)
    }
  }

  const applyImport = () => {
    if (importResult?.success && importResult.state) {
      onImport(importResult.state)
      setImportResult(null)
      alert('Import successful!')
    }
  }

  const restoreBackup = () => {
    const backup = sessionStorage.getItem('import-backup')
    if (backup) {
      processImport(backup)
    }
  }

  return (
    <div className="export-import-panel">
      <div className="panel-tabs">
        <button
          className={`tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export
        </button>
        <button
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          Import
        </button>
      </div>

      {activeTab === 'export'
        ? (
            <div className="export-section">
              <h3> Export Game State</h3>

              <div className="export-options">
                <label className="option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCalculations}
                    onChange={e => setExportOptions({
                      ...exportOptions,
                      includeCalculations: e.target.checked,
                    })}
                  />
                  Include calculated values
                  {' '}
                  <span className="option-help">
                    Exports current armor, load, and other calculated values for verification
                  </span>
                </label>

                <label className="option">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHistory}
                    onChange={e => setExportOptions({
                      ...exportOptions,
                      includeHistory: e.target.checked,
                    })}
                  />
                  Include session history
                  {' '}
                  <span className="option-help">
                    Includes roll history and events (larger file size)
                  </span>
                </label>

                <div className="option">
                  <label> Notes (optional)</label>
                  <textarea
                    value={exportOptions.notes}
                    onChange={e => setExportOptions({
                      ...exportOptions,
                      notes: e.target.value,
                    })}
                    placeholder="Add notes about this save..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="export-actions">
                <button onClick={handleExport} className="primary-btn">
                  Download as File
                </button>
                <button onClick={handleCopyToClipboard} className="secondary-btn">
                  Copy to Clipboard
                </button>
              </div>

              <div className="export-info">
                <p>
                  {' '}
                  Characters:
                  {Object.keys(gameState.characters).length}
                </p>
                <p>
                  {' '}
                  Last saved:
                  {gameState.lastSaved?.toLocaleString() || 'Never'}
                </p>
              </div>
            </div>
          )
        : (
            <div className="import-section">
              <h3> Import Game State</h3>

              {!importResult && (
                <div className="import-options">
                  <div className="import-method">
                    <h4> From File</h4>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      aria-label="Choose import file"
                      className="hidden-file-input"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="primary-btn"
                      disabled={isProcessing}
                    >
                      Choose File
                    </button>
                  </div>

                  <div className="import-method">
                    <h4> From Clipboard</h4>
                    <button
                      onClick={handlePasteImport}
                      className="secondary-btn"
                      disabled={isProcessing}
                    >
                      Paste from Clipboard
                    </button>
                  </div>

                  {sessionStorage.getItem('import-backup') && (
                    <div className="import-method">
                      <h4> Restore Backup</h4>
                      <button
                        onClick={restoreBackup}
                        className="secondary-btn"
                      >
                        Restore Previous State
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="processing">
                  <div className="spinner" />
                  <p> Processing import...</p>
                </div>
              )}

              {importResult && (
                <div className="import-result">
                  <h4>
                    {' '}
                    Import
                    {importResult.success ? 'Ready' : 'Failed'}
                  </h4>

                  {importResult.errors.length > 0 && (
                    <div className="result-section errors">
                      <h5> Errors</h5>
                      <ul>
                        {importResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importResult.warnings.length > 0 && (
                    <div className="result-section warnings">
                      <h5> Warnings</h5>
                      <ul>
                        {importResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importResult.fixedIssues.length > 0 && (
                    <div className="result-section fixed">
                      <h5> Fixed Issues</h5>
                      <ul>
                        {importResult.fixedIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="import-actions">
                    {importResult.success
                      ? (
                          <>
                            <button onClick={applyImport} className="primary-btn">
                              Apply Import
                            </button>
                            <button onClick={() => setImportResult(null)} className="secondary-btn">
                              Cancel
                            </button>
                          </>
                        )
                      : (
                          <button onClick={() => setImportResult(null)} className="secondary-btn">
                            Try Again
                          </button>
                        )}
                  </div>
                </div>
              )}
            </div>
          )}
    </div>
  )
}
