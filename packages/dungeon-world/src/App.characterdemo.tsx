import React from 'react'
import CharacterCard from './components/CharacterCard'
import AbilityScores from './components/AbilityScores'
import HealthManaStats from './components/HealthManaStats'

// Mock data for Eldara Moonwhisper
const characterData = {
  name: 'Eldara Moonwhisper',
  characterClass: 'Wizard',
  level: 5,
  alignment: 'Neutral',
  portraitUrl: 'https://i.pravatar.cc/150?img=47', // Using a mystical-looking avatar
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

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="glass-header p-6 mb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gradient">
              ZimboMate V2 - Animation Fix Demo
            </h1>
            <p className="text-white/70 mt-2">
              Testing AnimatePresence and key fixes for React components
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 pb-12">
          <div className="space-y-8">
            {/* Character Header */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Character Sheet</h2>
              <CharacterCard
                name={characterData.name}
                characterClass={characterData.characterClass}
                level={characterData.level}
                alignment={characterData.alignment}
                portraitUrl={characterData.portraitUrl}
              />
            </section>

            {/* Health, Mana, Experience */}
            <section>
              <HealthManaStats
                hp={characterData.hp}
                mana={characterData.mana}
                experience={characterData.experience}
              />
            </section>

            {/* Ability Scores */}
            <section>
              <AbilityScores abilities={characterData.abilities} />
            </section>

            {/* Core character attributes and modifiers */}
            <section className="glass-panel rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Core character attributes and modifiers</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">STR</div>
                  <div className="text-xl font-bold text-white">8</div>
                  <div className="text-sm text-white/60">-1</div>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">DEX</div>
                  <div className="text-xl font-bold text-white">12</div>
                  <div className="text-sm text-white/60">+1</div>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">CON</div>
                  <div className="text-xl font-bold text-white">15</div>
                  <div className="text-sm text-white/60">+2</div>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">INT</div>
                  <div className="text-xl font-bold text-white">16</div>
                  <div className="text-sm text-white/60">+3</div>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">WIS</div>
                  <div className="text-xl font-bold text-white">12</div>
                  <div className="text-sm text-white/60">+1</div>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="text-sm text-white/70 mb-1">CHA</div>
                  <div className="text-xl font-bold text-white">9</div>
                  <div className="text-sm text-white/60">-1</div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App