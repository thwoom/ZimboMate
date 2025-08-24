import React from 'react'
import { Animator, useAnimator } from '@arwes/react-animator'
import type { AnimatorProps } from '@arwes/react-animator'
import { Animated } from '@arwes/react-animated'
import { Text } from '@arwes/react-text'
import type { TextProps } from '@arwes/react-text'


interface HudTextV2Props {
  children: string
  className?: string
  as?: TextProps['as']
  style?: React.CSSProperties
  animator?: Partial<AnimatorProps>
  effect?: 'typewriter' | 'decipher' | 'fade' | 'glitch' | 'slide' | 'none'
  fixed?: boolean
  speed?: 'slow' | 'normal' | 'fast'
}

const HudTextV2: React.FC<HudTextV2Props> = ({
  children,
  className = '',
  as = 'p',
  style = {},
  animator,
  effect = 'typewriter',
  fixed = false,
  speed = 'normal'
}) => {
  // Auto-detect if we should use div instead of p for block-level content
  const shouldUseDiv = React.useMemo(() => {
    if (as !== 'p') return false;
    
    // Check if children contain block-level elements
    const hasBlockElements = React.Children.toArray(children).some(child => {
      if (React.isValidElement(child)) {
        const tagName = child.type;
        if (typeof tagName === 'string') {
          return ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'aside', 'header', 'footer', 'nav'].includes(tagName.toLowerCase());
        }
      }
      return false;
    });
    
    return hasBlockElements;
  }, [children, as]);

  const effectiveAs = shouldUseDiv ? 'div' : as;
  // Calculate duration based on text length and speed
  const getDuration = () => {
    const baseSpeed = {
      slow: 30,
      normal: 20,
      fast: 10
    }
    const charSpeed = baseSpeed[speed]
    return Math.min(Math.max(children.length * charSpeed, 200), 1000)
  }

  const duration = getDuration()

  // Get text manager based on effect
  const getTextManager = () => {
    switch (effect) {
      case 'decipher':
        return 'decipher'
      case 'typewriter':
      default:
        return 'typewriter'
    }
  }

  // Render text with effects
  const renderText = () => {
    if (effect === 'none') {
      return (
        <span className={className} style={style}>
          {children}
        </span>
      )
    }

    if (effect === 'fade' || effect === 'slide' || effect === 'glitch') {
      // Use Animated component for custom transitions
      return (
        <Animated
          animated={{
            initialStyle: getInitialStyle(effect),
            transitions: {
              entering: { 
                [getTransitionProperty(effect)]: getTargetValue(effect),
                duration: duration / 1000 
              },
              exiting: { 
                [getTransitionProperty(effect)]: getInitialValue(effect),
                duration: (duration / 1000) * 0.5 
              }
            }
          }}
        >
          <span className={className} style={style}>
            {children}
          </span>
        </Animated>
      )
    }

    // Use Text component for typewriter/decipher effects
    return (
      <Text
        as={effectiveAs}
        className={className}
        style={style}
        manager={getTextManager()}
        fixed={fixed}
      >
        {children}
      </Text>
    )
  }

  // Helper functions for animated effects
  const getInitialStyle = (effect: string): React.CSSProperties => {
    switch (effect) {
      case 'fade':
        return { opacity: 0 }
      case 'slide':
        return { opacity: 0, transform: 'translateY(20px)' }
      case 'glitch':
        return { opacity: 0, filter: 'blur(4px)' }
      default:
        return {}
    }
  }

  const getTransitionProperty = (effect: string): string => {
    switch (effect) {
      case 'fade':
        return 'opacity'
      case 'slide':
        return 'transform'
      case 'glitch':
        return 'filter'
      default:
        return 'opacity'
    }
  }

  const getInitialValue = (effect: string): any => {
    switch (effect) {
      case 'fade':
        return 0
      case 'slide':
        return 'translateY(20px)'
      case 'glitch':
        return 'blur(4px)'
      default:
        return 0
    }
  }

  const getTargetValue = (effect: string): any => {
    switch (effect) {
      case 'fade':
        return 1
      case 'slide':
        return 'translateY(0)'
      case 'glitch':
        return 'blur(0px)'
      default:
        return 1
    }
  }

  // Wrap with animator if needed
  if (animator || effect !== 'none') {
    return (
      <Animator duration={{ enter: duration, exit: duration * 0.5 }} {...animator}>
        {renderText()}
      </Animator>
    )
  }

  return renderText()
}

