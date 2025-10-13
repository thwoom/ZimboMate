# Chronicle v2 – LLM Unified Rollout Guide

This playbook tracks the rollout of the Chronicle v2 entity-linking and automation enhancements. Use it to coordinate dark launch, QA sign-off, and cost telemetry validation across environments.

## 1. Feature Flags

- `LLM_UNIFIED` (default: `false`)
  - **Purpose:** gates the new automation log surfaces, Chronicle overlay details, and executor plumbing for Phase 2.
  - **Configuration:** set `VITE_LLM_UNIFIED=true` in the web shell or `LLM_UNIFIED=true` in desktop/CI environments. Tests default to enabled when the flag is unset.
  - **Fallback:** when disabled we defer to existing prompt/overlay behaviour without automation summaries.
- `LLM_ROLLOUT_STAGE` (default: `dark`)
  - **Purpose:** coordinates automation behaviour across the overlay, delta executor, and undo tooling for the phased launch.
  - **Values:** `dark` (read-only automation, no apply/undo), `opt_in` (manual apply/undo available, auto-apply disabled), `default` (auto-apply enabled wherever policies allow).
  - **Configuration:** set `VITE_LLM_ROLLOUT_STAGE` in the web shell or `LLM_ROLLOUT_STAGE` for desktop/CI. The Chronicle provider reads the flag on startup; restart the shell after changing it.
  - **Guardrails:** the overlay surfaces an “Automation disabled” warning whenever `dark` is active, and `recordTelemetry` logs an `apply` failure telemetry event if apply is attempted while read-only.

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

- Record Requests: ensure each GPT-5 propose/apply/undo path emits telemetry with latency, usage, stage, outcome, entry/bundle identifiers, and cost (see Phase 4 plan in `docs/olddocs/LLM_UPGRADE.md`).
- Telemetry payload (from the `llm_telemetry` channel) now includes:
  - `model`, `latencyMs`, and `usage` (input/output/total tokens)
  - `stage` ∈ {`propose`, `apply`, `undo`, `guardrail`}
  - `outcome` ∈ {`success`, `failure`, `skipped`}
  - `entryId` and, when available, `bundleId`
  - `costCents` (computed client-side) and optional `error`
  - `source` (`tauri` events originate from the bridge; `client` events are emitted by Chronicle UI flows)
- Acceptance criteria:
  - ≥95 % of propose/apply/undo operations record telemetry within 5 minutes of completion.
  - Sessions stay under the `settings.costCapCents` budget defined in `docs/olddocs/LLM_UPGRADE.md` Phase 4. When the cap is reached, telemetry must include a `stage: guardrail` event and the overlay should surface the budget warning.
  - Guardrail skips add `metadata.skipReason` through the delta executor and log `outcome: skipped` telemetry entries for downstream analytics.
- Visualization & QA steps:
  1. Chronicle overlay’s “Latest Chronicle Update” card surfaces per-bundle telemetry (stage, outcome, latency, spend, model, source). Confirm the panel shows the `guardrail` stage after forcing a budget hit.
  2. Use `useChronicleLLM().telemetryEvents` or `useChronicleStore.getState().getTelemetryEvents()` to feed rollout dashboards; verify the feed includes the stage/outcome updates above.
  3. To exercise the cost guardrail, set a temporary cap (e.g., 1¢) via Settings → Automation Guardrails, submit a note, and confirm:
     - Propose path returns the template fallback narrative.
     - Telemetry logs a `guardrail`/`skipped` event with `entryId`.
     - `sessionCostCents` stops incrementing once the guardrail engages.
  4. The in-app rollout dashboard now lives under Settings → System & Performance. It consumes `publishRolloutTelemetry`, surfaces stage/outcome counts, latency averages, spend, and a live feed. External dashboards can still listen for the `chronicle-telemetry` custom event on `window` or subscribe to `subscribeRolloutTelemetry` for callbacks and history replay (see `src/utils/rolloutTelemetry.ts`).
  **2025-10-12 QA log:** Guardrail checklist executed in desktop shell; the overlay updated live with `guardrail` stage telemetry after the cap was hit, and unit suite `npm run test -- src/components/chronicle/__tests__/ChronicleProvider.llm.test.tsx` passed locally.

## 5. Promotion Steps

1. Flip `LLM_UNIFIED` to `true` for selected beta campaigns.
2. Re-run the automated suite (`npm run test`, `npm run test:a11y`, `npm run test:perf`, `npm run screenshot:analyze`).
3. Obtain QA sign-off with screenshots attached to the release PR.
4. Monitor telemetry dashboards for 24 hours; roll back by setting `LLM_UNIFIED=false` if cost spikes or skipReason rates exceed thresholds.

Keep this document updated as additional rollout toggles or acceptance criteria are defined in later phases.

## 6. Communications & References

- Launch sequencing, opt-in messaging templates, and dark launch smoke tests live in `docs/launch-plan.md`.
- Automation Log release notes and operations reminders are tracked in `CHANGELOG.md` (see 2025-10-12 entry).
- Support teams should bookmark `docs/TROUBLESHOOTING.md` for guardrail template fallbacks and undo recovery FAQs.
