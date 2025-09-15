import React from 'react'
import { Tile } from '../ui/Tile'
import { Button } from '../ui/Button'
import { usePreviewStore } from '../PreviewProvider'

const basicMoves = [
  'Hack & Slash',
  'Volley', 
  'Defend',
  'Defy Danger',
  'Aid/Interfere'
]

export function PreviewQuickActionsTile() {
  const { setRollResult } = usePreviewStore()

  const rollMove = (moveName: string) => {
    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const total = roll1 + roll2
    
    let result = ''
    if (total >= 10) result = 'Success!'
    else if (total >= 7) result = 'Partial Success'
    else result = 'Failure'
    
    setRollResult(`${moveName}: ${roll1} + ${roll2} = ${total} (${result})`)
  }

  return (
    <Tile variant="ghost" rows={1} cols={6} className="flex items-center justify-center gap-2">
      {basicMoves.map((move) => (
        <Button 
          key={move}
          variant="outline" 
          size="sm"
          onClick={() => rollMove(move)}
          className="flex-1 min-w-0"
        >
          <span className="truncate">{move}</span>
        </Button>
      ))}
    </Tile>
  )
}