/**
 * SpellBook Demo App for ZimboMate V2
 * Demonstrates the complete animated spell book interface
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Wand, Sparkles } from 'lucide-react'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { Button, Card } from './components/ui'
import { SpellBook } from './components/game/SpellBook'
import { mockSpells, mockSpellSlots, mockCharacterSpellcasting } from './spellBookMockData'

export default function App() {
  const [isSpellBookOpen, setIsSpellBookOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<'fantasy' | 'dark' | 'light'>('fantasy')

  const handleSpellCast = (spell: any, level: number) => {
    console.log(`Casting ${spell.name} at level ${level}`)
  }

  const handleSpellPrepared = (spell: any) => {
    console.log(`Prepared spell: ${spell.name}`)
  }

  const handleSpellUnprepared = (spell: any) => {
    console.log(`Unprepared spell: ${spell.name}`)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-parchment-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block mb-4"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <BookOpen size={64} className="text-gold-500 magical-glow" />
            </motion.div>
            
            <h1 className="text-display-lg mb-4">
              ZimboMate V2 Spell Book
            </h1>
            
            <p className="text-body-lg text-parchment-700 max-w-2xl mx-auto">
              Experience the magical world of spellcasting with our enchanted spell book interface. 
              Complete with animated page turning, spell preparation, and mystical effects.
            </p>
          </motion.div>

          {/* Demo Controls */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <h2 className="text-display-sm mb-4">Demo Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Selection */}
                <div>
                  <h3 className="text-body-lg font-display mb-3">Theme</h3>
                  <div className="flex gap-2">
                    {(['fantasy', 'dark', 'light'] as const).map(theme => (
                      <Button
                        key={theme}
                        variant={selectedTheme === theme ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTheme(theme)}
                        className="capitalize"
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Spell Book Actions */}
                <div>
                  <h3 className="text-body-lg font-display mb-3">Actions</h3>
                  <Button
                    onClick={() => setIsSpellBookOpen(true)}
                    className="gap-2 magical-glow"
                    size="lg"
                  >
                    <BookOpen size={20} />
                    Open Spell Book
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              {
                icon: <BookOpen size={24} />,
                title: "Animated Pages",
                description: "Realistic page-turning animations with physics-based movement"
              },
              {
                icon: <Wand size={24} />,
                title: "Spell Casting",
                description: "Interactive spell preparation and casting with visual feedback"
              },
              {
                icon: <Sparkles size={24} />,
                title: "Magical Effects",
                description: "Ambient particles and enchanting visual effects throughout"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 h-full hover:magical-glow transition-all duration-300">
                  <div className="text-gold-500 mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-body-lg font-display mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body-sm text-parchment-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Spell Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="p-6">
              <h2 className="text-display-sm mb-4">Character Spellcasting</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-display-md text-gold-500">
                    {mockCharacterSpellcasting.cantripsKnown}
                  </div>
                  <div className="text-ui-small text-parchment-600">Cantrips Known</div>
                </div>
                
                <div className="text-center">
                  <div className="text-display-md text-magic-500">
                    {mockCharacterSpellcasting.spellsKnown}
                  </div>
                  <div className="text-ui-small text-parchment-600">Spells Known</div>
                </div>
                
                <div className="text-center">
                  <div className="text-display-md text-nature-500">
                    {mockCharacterSpellcasting.spellsPrepared}
                  </div>
                  <div className="text-ui-small text-parchment-600">Spells Prepared</div>
                </div>
                
                <div className="text-center">
                  <div className="text-display-md text-blue-500">
                    {mockCharacterSpellcasting.spellSaveDC}
                  </div>
                  <div className="text-ui-small text-parchment-600">Spell Save DC</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <p className="text-ui-small text-parchment-600">
              Use arrow keys to navigate pages • Press 1-4 for quick page access • ESC to close
            </p>
          </motion.div>
        </div>

        {/* Spell Book Component */}
        <SpellBook
          isOpen={isSpellBookOpen}
          onClose={() => setIsSpellBookOpen(false)}
          theme={selectedTheme}
          enableAnimations={true}
          enableAudio={true}
          onSpellCast={handleSpellCast}
          onSpellPrepared={handleSpellPrepared}
          onSpellUnprepared={handleSpellUnprepared}
        />
      </div>
    </ThemeProvider>
  )
}