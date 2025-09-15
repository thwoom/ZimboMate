import React from 'react'
import { usePreviewStore } from './PreviewProvider'
import { Card } from './ui/Card'

export function RollResultDisplay() {
  const { rollResult } = usePreviewStore()

  if (!rollResult) return null

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in">
      <Card className="p-4 glass-strong border-primary/50">
        <div className="text-sm font-mono text-text-primary">
          🎲 {rollResult}
        </div>
      </Card>
    </div>
  )
}