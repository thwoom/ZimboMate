import React from 'react'
import { Heart, Zap, Star } from 'lucide-react'

interface HealthManaStatsProps {
  hp: { current: number; max: number }
  mana: { current: number; max: number }
  experience: { current: number; next: number }
}

const HealthManaStats: React.FC<HealthManaStatsProps> = ({
  hp,
  mana,
  experience
}) => {
  const getHealthColor = (current: number, max: number): string => {
    const percentage = (current / max) * 100
    if (percentage > 75) return 'text-green-400'
    if (percentage > 50) return 'text-yellow-400'
    if (percentage > 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const getProgressColor = (current: number, max: number): string => {
    const percentage = (current / max) * 100
    if (percentage > 75) return 'bg-green-500'
    if (percentage > 50) return 'bg-yellow-500'
    if (percentage > 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Health Points */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Heart size={24} className={getHealthColor(hp.current, hp.max)} />
          <h3 className="text-lg font-semibold text-white">Health Points</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-white">
              {hp.current}/{hp.max}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(hp.current, hp.max)}`}
              style={{ width: `${(hp.current / hp.max) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mana Points */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap size={24} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Mana Points</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-white">
              {mana.current}/{mana.max}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(mana.current / mana.max) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Star size={24} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Experience</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-white">
              {experience.current}/{experience.next}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(experience.current / experience.next) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthManaStats