import React, { useMemo, useState } from 'react'
import { equipmentCompendiumService } from '../services/EquipmentCompendiumService'
import { resolveTagEffects } from '../utils/equipmentTagMechanics'

export default function EquipmentCompendium() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<string>('')
  const [maxWeight, setMaxWeight] = useState<number | ''>('')
  const [maxCoins, setMaxCoins] = useState<number | ''>('')

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
      <h2>Equipment Compendium</h2>
      <div className="ec__controls">
        <label htmlFor="ec-search">Search</label>
        <input id="ec-search" type="text" value={text} onChange={e => setText(e.target.value)} />

        <label htmlFor="ec-category">Category</label>
        <select id="ec-category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All</option>
          <option value="weapon">Weapon</option>
          <option value="armor">Armor</option>
          <option value="gear">Gear</option>
          <option value="consumable">Consumable</option>
          <option value="treasure">Treasure</option>
          <option value="magical">Magical</option>
        </select>

        <label htmlFor="ec-weight">Max Weight</label>
        <input id="ec-weight" type="number" value={maxWeight} onChange={e => setMaxWeight(e.target.value ? Number(e.target.value) : '')} />

        <label htmlFor="ec-coins">Max Coins</label>
        <input id="ec-coins" type="number" value={maxCoins} onChange={e => setMaxCoins(e.target.value ? Number(e.target.value) : '')} />
      </div>

      <ul className="ec__results">
        {results.map(item => (
          <li key={item.id} className="ec__item">
            <div className="ec__item-header">
              <strong>{item.name}</strong>
              <span>
                {' '}
                —
                {item.category}
              </span>
              <span>
                {' '}
                • wt
                {item.weight}
              </span>
              {typeof item.value === 'number' && (
                <span>
                  {' '}
                  •
                  {item.value}
                  {' '}
                  coins
                </span>
              )}
            </div>
            {item.description && <div className="ec__desc">{item.description}</div>}
            <div className="ec__tags">
              {(item.tags || []).map(t => (
                <span key={String(t.name) + String(t.value)} className="ec__tag">{t.value ? `${t.name} ${t.value}` : t.name}</span>
              ))}
            </div>
            <div className="ec__effects">
              {resolveTagEffects(item as any).map(e => (
                <span key={e.key} className="ec__effect">{e.description}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
