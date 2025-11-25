import React from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { Sparkles } from 'lucide-react'

type ContextCard = {
  id: string
  title: string
  body: string
  type: 'tip' | 'warning'
}

const defaults: ContextCard[] = [
  {
    id: 'tip-secretary',
    title: 'Secretary tip',
    body: 'Describe what happened in the Secretary box to auto-apply HP/XP and log notes.',
    type: 'tip',
  },
  {
    id: 'tip-shortcut',
    title: 'Shortcut',
    body: 'Press Ctrl+K to open the command palette and jump to dice or gear tools.',
    type: 'tip',
  },
]

const SmartContextPanel: React.FC = () => (
  <Card variant='surface'>
    <CardContent className='space-y-3'>
      <div className='flex items-center gap-2 font-semibold'>
        <Sparkles size={16} /> Smart Context
      </div>
      <div className='space-y-2'>
        {defaults.map((card) => (
          <div key={card.id} className='rounded border px-3 py-2'>
            <div className='flex items-center gap-2 text-sm font-semibold'>
              <Badge variant={card.type === 'tip' ? 'secondary' : 'destructive'} className='text-[10px] uppercase tracking-wide'>
                {card.type}
              </Badge>
              {card.title}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>{card.body}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default SmartContextPanel

