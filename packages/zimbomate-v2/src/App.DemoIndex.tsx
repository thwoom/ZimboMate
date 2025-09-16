import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Dice6, 
  Sparkles, 
  Settings, 
  Package, 
  Scroll,
  Palette,
  Zap,
  Code,
  Play,
  Gamepad2,
  Layers,
  Wand2
} from 'lucide-react'
import { ThemeProvider } from './components/ui/ThemeProvider'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { DemoCard, type DemoInfo } from './components/ui/DemoCard'
import { DemoNavigation } from './components/ui/DemoNavigation'
import { Card, CardContent, Badge } from './components/ui'

// Demo configurations
const demoConfigs: DemoInfo[] = [
  {
    id: 'enhanced-3d-dice',
    title: 'Enhanced 3D Dice System',
    description: 'Advanced 3D dice rolling with realistic physics, spatial audio, and particle effects. Features multiple dice styles, materials, and theme-based sound libraries.',
    status: 'complete',
    category: 'game',
    features: ['3D Physics', 'Spatial Audio', 'PBR Materials', 'Particle Effects', 'Multi-Theme', 'Statistics'],
    techStack: ['Three.js', 'React Three Fiber', 'Rapier Physics', 'Web Audio API'],
    lastUpdated: 'Today',
    component: 'App.Enhanced3DDice.tsx',
    icon: Dice6
  },
  {
    id: 'complete-app',
    title: 'Complete Application',
    description: 'Full-featured Dungeon World companion with character sheets, dice rolling, moves, and equipment management. Demonstrates complete game integration.',
    status: 'complete',
    category: 'core',
    features: ['Character Sheets', 'Dice Rolling', 'Moves System', 'Equipment', 'Theme System'],
    techStack: ['React 19', 'Framer Motion', 'Radix UI', 'Tailwind v4'],
    lastUpdated: '2 days ago',
    component: 'App.Complete.tsx',
    icon: Gamepad2
  },
  {
    id: 'hooks-demo',
    title: 'Custom Hooks System',
    description: 'Comprehensive demonstration of all 13 custom React hooks. Shows V1→V2 parity achievement through complete hook integration with services and stores.',
    status: 'complete',
    category: 'system',
    features: ['13 Custom Hooks', 'Service Integration', 'State Management', 'Animation System'],
    techStack: ['React Hooks', 'Zustand', 'TypeScript', 'Service Layer'],
    lastUpdated: '3 days ago',
    component: 'App.HooksDemo.tsx',
    icon: Code
  },
  {
    id: 'character-sheet',
    title: 'Character Sheet',
    description: 'Interactive character sheet with stats, health tracking, and quick actions. Features smooth animations and responsive design.',
    status: 'complete',
    category: 'game',
    features: ['Character Stats', 'Health Tracking', 'Quick Actions', 'Animations'],
    techStack: ['React', 'Framer Motion', 'Tailwind'],
    lastUpdated: '1 week ago',
    component: 'App.CharacterSheet.tsx',
    icon: User
  },
  {
    id: 'equipment-system',
    title: 'Equipment System',
    description: 'Advanced equipment management with drag-and-drop inventory, load tracking, and item categorization. Supports equipment sets and magical items.',
    status: 'complete',
    category: 'game',
    features: ['Drag & Drop', 'Load Tracking', 'Item Categories', 'Equipment Sets'],
    techStack: ['React DnD', 'Framer Motion', 'Tailwind'],
    lastUpdated: '1 week ago',
    component: 'App.EquipmentSystem.tsx',
    icon: Package
  },
  {
    id: 'dice-3d',
    title: '3D Dice Rolling',
    description: 'Original 3D dice implementation with Three.js physics and Dungeon World mechanics. Foundation for the enhanced dice system.',
    status: 'complete',
    category: 'game',
    features: ['3D Rendering', 'Physics', 'DW Mechanics', 'Particle Effects'],
    techStack: ['Three.js', 'React Three Fiber', 'Rapier'],
    lastUpdated: '1 week ago',
    component: 'App.Dice3D.tsx',
    icon: Dice6
  },
  {
    id: 'theme-system',
    title: 'Theme System',
    description: 'Multi-theme system with Fantasy, Sci-Fi, Dark, and Light themes. Demonstrates CSS custom properties and theme switching.',
    status: 'complete',
    category: 'ui',
    features: ['Multi-Theme', 'CSS Variables', 'Theme Switching', 'Dark Mode'],
    techStack: ['CSS Custom Properties', 'Tailwind v4', 'React Context'],
    lastUpdated: '1 week ago',
    component: 'App.ThemeSystem.tsx',
    icon: Palette
  },
  {
    id: 'theme-test',
    title: 'Theme Testing',
    description: 'Theme testing interface for validating color schemes, typography, and component styling across different themes.',
    status: 'complete',
    category: 'ui',
    features: ['Theme Validation', 'Color Testing', 'Typography', 'Component Preview'],
    techStack: ['React', 'Tailwind', 'CSS Variables'],
    lastUpdated: '1 week ago',
    component: 'App.ThemeTest.tsx',
    icon: Settings
  },
  {
    id: 'character-demo',
    title: 'Character Demo',
    description: 'Character creation and management demonstration with form validation and character progression.',
    status: 'complete',
    category: 'game',
    features: ['Character Creation', 'Form Validation', 'Progression', 'Stats Management'],
    techStack: ['React Hook Form', 'Zod Validation', 'Framer Motion'],
    lastUpdated: '1 week ago',
    component: 'App.CharacterDemo.tsx',
    icon: User
  },
  {
    id: 'character-styled-demo',
    title: 'Styled Character Demo',
    description: 'Enhanced character demo with advanced styling, animations, and visual effects.',
    status: 'complete',
    category: 'ui',
    features: ['Advanced Styling', 'Visual Effects', 'Animations', 'Responsive Design'],
    techStack: ['Styled Components', 'Framer Motion', 'CSS Grid'],
    lastUpdated: '1 week ago',
    component: 'App.CharacterStyledDemo.tsx',
    icon: Wand2
  },
  {
    id: 'animation-fix',
    title: 'Animation System',
    description: 'Animation system testing and demonstration with various motion effects and performance optimizations.',
    status: 'complete',
    category: 'ui',
    features: ['Motion Effects', 'Performance', 'Particle System', 'Transitions'],
    techStack: ['Framer Motion', 'CSS Animations', 'Web Animations API'],
    lastUpdated: '1 week ago',
    component: 'App.AnimationFix.tsx',
    icon: Zap
  }
]

