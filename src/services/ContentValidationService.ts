import { validateContent, ValidationResult, ValidationContext, ContentType } from './ContentSchema';
import { moveIndexService } from './MoveIndexService';

export interface ContentValidationService {
  validateMove(move: unknown, context?: ValidationContext): ValidationResult;
  validateItem(item: unknown, context?: ValidationContext): ValidationResult;
  validateSpell(spell: unknown, context?: ValidationContext): ValidationResult;
  validateContent(content: unknown, contentType: ContentType, context?: ValidationContext): ValidationResult;
  checkForDuplicates(content: unknown, contentType: ContentType, existingContent: unknown[]): ValidationResult;
  validateReferences(content: unknown, contentType: ContentType, existingContent: unknown[]): ValidationResult;
}

export class ContentValidationServiceImpl implements ContentValidationService {
  private moveIndexService: unknown;

  constructor(moveIndexService: unknown) {
    this.moveIndexService = moveIndexService;
  }

  validateMove(move: unknown, context?: ValidationContext): ValidationResult {
    return this.validateContent(move, 'move', context);
  }

  validateItem(item: unknown, context?: ValidationContext): ValidationResult {
    return this.validateContent(item, 'item', context);
  }

  validateSpell(spell: unknown, context?: ValidationContext): ValidationResult {
    return this.validateContent(spell, 'spell', context);
  }

  validateContent(content: unknown, contentType: ContentType, context?: ValidationContext): ValidationResult {
    // Start with schema validation
    const schemaResult = validateContent(content, contentType, context);

    // Add business rule validation
    const businessResult = this.validateBusinessRules(content, contentType, context);

    return {
      isValid: schemaResult.isValid && businessResult.isValid,
      errors: [...schemaResult.errors, ...businessResult.errors],
      warnings: [...schemaResult.warnings, ...businessResult.warnings],
    };
  }

