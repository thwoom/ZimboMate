import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.Complete'
import './index.css'

const RootApp: React.FC = () => {
  React.useEffect(() => {
    const splash = document.getElementById('app-splash')
    if (splash) {
      splash.classList.add('app-splash--hidden')
      const timeout = window.setTimeout(() => splash.remove(), 600)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
)
