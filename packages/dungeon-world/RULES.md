# 🎯 ZimboMate V2 Development Rules
*Critical rules for Kombai and all development sessions*

## 🚨 **CRITICAL PROJECT CONTEXT**

### **Project Status: COMPLETE REWRITE APPROVED**
- **V1**: `packages/dungeon-world/` - REFERENCE ONLY, DO NOT MODIFY
- **V2**: `packages/zimbomate-v2/` - NEW PROJECT, BUILD FROM SCRATCH
- **Game**: Dungeon World (NOT D&D) - tabletop RPG with unique mechanics

### **FIRST ACTION EVERY SESSION**
1. **Read Progress**: Check `packages/zimbomate-v2/docs/PROGRESS.md` for current status
2. **Update Progress**: Document all changes made during session
3. **Follow Rules**: Adhere to patterns in `docs/IMPLEMENTATION_RULES.md`

## 🏗️ **ARCHITECTURE RULES**

### **V2 Project Structure**
```
packages/zimbomate-v2/                # 🆕 NEW MONOREPO PACKAGE
├── src/
│   ├── components/
│   │   ├── ui/                       # Radix + Tailwind base components
│   │   ├── game/                     # Dungeon World-specific components
│   │   ├── 3d/                       # Three.js components
│   │   └── animations/               # Framer Motion components
│   ├── stores/                       # Zustand state management
│   ├── services/                     # 📦 COPIED from V1 (game logic)
│   ├── models/                       # 📦 COPIED from V1 (data models)
│   ├── hooks/                        # Custom React hooks
│   └── utils/                        # Utility functions
├── docs/
│   └── PROGRESS.md                   # 🔥 CRITICAL - UPDATE EVERY SESSION
└── package.json                      # @zimbo-mate/zimbomate-v2
```

### **What to Copy from V1**
```bash
# COPY THESE (The Gold)
cp -r packages/dungeon-world/src/models packages/zimbomate-v2/src/
cp -r packages/dungeon-world/src/services packages/zimbomate-v2/src/
# Adapt GameStore to Zustand patterns
```

### **What NOT to Touch**
```bash
# NEVER MODIFY THESE
packages/dungeon-world/src/framework/    # Custom panel system
packages/dungeon-world/src/components/   # Overlay complexity
packages/dungeon-world/src/layouts/      # Complex positioning
```

## 🎨 **DESIGN SYSTEM RULES**

### **Tech Stack (Optimal)**
```json
{
  "react": "^19.1.1",              // Latest React
  "typescript": "^5.0.0",          // Type safety
  "zustand": "^4.4.0",             // Simple state management
  "framer-motion": "^11.0.0",      // Smooth animations
  "@radix-ui/react-*": "latest",   // Accessible components
  "three": "^0.160.0",             // 3D graphics
  "tailwindcss": "^4.1.13",        // Modern styling
  "howler": "^2.2.4",              // Audio system
  "lottie-react": "^2.4.0"         // Complex animations
}
```

### **Component Patterns**
```typescript
// ✅ GOOD: Simple, modern React patterns
const CharacterSheet = () => {
  const character = useGameStore(state => state.activeCharacter)
  
  return (
    <motion.div className="character-sheet">
      <HealthBar character={character} />
    </motion.div>
  )
}

// ❌ BAD: Complex custom frameworks
const CharacterStatsPanel = ({ panelState, onStateChange, api }) => {
  // 500+ lines of overlay management...
}
```

### **Styling Rules**
```css
/* Use Tailwind + CSS custom properties */
:root {
  --parchment-50: #fdfcf8;
  --gold-500: #d4af37;
  --magic-500: #9333ea;
}

/* Fantasy theme, not glass morphism */
.character-sheet {
  @apply bg-parchment-50 border border-gold-500/20 rounded-lg shadow-lg;
}
```

## 🎮 **DUNGEON WORLD SPECIFIC RULES**

### **Game Mechanics Focus**
- **2d6 + stat** rolling system (not d20)
- **Moves** instead of skills/spells
- **Bonds** and **Alignment** XP triggers
- **Load** system for equipment
- **Debilities** instead of conditions
- **Playbooks** (classes) with specific moves

### **UI Priorities**
1. **Character Sheet**: Stats, HP, moves, equipment
2. **Move Rolling**: 2d6 + modifier with 10+/7-9/6- results
3. **Equipment Management**: Load tracking, tags system
4. **XP Tracking**: Failure XP, alignment XP, bond resolution
5. **Spell System**: For Wizard/Cleric playbooks

## 📋 **DEVELOPMENT WORKFLOW**

### **Session Start Checklist**
- [ ] Read `packages/zimbomate-v2/docs/PROGRESS.md`
- [ ] Understand current phase and active tasks
- [ ] Check if V2 project exists, create if needed
- [ ] Verify tech stack dependencies are installed

### **During Development**
- [ ] Follow modern React patterns (hooks, composition)
- [ ] Use Zustand for state management
- [ ] Apply Tailwind for styling
- [ ] Add Framer Motion for animations
- [ ] Keep components simple and focused

### **Session End Checklist**
- [ ] Update `packages/zimbomate-v2/docs/PROGRESS.md` with:
  - What was completed
  - What's in progress
  - Any issues encountered
  - Next session focus
- [ ] Ensure code builds and runs
- [ ] Document any architectural decisions

## 🎯 **SUCCESS CRITERIA**

### **User Experience**
- **Magical Feel**: Users describe it as "enchanting"
- **Fast Performance**: 60fps animations, < 100ms interactions
- **Intuitive**: New users productive in < 2 minutes
- **Accessible**: WCAG AA compliant

### **Code Quality**
- **Simple**: No complex abstractions or custom frameworks
- **Maintainable**: Easy to understand and modify
- **Performant**: Optimized for smooth animations
- **Tested**: Comprehensive test coverage

### **Dungeon World Integration**
- **Accurate**: Follows official Dungeon World rules
- **Complete**: Supports all core playbooks and moves
- **Enhanced**: Improves gameplay without changing rules
- **Extensible**: Ready for future playbook additions

## 🚀 **PHASE ROADMAP**

### **Phase 1: Foundation** (Current)
- [ ] Create `packages/zimbomate-v2/` monorepo package
- [ ] Install optimal tech stack
- [ ] Copy models and services from V1
- [ ] Set up basic project structure

### **Phase 2: Core UI**
- [ ] Fantasy theme system with Tailwind
- [ ] Base UI components with Radix
- [ ] Character sheet layout
- [ ] Zustand state management

### **Phase 3: Game Features**
- [ ] 2d6 dice rolling with 3D effects
- [ ] Move system with contextual suggestions
- [ ] Equipment management with drag-and-drop
- [ ] XP and advancement tracking

### **Phase 4: Polish**
- [ ] Animations and particle effects
- [ ] Audio system integration
- [ ] PWA capabilities
- [ ] Performance optimization

## 🤖 **AI ASSISTANT OPTIMIZATION**

### **Context Preservation**
- All critical information in this RULES.md file
- Progress tracking in dedicated PROGRESS.md
- Session handoff prompt for continuity
- Clear documentation hierarchy

### **Decision Making**
- Always prioritize user experience over technical complexity
- Choose simple solutions over clever ones
- Maintain Dungeon World rule accuracy
- Focus on magical, delightful interactions

### **Communication**
- Update progress documentation religiously
- Ask for clarification when rules conflict
- Document architectural decisions
- Maintain session continuity notes

---

## 🎲 **REMEMBER: WE'RE BUILDING MAGIC**

This isn't just a character sheet - it's a magical portal to epic Dungeon World adventures. Every decision should serve that vision.

*"Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."*