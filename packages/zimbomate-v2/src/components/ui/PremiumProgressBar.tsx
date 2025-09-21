import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Brain,
  Sparkles,
  Zap,
  Clock,
  HardDrive
} from 'lucide-react'
import { Card, CardContent, Button, Badge } from './'

interface PremiumProgressBarProps {
  progress: number // 0-100
  text: string
  stage: 'downloading' | 'loading' | 'ready' | 'error'
  timeRemaining?: string
  showDetails?: boolean
  modelSize?: string // e.g., "4.0GB", "~4GB"
  downloadSpeed?: string // e.g., "2.5 MB/s"
  onRetry?: () => void
  className?: string
}

interface FloatingParticle {
  id: string
  x: number
  y: number
  delay: number
  size: number
  color: string
}

export const PremiumProgressBar: React.FC<PremiumProgressBarProps> = ({
  progress,
  text,
  stage,
  timeRemaining,
  showDetails = true,
  modelSize,
  downloadSpeed,
  onRetry,
  className = ''
}) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([])

  // Generate floating particles for magical effect
  useEffect(() => {
    if (stage === 'loading' || stage === 'downloading') {
      const newParticles: FloatingParticle[] = []
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: Math.random() * 300,
          y: Math.random() * 100,
          delay: Math.random() * 2,
          size: Math.random() * 4 + 2,
          color: stage === 'downloading' ? '#3b82f6' : '#8b5cf6'
        })
      }
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [stage])

  const getStageIcon = () => {
    switch (stage) {
      case 'downloading':
        return <Download className="w-5 h-5 text-blue-600 animate-bounce" />
      case 'loading':
        return <Brain className="w-5 h-5 text-purple-600 animate-pulse" />
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
    }
  }

  const getStageColor = () => {
    switch (stage) {
      case 'downloading': return 'from-blue-500 to-cyan-600'
      case 'loading': return 'from-purple-500 to-pink-600'
      case 'ready': return 'from-green-500 to-emerald-600'
      case 'error': return 'from-red-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getBadgeVariant = () => {
    switch (stage) {
      case 'downloading': return 'default'
      case 'loading': return 'secondary'
      case 'ready': return 'default'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  const getStageText = () => {
    switch (stage) {
      case 'downloading': return '📥 Downloading'
      case 'loading': return '🧠 Loading AI'
      case 'ready': return '✅ Ready'
      case 'error': return '❌ Error'
      default: return '⏳ Processing'
    }
  }

  return (
    <Card
      variant="magical"
      className={`relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 border border-white/20 shadow-2xl ${className}`}
    >
      <CardContent className="p-6">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [particle.x, particle.x + Math.sin(Date.now() * 0.001) * 20],
                  y: [particle.y, particle.y - 50],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut"
                }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  left: particle.x,
                  top: particle.y,
                  filter: 'blur(0.5px)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {getStageIcon()}
              {(stage === 'loading' || stage === 'downloading') && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: `radial-gradient(circle, ${stage === 'downloading' ? '#3b82f6' : '#8b5cf6'}40, transparent 70%)`,
                  }}
                />
              )}
            </div>

            <div>
              <h3 className="text-lg font-display font-semibold">AI Model {stage === 'downloading' ? 'Download' : 'Loading'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stage === 'downloading' && modelSize ? `Natural Functions 7B (${modelSize})` : 'Preparing your intelligent companion'}
              </p>
            </div>
          </div>

          <Badge variant={getBadgeVariant()} className="text-xs font-medium">
            {getStageText()}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[280px]">
              {text}
            </span>
            {progress > 0 && stage !== 'error' && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent from-blue-600 to-purple-600">
                  {Math.round(progress)}%
                </span>
                {timeRemaining && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{timeRemaining}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Progress Bar */}
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            {stage === 'error' ? (
              // Error state with pulsing red background
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-full opacity-60"
                animate={{ opacity: [0.6, 0.3, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ) : progress > 0 ? (
              // Actual progress
              <>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 2)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getStageColor()} rounded-full shadow-lg`}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Highlight effect */}
                  <div className="absolute inset-0 bg-white/20 rounded-full" />
                </motion.div>

                {/* Glow effect */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 2)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getStageColor()} rounded-full blur-sm opacity-50`}
                />
              </>
            ) : (
              // Indeterminate progress
              <>
                <div className={`absolute inset-0 bg-gradient-to-r ${getStageColor()} rounded-full opacity-60`} />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            )}
          </div>

          {/* Enhanced Details */}
          {showDetails && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {(downloadSpeed || modelSize) && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {downloadSpeed && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>{downloadSpeed}</span>
                      </div>
                    )}
                    {modelSize && (
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        <span>{modelSize}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Error Actions */}
                {stage === 'error' && onRetry && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Failed to load AI model. Please check your connection.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="ml-2 gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </Button>
                  </motion.div>
                )}

                {/* Success Message */}
                {stage === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 pt-2 text-green-600 dark:text-green-400"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI companion is ready to enhance your story!</span>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none rounded-lg" />

        {/* Magical Border Glow */}
        {(stage === 'loading' || stage === 'downloading') && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-transparent"
            animate={{
              background: [
                'linear-gradient(45deg, transparent, transparent)',
                'linear-gradient(45deg, #3b82f620, #8b5cf620, #3b82f620)',
                'linear-gradient(45deg, transparent, transparent)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default PremiumProgressBar