# Chronicle v2 – LLM Unified Rollout Guide

This playbook tracks the rollout of the Chronicle v2 entity-linking and automation enhancements. Use it to coordinate dark launch, QA sign-off, and cost telemetry validation across environments.

## 1. Feature Flags

- `LLM_UNIFIED` (default: `false`)
  - **Purpose:** gates the new automation log surfaces, Chronicle overlay details, and executor plumbing for Phase 2.
  - **Configuration:** set `VITE_LLM_UNIFIED=true` in the web shell or `LLM_UNIFIED=true` in desktop/CI environments. Tests default to enabled when the flag is unset.
  - **Fallback:** when disabled we defer to existing prompt/overlay behaviour without automation summaries.

## 2. Dark Launch Checklist

1. Enable `LLM_UNIFIED` for internal QA tenants only.
2. Run `npm run test`, `npm run test:a11y`, `npm run test:perf`, and `npm run screenshot:analyze` on the candidate build.
3. Verify automation log and overlay hover states with real campaign data; capture screenshots for regression history.
4. Confirm PlayTab automation log remains hidden for non-flagged tenants.
5. Monitor logs for `skipReason` warnings to ensure no unexpected executor skips are occurring.

## 3. Regression Fixtures & Verification

- Chronicle overlay mention chips: `src/components/chronicle/__tests__/ChronicleOverlay.links.test.tsx`
- PlayTab automation gating and application flow: `src/components/game/PlayTab/__tests__/PlayTab.composer.integration.test.tsx`
- Executor idempotency hash & equip conflict handling: `src/services/chronicle/__tests__/deltaExecutor.idempotency.test.ts`

Execute `npm run test --watch=false` before promoting builds. For manual QA, walk through entity linking, equip/unequip undo, and relationship hover cards using the dark launch flag.

## 4. Cost & Telemetry Acceptance

- Record Requests: ensure each applied bundle emits telemetry with latency, usage, and cost (see Phase 4 plan in `docs/LLM_UPGRADE.md`).
- Acceptance criteria:
  - ≥95 % of applied bundles include telemetry events within 5 minutes.
  - Cost per session stays < the budget defined in `LLM_UPGRADE.md` Phase 4.
  - Automation skips must include `metadata.skipReason` for downstream analytics.
- Visualization: the Chronicle overlay’s “Latest Chronicle Update” card now includes a Telemetry panel summarising propose/apply/undo events (latency, spend, model, source) for the active bundle. For dashboards, consume `useChronicleLLM().telemetryEvents` or `useChronicleStore.getState().getTelemetryEvents()` to feed rollout reporting.

## 5. Promotion Steps

1. Flip `LLM_UNIFIED` to `true` for selected beta campaigns.
2. Re-run the automated suite (`npm run test`, `npm run test:a11y`, `npm run test:perf`, `npm run screenshot:analyze`).
3. Obtain QA sign-off with screenshots attached to the release PR.
4. Monitor telemetry dashboards for 24 hours; roll back by setting `LLM_UNIFIED=false` if cost spikes or skipReason rates exceed thresholds.

Keep this document updated as additional rollout toggles or acceptance criteria are defined in later phases.
