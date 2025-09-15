import React from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { motion } from 'framer-motion'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Card, CardContent } from './components/ui'
import { 
  BicepsFlexed, 
  Feather, 
  Shield, 
  Brain, 
  Eye, 
  Sparkles,
  Heart,
  Zap,
  Star,
  User
} from 'lucide-react'

// Mock data for Eldara Moonwhisper
const characterData = {
  name: 'Eldara Moonwhisper',
  characterClass: 'Wizard',
  level: 5,
  alignment: 'Neutral',
  portraitUrl: 'https://i.pravatar.cc/150?img=47',
  abilities: {
    STR: 8,
    DEX: 12,
    CON: 15,
    INT: 16,
    WIS: 12,
    CHA: 9,
  },
  hp: { current: 32, max: 45 },
  mana: { current: 28, max: 40 },
  experience: { current: 2750, max: 3000 },
}

const getModifier = (score: number): number => {
  return Math.floor((score - 10) / 2)
}

const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

const getHealthColor = (current: number, max: number): string => {
  const percentage = (current / max) * 100
  if (percentage > 75) return 'var(--nature-500)'
  if (percentage > 50) return 'var(--yellow-500)'
  if (percentage > 25) return 'var(--orange-500)'
  return 'var(--red-500)'
}

const CharacterCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card variant="parchment" padding="lg" className="mb-6">
        <CardContent>
          <div className="flex items-center gap-6">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={characterData.portraitUrl}
                alt={`${characterData.name} portrait`}
                className="w-20 h-20 rounded-full object-cover border-2 shadow-lg"
                style={{ borderColor: 'var(--gold-500)' }}
              />
              <motion.div 
                className="absolute -bottom-1 -right-1 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--gold-500)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
              >
                {characterData.level}
              </motion.div>
            </motion.div>
            <div className="flex-1">
              <motion.h1 
                className="text-2xl font-semibold mb-1"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  color: 'var(--parchment-900)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {characterData.name}
              </motion.h1>
              <motion.p 
                className="text-lg font-medium mb-1"
                style={{ color: 'var(--parchment-700)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Level {characterData.level} {characterData.characterClass}
              </motion.p>
              <motion.p 
                className="text-sm"
                style={{ color: 'var(--parchment-600)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {characterData.alignment}
              </motion.p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const HealthManaStats: React.FC = () => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Health Points */}
      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card variant="glass" padding="md">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Heart size={24} style={{ color: getHealthColor(characterData.hp.current, characterData.hp.max) }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--parchment-800)' }}>Health Points</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--parchment-900)' }}>
                  {characterData.hp.current}/{characterData.hp.max}
                </span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--parchment-200)' }}>
                <motion.div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: getHealthColor(characterData.hp.current, characterData.hp.max),
                    width: `${(characterData.hp.current / characterData.hp.max) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(characterData.hp.current / characterData.hp.max) * 100}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mana Points */}
      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card variant="glass" padding="md">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Zap size={24} style={{ color: 'var(--magic-500)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--parchment-800)' }}>Mana Points</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--parchment-900)' }}>
                  {characterData.mana.current}/{characterData.mana.max}
                </span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--parchment-200)' }}>
                <motion.div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--magic-500)',
                    width: `${(characterData.mana.current / characterData.mana.max) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(characterData.mana.current / characterData.mana.max) * 100}%` }}
                  transition={{ delay: 0.7, duration: 1 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Experience */}
      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card variant="glass" padding="md">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Star size={24} style={{ color: 'var(--gold-500)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--parchment-800)' }}>Experience</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold" style={{ color: 'var(--parchment-900)' }}>
                  {characterData.experience.current}/{characterData.experience.max}
                </span>
              </div>
              <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: 'var(--parchment-200)' }}>
                <motion.div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: 'var(--gold-500)',
                    width: `${(characterData.experience.current / characterData.experience.max) * 100}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(characterData.experience.current / characterData.experience.max) * 100}%` }}
                  transition={{ delay: 0.9, duration: 1 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

const AbilityScores: React.FC = () => {
  const abilityScores = [
    { name: 'STR', value: characterData.abilities.STR, modifier: getModifier(characterData.abilities.STR), icon: BicepsFlexed },
    { name: 'DEX', value: characterData.abilities.DEX, modifier: getModifier(characterData.abilities.DEX), icon: Feather },
    { name: 'CON', value: characterData.abilities.CON, modifier: getModifier(characterData.abilities.CON), icon: Shield },
    { name: 'INT', value: characterData.abilities.INT, modifier: getModifier(characterData.abilities.INT), icon: Brain },
    { name: 'WIS', value: characterData.abilities.WIS, modifier: getModifier(characterData.abilities.WIS), icon: Eye },
    { name: 'CHA', value: characterData.abilities.CHA, modifier: getModifier(characterData.abilities.CHA), icon: Sparkles },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <Card variant="parchment" padding="lg">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4" style={{ 
            fontFamily: 'var(--font-display)',
            color: 'var(--parchment-900)'
          }}>
            Ability Scores
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {abilityScores.map((ability, index) => {
              const IconComponent = ability.icon
              return (
                <motion.div
                  key={ability.name}
                  className="rounded-lg p-4 text-center border transition-all duration-200 cursor-pointer hover:shadow-lg"
                  style={{
                    backgroundColor: 'rgba(249, 246, 237, 0.5)',
                    borderColor: 'rgba(232, 220, 198, 0.3)'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <IconComponent size={24} style={{ color: 'var(--parchment-700)' }} />
                    <div className="text-sm font-medium" style={{ color: 'var(--parchment-600)' }}>{ability.name}</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--parchment-900)' }}>{ability.value}</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--parchment-700)' }}>
                      {formatModifier(ability.modifier)}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Tooltip.Provider>
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
          {/* Magical background pattern */}
          <div 
            className="fixed inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          
          {/* Header */}
          <header className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm" style={{
            backgroundColor: 'rgba(249, 246, 237, 0.95)',
            borderColor: 'rgba(232, 220, 198, 0.3)'
          }}>
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      borderColor: 'rgba(212, 175, 55, 0.3)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" style={{ color: 'var(--gold-500)' }} />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-semibold" style={{ 
                      fontFamily: 'var(--font-display)',
                      color: 'var(--parchment-900)'
                    }}>
                      ZimboMate V2
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'var(--parchment-700)' }}>
                      Styling Fix Demo
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ThemeToggle />
                </motion.div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl mb-4" style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--parchment-900)'
              }}>
                Character Sheet
              </h1>
              <p className="max-w-3xl" style={{ color: 'var(--parchment-700)' }}>
                Fixed styling issues with proper CSS custom properties and Tailwind v4 integration
              </p>
            </motion.div>

            <div className="space-y-8">
              {/* Character Header */}
              <CharacterCard />

              {/* Health, Mana, Experience */}
              <HealthManaStats />

              {/* Ability Scores */}
              <AbilityScores />

              {/* Core character attributes summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card variant="glass" padding="lg">
                  <CardContent>
                    <h2 className="text-xl mb-4" style={{ 
                      fontFamily: 'var(--font-display)',
                      color: 'var(--parchment-900)'
                    }}>
                      Core character attributes and modifiers
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                      {Object.entries(characterData.abilities).map(([stat, value], index) => (
                        <motion.div
                          key={stat}
                          className="rounded-lg p-3 border"
                          style={{
                            backgroundColor: 'rgba(249, 246, 237, 0.3)',
                            borderColor: 'rgba(232, 220, 198, 0.2)'
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + (index * 0.05) }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-sm mb-1 font-medium" style={{ color: 'var(--parchment-600)' }}>{stat}</div>
                          <div className="text-xl font-bold" style={{ color: 'var(--parchment-900)' }}>{value}</div>
                          <div className="text-sm font-medium" style={{ color: 'var(--parchment-700)' }}>
                            {formatModifier(getModifier(value))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 backdrop-blur-md border-t" style={{
            backgroundColor: 'rgba(249, 246, 237, 0.9)',
            borderColor: 'rgba(232, 220, 198, 0.3)'
          }}>
            <div className="container mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <User className="w-5 h-5" style={{ color: 'var(--parchment-600)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--parchment-700)' }}>
                    ZimboMate V2 • Built with React 19 & Tailwind v4
                  </span>
                </motion.div>
                <motion.div 
                  className="text-sm font-medium"
                  style={{ color: 'var(--parchment-600)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  Character Demo with Fixed Styling ✨
                </motion.div>
              </div>
            </div>
          </footer>
        </div>
      </Tooltip.Provider>
    </ThemeProvider>
  )
}

export default App