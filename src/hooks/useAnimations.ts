/**
 * useAnimations Hook for ZimboMate V2
 * Animation control and preferences with magical particle effects
 * Provides staggered animations, particle systems, and performance optimization
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface AnimationPreferences {
  reduceMotion: boolean
  particleEffects: boolean
  staggeredAnimations: boolean
  glowEffects: boolean
  transitionSpeed: 'slow' | 'normal' | 'fast'
}

export interface ParticleConfig {
  count: number
  colors: string[]
  size: { min: number; max: number }
  speed: { min: number; max: number }
  lifetime: number
  gravity: number
  spread: number
}

export interface StaggerConfig {
  delay: number
  duration: number
  easing: string
  direction: 'up' | 'down' | 'left' | 'right' | 'center'
}

export interface UseAnimationsReturn {
  // Animation preferences
  preferences: AnimationPreferences
  updatePreferences: (updates: Partial<AnimationPreferences>) => void

  // Particle effects
  triggerParticles: (
    element: HTMLElement | null,
    type: 'success' | 'failure' | 'damage' | 'healing' | 'magic' | 'custom',
    config?: Partial<ParticleConfig>,
  ) => void
  createParticleSystem: (
    container: HTMLElement,
    config: ParticleConfig,
  ) => () => void // Returns cleanup function

  // Staggered animations
  useStaggeredAnimation: (
    elements: HTMLElement[],
    config?: Partial<StaggerConfig>,
  ) => void
  createStaggeredEntrance: (
    selector: string,
    config?: Partial<StaggerConfig>,
  ) => void

  // Magical effects
  addMagicalGlow: (
    element: HTMLElement | null,
    color?: string,
    intensity?: number,
  ) => void
  removeMagicalGlow: (element: HTMLElement | null) => void
  pulseElement: (element: HTMLElement | null, duration?: number) => void
  shimmerEffect: (element: HTMLElement | null, duration?: number) => void

  // Animation utilities
  getAnimationDuration: (baseMs: number) => number
  shouldAnimate: (
    animationType: 'particle' | 'stagger' | 'glow' | 'transition',
  ) => boolean
  createSpringConfig: (type: 'gentle' | 'wobbly' | 'stiff' | 'slow') => any

  // Performance
  isHighPerformance: boolean
  togglePerformanceMode: () => void

  // Theme integration
  getThemeColors: () => {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
}

/**
 * Hook for managing animations and visual effects
 */
