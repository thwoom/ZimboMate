/**
 * Chronicle-Enabled Equipment Panel
 *
 * Enhanced equipment panel that integrates with the Chronicle system
 * to automatically trigger contextual story prompts when items are used,
 * equipped, or interacted with.
 */

import type { Character } from '../../models/Character'
import type { Inventory } from '../../models/Inventory'
import React, { useCallback } from 'react'
import { useChronicle } from '../chronicle/ChronicleProvider'
import { EquipmentPanel } from './EquipmentPanel'

interface ChronicleEnabledEquipmentPanelProps {
  character: Character
  onItemEquip?: (itemId: string) => void
  onItemUnequip?: (itemId: string) => void
  onItemUse?: (itemId: string) => void
  onItemDrop?: (itemId: string) => void
  onInventoryUpdate?: (inventory: Inventory) => void
  enableChronicleIntegration?: boolean
  className?: string
}

export const ChronicleEnabledEquipmentPanel: React.FC<ChronicleEnabledEquipmentPanelProps> = ({
  character,
  onItemEquip,
  onItemUnequip,
  onItemUse,
  onItemDrop,
  onInventoryUpdate,
  enableChronicleIntegration = true,
  className,
}) => {
  const { emitEquipmentAction, isOverlayEnabled } = useChronicle()

  // Get item details from inventory
  const getItemDetails = (itemId: string) => {
    const item = character.inventory?.find(item => item.id === itemId)
    return item
      ? {
          name: item.name,
          type: item.category || 'item',
          description: item.description || '',
        }
      : {
          name: 'Unknown Item',
          type: 'item',
          description: '',
        }
  }

  // Enhanced callbacks with Chronicle integration
  const handleItemEquip = useCallback((itemId: string) => {
    const item = getItemDetails(itemId)

    // Trigger Chronicle system if enabled
    if (enableChronicleIntegration && isOverlayEnabled) {
      emitEquipmentAction({
        characterName: character.name,
        action: 'equip',
        itemName: item.name,
        itemType: item.type,
      })
    }

    // Call original callback
    onItemEquip?.(itemId)
  }, [
    character.name,
    enableChronicleIntegration,
    isOverlayEnabled,
    emitEquipmentAction,
    onItemEquip,
  ])

  const handleItemUnequip = useCallback((itemId: string) => {
    const item = getItemDetails(itemId)

    // Trigger Chronicle system if enabled
    if (enableChronicleIntegration && isOverlayEnabled) {
      emitEquipmentAction({
        characterName: character.name,
        action: 'unequip',
        itemName: item.name,
        itemType: item.type,
      })
    }

    // Call original callback
    onItemUnequip?.(itemId)
  }, [
    character.name,
    enableChronicleIntegration,
    isOverlayEnabled,
    emitEquipmentAction,
    onItemUnequip,
  ])

  const handleItemUse = useCallback((itemId: string) => {
    const item = getItemDetails(itemId)

    // Trigger Chronicle system if enabled (this is the main one we want to prompt for)
    if (enableChronicleIntegration && isOverlayEnabled) {
      emitEquipmentAction({
        characterName: character.name,
        action: 'use',
        itemName: item.name,
        itemType: item.type,
      })
    }

    // Call original callback
    onItemUse?.(itemId)
  }, [
    character.name,
    enableChronicleIntegration,
    isOverlayEnabled,
    emitEquipmentAction,
    onItemUse,
  ])

  const handleItemDrop = useCallback((itemId: string) => {
    const item = getItemDetails(itemId)

    // Trigger Chronicle system if enabled
    if (enableChronicleIntegration && isOverlayEnabled) {
      emitEquipmentAction({
        characterName: character.name,
        action: 'drop',
        itemName: item.name,
        itemType: item.type,
      })
    }

    // Call original callback
    onItemDrop?.(itemId)
  }, [
    character.name,
    enableChronicleIntegration,
    isOverlayEnabled,
    emitEquipmentAction,
    onItemDrop,
  ])

  return (
    <div className={className}>
      <EquipmentPanel
        character={character}
        onItemEquip={handleItemEquip}
        onItemUnequip={handleItemUnequip}
        onItemUse={handleItemUse}
        onItemDrop={handleItemDrop}
        onInventoryUpdate={onInventoryUpdate}
      />

      {/* Chronicle Integration Status Indicator */}
      {enableChronicleIntegration && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
            <div className={`w-2 h-2 rounded-full ${isOverlayEnabled ? 'bg-chart-2' : 'bg-gray-400'}`} />
            <span>
              Chronicle
              {' '}
              {isOverlayEnabled ? 'enabled' : 'disabled'}
              {' '}
              - Item usage will
              {' '}
              {isOverlayEnabled ? '' : 'not'}
              {' '}
              trigger story prompts
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Also export the original for backward compatibility
export { EquipmentPanel }
