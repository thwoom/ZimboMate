# 🛠️ ZimboMate V2 Implementation Rules & Guidelines
*Building the magical Dungeon World companion from scratch*

## 🎯 **V2 Project Strategy: Fresh Start**

### **🆕 NEW PROJECT APPROACH**
We're creating `zimbomate-v2` as a completely new project, not modifying the existing one.

### **📦 SELECTIVE MIGRATION STRATEGY**
```typescript
// ✅ COPY THESE (The Gold)
src/models/           // Character, Equipment, Move models
src/services/         // Game logic and calculations
src/store/GameStore   // Core state (adapt to Zustand)

// ❌ LEAVE BEHIND (The Mess)
src/framework/        // Custom panel system
src/components/       // Overlay complexity
src/layouts/          // Positioning hell
```

## 🚨 **CRITICAL V2 RULES**

### **NEVER MODIFY V1 CODEBASE**
- V1 stays as reference and fallback
- All new development in `zimbomate-v2/`
- Copy files, don't move them
- Maintain data compatibility for migration

### **ALWAYS PRESERVE DATA COMPATIBILITY**
```typescript
// ✅ GOOD: Keep existing data structures
interface Character {
  id: string
  name: string
  class: CharacterClass
  // ... existing fields
}

// ❌ BAD: Breaking data structure changes
interface NewCharacter {
  uuid: string  // Breaking change!
  // ... different structure
}
```

### **MODERN PATTERNS ONLY**
```typescript
// ✅ GOOD: Modern React patterns
const CharacterSheet = () => {
  const character = useGameStore(state => state.activeCharacter)
  
  return (
    <motion.div className="character-sheet">
      <HealthBar character={character} />
    </motion.div>
  )
}

// ❌ BAD: Complex custom frameworks
const CharacterStatsPanel = ({ panelState, onStateChange }) => {
  // 500 lines of overlay management...
}
```

## 🏗️ **V2 ARCHITECTURE RULES**

### **Project Structure**
```
zimbomate-v2/
├── src/
│   ├── app/                    # App configuration
│   ├── components/
│   │   ├── ui/                 # Radix + Tailwind base components
│   │   ├── game/               # Dungeon World-specific components
│   │   ├── 3d/                 # Three.js components
│   │   └── animations/         # Framer Motion components
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   ├── services/               # 📦 COPIED from V1
│   ├── models/                 # 📦 COPIED from V1
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript definitions
│   └── assets/                 # Static assets
├── public/
│   ├── audio/                  # Sound effects
│   ├── models/                 # 3D models
│   └── textures/               # 3D textures
└── docs/                       # Documentation
```

### **Component Naming Convention**
```typescript
// UI Components (Radix-based)
Button, Card, Dialog, Input, Select

// Game Components (Dungeon World-specific)
CharacterSheet, HealthBar, DiceRoller, SpellBook

// 3D Components (Three.js)
Dice3D, ParticleSystem, MagicalEffect

// Animation Components (Framer Motion)
FadeIn, SlideUp, MagicalTransition
```

### **State Management Rules**
```typescript
// Zustand Stores (Simple & Powerful)
interface GameStore {
  // Game data
  characters: Character[]
  activeCharacterId: string | null
  
  // Actions
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  setActiveCharacter: (id: string) => void
}

interface UIStore {
  // UI state
  theme: 'fantasy' | 'dark' | 'light'
  animations: boolean
  sounds: boolean
  
  // Actions
  setTheme: (theme: string) => void
  toggleAnimations: () => void
}
```

## 🎨 **DESIGN SYSTEM RULES**

### **Color System**
```css
/* Use CSS custom properties with semantic names */
:root {
  /* Base colors */
  --parchment-50: #fdfcf8;
  --parchment-500: #d4c8a8;
  --parchment-900: #8b7355;
  
  /* Semantic colors */
  --color-background: var(--parchment-50);
  --color-surface: var(--parchment-100);
  --color-primary: var(--gold-500);
  
  /* Game-specific colors */
  --color-health-full: var(--nature-500);
  --color-health-critical: var(--red-500);
  --color-mana: var(--magic-500);
}
```

### **Component Styling Rules**
```typescript
// ✅ GOOD: Tailwind + CSS variables
const HealthBar = ({ current, max }) => (
  <div className="bg-surface rounded-lg p-4 border border-primary/20">
    <div className="h-4 bg-parchment-200 rounded-full overflow-hidden">
      <motion.div 
        className="h-full bg-health-full"
        animate={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  </div>
)

// ❌ BAD: Complex CSS classes and inline styles
const ComplexComponent = () => (
  <div className="stat-card stat-card--hp glass-surface">
    <div style={{ position: 'absolute', left: rect.left }}>
      {/* Complex positioning */}
    </div>
  </div>
)
```

### **Animation Rules**
```typescript
// Layer animations by complexity
const animations = {
  // Simple: Framer Motion
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  },
  
  // Complex: Lottie
  levelUp: () => <Lottie animationData={levelUpData} />,
  
  // 3D: Three.js
  diceRoll: () => <Dice3D onResult={handleResult} />
}
```

