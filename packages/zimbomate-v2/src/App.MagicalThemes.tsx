import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { FontLoader } from './components/ui/FontLoader'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { Progress } from './components/ui/Progress'
import { useTheme } from './components/ui/ThemeProvider'
import { 
  Sparkles, 
  Flame, 
  Leaf, 
  Zap, 
  Mountain, 
  Moon, 
  Star,
  Heart,
  Shield,
  Sword,
  Wand2,
  Crown
} from 'lucide-react'

const themeDescriptions = {
  'fantasy': 'Classic parchment and gold fantasy theme with warm, magical tones',
  'dark': 'Sleek dark theme with golden accents for nighttime gaming',
  'light': 'Clean light theme with subtle golden touches for bright environments',
  'sci-fi': 'Futuristic cyber theme with neon blue and green accents',
  'moonlit-grimoire': 'Ancient manuscript style with Uncial Antiqua headers - scholarly magic under starlit skies',
  'dragonforge-ember': 'Bold Metamorphous lettering with crimson flames - the power of dragon-forged steel',
  'enchanted-grove': 'Organic Kalam script with forest greens - where nature\'s handwriting meets mysticism',
  'arcane-storm': 'Futuristic Orbitron typography with electric energy - technology meets raw magical force',
  'ancient-sandstone': 'Classical Cinzel carved in stone - timeless mysteries of ancient civilizations'
}

const themeIcons = {
  'fantasy': Crown,
  'dark': Moon,
  'light': Star,
  'sci-fi': Zap,
  'moonlit-grimoire': Moon,
  'dragonforge-ember': Flame,
  'enchanted-grove': Leaf,
  'arcane-storm': Zap,
  'ancient-sandstone': Mountain
}