const categories = [
  { id: 'core', label: 'Core System', count: 1, color: 'bg-(--magic-500)' },
  { id: 'game', label: 'Game Features', count: 6, color: 'bg-(--gold-500)' },
  { id: 'ui', label: 'UI Components', count: 3, color: 'bg-(--nature-500)' },
  { id: 'system', label: 'System Demo', count: 1, color: 'bg-(--cyber-500)' }
]

const DemoIndexApp: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentDemo, setCurrentDemo] = useState<string | null>(null)

  // Filter demos based on category and search
  const filteredDemos = useMemo(() => {
    let filtered = demoConfigs

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(demo => demo.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(demo =>
        demo.title.toLowerCase().includes(query) ||
        demo.description.toLowerCase().includes(query) ||
        demo.features.some(feature => feature.toLowerCase().includes(query)) ||
        demo.techStack.some(tech => tech.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [selectedCategory, searchQuery])

  const handleNavigateToDemo = (demoId: string) => {
    const demo = demoConfigs.find(d => d.id === demoId)
    if (demo) {
      // In a real implementation, this would navigate to the demo
      // For now, we'll just show an alert
      alert(`Navigating to ${demo.title}\nComponent: ${demo.component}`)
      setCurrentDemo(demoId)
    }
  }

  const handleNavigateHome = () => {
    setCurrentDemo(null)
  }

  const handleNavigateBack = () => {
    setCurrentDemo(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-(--color-background) transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-surface border-b border-(--color-border)">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <DemoNavigation
                currentDemo={currentDemo || undefined}
                onNavigateHome={handleNavigateHome}
                onNavigateBack={handleNavigateBack}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
              />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {currentDemo ? (
              <motion.div
                key="demo-viewer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <Card variant="magical" padding="lg" className="max-w-2xl mx-auto">
                  <CardContent className="space-y-6">
                    <div className="w-16 h-16 mx-auto bg-(--color-primary)/20 rounded-full flex items-center justify-center">
                      <Play size={32} className="text-(--color-primary)" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-(--color-text-primary) mb-2">
                        Demo Viewer
                      </h2>
                      <p className="text-(--color-text-secondary)">
                        In a real implementation, this would load the selected demo component.
                      </p>
                    </div>
                    <div className="p-4 bg-(--color-surface-elevated) rounded-lg">
                      <p className="text-sm text-(--color-text-muted)">
                        Selected Demo: <span className="font-medium text-(--color-text-primary)">
                          {demoConfigs.find(d => d.id === currentDemo)?.title}
                        </span>
                      </p>
                      <p className="text-sm text-(--color-text-muted) mt-1">
                        Component: <span className="font-mono text-(--color-text-primary)">
                          {demoConfigs.find(d => d.id === currentDemo)?.component}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="demo-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Stats */}
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card variant="glass" padding="md">
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-(--color-primary)">
                          {filteredDemos.length}
                        </div>
                        <div className="text-sm text-(--color-text-secondary)">
                          {selectedCategory === 'all' ? 'Total Demos' : 'Filtered Demos'}
                        </div>
                      </CardContent>
                    </Card>
                    <Card variant="glass" padding="md">
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-(--nature-500)">
                          {demoConfigs.filter(d => d.status === 'complete').length}
                        </div>
                        <div className="text-sm text-(--color-text-secondary)">Complete</div>
                      </CardContent>
                    </Card>
                    <Card variant="glass" padding="md">
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-(--gold-500)">
                          {demoConfigs.filter(d => d.status === 'in-progress').length}
                        </div>
                        <div className="text-sm text-(--color-text-secondary)">In Progress</div>
                      </CardContent>
                    </Card>
                    <Card variant="glass" padding="md">
                      <CardContent className="text-center">
                        <div className="text-2xl font-bold text-(--parchment-500)">
                          {demoConfigs.filter(d => d.status === 'planned').length}
                        </div>
                        <div className="text-sm text-(--color-text-secondary)">Planned</div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                {/* Demo Grid */}
                {filteredDemos.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {filteredDemos.map((demo) => (
                      <motion.div key={demo.id} variants={itemVariants}>
                        <DemoCard
                          demo={demo}
                          onNavigate={handleNavigateToDemo}
                          className={viewMode === 'list' ? 'max-w-4xl mx-auto' : ''}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <Card variant="outline" padding="lg" className="text-center">
                      <CardContent className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-(--color-surface-elevated) rounded-full flex items-center justify-center">
                          <Layers size={32} className="text-(--color-text-muted)" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-(--color-text-primary) mb-2">
                            No demos found
                          </h3>
                          <p className="text-(--color-text-secondary)">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-16 glass-surface border-t border-(--color-border)">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-(--color-text-muted)" />
                <span className="text-sm text-(--color-text-secondary)">
                  ZimboMate V2 Demo Showcase • Built with React 19 & Tailwind v4
                </span>
              </div>
              <div className="text-sm text-(--color-text-muted)">
                {demoConfigs.length} Interactive Demos Available ✨
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default DemoIndexApp