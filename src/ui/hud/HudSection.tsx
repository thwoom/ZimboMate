import React, { ReactNode } from 'react'
import { Animator } from '@arwes/react'

interface HudSectionProps {
  children: ReactNode
  staggerChildren?: boolean
  className?: string
  duration?: { enter?: number; exit?: number }
}

export const HudSection: React.FC<HudSectionProps> = ({
  children,
  staggerChildren = false,
  className = '',
  duration = { enter: 300, exit: 200 }
}) => {
  if (staggerChildren) {
    const childrenArray = React.Children.toArray(children)
    
    return (
      <div className={className}>
        {childrenArray.map((child, index) => (
          <Animator
            key={index}
            duration={duration}
            easing="linear"
            manager="stagger"
            combine
            delay={index * 90}
          >
            {child}
          </Animator>
        ))}
      </div>
    )
  }

  return (
    <Animator
      duration={duration}
      easing="linear"
      className={className}
    >
      {children}
    </Animator>
  )
}
