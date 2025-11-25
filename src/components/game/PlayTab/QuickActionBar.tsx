import React from 'react'
import { Dices, Heart, Plus } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import { useSecretaryStore } from '@/stores/secretaryStore'

const QuickActionBar: React.FC = () => {
  const applyActions = useSecretaryStore((s) => s.applyActions)

  const deal3Damage = () =>
    applyActions({
      text: 'take 3 damage',
      actions: [{ type: 'hpDelta', amount: -3, confidence: 1, from: 'rules', note: 'Quick action' }],
      confidence: 1,
      createdAt: Date.now(),
    })

  const mark1XP = () =>
    applyActions({
      text: 'mark 1 xp',
      actions: [{ type: 'xpGain', amount: 1, confidence: 1, from: 'rules' }],
      confidence: 1,
      createdAt: Date.now(),
    })

  return (
    <Card variant='surface'>
      <CardContent className='flex flex-wrap gap-2'>
        <Button size='sm' variant='primary' onClick={deal3Damage}>
          <Heart size={14} /> -3 HP
        </Button>
        <Button size='sm' variant='outline' onClick={mark1XP}>
          <Plus size={14} /> +1 XP
        </Button>
        <Button size='sm' variant='outline'>
          <Dices size={14} /> Roll 2d6
        </Button>
      </CardContent>
    </Card>
  )
}

export default QuickActionBar

