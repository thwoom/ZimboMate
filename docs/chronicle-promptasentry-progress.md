# Chronicle Prompt-as-Entry Progress Log

**Last updated:** October 18, 2025

## Completed
- Added prompt lifecycle fields (`status`, `origin`, `actionContext`, `errorReason`, `promptMetadata`, `pendingBundle`) to `ChronicleEntry`.
- Implemented store helpers (`createPromptEntry`, `updateEntryText`, `setEntryStatus`, `findEntryByRollId`) and prompt tag derivation.
- Refactored `ChronicleActionListenerService` to create store-backed prompt entries, attach metadata, and log prompt telemetry.
- Extended `ChronicleProvider` with prompt submission/dismiss flows bound to entry IDs, telemetry logging, delta history updates, and overlay gating via `uiMode`.
- Added new UI components: `ChronicleComposer` and `ChronicleDock` with prompt lifecycle wiring, manual note composer, and apply/undo plumbing.
- Mounted `ChronicleDock` into the Play tab right rail, removed the legacy prompt state, and updated Chronicle overlay usage to respect `chronicle.settings.uiMode` + store-backed entries.
- Stabilised Chronicle Dock & PlayTab automation tests (store-backed mocks, re-enabled undo/dismiss coverage) and retired the pending Vitest skips.
- Overlay prompt feeds now use store selectors end-to-end; uiMode toggles (dock/overlay) are covered by Chronicle Dock integration Vitest on October 18, 2025.
- Chronicle Dock surfaces automation failures + mention callouts and routes dismissals through guard-railed analytics (Vitest regression suite on October 18, 2025).
- Dock interaction analytics now flow through `publishChronicleDockInteraction`, capturing session/uiMode metadata and dismiss reasons for downstream dashboards (chronicle-dock-interaction event bus, October 18, 2025).
- Chronicle overlay prompt/feed logic now pulls entirely from store selectors with Vitest coverage for `uiMode` gating (dock hidden, overlay/both enabled) on October 18, 2025.
- Public README updated on October 18, 2025 with dock-first workflow guidance, overlay opt-out instructions, analytics bus details, and targeted test commands.
- Manual Chronicle notes now auto-run through the prompt-as-entry pipeline so automation (HP/resource deltas, callouts) fire without needing the floating overlay (October 19, 2025).
- Chronicle Dock header now shows live GPT connectivity (Connected/Initializing/Offline), gates manual auto-enhancement when offline, and surfaces inline success/failure messaging with retry for manual notes (October 19, 2025).
- Admin OpenAI settings expose bridge diagnostics (presence, last heartbeat, last error) and propagate bridge write failures to the UI instead of silently persisting locally (October 19, 2025).
- Full suite green on October 18, 2025 via `npx vitest --run`.

## In Progress

## Outstanding Tasks
- None

## Latest Validation
- `npx vitest --run src/utils/__tests__/chronicleDockTelemetry.test.ts src/stores/__tests__/chronicle.promptEntry.test.ts src/components/chronicle/__tests__/ChronicleDock.integration.test.tsx src/components/chronicle/__tests__/ChronicleOverlay.links.test.tsx` (October 18, 2025) - Targeted suite green.
