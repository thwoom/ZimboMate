import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Tile } from './ui/Tile'

interface GlassMorphismDemoProps {
  className?: string
}

export function GlassMorphismDemo({ className }: GlassMorphismDemoProps) {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'advanced' | 'interactive'>('basic')

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Demo Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={activeDemo === 'basic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveDemo('basic')}
        >
          Basic Glass
        </Button>
        <Button
          variant={activeDemo === 'advanced' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveDemo('advanced')}
        >
          Advanced Glass
        </Button>
        <Button
          variant={activeDemo === 'interactive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveDemo('interactive')}
        >
          Interactive Glass
        </Button>
      </div>

      {/* Basic Glass Demo */}
      {activeDemo === 'basic' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Default Glass</h3>
            <p className="text-text-secondary text-sm">
              Standard glass morphism effect with balanced transparency and blur.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <div className="w-3 h-3 rounded-full bg-warning"></div>
            </div>
          </div>

          <div className="glass-subtle p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Subtle Glass</h3>
            <p className="text-text-secondary text-sm">
              Lighter glass effect for secondary content and backgrounds.
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-text-tertiary/30 rounded"></div>
              <div className="h-2 bg-text-tertiary/20 rounded w-3/4"></div>
              <div className="h-2 bg-text-tertiary/10 rounded w-1/2"></div>
            </div>
          </div>

          <div className="glass-strong p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Strong Glass</h3>
            <p className="text-text-secondary text-sm">
              Intense glass effect for modals and important overlays.
            </p>
            <div className="mt-4">
              <div className="glass-border p-3 rounded">
                <span className="text-xs text-text-tertiary">Nested glass content</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Glass Demo */}
      {activeDemo === 'advanced' && (
        <div className="space-y-6">
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-text-primary mb-4">Glass Panel</h3>
              <p className="text-text-secondary mb-6">
                Advanced glass panel with layered pseudo-elements for enhanced depth and visual appeal.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-surface p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">42</div>
                  <div className="text-xs text-text-secondary uppercase">Surface</div>
                </div>
                <div className="glass-header p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-success">18</div>
                  <div className="text-xs text-text-secondary uppercase">Header</div>
                </div>
                <div className="glass-ring p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-warning">7</div>
                  <div className="text-xs text-text-secondary uppercase">Ring</div>
                </div>
                <div className="glass-border p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-danger">3</div>
                  <div className="text-xs text-text-secondary uppercase">Border</div>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-glass p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Floating Glass</h3>
            <p className="text-text-secondary text-sm mb-4">
              Floating glass container with enhanced shadows and backdrop effects.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-subtle p-3 rounded text-center">
                  <div className="text-lg font-bold text-text-primary">{i}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Glass Demo */}
      {activeDemo === 'interactive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hover Effects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="glass-hover p-4 rounded-lg cursor-pointer transition-all duration-300">
                    <span className="text-sm">Hover over me</span>
                  </div>
                  <div className="glass-subtle glass-hover p-4 rounded-lg cursor-pointer transition-all duration-300">
                    <span className="text-sm">Subtle hover effect</span>
                  </div>
                  <div className="glass-strong glass-hover p-4 rounded-lg cursor-pointer transition-all duration-300">
                    <span className="text-sm">Strong hover effect</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modal Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="glass-modal p-6 rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-3">Modal Content</h4>
                  <p className="text-text-secondary text-sm mb-4">
                    This demonstrates how glass morphism works in modal overlays.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">Confirm</Button>
                    <Button size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tile variant="elevated" rows={2} cols={12} className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Tile with Glass</h3>
            <p className="text-text-secondary text-sm mb-4">
              Tiles automatically inherit glass morphism effects based on their variant.
            </p>
            <div className="flex flex-wrap gap-2">
              <Tile variant="default" rows={1} cols={2} className="p-3">
                <span className="text-sm">Default</span>
              </Tile>
              <Tile variant="elevated" rows={1} cols={2} className="p-3">
                <span className="text-sm">Elevated</span>
              </Tile>
              <Tile variant="subtle" rows={1} cols={2} className="p-3">
                <span className="text-sm">Subtle</span>
              </Tile>
            </div>
          </Tile>
        </div>
      )}

      {/* Glass Overlay Demo */}
      <div className="relative">
        <div className="glass-overlay fixed inset-0 z-40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-100 hover:pointer-events-auto">
          <div className="glass-modal p-8 rounded-lg max-w-md mx-4">
            <h3 className="text-xl font-bold text-text-primary mb-4">Glass Overlay</h3>
            <p className="text-text-secondary mb-6">
              This overlay demonstrates the full glass morphism system with backdrop blur and layered effects.
            </p>
            <Button size="sm" className="w-full">
              Close Overlay
            </Button>
          </div>
        </div>
        
        <div className="glass p-6 rounded-lg text-center cursor-pointer">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Hover for Overlay</h3>
          <p className="text-text-secondary text-sm">
            Hover over this card to see the glass overlay effect in action.
          </p>
        </div>
      </div>
    </div>
  )
}