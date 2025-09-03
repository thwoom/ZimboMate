import React, { useMemo, useState } from 'react'
import { equipmentManagementService } from '../services/EquipmentManagementService'
import { useGameStore } from '../store/GameStore'

export default function EquipmentSets() {
  const { state } = useGameStore()
  const activeId = state.activeCharacterId
  const [name, setName] = useState('')

  const sets = useMemo(() => (activeId ? equipmentManagementService.getSets(activeId) : []), [activeId])
  const wishlist = useMemo(() => (activeId ? equipmentManagementService.getWishlist(activeId) : []), [activeId])

  if (!activeId)
    return null

  return (
    <div className="equipment-sets">
      <h3>Equipment Sets</h3>
      <div className="equipment-sets__create">
        <label htmlFor="set-name">New Set</label>
        <input id="set-name" type="text" value={name} onChange={e => setName(e.target.value)} />
        <button
          type="button"
          onClick={() => {
            if (!name.trim())
              return
            equipmentManagementService.createSet(activeId, name.trim(), [])
            setName('')
          }}
        >
          Create
        </button>
      </div>

      <ul>
        {sets.map(s => (
          <li key={s.id}>
            <strong>{s.name}</strong>
            {' '}
            <span>
              (
              {s.itemIds.length}
              {' '}
              items)
            </span>
          </li>
        ))}
      </ul>

      <h3>Wishlist</h3>
      <ul>
        {wishlist.map(id => (
          <li key={id}><code>{id}</code></li>
        ))}
      </ul>
    </div>
  )
}
