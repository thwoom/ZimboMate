export type ContentType = 'move' | 'item' | 'spell'

export interface ContentSchema {
  type: ContentType
  version: string
  fields: SchemaField[]
  validation: ValidationRule[]
}

export interface SchemaField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'object' | 'array'
  label: string
  description?: string
  required: boolean
  defaultValue?: unknown
  options?: SchemaOption[]
  validation?: FieldValidationRule[]
  dependsOn?: FieldDependency
}

export interface SchemaOption {
  value: string | number
  label: string
  description?: string
}

export interface FieldValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (value: unknown, context: ValidationContext) => boolean
}

export interface FieldDependency {
  field: string
  value: unknown
  operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
}

export interface ValidationRule {
  type: 'crossField' | 'business' | 'reference'
  condition: (data: any) => boolean
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationContext {
  contentType: ContentType
  existingContent: unknown[]
  characterClass?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field?: string
  message: string
  code: string
}

export interface ValidationWarning {
  field?: string
  message: string
  code: string
}

// Move Schema
export const MOVE_SCHEMA: ContentSchema = {
  type: 'move',
  version: '1.0',
  fields: [
    {
      name: 'id',
      type: 'string',
      label: 'Move ID',
      description: 'Unique identifier for the move (e.g., "custom-fighter-1")',
      required: true,
      validation: [
        { type: 'pattern', value: '^[a-z0-9-]+$', message: 'ID must contain only lowercase letters, numbers, and hyphens' },
        { type: 'minLength', value: 3, message: 'ID must be at least 3 characters long' },
        { type: 'maxLength', value: 50, message: 'ID must be no more than 50 characters long' },
      ],
    },
    {
      name: 'name',
      type: 'string',
      label: 'Move Name',
      description: 'Display name for the move',
      required: true,
      validation: [
        { type: 'minLength', value: 1, message: 'Name is required' },
        { type: 'maxLength', value: 100, message: 'Name must be no more than 100 characters long' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      description: 'Full description of what the move does',
      required: true,
      validation: [
        { type: 'minLength', value: 10, message: 'Description must be at least 10 characters long' },
        { type: 'maxLength', value: 2000, message: 'Description must be no more than 2000 characters long' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      description: 'Type of move',
      required: true,
      options: [
        { value: 'basic', label: 'Basic Move' },
        { value: 'advanced', label: 'Advanced Move' },
        { value: 'special', label: 'Special Move' },
        { value: 'racial', label: 'Racial Move' },
        { value: 'custom', label: 'Custom Move' },
      ],
    },
    {
      name: 'class',
      type: 'select',
      label: 'Class',
      description: 'Character class this move is associated with (if unknown)',
      required: false,
      options: [
        { value: '', label: 'None (Universal)' },
        { value: 'Fighter', label: 'Fighter' },
        { value: 'Wizard', label: 'Wizard' },
        { value: 'Cleric', label: 'Cleric' },
        { value: 'Thief', label: 'Thief' },
        { value: 'Ranger', label: 'Ranger' },
        { value: 'Paladin', label: 'Paladin' },
        { value: 'Bard', label: 'Bard' },
        { value: 'Druid', label: 'Druid' },
        { value: 'Barbarian', label: 'Barbarian' },
      ],
    },
    {
      name: 'level',
      type: 'number',
      label: 'Level',
      description: 'Minimum level required to take this move',
      required: false,
      defaultValue: 1,
      validation: [
        { type: 'min', value: 1, message: 'Level must be at least 1' },
        { type: 'max', value: 20, message: 'Level must be no more than 20' },
      ],
    },
    {
      name: 'rollStat',
      type: 'select',
      label: 'Roll Stat',
      description: 'Primary stat used for this move (if unknown)',
      required: false,
      options: [
        { value: '', label: 'No Roll Required' },
        { value: 'STR', label: 'Strength' },
        { value: 'DEX', label: 'Dexterity' },
        { value: 'CON', label: 'Constitution' },
        { value: 'INT', label: 'Intelligence' },
        { value: 'WIS', label: 'Wisdom' },
        { value: 'CHA', label: 'Charisma' },
      ],
    },
    {
      name: 'source',
      type: 'string',
      label: 'Source',
      description: 'Where this move comes from (e.g., "Custom", "Homebrew")',
      required: false,
      defaultValue: 'Custom',
      validation: [
        { type: 'maxLength', value: 100, message: 'Source must be no more than 100 characters long' },
      ],
    },
  ],
  validation: [
    {
      type: 'business',
      condition: (data) => {
        // If it's an advanced move, it should have a class
        if (data.category === 'advanced' && !data.class) {
          return false
        }
        return true
      },
      message: 'Advanced moves must be associated with a character class',
      severity: 'error',
    },
  ],
}

// Item Schema
export const ITEM_SCHEMA: ContentSchema = {
  type: 'item',
  version: '1.0',
  fields: [
    {
      name: 'id',
      type: 'string',
      label: 'Item ID',
      description: 'Unique identifier for the item (e.g., "custom-sword-1")',
      required: true,
      validation: [
        { type: 'pattern', value: '^[a-z0-9-]+$', message: 'ID must contain only lowercase letters, numbers, and hyphens' },
        { type: 'minLength', value: 3, message: 'ID must be at least 3 characters long' },
        { type: 'maxLength', value: 50, message: 'ID must be no more than 50 characters long' },
      ],
    },
    {
      name: 'name',
      type: 'string',
      label: 'Item Name',
      description: 'Display name for the item',
      required: true,
      validation: [
        { type: 'minLength', value: 1, message: 'Name is required' },
        { type: 'maxLength', value: 100, message: 'Name must be no more than 100 characters long' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      description: 'Full description of the item and its properties',
      required: true,
      validation: [
        { type: 'minLength', value: 10, message: 'Description must be at least 10 characters long' },
        { type: 'maxLength', value: 2000, message: 'Description must be no more than 2000 characters long' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      label: 'Item Type',
      description: 'Category of item',
      required: true,
      options: [
        { value: 'weapon', label: 'Weapon' },
        { value: 'armor', label: 'Armor' },
        { value: 'gear', label: 'Gear / Equipment' },
        { value: 'magic', label: 'Magic Item' },
        { value: 'consumable', label: 'Consumable' },
        { value: 'treasure', label: 'Treasure' },
      ],
    },
    {
      name: 'rarity',
      type: 'select',
      label: 'Rarity',
      description: 'How rare this item is',
      required: false,
      defaultValue: 'common',
      options: [
        { value: 'common', label: 'Common' },
        { value: 'uncommon', label: 'Uncommon' },
        { value: 'rare', label: 'Rare' },
        { value: 'very-rare', label: 'Very Rare' },
        { value: 'legendary', label: 'Legendary' },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      label: 'Weight',
      description: 'Weight in pounds',
      required: false,
      validation: [
        { type: 'min', value: 0, message: 'Weight must be 0 or greater' },
        { type: 'max', value: 1000, message: 'Weight must be 1000 or less' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      label: 'Value',
      description: 'Value in gold pieces',
      required: false,
      validation: [
        { type: 'min', value: 0, message: 'Value must be 0 or greater' },
      ],
    },
    {
      name: 'damage',
      type: 'string',
      label: 'Damage',
      description: 'Damage dice (e.g., "1d6", "2d8 + 1")',
      required: false,
      dependsOn: { field: 'type', value: 'weapon' },
    },
    {
      name: 'armorValue',
      type: 'number',
      label: 'Armor Value',
      description: 'Armor bonus provided',
      required: false,
      dependsOn: { field: 'type', value: 'armor' },
      validation: [
        { type: 'min', value: 0, message: 'Armor value must be 0 or greater' },
        { type: 'max', value: 20, message: 'Armor value must be 20 or less' },
      ],
    },
    {
      name: 'tags',
      type: 'multiselect',
      label: 'Tags',
      description: 'Special properties and keywords',
      required: false,
      options: [
        { value: 'magical', label: 'Magical' },
        { value: 'cursed', label: 'Cursed' },
        { value: 'sentient', label: 'Sentient' },
        { value: 'artifact', label: 'Artifact' },
        { value: 'light', label: 'Light' },
        { value: 'heavy', label: 'Heavy' },
        { value: 'thrown', label: 'Thrown' },
        { value: 'versatile', label: 'Versatile' },
        { value: 'finesse', label: 'Finesse' },
        { value: 'reach', label: 'Reach' },
        { value: 'ammunition', label: 'Ammunition' },
        { value: 'loading', label: 'Loading' },
        { value: 'two-handed', label: 'Two-Handed' },
      ],
    },
    {
      name: 'source',
      type: 'string',
      label: 'Source',
      description: 'Where this item comes from (e.g., "Custom", "Homebrew")',
      required: false,
      defaultValue: 'Custom',
      validation: [
        { type: 'maxLength', value: 100, message: 'Source must be no more than 100 characters long' },
      ],
    },
  ],
  validation: [
    {
      type: 'business',
      condition: (data) => {
        // Weapons should have damage
        if (data.type === 'weapon' && !data.damage) {
          return false
        }
        return true
      },
      message: 'Weapons must specify damage',
      severity: 'error',
    },
    {
      type: 'business',
      condition: (data) => {
        // Armor should have armor value
        if (data.type === 'armor' && data.armorValue === undefined) {
          return false
        }
        return true
      },
      message: 'Armor must specify armor value',
      severity: 'error',
    },
  ],
}

// Spell Schema
export const SPELL_SCHEMA: ContentSchema = {
  type: 'spell',
  version: '1.0',
  fields: [
    {
      name: 'id',
      type: 'string',
      label: 'Spell ID',
      description: 'Unique identifier for the spell (e.g., "custom-fireball")',
      required: true,
      validation: [
        { type: 'pattern', value: '^[a-z0-9-]+$', message: 'ID must contain only lowercase letters, numbers, and hyphens' },
        { type: 'minLength', value: 3, message: 'ID must be at least 3 characters long' },
        { type: 'maxLength', value: 50, message: 'ID must be no more than 50 characters long' },
      ],
    },
    {
      name: 'name',
      type: 'string',
      label: 'Spell Name',
      description: 'Display name for the spell',
      required: true,
      validation: [
        { type: 'minLength', value: 1, message: 'Name is required' },
        { type: 'maxLength', value: 100, message: 'Name must be no more than 100 characters long' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      description: 'Full description of what the spell does',
      required: true,
      validation: [
        { type: 'minLength', value: 10, message: 'Description must be at least 10 characters long' },
        { type: 'maxLength', value: 2000, message: 'Description must be no more than 2000 characters long' },
      ],
    },
    {
      name: 'level',
      type: 'number',
      label: 'Spell Level',
      description: 'Spell level (0 for cantrips)',
      required: true,
      defaultValue: 1,
      validation: [
        { type: 'min', value: 0, message: 'Level must be 0 or greater' },
        { type: 'max', value: 9, message: 'Level must be 9 or less' },
      ],
    },
    {
      name: 'school',
      type: 'select',
      label: 'School of Magic',
      description: 'Magic school this spell belongs to',
      required: true,
      options: [
        { value: 'abjuration', label: 'Abjuration' },
        { value: 'conjuration', label: 'Conjuration' },
        { value: 'divination', label: 'Divination' },
        { value: 'enchantment', label: 'Enchantment' },
        { value: 'evocation', label: 'Evocation' },
        { value: 'illusion', label: 'Illusion' },
        { value: 'necromancy', label: 'Necromancy' },
        { value: 'transmutation', label: 'Transmutation' },
      ],
    },
    {
      name: 'castingTime',
      type: 'string',
      label: 'Casting Time',
      description: 'How long it takes to cast (e.g., "1 action", "1 minute")',
      required: true,
      defaultValue: '1 action',
      validation: [
        { type: 'maxLength', value: 100, message: 'Casting time must be no more than 100 characters long' },
      ],
    },
    {
      name: 'range',
      type: 'string',
      label: 'Range',
      description: 'Spell range (e.g., "Self", "60 feet", "Touch")',
      required: true,
      defaultValue: '60 feet',
      validation: [
        { type: 'maxLength', value: 100, message: 'Range must be no more than 100 characters long' },
      ],
    },
    {
      name: 'duration',
      type: 'string',
      label: 'Duration',
      description: 'How long the spell lasts (e.g., "Instantaneous", "1 hour", "Concentration, up to 1 minute")',
      required: true,
      defaultValue: 'Instantaneous',
      validation: [
        { type: 'maxLength', value: 200, message: 'Duration must be no more than 200 characters long' },
      ],
    },
    {
      name: 'components',
      type: 'multiselect',
      label: 'Components',
      description: 'Spell components required',
      required: true,
      options: [
        { value: 'V', label: 'Verbal (V)' },
        { value: 'S', label: 'Somatic (S)' },
        { value: 'M', label: 'Material (M)' },
      ],
    },
    {
      name: 'materialComponents',
      type: 'textarea',
      label: 'Material Components',
      description: 'Specific material components required (if unknown)',
      required: false,
      dependsOn: { field: 'components', value: 'M' },
    },
    {
      name: 'classes',
      type: 'multiselect',
      label: 'Spellcasting Classes',
      description: 'Classes that can cast this spell',
      required: false,
      options: [
        { value: 'Wizard', label: 'Wizard' },
        { value: 'Cleric', label: 'Cleric' },
        { value: 'Druid', label: 'Druid' },
        { value: 'Bard', label: 'Bard' },
        { value: 'Paladin', label: 'Paladin' },
        { value: 'Ranger', label: 'Ranger' },
        { value: 'Sorcerer', label: 'Sorcerer' },
        { value: 'Warlock', label: 'Warlock' },
      ],
    },
    {
      name: 'source',
      type: 'string',
      label: 'Source',
      description: 'Where this spell comes from (e.g., "Custom", "Homebrew")',
      required: false,
      defaultValue: 'Custom',
      validation: [
        { type: 'maxLength', value: 100, message: 'Source must be no more than 100 characters long' },
      ],
    },
  ],
  validation: [
    {
      type: 'business',
      condition: (data) => {
        // Cantrips should be level 0
        if (data.name.toLowerCase().includes('cantrip') && data.level !== 0) {
          return false
        }
        return true
      },
      message: 'Cantrips must be level 0',
      severity: 'error',
    },
    {
      type: 'business',
      condition: (data) => {
        // High-level spells should have material components
        if (data.level >= 6 && (!data.components || !data.components.includes('M'))) {
          return false
        }
        return true
      },
      message: 'High-level spells (6+) typically require material components',
      severity: 'warning',
    },
  ],
}

export const SCHEMAS: Record <ContentType, ContentSchema> = {
  move: MOVE_SCHEMA,
  item: ITEM_SCHEMA,
  spell: SPELL_SCHEMA,
}

export function getSchema(contentType: ContentType): ContentSchema {
  return SCHEMAS[contentType]
}

export function validateContent(content: unknown, contentType: ContentType, context?: ValidationContext): ValidationResult {
  const schema = getSchema(contentType)
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate required fields and field dependencies
  for (const field of schema.fields) {
    const value = (content as any)[field.name]
    const isFieldVisible = checkFieldDependency(field, content)

    // Skip validation if field is not visible due to dependencies
    if (!isFieldVisible)
      continue

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: field.name,
        message: `${field.label} is required`,
        code: 'REQUIRED_FIELD',
      })
      continue
    }

    if (value !== undefined && value !== null && value !== '' // Field-specific validation
      && field.validation) {
      for (const rule of field.validation) {
        if (!validateFieldRule(value, rule)) {
          errors.push({
            field: field.name,
            message: rule.message,
            code: rule.type.toUpperCase(),
          })
        }
      }
    }
  }

  // Schema-level validation
  for (const rule of schema.validation) {
    if (!rule.condition(content)) {
      if (rule.severity === 'error') {
        errors.push({
          message: rule.message,
          code: rule.message.replace(/\s+/g, '_').toUpperCase(),
        })
      }
      else {
        warnings.push({
          message: rule.message,
          code: rule.message.replace(/\s+/g, '_').toUpperCase(),
        })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateFieldRule(value: unknown, rule: FieldValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      return value !== undefined && value !== null && value !== ''
    case 'minLength':
      return typeof value === 'string' && value.length >= (rule.value as number)
    case 'maxLength':
      return typeof value === 'string' && value.length <= (rule.value as number)
    case 'min':
      return typeof value === 'number' && value >= (rule.value as number)
    case 'max':
      return typeof value === 'number' && value <= (rule.value as number)
    case 'pattern':
      try {
        const re = new RegExp(String(rule.value))
        return typeof value === 'string' && re.test(value)
      } catch {
        return true
      }
    case 'custom':
      return rule.validator ? rule.validator(value, {} as ValidationContext) : true
    default:
      return true
  }
}

export function checkFieldDependency(field: SchemaField, data: any): boolean {
  if (!field.dependsOn)
    return true

  const { field: dependentField, value, operator = 'equals' } = field.dependsOn
  const dependentValue = data[dependentField]

  switch (operator) {
    case 'equals':
      return dependentValue === value
    case 'notEquals':
      return dependentValue !== value
    case 'contains':
      return Array.isArray(dependentValue) && dependentValue.includes(value)
    case 'greaterThan':
      return typeof dependentValue === 'number' && dependentValue > (value as number)
    case 'lessThan':
      return typeof dependentValue === 'number' && dependentValue < (value as number)
    default:
      return true
  }
}
