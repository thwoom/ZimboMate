import React from 'react'
import { useCharacter, useGameStore } from '../../store/GameStore'

const AttributesSummaryCard: React.FC = () => {
  const preferred = useCharacter()
  const { state } = useGameStore()
  const c = preferred || (state.activeCharacterId ? state.characters[state.activeCharacterId] : Object.values(state.characters)[0])
  const attrs = (c as any)?.attributes || {}

  const pairs: Array<[string, number]> = [
    ['STR', attrs.STR], ['DEX', attrs.DEX], ['CON', attrs.CON],
    ['INT', attrs.INT], ['WIS', attrs.WIS], ['CHA', attrs.CHA],
  ]

  return (
    <article className="hud-card" aria-label="Attributes">
      <div className="hud-title">Attributes</div>
      <div className="hud-row hud-wrap">
        {pairs.map(([k,v]) => (
          <div key={k} className="hud-chip">
            <span className="hud-sub">{k}</span>
            <strong>{v ?? '-'}</strong>
          </div>
        ))}
      </div>
    </article>
  )
}

export default AttributesSummaryCard


