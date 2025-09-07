import React, { useMemo, useState } from 'react'
import { equipmentCompendiumService } from '../services/EquipmentCompendiumService'
import { resolveTagEffects } from '../utils/equipmentTagMechanics'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { itemFadeIn, staggerContainer } from '../utils/motion'

export default function EquipmentCompendium() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<string>('')
  const [maxWeight, setMaxWeight] = useState<number | ''>('')
  const [maxCoins, setMaxCoins] = useState<number | ''>('')
  const prefersReduced = useReducedMotion()

  const results = useMemo(() => {
    return equipmentCompendiumService.search({
      text,
      category: category || undefined,
      maxWeight: typeof maxWeight === 'number' ? maxWeight : undefined,
      maxCoins: typeof maxCoins === 'number' ? maxCoins : undefined,
    })
  }, [text, category, maxWeight, maxCoins])

  return (
    <div className="equipment-compendium">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Equipment Compendium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="ec-search" className="text-sm text-[--color-muted-foreground]">Search</label>
              <Input id="ec-search" value={text} onChange={e => setText(e.target.value)} placeholder="Search by name or tag" />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ec-category" className="text-sm text-[--color-muted-foreground]">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="weapon">Weapon</SelectItem>
                  <SelectItem value="armor">Armor</SelectItem>
                  <SelectItem value="gear">Gear</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="treasure">Treasure</SelectItem>
                  <SelectItem value="magical">Magical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ec-weight" className="text-sm text-[--color-muted-foreground]">Max Weight</label>
              <Input id="ec-weight" type="number" value={maxWeight as any} onChange={e => setMaxWeight(e.target.value ? Number((e.target as HTMLInputElement).value) : '')} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ec-coins" className="text-sm text-[--color-muted-foreground]">Max Coins</label>
              <Input id="ec-coins" type="number" value={maxCoins as any} onChange={e => setMaxCoins(e.target.value ? Number((e.target as HTMLInputElement).value) : '')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <motion.div className="grid gap-3" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {results.map(item => (
          <motion.div key={item.id} variants={itemFadeIn} whileHover={prefersReduced ? undefined : { scale: 1.01 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <strong className="mr-1">{item.name}</strong>
                  <span className="text-[--color-muted-foreground]">— {item.category}</span>
                  <span className="text-[--color-muted-foreground]">• wt {item.weight}</span>
                  {typeof item.value === 'number' && (
                    <span className="text-[--color-muted-foreground]">• {item.value} coins</span>
                  )}
                </div>
                {item.description && <div className="mt-2 text-sm text-[--color-muted-foreground]">{item.description}</div>}
                <div className="mt-2 flex flex-wrap gap-1">
                  {(item.tags || []).map(t => (
                    <span key={String(t.name) + String(t.value)} className="px-2 py-0.5 rounded-[--radius-sm] bg-[--color-muted] text-[--color-muted-foreground] text-xs">
                      {t.value ? `${t.name} ${t.value}` : t.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {resolveTagEffects(item as any).map(e => (
                    <span key={e.key} className="px-2 py-0.5 rounded-[--radius-sm] bg-[--color-accent] text-[--color-accent-foreground] text-xs">{e.description}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
