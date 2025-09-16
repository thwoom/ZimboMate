import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider, useRapier } from '@react-three/rapier'
import { OrbitControls, Text3D, Center, Environment, ContactShadows, useTexture } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { Card, CardContent, Button, Badge } from '../ui'
import { Box, Sparkles, Dna, View, Plus, Minus, Volume2, VolumeX, Settings } from 'lucide-react'
import { MagicalParticles } from '../animations/MagicalParticles'

// Audio system integration
interface AudioSystem {
  playRollSound: (force: number) => void
  playCollisionSound: (intensity: number, position: THREE.Vector3) => void
  playSettleSound: (material: string) => void
  playOutcomeSound: (outcome: 'success' | 'partial' | 'failure') => void
  setVolume: (volume: number) => void
  mute: () => void
  unmute: () => void
}

// Enhanced dice result with more detailed information
interface EnhancedDice3DResult {
  dice1: number
  dice2: number
  total: number
  modifier: number
  finalResult: number
  outcome: 'success' | 'partial' | 'failure'
  rollDuration: number
  timestamp: number
  rollForce: number
  settlePosition: [number, number, number]
  rotationPath: THREE.Euler[]
  collisionCount: number
}

interface EnhancedDice3DProps {
  modifier?: number
  disabled?: boolean
  enablePhysics?: boolean
  enableShadows?: boolean
  enableAudio?: boolean
  theme?: 'fantasy' | 'sci-fi' | 'dark' | 'light'
  diceStyle?: 'ivory' | 'obsidian' | 'crystal' | 'metal' | 'wood'
  tableStyle?: 'felt' | 'wood' | 'stone' | 'magical'
  onRoll?: (result: EnhancedDice3DResult) => void
  onRollStart?: () => void
  onRollComplete?: (result: EnhancedDice3DResult) => void
  onCollision?: (intensity: number, position: THREE.Vector3) => void
}

// Enhanced dice face configurations with better positioning
const ENHANCED_DICE_FACES = {
  1: { dots: [[0, 0, 0.51]], normal: [0, 0, 1] },
  2: { dots: [[-0.25, -0.25, 0.51], [0.25, 0.25, 0.51]], normal: [0, 0, 1] },
  3: { dots: [[-0.25, -0.25, 0.51], [0, 0, 0.51], [0.25, 0.25, 0.51]], normal: [0, 0, 1] },
  4: { dots: [[-0.25, -0.25, 0.51], [0.25, -0.25, 0.51], [-0.25, 0.25, 0.51], [0.25, 0.25, 0.51]], normal: [0, 0, 1] },
  5: { dots: [[-0.25, -0.25, 0.51], [0.25, -0.25, 0.51], [0, 0, 0.51], [-0.25, 0.25, 0.51], [0.25, 0.25, 0.51]], normal: [0, 0, 1] },
  6: { dots: [[-0.25, -0.3, 0.51], [0.25, -0.3, 0.51], [-0.25, 0, 0.51], [0.25, 0, 0.51], [-0.25, 0.3, 0.51], [0.25, 0.3, 0.51]], normal: [0, 0, 1] }
}

