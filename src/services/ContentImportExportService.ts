import { ContentType } from './ContentSchema';
import { contentValidationService } from './ContentValidationService';

export interface ContentExport {
  version: string;
  exportedAt: string;
  contentType: ContentType;
  content: unknown[];
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

export interface ContentImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  warnings: string[];
  content?: unknown[];
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  content: unknown;
  tags?: string[];
}

export class ContentImportExportService {
  private static instance: ContentImportExportService;
  private templates: ContentTemplate[] = [];

  static getInstance(): ContentImportExportService {
    if (!ContentImportExportService.instance) {
      ContentImportExportService.instance = new ContentImportExportService();
    }
    return ContentImportExportService.instance;
  }

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Export content as JSON
   */
  exportContent(content: unknown[], contentType: ContentType, metadata?: ContentExport['metadata']): string {
    const exportData: ContentExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      contentType,
      content,
      metadata,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import content from JSON
   */
  importContent(jsonData: string, existingContent: unknown[] = []): ContentImportResult {
    const result: ContentImportResult = {
      success: false,
      imported: 0,
      errors: [],
      warnings: [],
    };

    try {
      const importData: ContentExport = JSON.parse(jsonData);

      // Validate export format
      if (!importData.version || !importData.contentType || !Array.isArray(importData.content)) {
        result.errors.push('Invalid export format: missing required fields');
        return result;
      }

      // Check version compatibility
      if (importData.version !== '1.0') {
        result.warnings.push(`Export version ${importData.version} may not be fully compatible`);
      }

      const importedContent: unknown[] = [];

      // Validate each content item
      for (const item of importData.content) {
        try {
          const validation = contentValidationService.validateContent(item, importData.contentType);

          if (!validation.isValid) {
            result.errors.push(`Validation failed for ${item.name || item.id}: ${validation.errors.map(e => e.message).join(', ')}`);
            continue;
          }

          // Check for duplicates
          const duplicateCheck = contentValidationService.checkForDuplicates(item, importData.contentType, existingContent);
          if (!duplicateCheck.isValid) {
            result.warnings.push(`Duplicate content found: ${item.name || item.id}`);
            continue;
          }

          importedContent.push(item);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to process ${item.name || item.id}: ${error}`);
        }
      }

      result.success = result.imported > 0;
      result.content = importedContent;

    } catch (error) {
      result.errors.push(`Failed to parse JSON: ${error}`);
    }

    return result;
  }

  /**
   * Get available templates
   */
  getTemplates(contentType?: ContentType): ContentTemplate[] {
    if (contentType) {
      return this.templates.filter(t => t.contentType === contentType);
    }
    return this.templates;
  }

  /**
   * Get a specific template
   */
  getTemplate(templateId: string): ContentTemplate | undefined {
    return this.templates.find(t => t.id === templateId);
  }

  /**
   * Create content from template
   */
  createFromTemplate(templateId: string, customizations: Record < string, unknown> = {}): unknown {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Deep clone the template content
    const content = JSON.parse(JSON.stringify(template.content));

    // Apply customizations
    Object.assign({}, customizations);

    // Generate unique ID if not provided
    if (!content.id) {
      content.id = `${template.contentType}-${Date.now()}`;
    }

    return content;
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    this.templates = [
      // Move Templates
      {
        id: 'basic-move-template',
        name: 'Basic Move',
        description: 'A simple basic move template',
        contentType: 'move',
        content: {
          id: '',
          name: '',
          description: '',
          category: 'basic',
          rollStat: '',
          source: 'Custom',
        },
        tags: ['basic', 'move'],
      },
      {
        id: 'advanced-move-template',
        name: 'Advanced Move',
        description: 'An advanced move template for specific classes',
        contentType: 'move',
        content: {
          id: '',
          name: '',
          description: '',
          category: 'advanced',
          class: '',
          level: 2,
          rollStat: '',
          source: 'Custom',
        },
        tags: ['advanced', 'move', 'class-specific'],
      },
      // Item Templates
      {
        id: 'weapon-template',
        name: 'Weapon',
        description: 'A weapon template',
        contentType: 'item',
        content: {
          id: '',
          name: '',
          description: '',
          type: 'weapon',
          rarity: 'common',
          weight: 0,
          value: 0,
          damage: '',
          source: 'Custom',
        },
        tags: ['weapon', 'item'],
      },
      {
        id: 'armor-template',
        name: 'Armor',
        description: 'An armor template',
        contentType: 'item',
        content: {
          id: '',
          name: '',
          description: '',
          type: 'armor',
          rarity: 'common',
          weight: 0,
          value: 0,
          armorValue: 0,
          source: 'Custom',
        },
        tags: ['armor', 'item'],
      },
      {
        id: 'magic-item-template',
        name: 'Magic Item',
        description: 'A magical item template',
        contentType: 'item',
        content: {
          id: '',
          name: '',
          description: '',
          type: 'magic',
          rarity: 'uncommon',
          weight: 0,
          value: 0,
          tags: ['magical'],
          source: 'Custom',
        },
        tags: ['magic', 'item', 'magical'],
      },
      // Spell Templates
      {
        id: 'cantrip-template',
        name: 'Cantrip',
        description: 'A cantrip spell template',
        contentType: 'spell',
        content: {
          id: '',
          name: '',
          description: '',
          level: 0,
          school: 'evocation',
          castingTime: '1 action',
          range: '60 feet',
          duration: 'Instantaneous',
          components: ['V', 'S'],
          source: 'Custom',
        },
        tags: ['cantrip', 'spell', 'level-0'],
      },
      {
        id: 'spell-template',
        name: 'Spell',
        description: 'A standard spell template',
        contentType: 'spell',
        content: {
          id: '',
          name: '',
          description: '',
          level: 1,
          school: 'evocation',
          castingTime: '1 action',
          range: '60 feet',
          duration: 'Instantaneous',
          components: ['V', 'S'],
          source: 'Custom',
        },
        tags: ['spell'],
      },
    ];
  }
}

// Export singleton instance
export const contentImportExportService = ContentImportExportService.getInstance();
