# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Focus

**Primary Development**: `packages/zimbomate-v2/` - A magical Dungeon World companion app with modern UI/UX design inspired by premium desktop applications.

**Legacy Packages** (not in active development):
- `packages/task-manager/` - Legacy task management system
- `packages/dungeon-world/` - Legacy Dungeon World control panel

## Development Commands

### ZimboMate V2 (Primary Package)
```bash
cd packages/zimbomate-v2
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run Vitest tests
npm run test:run     # Run tests once
npm run e2e          # Run Playwright end-to-end tests
npm run e2e:ui       # Run Playwright tests with UI
npm run lint         # ESLint with TypeScript support
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
```

### Root Level (if needed)
```bash
npm run dev          # Vite development server (root)
npm run build        # Build (root)
npm run lint         # ESLint (root)
```

## Architecture & Technology Stack

### Core Technologies
- **React 19** - Latest React features and performance
- **TypeScript** - Type safety throughout
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Modern utility-first CSS with custom design system
- **Radix UI** - Accessible component primitives

### Key Dependencies
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **3D Graphics**: React Three Fiber, React Three Drei
- **Animations**: Framer Motion
- **UI Components**: Extensive Radix UI usage
- **Testing**: Vitest (unit), Playwright (e2e), Testing Library
- **Visual Testing**: Argos CI integration

### Design System
- **Theme**: "Cinematic Gaming" with deep space colors and warm gold accents
- **Layout**: Context-driven adaptive workspace
- **Component Architecture**: Modern card-based design with panel system
- **Accessibility**: Keyboard-first design with comprehensive shortcuts

## Project Structure (zimbomate-v2)

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── stores/             # Zustand state stores
├── services/           # API and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── models/             # Data models
└── App.*.tsx          # Multiple app variations/demos
```

## Development Guidelines

### Screenshot Regression Workflow (MANDATORY)

**Before Starting Major Feature Work:**
```bash
# 1. Capture baseline screenshots
cd packages/zimbomate-v2
node baseline-screenshot-capture.js

# 2. Document current state
git add . && git commit -m "Pre-feature baseline: capturing screenshots before [FEATURE_NAME]"
```

**After Completing Feature Implementation:**
```bash
# 1. Run regression test suite
node complete-regression-test.js

# 2. Compare with baseline
# Screenshots will be saved with descriptive names for manual review

# 3. If any regressions found, fix before proceeding
# 4. Update baseline screenshots for new features
```

**Claude Code Reminders:**
- 🚨 **ALWAYS capture screenshots** when implementing features that modify:
  - Character sheet UI/layout
  - Modal systems (level up, dice roller)
  - State management (XP, character data)
  - Navigation or routing
- 📸 **Use real screenshots**, not placeholder data
- 🔍 **Compare with baseline** to catch visual regressions
- ✅ **Document any intentional UI changes** in commit messages

### Component Patterns
- Use TypeScript strictly with proper typing
- Follow existing component architecture and design system
- Maintain keyboard accessibility in all components
- Use established naming conventions for panels and features

### Testing Strategy
- Unit tests with Vitest for logic and components
- End-to-end tests with Playwright for user workflows
- Visual regression testing with Argos CI
- Component testing with Testing Library

### Code Style
- ESLint configuration enforces consistent code style
- Prettier for formatting
- Follow existing patterns in the codebase
- Use the established color palette and spacing system

## Important Files

- `src/App.Complete.tsx` - Primary application entry point
- `src/components/game/creation/` - Character creation components
- `src/components/__tests__/CharacterBuilder.spec.tsx` - Key test file
- Multiple mock data files for development testing

## Advanced Testing Suite

### Screenshot Regression Testing Protocol

**MANDATORY**: Before implementing major features, always run baseline screenshot regression tests to ensure no existing functionality is broken.

#### When to Run Screenshot Tests:
1. **Before Major Feature Development** - Capture baseline state
2. **After Feature Implementation** - Compare against baseline
3. **Before Code Commits** - Verify no regressions introduced
4. **On Pull Request Reviews** - Automated visual validation

#### Critical User Journey Tests:

**Core App Functions:**
```javascript
// 1. App Loading & Character Sheet Display
const appLoadTest = {
  name: 'app-load-character-display',
  steps: ['Load app', 'Wait for character', 'Screenshot full page'],
  expectedElements: ['Character name', 'Stats grid', 'HP/XP bars']
}

// 2. Level Up System (Full Flow)
const levelUpTest = {
  name: 'level-up-complete-flow',
  steps: [
    'Initialize XP store with threshold data',
    'Verify Level Up button appears',
    'Open level up modal',
    'Test stat increase selection',
    'Test move selection (with fallbacks)',
    'Complete level advancement'
  ],
  screenshots: [
    'level-up-button-visible.png',
    'level-up-modal-main.png',
    'stat-increase-selection.png',
    'move-selection-screen.png',
    'level-up-completed.png'
  ]
}

// 3. Dice Rolling System
const diceTest = {
  name: 'dice-rolling-system',
  steps: ['Open dice roller', 'Test 2d6+modifier', 'Verify result display'],
  expectedElements: ['Dice result', 'Modifier calculation', 'Success indication']
}
```

#### Screenshot Testing Tool
When debugging web apps, use the screenshot tool at `./packages/zimbomate-v2/app-screenshot-tester/`:
```bash
# Capture baseline screenshots (run before major changes)
cd packages/zimbomate-v2/app-screenshot-tester
npm run capture -- http://localhost:3000 --duration 3000 --baseline

# Capture regression test screenshots (run after changes)
npm run capture -- http://localhost:3000 --duration 3000 --regression

# Compare baseline vs regression
npm run compare -- baseline-id regression-id

# Analyze captured screenshots
npm run analyze -- ../.claude-screenshots/zimbomate-v2/capture-id
```

#### Manual Regression Test Script
```javascript
// packages/zimbomate-v2/regression-test-suite.js
// Run this script before/after major feature changes
const regressionTests = [
  'app-load-baseline.js',           // Basic app loading
  'character-sheet-display.js',     // Stats, HP, XP display
  'dice-system-functionality.js',   // All dice rolling
  'level-up-complete-flow.js',      // Full advancement system
  'navigation-and-panels.js',       // UI navigation
  'responsive-layout.js'            // Mobile/desktop views
]
```

### Testing Commands
```bash
cd packages/zimbomate-v2

# Unit & Integration Tests
npm run test          # Run all tests in watch mode
npm run test:run       # Run all tests once
npm run test:coverage  # Run with coverage report

# End-to-End Tests
npm run e2e           # Run Playwright E2E tests
npm run e2e:ui        # Run with Playwright UI
npm run e2e:headed    # Run with visible browser

# Accessibility Testing
npm run test:a11y     # Run accessibility tests

# Performance Testing
npm run test:perf     # Bundle size and performance tests
npm run lighthouse    # Lighthouse CI analysis

# Visual Testing
npm run test:visual   # Visual regression with Argos
```

## Notes

- Focus all development efforts on zimbomate-v2 package
- Legacy packages can be ignored for active development
- The app emphasizes gaming aesthetics and premium desktop feel
- Multiple App*.tsx files represent different development stages/experiments
- Comprehensive testing suite includes visual, accessibility, and performance testing