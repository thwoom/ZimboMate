import React, { useMemo } from 'react'
import { useGameStore } from '../store/GameStore'
import { getEffectiveModifier } from '../models/Character'

const AttributesOverlay: React.FC = () => {
  const { state } = useGameStore()
  const character = useMemo(() => state.activeCharacterId ? state.characters[state.activeCharacterId] : null, [state])
  const attributes = character?.attributes || (state as any).attributes
  const debilities = character?.debilities || (state as any).debilities
  const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`)

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Attributes</h3>
      <div className="attributes-grid">
        {attributes && Object.entries(attributes).map(([attr, score]) => {
          const mod = getEffectiveModifier(attr as any, attributes as any, debilities as any)
          const hasDeb = (
            (attr === 'STR' && debilities?.weak)
            || (attr === 'DEX' && debilities?.shaky)
            || (attr === 'CON' && debilities?.sick)
            || (attr === 'INT' && debilities?.stunned)
            || (attr === 'WIS' && debilities?.confused)
            || (attr === 'CHA' && debilities?.scarred)
          )
          return (
            <div key={attr} className="attribute-card">
              <button
                className={`attribute-button ${hasDeb ? 'attribute-button--debility' : ''}`}
                title={`Roll 2d6${formatModifier(mod)}`}
                onClick={() => {
                  const total = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
                  window.dispatchEvent(new CustomEvent('quick-roll', { detail: { attr, total, mod } } as any))
                }}
                type="button"
              >
                <span className="attribute-name">{attr}</span>
                <span className="attribute-score">{score as number}</span>
                <span className="attribute-modifier">{formatModifier(mod)}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AttributesOverlay