  checkForDuplicates(content: unknown, contentType: ContentType, existingContent: unknown[]): ValidationResult {
    const errors: unknown[] = [];
    const warnings: unknown[] = [];

    // Check for duplicate IDs
    const duplicateId = existingContent.find(item => item.id === content.id);
    if (duplicateId) {
      errors.push({
        field: 'id',
        message: `A ${contentType} with ID "${content.id}" already exists`,
        code: 'DUPLICATE_ID',
      });
    }

    // Check for duplicate names (case-insensitive)
    const duplicateName = existingContent.find(item =>
      item.name.toLowerCase() === content.name.toLowerCase(),
    );
    if (duplicateName) {
      warnings.push({
        field: 'name',
        message: `A ${contentType} with name "${content.name}" already exists`,
        code: 'DUPLICATE_NAME',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  validateReferences(content: unknown, contentType: ContentType, existingContent: unknown[]): ValidationResult {
    const errors: unknown[] = [];
    const warnings: unknown[] = [];

    // Check for references to other content that might not exist
    if (contentType === 'move') {
      // Check if move references other moves
      if (content.requiresMove) {
        const referencedMove = existingContent.find(item => item.id === content.requiresMove);
        if (!referencedMove) {
          warnings.push({
            field: 'requiresMove',
            message: `Referenced move "${content.requiresMove}" not found in existing content`,
            code: 'MISSING_REFERENCE',
          });
        }
      }
    }

    if (contentType === 'item') {
      // Check if item references spells or moves
      if (content.customMove) {
        const referencedMove = existingContent.find(item => item.id === content.customMove);
        if (!referencedMove) {
          warnings.push({
            field: 'customMove',
            message: `Referenced move "${content.customMove}" not found in existing content`,
            code: 'MISSING_REFERENCE',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateBusinessRules(content: unknown, contentType: ContentType, context?: ValidationContext): ValidationResult {
    const errors: unknown[] = [];
    const warnings: unknown[] = [];

    switch (contentType) {
      case 'move':
        this.validateMoveBusinessRules(content, errors, warnings, context);
        break;
      case 'item':
        this.validateItemBusinessRules(content, errors, warnings, context);
        break;
      case 'spell':
        this.validateSpellBusinessRules(content, errors, warnings, context);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateMoveBusinessRules(move: unknown, errors: unknown[], warnings: unknown[], context?: ValidationContext): void {
    // Advanced moves should have a class
    if (move.category === 'advanced' && !move.class) {
      errors.push({
        field: 'class',
        message: 'Advanced moves must be associated with a character class',
        code: 'ADVANCED_MOVE_REQUIRES_CLASS',
      });
    }

    // Moves with roll stats should have triggers
    if (move.rollStat && !move.trigger) {
      warnings.push({
        field: 'trigger',
        message: 'Moves with a roll stat should have a trigger description',
        code: 'ROLL_STAT_WITHOUT_TRIGGER',
      });
    }

    // Level requirements should be reasonable
    if (move.level && move.level > 10) {
      warnings.push({
        field: 'level',
        message: 'Very high level requirements may limit usability',
        code: 'HIGH_LEVEL_REQUIREMENT',
      });
    }

    // Check for balanced move descriptions
    if (move.description && move.description.length < 20) {
      warnings.push({
        field: 'description',
        message: 'Move description seems very brief-consider adding more detail',
        code: 'BRIEF_DESCRIPTION',
      });
    }
  }

  private validateItemBusinessRules(item: unknown, errors: unknown[], warnings: unknown[], context?: ValidationContext): void {
    // Magic items should have appropriate tags
    if (item.type === 'magic' && (!item.tags || !item.tags.includes('magical'))) {
      warnings.push({
        field: 'tags',
        message: 'Magic items should have the "magical" tag',
        code: 'MAGIC_ITEM_MISSING_TAG',
      });
    }

    // Weapons should have damage information
    if (item.type === 'weapon' && !item.damage) {
      warnings.push({
        field: 'damage',
        message: 'Weapons should specify damage',
        code: 'WEAPON_MISSING_DAMAGE',
      });
    }

    // Armor should have armor value
    if (item.type === 'armor' && !item.armorValue) {
      warnings.push({
        field: 'armorValue',
        message: 'Armor should specify armor value',
        code: 'ARMOR_MISSING_VALUE',
      });
    }

    // Value should be reasonable
    if (item.value && item.value > 10000) {
      warnings.push({
        field: 'value',
        message: 'Very high values may be unbalanced',
        code: 'HIGH_VALUE',
      });
    }
  }

  private validateSpellBusinessRules(spell: unknown, errors: unknown[], warnings: unknown[], context?: ValidationContext): void {
    // Cantrips should be level 0
    if (spell.level !== 0 && spell.name.toLowerCase().includes('cantrip')) {
      errors.push({
        field: 'level',
        message: 'Cantrips should be level 0',
        code: 'CANTRIP_LEVEL_MISMATCH',
      });
    }

    // High-level spells should have appropriate components
    if (spell.level >= 6 && (!spell.components || !spell.components.includes('M'))) {
      warnings.push({
        field: 'components',
        message: 'High-level spells typically require material components',
        code: 'HIGH_LEVEL_NO_MATERIALS',
      });
    }

    // Check for balanced spell descriptions
    if (spell.description && spell.description.length < 30) {
      warnings.push({
        field: 'description',
        message: 'Spell description seems very brief-consider adding more detail',
        code: 'BRIEF_DESCRIPTION',
      });
    }

    // Duration should be reasonable
    if (spell.duration && spell.duration.toLowerCase().includes('permanent')) {
      warnings.push({
        field: 'duration',
        message: 'Permanent effects should be carefully balanced',
        code: 'PERMANENT_EFFECT',
      });
    }
  }

  // Utility method to validate a complete content set
  validateContentSet(contentSet: { moves?: unknown[], items?: unknown[], spells?: unknown[] }): ValidationResult {
    const allErrors: unknown[] = [];
    const allWarnings: unknown[] = [];

    // Validate each content type
    if (contentSet.moves) {
      for (const move of contentSet.moves) {
        const result = this.validateMove(move);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    }

    if (contentSet.items) {
      for (const item of contentSet.items) {
        const result = this.validateItem(item);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    }

    if (contentSet.spells) {
      for (const spell of contentSet.spells) {
        const result = this.validateSpell(spell);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      }
    }

    // Check for cross-references
    const allContent = [
      ...(contentSet.moves || []),
      ...(contentSet.items || []),
      ...(contentSet.spells || []),
    ];

    for (const content of allContent) {
      const contentType = this.determineContentType(content);
      const referenceResult = this.validateReferences(content, contentType, allContent);
      allErrors.push(...referenceResult.errors);
      allWarnings.push(...referenceResult.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  private determineContentType(content: unknown): ContentType {
    if (content.category && ['basic', 'advanced', 'special', 'racial', 'custom'].includes(content.category)) {
      return 'move';
    }
    if (content.type && ['weapon', 'armor', 'gear', 'magic', 'consumable'].includes(content.type)) {
      return 'item';
    }
    if (content.school || content.castingTime || content.range || content.duration) {
      return 'spell';
    }

    // Default based on most common fields
    if (content.rollStat || content.trigger) {
      return 'move';
    }
    if (content.weight !== undefined || content.value !== undefined) {
      return 'item';
    }
    return 'spell';
  }
}

// Export a singleton instance
export const contentValidationService = new ContentValidationServiceImpl(moveIndexService);
