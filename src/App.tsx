import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeTestPage } from './components/ThemeTestPage'
import { HudDemo } from './routes/hud-demo'
import { MotionV12Demo } from './components/examples/MotionV12Demo'
import { HudSmoke } from './components/examples/HudSmoke'

// Dev sanity check: ensure Motion compat plugin is active
if (import.meta.env.DEV) {
  import('motion').then(({ animate, timeline, spring, stagger, glide }) => {
    if (typeof animate !== 'function' || typeof timeline !== 'function' || 
        typeof spring !== 'function' || typeof stagger !== 'function' || 
        typeof glide !== 'function') {
      throw new Error('Motion compat: missing functions. Check Vite plugin wiring.');
    }
    console.log('[Motion Compat] ✅ All functions available:', {
      animate: typeof animate,
      timeline: typeof timeline,
      spring: typeof spring,
      stagger: typeof stagger,
      glide: typeof glide
    });
  });
}

function App() {
  return (
    <div className="min-h-screen bg-[#001215] p-8">
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
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<ThemeTestPage />} />
            <Route path="/hud-demo" element={<HudDemo />} />
            <Route path="/motion-demo" element={<MotionV12Demo />} />
            <Route path="/hud-smoke" element={<HudSmoke />} />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
