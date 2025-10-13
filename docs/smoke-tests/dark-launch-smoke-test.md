# Dark Launch Smoke Test Log — Chronicle GPT-5 Automation

> Use this template each time we validate the dark launch stage before promoting to opt-in. Record evidence (screenshots, telemetry JSON) and attach to the release PR.

| Run Date | Tester | Chronicle Version | Shell (Web/Tauri) | Notes |
| -------- | ------ | ----------------- | ----------------- | ----- |
| YYYY-MM-DD | | | | |

## Environment Setup
- `LLM_UNIFIED=true`
- `LLM_ROLLOUT_STAGE=dark`
- Session cost cap: ¢1 (temporary for guardrail validation)
- Chronicle tenant: ______________________

## Test Steps & Results

| Step | Description | Evidence / Outcome | Pass? |
| ---- | ----------- | ------------------ | ----- |
| 1 | Restart web + desktop shells to ensure flags applied | | ☐/☑ |
| 2 | Submit Chronicle entry; confirm Automation Log shows “Automation disabled” warning and no apply buttons | | ☐/☑ |
| 3 | Trigger guardrail (cap reached) → template narrative, guardrail banner, telemetry event (`stage: guardrail`, `outcome: skipped`) | Attach telemetry JSON or screenshot | ☐/☑ |
| 4 | Flip to `LLM_ROLLOUT_STAGE=opt_in` locally; apply bundle manually, confirm delta history + audit log + telemetry (`stage: apply`, `outcome: success`) | | ☐/☑ |
| 5 | Undo applied bundle; verify sheet reverts, telemetry logs `stage: undo`, `outcome: success`, audit entry recorded | | ☐/☑ |
| 6 | Review Rollout Dashboard counters update; copy JSON buffer for archive | Paste snippet in PR | ☐/☑ |

## Issues & Follow-ups
- [ ] None — ready to proceed.
- [ ] Issues observed (describe and link ticket):

---

**Archive Checklist**
- [ ] Attach telemetry JSON export to release PR.
- [ ] Attach Automation Log screenshot showing guardrail banner.
- [ ] Attach Rollout Dashboard screenshot after undo test.

_Template created 2025-10-12._
