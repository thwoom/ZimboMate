import { describe, expect,it } from 'vitest';

import { contentImportExportService } from '../../src / services / ContentImportExportService';
// Removed unused import: ContentType

describe('ContentImportExportService', () => {
  describe('exportContent', () => {
    it('should export content as JSON with proper structure', () => {
      const _testContent = [
        {
          id: 'test - move - 1',
          name: 'Test Move',
          description: 'A test move',
          category: 'basic',
          source: 'Custom',
        },
      ];

      const _result = contentImportExportService.exportContent(testContent, 'move', {
        name: 'Test Export',
        description: 'Test export description',
        author: 'Test Author',
        tags: ['test', 'move'],
      });

      const _parsed = JSON.parse(result);
      expect(parsed.version).toBe('1.0');
      expect(parsed.contentType).toBe('move');
      expect(parsed.content).toEqual(testContent);
      expect(parsed.metadata).toEqual({
        name: 'Test Export',
        description: 'Test export description',
        author: 'Test Author',
        tags: ['test', 'move'],
      });
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should export content without metadata', () => {
      const testContent = [
        {
          id: 'test - item - 1',
          name: 'Test Item',
          description: 'A test item',
          type: 'weapon',
          source: 'Custom',
        },
      ];

      const _result = contentImportExportService.exportContent(testContent, 'item');
      const parsed = JSON.parse(result);

      expect(parsed.metadata).toBeUndefined();
      expect(parsed.content).toEqual(testContent);
    });
  });

  describe('importContent', () => {
    it('should successfully import valid content', () => {
      const validExport = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        contentType: 'move' as ContentType,
        content: [
          {
            id: 'imported - move - 1',
            name: 'Imported Move',
            description: 'An imported move',
            category: 'basic',
            source: 'Custom',
          },
        ],
      };

      const _result = contentImportExportService.importContent(JSON.stringify(validExport));

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(result.content).toEqual(validExport.content);
    });

    it('should reject invalid export format', () => {
      const invalidExport = {
        version: '1.0',
        // Missing contentType and content
      };

      const _result = contentImportExportService.importContent(JSON.stringify(invalidExport));

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid export format');
    });

    it('should warn about version incompatibility', () => {
      const oldVersionExport = {
        version: '0.9',
        exportedAt: new Date().toISOString(),
        contentType: 'move' as ContentType,
        content: [
          {
            id: 'old - move - 1',
            name: 'Old Move',
            description: 'An old move',
            category: 'basic',
            source: 'Custom',
          },
        ],
      };

      const _result = contentImportExportService.importContent(JSON.stringify(oldVersionExport));

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('may not be fully compatible');
    });

    it('should handle invalid JSON', () => {
      const _result = contentImportExportService.importContent('invalid json');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to parse JSON');
    });

    it('should detect and warn about duplicates', () => {
      const existingContent = [
        {
          id: 'existing - move - 1',
          name: 'Existing Move',
          description: 'An existing move',
          category: 'basic',
          source: 'Custom',
        },
      ];

      const importExport = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        contentType: 'move' as ContentType,
        content: [
          {
            id: 'existing - move - 1', // Duplicate ID
            name: 'Duplicate Move',
            description: 'A duplicate move',
            category: 'basic',
            source: 'Custom',
          },
        ],
      };

      const result = contentImportExportService.importContent(JSON.stringify(importExport), existingContent);

      expect(result.success).toBe(false);
      expect(result.imported).toBe(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Duplicate content found');
    });
  });

  describe('templates', () => {
    it('should return all templates when no contentType specified', () => {
      const templates = contentImportExportService.getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return filtered templates for specific contentType', () => {
      const moveTemplates = contentImportExportService.getTemplates('move');
      const itemTemplates = contentImportExportService.getTemplates('item');
      const spellTemplates = contentImportExportService.getTemplates('spell');

      expect(moveTemplates.every(t => t.contentType === 'move')).toBe(true);
      expect(itemTemplates.every(t => t.contentType === 'item')).toBe(true);
      expect(spellTemplates.every(t => t.contentType === 'spell')).toBe(true);
    });

    it('should get specific template by ID', () => {
      const _template = contentImportExportService.getTemplate('basic - move - template');
      expect(template).toBeDefined();
      expect(template?.id).toBe('basic - move - template');
      expect(template?.contentType).toBe('move');
    });

    it('should return undefined for non - existent template', () => {
      const template = contentImportExportService.getTemplate('non - existent - template');
      expect(template).toBeUndefined();
    });

    it('should create content from template', () => {
      const customizations = {
        name: 'Custom Move',
        description: 'A custom move created from template',
      };

      const content = contentImportExportService.createFromTemplate('basic - move - template', customizations);

      expect(content.name).toBe('Custom Move');
      expect(content.description).toBe('A custom move created from template');
      expect(content.category).toBe('basic');
      expect(content.id).toMatch(/^move-\d+$/);
    });

    it('should throw error for non - existent template', () => {
      expect(() => {
        contentImportExportService.createFromTemplate('non - existent - template');
      }).toThrow('Template not found');
    });
  });
});
