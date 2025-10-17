# Chronicle v2 Release Checklist (Phase 6)

Use this list to track the final actions before promoting the GPT-5 automation upgrade to production.

## 1. Artifacts & Documentation
- [ ] Update [`CHANGELOG`](../reference/CHANGELOG.md) with any last-minute fixes or messaging tweaks.
- [ ] Capture dark launch smoke test evidence using the [`dark launch smoke test` template](../smoke-tests/dark-launch-smoke-test.md) and attach to the release PR.
- [ ] Add the opt-in announcement schedule + recipients to the release PR description (link to [`chronicle-opt-in-preview`](../comms/chronicle-opt-in-preview.md)).
- [ ] Ensure [`launch-plan`](../reference/launch-plan.md) reflects actual dates/owners for dark → opt-in → default flips.

## 2. QA & Telemetry
- [ ] Verify guardrail telemetry feed via the rollout dashboard after smoke test (stage/outcome counters, latency averages).
- [ ] Confirm `src/components/chronicle/__tests__/ChronicleProvider.llm.test.tsx` and related suites ran within the last 24 h (`pnpm run test`).
- [ ] Check Playwright baseline artifacts (`tests/e2e/visual/...`) are committed post `pnpm run screenshot`.

## 3. Flag Management
- [ ] Prepare environment configs for:
  - Dark launch: `LLM_ROLLOUT_STAGE=dark`
  - Opt-in beta tenants: per-tenant overrides in staging/production config
  - Default rollout: plan switch date/time after telemetry sign-off
- [ ] Draft rollback plan (set `LLM_ROLLOUT_STAGE=dark` + revert tenant overrides) and include in release PR.

## 4. Communications
- [ ] Send opt-in preview (48 h before flip) using the comms doc.
- [ ] Prep “default rollout” notice for broader audience (can reuse opt-in copy, highlight auto-apply enablement).
- [ ] Brief Player Success and Support on troubleshooting references.

## 5. Approvals & Launch Window
- [ ] Engineering lead sign-off
- [ ] QA lead sign-off
- [ ] Support/Comms sign-off
- [ ] Schedule launch window; ensure on-call coverage for first 24 h of opt-in and default stages.

Tick each box and link supporting evidence before merging the release PR. _Created 2025-10-12._
