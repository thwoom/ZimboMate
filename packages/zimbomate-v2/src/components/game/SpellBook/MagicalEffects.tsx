/**
 * MagicalEffects Component for ZimboMate V2
 * Ambient magical particles and effects around the spell book
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Particle {
  id: string
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
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
  className = '' 
}: MagicalEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  const getSchoolColor = (school?: string) => {
    const colors = {
      abjuration: '#3b82f6',
      conjuration: '#10b981',
      divination: '#f59e0b',
      enchantment: '#ec4899',
      evocation: '#ef4444',
      illusion: '#8b5cf6',
      necromancy: '#6b7280',
      transmutation: '#f97316'
    }
    return school ? colors[school.toLowerCase()] || '#d4af37' : '#d4af37'
  }

  const getParticleCount = () => {
    switch (intensity) {
      case 'low': return 8
      case 'medium': return 15
      case 'high': return 25
      default: return 15
    }
  }

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const generateParticles = () => {
      const newParticles: Particle[] = []
      const count = getParticleCount()
      const color = getSchoolColor(spellSchool)

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `particle-${i}-${Date.now()}`,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          color,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2
        })
      }

      setParticles(newParticles)
    }

    generateParticles()
    const interval = setInterval(generateParticles, 5000)

    return () => clearInterval(interval)
  }, [isActive, intensity, spellSchool])

  if (!isActive) return null

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Ambient magical glow */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            `radial-gradient(circle at 20% 20%, ${getSchoolColor(spellSchool)}20 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 80%, ${getSchoolColor(spellSchool)}20 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${getSchoolColor(spellSchool)}20 0%, transparent 50%)`,
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1.2, 0],
              rotate: 360,
              x: [0, Math.random() * 40 - 20],
              y: [0, Math.random() * 40 - 20]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <Sparkles 
              size={particle.size} 
              style={{ color: particle.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Corner magical effects */}
      <motion.div
        className="absolute top-4 left-4"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Sparkles 
          size={24} 
          style={{ color: getSchoolColor(spellSchool) }}
          className="opacity-60"
        />
      </motion.div>

      <motion.div
        className="absolute top-4 right-4"
        animate={{
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      >
        <Sparkles 
          size={20} 
          style={{ color: getSchoolColor(spellSchool) }}
          className="opacity-50"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-4"
        animate={{
          rotate: [0, -360],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2
        }}
      >
        <Sparkles 
          size={18} 
          style={{ color: getSchoolColor(spellSchool) }}
          className="opacity-40"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4"
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3
        }}
      >
        <Sparkles 
          size={22} 
          style={{ color: getSchoolColor(spellSchool) }}
          className="opacity-70"
        />
      </motion.div>

      {/* Pulsing magical aura */}
      <motion.div
        className="absolute inset-4 border border-current rounded-lg opacity-20"
        style={{ color: getSchoolColor(spellSchool) }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.02, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}