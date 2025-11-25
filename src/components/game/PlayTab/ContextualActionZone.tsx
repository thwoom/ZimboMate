import React from 'react'
import { Shield, Sword, Wand2 } from 'lucide-react'
import { Card, CardContent, Button } from '@/components/ui'
import DiceRoller from '../DiceRoller'
import { useCharacterStore } from '@/stores/characterStore'

interface ContextualActionZoneProps {
  className?: string
  onRoll?: (result: any) => void
}

export const ContextualActionZone: React.FC<ContextualActionZoneProps> = ({
  className = '',
  onRoll,
}) => {
  const { getActiveCharacter } = useCharacterStore()
  const activeCharacter = getActiveCharacter?.()
  const name = activeCharacter?.name ?? 'your character'

  return (
    <Card className={className}>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 font-semibold'>
            <Sword size={16} /> Quick Actions
          </div>
          <div className='text-xs text-muted-foreground'>For {name}</div>
        </div>
        <div className='flex gap-2 flex-wrap'>
          <Button size='sm' variant='outline'>
            <Shield size={14} /> Defy Danger
          </Button>
          <Button size='sm' variant='outline'>
            <Wand2 size={14} /> Cast Spell
          </Button>
        </div>
        <DiceRoller onRoll={onRoll as any} characterId={activeCharacter?.id} />
      </CardContent>
    </Card>
  )
}

export default ContextualActionZone
