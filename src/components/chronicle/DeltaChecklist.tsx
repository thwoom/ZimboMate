import type { DeltaOperation } from '@/services/llm'
import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<DeltaOperation['type'], string> = {
  apply_damage: 'Apply Damage',
  heal: 'Heal',
  mark_xp: 'Mark XP',
  add_item: 'Add Item',
  remove_item: 'Remove Item',
  add_item_tag: 'Item Tag',
  equip_item: 'Equip Item',
  unequip_item: 'Unequip Item',
  level_up: 'Level Up',
  spend_ammo: 'Spend Ammo',
  mark_hold: 'Mark Hold',
  spend_hold: 'Spend Hold',
  add_debility: 'Add Debility',
  remove_debility: 'Remove Debility',
  add_bond: 'Add Bond',
  resolve_bond: 'Resolve Bond',
  add_flag: 'Add Campaign Flag',
  create_entity: 'Create Entity',
  link_entity: 'Link Entity',
  add_note: 'Add Note',
  add_coin: 'Add Coin',
}

const RULE_REFERENCES: Partial<Record<DeltaOperation['type'], string>> = {
  apply_damage: 'DW Core • Hack & Slash damage resolution',
  heal: 'DW Core • Recovery & Make Camp guidance',
  mark_xp: 'DW Core • XP on a Miss',
  add_debility: 'DW Core • Debilities',
  remove_debility: 'DW Core • Debilities',
  add_bond: 'DW Core • Bonds',
  resolve_bond: 'DW Core • Resolving Bonds',
  mark_hold: 'DW Core • Hold (various moves)',
  spend_hold: 'DW Core • Hold (various moves)',
  spend_ammo: 'DW Core • Ammo (Volley & ranged attacks)',
  level_up: 'DW Core • Level Up Move',
}

const EMPTY_SELECTION: Record<number, boolean> = Object.freeze({})

const buildOperationKey = (operation: DeltaOperation): string => {
  if ('characterId' in operation && 'itemId' in operation) {
    return [operation.type, operation.characterId, operation.itemId].join(':')
  }

  if ('characterId' in operation && 'move' in operation) {
    return [operation.type, operation.characterId, operation.move ?? ''].join(':')
  }

  if ('characterId' in operation) {
    return [operation.type, operation.characterId].join(':')
  }

  if ('entityId' in operation) {
    return [operation.type, operation.entityId].join(':')
  }

  if ('fromId' in operation && 'toId' in operation) {
    return [operation.type, operation.fromId, operation.toId].join(':')
  }

  if ('item' in operation && operation.item?.id) {
    return [operation.type, operation.item.id].join(':')
  }

  if ('flag' in operation) {
    return [operation.type, operation.characterId ?? 'global', operation.flag].join(':')
  }

  return `${operation.type}:${JSON.stringify(operation)}`
}

export interface DeltaChecklistProps {
  operations: DeltaOperation[]
  selection?: Record<number, boolean>
  onToggle?: (index: number, checked: boolean) => void
  disabled?: boolean
  variant?: 'interactive' | 'readOnly'
  size?: 'default' | 'compact'
  showRuleReference?: boolean
  renderDescription: (operation: DeltaOperation, index: number) => string
  className?: string
  itemClassName?: string
}

export const DeltaChecklist: React.FC<DeltaChecklistProps> = ({
  operations,
  selection = EMPTY_SELECTION,
  onToggle,
  disabled = false,
  variant,
  size = 'default',
  showRuleReference = false,
  renderDescription,
  className,
  itemClassName,
}) => {
  if (operations.length === 0) return null

  const resolvedVariant =
    variant ?? (typeof onToggle === 'function' ? 'interactive' : 'readOnly')
  const isInteractive =
    resolvedVariant === 'interactive' && typeof onToggle === 'function'

  return (
    <div className={cn('space-y-2', className)}>
      {operations.map((operation, index) => {
        const description = renderDescription(operation, index)
        const checked = selection[index] ?? false
        const typeLabel =
          TYPE_LABELS[operation.type] ?? operation.type.replaceAll('_', ' ')
        const ruleReference = showRuleReference
          ? RULE_REFERENCES[operation.type]
          : undefined

        const itemClasses = cn(
          'flex items-start gap-2 rounded-md border border-border/60',
          isInteractive ? 'bg-muted/20 p-2' : 'bg-card/40 p-2',
          size === 'compact' && 'text-sm p-2',
          itemClassName,
        )

        return (
          <div key={buildOperationKey(operation)} className={itemClasses}>
            {isInteractive ? (
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => onToggle(index, value === true)}
                className='mt-0.5'
              />
            ) : (
              <span
                className={cn(
                  'mt-1 text-muted-foreground',
                  size === 'compact' && 'text-xs',
                )}
              >
                •
              </span>
            )}

            <div className='space-y-1'>
              <div className='text-sm leading-snug text-foreground'>
                {description}
              </div>
              <div className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                {typeLabel}
              </div>
              {ruleReference && (
                <div className='text-[11px] italic text-muted-foreground'>
                  {ruleReference}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