// Enhanced dice materials with PBR properties
const getDiceMaterial = (style: string, theme: string) => {
  const materials = {
    ivory: {
      color: '#fdfcf8',
      roughness: 0.3,
      metalness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    },
    obsidian: {
      color: '#1a1a1a',
      roughness: 0.1,
      metalness: 0.8,
      emissive: theme === 'sci-fi' ? '#3b82f6' : '#000000',
      emissiveIntensity: theme === 'sci-fi' ? 0.2 : 0
    },
    crystal: {
      color: '#ffffff',
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      emissive: theme === 'fantasy' ? '#d4af37' : '#3b82f6',
      emissiveIntensity: 0.3
    },
    metal: {
      color: theme === 'fantasy' ? '#d4af37' : '#c0c0c0',
      roughness: 0.2,
      metalness: 0.9,
      emissive: '#000000',
      emissiveIntensity: 0
    },
    wood: {
      color: '#8b4513',
      roughness: 0.8,
      metalness: 0.0,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  }
  
  return materials[style as keyof typeof materials] || materials.ivory
}

// Enhanced dice model with improved physics and visuals
const EnhancedDiceModel: React.FC<{
  position: [number, number, number]
  theme: string
  diceStyle: string
  onSettle?: (value: number, position: [number, number, number], rotationPath: THREE.Euler[]) => void
  onCollision?: (intensity: number, position: THREE.Vector3) => void
  rollTrigger?: number
  audioSystem?: AudioSystem
}> = ({ position, theme, diceStyle, onSettle, onCollision, rollTrigger, audioSystem }) => {
  const rigidBodyRef = useRef<any>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [settled, setSettled] = useState(false)
  const [currentValue, setCurrentValue] = useState(1)
  const [rotationPath, setRotationPath] = useState<THREE.Euler[]>([])
  const [collisionCount, setCollisionCount] = useState(0)
  
  const { rapier, world } = useRapier()
  
  const material = getDiceMaterial(diceStyle, theme)
  
  // Enhanced face detection using raycasting
  const detectTopFace = useCallback((rotation: THREE.Quaternion, position: THREE.Vector3): number => {
    if (!world || !rapier) return Math.floor(Math.random() * 6) + 1
    
    // Cast ray downward from dice center
    const rayOrigin = new rapier.Vector3(position.x, position.y + 0.6, position.z)
    const rayDirection = new rapier.Vector3(0, -1, 0)
    const maxDistance = 1.2
    
    const ray = new rapier.Ray(rayOrigin, rayDirection)
    const hit = world.castRay(ray, maxDistance, false)
    
    if (hit) {
      // Use rotation to determine which face is up
      const euler = new THREE.Euler().setFromQuaternion(rotation)
      const normalizedRotX = ((euler.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const normalizedRotZ = ((euler.z % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      
      // More accurate face detection based on rotation
      const faces = [
        { value: 1, rotX: 0, rotZ: 0 },
        { value: 6, rotX: Math.PI, rotZ: 0 },
        { value: 2, rotX: Math.PI/2, rotZ: 0 },
        { value: 5, rotX: -Math.PI/2, rotZ: 0 },
        { value: 3, rotX: 0, rotZ: Math.PI/2 },
        { value: 4, rotX: 0, rotZ: -Math.PI/2 }
      ]
      
      let closestFace = faces[0]
      let minDistance = Infinity
      
      faces.forEach(face => {
        const distance = Math.abs(normalizedRotX - face.rotX) + Math.abs(normalizedRotZ - face.rotZ)
        if (distance < minDistance) {
          minDistance = distance
          closestFace = face
        }
      })
      
      return closestFace.value
    }
    
    return Math.floor(Math.random() * 6) + 1
  }, [world, rapier])
  
  // Apply enhanced roll force
  useEffect(() => {
    if (rollTrigger && rigidBodyRef.current && !settled) {
      const rollForce = Math.random() * 10 + 15
      const force = {
        x: (Math.random() - 0.5) * rollForce,
        y: Math.random() * rollForce + 10,
        z: (Math.random() - 0.5) * rollForce
      }
      const torque = {
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40
      }
      
      rigidBodyRef.current.applyImpulse(force, true)
      rigidBodyRef.current.applyTorqueImpulse(torque, true)
      setSettled(false)
      setRotationPath([])
      setCollisionCount(0)
      
      // Play roll sound
      audioSystem?.playRollSound(rollForce)
    }
  }, [rollTrigger, settled, audioSystem])
  
  // Enhanced physics monitoring
  useFrame(() => {
    if (rigidBodyRef.current && !settled) {
      const velocity = rigidBodyRef.current.linvel()
      const angularVelocity = rigidBodyRef.current.angvel()
      const position = rigidBodyRef.current.translation()
      const rotation = rigidBodyRef.current.rotation()
      
      // Track rotation path
      const euler = new THREE.Euler().setFromQuaternion(rotation)
      setRotationPath(prev => [...prev.slice(-20), euler.clone()])
      
      // Enhanced settling detection
      const linearSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2)
      const angularSpeed = Math.sqrt(angularVelocity.x ** 2 + angularVelocity.y ** 2 + angularVelocity.z ** 2)
      
      const isStill = linearSpeed < 0.05 && angularSpeed < 0.05 && position.y > -1.5
      
      if (isStill) {
        setSettled(true)
        
        const faceValue = detectTopFace(rotation, position)
        setCurrentValue(faceValue)
        
        const finalPosition: [number, number, number] = [position.x, position.y, position.z]
        onSettle?.(faceValue, finalPosition, rotationPath)
        
        // Play settle sound
        audioSystem?.playSettleSound(diceStyle)
      }
    }
  })
  
  // Collision detection
  const handleCollision = useCallback((event: any) => {
    const intensity = event.totalForceMagnitude || 1
    if (intensity > 5) {
      setCollisionCount(prev => prev + 1)
      const position = rigidBodyRef.current?.translation()
      if (position) {
        onCollision?.(intensity, new THREE.Vector3(position.x, position.y, position.z))
        audioSystem?.playCollisionSound(intensity, new THREE.Vector3(position.x, position.y, position.z))
      }
    }
  }, [onCollision, audioSystem])
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      restitution={0.6}
      friction={0.8}
      linearDamping={0.3}
      angularDamping={0.3}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[0.5, 0.5, 0.5]} />
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          transmission={material.transmission || 0}
          thickness={material.thickness || 0}
          emissive={material.emissive}
          emissiveIntensity={material.emissiveIntensity}
          clearcoat={diceStyle === 'crystal' ? 1.0 : 0}
          clearcoatRoughness={0.1}
        />
        
        {/* Enhanced dice dots with better materials */}
        {Object.entries(ENHANCED_DICE_FACES).map(([face, config]) =>
          config.dots.map((dotPos, index) => (
            <mesh
              key={`${face}-${index}`}
              position={dotPos}
            >
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshPhysicalMaterial
                color={theme === 'sci-fi' ? '#00ff88' : '#333333'}
                roughness={0.1}
                metalness={diceStyle === 'metal' ? 0.8 : 0.1}
                emissive={theme === 'sci-fi' ? '#00ff88' : '#000000'}
                emissiveIntensity={theme === 'sci-fi' ? 0.5 : 0}
              />
            </mesh>
          ))
        )}
        
        {/* Magical glow effect for fantasy theme */}
        {theme === 'fantasy' && (
          <mesh scale={[1.05, 1.05, 1.05]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color="#d4af37"
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </mesh>
    </RigidBody>
  )
}

// Enhanced table with different materials
const EnhancedDiceTable: React.FC<{ 
  theme: string
  tableStyle: string
  onCollision?: (intensity: number, position: THREE.Vector3) => void
}> = ({ theme, tableStyle, onCollision }) => {
  const getTableMaterial = () => {
    const materials = {
      felt: { color: '#0f5132', roughness: 0.9, metalness: 0.0 },
      wood: { color: '#8b4513', roughness: 0.7, metalness: 0.0 },
      stone: { color: '#696969', roughness: 0.4, metalness: 0.1 },
      magical: { 
        color: theme === 'fantasy' ? '#d4af37' : '#3b82f6', 
        roughness: 0.2, 
        metalness: 0.3,
        emissive: theme === 'fantasy' ? '#d4af37' : '#3b82f6',
        emissiveIntensity: 0.1
      }
    }
    return materials[tableStyle as keyof typeof materials] || materials.felt
  }
  
  const material = getTableMaterial()
  
  const handleCollision = useCallback((event: any) => {
    const intensity = event.totalForceMagnitude || 1
    if (intensity > 3) {
      const manifold = event.manifold
      if (manifold && manifold.points.length > 0) {
        const point = manifold.points[0]
        onCollision?.(intensity, new THREE.Vector3(point.x, point.y, point.z))
      }
    }
  }, [onCollision])
  
  return (
    <RigidBody type="fixed" position={[0, -2, 0]} onCollisionEnter={handleCollision}>
      <CuboidCollider args={[8, 0.1, 8]} />
      <mesh receiveShadow>
        <boxGeometry args={[16, 0.2, 16]} />
        <meshPhysicalMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          emissive={material.emissive || '#000000'}
          emissiveIntensity={material.emissiveIntensity || 0}
        />
      </mesh>
      
      {/* Table border */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[16.2, 0.1, 16.2]} />
        <meshPhysicalMaterial
          color={theme === 'fantasy' ? '#8b7355' : '#666666'}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
    </RigidBody>
  )
}

// Enhanced lighting system
const EnhancedSceneLighting: React.FC<{ 
  theme: string
  dicePositions: [number, number, number][]
  isRolling: boolean
}> = ({ theme, dicePositions, isRolling }) => {
  const spotlightRef = useRef<THREE.SpotLight>(null)
  
  useFrame(() => {
    if (spotlightRef.current && dicePositions.length > 0) {
      // Follow dice during roll
      const avgPosition = dicePositions.reduce(
        (acc, pos) => [acc[0] + pos[0], acc[1] + pos[1], acc[2] + pos[2]],
        [0, 0, 0]
      ).map(coord => coord / dicePositions.length) as [number, number, number]
      
      spotlightRef.current.target.position.set(...avgPosition)
      spotlightRef.current.target.updateMatrixWorld()
    }
  })
  
  const getLightColors = () => {
    switch (theme) {
      case 'fantasy':
        return { 
          ambient: '#fff8dc', 
          directional: '#ffffff', 
          spot: '#d4af37',
          intensity: isRolling ? 1.5 : 1.0
        }
      case 'sci-fi':
        return { 
          ambient: '#404040', 
          directional: '#3b82f6', 
          spot: '#00ff88',
          intensity: isRolling ? 2.0 : 1.2
        }
      case 'dark':
        return { 
          ambient: '#2a2a2a', 
          directional: '#d4af37', 
          spot: '#d4af37',
          intensity: isRolling ? 1.3 : 0.8
        }
      default:
        return { 
          ambient: '#ffffff', 
          directional: '#ffffff', 
          spot: '#3b82f6',
          intensity: isRolling ? 1.2 : 1.0
        }
    }
  }
  
  const colors = getLightColors()
  
  return (
    <>
      <ambientLight color={colors.ambient} intensity={0.3} />
      <directionalLight
        color={colors.directional}
        position={[10, 10, 5]}
        intensity={colors.intensity}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <spotLight
        ref={spotlightRef}
        color={colors.spot}
        position={[0, 8, 0]}
        intensity={colors.intensity * 0.8}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={20}
        castShadow
      />
      <Environment preset="warehouse" />
    </>
  )
}

// Main enhanced 3D scene
const Enhanced3DScene: React.FC<{
  theme: string
  diceStyle: string
  tableStyle: string
  rollTrigger: number
  audioSystem?: AudioSystem
  onBothDiceSettled: (
    dice1: number, 
    dice2: number, 
    positions: [[number, number, number], [number, number, number]],
    rotationPaths: [THREE.Euler[], THREE.Euler[]],
    collisionData: { dice1: number, dice2: number }
  ) => void
  onCollision?: (intensity: number, position: THREE.Vector3) => void
}> = ({ 
  theme, 
  diceStyle, 
  tableStyle, 
  rollTrigger, 
  audioSystem, 
  onBothDiceSettled, 
  onCollision 
}) => {
  const [dice1Value, setDice1Value] = useState<number | null>(null)
  const [dice2Value, setDice2Value] = useState<number | null>(null)
  const [dice1Position, setDice1Position] = useState<[number, number, number]>([0, 0, 0])
  const [dice2Position, setDice2Position] = useState<[number, number, number]>([0, 0, 0])
  const [dice1RotationPath, setDice1RotationPath] = useState<THREE.Euler[]>([])
  const [dice2RotationPath, setDice2RotationPath] = useState<THREE.Euler[]>([])
  const [collisionCounts, setCollisionCounts] = useState({ dice1: 0, dice2: 0 })
  
  const handleDice1Settle = useCallback((value: number, position: [number, number, number], rotationPath: THREE.Euler[]) => {
    setDice1Value(value)
    setDice1Position(position)
    setDice1RotationPath(rotationPath)
  }, [])
  
  const handleDice2Settle = useCallback((value: number, position: [number, number, number], rotationPath: THREE.Euler[]) => {
    setDice2Value(value)
    setDice2Position(position)
    setDice2RotationPath(rotationPath)
  }, [])
  
  const handleDice1Collision = useCallback((intensity: number, position: THREE.Vector3) => {
    setCollisionCounts(prev => ({ ...prev, dice1: prev.dice1 + 1 }))
    onCollision?.(intensity, position)
  }, [onCollision])
  
  const handleDice2Collision = useCallback((intensity: number, position: THREE.Vector3) => {
    setCollisionCounts(prev => ({ ...prev, dice2: prev.dice2 + 1 }))
    onCollision?.(intensity, position)
  }, [onCollision])
  
  useEffect(() => {
    if (dice1Value !== null && dice2Value !== null) {
      onBothDiceSettled(
        dice1Value, 
        dice2Value,
        [dice1Position, dice2Position],
        [dice1RotationPath, dice2RotationPath],
        collisionCounts
      )
      
      // Reset after delay
      setTimeout(() => {
        setDice1Value(null)
        setDice2Value(null)
        setCollisionCounts({ dice1: 0, dice2: 0 })
      }, 4000)
    }
  }, [dice1Value, dice2Value, dice1Position, dice2Position, dice1RotationPath, dice2RotationPath, collisionCounts, onBothDiceSettled])
  
  const dicePositions = useMemo(() => [dice1Position, dice2Position], [dice1Position, dice2Position])
  const isRolling = dice1Value === null || dice2Value === null
  
  return (
    <>
      <EnhancedSceneLighting theme={theme} dicePositions={dicePositions} isRolling={isRolling} />
      <EnhancedDiceTable theme={theme} tableStyle={tableStyle} onCollision={onCollision} />
      <EnhancedDiceModel
        position={[-1.5, 2, 0]}
        theme={theme}
        diceStyle={diceStyle}
        onSettle={handleDice1Settle}
        onCollision={handleDice1Collision}
        rollTrigger={rollTrigger}
        audioSystem={audioSystem}
      />
      <EnhancedDiceModel
        position={[1.5, 2, 0]}
        theme={theme}
        diceStyle={diceStyle}
        onSettle={handleDice2Settle}
        onCollision={handleDice2Collision}
        rollTrigger={rollTrigger}
        audioSystem={audioSystem}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={6}
        maxDistance={25}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
      <ContactShadows
        position={[0, -1.99, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4}
      />
    </>
  )
}

// Audio system implementation
const createAudioSystem = (enabled: boolean): AudioSystem => {
  let volume = 0.7
  let muted = false
  
  const playSound = (url: string, volumeMultiplier = 1, position?: THREE.Vector3) => {
    if (!enabled || muted) return
    
    // This would integrate with Howler.js in a real implementation
    // For now, we'll use a simple audio implementation
    try {
      const audio = new Audio(url)
      audio.volume = volume * volumeMultiplier
      audio.play().catch(() => {}) // Ignore autoplay restrictions
    } catch (error) {
      // Silently handle audio errors
    }
  }
  
  return {
    playRollSound: (force: number) => {
      const volumeMultiplier = Math.min(force / 20, 1)
      playSound('/audio/dice-roll.mp3', volumeMultiplier)
    },
    playCollisionSound: (intensity: number, position: THREE.Vector3) => {
      const volumeMultiplier = Math.min(intensity / 10, 1)
      playSound('/audio/dice-collision.mp3', volumeMultiplier)
    },
    playSettleSound: (material: string) => {
      playSound(`/audio/dice-settle-${material}.mp3`, 0.5)
    },
    playOutcomeSound: (outcome: 'success' | 'partial' | 'failure') => {
      playSound(`/audio/outcome-${outcome}.mp3`, 0.8)
    },
    setVolume: (newVolume: number) => {
      volume = Math.max(0, Math.min(1, newVolume))
    },
    mute: () => {
      muted = true
    },
    unmute: () => {
      muted = false
    }
  }
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

// Main enhanced component
export const EnhancedDice3D: React.FC<EnhancedDice3DProps> = ({
  modifier = 0,
  disabled = false,
  enablePhysics = true,
  enableShadows = true,
  enableAudio = true,
  theme = 'fantasy',
  diceStyle = 'ivory',
  tableStyle = 'felt',
  onRoll,
  onRollStart,
  onRollComplete,
  onCollision
}) => {
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<EnhancedDice3DResult | null>(null)
  const [rollTrigger, setRollTrigger] = useState(0)
  const [showParticles, setShowParticles] = useState(false)
  const [rollStartTime, setRollStartTime] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(enableAudio)
  const [showSettings, setShowSettings] = useState(false)
  
  const audioSystem = useMemo(() => createAudioSystem(audioEnabled), [audioEnabled])
  
  const handleRoll = useCallback(() => {
    if (isRolling || disabled) return
    
    setIsRolling(true)
    setResult(null)
    setShowParticles(false)
    setRollStartTime(Date.now())
    setRollTrigger(prev => prev + 1)
    onRollStart?.()
  }, [isRolling, disabled, onRollStart])
  
  const handleBothDiceSettled = useCallback((
    dice1: number, 
    dice2: number,
    positions: [[number, number, number], [number, number, number]],
    rotationPaths: [THREE.Euler[], THREE.Euler[]],
    collisionData: { dice1: number, dice2: number }
  ) => {
    if (!isRolling) return
    
    const rollDuration = (Date.now() - rollStartTime) / 1000
    const total = dice1 + dice2
    const finalResult = total + modifier
    const outcome = getOutcome(finalResult)
    
    const enhancedResult: EnhancedDice3DResult = {
      dice1,
      dice2,
      total,
      modifier,
      finalResult,
      outcome,
      rollDuration,
      timestamp: Date.now(),
      rollForce: rollTrigger,
      settlePosition: positions[0], // Use first dice position as reference
      rotationPath: rotationPaths[0],
      collisionCount: collisionData.dice1 + collisionData.dice2
    }
    
    setResult(enhancedResult)
    setIsRolling(false)
    setShowParticles(true)
    
    // Play outcome sound
    audioSystem.playOutcomeSound(outcome)
    
    // Hide particles after animation
    setTimeout(() => setShowParticles(false), 3000)
    
    onRoll?.(enhancedResult)
    onRollComplete?.(enhancedResult)
  }, [isRolling, modifier, rollStartTime, rollTrigger, audioSystem, onRoll, onRollComplete])
  
  return (
    <Card variant="magical" padding="lg" className="relative overflow-hidden">
      <MagicalParticles 
        trigger={showParticles} 
        color={result?.outcome === 'success' ? '#22c55e' : result?.outcome === 'partial' ? '#d4af37' : '#ef4444'}
        count={result?.outcome === 'success' ? 40 : 25}
      />
      
      <CardContent className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Box className="w-6 h-6 text-(--color-primary)" />
            <h3 className="text-xl font-display text-(--parchment-900) font-bold">Enhanced 3D Dice</h3>
            {modifier !== 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {modifier > 0 ? <Plus size={12} /> : <Minus size={12} />}
                {Math.abs(modifier)}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {diceStyle} • {tableStyle}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2"
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2"
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-(--parchment-100) rounded-lg p-4 space-y-3"
            >
              <div className="text-sm font-medium text-(--parchment-800)">Dice Customization</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-(--parchment-600)">Dice Style</label>
                  <div className="text-sm text-(--parchment-800)">{diceStyle}</div>
                </div>
                <div>
                  <label className="text-xs text-(--parchment-600)">Table Style</label>
                  <div className="text-sm text-(--parchment-800)">{tableStyle}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Enhanced 3D Canvas */}
        <div className="relative h-96 w-full dice-canvas scene-container rounded-lg overflow-hidden">
          <Canvas
            shadows={enableShadows}
            camera={{ position: [0, 10, 15], fov: 45 }}
            gl={{ 
              antialias: true, 
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true
            }}
          >
            <color attach="background" args={[theme === 'sci-fi' ? '#000000' : theme === 'dark' ? '#1a1a1a' : '#fdfcf8']} />
            {enablePhysics ? (
              <Physics gravity={[0, -9.81, 0]} debug={false}>
                <Enhanced3DScene
                  theme={theme}
                  diceStyle={diceStyle}
                  tableStyle={tableStyle}
                  rollTrigger={rollTrigger}
                  audioSystem={audioSystem}
                  onBothDiceSettled={handleBothDiceSettled}
                  onCollision={onCollision}
                />
              </Physics>
            ) : (
              <Enhanced3DScene
                theme={theme}
                diceStyle={diceStyle}
                tableStyle={tableStyle}
                rollTrigger={rollTrigger}
                audioSystem={audioSystem}
                onBothDiceSettled={handleBothDiceSettled}
                onCollision={onCollision}
              />
            )}
          </Canvas>
          
          {/* Enhanced Result Overlay */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
              >
                <div className="text-center space-y-2">
                  <div className="text-sm text-(--parchment-700) font-mono">
                    {result.dice1} + {result.dice2} {modifier !== 0 ? `+ ${modifier}` : ''} = 
                  </div>
                  <div className={`text-3xl font-bold font-display ${getOutcomeColor(result.outcome)}`}>
                    {result.finalResult}
                  </div>
                  <div className={`text-sm font-medium ${getOutcomeColor(result.outcome)}`}>
                    {getOutcomeText(result.outcome)}
                  </div>
                  <div className="text-xs text-(--parchment-600) space-y-1">
                    <div>Duration: {result.rollDuration.toFixed(1)}s</div>
                    <div>Collisions: {result.collisionCount}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Enhanced Loading Indicator */}
          {isRolling && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-12 h-12 border-3 border-(--color-primary) border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>
        
        {/* Enhanced Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <View className="w-4 h-4 text-(--parchment-600)" />
              <span className="text-xs text-(--parchment-600)">
                Drag to orbit • Scroll to zoom
              </span>
            </div>
            {audioEnabled && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-(--parchment-600)" />
                <span className="text-xs text-(--parchment-600)">
                  3D Audio Enabled
                </span>
              </div>
            )}
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
              className="relative overflow-hidden min-w-[140px]"
            >
              <motion.div
                className="flex items-center gap-2"
                animate={isRolling ? { 
                  x: [0, 2, -2, 0],
                  rotate: [0, 5, -5, 0]
                } : { x: 0, rotate: 0 }}
                transition={{ 
                  duration: 0.4, 
                  repeat: isRolling ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <Sparkles size={20} />
                {isRolling ? 'Rolling...' : 'Roll Enhanced Dice'}
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}