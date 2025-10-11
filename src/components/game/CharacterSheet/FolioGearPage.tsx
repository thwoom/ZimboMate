import type { Item } from '@/models/Equipment'

import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useChronicleLLM } from '@/components/chronicle/ChronicleProvider'
import { Button, Card, CardContent } from '@/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getEquippedSlot } from '@/models/Inventory'
import { useCharacterStore } from '@/stores/characterStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { logger } from '@/utils/logger'

import { createManualBundle } from './utils/manualBundle'

const EQUIP_SLOTS = [
  {
    id: 'main_hand',
    label: 'Main Hand',
    description: 'Primary weapon or tool',
  },
  { id: 'off_hand', label: 'Off Hand', description: 'Shield or off-hand item' },
  { id: 'armor', label: 'Armor', description: 'Worn armor or robes' },
] as const

export interface EquipmentChange {
  slot: string
  action: 'equip' | 'unequip'
  itemName?: string
}

export interface FolioGearPageProps {
  highlighted?: boolean
  onEquipmentChange?: (change: EquipmentChange) => void
}

export default function FolioGearPage({
  highlighted = false,
  onEquipmentChange,
}: FolioGearPageProps): JSX.Element {
  const inventory = useInventoryStore((state) => state.inventory)
  const activeCharacter = useCharacterStore((state) =>
    state.getActiveCharacter(),
  )
  const { applyDeltaBundle, canApplyAutomation, canAutoApply } =
    useChronicleLLM()

  const characterId = activeCharacter?.id ?? null
  const items = useMemo<Item[]>(() => {
    if (!inventory) return []
    return Object.values(inventory.items).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    )
  }, [inventory])

  const totalWeight = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.weight * Math.max(1, item.quantity ?? 1),
        0,
      ),
    [items],
  )

  const equippedCount = useMemo(
    () => items.filter((item) => item.equipped).length,
    [items],
  )

  const slotAssignments = useMemo(() => {
    if (!inventory) return new Map<string, Item>()
    const map = new Map<string, Item>()
    for (const item of Object.values(inventory.items)) {
      if (item?.equipped) {
        const slot = getEquippedSlot(inventory, item.id) ?? 'equipped'
        map.set(slot, item)
      }
    }
    return map
  }, [inventory])

  const [pendingSlot, setPendingSlot] = useState<string | null>(null)
  const inventoryListRef = useRef<HTMLDivElement>(null)
  const inventoryVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => inventoryListRef.current,
    estimateSize: () => 72,
    overscan: 6,
  })

  const handleBundle = useCallback(
    async (ops, slotId) => {
      if (ops.length === 0) return true
      if (!canApplyAutomation) {
        logger.warn(
          '[folio] Equipment change ignored: automation is read-only in this rollout stage.',
        )
        return false
      }
      try {
        setPendingSlot(slotId ?? null)
        const bundle = createManualBundle(ops)
        await applyDeltaBundle({
          bundle,
          autoApply: canAutoApply,
          selectedOpIndices: ops.map((_, index) => index),
        })
        return true
      } catch (error) {
        logger.error('[folio] Failed to apply equipment bundle', error)
        return false
      } finally {
        setPendingSlot(null)
      }
    },
    [applyDeltaBundle, canApplyAutomation, canAutoApply],
  )

  const handleEquip = useCallback(
    async (slotId: string, itemId: string) => {
      if (!characterId || !inventory) return
      const target = inventory.items[itemId]
      if (!target) {
        logger.warn('[folio] Equip request ignored: missing inventory item', {
          slotId,
          itemId,
        })
        return
      }

      const currentInSlot = items.find(
        (item) =>
          item.equipped && getEquippedSlot(inventory, item.id) === slotId,
      )
      const currentSlotOfItem = target.equipped
        ? getEquippedSlot(inventory, target.id)
        : undefined

      const ops = []
      if (currentSlotOfItem) {
        ops.push({
          type: 'unequip_item' as const,
          characterId,
          itemId: target.id,
          reason: 'Folio manual adjust',
        })
      }
      if (currentInSlot && currentInSlot.id !== target.id) {
        ops.push({
          type: 'unequip_item' as const,
          characterId,
          itemId: currentInSlot.id,
          reason: 'Folio manual adjust',
        })
      }
      ops.push({
        type: 'equip_item' as const,
        characterId,
        itemId: target.id,
        slot: slotId,
        reason: 'Folio manual adjust',
      })

      const success = await handleBundle(ops, slotId)
      if (success) {
        onEquipmentChange?.({
          slot: slotId,
          action: 'equip',
          itemName: target.name,
        })
      }
    },
    [characterId, handleBundle, inventory, items, onEquipmentChange],
  )

  const handleUnequip = useCallback(
    async (slotId: string, item: Item | undefined) => {
      if (!characterId || !item) return
      const success = await handleBundle(
        [
          {
            type: 'unequip_item' as const,
            characterId,
            itemId: item.id,
            reason: 'Folio manual adjust',
          },
        ],
        slotId,
      )
      if (success) {
        onEquipmentChange?.({
          slot: slotId,
          action: 'unequip',
          itemName: item.name,
        })
      }
    },
    [characterId, handleBundle, onEquipmentChange],
  )

  if (!inventory) {
    return (
      <Card>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Equipment
          </h3>
          <p className='text-muted-foreground text-sm'>
            Inventory data is unavailable. Open a character or session to manage
            gear.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <Card className={highlighted ? 'ring-2 ring-primary/60' : undefined}>
        <CardContent className='p-3'>
          <h3 className='text-foreground mb-2 text-sm font-medium'>
            Equipped slots
          </h3>
          <div className='space-y-3'>
            {EQUIP_SLOTS.map((slot) => {
              const currentItem = slotAssignments.get(slot.id)
              const eligibleItems = items.filter((item) => {
                if (!item) return false
                if (!item.equipped) return true
                return getEquippedSlot(inventory, item.id) === slot.id
              })

              const selectDisabled = pendingSlot === slot.id

              return (
                <div
                  key={slot.id}
                  className='border-border rounded-md border p-3 shadow-sm'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        {slot.label}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {slot.description}
                      </p>
                    </div>
                    {currentItem ? (
                      <Button
                        type='button'
                        variant='outline'
                        size='xs'
                        onClick={() => void handleUnequip(slot.id, currentItem)}
                        disabled={selectDisabled}
                      >
                        Unequip
                      </Button>
                    ) : null}
                  </div>
                  <div className='mt-3 flex flex-col gap-2'>
                    <Select
                      value={currentItem?.id}
                      onValueChange={(value) =>
                        void handleEquip(slot.id, value)
                      }
                      disabled={selectDisabled}
                    >
                      <SelectTrigger
                        aria-label={`Equip item for ${slot.label}`}
                      >
                        <SelectValue
                          placeholder={
                            currentItem ? currentItem.name : 'Select item'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleItems.length === 0 ? (
                          <SelectItem value='__none__' disabled>
                            No items available
                          </SelectItem>
                        ) : (
                          eligibleItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-muted-foreground'>
                      {currentItem
                        ? (currentItem.description ?? 'Equipped')
                        : 'No item equipped'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card className={highlighted ? 'ring-2 ring-primary/60' : undefined}>
        <CardContent className='p-3'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='text-foreground text-sm font-medium'>
              Inventory overview
            </h3>
            {activeCharacter?.load ? (
              <span className='text-muted-foreground text-[11px] uppercase tracking-wide'>
                Load {activeCharacter.load.current}/{activeCharacter.load.max}
              </span>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className='text-muted-foreground mt-2 text-sm'>
              Your packs are empty. Add gear from the Inventory tab to see it
              here.
            </p>
          ) : (
            <div className='mt-3 space-y-3'>
              <div className='text-muted-foreground flex items-center justify-between text-xs'>
                <span>
                  {items.length} item{items.length === 1 ? '' : 's'} •{' '}
                  {equippedCount} equipped
                </span>
                <span>
                  {totalWeight.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                  })}{' '}
                  weight
                </span>
              </div>
              <div
                ref={inventoryListRef}
                className='border-border max-h-72 overflow-y-auto rounded-md border'
              >
                <div
                  style={{
                    height: `${inventoryVirtualizer.getTotalSize()}px`,
                    position: 'relative',
                  }}
                >
                  {inventoryVirtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index]
                    if (!item) return null

                    const tags = item.tags
                      .slice(0, 4)
                      .map((tag) =>
                        typeof tag.value !== 'undefined' &&
                        tag.value !== null &&
                        tag.value !== ''
                          ? `${tag.name} ${tag.value}`
                          : tag.name,
                      )
                      .join(', ')

                    return (
                      <div
                        key={item.id}
                        data-index={virtualRow.index}
                        className='border-border bg-card/80 hover:bg-muted/40 absolute inset-x-0 mx-2 my-1 rounded-md border px-3 py-2 text-sm shadow-sm transition-colors'
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='text-foreground truncate font-medium'>
                              {item.name}
                            </p>
                            <p className='text-muted-foreground text-xs capitalize'>
                              {item.category}
                            </p>
                          </div>
                          <div className='text-right text-[11px] text-muted-foreground'>
                            <div>Qty {Math.max(1, item.quantity ?? 1)}</div>
                            <div>
                              {(
                                item.weight * Math.max(1, item.quantity ?? 1)
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 1,
                              })}{' '}
                              wt
                            </div>
                          </div>
                        </div>
                        {tags ? (
                          <p className='text-muted-foreground mt-1 truncate text-[11px]'>
                            {tags}
                          </p>
                        ) : null}
                        {item.equipped ? (
                          <span className='text-primary mt-2 inline-block text-[11px] font-semibold uppercase'>
                            Equipped
                          </span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
