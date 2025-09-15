import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { OrbitControls, Text3D, Center } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Card, CardContent, Button, Badge } from '../ui'
import { Box, Sparkles, Dna, View, Plus, Minus } from 'lucide-react'
import { MagicalParticles } from '../animations/MagicalParticles'

// Types
interface Dice3DResult {
  dice1: number
  dice2: number
  total: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'
  rollDuration: number
  timestamp: number
}

interface Dice3DProps {
  modifier?: number
  disabled?: boolean
  enablePhysics?: boolean
  enableShadows?: boolean
  theme?: 'fantasy' | 'sci-fi' | 'dark' | 'light'
  onRoll?: (result: Dice3DResult) => void
  onRollStart?: () => void
  onRollComplete?: (result: Dice3DResult) => void
}

// Dice face configurations (dot positions for each face)
const DICE_FACES = {
  1: [[0, 0, 0]],
  2: [[-0.3, -0.3, 0], [0.3, 0.3, 0]],
  3: [[-0.3, -0.3, 0], [0, 0, 0], [0.3, 0.3, 0]],
  4: [[-0.3, -0.3, 0], [0.3, -0.3, 0], [-0.3, 0.3, 0], [0.3, 0.3, 0]],
  5: [[-0.3, -0.3, 0], [0.3, -0.3, 0], [0, 0, 0], [-0.3, 0.3, 0], [0.3, 0.3, 0]],
  6: [[-0.3, -0.3, 0], [0.3, -0.3, 0], [-0.3, 0, 0], [0.3, 0, 0], [-0.3, 0.3, 0], [0.3, 0.3, 0]]
}

