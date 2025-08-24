import React from 'react'
import { Animator } from '@arwes/react-animator'
import type { AnimatorProps } from '@arwes/react-animator'
import { motion } from '@motionone/react'
import { FrameCorners, FrameLines } from '@arwes/react-frames'

interface HudButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  className?: string
  animator?: Partial<AnimatorProps>
  fullWidth?: boolean
}

export const HudButton: React.FC<HudButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  animator,
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)

  // Get size classes
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  }

  // Get variant colors
  const variantColors = {
    primary: {
      base: '#54DAD0',
      hover: '#8ff6ff',
      bg: 'rgba(84, 218, 208, 0.1)',
      bgHover: 'rgba(84, 218, 208, 0.2)'
    },
    secondary: {
      base: '#3b5564',
      hover: '#5a7a8c',
      bg: 'rgba(59, 85, 100, 0.1)',
      bgHover: 'rgba(59, 85, 100, 0.2)'
    },
    danger: {
      base: '#f44336',
      hover: '#ff6b5e',
      bg: 'rgba(244, 67, 54, 0.1)',
      bgHover: 'rgba(244, 67, 54, 0.2)'
    },
    success: {
      base: '#4caf50',
      hover: '#76d77a',
      bg: 'rgba(76, 175, 80, 0.1)',
      bgHover: 'rgba(76, 175, 80, 0.2)'
    }
  }

  const colors = variantColors[variant]

  // Handle interactions
  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
  }

  const handleMouseDown = () => {
    if (!disabled) {
      setIsPressed(true)
    }
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  const buttonContent = (
    <motion.button
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        font-medium tracking-wider uppercase
        transition-all duration-200
        ${className}
      `}
      style={{
        background: isHovered ? colors.bgHover : colors.bg,
        color: isHovered ? colors.hover : colors.base,
        transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.02)' : 'scale(1)',
        textShadow: `0 0 10px ${isHovered ? colors.hover : colors.base}50`
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
    >
      {/* Frame decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <FrameCorners
          strokeWidth={1}
          style={{
            '--arwes-frames-line-color': isHovered ? colors.hover : colors.base,
            filter: `drop-shadow(0 0 4px ${isHovered ? colors.hover : colors.base}80)`
          } as React.CSSProperties}
        />
      </div>

      {/* Hover glow effect */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: `radial-gradient(circle at center, ${colors.hover}20 0%, transparent 70%)`,
            filter: `blur(10px)`
          }}
        />
      )}

      {/* Button text */}
      <span className="relative z-10">
        {children}
      </span>

      {/* Click ripple effect */}
      {isPressed && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: colors.hover,
            borderRadius: '50%',
            transformOrigin: 'center'
          }}
        />
      )}
    </motion.button>
  )

  // Wrap with animator if provided
  if (animator) {
    return (
      <Animator {...animator}>
        {buttonContent}
      </Animator>
    )
  }

  return buttonContent
}

// Icon button variant
export const HudIconButton: React.FC<Omit<HudButtonProps, 'fullWidth'> & { icon: React.ReactNode }> = ({
  icon,
  size = 'medium',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  return (
    <HudButton
      {...props}
      size={size}
      className={`!p-0 ${sizeClasses[size]} flex items-center justify-center ${className}`}
    >
      {icon}
    </HudButton>
  )
}

// Toggle button variant
export const HudToggleButton: React.FC<HudButtonProps & { 
  active?: boolean
  onToggle?: (active: boolean) => void 
}> = ({
  active = false,
  onToggle,
  variant = 'primary',
  ...props
}) => {
  const handleClick = () => {
    if (onToggle && !props.disabled) {
      onToggle(!active)
    }
    props.onClick?.()
  }

  return (
    <HudButton
      {...props}
      variant={active ? 'success' : variant}
      onClick={handleClick}
      className={`${props.className} ${active ? 'ring-2 ring-offset-2 ring-offset-black' : ''}`}
      style={{
        ...props.style,
        '--tw-ring-color': active ? 'var(--arwes-glow-primary)' : undefined
      } as React.CSSProperties}
    />
  )
}