## 🔧 **DEVELOPMENT WORKFLOW**

### **Phase 1: Setup & Foundation**
```bash
# 1. Create new project
npm create vite@latest zimbomate-v2 -- --template react-ts
cd zimbomate-v2

# 2. Install optimal dependencies
npm install zustand @tanstack/react-query framer-motion
npm install @radix-ui/react-* tailwindcss lucide-react
npm install three @react-three/fiber @react-three/drei
npm install howler lottie-react canvas-confetti

# 3. Copy the gold from V1
mkdir -p src/{models,services}
cp -r ../packages/dungeon-world/src/models/* src/models/
cp -r ../packages/dungeon-world/src/services/* src/services/

# 4. Set up development tools
npm install -D @types/three vitest @testing-library/react
npm install -D storybook @storybook/react-vite
```

### **Phase 2: Core Development**
1. **Theme System**: Set up Tailwind with fantasy colors
2. **Base Components**: Create UI primitives with Radix
3. **State Management**: Set up Zustand stores
4. **Character Sheet**: Build main interface
5. **3D System**: Add dice rolling and effects

### **Phase 3: Game Features**
1. **Equipment System**: Drag-and-drop with 3D previews
2. **Spell System**: Magical animations and effects
3. **Move System**: Contextual suggestions and execution
4. **Audio System**: Atmospheric sounds and feedback

### **Phase 4: Polish & Deploy**
1. **Performance**: Optimize animations and 3D rendering
2. **Accessibility**: WCAG AA compliance
3. **PWA**: Offline capabilities and mobile optimization
4. **Testing**: Comprehensive test coverage

## 📋 **QUALITY GATES**

### **Code Quality Rules**
```typescript
// ✅ GOOD: Simple, readable, performant
const CharacterCard = ({ character }: { character: Character }) => {
  const updateHealth = useGameStore(state => state.updateCharacter)
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-display">{character.name}</h2>
      <HealthBar 
        current={character.hp.current} 
        max={character.hp.max}
        onChange={(hp) => updateHealth(character.id, { hp })}
      />
    </Card>
  )
}

// ❌ BAD: Complex, hard to understand
const ComplexPanel = ({ panelState, onStateChange, isActive, api }) => {
  // 200+ lines of complex logic...
}
```

### **Performance Rules**
- **60fps animations**: All animations must be smooth
- **< 2s load time**: Initial app load under 2 seconds
- **< 100ms interactions**: All user interactions feel instant
- **Memory efficient**: No memory leaks in long sessions

### **Accessibility Rules**
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper ARIA labels and roles
- **Color contrast**: WCAG AA compliance
- **Reduced motion**: Respect user preferences

## 🚫 **ANTI-PATTERNS TO AVOID**

### **Don't Recreate V1 Complexity**
```typescript
// ❌ AVOID: Custom frameworks and abstractions
class PanelRegistry {
  private panels = new Map()
  register(panel: PanelConfig) { /* complex logic */ }
}

// ✅ PREFER: Simple, direct patterns
const CharacterSheet = () => {
  // Simple component logic
}
```

### **Don't Over-Engineer**
```typescript
// ❌ AVOID: Unnecessary abstractions
interface ComplexPanelFramework {
  registerPanel: (config: PanelConfig) => void
  createPanelAPI: (id: string) => PanelAPI
  // ... 20 more methods
}

// ✅ PREFER: Direct solutions
const useCharacter = (id: string) => {
  return useGameStore(state => 
    state.characters.find(c => c.id === id)
  )
}
```

### **Don't Ignore Performance**
```typescript
// ❌ AVOID: Expensive operations in render
const ExpensiveComponent = () => {
  const expensiveValue = heavyCalculation() // Runs every render!
  return <div>{expensiveValue}</div>
}

// ✅ PREFER: Memoization and optimization
const OptimizedComponent = () => {
  const expensiveValue = useMemo(() => heavyCalculation(), [deps])
  return <div>{expensiveValue}</div>
}
```

## 🎯 **SUCCESS CRITERIA**

### **Development Experience**
- [ ] New contributors productive in < 1 hour
- [ ] Hot reload works perfectly
- [ ] TypeScript errors are clear and helpful
- [ ] Testing is fast and reliable

### **User Experience**
- [ ] App feels magical and delightful
- [ ] All interactions are smooth and responsive
- [ ] Accessibility works perfectly
- [ ] Mobile experience is excellent

### **Code Quality**
- [ ] Codebase is simple and maintainable
- [ ] No complex abstractions or frameworks
- [ ] Performance is excellent
- [ ] Test coverage is comprehensive

---

## 🎲 **Remember: Simple is Magical**

The goal is to create something beautiful and functional, not to showcase complex engineering. Every line of code should serve the user experience, not the architecture.

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."* - Antoine de Saint-Exupéry