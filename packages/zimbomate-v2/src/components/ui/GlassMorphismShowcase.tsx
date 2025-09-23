import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from './index'
import { Sparkles, Zap, BookOpen, Heart } from 'lucide-react'

export const GlassMorphismShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-md mb-4">Matsu Surface Showcase</h2>
        <p className="text-body text-(--color-text-secondary)">
          Explore the layered surfaces available in the Matsu theme—soft card panels, magical glow states, and parchment-inspired containers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="surface">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} />
              Soft Surface
            </CardTitle>
            <CardDescription>
              Neutral container using the elevated surface tokens for everyday UI sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              Surface cards pair the base card colors with subtle shadows so secondary panels feel grounded without stealing focus.
            </p>
          </CardContent>
        </Card>

        <Card variant="magical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Magical Highlight
            </CardTitle>
            <CardDescription>
              Gradient glow and bespoke border styling for celebratory or spotlight content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              Use the magical variant for achievements, hero panels, or system feedback that deserves extra attention.
            </p>
          </CardContent>
        </Card>

        <Card variant="parchment">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} />
              Parchment Panel
            </CardTitle>
            <CardDescription>
              Warm parchment tones suited to lore entries, journals, or campaign notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              The parchment styling embraces the tabletop vibe with gentle gradients and vintage paper hues.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-display-sm">Interactive Surfaces</h3>

        <Card variant="surface">
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="magical">Magical Spell</Button>
              <Button variant="outline">Outline</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="magical" className="gap-1">
                <Heart size={12} />
                Magical
              </Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="health">Health</Badge>
              <Badge variant="mana">Mana</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-display-sm">Layered Depth</h3>

        <div className="relative rounded-xl bg-(--color-surface-elevated) p-10 shadow-lg">
          <div className="absolute inset-2 rounded-lg border border-(--color-border) opacity-60" />
          <div className="relative z-10 text-center space-y-4">
            <h4 className="text-xl font-display">Stacked Panels</h4>
            <p className="text-body">
              Combine surface variants and border accents to create depth without relying on frosted-glass blur effects.
            </p>
            <Button variant="magical">
              <Sparkles size={16} />
              Activate Glow
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}