// Individual dice component
const DiceModel: React.FC<{ 
  position: [number, number, number]
  theme: string
  onSettle?: (value: number) => void
  rollTrigger?: number
}> = ({ position, theme, onSettle, rollTrigger }) => {
  const rigidBodyRef = useRef<any>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [settled, setSettled] = useState(false)
  const [currentValue, setCurrentValue] = useState(1)

  const getDiceColors = () => {
    switch (theme) {
      case 'fantasy':
        return { 
          dice: '#fdfcf8', 
          dots: '#8b7355', 
          edge: '#d4af37',
          glow: '#d4af37'
        }
      case 'sci-fi':
        return { 
          dice: '#1a1a1a', 
          dots: '#00ff88', 
          edge: '#3b82f6',
          glow: '#00ff88'
        }
      case 'dark':
        return { 
          dice: '#4a3d2a', 
          dots: '#fdfcf8', 
          edge: '#d4af37',
          glow: '#d4af37'
        }
      default:
        return { 
          dice: '#ffffff', 
          dots: '#333333', 
          edge: '#666666',
          glow: '#3b82f6'
        }
    }
  }

  const colors = getDiceColors()

  // Apply roll force when triggered
  useEffect(() => {
    if (rollTrigger && rigidBodyRef.current && !settled) {
      const force = {
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 15 + 10,
        z: (Math.random() - 0.5) * 20
      }
      const torque = {
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
        z: (Math.random() - 0.5) * 30
      }
      
      rigidBodyRef.current.applyImpulse(force, true)
      rigidBodyRef.current.applyTorqueImpulse(torque, true)
      setSettled(false)
    }
  }, [rollTrigger, settled])

  // Check if dice has settled
  useFrame(() => {
    if (rigidBodyRef.current && !settled) {
      const velocity = rigidBodyRef.current.linvel()
      const angularVelocity = rigidBodyRef.current.angvel()
      
      const isStill = Math.abs(velocity.x) < 0.1 && 
                     Math.abs(velocity.y) < 0.1 && 
                     Math.abs(velocity.z) < 0.1 &&
                     Math.abs(angularVelocity.x) < 0.1 &&
                     Math.abs(angularVelocity.y) < 0.1 &&
                     Math.abs(angularVelocity.z) < 0.1

      if (isStill && rigidBodyRef.current.translation().y > -1) {
        setSettled(true)
        
        // Determine which face is up based on rotation
        const rotation = rigidBodyRef.current.rotation()
        const euler = new THREE.Euler().setFromQuaternion(rotation)
        
        // Simple face detection based on rotation
        let faceValue = Math.floor(Math.random() * 6) + 1
        
        // More realistic face detection could be implemented here
        // For now, using random with some bias based on rotation
        const rotX = Math.abs(euler.x % (Math.PI * 2))
        const rotZ = Math.abs(euler.z % (Math.PI * 2))
        
        if (rotX < Math.PI / 4 || rotX > 7 * Math.PI / 4) faceValue = 1
        else if (rotX > Math.PI / 4 && rotX < 3 * Math.PI / 4) faceValue = rotZ < Math.PI ? 2 : 5
        else if (rotX > 3 * Math.PI / 4 && rotX < 5 * Math.PI / 4) faceValue = 6
        else if (rotX > 5 * Math.PI / 4 && rotX < 7 * Math.PI / 4) faceValue = rotZ < Math.PI ? 3 : 4
        
        setCurrentValue(faceValue)
        onSettle?.(faceValue)
      }
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      restitution={0.4}
      friction={0.6}
      linearDamping={0.4}
      angularDamping={0.4}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial 
          color={colors.dice}
          shininess={theme === 'sci-fi' ? 100 : 30}
          transparent={theme === 'sci-fi'}
          opacity={theme === 'sci-fi' ? 0.9 : 1}
        />
        
        {/* Dice edges */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color={colors.edge} linewidth={2} />
        </lineSegments>
        
        {/* Dots on faces */}
        {Object.entries(DICE_FACES).map(([face, dots]) => 
          dots.map((dotPos, index) => (
            <mesh
              key={`${face}-${index}`}
              position={[
                face === '1' || face === '6' ? 0.51 * (face === '1' ? 1 : -1) : dotPos[0],
                face === '2' || face === '5' ? 0.51 * (face === '2' ? 1 : -1) : dotPos[1],
                face === '3' || face === '4' ? 0.51 * (face === '3' ? 1 : -1) : dotPos[2]
              ]}
            >
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshPhongMaterial 
                color={colors.dots}
                emissive={theme === 'sci-fi' ? colors.glow : '#000000'}
                emissiveIntensity={theme === 'sci-fi' ? 0.3 : 0}
              />
            </mesh>
          ))
        )}
      </mesh>
    </RigidBody>
  )
}

// Table component
const DiceTable: React.FC<{ theme: string }> = ({ theme }) => {
  const getTableColor = () => {
    switch (theme) {
      case 'fantasy': return '#f9f6ed'
      case 'sci-fi': return '#0a0a0a'
      case 'dark': return '#6d5a42'
      default: return '#f8f9fa'
    }
  }

  return (
    <RigidBody type="fixed" position={[0, -2, 0]}>
      <CuboidCollider args={[8, 0.1, 8]} />
      <mesh receiveShadow>
        <boxGeometry args={[16, 0.2, 16]} />
        <meshPhongMaterial 
          color={getTableColor()}
          transparent={theme === 'sci-fi'}
          opacity={theme === 'sci-fi' ? 0.8 : 1}
        />
      </mesh>
    </RigidBody>
  )
}

// Lighting setup
const SceneLighting: React.FC<{ theme: string }> = ({ theme }) => {
  const getLightColors = () => {
    switch (theme) {
      case 'fantasy':
        return { ambient: '#fff8dc', directional: '#ffffff', point: '#d4af37' }
      case 'sci-fi':
        return { ambient: '#404040', directional: '#3b82f6', point: '#00ff88' }
      case 'dark':
        return { ambient: '#2a2a2a', directional: '#d4af37', point: '#d4af37' }
      default:
        return { ambient: '#ffffff', directional: '#ffffff', point: '#3b82f6' }
    }
  }

  const colors = getLightColors()

  return (
    <>
      <ambientLight color={colors.ambient} intensity={0.4} />
      <directionalLight
        color={colors.directional}
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight
        color={colors.point}
        position={[0, 5, 0]}
        intensity={0.5}
        distance={20}
      />
    </>
  )
}

// Main 3D Scene
const Dice3DScene: React.FC<{
  theme: string
  rollTrigger: number
  onBothDiceSettled: (dice1: number, dice2: number) => void
}> = ({ theme, rollTrigger, onBothDiceSettled }) => {
  const [dice1Value, setDice1Value] = useState<number | null>(null)
  const [dice2Value, setDice2Value] = useState<number | null>(null)

  const handleDice1Settle = (value: number) => {
    setDice1Value(value)
  }

  const handleDice2Settle = (value: number) => {
    setDice2Value(value)
  }

  useEffect(() => {
    if (dice1Value !== null && dice2Value !== null) {
      onBothDiceSettled(dice1Value, dice2Value)
      // Reset after a delay
      setTimeout(() => {
        setDice1Value(null)
        setDice2Value(null)
      }, 3000)
    }
  }, [dice1Value, dice2Value, onBothDiceSettled])

  return (
    <>
      <SceneLighting theme={theme} />
      <DiceTable theme={theme} />
      <DiceModel
        position={[-1.5, 2, 0]}
        theme={theme}
        onSettle={handleDice1Settle}
        rollTrigger={rollTrigger}
      />
      <DiceModel
        position={[1.5, 2, 0]}
        theme={theme}
        onSettle={handleDice2Settle}
        rollTrigger={rollTrigger}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={8}
        maxDistance={20}
      />
    </>
  )
}

// Utility functions
const getOutcome = (total: number): 'success' | 'partial' | 'failure' => {
  if (total >= 10) return 'success'
  if (total >= 7) return 'partial'
  return 'failure'
}

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'success': return 'text-(--nature-500)'
    case 'partial': return 'text-(--gold-500)'
    case 'failure': return 'text-(--danger-500)'
    default: return 'text-(--color-text-primary)'
  }
}

const getOutcomeText = (outcome: string) => {
  switch (outcome) {
    case 'success': return 'Success! (10+)'
    case 'partial': return 'Partial Success (7-9)'
    case 'failure': return 'Failure (6-)'
    default: return ''
  }
}

// Main component
export const Dice3D: React.FC<Dice3DProps> = ({
  modifier = 0,
  disabled = false,
  enablePhysics = true,
  enableShadows = true,
  theme = 'fantasy',
  onRoll,
  onRollStart,
  onRollComplete
}) => {
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<Dice3DResult | null>(null)
  const [rollTrigger, setRollTrigger] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [rollStartTime, setRollStartTime] = useState(0)

  const handleRoll = useCallback(() => {
    if (isRolling || disabled) return

    setIsRolling(true)
    setResult(null)
    setShowParticles(false)
    setRollStartTime(Date.now())
    setRollTrigger(prev => prev + 1)
    onRollStart?.()
  }, [isRolling, disabled, onRollStart])

  const handleBothDiceSettled = useCallback((dice1: number, dice2: number) => {
    if (!isRolling) return

    const rollDuration = (Date.now() - rollStartTime) / 1000
    const total = dice1 + dice2
    const finalResult = total + modifier
    const outcome = getOutcome(finalResult)

    const diceResult: Dice3DResult = {
      dice1,
      dice2,
      total,
      modifier,
      finalResult,
      outcome,
      rollDuration,
      timestamp: Date.now()
    }

    setResult(diceResult)
    setIsRolling(false)
    setShowParticles(true)

    // Hide particles after animation
    setTimeout(() => setShowParticles(false), 2000)

    onRoll?.(diceResult)
    onRollComplete?.(diceResult)
  }, [isRolling, modifier, rollStartTime, onRoll, onRollComplete])

  return (
    <Card variant="magical" padding="lg" className="relative overflow-hidden">
      <MagicalParticles 
        trigger={showParticles} 
        color={result?.outcome === 'success' ? '#22c55e' : result?.outcome === 'partial' ? '#d4af37' : '#ef4444'}
        count={result?.outcome === 'success' ? 30 : 20}
      />
      
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Box className="w-6 h-6 text-(--color-primary)" />
            <h3 className="text-xl font-display text-(--parchment-900) font-bold">3D Dice Roll</h3>
            {modifier !== 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {modifier > 0 ? <Plus size={12} /> : <Minus size={12} />}
                {Math.abs(modifier)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-(--parchment-600)" />
            <span className="text-xs text-(--parchment-600)">Physics</span>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="relative h-80 w-full dice-canvas scene-container">
          <Canvas
            shadows={enableShadows}
            camera={{ position: [0, 8, 12], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={[theme === 'sci-fi' ? '#000000' : '#fdfcf8']} />
            {enablePhysics ? (
              <Physics gravity={[0, -9.81, 0]}>
                <Dice3DScene
                  theme={theme}
                  rollTrigger={rollTrigger}
                  onBothDiceSettled={handleBothDiceSettled}
                />
              </Physics>
            ) : (
              <Dice3DScene
                theme={theme}
                rollTrigger={rollTrigger}
                onBothDiceSettled={handleBothDiceSettled}
              />
            )}
          </Canvas>

          {/* Result Overlay */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="dice-result-overlay"
              >
                <div className="text-center space-y-2">
                  <div className="text-sm text-(--parchment-700) font-mono">
                    {result.dice1} + {result.dice2} {modifier !== 0 ? `+ ${modifier}` : ''} = 
                  </div>
                  <div className={`text-2xl font-bold font-display ${getOutcomeColor(result.outcome)}`}>
                    {result.finalResult}
                  </div>
                  <div className={`text-sm font-medium ${getOutcomeColor(result.outcome)}`}>
                    {getOutcomeText(result.outcome)}
                  </div>
                  <div className="text-xs text-(--parchment-600)">
                    {result.rollDuration.toFixed(1)}s
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          {isRolling && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <View className="w-4 h-4 text-(--parchment-600)" />
            <span className="text-xs text-(--parchment-600)">
              Use mouse to orbit • Scroll to zoom
            </span>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleRoll}
              disabled={isRolling || disabled}
              className="relative overflow-hidden"
            >
              <motion.div
                className="flex items-center gap-2"
                animate={isRolling ? { x: [0, 2, -2, 0] } : { x: 0 }}
                transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0 }}
              >
                <Sparkles size={20} />
                {isRolling ? 'Rolling...' : 'Roll 3D Dice'}
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}