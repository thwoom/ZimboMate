import React from 'react'
import App from './App.Complete'
import { ModeSelector } from '@/components/ui/ModeSelector'
import { useAppModeStore } from '@/stores/appModeStore'

const AppRoot: React.FC = () => {
  const isFirstRun = useAppModeStore((s) => s.isFirstRun)

  if (isFirstRun) {
    return <ModeSelector />
  }

  return <App />
}

export default AppRoot