export function useAnimations(): UseAnimationsReturn {
  const [preferences, setPreferences] = useState<AnimationPreferences>(() => {
    // Check for user's motion preferences
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    return {
      reduceMotion: prefersReducedMotion,
      particleEffects: !prefersReducedMotion,
      staggeredAnimations: !prefersReducedMotion,
      glowEffects: true,
      transitionSpeed: 'normal',
    }
  })

  const [isHighPerformance, setIsHighPerformance] = useState(true)
  const particleSystemsRef = useRef<Map<string, () => void>>(new Map())

  // Monitor performance
  useEffect(() => {
    const checkPerformance = () => {
      // Simple performance check based on frame rate
      const start = performance.now()
      requestAnimationFrame(() => {
        const delta = performance.now() - start
        setIsHighPerformance(delta < 16.67) // 60fps threshold
      })
    }

    const interval = setInterval(checkPerformance, 5000)
    return () => clearInterval(interval)
  }, [])

  // Update preferences
  const updatePreferences = useCallback(
    (updates: Partial<AnimationPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }))
    },
    [],
  )

  // Get theme colors
  const getThemeColors = useCallback(() => {
    return {
      primary: 'var(--matsu-primary, var(--primary))',
      secondary: 'var(--matsu-secondary, var(--secondary))',
      accent: 'var(--matsu-accent, var(--accent))',
      success: 'var(--chart-2)',
      warning: 'var(--chart-4)',
      error: 'var(--destructive)',
    }
  }, [])

  // Particle effects
  const triggerParticles = useCallback(
    (
      element: HTMLElement | null,
      type: 'success' | 'failure' | 'damage' | 'healing' | 'magic' | 'custom',
      config: Partial<ParticleConfig> = {},
    ) => {
      if (!element || !preferences.particleEffects || preferences.reduceMotion)
        return

      const themeColors = getThemeColors()
      const defaultConfigs: Record<string, ParticleConfig> = {
        success: {
          count: 20,
          colors: [themeColors.success, '#10B981', '#34D399'],
          size: { min: 2, max: 6 },
          speed: { min: 50, max: 150 },
          lifetime: 1000,
          gravity: 0.5,
          spread: 45,
        },
        failure: {
          count: 15,
          colors: [themeColors.error, '#EF4444', '#F87171'],
          size: { min: 1, max: 4 },
          speed: { min: 30, max: 100 },
          lifetime: 800,
          gravity: 0.8,
          spread: 30,
        },
        damage: {
          count: 25,
          colors: ['#DC2626', '#B91C1C', '#991B1B'],
          size: { min: 3, max: 8 },
          speed: { min: 100, max: 200 },
          lifetime: 600,
          gravity: 1.2,
          spread: 60,
        },
        healing: {
          count: 30,
          colors: ['#10B981', '#34D399', '#6EE7B7'],
          size: { min: 2, max: 5 },
          speed: { min: 20, max: 80 },
          lifetime: 1500,
          gravity: -0.3, // Float upward
          spread: 90,
        },
        magic: {
          count: 40,
          colors: [
            themeColors.primary,
            themeColors.accent,
            '#8B5CF6',
            '#A78BFA',
          ],
          size: { min: 1, max: 7 },
          speed: { min: 40, max: 120 },
          lifetime: 2000,
          gravity: 0.1,
          spread: 120,
        },
        custom: {
          count: 20,
          colors: [themeColors.primary],
          size: { min: 2, max: 5 },
          speed: { min: 50, max: 100 },
          lifetime: 1000,
          gravity: 0.5,
          spread: 45,
        },
      }

      const finalConfig = { ...defaultConfigs[type], ...config }

      // Create particle system
      const rect = element.getBoundingClientRect()
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100vw'
      container.style.height = '100vh'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '9999'

      document.body.appendChild(container)

      // Generate particles
      for (let i = 0; i < finalConfig.count; i++) {
        const particle = document.createElement('div')
        const size =
          Math.random() * (finalConfig.size.max - finalConfig.size.min) +
          finalConfig.size.min
        const color =
          finalConfig.colors[
            Math.floor(Math.random() * finalConfig.colors.length)
          ]
        const angle =
          (Math.random() - 0.5) * finalConfig.spread * (Math.PI / 180)
        const speed =
          Math.random() * (finalConfig.speed.max - finalConfig.speed.min) +
          finalConfig.speed.min

        particle.style.position = 'absolute'
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.backgroundColor = color
        particle.style.borderRadius = '50%'
        particle.style.left = `${rect.left + rect.width / 2}px`
        particle.style.top = `${rect.top + rect.height / 2}px`
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`

        container.appendChild(particle)

        // Animate particle
        const startTime = performance.now()
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = elapsed / finalConfig.lifetime

          if (progress >= 1) {
            particle.remove()
            return
          }

          const x = Math.cos(angle) * speed * (elapsed / 1000)
          const y =
            Math.sin(angle) * speed * (elapsed / 1000) +
            finalConfig.gravity * (elapsed / 1000) ** 2 * 100
          const opacity = 1 - progress

          particle.style.transform = `translate(${x}px, ${y}px)`
          particle.style.opacity = opacity.toString()

          requestAnimationFrame(animate)
        }

        requestAnimationFrame(animate)
      }

      // Cleanup container after all particles are done
      setTimeout(() => {
        if (container.parentNode) {
          container.remove()
        }
      }, finalConfig.lifetime + 100)
    },
    [preferences, getThemeColors],
  )

  // Create persistent particle system
  const createParticleSystem = useCallback(
    (container: HTMLElement, config: ParticleConfig) => {
      if (!preferences.particleEffects || preferences.reduceMotion) {
        return () => {} // Return empty cleanup function
      }

      const systemId = Math.random().toString(36).slice(2, 11)
      let isActive = true

      const generateParticle = () => {
        if (!isActive) return

        const particle = document.createElement('div')
        const size =
          Math.random() * (config.size.max - config.size.min) + config.size.min
        const color =
          config.colors[Math.floor(Math.random() * config.colors.length)]

        particle.style.position = 'absolute'
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.backgroundColor = color
        particle.style.borderRadius = '50%'
        particle.style.pointerEvents = 'none'

        container.appendChild(particle)

        // Animate and remove particle
        setTimeout(() => {
          if (particle.parentNode) {
            particle.remove()
          }
        }, config.lifetime)

        // Schedule next particle
        if (isActive) {
          setTimeout(generateParticle, Math.random() * 200 + 100)
        }
      }

      // Start generating particles
      generateParticle()

      // Return cleanup function
      const cleanup = () => {
        isActive = false
        particleSystemsRef.current.delete(systemId)
      }

      particleSystemsRef.current.set(systemId, cleanup)
      return cleanup
    },
    [preferences],
  )

  // Staggered animations
  const useStaggeredAnimation = useCallback(
    (elements: HTMLElement[], config: Partial<StaggerConfig> = {}) => {
      if (!preferences.staggeredAnimations || preferences.reduceMotion) return

      const defaultConfig: StaggerConfig = {
        delay: 100,
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        direction: 'up',
      }

      const finalConfig = { ...defaultConfig, ...config }

      elements.forEach((element, index) => {
        if (!element) return

        const delay = index * finalConfig.delay

        // Set initial state
        element.style.opacity = '0'
        element.style.transform = getInitialTransform(finalConfig.direction)
        element.style.transition = `opacity ${finalConfig.duration}ms ${finalConfig.easing} ${delay}ms, transform ${finalConfig.duration}ms ${finalConfig.easing} ${delay}ms`

        // Trigger animation
        requestAnimationFrame(() => {
          element.style.opacity = '1'
          element.style.transform = 'translate(0, 0) scale(1)'
        })
      })
    },
    [preferences],
  )

  const applyStaggeredAnimation = useStaggeredAnimation

  const createStaggeredEntrance = useCallback(
    (selector: string, config: Partial<StaggerConfig> = {}) => {
      const elements = Array.from(
        document.querySelectorAll(selector),
      ) as HTMLElement[]
      if (elements.length === 0) return
      applyStaggeredAnimation(elements, config)
    },
    [applyStaggeredAnimation],
  )

  // Magical effects
  const addMagicalGlow = useCallback(
    (element: HTMLElement | null, color = 'var(--primary)', intensity = 1) => {
      if (!element || !preferences.glowEffects) return

      const glowSize = 10 * intensity
      element.style.boxShadow = `0 0 ${glowSize}px ${color}, 0 0 ${glowSize * 2}px ${color}`
      element.style.transition = 'box-shadow 0.3s ease'
    },
    [preferences],
  )

  const removeMagicalGlow = useCallback((element: HTMLElement | null) => {
    if (!element) return
    element.style.boxShadow = ''
  }, [])

  const pulseElement = useCallback(
    (element: HTMLElement | null, duration = 1000) => {
      if (!element || preferences.reduceMotion) return

      element.style.animation = `pulse ${duration}ms ease-in-out`

      // Remove animation after completion
      setTimeout(() => {
        element.style.animation = ''
      }, duration)
    },
    [preferences],
  )

  const shimmerEffect = useCallback(
    (element: HTMLElement | null, duration = 2000) => {
      if (!element || preferences.reduceMotion) return

      element.style.animation = `shimmer ${duration}ms ease-in-out infinite`

      // Remove animation after specified duration
      setTimeout(() => {
        element.style.animation = ''
      }, duration)
    },
    [preferences],
  )

  // Animation utilities
  const getAnimationDuration = useCallback(
    (baseMs: number) => {
      if (preferences.reduceMotion) return 0

      const speedMultipliers = {
        slow: 1.5,
        normal: 1,
        fast: 0.7,
      }

      return baseMs * speedMultipliers[preferences.transitionSpeed]
    },
    [preferences],
  )

  const shouldAnimate = useCallback(
    (animationType: 'particle' | 'stagger' | 'glow' | 'transition') => {
      if (preferences.reduceMotion) return false
      if (
        !isHighPerformance &&
        (animationType === 'particle' || animationType === 'stagger')
      )
        return false

      switch (animationType) {
        case 'particle':
          return preferences.particleEffects
        case 'stagger':
          return preferences.staggeredAnimations
        case 'glow':
          return preferences.glowEffects
        case 'transition':
          return true
        default:
          return true
      }
    },
    [preferences, isHighPerformance],
  )

  const createSpringConfig = useCallback(
    (type: 'gentle' | 'wobbly' | 'stiff' | 'slow') => {
      const configs = {
        gentle: { tension: 120, friction: 14 },
        wobbly: { tension: 180, friction: 12 },
        stiff: { tension: 210, friction: 20 },
        slow: { tension: 280, friction: 60 },
      }

      return configs[type]
    },
    [],
  )

  const togglePerformanceMode = useCallback(() => {
    setIsHighPerformance((prev) => !prev)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup all particle systems
      const cleanupFns = Array.from(particleSystemsRef.current.values())
      particleSystemsRef.current.clear()
      cleanupFns.forEach((cleanup) => cleanup())
    }
  }, [])

  return {
    // Animation preferences
    preferences,
    updatePreferences,

    // Particle effects
    triggerParticles,
    createParticleSystem,

    // Staggered animations
    useStaggeredAnimation,
    createStaggeredEntrance,

    // Magical effects
    addMagicalGlow,
    removeMagicalGlow,
    pulseElement,
    shimmerEffect,

    // Animation utilities
    getAnimationDuration,
    shouldAnimate,
    createSpringConfig,

    // Performance
    isHighPerformance,
    togglePerformanceMode,

    // Theme integration
    getThemeColors,
  }
}

// Helper function for initial transform based on direction
function getInitialTransform(direction: StaggerConfig['direction']): string {
  switch (direction) {
    case 'up':
      return 'translateY(20px) scale(0.95)'
    case 'down':
      return 'translateY(-20px) scale(0.95)'
    case 'left':
      return 'translateX(20px) scale(0.95)'
    case 'right':
      return 'translateX(-20px) scale(0.95)'
    case 'center':
      return 'scale(0.8)'
    default:
      return 'translateY(20px) scale(0.95)'
  }
}
