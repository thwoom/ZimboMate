import React, { createContext, useContext, useState, useEffect } from 'react'

// Mock character data for preview
const mockCharacter = {
  id: 'preview-character',
  name: 'Aeliana Brightblade',
  class: 'Fighter',
  level: 3,
  alignment: 'Chaotic Good',
  hp: { current: 18, max: 24 },
  xp: 12,
  armor: 2,
  damageDie: 'd10',
  attributes: {
    STR: 16,
    DEX: 13,
    CON: 15,
    INT: 8,
    WIS: 12,
    CHA: 9,
  },
  debilities: {
    weak: false,
    shaky: false,
    sick: false,
    confused: false,
    scarred: false,
    stunned: false,
  },
  advancements: [],
}

interface PreviewContextType {
  character: typeof mockCharacter
  updateCharacter: (updates: Partial<typeof mockCharacter>) => void
  rollResult: string | null
  setRollResult: (result: string | null) => void
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined)

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacter] = useState(mockCharacter)
  const [rollResult, setRollResult] = useState<string | null>(null)

  const updateCharacter = (updates: Partial<typeof mockCharacter>) => {
    setCharacter(prev => ({ ...prev, ...updates }))
  }

  // Auto-clear roll results after 3 seconds
  useEffect(() => {
    if (rollResult) {
      const timer = setTimeout(() => setRollResult(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [rollResult])

  return (
    <PreviewContext.Provider value={{ character, updateCharacter, rollResult, setRollResult }}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreviewStore() {
  const context = useContext(PreviewContext)
  if (!context) {
    throw new Error('usePreviewStore must be used within PreviewProvider')
  }
  return context
}