// Specialized text components
const GlowText: React.FC<Omit<HudTextV2Props, 'style'> & { color?: string }> = ({ 
  color = '#54DAD0',
  style = {},
  ...props 
}) => (
  <HudTextV2
    {...props}
    style={{
      ...style,
      color,
      textShadow: `0 0 10px ${color}, 0 0 20px ${color}80`,
      filter: `drop-shadow(0 0 4px ${color}50)`
    }}
  />
)

const HeroText: React.FC<Omit<HudTextV2Props, 'as' | 'effect'>> = ({ 
  className = '', 
  ...props 
}) => (
  <HudTextV2
    {...props}
    as="h1"
    effect="decipher"
    className={`text-4xl font-bold text-[#54DAD0] tracking-wider uppercase ${className}`}
    style={{
      textShadow: '0 0 20px rgba(84, 218, 208, 0.5)',
      filter: 'drop-shadow(0 0 8px rgba(84, 218, 208, 0.3))'
    }}
  />
)

const CodeText: React.FC<Omit<HudTextV2Props, 'as'>> = ({ 
  className = '', 
  ...props 
}) => (
  <HudTextV2
    {...props}
    as="code"
    className={`font-mono text-sm text-[#8ff6ff] bg-[#001215] px-2 py-1 rounded ${className}`}
    effect="typewriter"
    speed="fast"
  />
)

const AlertText: React.FC<Omit<HudTextV2Props, 'effect'>> = ({ 
  className = '', 
  ...props 
}) => {
  const [glitching, setGlitching] = React.useState(true)
  
  React.useEffect(() => {
    const timer = setTimeout(() => setGlitching(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <HudTextV2
      {...props}
      effect={glitching ? 'glitch' : 'fade'}
      className={`text-red-500 font-semibold ${className}`}
      style={{
        textShadow: '0 0 10px rgba(244, 67, 54, 0.5)',
        animation: glitching ? 'glitch 0.3s infinite' : undefined
      }}
    />
  )
}

// Animated counter component
const CounterText: React.FC<{
  from?: number
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}> = ({ 
  from = 0, 
  to, 
  duration = 1000, 
  prefix = '', 
  suffix = '', 
  className = '' 
}) => {
  const [count, setCount] = React.useState(from)
  const animator = useAnimator()

  React.useEffect(() => {
    if (animator?.animate) {
      const startTime = Date.now()
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const current = Math.floor(from + (to - from) * progress)
        setCount(current)
        
        if (progress >= 1) {
          clearInterval(timer)
        }
      }, 16)
      
      return () => clearInterval(timer)
    }
  }, [animator?.animate, from, to, duration])

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// Export compound component
HudTextV2.Glow = GlowText
HudTextV2.Hero = HeroText
HudTextV2.Code = CodeText
HudTextV2.Alert = AlertText
HudTextV2.Counter = CounterText

export { HudTextV2 }

// Add glitch keyframes to your CSS
const glitchKeyframes = `
@keyframes glitch {
  0% {
    text-shadow: 
      0.05em 0 0 rgba(255, 0, 0, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
      0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  14% {
    text-shadow: 
      0.05em 0 0 rgba(255, 0, 0, 0.75),
      -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
      0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
  }
  15% {
    text-shadow: 
      -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
      -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  49% {
    text-shadow: 
      -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
      0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
      -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  50% {
    text-shadow: 
      0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
      0.05em 0 0 rgba(0, 255, 0, 0.75),
      0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  99% {
    text-shadow: 
      0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
      0.05em 0 0 rgba(0, 255, 0, 0.75),
      0 -0.05em 0 rgba(0, 0, 255, 0.75);
  }
  100% {
    text-shadow: 
      -0.025em 0 0 rgba(255, 0, 0, 0.75),
      -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
      -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
  }
}
`
