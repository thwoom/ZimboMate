import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { FileUp, Download, ShieldCheck, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { ImportPanel } from './ImportPanel'
import { ExportPanel } from './ExportPanel'
import { BackupPanel } from './BackupPanel'
import { FileBrowserPanel } from './FileBrowserPanel'
import { FileType, FileOperation } from '../../fileManagementMockData'

interface FileManagementPanelProps {
  onFileOperation?: (operation: FileOperation, data: any) => void
  onClose?: () => void
}

export const FileManagementPanel: React.FC<FileManagementPanelProps> = ({
  onFileOperation,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('import')
  const [operationInProgress, setOperationInProgress] = useState<FileOperation | null>(null)

  const handleFileOperation = useCallback((operation: FileOperation, data: any) => {
    setOperationInProgress(operation)
    onFileOperation?.(operation, data)
    
    // Simulate operation completion
    setTimeout(() => {
      setOperationInProgress(null)
    }, 2000)
  }, [onFileOperation])

  const tabs = [
    {
      id: 'import',
      label: 'Import Files',
      icon: FileUp,
      description: 'Upload and import character, campaign, and settings files'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      description: 'Export your data in various formats'
    },
    {
      id: 'backup',
      label: 'Backup & Restore',
      icon: ShieldCheck,
      description: 'Manage backups and restore data'
    },
    {
      id: 'browser',
      label: 'File Browser',
      icon: FolderOpen,
      description: 'Browse and manage your files'
    }
  ]

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'import':
        return (
          <ImportPanel
            onFileImport={(files) => handleFileOperation(FileOperation.IMPORT, files)}
            operationInProgress={operationInProgress === FileOperation.IMPORT}
          />
        )
      case 'export':
        return (
          <ExportPanel
            onExport={(data, format) => handleFileOperation(FileOperation.EXPORT, { data, format })}
            operationInProgress={operationInProgress === FileOperation.EXPORT}
          />
        )
      case 'backup':
        return (
          <BackupPanel
            onBackup={(options) => handleFileOperation(FileOperation.BACKUP, options)}
            onRestore={(backupId) => handleFileOperation(FileOperation.RESTORE, backupId)}
            operationInProgress={operationInProgress === FileOperation.BACKUP || operationInProgress === FileOperation.RESTORE}
          />
        )
      case 'browser':
        return (
          <FileBrowserPanel
            onFileOperation={handleFileOperation}
            operationInProgress={operationInProgress}
          />
        )
      default:
        return null
    }
  }

  return (
    <Card variant="magical" className="w-full max-w-6xl mx-auto">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <FolderOpen 
                  size={20} 
                  style={{ color: 'var(--color-primary)' }}
                />
              </motion.div>
              File Management
            </CardTitle>
            <p 
              className="text-sm mt-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Import, export, backup, and manage your ZimboMate data files
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <Tabs.List className="grid grid-cols-4 gap-2 mb-6">
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Tabs.Trigger
                    value={tab.id}
                    className={`
                      relative w-full p-4 rounded-lg border transition-all duration-200
                      flex flex-col items-center gap-2 text-center
                      hover:scale-105 hover:shadow-md
                      ${isActive 
                        ? 'border-primary bg-primary/10 shadow-md' 
                        : 'border-border bg-surface hover:bg-surface-elevated'
                      }
                    `}
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                      opacity: isActive ? 1 : 0.8,
                      color: isActive ? 'white' : 'var(--color-text-primary)'
                    }}
                  >
                    <Icon size={20} />
                    <div>
                      <div className="font-medium text-sm">{tab.label}</div>
                      <div 
                        className="text-xs mt-1 opacity-80"
                        style={{ 
                          color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' 
                        }}
                      >
                        {tab.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          opacity: 0.1
                        }}
                        layoutId="activeFileTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Tabs.Trigger>
                </motion.div>
              )
            })}
          </Tabs.List>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {tabs.map((tab) => (
              <Tabs.Content key={tab.id} value={tab.id}>
                <motion.div
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {renderTabContent()}
                </motion.div>
              </Tabs.Content>
            ))}
          </AnimatePresence>
        </Tabs.Root>
      </CardContent>
    </Card>
  )
}