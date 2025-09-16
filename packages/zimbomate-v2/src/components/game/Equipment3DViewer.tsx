/**
 * Equipment3DViewer - Interactive 3D item renderer with rotation and zoom
 * Provides immersive 3D visualization for equipment items
 */

import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { Item } from '../../models/Equipment'
import { Card, CardContent, Button } from '../ui'
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface Equipment3DViewerProps {
  item: Item
  width?: number
  height?: number
  autoRotate?: boolean
  showControls?: boolean
  onInspect?: () => void
  className?: string
}

// 3D Item Model Component
const ItemModel3D: React.FC<{ item: Item; autoRotate: boolean }> = ({ item, autoRotate }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      if (autoRotate) {
        meshRef.current.rotation.y += 0.01
      }
      
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
      
      // Hover effect
      if (hovered) {
        meshRef.current.scale.setScalar(1.1)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  // Generate procedural 3D model based on item type
  const geometry = useMemo(() => {
    switch (item.category) {
      case 'weapon':
        if (item.name.toLowerCase().includes('sword')) {
          return (
            <group ref={meshRef}>
              {/* Blade */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.1, 2, 0.05]} />
                <meshStandardMaterial 
                  color="#c0c0c0" 
                  metalness={0.8} 
                  roughness={0.2} 
                />
              </mesh>
              {/* Guard */}
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.6, 0.1, 0.1]} />
                <meshStandardMaterial 
                  color="#8b4513" 
                  metalness={0.3} 
                  roughness={0.7} 
                />
              </mesh>
              {/* Handle */}
              <mesh position={[0, -0.7, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.6]} />
                <meshStandardMaterial 
                  color="#654321" 
                  metalness={0.1} 
                  roughness={0.8} 
                />
              </mesh>
            </group>
          )
        } else if (item.name.toLowerCase().includes('bow')) {
          return (
            <group ref={meshRef}>
              {/* Bow body */}
              <mesh>
                <torusGeometry args={[0.8, 0.05, 8, 16, Math.PI]} />
                <meshStandardMaterial 
                  color="#8b4513" 
                  metalness={0.1} 
                  roughness={0.8} 
                />
              </mesh>
              {/* String */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1.6]} />
                <meshStandardMaterial 
                  color="#f5f5dc" 
                  metalness={0} 
                  roughness={0.9} 
                />
              </mesh>
            </group>
          )
        }
        break
        
      case 'armor':
        return (
          <group ref={meshRef}>
            {/* Chest piece */}
            <mesh>
              <boxGeometry args={[1.2, 1.5, 0.3]} />
              <meshStandardMaterial 
                color="#696969" 
                metalness={0.7} 
                roughness={0.3} 
              />
            </mesh>
            {/* Shoulder guards */}
            <mesh position={[-0.7, 0.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial 
                color="#696969" 
                metalness={0.7} 
                roughness={0.3} 
              />
            </mesh>
            <mesh position={[0.7, 0.5, 0]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial 
                color="#696969" 
                metalness={0.7} 
                roughness={0.3} 
              />
            </mesh>
          </group>
        )
        
      case 'consumable':
        return (
          <group ref={meshRef}>
            {/* Bottle */}
            <mesh>
              <cylinderGeometry args={[0.2, 0.3, 0.8, 8]} />
              <meshStandardMaterial 
                color="#ff6b6b" 
                transparent 
                opacity={0.8} 
                metalness={0} 
                roughness={0.1} 
              />
            </mesh>
            {/* Cork */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.2]} />
              <meshStandardMaterial 
                color="#8b4513" 
                metalness={0} 
                roughness={0.9} 
              />
            </mesh>
          </group>
        )
        
      default:
        return (
          <group ref={meshRef}>
            {/* Generic item - treasure chest */}
            <mesh>
              <boxGeometry args={[0.8, 0.5, 0.6]} />
              <meshStandardMaterial 
                color="#8b4513" 
                metalness={0.2} 
                roughness={0.8} 
              />
            </mesh>
            {/* Lock */}
            <mesh position={[0, 0, 0.31]}>
              <cylinderGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial 
                color="#ffd700" 
                metalness={0.8} 
                roughness={0.2} 
              />
            </mesh>
          </group>
        )
    }
  }, [item])

  return (
    <group
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {geometry}
    </group>
  )
}

export const Equipment3DViewer: React.FC<Equipment3DViewerProps> = ({
  item,
  width = 300,
  height = 300,
  autoRotate = true,
  showControls = true,
  onInspect,
  className = ''
}) => {
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate)
  const [zoom, setZoom] = useState(1)
  const controlsRef = useRef<any>(null)

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
    setZoom(1)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  return (
    <div className={`relative ${className}`}>
      <Card variant="glass" padding="none" className="overflow-hidden">
        <div 
          className="relative bg-gradient-to-br from-(--parchment-100) to-(--parchment-200)"
          style={{ width, height }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            shadows
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-5, -5, -5]} intensity={0.3} />
            
            <ItemModel3D item={item} autoRotate={isAutoRotating} />
            
            <ContactShadows
              position={[0, -2, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
            
            <Environment preset="studio" />
            
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={8}
              autoRotate={isAutoRotating}
              autoRotateSpeed={2}
            />
          </Canvas>

          {/* Loading overlay */}
          <div className="absolute inset-0 bg-(--parchment-100)/80 flex items-center justify-center opacity-0 transition-opacity duration-300">
            <div className="animate-spin w-8 h-8 border-2 border-(--color-primary) border-t-transparent rounded-full" />
          </div>
        </div>

        {showControls && (
          <CardContent className="p-3 border-t border-(--parchment-300)">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`h-8 w-8 ${isAutoRotating ? 'text-(--color-primary)' : 'text-(--color-text-secondary)'}`}
                >
                  <RotateCcw size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-8 w-8"
                >
                  <ZoomIn size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-8 w-8"
                >
                  <ZoomOut size={16} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8"
                >
                  <RotateCcw size={16} />
                </Button>
              </div>

              {onInspect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onInspect}
                  className="gap-2"
                >
                  <Maximize2 size={14} />
                  Inspect
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Item info overlay */}
      <motion.div
        className="absolute top-2 left-2 right-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <h4 className="text-white text-sm font-medium truncate">
            {item.name}
          </h4>
          <p className="text-white/70 text-xs capitalize">
            {item.category}
          </p>
        </div>
      </motion.div>
    </div>
  )
}