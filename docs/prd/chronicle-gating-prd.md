# PRD: Gate Chronicle Behind a Mode Selector (Sheet‑Only Default)

- Doc ID: CG-PRD-001
- Version: 1.0
- Status: Draft for review
- Owner: Product/Eng (you)
- Date: 2025‑10‑29

## 1) Overview
Create a first‑run and settings‑driven “Mode Selector” that gates the Chronicle AI system behind an explicit opt‑in. The base experience becomes a fast, offline, character‑sheet‑first app with dice and campaign tools—no Chronicle UI and no LLM initialization—until the user chooses Chronicle+.

## 2) Goals (Objectives)
- G1. Default to “Sheet‑Only” mode: character sheet + dice + tools without any Chronicle UI or AI runtime.
- G2. Provide a single selector to enable “Chronicle+” on demand (reversible, zero data loss).
- G3. Never initialize LLM or show Chronicle UI when Sheet‑Only is active.
- G4. Reduce initial bundle size for Sheet‑Only via code splitting of Chronicle features.
- G5. Maintain one codebase; gating is runtime‑controlled and testable with flags.
- G6. Preserve existing stores/data; users can switch modes at any time.

## 3) Non‑Goals
- N1. Rewriting Chronicle or dice systems.
- N2. Adding new external services or auth flows.
- N3. Changing game rules, data schemas, or save formats beyond what gating requires.

## 4) Personas & Primary Use Cases
- P1. GM/Player who wants offline sheet + dice speed with zero AI cost or noise.
  - UC1: Launch app and land in Sheet‑Only without seeing Chronicle elements.
  - UC2: Roll dice and manage sheet quickly; no AI prompts/telemetry.
- P2. Storyteller who wants Chronicle features when ready.
  - UC3: Switch to Chronicle+ from Settings or first‑run selector; immediately see Chronicle UI.
  - UC4: If desktop bridge (Tauri) is missing, see a clear “Connect desktop bridge” guidance—no silent failures.
- P3. QA/Dev
  - UC5: Verify gating with feature flags and automated tests without touching production data.

## 5) User Experience (UX) & Flows
- First Run: show `ModeSelector` with two cards.
  - Sheet‑Only: “Ink & Steel — Fast, focused, offline.” (default)
  - Chronicle+: “Spark & Quill — Your intelligent scribe.” (notes on cost/Tauri requirement)
- Header Badge: subtle mode indicator with quick “Switch Mode” action.
- Settings Panel: Chronicle section locked in Sheet‑Only with CTA to switch.
- PlayTab: no Chronicle dock/overlay in Sheet‑Only; show tasteful upgrade tile.
- Game Management: hide Chronicle tab in Sheet‑Only; default to Campaign.
- Error/Empty States: if Chronicle+ chosen without Tauri bridge, show connect flow instead of trying to initialize.

## 6) Functional Requirements (Traceable)
- CG-REQ-F01: Persisted mode store
  - A persisted `appModeStore` exposes `mode: 'sheet-only' | 'chronicle'`, hydrates from localStorage key `zimbo.appMode`, defaulting to `sheet-only`.
- CG-REQ-F02: Capabilities oracle
  - `useCapabilities()` returns: `hasChronicleUI`, `llmAllowed`, `canApplyAutomation`, `canUndoAutomation` derived from `appModeStore` and `featureFlags`.
- CG-REQ-F03: Provider gating
  - In Sheet‑Only, Chronicle must not initialize listeners nor call `invoke('initialize_llm', ...)`.
  - Acceptable approaches: pass `defaultEnabled={false}` with rollout `'dark'` OR mount a `NullChronicleProvider` that no‑ops APIs.
- CG-REQ-F04: UI gating
  - PlayTab renders Chronicle dock/overlay only if `hasChronicleUI`.
  - GameManagement hides Chronicle tab entirely in Sheet‑Only.
  - Settings shows Chronicle section as locked in Sheet‑Only with CTA.
  - Dice integrations (e.g., `ChronicleEnabledDiceRoller`) fall back to non‑Chronicle components in Sheet‑Only.
- CG-REQ-F05: Code splitting
  - Chronicle panels/dock dynamically imported and only requested when `hasChronicleUI` is true.
- CG-REQ-F06: Switch behavior
  - Switching modes is instantaneous without data loss; app reflects changes without hard reload where possible.
- CG-REQ-F07: Telemetry snapshot
  - On boot emit a lightweight “capabilities_snapshot” event (dev only by default) with: `{ mode, hasChronicleUI, llmAllowed, rolloutStage }`.
- CG-REQ-F08: Budget UI
  - Hide AI budget/usage UI in Sheet‑Only; restore it in Chronicle+.