function ThemeShowcaseContent() {
  const { theme } = useTheme()
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [progress, setProgress] = useState(75)
  const [fontsLoaded, setFontsLoaded] = useState(false)
  
  const ThemeIcon = themeIcons[theme as keyof typeof themeIcons] || Crown
  
  const handleFontsLoaded = (loaded: boolean) => {
    setFontsLoaded(loaded)
    console.log('Fonts loaded callback:', loaded)
    console.log('Current theme:', theme)
    console.log('Document data-theme attribute:', document.documentElement.getAttribute('data-theme'))
  }
  
  const getThemeSpecificClass = () => {
    switch (theme) {
      case 'moonlit-grimoire': return 'starfield-bg'
      case 'dragonforge-ember': return 'forge-sparks'
      case 'enchanted-grove': return 'bioluminescent-dots'
      case 'arcane-storm': return 'electric-field'
      case 'ancient-sandstone': return 'hieroglyph-pattern'
      default: return ''
    }
  }
  
  const getThemeGlowClass = () => {
    switch (theme) {
      case 'moonlit-grimoire': return 'moonlit-glow'
      case 'dragonforge-ember': return 'ember-glow'
      case 'enchanted-grove': return 'nature-glow'
      case 'arcane-storm': return 'lightning-glow'
      case 'ancient-sandstone': return 'sandstone-glow'
      default: return 'magical-glow'
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${getThemeSpecificClass()}`}>
      <FontLoader onFontsLoaded={handleFontsLoaded} />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <ThemeIcon size={48} className="text-primary" />
            </motion.div>
            <h1 className="text-display-lg" style={{ 
              fontFamily: theme === 'enchanted-grove' ? 'Kalam, cursive' : 
                         theme === 'moonlit-grimoire' ? 'Uncial Antiqua, serif' :
                         theme === 'dragonforge-ember' ? 'Metamorphous, fantasy' :
                         theme === 'arcane-storm' ? 'Orbitron, monospace' :
                         theme === 'ancient-sandstone' ? 'Cinzel, serif' :
                         'var(--font-display)'
            }}>
              ZimboMate V2: Magical Themes
            </h1>
          </div>
          
          <p className="text-body-lg max-w-2xl mx-auto mb-8">
            {themeDescriptions[theme as keyof typeof themeDescriptions]}
          </p>
          
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Theme Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Character Card */}
          <motion.div
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-6 cursor-pointer transition-all duration-300 ${
                selectedCard === 'character' ? getThemeGlowClass() : ''
              }`}
              onClick={() => setSelectedCard(selectedCard === 'character' ? null : 'character')}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sword className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-display-sm">Thorin Ironbeard</h3>
                  <p className="text-body-sm text-muted">Fighter • Level 5</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-ui-regular">Health</span>
                  <span className="text-ui-regular">32/40</span>
                </div>
                <Progress value={80} variant="health" />
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="success">Healthy</Badge>
                  <Badge variant="magical">Blessed</Badge>
                  <Badge variant="outline">Ready</Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Spell Card */}
          <motion.div
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-6 cursor-pointer transition-all duration-300 ${
                selectedCard === 'spell' ? getThemeGlowClass() : ''
              }`}
              onClick={() => setSelectedCard(selectedCard === 'spell' ? null : 'spell')}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Wand2 className="text-secondary" size={24} />
                </div>
                <div>
                  <h3 className="text-display-sm">Fireball</h3>
                  <p className="text-body-sm text-muted">3rd Level Evocation</p>
                </div>
              </div>
              
              <p className="text-body-regular mb-4">
                A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.
              </p>
              
              <div className="flex gap-2">
                <Button size="sm" variant="magical">
                  <Sparkles size={16} />
                  Cast Spell
                </Button>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Equipment Card */}
          <motion.div
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`p-6 cursor-pointer transition-all duration-300 ${
                selectedCard === 'equipment' ? getThemeGlowClass() : ''
              }`}
              onClick={() => setSelectedCard(selectedCard === 'equipment' ? null : 'equipment')}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Shield className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="text-display-sm">Dragon Scale Mail</h3>
                  <p className="text-body-sm text-muted">Armor • Magical</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-ui-regular">Armor Class</span>
                  <span className="text-ui-regular font-semibold">14 + Dex</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ui-regular">Weight</span>
                  <span className="text-ui-regular">45 lbs</span>
                </div>
                
                <Badge variant="magical" className="w-full justify-center">
                  Resistance: Fire Damage
                </Badge>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Typography Showcase */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className={`p-8 ${getThemeGlowClass()}`}>
            <h2 className="text-display-lg mb-8 text-center">Typography Showcase</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Display Font Sample */}
              <div className="space-y-4">
                <h3 className="text-display-md">Display Font</h3>
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                  <h1 className="text-display-lg mb-2">The Ancient Tome</h1>
                  <h2 className="text-display-md mb-2">Chapter VII: Mystical Arts</h2>
                  <h3 className="text-display-sm">The Forbidden Spell</h3>
                </div>
              </div>

              {/* Body Font Sample */}
              <div className="space-y-4">
                <h3 className="text-display-md">Body Font</h3>
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                  <p className="text-body-lg mb-4">
                    In the depths of the ancient library, scrolls whispered secrets of forgotten magic.
                  </p>
                  <p className="text-body-regular mb-4">
                    The wizard's fingers traced the glowing runes, each symbol pulsing with ethereal energy. 
                    Ancient words of power echoed through the chamber as reality itself began to bend.
                  </p>
                  <p className="text-body-sm text-muted">
                    "Magic is not about power," the sage whispered, "it is about understanding the very fabric of existence."
                  </p>
                </div>
              </div>
            </div>

            {/* Font Character Showcase */}
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
              <h4 className="text-display-sm mb-4">Character Set Preview</h4>
              
              {/* Font Loading Status */}
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                <p className="text-body-sm">
                  Font Status: {fontsLoaded ? '✅ Google Fonts Loaded' : '⏳ Loading Google Fonts...'}
                </p>
                <p className="text-body-sm">
                  Current Theme: <strong>{theme}</strong>
                </p>
                <p className="text-body-sm">
                  Expected Display Font: {
                    theme === 'enchanted-grove' ? 'Kalam (handwritten)' :
                    theme === 'moonlit-grimoire' ? 'Uncial Antiqua (medieval)' :
                    theme === 'dragonforge-ember' ? 'Metamorphous (fantasy)' :
                    theme === 'arcane-storm' ? 'Orbitron (futuristic)' :
                    theme === 'ancient-sandstone' ? 'Cinzel (classical)' :
                    'Default'
                  }
                </p>
                <div className="mt-2 p-2 rounded text-body-sm" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
                  <p className="font-semibold">⚠️ For optimal font loading:</p>
                  <p>Add the Google Fonts link tag to your HTML head (see CSS comments)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-display-md mb-2">ABCDEFG</p>
                  <p className="text-body-regular">Uppercase Letters</p>
                </div>
                <div>
                  <p className="text-display-md mb-2">abcdefg</p>
                  <p className="text-body-regular">Lowercase Letters</p>
                </div>
                <div>
                  <p className="text-display-md mb-2">1234567</p>
                  <p className="text-body-regular">Numbers</p>
                </div>
              </div>
              
              {/* Font Family Debug Info */}
              <div className="mt-4 p-3 rounded-lg text-body-sm space-y-2" style={{ backgroundColor: 'var(--color-surface)' }}>
                <p className="font-semibold">Font Loading Test:</p>
                
                {/* Direct font family tests */}
                <div className="grid grid-cols-1 gap-2">
                  <p>Kalam Direct: <span style={{ fontFamily: 'Kalam, cursive' }}>The quick brown fox jumps</span></p>
                  <p>Uncial Antiqua: <span style={{ fontFamily: 'Uncial Antiqua, serif' }}>The quick brown fox jumps</span></p>
                  <p>Metamorphous: <span style={{ fontFamily: 'Metamorphous, fantasy' }}>The quick brown fox jumps</span></p>
                  <p>Orbitron: <span style={{ fontFamily: 'Orbitron, monospace' }}>The quick brown fox jumps</span></p>
                  <p>Cinzel: <span style={{ fontFamily: 'Cinzel, serif' }}>The quick brown fox jumps</span></p>
                </div>
                
                <hr style={{ borderColor: 'var(--color-border)' }} />
                
                <div>
                  <p>CSS Variables Test:</p>
                  <p>Display: <span style={{ fontFamily: 'var(--font-display)' }}>Sample Text (should match theme)</span></p>
                  <p>Body: <span style={{ fontFamily: 'var(--font-body)' }}>Sample Text (should match theme)</span></p>
                </div>
                
                <div>
                  <p>Theme-specific variables:</p>
                  <p>Grove: <span style={{ fontFamily: 'var(--font-grove)' }}>Should be Kalam handwriting</span></p>
                  <p>Moonlit: <span style={{ fontFamily: 'var(--font-moonlit)' }}>Should be Uncial Antiqua</span></p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Interactive Elements */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Progress Showcase */}
          <Card className="p-6">
            <h3 className="text-display-sm mb-6">Experience Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-ui-regular">Level 5 Progress</span>
                  <span className="text-ui-regular">{progress}%</span>
                </div>
                <Progress value={progress} variant="experience" />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  disabled={progress >= 100}
                >
                  Gain XP
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  disabled={progress <= 0}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>

          {/* Button Showcase */}
          <Card className="p-6">
            <h3 className="text-display-sm mb-6">Action Buttons</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary">
                <Heart size={16} />
                Heal
              </Button>
              <Button variant="secondary">
                <Sparkles size={16} />
                Cast
              </Button>
              <Button variant="magical" className="magical-shimmer">
                <Wand2 size={16} />
                Enchant
              </Button>
              <Button variant="destructive">
                <Flame size={16} />
                Attack
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Theme Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className={`p-8 text-center ${getThemeGlowClass()}`}>
            <h2 className="text-display-md mb-4">
              Current Theme: {theme.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h2>
            <p className="text-body-lg mb-6">
              {themeDescriptions[theme as keyof typeof themeDescriptions]}
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="magical">9 Themes Available</Badge>
              <Badge variant="success">Fully Responsive</Badge>
              <Badge variant="outline">Magical Effects</Badge>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemeShowcaseContent />
    </ThemeProvider>
  )
}