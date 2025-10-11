/**
 * useEquipment Hook for ZimboMate V2
 * Equipment management with drag-and-drop, load calculations, and state tracking
 * Integrates EquipmentManagementService with character inventory
 */

import type { Equipment } from '../models/Equipment'
import { useCallback, useMemo, useState } from 'react'
import { characterStateService } from '../services/CharacterStateService'
import { equipmentManagementService } from '../services/EquipmentManagementService'
import { useInventoryStore } from '../stores/inventoryStore'
import { useCharacter } from './useCharacter'

export interface EquipmentWithState extends Equipment {
  equipped: boolean
  condition: 'perfect' | 'good' | 'worn' | 'damaged' | 'broken'
  charges?: number
  maxCharges?: number
  modifiers: Array<{
    type: 'stat' | 'damage' | 'armor' | 'special'
    value: number | string
    condition?: string
  }>
}

export interface LoadCalculation {
  current: number
  max: number
  percentage: number
  status: 'light' | 'normal' | 'heavy' | 'overloaded'
  breakdown: Array<{
    item: string
    weight: number
    category: 'equipped' | 'carried' | 'stored'
  }>
}

export interface DragDropContext {
  draggedItem: Equipment | null
  draggedFromSlot: string | null
  canDrop: (_targetSlot: string) => boolean
  drop: (targetSlot: string) => void
  cancelDrag: () => void
}

export interface UseEquipmentReturn {
  // Character equipment
  allItems: EquipmentWithState[]
  equippedItems: EquipmentWithState[]
  carriedItems: EquipmentWithState[]
  storedItems: EquipmentWithState[]

  // Equipment by category
  weapons: EquipmentWithState[]
  armor: EquipmentWithState[]
  gear: EquipmentWithState[]
  consumables: EquipmentWithState[]

  // Load management
  loadCalculation: LoadCalculation
  canCarryMore: boolean
  weightToNextThreshold: number

  // Equipment operations
  equipItem: (itemId: string) => void
  unequipItem: (itemId: string) => void
  addItem: (item: Equipment) => void
  removeItem: (itemId: string) => void
  updateItemCondition: (
    itemId: string,
    condition: EquipmentWithState['condition'],
  ) => void
  updateItemCharges: (itemId: string, charges: number) => void

  // Equipment sets
  saveEquipmentSet: (name: string) => void
  loadEquipmentSet: (setId: string) => void
  availableEquipmentSets: Array<{
    id: string
    name: string
    itemCount: number
    totalWeight: number
  }>

  // Drag and drop
  dragDropContext: DragDropContext

  // Quick actions
  equipWeapon: (weaponId: string) => void
  equipArmor: (armorId: string) => void
  quickEquipSet: (setName: 'combat' | 'exploration' | 'social') => void