- CG-REQ-F09: Desktop bridge guard
  - If Chronicle+ is selected but no Tauri bridge, show connect instructions; do not attempt LLM calls.

## 7) Non‑Functional Requirements
- CG-REQ-NF01: Performance
  - Sheet‑Only First Load: keep JS < current baseline by excluding Chronicle chunk. Target: ≥15% smaller vs. pre‑gating main bundle.
- CG-REQ-NF02: Accessibility
  - ModeSelector keyboard navigable; WCAG‑AA color contrast; ARIA labels on mode cards and lock states.
- CG-REQ-NF03: Offline‑first
  - Sheet‑Only runs fully without network/bridge.
- CG-REQ-NF04: Security/Privacy
  - No LLM key or usage exposed in Sheet‑Only; never send telemetry outside local dev unless feature is enabled.

## 8) Architecture & Key Touchpoints
- New: `src/stores/appModeStore.ts` (persisted store).
- New: `src/hooks/useCapabilities.ts` (capability oracle).
- Bootstrap: `src/main.tsx` -> an `App.Root` that shows `ModeSelector` until mode is set, then mounts `App.SheetOnly` or `App.Complete`.
- Gating:
  - `src/App.Complete.tsx`: gate Chronicle provider props and visibility via `useCapabilities()`.
  - `src/components/game/PlayTab.tsx`: hide `<ChronicleDock />` in Sheet‑Only.
  - `src/components/game/GameManagementTab.tsx`: hide Chronicle tab in Sheet‑Only.
  - `src/components/game/StatRoller.tsx`, `src/components/game/PlayTab/ContextualActionZone.tsx`: choose dice components accordingly.
  - `src/components/ui/SettingsPanel.tsx`: lock Chronicle section.
- Optional: `NullChronicleProvider` exporting same hooks but no‑ops.
- Code splitting: dynamic imports for Chronicle UI and tool schemas when `hasChronicleUI`.

## 9) Data Model
- `AppMode = 'sheet-only' | 'chronicle'`
- Local storage key: `zimbo.appMode`
- Store shape: `{ mode, setMode, isFirstRun, setFirstRunCompleted }`.

## 10) Build Flags
- `VITE_MODE` (optional): `sheet-only | chronicle | auto` (default `auto`).
- `VITE_LLM_ROLLOUT_STAGE` remains respected but cannot override `sheet-only` hard disable.

## 11) Rollout Plan
- Phase 0 (Dev): Implement gating and tests. Default to Sheet‑Only in dev.
- Phase 1 (Canary): Enable selector for 10% of internal users; collect perf deltas.
- Phase 2 (Wide): Ship selector to all; Chronicle remains opt‑in.

## 12) Success Metrics
- M1: ≥80% of first runs choose Sheet‑Only initially.
- M2: ≥15% initial bundle size reduction for Sheet‑Only path.
- M3: 0 LLM init calls observed in Sheet‑Only sessions.
- M4: <1% gating regressions reported (missing/hanging UI or accidental LLM init).

## 13) Risks & Mitigations
- R1: Hidden Chronicle causing user confusion → Prominent but tasteful “Upgrade to Chronicle+” affordances.
- R2: Lazy import timing glitches → Preload hints when user hovers Chronicle toggle.
- R3: State divergence across providers → Prefer single provider with `defaultEnabled={false}` plus capability guard; test aggressively.

## 14) Acceptance Criteria (AC)
- AC1: Fresh install lands in Sheet‑Only with no Chronicle UI, no LLM init.
- AC2: Switching to Chronicle+ reveals Chronicle tabs, dock, and overlay; does not hard refresh app.
- AC3: In Sheet‑Only, `gpt5Client` never registers listeners nor calls `invoke('initialize_llm', ...)`.
- AC4: Code splitting verified: Chronicle chunk not requested until Chronicle+ is active.
- AC5: Settings Chronicle section shows lock/CTA in Sheet‑Only.
- AC6: Game Management defaults to Campaign when Chronicle is off.

## 15) QA Plan & Test Cases
- Unit/Component (Vitest/RTL):
  - T1: App in Sheet‑Only → assert Chronicle components absent; dice components present.
  - T2: App in Chronicle+ → Chronicle dock present; dice integrations active.
  - T3: Settings Chronicle card locked in Sheet‑Only.
  - T4: Capabilities snapshot fires once on mount (dev only).
- Integration:
  - T5: Toggle mode → immediate UI change; no reload; no console errors.
  - T6: Chronicle+ without Tauri → connect flow shown; no `initialize_llm`.
- Perf:
  - T7: Lighthouse/Bundle analysis shows Chronicle chunk excluded in Sheet‑Only path.

