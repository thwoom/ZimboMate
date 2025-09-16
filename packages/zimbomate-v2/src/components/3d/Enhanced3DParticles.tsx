import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Points, PointsMaterial } from 'three'
import * as THREE from 'three'

// Particle system types
export interface ParticleConfig {
  count: number
  color: string
  size: number
  opacity: number
  lifetime: number
  speed: number
  spread: number
  gravity: number
  emissionRate: number
}

export interface ParticleEmitter {
  position: THREE.Vector3
  velocity: THREE.Vector3
  active: boolean
  config: ParticleConfig
}

export interface Enhanced3DParticlesProps {
  trigger: boolean
  position?: [number, number, number]
  type: 'success' | 'partial' | 'failure' | 'collision' | 'magical' | 'trail'
  intensity?: number
  theme?: 'fantasy' | 'sci-fi' | 'dark' | 'light'
  duration?: number
  onComplete?: () => void
}

// Particle configurations for different effects
const getParticleConfig = (
  type: string, 
  theme: string, 
  intensity = 1
): ParticleConfig => {
  const configs = {
    success: {
      fantasy: {
        count: Math.floor(50 * intensity),
        color: '#22c55e',
        size: 0.1,
        opacity: 0.8,
        lifetime: 2.0,
        speed: 5,
        spread: 2,
        gravity: -0.5,
        emissionRate: 25
      },
      'sci-fi': {
        count: Math.floor(40 * intensity),
        color: '#00ff88',
        size: 0.05,
        opacity: 1.0,
        lifetime: 1.5,
        speed: 8,
        spread: 1.5,
        gravity: 0,
        emissionRate: 30
      },
      dark: {
        count: Math.floor(30 * intensity),
        color: '#10b981',
        size: 0.08,
        opacity: 0.6,
        lifetime: 2.5,
        speed: 3,
        spread: 2.5,
        gravity: -0.3,
        emissionRate: 15
      },
      light: {
        count: Math.floor(60 * intensity),
        color: '#fbbf24',
        size: 0.12,
        opacity: 0.9,
        lifetime: 1.8,
        speed: 4,
        spread: 3,
        gravity: -0.2,
        emissionRate: 35
      }
    },
    partial: {
      fantasy: {
        count: Math.floor(30 * intensity),
        color: '#d4af37',
        size: 0.08,
        opacity: 0.7,
        lifetime: 1.5,
        speed: 3,
        spread: 1.5,
        gravity: -0.3,
        emissionRate: 20
      },
      'sci-fi': {
        count: Math.floor(25 * intensity),
        color: '#fbbf24',
        size: 0.04,
        opacity: 0.9,
        lifetime: 1.2,
        speed: 6,
        spread: 1.2,
        gravity: 0,
        emissionRate: 25
      },
      dark: {
        count: Math.floor(20 * intensity),
        color: '#f59e0b',
        size: 0.06,
        opacity: 0.5,
        lifetime: 2.0,
        speed: 2,
        spread: 2,
        gravity: -0.2,
        emissionRate: 12
      },
      light: {
        count: Math.floor(40 * intensity),
        color: '#f59e0b',
        size: 0.1,
        opacity: 0.8,
        lifetime: 1.6,
        speed: 3.5,
        spread: 2.5,
        gravity: -0.1,
        emissionRate: 25
      }
    },
    failure: {
      fantasy: {
        count: Math.floor(20 * intensity),
        color: '#ef4444',
        size: 0.06,
        opacity: 0.6,
        lifetime: 1.0,
        speed: 2,
        spread: 1,
        gravity: -0.8,
        emissionRate: 15
      },
      'sci-fi': {
        count: Math.floor(15 * intensity),
        color: '#ff0040',
        size: 0.03,
        opacity: 1.0,
        lifetime: 0.8,
        speed: 4,
        spread: 0.8,
        gravity: 0,
        emissionRate: 20
      },
      dark: {
        count: Math.floor(25 * intensity),
        color: '#dc2626',
        size: 0.08,
        opacity: 0.7,
        lifetime: 1.5,
        speed: 1.5,
        spread: 1.5,
        gravity: -0.5,
        emissionRate: 10
      },
      light: {
        count: Math.floor(15 * intensity),
        color: '#f87171',
        size: 0.05,
        opacity: 0.5,
        lifetime: 1.2,
        speed: 2.5,
        spread: 1.8,
        gravity: -0.4,
        emissionRate: 12
      }
    },
    collision: {
      fantasy: {
        count: Math.floor(15 * intensity),
        color: '#8b7355',
        size: 0.04,
        opacity: 0.8,
        lifetime: 0.5,
        speed: 8,
        spread: 0.5,
        gravity: -2,
        emissionRate: 50
      },
      'sci-fi': {
        count: Math.floor(20 * intensity),
        color: '#3b82f6',
        size: 0.02,
        opacity: 1.0,
        lifetime: 0.3,
        speed: 12,
        spread: 0.3,
        gravity: 0,
        emissionRate: 80
      },
      dark: {
        count: Math.floor(12 * intensity),
        color: '#6b7280',
        size: 0.03,
        opacity: 0.6,
        lifetime: 0.8,
        speed: 6,
        spread: 0.8,
        gravity: -1,
        emissionRate: 30
      },
      light: {
        count: Math.floor(18 * intensity),
        color: '#d1d5db',
        size: 0.05,
        opacity: 0.7,
        lifetime: 0.6,
        speed: 7,
        spread: 0.6,
        gravity: -1.5,
        emissionRate: 40
      }
    },
    magical: {
      fantasy: {
        count: Math.floor(40 * intensity),
        color: '#9333ea',
        size: 0.15,
        opacity: 0.9,
        lifetime: 3.0,
        speed: 1,
        spread: 3,
        gravity: 0.2,
        emissionRate: 15
      },
      'sci-fi': {
        count: Math.floor(35 * intensity),
        color: '#8b5cf6',
        size: 0.08,
        opacity: 1.0,
        lifetime: 2.5,
        speed: 2,
        spread: 2,
        gravity: 0,
        emissionRate: 20
      },
      dark: {
        count: Math.floor(30 * intensity),
        color: '#7c3aed',
        size: 0.12,
        opacity: 0.8,
        lifetime: 4.0,
        speed: 0.5,
        spread: 4,
        gravity: 0.1,
        emissionRate: 10
      },
      light: {
        count: Math.floor(50 * intensity),
        color: '#a855f7',
        size: 0.18,
        opacity: 0.7,
        lifetime: 2.8,
        speed: 1.5,
        spread: 3.5,
        gravity: 0.3,
        emissionRate: 18
      }
    },
    trail: {
      fantasy: {
        count: Math.floor(25 * intensity),
        color: '#d4af37',
        size: 0.06,
        opacity: 0.6,
        lifetime: 1.0,
        speed: 0,
        spread: 0.2,
        gravity: -0.5,
        emissionRate: 30
      },
      'sci-fi': {
        count: Math.floor(30 * intensity),
        color: '#00ff88',
        size: 0.03,
        opacity: 0.8,
        lifetime: 0.8,
        speed: 0,
        spread: 0.1,
        gravity: 0,
        emissionRate: 40
      },
      dark: {
        count: Math.floor(20 * intensity),
        color: '#6b7280',
        size: 0.04,
        opacity: 0.4,
        lifetime: 1.2,
        speed: 0,
        spread: 0.3,
        gravity: -0.3,
        emissionRate: 25
      },
      light: {
        count: Math.floor(35 * intensity),
        color: '#fbbf24',
        size: 0.08,
        opacity: 0.5,
        lifetime: 0.9,
        speed: 0,
        spread: 0.25,
        gravity: -0.2,
        emissionRate: 35
      }
    }
  }
  
  const themeConfigs = configs[type as keyof typeof configs]
  return themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.fantasy
}

