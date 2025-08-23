import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ArwesProviders } from './ui/arwes/ArwesProviders'

createRoot(document.getElementById('root')!).render(
  <ArwesProviders>
    <App />
  </ArwesProviders>,
)
