# 🛠️ ZimboMate V2 Developer Guide

*Complete technical documentation for ZimboMate V2 development*

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Component API Reference](#component-api-reference)
- [State Management](#state-management)
- [Testing Guidelines](#testing-guidelines)
- [Performance Optimization](#performance-optimization)
- [Development Workflow](#development-workflow)
- [Deployment Guide](#deployment-guide)

## 🏗️ Architecture Overview

### **Project Structure**

```
packages/zimbomate-v2/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components (Radix + Tailwind)
│   │   ├── game/                  # Dungeon World-specific components
│   │   ├── 3d/                    # Three.js 3D components
│   │   └── animations/            # Framer Motion components
│   ├── stores/                    # Zustand state management
│   ├── services/                  # Business logic and API services
│   ├── models/                    # TypeScript data models
│   ├── hooks/                     # Custom React hooks
│   ├── utils/                     # Utility functions and helpers
│   ├── types/                     # TypeScript type definitions
│   └── test/                      # Testing utilities and setup
├── docs/                          # Documentation
└── public/                        # Static assets
```

### **Technology Stack**

- **Frontend Framework**: React 19 with TypeScript
- **State Management**: Zustand for global state
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS v4 with custom utilities
- **3D Graphics**: Three.js with React Three Fiber
- **Animations**: Framer Motion for UI animations
- **Audio**: Howler.js for spatial audio
- **Testing**: Vitest with Testing Library
- **Build Tool**: Vite with optimized configuration

### **Design Patterns**

#### **Component Composition**
```typescript
// ✅ Good: Composable components
const CharacterSheet = () => {
  return (
    <Card variant="magical">
      <CardHeader>
        <CharacterInfo />
      </CardHeader>
      <CardContent>
        <StatsPanel />
        <HealthBar />
        <XPTracker />
      </CardContent>
    </Card>
  )
}
```

#### **Custom Hooks Pattern**
```typescript
// ✅ Good: Reusable logic in hooks
const useCharacter = (characterId: string) => {
  const character = useCharacterStore(state => 
    state.characters.find(c => c.id === characterId)
  )
  
  const updateCharacter = useCharacterStore(state => state.updateCharacter)
  
  return {
    character,
    updateCharacter: (updates: Partial<Character>) => 
      updateCharacter(characterId, updates)
  }
}
```

#### **Service Layer Pattern**
```typescript
// ✅ Good: Business logic in services
export class DiceService {
  static rollDice(sides: number, count: number = 1): DiceRoll {
    const dice = Array.from({ length: count }, () => 
      Math.floor(Math.random() * sides) + 1
    )
    
    return {
      dice,
      total: dice.reduce((sum, die) => sum + die, 0),
      timestamp: new Date()
    }
  }
  
  static calculateDungeonWorldResult(total: number): DWResult {
    if (total >= 10) return 'success'
    if (total >= 7) return 'partial'
    return 'failure'
  }
}
```

## 🧩 Component API Reference

### **Core UI Components**

#### **Button Component**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// Usage
<Button variant="primary" size="lg" onClick={handleClick}>
  Roll Dice
</Button>
```

#### **Card Component**
```typescript
interface CardProps {
  variant?: 'default' | 'magical' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

// Usage
<Card variant="magical" padding="lg">
  <CardHeader>
    <h2>Character Sheet</h2>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### **Game Components**

#### **CharacterSheet Component**
```typescript
interface CharacterSheetProps {
  characterId?: string
  onCharacterUpdate?: (character: Character) => void
  onStatRoll?: (stat: StatType, modifier: number) => void
}

// Usage
<CharacterSheet 
  characterId="char-1"
  onCharacterUpdate={handleUpdate}
  onStatRoll={handleStatRoll}
/>
```

#### **DiceRoller Component**
```typescript
interface DiceRollerProps {
  modifier?: number
  onRoll: (result: DiceRollResult) => void
  disabled?: boolean
  autoRoll?: boolean
  showAnimation?: boolean
}

// Usage
<DiceRoller 
  modifier={2}
  onRoll={handleRollResult}
  showAnimation={true}
/>
```

#### **MovesPanel Component**
```typescript
interface MovesPanelProps {
  character: Character
  characterClass: CharacterClass
  onMoveSelect: (move: Move) => void
  onRollComplete: (result: RollResult) => void
}

// Usage
<MovesPanel 
  character={character}
  characterClass="wizard"
  onMoveSelect={handleMoveSelect}
  onRollComplete={handleRollComplete}
/>
```

### **3D Components**

#### **Dice3D Component**
```typescript
interface Dice3DProps {
  sides: number
  onResult: (result: number) => void
  position?: [number, number, number]
  rotation?: [number, number, number]
  material?: 'plastic' | 'metal' | 'wood'
}

// Usage
<Dice3D 
  sides={6}
  onResult={handleDiceResult}
  position={[0, 2, 0]}
  material="plastic"
/>
```

## 🗄️ State Management

### **Zustand Store Structure**

#### **Character Store**
```typescript
interface CharacterStore {
  // State
  characters: Character[]
  activeCharacterId: string | null
  
  // Actions
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  removeCharacter: (id: string) => void
  setActiveCharacter: (id: string) => void
  
  // Computed
  activeCharacter: Character | null
}

// Usage
const useCharacterStore = create<CharacterStore>((set, get) => ({
  characters: [],
  activeCharacterId: null,
  
  addCharacter: (character) => set(state => ({
    characters: [...state.characters, character]
  })),
  
  updateCharacter: (id, updates) => set(state => ({
    characters: state.characters.map(char =>
      char.id === id ? { ...char, ...updates } : char
    )
  })),
  
  get activeCharacter() {
    const state = get()
    return state.characters.find(c => c.id === state.activeCharacterId) || null
  }
}))
```

#### **Game State Store**
```typescript
interface GameStateStore {
  // Dice Rolling
  rollHistory: DiceRoll[]
  isRolling: boolean
  
  // Session
  sessionNotes: Note[]
  sessionTimers: Timer[]
  
  // Actions
  addRoll: (roll: DiceRoll) => void
  setRolling: (rolling: boolean) => void
  addNote: (note: Note) => void
  startTimer: (name: string) => void
}
```

### **Store Best Practices**

#### **Immutable Updates**
```typescript
// ✅ Good: Immutable update
updateCharacter: (id, updates) => set(state => ({
  characters: state.characters.map(char =>
    char.id === id ? { ...char, ...updates } : char
  )
}))

// ❌ Bad: Mutating state
updateCharacter: (id, updates) => set(state => {
  const char = state.characters.find(c => c.id === id)
  Object.assign(char, updates) // Mutation!
  return state
})
```

#### **Computed Properties**
```typescript
// ✅ Good: Computed property
interface CharacterStore {
  characters: Character[]
  activeCharacterId: string | null
  
  // Computed property
  get activeCharacter(): Character | null {
    return this.characters.find(c => c.id === this.activeCharacterId) || null
  }
}
```

## 🧪 Testing Guidelines

### **Testing Philosophy**

1. **Test User Behavior**: Focus on what users do, not implementation details
2. **Test Integration**: Verify components work together correctly
3. **Test Accessibility**: Ensure keyboard navigation and screen reader support
4. **Test Performance**: Verify components meet performance budgets

### **Testing Utilities**

#### **Custom Render Function**
```typescript
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <Tooltip.Provider>
        {children}
      </Tooltip.Provider>
    </ThemeProvider>
  )
  
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options })
  }
}
```

#### **Mock Data Generators**
```typescript
export const mockCharacter = (): Character => ({
  id: 'test-char-1',
  name: 'Test Hero',
  class: 'fighter',
  level: 1,
  hp: { current: 20, max: 20 },
  stats: {
    strength: { value: 16, modifier: 2 },
    dexterity: { value: 13, modifier: 1 },
    // ... other stats
  }
})
```

### **Test Categories**

#### **Unit Tests**
```typescript
describe('DiceService', () => {
  it('calculates Dungeon World results correctly', () => {
    expect(DiceService.calculateDungeonWorldResult(12)).toBe('success')
    expect(DiceService.calculateDungeonWorldResult(8)).toBe('partial')
    expect(DiceService.calculateDungeonWorldResult(5)).toBe('failure')
  })
})
```

#### **Component Tests**
```typescript
describe('CharacterSheet', () => {
  it('displays character information correctly', () => {
    const character = mockCharacter()
    renderWithProviders(<CharacterSheet character={character} />)
    
    expect(screen.getByText(character.name)).toBeInTheDocument()
    expect(screen.getByText(`Level ${character.level}`)).toBeInTheDocument()
  })
})
```

#### **Integration Tests**
```typescript
describe('Character and Dice Integration', () => {
  it('passes correct modifier when rolling stats', async () => {
    const { user } = renderWithProviders(<App />)
    
    const strRollButton = screen.getByRole('button', { name: /roll strength/i })
    await user.click(strRollButton)
    
    expect(screen.getByText(/\+2/)).toBeInTheDocument() // STR modifier
  })
})
```

#### **E2E Tests**
```typescript
describe('Complete Gaming Session', () => {
  it('supports full session workflow', async () => {
    const { user } = renderWithProviders(<App />)
    
    // Create session notes
    await user.click(screen.getByRole('tab', { name: /session tools/i }))
    // ... complete workflow test
  })
})
```

### **Performance Testing**

#### **Render Performance**
```typescript
it('renders within performance budget', async () => {
  const start = performance.now()
  renderWithProviders(<CharacterSheet />)
  const end = performance.now()
  
  expect(end - start).toBeLessThan(50) // 50ms budget
})
```

#### **Memory Testing**
```typescript
it('handles memory efficiently', async () => {
  // Simulate extended use
  for (let i = 0; i < 100; i++) {
    const { unmount } = renderWithProviders(<DiceRoller />)
    unmount()
  }
  
  // Check for memory leaks
  const memoryInfo = (performance as any).memory
  if (memoryInfo) {
    expect(memoryInfo.usedJSHeapSize).toBeLessThan(10 * 1024 * 1024) // 10MB
  }
})
```

## ⚡ Performance Optimization

### **React Performance**

#### **Memoization**
```typescript
// ✅ Good: Memoize expensive calculations
const CharacterStats = memo(({ character }: { character: Character }) => {
  const statModifiers = useMemo(() => 
    calculateAllModifiers(character.stats), [character.stats]
  )
  
  return <div>{/* Render stats */}</div>
})
```

#### **Code Splitting**
```typescript
// ✅ Good: Lazy load heavy components
const SpellBook = lazy(() => import('./SpellBook'))
const Dice3D = lazy(() => import('./Dice3D'))

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/spells" element={<SpellBook />} />
      <Route path="/dice" element={<Dice3D />} />
    </Routes>
  </Suspense>
)
```

### **3D Performance**

#### **LOD (Level of Detail)**
```typescript
const Dice3D = ({ distance }: { distance: number }) => {
  const geometry = useMemo(() => {
    // Use simpler geometry for distant objects
    return distance > 10 
      ? new BoxGeometry(1, 1, 1) 
      : new DetailedDiceGeometry()
  }, [distance])
  
  return <mesh geometry={geometry} />
}
```

#### **Instancing**
```typescript
// ✅ Good: Use instancing for multiple dice
const MultipleDice = ({ count }: { count: number }) => {
  const meshRef = useRef<InstancedMesh>(null)
  
  useEffect(() => {
    if (!meshRef.current) return
    
    for (let i = 0; i < count; i++) {
      const matrix = new Matrix4()
      matrix.setPosition(i * 2, 0, 0)
      meshRef.current.setMatrixAt(i, matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count])
  
  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  )
}
```

### **Bundle Optimization**

#### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          '3d-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
})
```

## 🔄 Development Workflow

### **Getting Started**

```bash
# 1. Install dependencies
cd packages/zimbomate-v2
npm install

# 2. Start development server
npm run dev

# 3. Run tests
npm run test

# 4. Run linting
npm run lint
```

### **Development Commands**

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
```

### **Git Workflow**

```bash
# 1. Create feature branch
git checkout -b feature/new-spell-system

# 2. Make changes and commit
git add .
git commit -m "feat: add spell casting animations"

# 3. Run tests before push
npm run test:run
npm run lint

# 4. Push and create PR
git push origin feature/new-spell-system
```

### **Code Review Checklist**

- [ ] **Functionality**: Does the code work as expected?
- [ ] **Performance**: Are there any performance issues?
- [ ] **Accessibility**: Is the code accessible to all users?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code well-documented?
- [ ] **Type Safety**: Are TypeScript types correct?

## 🚀 Deployment Guide

### **Build Configuration**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', 'framer-motion'],
          game: ['three', '@react-three/fiber']
        }
      }
    }
  }
})
```

### **Environment Variables**

```bash
# .env.production
VITE_API_URL=https://api.zimbomate.com
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=SENTRY_DSN_URL
```

### **Performance Monitoring**

```typescript
// Performance monitoring setup
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### **Error Monitoring**

```typescript
// Error boundary with reporting
export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Report to error monitoring service
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
```

## 📊 Performance Baselines

### **Target Metrics**

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.5s

### **Bundle Size Targets**

- **Main Bundle**: < 250KB gzipped
- **Vendor Bundle**: < 150KB gzipped
- **3D Bundle**: < 200KB gzipped (lazy loaded)
- **Total Initial Load**: < 400KB gzipped

### **Runtime Performance**

- **Component Render Time**: < 16ms (60fps)
- **State Update Time**: < 5ms
- **3D Frame Rate**: 60fps minimum
- **Memory Usage**: < 50MB after 1 hour of use

---

## 🎯 Best Practices Summary

1. **Component Design**: Keep components focused and composable
2. **State Management**: Use Zustand for global state, local state for UI
3. **Performance**: Measure first, optimize second
4. **Testing**: Test behavior, not implementation
5. **Accessibility**: Design for all users from the start
6. **Type Safety**: Leverage TypeScript for better DX
7. **Documentation**: Keep docs up to date with code changes

*This guide is a living document. Update it as the codebase evolves.*