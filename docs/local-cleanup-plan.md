# Lean Local-Only Cleanup Plan
Goal: simplify for offline, single-user play; remove unused AI/multiplayer/session complexity without losing core sheet/secretary/game tools.

## Checklist

1) Strip session/multiplayer features
- [ ] Remove SessionManager component and any mounts/imports.
- [ ] Delete session timers/bookmarks code (SessionToolsPanel timers tab, TimersWidget, timer/bookmark state in sessionStore).
- [ ] Prune session stats/formatters from campaign overview and store (session counts, avg duration).
- [ ] Remove session-related commands/tooltips/copy (CommandPalette, help text).

2) Remove AI/Chronicle/LLM remnants
- [ ] Delete Chronicle/LLM provider stubs and services (adminCredentials, llm_service, embedded_runtime files) if no future AI.
- [ ] Drop AdminOpenAISettings or replace with static  offline card; remove menu entry if unused.
- [ ] Remove capability/rollout/feature-flag plumbing (useCapabilities, logging) and mode switching if always sheet-only.
- [ ] Remove LLM scripts/assets/docs (start-local-llm scripts, LLM PRDs).

3) Simplify boot/startup
- [ ] Remove boot/bootTasks dynamic imports for modules already statically imported (CharacterBuilder, PlayTab, GameManagementTab, SessionManager).
- [ ] Option: replace BootProvider/LoadingGate with direct AppRoot render (if no staged boot needed).

4) Campaign store/model tightening
- [ ] Drop campaign sessions array/CRUD/stats; keep journal/NPC/location only.
- [ ] Remove SessionHistory/SessionModal components and hooks; clean imports.
- [ ] Update mock data helpers to remove session duration formatting.

5) UI alignment to local-only
- [ ] Remove MultiplayerService, types, and any references.
- [ ] Clean CommandPalette entries that mention Chronicle/AI/sessions/multiplayer.
- [ ] Ensure headers/tooltips reference local/offline only.

6) Dependency & asset pruning
- [ ] Remove unused deps from package.json (OpenAI/LLM, websockets/multiplayer, rollout/telemetry tied to AI).
- [ ] Delete unused assets/docs (Chronicle/LLM PRDs, embedded engine binaries).
- [ ] Re-run lockfile after pruning.

7) Tests & fixtures
- [ ] Delete tests covering removed features (button-debug, timers, session history, Chronicle/LLM).
- [ ] Update visual/screenshot scripts to cover only Play/Character/Game Management/Settings.

8) Final pass & verification
- [ ] Run 
pm run lint && npm run build -- --analyze to confirm no stray imports; resolve chunk warnings.
- [ ] Smoke-test Play, Character, Game Management, Settings; secretary quick capture, quick monsters, dice tools.
- [ ] Confirm no UI strings mention Chronicle/LLM/Multiplayer/Session timers.

## Notes
- Prioritize items that reduce bundle size and startup (sessions, boot tasks, LLM deps).
- Keep secretary + campaign/journal/monsters + dice as the core experience.
