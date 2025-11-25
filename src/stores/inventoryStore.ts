import type { Item } from '../models/Equipment'
import type { Inventory, InventoryEquipSlot } from '../models/Inventory'
import { createWithEqualityFn } from 'zustand/traditional'
import { persist } from 'zustand/middleware'
import {
  InventoryFilter,
  InventoryView,
  ItemSortBy,
} from '../equipmentSystemMockData'
import {
  addItem,
  moveItem,
  removeItem,
  setEquippedState,
  toggleEquipped,
} from '../models/Inventory'

interface InventoryState {
  inventory: Inventory | null
  selectedItems: string[]
  draggedItem: string | null
  inventoryView: InventoryView
  sortBy: ItemSortBy
  filterBy: InventoryFilter
  searchQuery: string
  isLoading: boolean

  // Actions
  setInventory: (inventory: Inventory) => void
  addItemToInventory: (item: Item, containerId?: string) => void
  removeItemFromInventory: (itemId: string) => void
  moveItemBetweenContainers: (
    itemId: string,
    fromContainer: string,
    toContainer: string,
  ) => void
  setItemEquipped: (
    itemId: string,
    equipped: boolean,
    slot?: InventoryEquipSlot,
  ) => void
  toggleItemEquipped: (itemId: string, slot?: InventoryEquipSlot) => void
  setSelectedItems: (itemIds: string[]) => void
  setDraggedItem: (itemId: string | null) => void
  setInventoryView: (view: InventoryView) => void
  setSortBy: (sortBy: ItemSortBy) => void
  setFilterBy: (filterBy: InventoryFilter) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
}

export const useInventoryStore = createWithEqualityFn<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: null,
      selectedItems: [],
      draggedItem: null,
      inventoryView: InventoryView.GRID,
      sortBy: ItemSortBy.NAME,
      filterBy: InventoryFilter.ALL,
      searchQuery: '',
      isLoading: false,

      setInventory: (inventory: Inventory) => set({ inventory }),

      addItemToInventory: (item: Item, containerId?: string) => {
        const { inventory } = get()
        if (!inventory) return

        const updatedInventory = addItem(inventory, item, containerId)
        set({ inventory: updatedInventory })
      },

      removeItemFromInventory: (itemId: string) => {
        const { inventory } = get()
        if (!inventory) return

        const updatedInventory = removeItem(inventory, itemId)
        set({ inventory: updatedInventory })
      },

      moveItemBetweenContainers: (
        itemId: string,
        fromContainer: string,
        toContainer: string,
      ) => {
        const { inventory } = get()
        if (!inventory) return

        const updatedInventory = moveItem(
          inventory,
          itemId,
          fromContainer,
          toContainer,
        )
        set({ inventory: updatedInventory })
      },

      setItemEquipped: (
        itemId: string,
        equipped: boolean,
        slot?: InventoryEquipSlot,
      ) => {
        const { inventory } = get()
        if (!inventory) return

        const updatedInventory = setEquippedState(
          inventory,
          itemId,
          equipped,
          slot,
        )
        set({ inventory: updatedInventory })
      },

      toggleItemEquipped: (itemId: string, slot?: InventoryEquipSlot) => {
        const { inventory } = get()
        if (!inventory) return

        const updatedInventory = toggleEquipped(inventory, itemId, slot)
        set({ inventory: updatedInventory })
      },

      setSelectedItems: (itemIds: string[]) => set({ selectedItems: itemIds }),

      setDraggedItem: (itemId: string | null) => set({ draggedItem: itemId }),

      setInventoryView: (view: InventoryView) => set({ inventoryView: view }),

      setSortBy: (sortBy: ItemSortBy) => set({ sortBy }),

      setFilterBy: (filterBy: InventoryFilter) => set({ filterBy }),

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'zimbomate-inventory-storage',
      partialize: (state) => ({
        inventoryView: state.inventoryView,
        sortBy: state.sortBy,
        filterBy: state.filterBy,
      }),
    },
  ),
)
