# 🏗️ ZimboMate V2 Project Structure Decision
*Monorepo package vs. separate repository*

## 🎯 **DECISION: NEW MONOREPO PACKAGE**

We'll create `packages/zimbomate-v2/` within the existing monorepo structure.

## 📁 **Recommended Structure**

```
ZimboMate/                           # Root monorepo
├── packages/
│   ├── dungeon-world/               # V1 (keep as reference)
│   ├── zimbomate-v2/                # 🆕 NEW V2 PACKAGE
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Radix + Tailwind
│   │   │   │   ├── game/             # D&D components
│   │   │   │   ├── 3d/               # Three.js
│   │   │   │   └── animations/       # Framer Motion
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── services/             # 📦 COPIED from V1
│   │   │   ├── models/               # 📦 COPIED from V1
│   │   │   ├── hooks/                # Custom hooks
│   │   │   ├── utils/                # Utilities
│   │   │   ├── types/                # TypeScript types
│   │   │   └── assets/               # Static assets
│   │   ├── public/
│   │   │   ├── audio/                # Sound effects
│   │   │   ├── models/               # 3D models
│   │   │   └── textures/             # 3D textures
│   │   ├── docs/                     # V2-specific docs
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── task-manager/                 # Keep existing
└── docs/                            # Shared documentation
```

## 🚀 **Setup Commands**

### **1. Create New Package**
```bash
# From monorepo root
mkdir -p packages/zimbomate-v2
cd packages/zimbomate-v2

# Initialize new package
npm init -y
```

### **2. Set up Package.json**
```json
{
  "name": "@zimbo-mate/zimbomate-v2",
  "version": "0.1.0",
  "type": "module",
  "description": "ZimboMate V2 - Magical D&D Companion",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write ."
  }
}
```

### **3. Install Dependencies**
```bash
# Core dependencies
npm install react@^19.1.1 react-dom@^19.1.1 typescript@^5.0.0
npm install zustand @tanstack/react-query framer-motion
npm install @radix-ui/react-* tailwindcss lucide-react
npm install three @react-three/fiber @react-three/drei
npm install howler lottie-react canvas-confetti

# Development dependencies
npm install -D vite @vitejs/plugin-react
npm install -D @types/react @types/react-dom @types/three
npm install -D vitest @testing-library/react
npm install -D eslint prettier @typescript-eslint/parser
```

### **4. Copy V1 Assets**
```bash
# Create directory structure
mkdir -p src/{components/{ui,game,3d,animations},stores,hooks,utils,types,assets}
mkdir -p public/{audio,models,textures}

# Copy the gold from V1
cp -r ../dungeon-world/src/models src/
cp -r ../dungeon-world/src/services src/
```

## 🎨 **Enhanced Frontend Features**

### **🆕 Advanced Visual Enhancements**

#### **1. Immersive 3D Character Models**
```typescript
// 3D character avatars that react to stats
const CharacterAvatar3D = ({ character }) => (
  <Canvas>
    <CharacterModel 
      class={character.class}
      health={character.hp.current / character.hp.max}
      equipment={character.equipment}
      animations={character.activeSpells}
    />
  </Canvas>
)
```

#### **2. Dynamic Environmental Effects**
```typescript
// Background changes based on campaign setting
const EnvironmentalBackground = ({ campaign }) => (
  <div className="environmental-bg">
    <ParticleSystem type={campaign.environment} />
    <WeatherEffects weather={campaign.weather} />
    <AmbientLighting time={campaign.timeOfDay} />
  </div>
)
```

#### **3. Spell Visualization System**
```typescript
// Visual spell effects that play during casting
const SpellEffects = ({ spell, target }) => (
  <Canvas>
    <SpellParticles type={spell.school} />
    <MagicalAura color={spell.color} />
    <CastingGestures spell={spell} />
  </Canvas>
)
```

### **🎮 Advanced Interaction Features**

#### **4. Voice Commands & Speech Recognition**
```typescript
// Cast spells and roll dice with voice
const VoiceCommands = () => {
  const { listen } = useSpeechRecognition({
    commands: [
      { command: 'roll initiative', callback: rollInitiative },
      { command: 'cast * spell', callback: castSpell },
      { command: 'heal *', callback: heal }
    ]
  })
}
```

#### **5. Gesture Controls (Mobile)**
```typescript
// Shake phone to roll dice, swipe for actions
const GestureControls = () => {
  const { shake, swipe } = useGestures({
    onShake: () => rollDice(),
    onSwipeLeft: () => previousPanel(),
    onSwipeRight: () => nextPanel()
  })
}
```

#### **6. AR Character Sheet (Future)**
```typescript
// View character in augmented reality
const ARCharacterSheet = ({ character }) => (
  <ARCanvas>
    <CharacterHologram character={character} />
    <FloatingStats stats={character.attributes} />
  </ARCanvas>
)
```

### **🤖 AI-Powered Enhancements**

