# Changelog

All notable changes to the Chronicle v2 automation upgrade are documented here.

## 2025-10-12 — Chronicle v2 GPT-5 automation rollout

### Added
- Unified GPT-5 Responses pipeline for propose/apply/undo, with Automation Log status badges and undo recovery wired to telemetry events.
- Session cost guardrails that emit `guardrail` stage telemetry, return template narratives when budgets are exhausted, and surface budget warnings in Settings → Automation Guardrails.
- Rollout dashboard panel (Settings → System & Performance) powered by `publishRolloutTelemetry`/`subscribeRolloutTelemetry`, showing live stage/outcome counts, latency averages, spend, and replay history.

### Changed
- Automation Log entries now include stage, latency, cost, and guardrail context, and the Chronicle overlay streams telemetry to the Settings rollout dashboard.
- Rollout documentation details dark/opt-in/default gating (`LLM_ROLLOUT_STAGE`), guardrail QA, and dashboard integration for ops visibility.

### Operations Notes
- Launch sequencing: keep `LLM_ROLLOUT_STAGE=dark` until beta smoke tests pass, flip to `opt_in` for targeted campaigns, then advance to `default` once guardrail telemetry remains green for 24 h.
- Before toggling to `opt_in`, confirm `npm run test`, `npm run screenshot`, and `npm run screenshot:analyze` all pass and archive the regenerated Settings tab baseline (`tests/e2e/visual/theme-visual.spec.ts-snapshots/settings-tab-Desktop-Chrome-win32.png`).
- Notify beta tables using the Opt-In Comms template in [`launch-plan`](./launch-plan.md) and include Automation Log highlights plus cost guardrail expectations.

## 2025-10-05 — Chronicle overlay foundations

### Added
- Chronicle overlay checklist, entity linking, and virtualization upgrades that underpin the Automation Log experience.
- Playwright visual baselines for Matsu theme (Play, Character, Dice, Game Management, Settings, Button Debug tabs).

### Changed
- Settings panel refreshed with theme + accessibility tooling, preparing the space for rollout dashboards and guardrail controls.
