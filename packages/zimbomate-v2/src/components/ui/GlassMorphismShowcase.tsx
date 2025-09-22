import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from './index'
import { Sparkles, Zap, Shield, Heart } from 'lucide-react'

export const GlassMorphismShowcase: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-display-md mb-4">Glass Morphism Effects</h2>
        <p className="text-body text-(--color-text-secondary)">
          Magical glass effects and enchanted surfaces for the fantasy theme
        </p>
      </div>

      {/* Glass Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} />
              Glass Surface
            </CardTitle>
            <CardDescription>
              Translucent magical surface with backdrop blur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              This card demonstrates the glass morphism effect with subtle transparency 
              and backdrop filtering.
            </p>
          </CardContent>
        </Card>

        <Card variant="magical" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Magical Glow
            </CardTitle>
            <CardDescription>
              Enchanted surface with golden magical effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              Features parchment texture with magical glow effects and 
              golden border highlights.
            </p>
          </CardContent>
        </Card>

        <Card variant="cyber" padding="lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Cyber Glass
            </CardTitle>
            <CardDescription>
              Futuristic glass surface with neon accents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-sm">
              Sci-fi themed glass effect with circuit patterns and 
              cyber blue glow effects.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-6">
        <h3 className="text-display-sm">Interactive Glass Elements</h3>
        
        <Card variant="glass" padding="lg">
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="magical">Magical Spell</Button>
                <Button variant="cyber">Cyber Command</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="magical">
                  <Heart size={12} />
                  Magical
                </Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="health">Health</Badge>
                <Badge variant="mana">Mana</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layered Glass Effects */}
      <div className="space-y-4">
        <h3 className="text-display-sm">Layered Effects</h3>
        
        <div className="relative p-8 glass-surface rounded-xl">
          <div className="absolute inset-4 glass-surface rounded-lg opacity-50" />
          <div className="relative z-10 text-center space-y-4">
            <h4 className="text-xl font-display">Layered Glass Morphism</h4>
            <p className="text-body">
              Multiple layers of glass effects create depth and magical atmosphere
            </p>
            <Button variant="magical">
              <Sparkles size={16} />
              Cast Enchantment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}