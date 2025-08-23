import React from 'react'
import { Animator } from '@arwes/react-animator'
import { Text } from '@arwes/react-text'

interface HudTextProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  style?: React.CSSProperties
}

const HudText: React.FC<HudTextProps> = ({
  children,
  className = '',
  as = 'p',
  style = {}
}) => {
  // Calculate duration based on text length (minimum 200ms, max 800ms)
  const duration = Math.min(Math.max(children.length * 20, 200), 800)

  return (
    <Animator duration={{ enter: duration, exit: 150 }}>
      <Text
        as={as}
        className={className}
        style={style}
      >
        {children}
      </Text>
    </Animator>
  )
}

// Simple versions for the test route
export function HudHeading({ children }: { children: React.ReactNode }) {
  return (
    <Animator duration={{ enter: 0.6 }}>
      <h1 style={{
        color: '#54DAD0',
        fontSize: '2rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textShadow: '0 0 10px rgba(84, 218, 208, 0.5)'
      }}>
        {children}
      </h1>
    </Animator>
  );
}

export function HudBody({ children }: { children: React.ReactNode }) {
  return (
    <Animator>
      <p style={{
        color: '#e1f5f7',
        lineHeight: '1.6'
      }}>
        {children}
      </p>
    </Animator>
  );
}

// Predefined heading components
const Heading: React.FC<Omit<HudTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  level = 1,
  className = '',
  ...props
}) => {
  const headingClasses = {
    1: 'text-4xl font-bold text-[#54DAD0] tracking-wider uppercase',
    2: 'text-3xl font-bold text-[#54DAD0] tracking-wide uppercase',
    3: 'text-2xl font-semibold text-[#54DAD0] tracking-wide uppercase',
    4: 'text-xl font-semibold text-[#54DAD0] tracking-wider',
    5: 'text-lg font-medium text-[#54DAD0] tracking-wider',
    6: 'text-base font-medium text-[#54DAD0] tracking-wider'
  }

  return (
    <HudText
      {...props}
      as={`h${level}` as any}
      className={`${headingClasses[level]} ${className}`}
      style={{
        textShadow: '0 0 10px rgba(84, 218, 208, 0.5)',
        filter: 'drop-shadow(0 0 4px rgba(84, 218, 208, 0.3))'
      }}
    />
  )
}

const Label: React.FC<Omit<HudTextProps, 'as'>> = ({ className = '', ...props }) => (
  <HudText
    {...props}
    as="span"
    className={`text-sm font-medium text-gray-300 ${className}`}
  />
)

const Body: React.FC<Omit<HudTextProps, 'as'>> = ({ className = '', ...props }) => (
  <HudText
    {...props}
    as="p"
    className={`text-base text-gray-200 ${className}`}
  />
)

// Export compound component
HudText.Heading = Heading
HudText.Label = Label
HudText.Body = Body

export { HudText }
