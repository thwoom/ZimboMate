# Zimbo Mate LLM Roadmap (PRD v1.1)

Tracking keys: `ZM-LLM-###`

## Epic: Runtime + Router

- ZM-LLM-001 — OpenAI local client
  - Deliverable: `openaiLocalClient` with chat+tools, 3s timeout, single retry, telemetry hooks.
  - Acceptance: Calls local OpenAI-compatible endpoint; emits telemetry; unit tests for timeout/retry.

- ZM-LLM-002 — Router (TOOL/WRITE/BOTH)
  - Deliverable: `router.ts` with `classify()` and `buildPlan()`, ambiguity fallback to WRITE.
  - Acceptance: Test matrix for intents; logs routed decision.

## Epic: Tool Schemas + Runners

- ZM-LLM-010 — Read-only tool schemas (done)
  - Deliverable: `readonlyToolSchemas.ts` + combined helper.
  - Acceptance: Merged.

- ZM-LLM-011 — Read-only tool responses
  - Deliverable: Types `RollMoveResult`, `RollDamageResult`, `GetStateResult` in `types.ts`.
  - Acceptance: Zod parsing round-trips; unit tests.

- ZM-LLM-012 — Tool runner (read-only)
  - Deliverable: Functions to execute `roll_move`, `roll_damage`, `get_state` using local services/stores.
  - Acceptance: Deterministic; no store mutation.

- ZM-LLM-013 — Tool runner (DW mutating)
  - Deliverable: Map DW tool calls → `DeltaOperation[]`; apply via `applyChronicleDeltaBundle`.
  - Acceptance: Operation parity; integration tests for HP/XP/inventory.

## Epic: Orchestration in Chronicle

- ZM-LLM-020 — Feature flag and wiring
  - Deliverable: `LLM_RUNTIME=local|tauri` branch in `ChronicleProvider`.
  - Acceptance: Toggle swaps paths; GPT‑5 fallback intact.

- ZM-LLM-021 — BOTH flow (tool→apply→state_delta→narrate)
  - Deliverable: Sequence in provider; narration after apply only.
  - Acceptance: State_delta present; errors surface warnings.

- ZM-LLM-022 — Guardrails (cost/offline/invalid)
  - Deliverable: On tool failure → no mutation; narration failure → keep state + template prose.
  - Acceptance: Tests per failure mode.

## Epic: Last Breath Hook

- ZM-LLM-030 — Executor trigger
  - Deliverable: When HP ≤ 0, record audit + telemetry flag.
  - Acceptance: Fires once per crossing; no extra mutation.

- ZM-LLM-031 — Prompt seed
  - Deliverable: Action listener seeds high-priority `last_breath` prompt.
  - Acceptance: Visible, dismissible.

## Epic: Telemetry + KPIs

- ZM-LLM-040 — Telemetry events
  - Deliverable: Per-stage events (router/tool/apply/narration) with `latency_ms`, `schema_valid`, `retry_count`, `fallback_reason`, `model`.
  - Acceptance: Appears in `chronicleStore.getTelemetryEvents()`; unit tests.

- ZM-LLM-041 — KPI calculators
  - Deliverable: Helpers for Schema Validity, Double-Exec, P95 tool latency, Fallback rate.
  - Acceptance: Deterministic with fixtures.

## Epic: UI Integration

- ZM-LLM-050 — Dock/Overlay deltas + narration
  - Deliverable: Show tool results + attached narration.
  - Acceptance: UX review; a11y preserved.

- ZM-LLM-051 — Health indicators
  - Deliverable: Local runtime status (connected/initializing/offline), fallback badges.
  - Acceptance: Clear transitions; no console errors.

## Epic: Tests

- ZM-LLM-060 — Acceptance tests (PRD v1.1)
  - Deliverable: Flows for Hack & Slash, damage to zero, miss→mark_xp, ammo/inventory, idempotency.
  - Acceptance: Green locally; stable repeat.

- ZM-LLM-061 — Idempotency tests
  - Deliverable: Same apply payload returns same bundle id; no double-apply.
  - Acceptance: Verified via `deltaHistory` and `appliedOps`.

## Epic: Docs

- ZM-LLM-070 — Developer guide
  - Deliverable: Setup local endpoint, flags, router overview, tool mapping, failure modes.
  - Acceptance: New dev can run local stack and pass acceptance tests.

