# Chronicle Automation Log – Opt-In Preview (GM Announcement)

## Audience
- Dungeon World campaign GMs participating in the opt-in beta (wave 1).
- CC: Player Success support alias for follow-up.

## Delivery
- Send via in-app notification + email no later than 48 hours before enabling `LLM_ROLLOUT_STAGE=opt_in` for the tenant set.
- Reference ticket: OPS-chronicle-optin-2025-10-18.

## Message Copy

**Subject:** Chronicle Automation Log — Opt-In Preview  
**Preheader:** Manual apply/undo with telemetry insights is ready for early access.

Hi crew,

Chronicle’s Automation Log just graduated! Your table is invited to opt in to the upgraded GPT-5 workflow starting **October 18, 2025**. Here’s what to expect:

- **Narrative + Deltas together:** GPT-5 now drafts Dungeon World moves and proposes exact sheet updates in one pass. The Automation Log shows every operation alongside narrative context.
- **Manual control first:** During opt-in the system defaults to *manual* apply/undo. You decide when a bundle lands on the sheet. Auto-apply will remain disabled until we hit “default” rollout.
- **Cost guardrails built in:** Session budgets respect the Automation Guardrail you set in **Settings → Automation Guardrails**. If a cap is reached, Chronicle falls back to a template narrative and logs a `guardrail` event so you can investigate.
- **Latency & spend transparency:** Each entry now tracks stage, latency, and estimated cost. You can monitor live metrics from **Settings → System & Performance → Rollout Dashboard**.
- **Undo on demand:** If a bundle doesn’t look right, undo it directly from the Automation Log. Chronicle restores the previous state and records the action for audit history.

### Getting Started
1. Open **Settings → Automation Guardrails** and confirm your session budget.
2. Review the new **Rollout Dashboard** panel for live telemetry and cost visibility.
3. Capture feedback in the `#chronicle-optin` channel (include the Automation Log entry ID and timestamp so we can correlate telemetry).

### Support & Feedback
- Player Success is briefed on the rollout; ping them via in-app support or Slack `#player-success`.
- Known issues, mitigation tips, and guardrail troubleshooting live in [`TROUBLESHOOTING`](../reference/TROUBLESHOOTING.md).

Thanks for helping us polish the automation rails. We’ll monitor telemetry for 24 hours; if everything stays green we’ll propose enabling auto-apply for your table.

— Chronicle Team

---

## Support Reply Template

**Scenario:** GM reports template fallback during opt-in.

1. Check tenant guardrail setting (`Settings → Automation Guardrails`) and confirm spend vs cap.
2. Review `publishRolloutTelemetry` history (Settings → System & Performance → Rollout Dashboard → Copy JSON) for `stage: guardrail` events.
3. If the cap was hit:
   - Acknowledge the budget guardrail did its job.
   - Suggest raising the cap or resetting the session spend.
  - Provide link to [`TROUBLESHOOTING`](../reference/TROUBLESHOOTING.md#automation-guardrail).
4. If cap was not hit, escalate with telemetry payload to Engineering (include entryId, bundleId, timestamp).

**Reply snippet:**
> Looks like Chronicle hit your session guardrail for entry `{entryId}` at `{timestamp}`. The system swapped in the template narrative and logged a `guardrail` event so you didn’t incur additional spend. You can raise or reset the cap under Settings → Automation Guardrails; once adjusted, Chronicle will resume normal GPT-5 calls.

---

## Change Log
- **2025-10-12:** Initial draft for opt-in wave 1.
