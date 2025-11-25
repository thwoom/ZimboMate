import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Shield, Sparkles } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'
import { useInventoryStore } from '@/stores/inventoryStore'
import { createEmptyInventory } from '@/models/Inventory'
import type { Item } from '@/models/Equipment'

export interface EquipmentChange {
  slot: string
  action: 'equip' | 'unequip'
  itemName?: string
}

interface FolioGearPageProps {
  highlighted?: boolean
  onEquipmentChange?: (change: EquipmentChange) => void
}

const DEFAULT_CONTAINER = 'carried'

function makeItem(name: string): Item {
  const id = `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
  return {
    id,
    name,
    description: 'Custom item',
    tags: [],
    quantity: 1,
    weight: 1,
    value: 0,
    equipped: false,
  }
}

const FolioGearPage: React.FC<FolioGearPageProps> = ({ highlighted, onEquipmentChange }) => {
  const inventory = useInventoryStore((s) => s.inventory)
  const setInventory = useInventoryStore((s) => s.setInventory)
  const addItemToInventory = useInventoryStore((s) => s.addItemToInventory)
  const toggleItemEquipped = useInventoryStore((s) => s.toggleItemEquipped)
  const [newItemName, setNewItemName] = useState('')

  useEffect(() => {
    if (!inventory) setInventory(createEmptyInventory())
  }, [inventory, setInventory])

  const items = inventory?.items ?? {}
  const equippedIds = useMemo(() => inventory?.containers.find((c) => c.id === 'equipped')?.items ?? [], [inventory])
  const list = useMemo(() => Object.values(items), [items])

  const handleAdd = () => {
    const name = newItemName.trim()
    if (!name) return
    const item = makeItem(name)
    addItemToInventory(item, DEFAULT_CONTAINER)
    setNewItemName('')
  }

  const handleToggleEquip = (itemId: string, itemName: string) => {
    const nowEquipped = !equippedIds.includes(itemId)
    toggleItemEquipped(itemId, 'main_hand')
    onEquipmentChange?.({ slot: 'main_hand', action: nowEquipped ? 'equip' : 'unequip', itemName })
  }

  return (
    <Card variant={highlighted ? 'elevated' : 'surface'}>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 font-semibold'>
            <Shield size={16} /> Gear
          </div>
          <div className='flex gap-2'>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder='Add item'
              className='h-8'
            />
            <Button size='sm' variant='primary' onClick={handleAdd}>
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className='text-sm text-muted-foreground'>No gear yet. Add your first item.</div>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
            {list.map((item) => {
              const equipped = equippedIds.includes(item.id)
              return (
                <div key={item.id} className='rounded border px-3 py-2 flex items-start justify-between gap-2'>
                  <div className='space-y-1'>
                    <div className='font-semibold text-sm flex items-center gap-2'>
                      {equipped ? <Sparkles size={14} className='text-primary' /> : <Shield size={14} />}
                      {item.name}
                    </div>
                    <div className='text-xs text-muted-foreground'>Load: {item.weight ?? 1}</div>
                    {item.tags?.length ? (
                      <div className='flex flex-wrap gap-1'>
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant='outline' className='text-[11px]'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button size='sm' variant={equipped ? 'secondary' : 'outline'} onClick={() => handleToggleEquip(item.id, item.name)}>
                    {equipped ? 'Unequip' : 'Equip'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FolioGearPage
