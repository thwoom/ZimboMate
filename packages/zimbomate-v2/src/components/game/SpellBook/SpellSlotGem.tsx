/**
 * SpellSlotGem Component for ZimboMate V2
 * Gem-like indicator for spell slot status with magical animations
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Gem } from 'lucide-react'
import { Badge } from '../../ui'

interface SpellSlotGemProps {
  level: number
  status: 'available' | 'used' | 'prepared'
  onClick?: () => void
  className?: string
}

export function SpellSlotGem({ level, status, onClick, className = '' }: SpellSlotGemProps) {
  const getGemColor = () => {
    switch (status) {
      case 'available':
        return 'text-green-500'
      case 'prepared':
        return 'text-blue-500'
      case 'used':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const getGemBg = () => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20'
      case 'prepared':
        return 'bg-blue-500/20'
      case 'used':
        return 'bg-gray-400/20'
      default:
        return 'bg-gray-400/20'
    }
  }

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`
        w-8 h-8 rounded-full border-2 border-gold-500 
        ${getGemBg()} 
        flex items-center justify-center
        relative overflow-hidden
        cursor-pointer
        spell-slot-gem
      `}>
        <Gem size={16} className={getGemColor()} />
        
        {/* Gem shine effect */}
        {status === 'available' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%', rotate: 45 }}
            animate={{ x: '100%', rotate: 45 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear'
            }}
          />
        )}
      </div>
      
      {/* Level badge */}
      <Badge
        variant="secondary"
        className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs flex items-center justify-center"
      >
        {level}
      </Badge>
    </motion.div>
  )
}