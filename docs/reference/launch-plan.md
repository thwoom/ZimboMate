# Chronicle v2 Launch Plan

Phase 6 packages the GPT-5 automation upgrade for release. This plan aligns engineering, QA, support, and ops so we can promote from dark launch to opt-in and finally default rollout without surprises.

## 1. Launch Timeline & Stage Gating

| Stage | Target Date | Flag Value | Entry Criteria | Exit Criteria |
| ----- | ----------- | ---------- | -------------- | -------------- |
| Dark launch | 2025-10-14 | `LLM_ROLLOUT_STAGE=dark` | All telemetry/guardrail specs green, regenerated Playwright baselines archived, dark launch smoke test signed off | Manual QA confirms template fallback + guardrail telemetry, no blocker bugs in Automation Log |
| Opt-in beta | 2025-10-18 | `LLM_ROLLOUT_STAGE=opt_in` for selected tenants | Opt-in comms sent, support briefed, beta GM acknowledgements recorded | 24 h telemetry review shows <1% guardrail skips, no unresolved Automation Log defects |
| Default | 2025-10-25 | `LLM_ROLLOUT_STAGE=default` | Opt-in KPIs met, cost guardrails tuned, changelog + launch notes published | Ongoing monitoring confirms guardrail spend within budget and undo recovery rate ≥99% |

Keep `LLM_UNIFIED=true` across environments; the flag only gates the legacy overlay experience.

## 2. Automation Log & Telemetry Callouts

- Automation Log cards now show stage/outcome badges, latency, cost, and guardrail context sourced from `recordTelemetry`.
- Undo actions emit `stage: undo` telemetry and clear delta history; QA should capture before/after bundles using the audit export buttons.
- Guardrail hits return template narratives (`guardrail-template` model) and log `stage: guardrail`, `outcome: skipped`; ensure session cost caps are set per tenant before enabling opt-in.
- The rollout dashboard (Settings → System & Performance) must be left pinned in dashboards for on-call monitoring; telemetry history is capped at 200 events with replay support.

## 3. Opt-in Rollout Communications

Primary copy lives in [`chronicle-opt-in-preview`](../comms/chronicle-opt-in-preview.md). Send the announcement 48 h before enabling `LLM_ROLLOUT_STAGE=opt_in` for the beta tenant list. Key reminders:
- Highlight Automation Log improvements (manual apply, telemetry transparency, undo recovery).
- Call out guardrail expectations and point to Settings → Automation Guardrails.
- Direct feedback to `#chronicle-optin` with entry ID + timestamp for telemetry correlation.
- CC Player Success; ensure they have troubleshooting references ([`rollout`](../operations/rollout.md), [`TROUBLESHOOTING`](../reference/TROUBLESHOOTING.md)).

## 4. Dark Launch Smoke Test Checklist

Use the log template at [`dark launch smoke test`](../smoke-tests/dark-launch-smoke-test.md) to capture evidence for each run.

1. Set `LLM_ROLLOUT_STAGE=dark`; restart shell (web + Tauri) to reload.
2. Submit a Chronicle entry and confirm Automation Log shows read-only warning.
3. Set a temporary cost cap (e.g., ¢1) and resubmit entry → verify template fallback narrative, guardrail banner, and guardrail telemetry event.
4. Switch to `opt_in` locally and confirm manual apply works, Automation Log emits telemetry, and undo restores state with proper badges.
5. Review rollout dashboard to ensure events stream, stage/outcome counters update, and JSON copy buffer works.
6. Archive telemetry events (`publishRolloutTelemetry` history) and attach to release PR.

## 5. Documentation Matrix

| Capability | Primary Doc | Notes |
| ---------- | ----------- | ----- |
| Undo recovery | [`rollout`](../operations/rollout.md) §2 & §4 | Dark launch checklist covers apply/undo; Automation Log undo steps recorded here. |
| Telemetry coverage | [`rollout`](../operations/rollout.md) §4, [`CHANGELOG`](../reference/CHANGELOG.md) (2025-10-12) | Details telemetry payload fields, guardrail QA, dashboard replay. |
| Rollout playbook | [`rollout`](../operations/rollout.md), this launch plan | Combined guidance for flags, QA, communications, and monitoring. |

Ensure the PRD ([`LLM_UPGRADE`](../olddocs/LLM_UPGRADE.md)) references this plan in Phase 6 completion notes.

## 6. Owners & Sign-off

- **Eng Lead:** Zimbo — owns flag flips, telemetry monitoring.
- **QA Lead:** Chronicle QA Squad — maintains smoke checklist + baseline verification.
- **Support/Comms:** Player Success Team — owns GM/player messaging and incident response.
- **Approval Checklist:** changelog updated, launch plan published, rollout dashboard monitored, opt-in comms sent, guardrail smoke tests archived.
