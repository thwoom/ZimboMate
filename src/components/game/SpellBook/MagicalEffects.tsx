/**
 * MagicalEffects Component for ZimboMate V2
 * Ambient magical particles and effects around the spell book
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import React, { useEffect, useReducer } from 'react'

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: '#3b82f6',
  conjuration: '#10b981',
  divination: '#f59e0b',
  enchantment: '#ec4899',
  evocation: '#ef4444',
  illusion: '#8b5cf6',
  necromancy: '#6b7280',
  transmutation: '#f97316',
}

const resolveSchoolColor = (school?: string) =>
  school ? SCHOOL_COLORS[school.toLowerCase()] || '#d4af37' : '#d4af37'

const getParticleCount = (intensity: 'low' | 'medium' | 'high') => {
  switch (intensity) {
    case 'low':
      return 8
    case 'high':
      return 25
    default:
      return 15
  }
}

interface Particle {
  id: string
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

interface ParticleAction {
  type: 'set' | 'clear'
  particles?: Particle[]
}

const particleReducer = (
  state: Particle[],
  action: ParticleAction,
): Particle[] => {
  switch (action.type) {
    case 'set':
      return action.particles ?? state
    case 'clear':
      return []
    default:
      return state
  }
}

interface MagicalEffectsProps {
  isActive?: boolean
  intensity?: 'low' | 'medium' | 'high'
  spellSchool?: string
  className?: string
}

export function MagicalEffects({
  isActive = true,
  intensity = 'medium',
  spellSchool,
  className = '',
}: MagicalEffectsProps) {
  const [particles, dispatchParticles] = useReducer(particleReducer, [])

  useEffect(() => {
    if (!isActive) {
      dispatchParticles({ type: 'clear' })
      return
    }

    const generateParticles = () => {
      const newParticles: Particle[] = []
      const count = getParticleCount(intensity)
      const color = resolveSchoolColor(spellSchool)

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `particle-${i}-${Date.now()}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          color,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2,
        })
      }

      dispatchParticles({ type: 'set', particles: newParticles })
    }

    generateParticles()
    const interval = window.setInterval(generateParticles, 5000)

    return () => window.clearInterval(interval)
  }, [isActive, intensity, spellSchool])

  if (!isActive) return null

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Ambient magical glow */}
      <motion.div
        className='absolute inset-0 opacity-30'
        animate={{
          background: [
            `radial-gradient(circle at 20% 20%, ${resolveSchoolColor(spellSchool)}20 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 80%, ${resolveSchoolColor(spellSchool)}20 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${resolveSchoolColor(spellSchool)}20 0%, transparent 50%)`,
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className='absolute'
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1.2, 0],
              rotate: 360,
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles size={particle.size} style={{ color: particle.color }} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Corner magical effects */}
      <motion.div
        className='absolute top-4 left-4'
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles
          size={24}
          style={{ color: resolveSchoolColor(spellSchool) }}
          className='opacity-60'
        />
      </motion.div>

      <motion.div
        className='absolute top-4 right-4'
        animate={{
          rotate: [360, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <Sparkles
          size={20}
          style={{ color: resolveSchoolColor(spellSchool) }}
          className='opacity-50'
        />
      </motion.div>

      <motion.div
        className='absolute bottom-4 left-4'
        animate={{
          rotate: [0, -360],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      >
        <Sparkles
          size={18}
          style={{ color: resolveSchoolColor(spellSchool) }}
          className='opacity-40'
        />
      </motion.div>

      <motion.div
        className='absolute bottom-4 right-4'
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      >
        <Sparkles
          size={22}
          style={{ color: resolveSchoolColor(spellSchool) }}
          className='opacity-70'
        />
      </motion.div>

      {/* Pulsing magical aura */}
      <motion.div
        className='absolute inset-4 border border-current rounded-lg opacity-20'
        style={{ color: resolveSchoolColor(spellSchool) }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
