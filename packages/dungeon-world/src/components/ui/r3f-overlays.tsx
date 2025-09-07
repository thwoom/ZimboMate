import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'

function useWebGLSupport(): boolean {
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setSupported(!!gl)
    } catch {
      setSupported(false)
    }
  }, [])
  return supported
}

export const R3FHudOverlay: React.FC<{ enabled?: boolean }> = ({ enabled }) => {
  const supported = useWebGLSupport()
  if (!enabled || !supported) return null
  return (
    <div className="r3f-hud-overlay" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Minimal background grid */}
          <gridHelper args={[20, 20, '#4f46e5', '#1e293b']} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export const R3FIntroOverlay: React.FC<{ enabled?: boolean }> = ({ enabled }) => {
  const supported = useWebGLSupport()
  if (!enabled || !supported) return null
  return (
    <div className="r3f-intro-overlay" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export const PanelBackdrop3D: React.FC<{ enabled?: boolean }> = ({ enabled }) => {
  const supported = useWebGLSupport()
  if (!enabled || !supported) return null
  return (
    <div className="r3f-panel-backdrop" aria-hidden>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <gridHelper args={[50, 30, '#64748b', '#0f172a']} />
        </Suspense>
      </Canvas>
    </div>
  )
}
