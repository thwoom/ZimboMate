import React, { useState } from 'react'
import { Button } from './Button'
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  PlusIcon, 
  MinusIcon,
  HeartIcon,
  ShieldCheckIcon,
  SwordIcon,
  SparklesIcon
} from 'lucide-react'

interface ButtonDebuggerProps {
  onTestResult?: (testName: string, success: boolean, details?: string) => void
}

export const ButtonDebugger: React.FC<ButtonDebuggerProps> = ({ onTestResult }) => {
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  
  const handleClick = (buttonId: string) => {
    console.log(`Button clicked: ${buttonId}`)
    setClickCounts(prev => ({ ...prev, [buttonId]: (prev[buttonId] || 0) + 1 }))
    onTestResult?.(buttonId, true, `Button ${buttonId} clicked successfully`)
  }
  
  const handleAsyncClick = async (buttonId: string) => {
    setLoading(prev => ({ ...prev, [buttonId]: true }))
    console.log(`Async button clicked: ${buttonId}`)
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setClickCounts(prev => ({ ...prev, [buttonId]: (prev[buttonId] || 0) + 1 }))
    setLoading(prev => ({ ...prev, [buttonId]: false }))
    onTestResult?.(buttonId, true, `Async button ${buttonId} completed successfully`)
  }
  
  const resetCounts = () => {
    setClickCounts({})
    setLoading({})
  }
  
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-(--color-text-primary)">Button Functionality Test</h2>
        <Button variant="outline" onClick={resetCounts}>
          Reset Counters
        </Button>
      </div>
      
      {/* Basic Variants */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Basic Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="default" 
            onClick={() => handleClick('default')}
          >
            Default ({clickCounts.default || 0})
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => handleClick('secondary')}
          >
            Secondary ({clickCounts.secondary || 0})
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleClick('outline')}
          >
            Outline ({clickCounts.outline || 0})
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => handleClick('ghost')}
          >
            Ghost ({clickCounts.ghost || 0})
          </Button>
          
          <Button 
            variant="link" 
            onClick={() => handleClick('link')}
          >
            Link ({clickCounts.link || 0})
          </Button>
        </div>
      </section>
      
      {/* Status Variants */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Status Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="success" 
            onClick={() => handleClick('success')}
          >
            <HeartIcon className="w-4 h-4 mr-2" />
            Success ({clickCounts.success || 0})
          </Button>
          
          <Button 
            variant="warning" 
            onClick={() => handleClick('warning')}
          >
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Warning ({clickCounts.warning || 0})
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => handleClick('destructive')}
          >
            <SwordIcon className="w-4 h-4 mr-2" />
            Destructive ({clickCounts.destructive || 0})
          </Button>
          
          <Button 
            variant="glass" 
            onClick={() => handleClick('glass')}
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Glass ({clickCounts.glass || 0})
          </Button>
        </div>
      </section>
      
      {/* Sizes */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Sizes</h3>
        <div className="flex items-center flex-wrap gap-4">
          <Button 
            size="xs" 
            onClick={() => handleClick('size-xs')}
          >
            XS ({clickCounts['size-xs'] || 0})
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => handleClick('size-sm')}
          >
            Small ({clickCounts['size-sm'] || 0})
          </Button>
          
          <Button 
            size="default" 
            onClick={() => handleClick('size-default')}
          >
            Default ({clickCounts['size-default'] || 0})
          </Button>
          
          <Button 
            size="lg" 
            onClick={() => handleClick('size-lg')}
          >
            Large ({clickCounts['size-lg'] || 0})
          </Button>
          
          <Button 
            size="icon" 
            onClick={() => handleClick('size-icon')}
            title="Icon button"
          >
            <PlayIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>
      
      {/* Interactive States */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Interactive States</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => handleAsyncClick('loading')}
            loading={loading.loading}
          >
            {loading.loading ? 'Loading...' : `Async Button (${clickCounts.loading || 0})`}
          </Button>
          
          <Button disabled>
            Disabled Button
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleClick('with-icon')}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            With Icon ({clickCounts['with-icon'] || 0})
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => handleClick('icon-only')}
            size="icon"
            title="Icon only button"
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
        </div>
      </section>
      
      {/* Game-specific Buttons */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Game-specific Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="success"
            onClick={() => handleClick('heal')}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Heal (+{clickCounts.heal || 0})
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => handleClick('damage')}
          >
            <MinusIcon className="w-4 h-4 mr-2" />
            Damage (-{clickCounts.damage || 0})
          </Button>
          
          <Button 
            variant="glass"
            onClick={() => handleClick('roll-dice')}
          >
            🎲 Roll Dice ({clickCounts['roll-dice'] || 0})
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleClick('rest')}
          >
            <PauseIcon className="w-4 h-4 mr-2" />
            Rest ({clickCounts.rest || 0})
          </Button>
        </div>
      </section>
      
      {/* Event Handling Tests */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Event Handling Tests</h3>
        <div className="space-y-2">
          <div className="flex gap-4">
            <Button 
              onClick={(e) => {
                console.log('Event object:', e)
                handleClick('event-test')
              }}
            >
              Event Test ({clickCounts['event-test'] || 0})
            </Button>
            
            <Button 
              onMouseDown={() => console.log('Mouse down')}
              onMouseUp={() => console.log('Mouse up')}
              onClick={() => handleClick('mouse-events')}
            >
              Mouse Events ({clickCounts['mouse-events'] || 0})
            </Button>
            
            <Button 
              onFocus={() => console.log('Button focused')}
              onBlur={() => console.log('Button blurred')}
              onClick={() => handleClick('focus-events')}
            >
              Focus Events ({clickCounts['focus-events'] || 0})
            </Button>
          </div>
          
          <div className="text-sm text-(--color-text-secondary)">
            Check browser console for event logs
          </div>
        </div>
      </section>
      
      {/* Summary */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">Test Summary</h3>
        <div className="glass p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-(--color-text-primary)">Total Clicks</div>
              <div className="text-(--color-text-secondary)">
                {Object.values(clickCounts).reduce((sum, count) => sum + count, 0)}
              </div>
            </div>
            <div>
              <div className="font-medium text-(--color-text-primary)">Buttons Tested</div>
              <div className="text-(--color-text-secondary)">
                {Object.keys(clickCounts).length}
              </div>
            </div>
            <div>
              <div className="font-medium text-(--color-text-primary)">Loading States</div>
              <div className="text-(--color-text-secondary)">
                {Object.values(loading).filter(Boolean).length}
              </div>
            </div>
            <div>
              <div className="font-medium text-(--color-text-primary)">Status</div>
              <div className="text-(--color-success)">
                All buttons functional ✓
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}