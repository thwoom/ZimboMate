/**
 * Character export / import service for sharing and backup
 */

import type { Character } from '../models/Character'
import type { CharacterTemplate } from './CharacterTemplateService'

export interface ExportData {
  version: string
  type: 'character' | 'template'
  data: Character | CharacterTemplate
  metadata: {
    exportedAt: Date
    exportedBy: string
    appVersion: string
  }
}

export interface ImportResult {
  success: boolean
  data?: Character | CharacterTemplate
  error?: string
  warnings?: string[]
}

class CharacterExportImportService {
  private readonly CURRENT_VERSION = '1.0'
  private readonly APP_VERSION = '1.0.0'

  /**
   * Export a character to JSON
   */
  exportCharacter(character: Character): string {
    const exportData: ExportData = {
      version: this.CURRENT_VERSION,
      type: 'character',
      data: character,
      metadata: {
        exportedAt: new Date(),
        exportedBy: 'ZimboMate',
        appVersion: this.APP_VERSION,
      },
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export a character template to JSON
   */
  exportTemplate(template: CharacterTemplate): string {
    const exportData: ExportData = {
      version: this.CURRENT_VERSION,
      type: 'template',
      data: template,
      metadata: {
        exportedAt: new Date(),
        exportedBy: 'ZimboMate',
        appVersion: this.APP_VERSION,
      },
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import character or template from JSON
   */
  importFromJson(jsonString: string): ImportResult {
    try {
      const parsed = JSON.parse(jsonString)

      // Validate basic structure
      if (!parsed.version || !parsed.type || !parsed.data) {
        return {
          success: false,
          error: 'Invalid export format: missing required fields',
        }
      }

      // Version compatibility check
      if (parsed.version !== this.CURRENT_VERSION) {
        return {
          success: false,
          error: `Unsupported version: ${parsed.version}. Expected: ${this.CURRENT_VERSION}`,
        }
      }

      // Type-specific validation
      if (parsed.type === 'character') {
        const character = this.validateCharacterData(parsed.data)
        if (!character.isValid) {
          return {
            success: false,
            error: `Invalid character data: ${character.errors.join(', ')}`,
          }
        }

        return {
          success: true,
          data: parsed.data as Character,
          warnings: character.warnings,
        }
      }
      else if (parsed.type === 'template') {
        const template = this.validateTemplateData(parsed.data)
        if (!template.isValid) {
          return {
            success: false,
            error: `Invalid template data: ${template.errors.join(', ')}`,
          }
        }

        return {
          success: true,
          data: parsed.data as CharacterTemplate,
          warnings: template.warnings,
        }
      }
      else {
        return {
          success: false,
          error: `Unknown export type: ${parsed.type}`,
        }
      }
    }
    catch {
      return {
        success: false,
        error: `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Download character as file
   */
  downloadCharacter(character: Character): void {
    const json = this.exportCharacter(character)
    const filename = `${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}character.json`
    this.downloadFile(json, filename)
  }

  /**
   * Download template as file
   */
  downloadTemplate(template: CharacterTemplate): void {
    const json = this.exportTemplate(template)
    const filename = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}template.json`
    this.downloadFile(json, filename)
  }

  /**
   * Create shareable URL for character
   */
  createShareableUrl(character: Character): string {
    const json = this.exportCharacter(character)
    const compressed = this.compressData(json)
    const baseUrl = window.location.origin + window.location.pathname
    return `${baseUrl}?import=${encodeURIComponent(compressed)}`
  }

  /**
   * Import from URL parameter
   */
  importFromUrl(): ImportResult | null {
    const urlParams = new URLSearchParams(window.location.search)
    const importData = urlParams.get('import')

    if (!importData) {
      return null
    }

    try {
      const decompressed = this.decompressData(decodeURIComponent(importData))
      return this.importFromJson(decompressed)
    }
    catch {
      return {
        success: false,
        error: `Failed to import from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Export multiple characters as a campaign file
   */
  exportCampaign(characters: Character[], campaignName: string): string {
    const exportData = {
      version: this.CURRENT_VERSION,
      type: 'campaign',
      name: campaignName,
      characters,
      metadata: {
        exportedAt: new Date(),
        exportedBy: 'ZimboMate',
        appVersion: this.APP_VERSION,
        characterCount: characters.length,
      },
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Download campaign file
   */
  downloadCampaign(characters: Character[], campaignName: string): void {
    const json = this.exportCampaign(characters, campaignName)
    const filename = `${campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}campaign.json`
    this.downloadFile(json, filename)
  }

  /**
   * Validate character data structure
   */
  private validateCharacterData(data: any): { isValid: boolean, errors: string[], warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!data.id)
      errors.push('Missing character ID')
    if (!data.name)
      errors.push('Missing character name')
    if (!data.class)
      errors.push('Missing character class')
    if (!data.race)
      errors.push('Missing character race')
    if (!data.attributes)
      errors.push('Missing character attributes')
    if (!data.level)
      errors.push('Missing character level')

    // Validate attributes structure
    if (data.attributes) {
      const requiredAttrs = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
      for (const attr of requiredAttrs) {
        if (typeof data.attributes[attr] !== 'number') {
          errors.push(`Invalid ${attr} attribute`)
        }
      }
    }

    // Validate level
    if (data.level && (typeof data.level !== 'number' || data.level < 1 || data.level > 10)) {
      errors.push('Invalid character level (must be 1-10)')
    }

    // Warnings for missing optional data
    if (!data.inventory || data.inventory.length === 0) {
      warnings.push('Character has no equipment')
    }
    if (!data.knownMoves || data.knownMoves.length === 0) {
      warnings.push('Character has no moves')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate template data structure
   */
  private validateTemplateData(data: any): { isValid: boolean, errors: string[], warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!data.id)
      errors.push('Missing template ID')
    if (!data.name)
      errors.push('Missing template name')
    if (!data.characterClass)
      errors.push('Missing character class')
    if (!data.race)
      errors.push('Missing character race')
    if (!data.attributes)
      errors.push('Missing attributes')

    // Validate attributes
    if (data.attributes) {
      const requiredAttrs = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
      for (const attr of requiredAttrs) {
        if (typeof data.attributes[attr] !== 'number') {
          errors.push(`Invalid ${attr} attribute`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application / json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Compress data for URL sharing (simple base64 for now)
   */
  private compressData(data: string): string {
    return btoa(data)
  }

  /**
   * Decompress data from URL
   */
  private decompressData(compressed: string): string {
    return atob(compressed)
  }

  /**
   * Generate QR code for sharing (returns data URL)
   */
  generateQRCode(character: Character): string {
    const shareUrl = this.createShareableUrl(character)
    // In a real implementation, you'd use a QR code library
    // For now, return a placeholder
    return `https://api.qrserver.com / v1 / create-qr - code/?size = 200x200 & data=${encodeURIComponent(shareUrl)}`
  }

  /**
   * Copy character data to clipboard
   */
  async copyToClipboard(character: Character): Promise <boolean> {
    try {
      const json = this.exportCharacter(character)
      await navigator.clipboard.writeText(json)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * Import from clipboard
   */
  async importFromClipboard(): Promise <ImportResult> {
    try {
      const text = await navigator.clipboard.readText()
      return this.importFromJson(text)
    }
    catch {
      return {
        success: false,
        error: `Failed to read from clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

export const characterExportImportService = new CharacterExportImportService()
