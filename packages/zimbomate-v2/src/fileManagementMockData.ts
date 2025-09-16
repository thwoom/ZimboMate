// Mock data for file management system

// File management enums
export enum FileType {
  CHARACTER = 'character',
  CAMPAIGN = 'campaign', 
  NOTES = 'notes',
  SETTINGS = 'settings',
  BACKUP = 'backup',
  UNKNOWN = 'unknown'
}

export enum FileFormat {
  JSON = 'json',
  CSV = 'csv', 
  XML = 'xml',
  ZIP = 'zip'
}

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  IMPORTING = 'importing',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PDF = 'pdf'
}

export enum BackupFrequency {
  NEVER = 'never',
  DAILY = 'daily',
  WEEKLY = 'weekly', 
  MONTHLY = 'monthly'
}

export enum ValidationResult {
  VALID = 'valid',
  INVALID = 'invalid',
  WARNING = 'warning',
  CORRUPTED = 'corrupted'
}

export enum FileOperation {
  IMPORT = 'import',
  EXPORT = 'export',
  BACKUP = 'backup',
  RESTORE = 'restore',
  DELETE = 'delete',
  RENAME = 'rename',
  DUPLICATE = 'duplicate'
}

// String formatters for file management system
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

export const formatFileType = (type: FileType): string => {
  switch (type) {
    case FileType.CHARACTER:
      return 'Character Data'
    case FileType.CAMPAIGN:
      return 'Campaign Data'
    case FileType.NOTES:
      return 'Session Notes'
    case FileType.SETTINGS:
      return 'Application Settings'
    case FileType.BACKUP:
      return 'Backup Archive'
    default:
      return 'Unknown File'
  }
}

export const formatValidationResult = (result: ValidationResult): string => {
  switch (result) {
    case ValidationResult.VALID:
      return 'Valid'
    case ValidationResult.INVALID:
      return 'Invalid Format'
    case ValidationResult.WARNING:
      return 'Has Warnings'
    case ValidationResult.CORRUPTED:
      return 'File Corrupted'
    default:
      return 'Unknown'
  }
}

export const formatBackupFrequency = (frequency: BackupFrequency): string => {
  switch (frequency) {
    case BackupFrequency.DAILY:
      return 'Daily Backups'
    case BackupFrequency.WEEKLY:
      return 'Weekly Backups'
    case BackupFrequency.MONTHLY:
      return 'Monthly Backups'
    case BackupFrequency.NEVER:
      return 'No Automatic Backups'
    default:
      return 'Unknown Schedule'
  }
}

// Mock data for file management system
export const mockFileManagement = {
  recentFiles: [
    {
      id: 'file-1',
      name: 'Eldara_Moonwhisper.json',
      type: 'character' as const,
      format: 'json' as const,
      size: 15420,
      lastModified: new Date('2024-12-18T14:30:00Z'),
      path: '/characters/Eldara_Moonwhisper.json',
      isValid: true
    },
    {
      id: 'file-2', 
      name: 'Shadowmere_Campaign.json',
      type: 'campaign' as const,
      format: 'json' as const,
      size: 89340,
      lastModified: new Date('2024-12-17T19:45:00Z'),
      path: '/campaigns/Shadowmere_Campaign.json',
      isValid: true
    },
    {
      id: 'file-3',
      name: 'Session_Notes_Dec_15.json',
      type: 'notes' as const,
      format: 'json' as const,
      size: 5680,
      lastModified: new Date('2024-12-15T21:15:00Z'),
      path: '/notes/Session_Notes_Dec_15.json',
      isValid: true
    }
  ],
  backupHistory: [
    {
      id: 'backup-1',
      name: 'Auto_Backup_2024-12-19.zip',
      type: 'backup' as const,
      size: 245600,
      created: new Date('2024-12-19T03:00:00Z'),
      isAutomatic: true,
      contains: ['characters', 'campaigns', 'settings']
    },
    {
      id: 'backup-2',
      name: 'Manual_Backup_2024-12-18.zip', 
      type: 'backup' as const,
      size: 198340,
      created: new Date('2024-12-18T16:20:00Z'),
      isAutomatic: false,
      contains: ['characters', 'campaigns']
    }
  ],
  importQueue: [
    {
      id: 'import-1',
      fileName: 'New_Character.json',
      status: 'validating' as const,
      progress: 45,
      type: 'character' as const,
      size: 12800
    },
    {
      id: 'import-2',
      fileName: 'Campaign_Export.csv',
      status: 'pending' as const,
      progress: 0,
      type: 'campaign' as const,
      size: 34560
    }
  ]
}

export const mockRootProps = {
  currentUser: {
    id: 'user-1',
    preferences: {
      autoBackup: true,
      backupFrequency: 'daily' as const,
      exportFormat: 'json' as const,
      validateOnImport: true
    }
  },
  fileSystemAccess: true,
  maxFileSize: 10485760, // 10MB
  supportedFormats: ['json', 'csv', 'xml', 'zip']
}