import React from 'react'
import { Tile } from '../ui/Tile'
import { Button } from '../ui/Button'

const basicMoves = [
  'Hack & Slash',
  'Volley', 
  'Defend',
  'Defy Danger',
  'Aid/Interfere'
]

export function QuickActionsTile() {
  const rollMove = (moveName: string) => {
    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const total = roll1 + roll2
    console.log(`${moveName}: ${roll1} + ${roll2} = ${total}`)
    // TODO: Show in UI with move results
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