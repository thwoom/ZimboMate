import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeTestPage } from './components/ThemeTestPage'
import HudDemo from './routes/hud-demo'
import { MotionV12Demo } from './components/examples/MotionV12Demo'
import { HudSmoke } from './components/examples/HudSmoke'
import ArwesDemo from './routes/arwes-demo'
import ArwesTest from './routes/arwes-test'
import HudDemoPage from './pages/HudDemoPage'
import VantaDemo from './routes/vanta-demo'

// Dev sanity check: ensure Motion compat plugin is active
import './shim-assert'

function App() {
  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <Router>
        <div>
          {/* Simple navigation */}
          <nav className="p-4 border-b border-[#54DAD0] border-opacity-30">
            <div className="flex gap-6">
              <Link
                to="/"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                Theme Test
              </Link>
              <Link
                to="/hud-demo"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                HUD Demo
              </Link>
              <Link
                to="/motion-demo"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                Motion v12 Demo
              </Link>
              <Link
                to="/hud-smoke"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                HUD Smoke Test
              </Link>
              <Link
                to="/arwes-demo"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                Arwes Demo
              </Link>
              <Link
                to="/arwes-test"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                Arwes Test
              </Link>
              <Link
                to="/hud-floating"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                HUD Floating Demo
              </Link>
              <Link
                to="/vanta-demo"
                className="text-[#54DAD0] hover:text-white transition-colors duration-200 font-medium"
              >
                Vanta.js Demo
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<ThemeTestPage />} />
            <Route path="/hud-demo" element={<HudDemo />} />
            <Route path="/motion-demo" element={<MotionV12Demo />} />
            <Route path="/hud-smoke" element={<HudSmoke />} />
            <Route path="/arwes-demo" element={<ArwesDemo />} />
            <Route path="/arwes-test" element={<ArwesTest />} />
            <Route path="/hud-floating" element={<HudDemoPage />} />
            <Route path="/vanta-demo" element={<VantaDemo />} />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