  // Character context
  character: any
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing character equipment
 * @param characterId - Character ID (optional, uses active character if not provided)
 */
export function useEquipment(characterId?: string): UseEquipmentReturn {
  const { character, updateLoad, isLoading, error } = useCharacter(characterId)
  const {
    items,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    getItemsByCharacter,
  } = useInventoryStore()

  const itemsSignature = useMemo(
    () =>
      items
        .map((item) => `${item.id}:${item.quantity}:${item.equipped ? 1 : 0}`)
        .join('|'),
    [items],
  )

  const [draggedItem, setDraggedItem] = useState<Equipment | null>(null)
  const [draggedFromSlot, setDraggedFromSlot] = useState<string | null>(null)

  // Get character's equipment with state
  const allItems = useMemo((): EquipmentWithState[] => {
    if (!character) return []

    const characterItems = getItemsByCharacter(character.id)
    const characterState = characterStateService.getCharacterState(character.id)

    if (itemsSignature.length === 0 && characterItems.length === 0) {
      return []
    }

    return characterItems.map((item) => {
      const equipmentState = characterState.equipment.find(
        (eq) => eq.itemId === item.id,
      )

      return {
        ...item,
        equipped: equipmentState?.equipped || false,
        condition: equipmentState?.condition || 'good',
        charges: equipmentState?.charges,
        maxCharges: equipmentState?.maxCharges,
        modifiers: equipmentState?.modifiers || [],
      }
    })
  }, [character, getItemsByCharacter, itemsSignature])

  // Categorize equipment
  const equippedItems = useMemo(
    () => allItems.filter((item) => item.equipped),
    [allItems],
  )

  const carriedItems = useMemo(
    () => allItems.filter((item) => !item.equipped),
    [allItems],
  )

  const storedItems = useMemo(
    () => allItems.filter((item) => item.tags?.includes('stored')),
    [allItems],
  )

  const weapons = useMemo(
    () => allItems.filter((item) => item.category === 'weapon'),
    [allItems],
  )

  const armor = useMemo(
    () => allItems.filter((item) => item.category === 'armor'),
    [allItems],
  )

  const gear = useMemo(
    () => allItems.filter((item) => item.category === 'gear'),
    [allItems],
  )

  const consumables = useMemo(
    () => allItems.filter((item) => item.category === 'consumable'),
    [allItems],
  )

  // Load calculation
  const loadCalculation = useMemo((): LoadCalculation => {
    if (!character) {
      return {
        current: 0,
        max: 0,
        percentage: 0,
        status: 'light',
        breakdown: [],
      }
    }

    const calculation = equipmentManagementService.calculateLoad(
      character,
      allItems,
    )

    return {
      current: calculation.currentLoad,
      max: calculation.maxLoad,
      percentage: calculation.loadPercentage,
      status: calculation.loadStatus as any,
      breakdown: calculation.breakdown.map((item) => ({
        item: item.name,
        weight: item.weight,
        category: item.equipped ? 'equipped' : 'carried',
      })),
    }
  }, [character, allItems])

  const canCarryMore = useMemo(
    () => loadCalculation.current < loadCalculation.max,
    [loadCalculation],
  )

  const weightToNextThreshold = useMemo(() => {
    const { current, max } = loadCalculation
    const lightThreshold = max * 0.33
    const normalThreshold = max * 0.66

    if (current <= lightThreshold) return lightThreshold - current
    if (current <= normalThreshold) return normalThreshold - current
    return max - current
  }, [loadCalculation])

  // Equipment operations
  const equipItem = useCallback(
    (itemId: string) => {
      if (!character) return

      const item = allItems.find((i) => i.id === itemId)
      if (!item) return

      // Check if item can be equipped
      const canEquip = equipmentManagementService.canEquipItem(
        character,
        item,
        equippedItems,
      )
      if (!canEquip.canEquip) return

      // Update equipment state
      characterStateService.updateCharacterState(character.id, {
        equipment: [
          ...characterStateService
            .getCharacterState(character.id)
            .equipment.filter((eq) => eq.itemId !== itemId),
          {
            itemId,
            equipped: true,
            condition: 'good',
            modifiers: item.modifiers || [],
          },
        ],
      })

      // Recalculate load
      const newLoad = equipmentManagementService.calculateLoad(
        character,
        allItems,
      )
      updateLoad(newLoad.currentLoad)
    },
    [character, allItems, equippedItems, updateLoad],
  )

  const unequipItem = useCallback(
    (itemId: string) => {
      if (!character) return

      const characterState = characterStateService.getCharacterState(
        character.id,
      )
      const updatedEquipment = characterState.equipment.map((eq) =>
        eq.itemId === itemId ? { ...eq, equipped: false } : eq,
      )

      characterStateService.updateCharacterState(character.id, {
        equipment: updatedEquipment,
      })

      // Recalculate load
      const newLoad = equipmentManagementService.calculateLoad(
        character,
        allItems,
      )
      updateLoad(newLoad.currentLoad)
    },
    [character, allItems, updateLoad],
  )

  const addItem = useCallback(
    (item: Equipment) => {
      if (!character) return

      const newItem = {
        ...item,
        characterId: character.id,
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      }

      storeAddItem(newItem)
    },
    [character, storeAddItem],
  )

  const removeItem = useCallback(
    (itemId: string) => {
      storeRemoveItem(itemId)

      // Also remove from character state
      if (character) {
        const characterState = characterStateService.getCharacterState(
          character.id,
        )
        const updatedEquipment = characterState.equipment.filter(
          (eq) => eq.itemId !== itemId,
        )

        characterStateService.updateCharacterState(character.id, {
          equipment: updatedEquipment,
        })
      }
    },
    [character, storeRemoveItem],
  )

  const updateItemCondition = useCallback(
    (itemId: string, condition: EquipmentWithState['condition']) => {
      if (!character) return

      const characterState = characterStateService.getCharacterState(
        character.id,
      )
      const updatedEquipment = characterState.equipment.map((eq) =>
        eq.itemId === itemId ? { ...eq, condition } : eq,
      )

      characterStateService.updateCharacterState(character.id, {
        equipment: updatedEquipment,
      })
    },
    [character],
  )

  const updateItemCharges = useCallback(
    (itemId: string, charges: number) => {
      if (!character) return

      const characterState = characterStateService.getCharacterState(
        character.id,
      )
      const updatedEquipment = characterState.equipment.map((eq) =>
        eq.itemId === itemId ? { ...eq, charges } : eq,
      )

      characterStateService.updateCharacterState(character.id, {
        equipment: updatedEquipment,
      })
    },
    [character],
  )

  // Equipment sets
  const saveEquipmentSet = useCallback(
    (name: string) => {
      if (!character) return

      const equipmentSet = {
        id: `set-${Date.now()}`,
        name,
        characterId: character.id,
        items: equippedItems.map((item) => ({
          itemId: item.id,
          equipped: true,
          condition: item.condition,
        })),
      }

      equipmentManagementService.saveEquipmentSet(equipmentSet)
    },
    [character, equippedItems],
  )

  const loadEquipmentSet = useCallback(
    (setId: string) => {
      if (!character) return

      const equipmentSet = equipmentManagementService.getEquipmentSet(setId)
      if (!equipmentSet) return

      equipmentManagementService.applyEquipmentSet(character, equipmentSet)
    },
    [character],
  )

  const availableEquipmentSets = useMemo(() => {
    if (!character) return []

    return equipmentManagementService
      .getEquipmentSetsForCharacter(character.id)
      .map((set) => ({
        id: set.id,
        name: set.name,
        itemCount: set.items.length,
        totalWeight: set.items.reduce((total, item) => {
          const equipment = allItems.find((eq) => eq.id === item.itemId)
          return total + (equipment?.weight || 0)
        }, 0),
      }))
  }, [character, allItems])

  // Drag and drop
  const dragDropContext: DragDropContext = useMemo(
    () => ({
      draggedItem,
      draggedFromSlot,
      canDrop: (_targetSlot: string) => {
        if (!draggedItem || !character) return false

        // Implement drop validation logic
        return equipmentManagementService.canEquipItem(
          character,
          draggedItem,
          equippedItems,
        ).canEquip
      },
      drop: (targetSlot: string) => {
        if (!draggedItem) return

        if (targetSlot === 'equipped') {
          equipItem(draggedItem.id)
        } else if (targetSlot === 'inventory') {
          unequipItem(draggedItem.id)
        }

        setDraggedItem(null)
        setDraggedFromSlot(null)
      },
      cancelDrag: () => {
        setDraggedItem(null)
        setDraggedFromSlot(null)
      },
    }),
    [
      draggedItem,
      draggedFromSlot,
      character,
      equippedItems,
      equipItem,
      unequipItem,
    ],
  )

  // Quick actions
  const equipWeapon = useCallback(
    (weaponId: string) => {
      // Unequip current weapon first
      const currentWeapon = equippedItems.find(
        (item) => item.category === 'weapon',
      )
      if (currentWeapon) {
        unequipItem(currentWeapon.id)
      }

      equipItem(weaponId)
    },
    [equippedItems, equipItem, unequipItem],
  )

  const equipArmor = useCallback(
    (armorId: string) => {
      // Unequip current armor first
      const currentArmor = equippedItems.find(
        (item) => item.category === 'armor',
      )
      if (currentArmor) {
        unequipItem(currentArmor.id)
      }

      equipItem(armorId)
    },
    [equippedItems, equipItem, unequipItem],
  )

  const quickEquipSet = useCallback(
    (setName: 'combat' | 'exploration' | 'social') => {
      // This would load predefined equipment sets
      const setId = `${character?.id}-${setName}`
      loadEquipmentSet(setId)
    },
    [character, loadEquipmentSet],
  )

  return {
    // Character equipment
    allItems,
    equippedItems,
    carriedItems,
    storedItems,

    // Equipment by category
    weapons,
    armor,
    gear,
    consumables,

    // Load management
    loadCalculation,
    canCarryMore,
    weightToNextThreshold,

    // Equipment operations
    equipItem,
    unequipItem,
    addItem,
    removeItem,
    updateItemCondition,
    updateItemCharges,

    // Equipment sets
    saveEquipmentSet,
    loadEquipmentSet,
    availableEquipmentSets,

    // Drag and drop
    dragDropContext,

    // Quick actions
    equipWeapon,
    equipArmor,
    quickEquipSet,

    // Character context
    character,
    isLoading,
    error,
  }
}
