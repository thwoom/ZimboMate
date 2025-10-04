import {
  Dice6Icon,
  HeartIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SwordIcon,
  WandIcon,
} from 'lucide-react'
import React, { useState } from 'react'
import { logger } from '../../utils/logger'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

interface ButtonDebuggerProps {
  onTestResult?: (testName: string, success: boolean, details?: string) => void
}

export const ButtonDebugger: React.FC<ButtonDebuggerProps> = ({
  onTestResult,
}) => {
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleClick = (buttonId: string) => {
    logger.debug(`🎯 ZimboMate Button clicked: ${buttonId}`)
    setClickCounts((prev) => ({
      ...prev,
      [buttonId]: (prev[buttonId] || 0) + 1,
    }))
    onTestResult?.(buttonId, true, `Button ${buttonId} clicked successfully`)
  }

  const handleAsyncClick = async (buttonId: string) => {
    setLoading((prev) => ({ ...prev, [buttonId]: true }))
    logger.debug(`⏳ ZimboMate Async button clicked: ${buttonId}`)

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setClickCounts((prev) => ({
      ...prev,
      [buttonId]: (prev[buttonId] || 0) + 1,
    }))
    setLoading((prev) => ({ ...prev, [buttonId]: false }))
    onTestResult?.(
      buttonId,
      true,
      `Async button ${buttonId} completed successfully`,
    )
  }

  const resetCounts = () => {
    setClickCounts({})
    setLoading({})
  }

  return (
    <div className='space-y-8 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-display-md'>ZimboMate v2 Button Test Suite</h2>
          <p className='text-muted-foreground'>
            Interactive testing for all button variants and states
          </p>
        </div>
        <Button variant='outline' onClick={resetCounts}>
          Reset Counters
        </Button>
      </div>

      {/* ZimboMate Button Variants */}
      <Card variant='magical'>
        <CardHeader>
          <CardTitle>ZimboMate Button Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button variant='primary' onClick={() => handleClick('primary')}>
              Primary ({clickCounts.primary || 0})
            </Button>

            <Button
              variant='secondary'
              onClick={() => handleClick('secondary')}
            >
              Secondary ({clickCounts.secondary || 0})
            </Button>

            <Button variant='outline' onClick={() => handleClick('outline')}>
              Outline ({clickCounts.outline || 0})
            </Button>

            <Button variant='ghost' onClick={() => handleClick('ghost')}>
              Ghost ({clickCounts.ghost || 0})
            </Button>

            <Button
              variant='destructive'
              onClick={() => handleClick('destructive')}
            >
              <SwordIcon size={16} />
              Destructive ({clickCounts.destructive || 0})
            </Button>

            <Button variant='magical' onClick={() => handleClick('magical')}>
              <SparklesIcon size={16} />
              Magical ({clickCounts.magical || 0})
            </Button>

            <Button variant='cyber' onClick={() => handleClick('cyber')}>
              <WandIcon size={16} />
              Cyber ({clickCounts.cyber || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Button Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center flex-wrap gap-4'>
            <Button size='sm' onClick={() => handleClick('size-sm')}>
              Small ({clickCounts['size-sm'] || 0})
            </Button>

            <Button size='md' onClick={() => handleClick('size-md')}>
              Medium ({clickCounts['size-md'] || 0})
            </Button>

            <Button size='lg' onClick={() => handleClick('size-lg')}>
              Large ({clickCounts['size-lg'] || 0})
            </Button>

            <Button size='xl' onClick={() => handleClick('size-xl')}>
              Extra Large ({clickCounts['size-xl'] || 0})
            </Button>

            <Button
              size='icon'
              onClick={() => handleClick('size-icon')}
              title='Icon button'
            >
              <PlayIcon size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive States */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button
              onClick={() => handleAsyncClick('loading')}
              disabled={loading.loading}
            >
              {loading.loading ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                  Loading...
                </div>
              ) : (
                `Async Button (${clickCounts.loading || 0})`
              )}
            </Button>

            <Button disabled>Disabled Button</Button>

            <Button variant='outline' onClick={() => handleClick('with-icon')}>
              <PlusIcon size={16} />
              With Icon ({clickCounts['with-icon'] || 0})
            </Button>

            <Button
              variant='ghost'
              onClick={() => handleClick('icon-only')}
              size='icon'
              title='Icon only button'
            >
              <MinusIcon size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game-specific Actions */}
      <Card variant='magical'>
        <CardHeader>
          <CardTitle>Dungeon World Game Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button variant='magical' onClick={() => handleClick('heal')}>
              <HeartIcon size={16} />
              Heal (+
              {clickCounts.heal || 0})
            </Button>

            <Button variant='destructive' onClick={() => handleClick('damage')}>
              <SwordIcon size={16} />
              Damage (-
              {clickCounts.damage || 0})
            </Button>

            <Button variant='cyber' onClick={() => handleClick('roll-dice')}>
              <Dice6Icon size={16} />
              Roll Dice ({clickCounts['roll-dice'] || 0})
            </Button>

            <Button variant='secondary' onClick={() => handleClick('rest')}>
              <PauseIcon size={16} />
              Rest ({clickCounts.rest || 0})
            </Button>

            <Button variant='outline' onClick={() => handleClick('defend')}>
              <ShieldCheckIcon size={16} />
              Defend ({clickCounts.defend || 0})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Handling Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Event Handling Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex gap-4'>
              <Button
                onClick={(e) => {
                  logger.debug('🔍 Event object:', e)
                  logger.debug('🔍 Target:', e.target)
                  logger.debug('🔍 Current target:', e.currentTarget)
                  handleClick('event-test')
                }}
              >
                Event Test ({clickCounts['event-test'] || 0})
              </Button>

              <Button
                onMouseDown={() => logger.debug('🖱️ Mouse down')}
                onMouseUp={() => logger.debug('🖱️ Mouse up')}
                onClick={() => handleClick('mouse-events')}
              >
                Mouse Events ({clickCounts['mouse-events'] || 0})
              </Button>

              <Button
                onFocus={() => logger.debug('🎯 Button focused')}
                onBlur={() => logger.debug('🎯 Button blurred')}
                onClick={() => handleClick('focus-events')}
              >
                Focus Events ({clickCounts['focus-events'] || 0})
              </Button>
            </div>

            <div className='text-sm text-muted-foreground'>
              💡 Check browser console for detailed event logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>
                {Object.values(clickCounts).reduce(
                  (sum, count) => sum + count,
                  0,
                )}
              </div>
              <div className='text-sm text-muted-foreground'>Total Clicks</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-secondary'>
                {Object.keys(clickCounts).length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Buttons Tested
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-[color:var(--yellow-500)]'>
                {Object.values(loading).filter(Boolean).length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Loading States
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-[color:var(--nature-500)]'>
                <Badge variant='default'>All Working ✅</Badge>
              </div>
              <div className='text-sm text-muted-foreground'>Status</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
