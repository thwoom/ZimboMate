/**
 * SpellBookPage Component for ZimboMate V2
 * Individual page component with realistic page-turning animations
 */

import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

interface SpellBookPageProps {
  children: React.ReactNode
  isVisible: boolean
  isAnimating: boolean
  animationDirection?: 'left' | 'right'
  className?: string
}

export function SpellBookPage({
  children,
  isVisible,
  isAnimating,
  animationDirection = 'right',
  className = '',
}: SpellBookPageProps) {
  const pageVariants = {
    hidden: {
      rotateY: animationDirection === 'right' ? -180 : 180,
      opacity: 0,
      scale: 0.8,
      transformOrigin:
        animationDirection === 'right' ? 'left center' : 'right center',
    },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transformOrigin:
        animationDirection === 'right' ? 'left center' : 'right center',
    },
    exit: {
      rotateY: animationDirection === 'right' ? 180 : -180,
      opacity: 0,
      scale: 0.8,
      transformOrigin:
        animationDirection === 'right' ? 'left center' : 'right center',
    },
  }

  const pageTransition = {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    mass: 1,
    duration: 0.8,
  }

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          className={`
            spell-book-page
            w-full h-full
            relative
            ${isAnimating ? 'spell-book-page-turning' : ''}
            ${className}
          `}
          variants={pageVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          transition={pageTransition}
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Page content */}
          <div className='w-full h-full relative z-10'>{children}</div>

          {/* Page shadow effect */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-black/10 pointer-events-none'
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Page curl effect */}
          <motion.div
            className='absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-parchment-200 to-parchment-300 transform rotate-45 translate-x-4 -translate-y-4 pointer-events-none'
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isAnimating ? 0.6 : 0,
              scale: isAnimating ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
