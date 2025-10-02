import * as ContextMenu from '@radix-ui/react-context-menu'
import * as Dialog from '@radix-ui/react-dialog'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Select from '@radix-ui/react-select'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpDown, CircleCheck, Copy, Edit, Eye, Filter, MoreHorizontal, Trash2, TriangleAlert } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { FileOperation, FileType, formatDateTime, formatFileSize, mockFileManagement } from '../../fileManagementMockData'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'

interface FileBrowserPanelProps {
  onFileOperation: (operation: FileOperation, data: any) => void
  operationInProgress: FileOperation | null
}

type SortBy = 'name' | 'date' | 'size' | 'type'
type SortOrder = 'asc' | 'desc'

export const FileBrowserPanel: React.FC<FileBrowserPanelProps> = ({
  onFileOperation,
  operationInProgress,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FileType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [previewFile, setPreviewFile] = useState<any>(null)

  const files = mockFileManagement.recentFiles

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || file.type === filterType
      return matchesSearch && matchesType
    })

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'date':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [files, searchQuery, filterType, sortBy, sortOrder])

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId],
    )
  }

  const selectAllFiles = () => {
    setSelectedFiles(filteredAndSortedFiles.map(f => f.id))
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  const handleFileOperation = (operation: FileOperation, fileId: string) => {
    onFileOperation(operation, fileId)
  }

  const getFileTypeIcon = (type: FileType) => {
    switch (type) {
      case FileType.CHARACTER:
        return '👤'
      case FileType.CAMPAIGN:
        return '🗺️'
      case FileType.NOTES:
        return '📝'
      case FileType.SETTINGS:
        return '⚙️'
      case FileType.BACKUP:
        return '💾'
      default:
        return '📄'
    }
  }

  const getValidationIcon = (isValid: boolean) => {
    return isValid
      ? (
          <CircleCheck size={16} className="text-chart-2" />
        )
      : (
          <TriangleAlert size={16} className="text-destructive" />
        )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card variant="default">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filter by Type */}
            <Select.Root value={filterType} onValueChange={value => setFilterType(value as FileType | 'all')}>
              <Select.Trigger
                className="w-48 p-2 border rounded-lg flex items-center justify-between"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <Select.Value />
                </div>
              </Select.Trigger>
              <Select.Content
                className="bg-surface border border-border rounded-lg shadow-lg z-50 bg-card"
              >
                <Select.Item value="all" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  All Files
                </Select.Item>
                <Select.Item value={FileType.CHARACTER} className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Characters
                </Select.Item>
                <Select.Item value={FileType.CAMPAIGN} className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Campaigns
                </Select.Item>
                <Select.Item value={FileType.NOTES} className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Notes
                </Select.Item>
                <Select.Item value={FileType.SETTINGS} className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Settings
                </Select.Item>
              </Select.Content>
            </Select.Root>

            {/* Sort */}
            <Select.Root
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [SortBy, SortOrder]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
            >
              <Select.Trigger
                className="w-48 p-2 border rounded-lg flex items-center justify-between"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} />
                  <Select.Value />
                </div>
              </Select.Trigger>
              <Select.Content
                className="bg-surface border border-border rounded-lg shadow-lg z-50 bg-card"
              >
                <Select.Item value="name-asc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Name (A-Z)
                </Select.Item>
                <Select.Item value="name-desc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Name (Z-A)
                </Select.Item>
                <Select.Item value="date-desc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Date (Newest)
                </Select.Item>
                <Select.Item value="date-asc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Date (Oldest)
                </Select.Item>
                <Select.Item value="size-desc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Size (Largest)
                </Select.Item>
                <Select.Item value="size-asc" className="p-2 hover:bg-surface-elevated cursor-pointer">
                  Size (Smallest)
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </CardContent>
      </Card>

      {/* File List Header */}
      {selectedFiles.length > 0 && (
        <Card variant="magical">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="primary">
                  {selectedFiles.length}
                  {' '}
                  selected
                </Badge>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileOperation(FileOperation.EXPORT, selectedFiles)}
                  disabled={!!operationInProgress}
                >
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleFileOperation(FileOperation.DELETE, selectedFiles)}
                  disabled={!!operationInProgress}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Files (
              {filteredAndSortedFiles.length}
              )
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectedFiles.length === filteredAndSortedFiles.length ? clearSelection : selectAllFiles}
              >
                {selectedFiles.length === filteredAndSortedFiles.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea.Root className="h-96">
            <ScrollArea.Viewport className="w-full h-full">
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredAndSortedFiles.map((file) => {
                    const isSelected = selectedFiles.includes(file.id)

                    return (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <ContextMenu.Root>
                          <ContextMenu.Trigger>
                            <div
                              className={`
                                file-item-card p-4 cursor-pointer transition-all duration-200
                                ${isSelected ? 'ring-2 ring-primary' : ''}
                              `}
                              style={{
                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                                borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                              }}
                              onClick={() => toggleFileSelection(file.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="text-2xl">{getFileTypeIcon(file.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium truncate">{file.name}</p>
                                      {getValidationIcon(file.isValid)}
                                      <Badge variant="outline">{file.type}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span>{formatFileSize(file.size)}</span>
                                      <span>{formatDateTime(file.lastModified)}</span>
                                      <span className="truncate">{file.path}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPreviewFile(file)
                                    }}
                                  >
                                    <Eye size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </ContextMenu.Trigger>
                          <ContextMenu.Portal>
                            <ContextMenu.Content
                              className="bg-surface border border-border rounded-lg shadow-lg p-1 z-50 bg-card"
                            >
                              <ContextMenu.Item
                                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-elevated cursor-pointer rounded"
                                onClick={() => setPreviewFile(file)}
                              >
                                <Eye size={16} />
                                Preview
                              </ContextMenu.Item>
                              <ContextMenu.Item
                                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-elevated cursor-pointer rounded"
                                onClick={() => handleFileOperation(FileOperation.RENAME, file.id)}
                              >
                                <Edit size={16} />
                                Rename
                              </ContextMenu.Item>
                              <ContextMenu.Item
                                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-elevated cursor-pointer rounded"
                                onClick={() => handleFileOperation(FileOperation.DUPLICATE, file.id)}
                              >
                                <Copy size={16} />
                                Duplicate
                              </ContextMenu.Item>
                              <ContextMenu.Separator className="my-1 h-px bg-border" />
                              <ContextMenu.Item
                                className="flex items-center gap-2 px-3 py-2 hover:bg-destructive/15 text-destructive cursor-pointer rounded"
                                onClick={() => handleFileOperation(FileOperation.DELETE, file.id)}
                              >
                                <Trash2 size={16} />
                                Delete
                              </ContextMenu.Item>
                            </ContextMenu.Content>
                          </ContextMenu.Portal>
                        </ContextMenu.Root>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar orientation="vertical">
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog.Root open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] p-6 rounded-lg shadow-lg z-50 overflow-auto bg-card"
          >
            {previewFile && (
              <>
                <Dialog.Title className="text-lg font-medium mb-4">
                  File Preview:
                  {' '}
                  {previewFile.name}
                </Dialog.Title>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      {' '}
                      {previewFile.type}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      {' '}
                      {formatFileSize(previewFile.size)}
                    </div>
                    <div>
                      <span className="font-medium">Modified:</span>
                      {' '}
                      {formatDateTime(previewFile.lastModified)}
                    </div>
                    <div>
                      <span className="font-medium">Valid:</span>
                      {' '}
                      {previewFile.isValid ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-lg font-mono text-sm bg-popover"
                  >
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify({
                        name: previewFile.name,
                        type: previewFile.type,
                        size: previewFile.size,
                        path: previewFile.path,
                        lastModified: previewFile.lastModified,
                        // Mock preview content
                        content: '// File preview content would appear here...',
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <Button variant="outline" className="mt-4">
                    Close
                  </Button>
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
