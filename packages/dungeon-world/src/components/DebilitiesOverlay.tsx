import React from 'react'
import { useGameStore } from '../store/GameStore'
import type { Debilities } from '../models/Character'

const DebilitiesOverlay: React.FC = () => {
  const { state, updateCharacter } = useGameStore()
  const characterId = state.activeCharacterId
  const deb: Debilities | undefined = state.activeCharacterId ? state.characters[state.activeCharacterId]?.debilities : undefined

  const toggle = (key: keyof Debilities) => {
    if (!characterId || !deb) return
    const next: Debilities = { ...deb, [key]: !deb[key] }
    updateCharacter(characterId, { debilities: next } as any)
  }

  const Row: React.FC<{ k: keyof Debilities, label: string }> = ({ k, label }) => (
    <label className="debility-item">
      <input type="checkbox" checked={!!deb?.[k]} onChange={() => toggle(k)} />
      <span> {label}</span>
    </label>
  )

  return (
    <div className="hp-sidebar-glass-content">
      <h3> Debilities</h3>
      <div className="debilities-grid">
        <Row k={'weak' as any} label="Weak (-1 STR)" />
        <Row k={'shaky' as any} label="Shaky (-1 DEX)" />
        <Row k={'sick' as any} label="Sick (-1 CON)" />
        <Row k={'confused' as any} label="Confused (-1 INT)" />
        <Row k={'scarred' as any} label="Scarred (-1 WIS)" />
        <Row k={'stunned' as any} label="Stunned (-1 CHA)" />
      </div>
    </div>
  )
}

export default DebilitiesOverlay


