import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp, Upload, X, CircleCheck, TriangleAlert, File } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Progress } from '../ui/Progress'
import { ImportStatus, FileType, formatFileSize, mockFileManagement } from '../../fileManagementMockData'

interface ImportFile {
  id: string
  file: File
  type: FileType
  status: ImportStatus
  progress: number
  error?: string
}

interface ImportPanelProps {
  onFileImport: (files: ImportFile[]) => void
  operationInProgress: boolean
}

export const ImportPanel: React.FC<ImportPanelProps> = ({
  onFileImport,
  operationInProgress
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [importFiles, setImportFiles] = useState<ImportFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectFileType = (file: File): FileType => {
    const name = file.name.toLowerCase()
    if (name.includes('character')) return FileType.CHARACTER
    if (name.includes('campaign')) return FileType.CAMPAIGN
    if (name.includes('notes') || name.includes('session')) return FileType.NOTES
    if (name.includes('settings') || name.includes('config')) return FileType.SETTINGS
    if (name.includes('backup')) return FileType.BACKUP
    return FileType.UNKNOWN
  }

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // File size validation (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'File size exceeds 10MB limit' }
    }

    // File type validation
    const allowedTypes = ['application/json', 'text/csv', 'application/xml', 'text/xml', 'application/zip']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      return { isValid: false, error: 'Unsupported file format' }
    }

    return { isValid: true }
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newImportFiles: ImportFile[] = []
    
    Array.from(files).forEach((file, index) => {
      const validation = validateFile(file)
      const importFile: ImportFile = {
        id: `import-${Date.now()}-${index}`,
        file,
        type: detectFileType(file),
        status: validation.isValid ? ImportStatus.PENDING : ImportStatus.ERROR,
        progress: 0,
        error: validation.error
      }
      newImportFiles.push(importFile)
    })

    setImportFiles(prev => [...prev, ...newImportFiles])
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = useCallback((fileId: string) => {
    setImportFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const startImport = useCallback(() => {
    const validFiles = importFiles.filter(f => f.status !== ImportStatus.ERROR)
    if (validFiles.length === 0) return

    // Simulate import process
    validFiles.forEach((file, index) => {
      setTimeout(() => {
        setImportFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: ImportStatus.VALIDATING, progress: 25 }
            : f
        ))
        
        setTimeout(() => {
          setImportFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, status: ImportStatus.IMPORTING, progress: 75 }
              : f
          ))
          
          setTimeout(() => {
            setImportFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { ...f, status: ImportStatus.SUCCESS, progress: 100 }
                : f
            ))
          }, 1000)
        }, 1000)
      }, index * 500)
    })

    onFileImport(validFiles)
  }, [importFiles, onFileImport])

  const clearCompleted = useCallback(() => {
    setImportFiles(prev => prev.filter(f => f.status !== ImportStatus.SUCCESS))
  }, [])

  const getStatusIcon = (status: ImportStatus) => {
    switch (status) {
      case ImportStatus.SUCCESS:
        return <CircleCheck size={16} className="text-green-500" />
      case ImportStatus.ERROR:
        return <TriangleAlert size={16} className="text-red-500" />
      case ImportStatus.VALIDATING:
      case ImportStatus.IMPORTING:
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <File size={16} className="text-gray-400" />
    }
  }

  const getStatusColor = (status: ImportStatus): string => {
    switch (status) {
      case ImportStatus.SUCCESS:
        return 'success'
      case ImportStatus.ERROR:
        return 'destructive'
      case ImportStatus.VALIDATING:
      case ImportStatus.IMPORTING:
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag and Drop Zone */}
      <Card 
        variant="glass" 
        className={`
          relative border-2 border-dashed transition-all duration-300 cursor-pointer
          ${dragActive ? 'file-dropzone scale-105' : 'hover:file-dropzone'}
        `}
        style={{
          borderColor: dragActive ? 'var(--color-success)' : 'var(--color-primary)',
          backgroundColor: dragActive ? 'var(--color-success-light)' : 'var(--color-surface)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="py-12 text-center">
          <motion.div
            animate={{ 
              scale: dragActive ? 1.1 : 1,
              rotate: dragActive ? 5 : 0 
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FileUp 
              size={48} 
              className="mx-auto mb-4"
              style={{ color: 'var(--color-primary)' }}
            />
          </motion.div>
          <h3 className="text-lg font-medium mb-2">
            {dragActive ? 'Drop files here' : 'Drop files here or click to browse'}
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Supported formats: JSON, CSV, XML, ZIP (Max 10MB per file)
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">Characters</Badge>
            <Badge variant="outline">Campaigns</Badge>
            <Badge variant="outline">Session Notes</Badge>
            <Badge variant="outline">Settings</Badge>
          </div>
        </CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.csv,.xml,.zip"
          onChange={handleFileInput}
          className="hidden"
        />
      </Card>

      {/* Import Queue */}
      {importFiles.length > 0 && (
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Import Queue ({importFiles.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  disabled={!importFiles.some(f => f.status === ImportStatus.SUCCESS)}
                >
                  Clear Completed
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={startImport}
                  disabled={operationInProgress || !importFiles.some(f => f.status === ImportStatus.PENDING)}
                >
                  Start Import
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {importFiles.map((importFile) => (
                  <motion.div
                    key={importFile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="file-item-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(importFile.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{importFile.file.name}</p>
                            <Badge variant={getStatusColor(importFile.status)}>
                              {importFile.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p 
                              className="text-sm"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {formatFileSize(importFile.file.size)} • {importFile.type}
                            </p>
                            {importFile.error && (
                              <p className="text-sm text-red-500">{importFile.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(importFile.status === ImportStatus.VALIDATING || importFile.status === ImportStatus.IMPORTING) && (
                          <div className="w-24">
                            <Progress 
                              value={importFile.progress} 
                              max={100} 
                              variant="default"
                            />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(importFile.id)}
                          disabled={importFile.status === ImportStatus.IMPORTING}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Imports */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFileManagement.recentFiles.slice(0, 3).map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                <div className="flex items-center gap-3">
                  <File size={16} style={{ color: 'var(--color-text-secondary)' }} />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {formatFileSize(file.size)} • {file.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="success">Imported</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}