#### **7. Smart Campaign Assistant**
```typescript
// AI that helps with rules, suggests actions
const CampaignAI = () => {
  const { suggest, explain, generate } = useAI({
    model: 'local-llm',
    context: 'dungeon-world'
  })
  
  return (
    <AIAssistant>
      <RuleLookup onQuery={explain} />
      <ActionSuggestions onRequest={suggest} />
      <ContentGenerator onGenerate={generate} />
    </AIAssistant>
  )
}
```

#### **8. Dynamic Music & Soundscapes**
```typescript
// AI-generated music that adapts to game state
const AdaptiveAudio = ({ gameState }) => {
  const { playMusic, adjustTension } = useAdaptiveAudio()
  
  useEffect(() => {
    if (gameState.inCombat) {
      playMusic('combat', { intensity: gameState.threat })
    } else {
      playMusic('exploration', { mood: gameState.atmosphere })
    }
  }, [gameState])
}
```

### **🌐 Social & Multiplayer Features**

#### **9. Real-time Collaborative Sessions**
```typescript
// Multiple players in same session
const MultiplayerSession = () => {
  const { players, sync } = useMultiplayer()
  
  return (
    <SessionRoom>
      {players.map(player => (
        <PlayerCursor key={player.id} player={player} />
      ))}
      <SharedDiceRoller onRoll={sync} />
      <CollaborativeNotes />
    </SessionRoom>
  )
}
```

#### **10. Streaming Integration**
```typescript
// Stream-friendly overlays for content creators
const StreamOverlay = ({ character, showStats = true }) => (
  <div className="stream-overlay">
    <CharacterNameplate character={character} />
    {showStats && <StatsOverlay character={character} />}
    <RecentRolls />
    <ChatIntegration />
  </div>
)
```

## 📋 **Progress Tracking System**

### **Progress File Location**
`packages/zimbomate-v2/docs/PROGRESS.md`

### **Progress Tracking Structure**
~~~
# ZimboMate V2 Development Progress

## Current Phase: [Phase Name]
## Last Updated: [Timestamp]
## Next Session Focus: [What to work on next]

## Phase Completion Status
- [ ] Phase 1: Foundation Setup
- [ ] Phase 2: Core UI
- [ ] Phase 3: Character Sheet
- [ ] Phase 4: 3D System

## Current Task Details
### Active Task: [Current task]
### Status: [In Progress/Blocked/Complete]
### Files Modified: [List of files]
### Next Steps: [What to do next]

## Session Notes
### [Date] - [Session Summary]
- Completed: [What was finished]
- Issues: [Any problems encountered]
- Next: [What to focus on next session]
~~~

## 🤖 **Session Handoff Prompt**

Create this file: `packages/zimbomate-v2/docs/SESSION_HANDOFF_PROMPT.md`

~~~
# 🎯 ZimboMate V2 Session Handoff Prompt

**COPY THIS PROMPT FOR EVERY NEW CHAT SESSION:**

---

I'm continuing work on ZimboMate V2, a magical D&D companion app. This is a COMPLETE REWRITE of the existing V1 codebase.

**CRITICAL CONTEXT:**
1. Read `packages/zimbomate-v2/docs/PROGRESS.md` FIRST to see current status
2. We're building V2 in `packages/zimbomate-v2/` (NEW package in monorepo)
3. We're copying models/services from V1, rebuilding UI from scratch
4. Using modern stack: React 19, Zustand, Framer Motion, Three.js, Tailwind

**CURRENT MISSION:**
Check PROGRESS.md for current phase and tasks. Update it as you work.

**KEY RULES:**
- Never modify V1 code in `packages/dungeon-world/`
- Always update PROGRESS.md with your changes
- Follow patterns in `docs/IMPLEMENTATION_RULES.md`
- Keep it simple - no complex abstractions

**DOCUMENTATION TO READ:**
- `packages/zimbomate-v2/docs/PROGRESS.md` (CURRENT STATUS)
- `packages/dungeon-world/docs/FRONTEND_VISION.md` (VISION)
- `packages/dungeon-world/docs/OPTIMAL_TECH_STACK.md` (TECH STACK)
- `packages/dungeon-world/docs/IMPLEMENTATION_RULES.md` (RULES)

**WHAT TO DO:**
1. Read PROGRESS.md to understand current state
2. Continue the current task or start the next phase
3. Update PROGRESS.md with your changes
4. Ask if you need clarification on anything

Ready to build magic! ✨
~~~

## 🎯 **Why Monorepo Package?**

### **Benefits:**
- **Shared tooling**: ESLint, Prettier, TypeScript configs
- **Code sharing**: Can reference V1 models/services easily
- **Unified deployment**: Single CI/CD pipeline
- **Version management**: Coordinated releases
- **Development efficiency**: Single checkout, shared scripts

### **Structure Benefits:**
- **Clear separation**: V1 and V2 completely separate
- **Easy migration**: Copy files between packages
- **Parallel development**: Both versions can coexist
- **Shared documentation**: Common docs in root

## 🚀 **Next Steps**

1. **Create the package structure** as outlined above
2. **Set up the progress tracking** system
3. **Copy the session handoff prompt** for continuity
4. **Begin Phase 1** foundation setup

The monorepo approach gives us the best of both worlds - clean separation with shared infrastructure! 🎲✨