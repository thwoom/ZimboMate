import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Select from '@radix-ui/react-select'
import * as Switch from '@radix-ui/react-switch'
import { motion } from 'framer-motion'
import { Archive, Calendar, Clock, Download, RotateCcw, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'
import { BackupFrequency, formatDateTime, formatFileSize, mockFileManagement } from '../../fileManagementMockData'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

interface BackupPanelProps {
  onBackup: (options: any) => void
  onRestore: (backupId: string) => void
  operationInProgress: boolean
}

export const BackupPanel: React.FC<BackupPanelProps> = ({
  onBackup,
  onRestore,
  operationInProgress,
}) => {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState<BackupFrequency>(BackupFrequency.DAILY)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  const frequencyOptions = [
    { value: BackupFrequency.DAILY, label: 'Daily', description: 'Backup every day at 3:00 AM' },
    { value: BackupFrequency.WEEKLY, label: 'Weekly', description: 'Backup every Sunday at 3:00 AM' },
    { value: BackupFrequency.MONTHLY, label: 'Monthly', description: 'Backup on the 1st of each month' },
    { value: BackupFrequency.NEVER, label: 'Never', description: 'Disable automatic backups' },
  ]

  const handleCreateBackup = () => {
    onBackup({
      type: 'manual',
      includeAll: true,
      timestamp: new Date().toISOString(),
    })
  }

  const handleRestore = () => {
    if (selectedBackup) {
      onRestore(selectedBackup)
      setShowRestoreDialog(false)
      setSelectedBackup(null)
    }
  }

  const getBackupTypeIcon = (isAutomatic: boolean) => {
    return isAutomatic ? <Clock size={16} /> : <Archive size={16} />
  }

  const getBackupTypeBadge = (isAutomatic: boolean) => {
    return isAutomatic
      ? (
          <Badge variant="secondary">Auto</Badge>
        )
      : (
          <Badge variant="outline">Manual</Badge>
        )
  }

  return (
    <div className="space-y-6">
      {/* Backup Settings */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={20} />
            Backup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Auto Backup Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Automatic Backups</h4>
                <p
                  className="text-sm text-muted-foreground"
                >
                  Automatically create backups of your data
                </p>
              </div>
              <Switch.Root
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                className="w-11 h-6 rounded-full relative"
                style={{
                  backgroundColor: autoBackup ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <Switch.Thumb
                  className="block w-5 h-5 bg-card rounded-full transition-transform duration-100 translate-x-0.5"
                  style={{
                    transform: autoBackup ? 'translateX(18px)' : 'translateX(2px)',
                  }}
                />
              </Switch.Root>
            </div>

            {/* Backup Frequency */}
            {autoBackup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Backup Frequency</label>
                  <Select.Root
                    value={backupFrequency}
                    onValueChange={value => setBackupFrequency(value as BackupFrequency)}
                  >
                    <Select.Trigger
                      className="w-full p-3 border rounded-lg flex items-center justify-between"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)',
                      }}
                    >
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content
                      className="bg-surface border border-border rounded-lg shadow-lg z-50 bg-card"
                    >
                      {frequencyOptions.map(option => (
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          className="p-3 hover:bg-surface-elevated cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div
                              className="text-sm text-muted-foreground"
                            >
                              {option.description}
                            </div>
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </div>
              </motion.div>
            )}

            {/* Manual Backup */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Manual Backup</h4>
                  <p
                    className="text-sm text-muted-foreground"
                  >
                    Create a backup right now
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={handleCreateBackup}
                  disabled={operationInProgress}
                  className="gap-2"
                >
                  <Archive size={16} />
                  {operationInProgress ? 'Creating...' : 'Create Backup'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Backup History
            </CardTitle>
            <Badge variant="secondary">
              {mockFileManagement.backupHistory.length}
              {' '}
              backups
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFileManagement.backupHistory.map(backup => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="file-item-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getBackupTypeIcon(backup.isAutomatic)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{backup.name}</p>
                        {getBackupTypeBadge(backup.isAutomatic)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(backup.size)}</span>
                        <span>{formatDateTime(backup.created)}</span>
                        <span>
                          Contains:
                          {backup.contains.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download size={14} />
                      Download
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup.id)
                        setShowRestoreDialog(true)
                      }}
                      className="gap-2"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="surface">
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-chart-2/20">
              <ShieldCheck className="text-chart-2" size={24} />
            </div>
            <h3 className="font-medium mb-1">Total Backups</h3>
            <p className="text-2xl font-bold text-primary">
              {mockFileManagement.backupHistory.length}
            </p>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-primary/20">
              <Archive className="text-primary" size={24} />
            </div>
            <h3 className="font-medium mb-1">Total Size</h3>
            <p className="text-2xl font-bold text-primary">
              {formatFileSize(mockFileManagement.backupHistory.reduce((sum, backup) => sum + backup.size, 0))}
            </p>
          </CardContent>
        </Card>

        <Card variant="surface">
          <CardContent className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-chart-4/20">
              <Clock className="text-chart-4" size={24} />
            </div>
            <h3 className="font-medium mb-1">Last Backup</h3>
            <p className="text-sm font-medium text-primary">
              {mockFileManagement.backupHistory[0]?.created.toLocaleDateString() || 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog.Root open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <AlertDialog.Content
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-lg shadow-lg z-50 bg-card"
          >
            <AlertDialog.Title className="text-lg font-medium mb-2">
              Confirm Restore
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm mb-4 text-muted-foreground">
              Are you sure you want to restore from this backup? This will replace your current data.
            </AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleRestore}>
                  Restore Backup
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
