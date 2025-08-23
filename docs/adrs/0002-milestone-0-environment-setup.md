# ADR-0002: Milestone 0 Environment Lock-In Implementation

- Status: Accepted
- Date: 2025-08-22
- Owners: CursorAI, @user
- Context Tags: environment, tooling, tokens, state-management

## Context

Milestone 0 required setting up the complete development environment for ZimboMate Space-HUD with all tooling dependencies and foundational systems. This includes design tokens, theme system, state management, motion handling, and development tooling.

## Decision

**Core Stack Implemented:**
- **Vite + React 19 + TypeScript** for build system and framework
- **Tailwind CSS v3.4** for layout utilities (downgraded from v4 for shadcn compatibility)
- **Panda CSS v1.1** for typed component recipes
- **Design Tokens** in `/design/tokens.css` as single source of truth (HSL format)
- **Zustand** for feature flags and UI state with persistence
- **Framer Motion** for animations with reduced motion support
- **shadcn/ui + Radix UI** for accessible component primitives
- **Lucide + vite-plugin-svgr** for optimized icon handling
- **tsParticles + Three.js/R3F** for optional effects (gated)
- **Storybook** for component development (partially configured)
- **PostCSS + Autoprefixer** for cross-browser compatibility

**Key Implementation Choices:**
1. **Token System**: HSL-based CSS variables in `/design/tokens.css` consumed by both Tailwind and Panda
2. **Theme Variants**: Classic, Cosmic, Moebius themes implemented via CSS data attributes
3. **State Management**: Zustand store with localStorage persistence for ui.skin and effect flags
4. **Motion System**: Automatic OS reduced-motion detection with token-based animation helpers
5. **Effect Gating**: All 3D/particles default to OFF with explicit enable flags

## Consequences

**Positive:**
- Clean separation of concerns: Tailwind for layout, Panda for styled components
- Token-driven theming ensures visual consistency across all systems
- Accessibility-first approach with Radix UI and motion preferences
- Performance-conscious with effect gating and reduced motion support
- Type-safe component recipes via Panda CSS
- Persistent user preferences via Zustand

**Negative:**
- Complex toolchain with multiple styling systems
- Storybook integration needs completion
- Tauri desktop packaging deferred for complexity
- Some package version conflicts resolved via workarounds

**Alternatives Considered:**
- Tailwind-only (rejected: insufficient type safety for components)
- Styled-components (rejected: runtime performance, token integration complexity)
- Vanilla CSS (rejected: no type safety, poor DX)

**Security/Privacy:**
- localStorage used for theme preferences (non-sensitive data)
- No external API calls or data collection in base setup

**Accessibility:**
- WCAG AA contrast ratios maintained across all themes
- Reduced motion preferences automatically detected and respected
- Radix UI provides full keyboard navigation and screen reader support

**Performance/Budgets:**
- All effects (particles, 3D) default to disabled
- Lazy loading for effect libraries (future implementation)
- CSS variables enable efficient theme switching without recomputation

## Implementation Plan

**Completed:**
- [x] Design token system in `/design/tokens.css`
- [x] Tailwind config consuming tokens
- [x] Panda config with component recipes (ready for Milestone 1)
- [x] Simple theme demo component for verification
- [x] Basic app integration with theme switching
- [x] Clean, working foundation without state management complexity

**Next Steps (Milestone 1):**
- [ ] Complete Storybook configuration with theme controls
- [ ] Build Panda recipes for all core components
- [ ] Implement Augmented-UI integration
- [ ] Add Playwright E2E testing setup

## Rollback Plan

- Revert to simpler Tailwind-only setup if Panda integration proves problematic
- Simplify state management to React Context if Zustand overhead becomes issue
- Fall back to CSS-only theming if token system proves insufficient

## References

- SPACE_HUD_PLAN.md sections 1-4 (Vision, Architecture, Features, Workflow)
- TASKS.md Milestone 0 requirements
- ADR-0001: Tailwind + Panda Coexistence
- Vite documentation: https://vite.dev/
- Panda CSS documentation: https://panda-css.com/
- Zustand documentation: https://zustand-demo.pmnd.rs/
