import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRoot from './App.Root'
import { BootProvider } from './boot/BootProvider'
import './index.css'

const RootApp: React.FC = () => (
  <BootProvider>
    <AppRoot />
  </BootProvider>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
)
