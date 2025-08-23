import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ArwesThemeProvider, Animator, BleepsProvider } from '@arwes/react'
import { arwesTheme } from './theme'

interface SoundContextType {
  soundEnabled: boolean
  toggleSound: () => void
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: true,
  toggleSound: () => {}
})

export const useSoundToggle = () => useContext(SoundContext)

interface ArwesProvidersProps {
  children: ReactNode
}

export const ArwesProviders: React.FC<ArwesProvidersProps> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const toggleSound = () => {
    setSoundEnabled(prev => !prev)
  }

  const bleepsSettings = {
    categories: {
      click: { volume: 0.3 },
      hover: { volume: 0.2 },
      transition: { volume: 0.25 },
      notify: { volume: 0.2 },
      typing: { volume: 0.15 }
    },
    disabled: !soundEnabled
  }

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound }}>
      <ArwesThemeProvider theme={arwesTheme}>
        <BleepsProvider settings={bleepsSettings}>
          <Animator 
            duration={{ enter: 300, exit: 200 }}
            easing="linear"
          >
            {children}
          </Animator>
        </BleepsProvider>
      </ArwesThemeProvider>
    </SoundContext.Provider>
  )
}