## 16) Work Breakdown & Progress Checklist
- Store & Capabilities
  - [ ] CG-TASK-01: Add `appModeStore` with persistence.
  - [ ] CG-TASK-02: Add `useCapabilities` and unit tests.
- Bootstrap & Selector
  - [ ] CG-TASK-03: Add `App.Root` to orchestrate first‑run and mode mount.
  - [ ] CG-TASK-04: Implement `ModeSelector` (first‑run screen + Settings CTA).
- Provider & Gating
  - [ ] CG-TASK-05: Gate `ChronicleProvider` via capabilities (no‑op in Sheet‑Only).
  - [ ] CG-TASK-06: Ensure `gpt5Client` listeners/init never run in Sheet‑Only.
- UI Surfaces
  - [ ] CG-TASK-07: PlayTab hide dock; show upgrade tile.
  - [ ] CG-TASK-08: GameManagement hide Chronicle tab; default to Campaign.
  - [ ] CG-TASK-09: Dice integrations fall back to non‑Chronicle components.
  - [ ] CG-TASK-10: Settings Chronicle card lock/CTA.
- Code Splitting & Flags
  - [ ] CG-TASK-11: Dynamic import Chronicle UI; verify chunking.
  - [ ] CG-TASK-12: Optional `VITE_MODE` support.
- Observability & Docs
  - [ ] CG-TASK-13: Capabilities snapshot event (dev). 
  - [ ] CG-TASK-14: Update README and in‑app help.
- Tests
  - [ ] CG-TASK-15: Unit tests for capabilities and mode switching.
  - [ ] CG-TASK-16: Integration tests for gating behavior.
  - [ ] CG-TASK-17: Perf assertion (no Chronicle chunk in Sheet‑Only path).

## 17) “Keep Bots Focused” Rules (Implementation Guardrails)
- Scope & Boundaries
  - RB1: Do not change files outside the following without explicit approval: `src/main.tsx`, `src/App*.tsx`, `src/components/game/PlayTab*.tsx`, `src/components/game/GameManagementTab.tsx`, `src/components/ui/SettingsPanel.tsx`, `src/components/game/*Dice*`, `src/components/chronicle/*`, `src/stores/*`, `src/hooks/*`, `src/utils/featureFlags.ts`.
  - RB2: All gating decisions must flow through `useCapabilities()`; do not scatter ad‑hoc env checks.
  - RB3: Never call `invoke('initialize_llm', ...)` or register `gpt5Client` listeners when `mode === 'sheet-only'`.
  - RB4: Do not import Chronicle UI at module top level in Sheet‑Only code paths; use dynamic imports behind capability checks.
  - RB5: No new dependencies without owner approval.
- Coding Standards
  - RB6: Keep changes minimal and localized; match existing patterns and styling.
  - RB7: Write tests alongside changes; don’t disable existing tests.
  - RB8: Maintain type safety; no `any` unless justified in code comments.
- Definition of Done (per PR)
  - [ ] DOD-1: All relevant tasks in section 16 checked.
  - [ ] DOD-2: Unit tests for changed modules pass locally.
  - [ ] DOD-3: No Chronicle UI mounted and no LLM init in Sheet‑Only.
  - [ ] DOD-4: Lazy chunks verified via devtools or bundle stats.
  - [ ] DOD-5: Accessibility of ModeSelector verified (keyboard + labels).
  - [ ] DOD-6: Updated docs (README/help) with mode explanation.
- Ask‑Before‑Proceed Triggers
  - RB9: Any proposal to modify store schemas, add new providers, or change public component APIs.
  - RB10: Any change that affects telemetry/analytics endpoints or privacy posture.

## 18) Open Questions
- OQ1: Should we expose mode on the URL for deep links (e.g., `?mode=chronicle`)? Default: no.
- OQ2: Do we want a one‑time “What’s Chronicle+?” tour after enabling? Default: yes, but deferred.

## 19) Appendix A — File Map
- New: `src/stores/appModeStore.ts`
- New: `src/hooks/useCapabilities.ts`
- New: `src/components/ui/ModeSelector.tsx`
- Modify: `src/main.tsx` → `App.Root` boot logic
- Modify: `src/App.Complete.tsx` → provider gating
- Modify: `src/components/game/PlayTab.tsx` → dock/overlay gating
- Modify: `src/components/game/GameManagementTab.tsx` → Chronicle tab gating
- Modify: `src/components/game/StatRoller.tsx` & `src/components/game/PlayTab/ContextualActionZone.tsx` → dice fallback
- Modify: `src/components/ui/SettingsPanel.tsx` → locked panel + CTA

---

This PRD is the source of truth for gating Chronicle behind a selector. All future work should reference requirement IDs and update the checklist above.