// Individual particle class
class Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  opacity: number
  color: THREE.Color
  
  constructor(
    startPosition: THREE.Vector3,
    config: ParticleConfig
  ) {
    this.position = startPosition.clone()
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * config.spread,
      Math.random() * config.speed,
      (Math.random() - 0.5) * config.spread
    )
    this.life = config.lifetime
    this.maxLife = config.lifetime
    this.size = config.size * (0.5 + Math.random() * 0.5)
    this.opacity = config.opacity
    this.color = new THREE.Color(config.color)
  }
  
  update(deltaTime: number, gravity: number): boolean {
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    // Apply gravity
    this.velocity.y += gravity * deltaTime
    
    // Update life
    this.life -= deltaTime
    
    // Fade out over time
    const lifeRatio = this.life / this.maxLife
    this.opacity = this.opacity * lifeRatio
    this.size = this.size * (0.5 + lifeRatio * 0.5)
    
    return this.life > 0
  }
}

// Particle system component
export const Enhanced3DParticles: React.FC<Enhanced3DParticlesProps> = ({
  trigger,
  position = [0, 0, 0],
  type,
  intensity = 1,
  theme = 'fantasy',
  duration = 3000,
  onComplete
}) => {
  const pointsRef = useRef<Points>(null)
  const particlesRef = useRef<Particle[]>([])
  const emissionTimeRef = useRef(0)
  const totalTimeRef = useRef(0)
  const activeRef = useRef(false)
  
  const config = useMemo(() => 
    getParticleConfig(type, theme, intensity), 
    [type, theme, intensity]
  )
  
  const { positions, colors, sizes, opacities } = useMemo(() => {
    const maxParticles = config.count
    return {
      positions: new Float32Array(maxParticles * 3),
      colors: new Float32Array(maxParticles * 3),
      sizes: new Float32Array(maxParticles),
      opacities: new Float32Array(maxParticles)
    }
  }, [config.count])
  
  // Initialize particle system when triggered
  useEffect(() => {
    if (trigger) {
      activeRef.current = true
      totalTimeRef.current = 0
      emissionTimeRef.current = 0
      particlesRef.current = []
    }
  }, [trigger])
  
  // Animation loop
  useFrame((state, deltaTime) => {
    if (!activeRef.current || !pointsRef.current) return
    
    totalTimeRef.current += deltaTime
    emissionTimeRef.current += deltaTime
    
    // Emit new particles
    const emissionInterval = 1 / config.emissionRate
    while (emissionTimeRef.current >= emissionInterval && particlesRef.current.length < config.count) {
      const startPos = new THREE.Vector3(...position)
      const particle = new Particle(startPos, config)
      particlesRef.current.push(particle)
      emissionTimeRef.current -= emissionInterval
    }
    
    // Update existing particles
    const particles = particlesRef.current
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      const alive = particle.update(deltaTime, config.gravity)
      
      if (!alive) {
        particles.splice(i, 1)
      }
    }
    
    // Update geometry attributes
    const activeParticles = particles.length
    
    for (let i = 0; i < config.count; i++) {
      if (i < activeParticles) {
        const particle = particles[i]
        
        // Position
        positions[i * 3] = particle.position.x
        positions[i * 3 + 1] = particle.position.y
        positions[i * 3 + 2] = particle.position.z
        
        // Color
        colors[i * 3] = particle.color.r
        colors[i * 3 + 1] = particle.color.g
        colors[i * 3 + 2] = particle.color.b
        
        // Size
        sizes[i] = particle.size
        
        // Opacity
        opacities[i] = particle.opacity
      } else {
        // Hide inactive particles
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
        sizes[i] = 0
        opacities[i] = 0
      }
    }
    
    // Update geometry
    const geometry = pointsRef.current.geometry
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.attributes.size.needsUpdate = true
    geometry.attributes.opacity.needsUpdate = true
    
    // Check if effect is complete
    if (totalTimeRef.current >= duration / 1000 && particles.length === 0) {
      activeRef.current = false
      onComplete?.()
    }
  })
  
  if (!trigger && !activeRef.current) return null
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={config.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={config.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={config.count}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          array={opacities}
          count={config.count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.size}
        transparent
        opacity={config.opacity}
        vertexColors
        sizeAttenuation
        alphaTest={0.01}
        depthWrite={false}
        blending={theme === 'sci-fi' ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

// Trail effect for moving dice
export const DiceTrailEffect: React.FC<{
  dicePosition: THREE.Vector3
  active: boolean
  theme: string
}> = ({ dicePosition, active, theme }) => {
  const trailRef = useRef<THREE.Vector3[]>([])
  const maxTrailLength = 20
  
  useFrame(() => {
    if (!active) {
      trailRef.current = []
      return
    }
    
    // Add current position to trail
    trailRef.current.push(dicePosition.clone())
    
    // Limit trail length
    if (trailRef.current.length > maxTrailLength) {
      trailRef.current.shift()
    }
  })
  
  if (!active || trailRef.current.length < 2) return null
  
  return (
    <Enhanced3DParticles
      trigger={active}
      position={[dicePosition.x, dicePosition.y, dicePosition.z]}
      type="trail"
      intensity={0.5}
      theme={theme as any}
      duration={1000}
    />
  )
}

// Collision burst effect
export const CollisionBurstEffect: React.FC<{
  position: [number, number, number]
  intensity: number
  trigger: boolean
  theme: string
  onComplete?: () => void
}> = ({ position, intensity, trigger, theme, onComplete }) => {
  return (
    <Enhanced3DParticles
      trigger={trigger}
      position={position}
      type="collision"
      intensity={Math.min(intensity / 5, 2)}
      theme={theme as any}
      duration={800}
      onComplete={onComplete}
    />
  )
}

// Magical aura effect
export const MagicalAuraEffect: React.FC<{
  position: [number, number, number]
  active: boolean
  theme: string
  intensity?: number
}> = ({ position, active, theme, intensity = 1 }) => {
  return (
    <Enhanced3DParticles
      trigger={active}
      position={position}
      type="magical"
      intensity={intensity}
      theme={theme as any}
      duration={5000}
    />
  )
}