import type { Panel } from '../../framework/Panel'

import type { ContentTemplate } from '../../services/ContentImportExportService'

import type { ContentType, ValidationResult } from '../../services/ContentSchema'
import React, { useEffect, useState } from 'react'
import { contentImportExportService } from '../../services/ContentImportExportService'
import { checkFieldDependency, getSchema } from '../../services/ContentSchema'
import { contentValidationService } from '../../services/ContentValidationService'
import { moveIndexService } from '../../services/MoveIndexService'
import './ContentStudioPanel.css'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant, staggerContainer, itemFadeIn } from '../../utils/motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'

interface ContentStudioPanelProps {
  // Add unknown props as needed
}

interface FormData {
  [key: string]: unknown
}

const ContentStudioPanel: React.FC <ContentStudioPanelProps> = () => {
  const [contentType, setContentType] = useState <ContentType>('move')
  const [formData, setFormData] = useState <FormData>({})
  const [validationResult, setValidationResult] = useState <ValidationResult>({ isValid: true, errors: [], warnings: [] })
  const [isEditing, setIsEditing] = useState(false)
  const [customContent, setCustomContent] = useState<{ moves: unknown[], items: unknown[], spells: unknown[] }>({
    moves: [],
    items: [],
    spells: [],
  })
  const [showImportExport, setShowImportExport] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [importResult, setImportResult] = useState <unknown>(null)
  const [exportData, setExportData] = useState <string>('')

  const schema = getSchema(contentType)

  useEffect(() => {
    // Initialize form data with default values
    const defaultData: FormData = {}
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue
      }
    }
    setFormData(defaultData)
  }, [contentType])

  // Load custom content from localStorage on mount
  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('customContent')
      if (savedContent) {
        const parsed = JSON.parse(savedContent)
        setCustomContent(parsed)
      }
    }
    catch {
    }
  }, [])

  useEffect(() => {
    // Validate form data when it changes
    if (Object.keys(formData).length > 0) {
      const result = contentValidationService.validateContent(formData, contentType)
      setValidationResult(result)
    }
  }, [formData, contentType])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSave = () => {
    const result = contentValidationService.validateContent(formData, contentType)
    setValidationResult(result)

    if (result.isValid) {
      const newContent = { ...formData }

      setCustomContent((prev) => {
        const updated = {
          ...prev,
          [`${contentType}s`]: [...prev[`${contentType}s` as keyof typeof prev], newContent],
        }

        // Save to localStorage
        localStorage.setItem('customContent', JSON.stringify(updated))

        return updated
      })

      // Refresh move index if this is a move
      if (contentType === 'move') {
        moveIndexService.refreshCustomContent()
      }

      // Reset form
      const defaultData: FormData = {}
      for (const field of schema.fields) {
        if (field.defaultValue !== undefined) {
          defaultData[field.name] = field.defaultValue
        }
      }
      setFormData(defaultData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    const defaultData: FormData = {}
    for (const field of schema.fields) {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue
      }
    }
    setFormData(defaultData)
    setIsEditing(false)
  }

  const handleExport = () => {
    const contentList = customContent[`${contentType}s` as keyof typeof customContent] as string[]
    const exportJson = contentImportExportService.exportContent(contentList, contentType, {
      name: `Custom ${contentType}s`,
      description: `Exported ${contentType}s from Content Studio`,
      author: 'User',
      tags: [contentType, 'custom'],
    })
    setExportData(exportJson)
    setShowImportExport(true)
  }

  const handleImport = (jsonData: string) => {
    const contentList = customContent[`${contentType}s` as keyof typeof customContent] as string[]
    const result = contentImportExportService.importContent(jsonData, contentList)
    setImportResult(result)

    if (result.success && result.content) {
      setCustomContent((prev) => {
        const updated = {
          ...prev,
          [`${contentType}s`]: [...prev[`${contentType}s` as keyof typeof prev], ...result.content!],
        }

        // Save to localStorage
        localStorage.setItem('customContent', JSON.stringify(updated))

        return updated
      })

      // Refresh move index if this is a move
      if (contentType === 'move') {
        moveIndexService.refreshCustomContent()
      }
    }
  }

  const handleTemplateSelect = (template: ContentTemplate) => {
    const templateContent = contentImportExportService.createFromTemplate(template.id)
    setFormData(templateContent)
    setIsEditing(true)
    setShowTemplates(false)
  }

  const renderField = (field: any) => {
    const value = formData[field.name] || ''
    const fieldErrors = validationResult.errors.filter(e => e.field === field.name)
    const fieldWarnings = validationResult.warnings.filter(w => w.field === field.name)

    // Check field dependency
    const isFieldVisible = checkFieldDependency(field, formData)
    if (!isFieldVisible)
      return null

    switch (field.type) {
      case 'string':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.name}
              type="text"
              value={value}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              className={`field-input ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error?.message || 'Unknown error'}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-error">{warning.message}</div>
            ))}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.name}
              value={value}
              onChange={e => handleFieldChange(field.name, e.target.value)}
              className={`field-textarea ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
              rows={4}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error?.message || 'Unknown error'}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-error">{warning.message}</div>
            ))}
          </div>
        )

      case 'number':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              id={field.name}
              type="number"
              value={value}
              onChange={e => handleFieldChange(field.name, Number.parseInt(e.target.value) || 0)}
              className={`field-input ${fieldErrors.length > 0 ? 'error' : ''}`}
              placeholder={field.description}
            />
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error?.message || 'Unknown error'}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-error">{warning.message}</div>
            ))}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <Select value={String(value)} onValueChange={(v) => handleFieldChange(field.name, v)}>
              <SelectTrigger className={`field-select ${fieldErrors.length > 0 ? 'error' : ''}`}>
                <SelectValue placeholder={field.placeholder || 'Select option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any, index: number) => (
                  <SelectItem key={index} value={String(option.value)}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error?.message || 'Unknown error'}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-error">{warning.message}</div>
            ))}
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.name} className="form-field">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="multiselect-container">
              {field.options?.map((option: any) => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : []
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value)
                      handleFieldChange(field.name, newValues)
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {field.description && <div className="field-description">{field.description}</div>}
            {fieldErrors.map((error, index) => (
              <div key={index} className="field-error">{error?.message || 'Unknown error'}</div>
            ))}
            {fieldWarnings.map((warning, index) => (
              <div key={index} className="field-error">{warning.message}</div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const renderContentList = () => {
    const contentList = customContent[`${contentType}s` as keyof typeof customContent] as any[]

    if (contentList.length === 0) {
      return (
        <motion.div className="empty-state" variants={itemFadeIn}>
          No custom
          {contentType}
          s created yet.
        </motion.div>
      )
    }

    return (
      <motion.div className="content-list" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {contentList.map((item, index) => (
          <motion.div key={index} className="content-item" variants={itemFadeIn}>
            <div className="content-item-header">
              <h4>{item.name}</h4>
              <div className="content-item-actions">
                <motion.button onClick={() => { setFormData(item); setIsEditing(true) }} whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  Edit
                </motion.button>
                <motion.button onClick={() => {
                  setCustomContent(prev => ({
                    ...prev,
                    [`${contentType}s`]: (prev[`${contentType}s` as keyof typeof prev] as any[]).filter((_, i) => i !== index),
                  }))
                }} whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  Delete
                </motion.button>
              </div>
            </div>
            <p className="content-item-description">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  const prefersReduced = useReducedMotion()
  return (
    <motion.div className="content-studio-panel" initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={getVariant('fade')}>
      <Card className="panel-header">
        <CardHeader>
          <CardTitle>Content Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <p> Create and edit custom moves, items, and spells</p>
        </CardContent>
      </Card>

      <Card className="panel-content">
        <CardContent>
        <div className="content-type-selector">
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button variant={contentType === 'move' ? 'default' : 'secondary'} size="sm" onClick={() => setContentType('move')}>Moves</Button>
          </motion.div>
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button variant={contentType === 'item' ? 'default' : 'secondary'} size="sm" onClick={() => setContentType('item')}>Items</Button>
          </motion.div>
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button variant={contentType === 'spell' ? 'default' : 'secondary'} size="sm" onClick={() => setContentType('spell')}>Spells</Button>
          </motion.div>
        </div>

        <div className="studio-layout">
          <Card className="form-section">
            <div className="form-header">
              <h2>
                {isEditing ? 'Edit' : 'Create'}
                {' '}
                {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </h2>
              <div className="form-actions">
                {!isEditing && (
                  <>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Button className="template-button" onClick={() => setShowTemplates(true)}>Templates</Button>
                    </motion.div>
                    <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                      <Button className="new-button" onClick={() => setIsEditing(true)}>New {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <form className="content-form">
                {schema.fields.map(renderField)}

                <div className="form-actions">
                  <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                    <Button type="button" onClick={handleSave} disabled={!validationResult.isValid} className="save-button">
                      Save {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                    <Button type="button" variant="secondary" onClick={handleCancel} className="cancel-button">Cancel</Button>
                  </motion.div>
                </div>

                {validationResult.errors.length > 0 && (
                  <motion.div className="validation-errors" variants={itemFadeIn}>
                    <h4> Errors:</h4>
                    {validationResult.errors.map((item, index) => (
                      <div key={index} className="error-message">{error?.message || 'Unknown error'}</div>
                    ))}
                  </motion.div>
                )}

                {validationResult.warnings.length > 0 && (
                  <motion.div className="validation-warnings" variants={itemFadeIn}>
                    <h4> Warnings:</h4>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="field-error">{warning.message}</div>
                    ))}
                  </motion.div>
                )}
              </form>
            )}
          </Card>

          <Card className="content-section">
            <div className="content-header">
              <h2>
                {' '}
                Your Custom
                {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                s
              </h2>
              <div className="content-actions">
                <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                  <Button className="import-button" onClick={() => { setExportData(''); setShowImportExport(true) }}>Import / Export</Button>
                </motion.div>
              </div>
            </div>
            {renderContentList()}
          </Card>
        </div>
      </CardContent>
      </Card>

      {/* Templates Dialog */}
      {showTemplates && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) setShowTemplates(false) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Template</DialogTitle>
            </DialogHeader>
            <motion.div className="templates-grid" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
              {contentImportExportService.getTemplates(contentType).map(template => (
                <motion.div key={template.id} variants={itemFadeIn}>
                  <Card className="template-card" onClick={() => handleTemplateSelect(template)}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{template.description}</p>
                      <div className="template-tags">
                        {template.tags?.map(tag => (
                          <span key={tag} className="template-tag">{tag}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}

      {/* Import / Export Dialog */}
      {showImportExport && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) setShowImportExport(false) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import / Export {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</DialogTitle>
            </DialogHeader>
            <div className="import-export-tabs">
              <div className="tab-content">
                <motion.div className="export-section" variants={itemFadeIn}>
                  <h4>Export {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h4>
                  <p>Copy the JSON below to export your custom {contentType}s:</p>
                  <textarea className="export-textarea" value={exportData} readOnly rows={10} aria-label="Export JSON data" title="Export JSON data" />
                  <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
                    <Button className="copy-button" onClick={() => navigator.clipboard.writeText(exportData)}>Copy to Clipboard</Button>
                  </motion.div>
                </motion.div>

                <motion.div className="import-section" variants={itemFadeIn}>
                  <h4>Import {contentType.charAt(0).toUpperCase() + contentType.slice(1)}s</h4>
                  <p>Paste JSON data to import {contentType}s:</p>
                  <textarea className="import-textarea" placeholder="Paste JSON data here..." rows={10} aria-label="Import JSON data" title="Import JSON data" onChange={(e) => { if ((e.target as HTMLTextAreaElement).value.trim()) { handleImport((e.target as HTMLTextAreaElement).value) } }} />
                  {importResult && (
                    <div className={`import-result ${(importResult as any).success ? 'success' : 'error'}`}>
                      <h5>Import Result:</h5>
                      <p>Imported: {(importResult as any).imported} items</p>
                      {(importResult as any).errors.length > 0 && (
                        <div className="import-errors">
                          <h6>Errors:</h6>
                          <ul>
                            {(importResult as any).errors.map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(importResult as any).warnings.length > 0 && (
                        <div className="import-warnings">
                          <h6>Warnings:</h6>
                          <ul>
                            {(importResult as any).warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}

// Export the panel instance for registration
export const ContentStudioPanelInstance: Panel = {
  metadata: {
    id: 'content-studio',
    name: 'Content Studio',
    icon: '🎨',
    description: 'Create and edit custom moves, items, and spells',
    priority: 50,
  },
  component: ContentStudioPanel,
}

export default ContentStudioPanel
