/**
 * Move3DIntegration - Seamless integration between moves and 3D dice system
 * Provides enhanced visual feedback for move execution with particle effects
 */

import React, { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Card, CardContent, Button } from '../ui'
import { useDiceRoll } from '../../hooks/useDiceRoll'
import { useAnimations } from '../../hooks/useAnimations'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles, Zap } from 'lucide-react'

interface Move3DIntegrationProps {
  moveId: string
  moveName: string
  stat: string
  modifier: number
  onRollComplete: (result: any) => void
  onCancel: () => void
  isVisible: boolean
}

interface ParticleEffect {
  id: string
  type: 'success' | 'partial' | 'failure' | 'critical'
  position: { x: number; y: number; z: number }
  color: string
  intensity: number
}

const MoveParticles: React.FC<{ effects: ParticleEffect[] }> = ({ effects }) => {
  return (
    <>
      {effects.map(effect => (
        <group key={effect.id} position={[effect.position.x, effect.position.y, effect.position.z]}>
          <pointLight
            color={effect.color}
            intensity={effect.intensity}
            distance={5}
            decay={2}
          />
          
          {/* Particle system would go here - simplified for demo */}
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial 
              color={effect.color} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

const getDiceIcon = (value: number) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]
  return icons[Math.max(0, Math.min(5, value - 1))] || Dice1
}

const getOutcomeColor = (total: number) => {
  if (total >= 10) return 'text-chart-2'
  if (total >= 7) return 'text-chart-4'
  return 'text-destructive'
}

const getOutcomeText = (total: number) => {
  if (total >= 10) return 'Success!'
  if (total >= 7) return 'Partial Success'
  return 'Failure'
}

export const Move3DIntegration: React.FC<Move3DIntegrationProps> = ({
  moveId,
  moveName,
  stat,
  modifier,
  onRollComplete,
  onCancel,
  isVisible
}) => {
  const { rollWithStat, isRolling, lastRoll } = useDiceRoll()
  const { triggerParticleEffect } = useAnimations()
  const [rollResult, setRollResult] = useState<any>(null)
  const [particleEffects, setParticleEffects] = useState<ParticleEffect[]>([])
  const [showResult, setShowResult] = useState(false)

  const handleRoll = useCallback(async () => {
    try {
      const result = await rollWithStat(stat as any, modifier)
      setRollResult(result)
      setShowResult(true)

      // Create particle effects based on outcome
      const effectType = result.total >= 10 ? 'success' : 
                        result.total >= 7 ? 'partial' : 'failure'
      
      const newEffect: ParticleEffect = {
        id: `move-${Date.now()}`,
        type: effectType,
        position: { x: 0, y: 0, z: 0 },
        color: result.total >= 10 ? '#22c55e' : 
               result.total >= 7 ? '#eab308' : '#ef4444',
        intensity: result.total >= 10 ? 2 : 1
      }

      setParticleEffects([newEffect])

      // Trigger screen particle effect
      triggerParticleEffect(effectType, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      })

      // Auto-complete after showing result
      setTimeout(() => {
        onRollComplete(result)
      }, 2000)

    } catch (error) {
      console.error('Roll failed:', error)
    }
  }, [rollWithStat, stat, modifier, onRollComplete, triggerParticleEffect])

  const handleComplete = () => {
    if (rollResult) {
      onRollComplete(rollResult)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-2xl mx-4"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <Card variant="magical" className="relative overflow-hidden">
              {/* Background 3D Scene */}
              <div className="absolute inset-0 opacity-20">
                <Canvas camera={{ position: [0, 0, 5] }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <MoveParticles effects={particleEffects} />
                </Canvas>
              </div>

              <CardContent className="relative z-10 p-6">
                <div className="text-center space-y-6">
                  {/* Move Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Zap size={32} className="text-primary" />
                      <h2 className="text-display-lg text-foreground">
                        {moveName}
                      </h2>
                    </div>
                    
                    <p className="text-body-lg text-muted-foreground">
                      Rolling 2d6 + {stat.toUpperCase()} 
                      {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
                    </p>
                  </motion.div>

                  {/* Dice Display */}
                  {!showResult && (
                    <motion.div
                      className="flex items-center justify-center gap-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {isRolling ? (
                        <>
                          <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                          >
                            <Dice1 size={48} className="text-primary" />
                          </motion.div>
                          <motion.div
                            animate={{ rotateY: -360 }}
                            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                          >
                            <Dice1 size={48} className="text-primary" />
                          </motion.div>
                        </>
                      ) : (
                        <>
                          <Dice1 size={48} className="text-muted-foreground" />
                          <Dice1 size={48} className="text-muted-foreground" />
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Roll Result */}
                  {showResult && rollResult && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Dice Results */}
                      <div className="flex items-center justify-center gap-4">
                        {rollResult.dice.map((die: number, index: number) => {
                          const DiceIcon = getDiceIcon(die)
                          return (
                            <motion.div
                              key={index}
                              initial={{ rotateY: 0 }}
                              animate={{ rotateY: 360 }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                              <DiceIcon size={48} className="text-primary" />
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Total and Outcome */}
                      <div className="text-center">
                        <motion.div
                          className="text-4xl font-bold mb-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        >
                          <span className={getOutcomeColor(rollResult.total)}>
                            {rollResult.total}
                          </span>
                        </motion.div>
                        
                        <motion.div
                          className="text-lg font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className={getOutcomeColor(rollResult.total)}>
                            {getOutcomeText(rollResult.total)}
                          </span>
                        </motion.div>

                        {/* Breakdown */}
                        <motion.p
                          className="text-sm text-muted-foreground mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          {rollResult.dice.join(' + ')} + {rollResult.modifier} = {rollResult.total}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    className="flex gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    {!showResult ? (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleRoll}
                          disabled={isRolling}
                          className="gap-2 magical-glow"
                        >
                          <Sparkles size={20} />
                          {isRolling ? 'Rolling...' : 'Roll Dice'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={onCancel}
                          disabled={isRolling}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleComplete}
                        className="gap-2"
                      >
                        Continue
                      </Button>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

