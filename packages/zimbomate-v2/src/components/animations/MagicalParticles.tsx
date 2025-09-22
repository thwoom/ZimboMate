import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

interface MagicalParticlesProps {
  trigger?: boolean
  color?: string
  count?: number
  duration?: number
  className?: string
}

export const MagicalParticles: React.FC<MagicalParticlesProps> = ({
  trigger = false,
  color = '#d4af37',
  count = 20,
  duration = 2000,
  className = ''
}) => {
  // PERFORMANCE: Particles completely removed
  return null

  const createParticle = (x: number, y: number): Particle => ({
    id: Math.random(),
    x,
    y,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4 - 2,
    life: duration,
    maxLife: duration,
    size: Math.random() * 4 + 2,
    color
  })

  const updateParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life -= 16 // Assuming 60fps
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // Gravity

      const alpha = particle.life / particle.maxLife
      
      if (alpha > 0) {
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
        ctx.fill()
        ctx.restore()

        return true
      }
      return false
    })

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles)
    }
  }

  const triggerParticles = () => {
    if (DISABLE_PARTICLES) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create particles
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(
        centerX + (Math.random() - 0.5) * 20,
        centerY + (Math.random() - 0.5) * 20
      ))
    }

    // Start animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    updateParticles()
  }

  useEffect(() => {
    if (trigger) {
      triggerParticles()
    }
  }, [trigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (DISABLE_PARTICLES) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 10 }}
    />
  )
}

// Floating sparkles component for ambient magic
export const FloatingSparkles: React.FC<{ count?: number }> = ({ count = 5 }) => {
  // PERFORMANCE: Sparkles completely removed
  return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-(--color-primary) rounded-full"
          initial={{
            x: `${Math.random() * 100  }%`,
            y: `${Math.random() * 100  }%`,
            opacity: 0
          }}
          animate={{
            y: [null, '-20px', '20px'],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}