Product Requirements Document (PRD)

Project: Chronicle v2 - Dungeon World + GPT-5 Unified
Owner: Zimbo
Author: (Assistant)
Status: Draft -> Review -> Build
Target Release: Next minor (vX.Y) with phased rollout
Companion Spec: See `docs/DW_ASSISTANT_APP.md` for the full assistant feature set that builds on this automation effort.
Next Steps After LLM Upgrade: Transition to the level-up workflow roadmap (`docs/level-up-roadmap.md`).

1. Vision & Problem Statement

Vision. Chronicle is the table’s historian and assistant: it captures every meaningful Dungeon World event in rich prose and keeps the character sheet perfectly in sync—no bookkeeping, no missed XP on a 6‑, no lost loot.
Problem. Today, Chronicle generates prompts and records entries, but state sync from free‑form text is partial and LLM usage isn’t unified. We will standardize on GPT‑5 via the Responses API, leverage function calling + structured outputs to transform any chronicle note (AI‑generated or user‑typed) into authoritative, idempotent game-state deltas.

Non‑goal: The AI does not run the game. It never dictates outcomes. It drafts narrative and proposes precise updates; the GM/players stay in control.

2. Scope
   In‑scope

Unify all LLM usage on GPT‑5 Responses (no other providers or SDKs).

Chronicle overlay & panel upgrades to:

generate DW‑flavored narrative,

parse free‑form notes, and

apply sheet updates via function calls (loot, HP, XP, Bonds, Debilities, Hold, Ammo, Coin, Tags/Conditions, Moves, Level ups, Flags, Fronts, NPC relations, Locations, Quests).

End‑to‑end idempotent, auditable state‑delta pipeline.

DW‑specific move outcomes (10+ / 7–9 / 6‑) awareness and suggestions.

Entity linking (@character, @npc, @location) with auto‑creation.

Settings to control auto‑apply vs confirm, tone, verbosity, and cost limits.

Out‑of‑scope

Running combats or acting as GM.

Non‑Dungeon‑World systems (e.g., D&D 5e).

3. Personas & Key Jobs

GM (primary) — Wants narrative capture, auto bookkeeping, and consistency.

Player (primary) — Wants to type what happened in plain English and have the sheet reflect it without digging into UI menus.

Table Historian / Scribe (secondary) — Wants a cohesive timeline + wiki.

Top jobs to be done

“When I type ‘I take 4 damage from the ogre’, my HP drops by 4 immediately.”

“When the dice roll is 6‑, mark 1 XP and draft a fitting GM move.”

“When I write ‘loot: Ancient Sword (close, +1 damage)’, the item shows up on my inventory with tags.”

“When I say ‘we bond over saving Lysa’, a Bond draft appears with correct character refs.”

“I can always review & undo any automatic update.”

4. Success Metrics

Coverage: ≥95% of user notes that imply a delta result in the correct function call(s).

Latency (P95): ≤1.8s to proposed deltas; ≤3.0s to applied + saved.

Accuracy: ≤1% erroneous deltas accepted (post‑confirmation).

Adoption: ≥80% sessions have ≥1 auto‑applied update.

Cost: ≤$X/session with guardrails (configurable).

5. User Stories & Acceptance Criteria

Auto‑HP Adjust

Given a note “Kara takes 3 damage”, then a apply_damage(character='Kara', amount=3, source='…') call is produced and (if auto‑apply ON) HP decreases by 3.

AC: HP updated, delta logged, entry cross‑linked to Kara.

Miss (6‑) -> Mark XP

Given a roll result 6‑, then Chronicle proposes mark_xp(character, amount=1) and a failure‑tone narrative, with optional GM move seed.

AC: XP +1, narrative reflects failure, timeline stamped with roll context.

Loot Extraction

Given a note “Alice picks up Ancient Sword (close, +1dmg)”, then add_item + add_item_tag calls created.

AC: inventory shows item and tags; entity @Ancient Sword page exists.

Bond Management

Given “Thorne forms a bond with Lysa: I owe her my life”, then add_bond is created.

AC: Bond saved to Thorne; cross‑link to @Lysa.

Debility & Conditions

Given “I’m shaky after the fall”, then add_debility(character='…', type='Shaky').

AC: debility listed; affects rolls UI as configured.

Spell Casting / Hold / Ammo

“Cast Magic Missile; spend 1 Ammo” -> spend_ammo(character, amount=1);

“I hold 2 from Trap Expert” -> mark_hold(move='Trap Expert', amount=2).

Undo / Auditability

Every applied delta is reversible from the entry drawer.

AC: “Undo” restores previous sheet state; audit log shows who/when/what.

6. Functional Requirements
   6.1 LLM Unification (MUST)

All LLM calls route through a single GPT‑5 Responses client with:

Function calling (aka tool calling) for state deltas.
OpenAI Help Center

Structured outputs with strict: true in function/tool schemas for argument validity.
OpenAI

Optional JSON mode for non‑tool structured responses.
OpenAI Help Center

Support for parallel tool calls where safe (e.g., add_item + add_item_tag).
OpenAI Platform

If you previously used Chat Completions/Assistants, migrate to Responses API shapes.
OpenAI Platform

6.2 Chronicle Event -> Narrative + Deltas

For each trigger (dice, equipment, combat, free‑form note), the pipeline:

builds a DW context block (party, location, last 5 entries, current HP/XP/flags, move/result if any);

calls GPT‑5 with system and developer instructions tailored to DW tone;

receives (a) a short narrative suggestion and (b) function calls encoding deltas;

applies deltas (auto or with confirmation), then saves narrative + delta bundle.

6.3 Free‑form Parsing

Any user text in the Chronicle composer or overlay is parsed for implicit deltas (HP, inventory, XP, debilities, bonds, hold, ammo, coin, level‑up, flags, fronts/threads, NPC attitude, location discovery, quest start/advance/complete).

Ambiguity -> propose with checkboxes; otherwise auto‑apply.

6.4 Entity Graph & Wiki

@mentions create/resolve entities. Chronicle entries store back‑refs to entities; wiki pages roll up facts (derived from deltas) and appearances (timeline snippets).

6.5 DW Move Semantics

Use 10+ / 7–9 / 6‑ patterns in prompts, with complication seeds on 7–9 and GM move seeds on 6‑ (never prescriptive).

6.6 Controls & Settings

Auto‑apply policy (On/Confirm/Off), per‑delta type.

Chronicle auto-equip toggle (default off; only triggers when a weapon-tagged delta lands in an empty slot; always undoable).

Narrative tone (gritty/heroic/terse), verbosity (short/long).

Cost guardrails (daily cap; graceful degrade to templates if exceeded).

Privacy redactions for streamed/telemetry text.

7. Non‑Functional Requirements

Reliability: Structured outputs (strict: true) for all tool calls; retries with backoff; idempotency tokens per delta.
OpenAI

Latency: P95 ≤1.8s propose; ≤3.0s apply & save.

Observability: Trace each request, tool call, and applied delta; diff previews; user‑visible audit log.

Security: Secret management; PII redaction; encrypted storage of history.

Resilience: Template fallback when LLM unavailable; queued application of deltas.

8. Architecture & Code Touchpoints

Your current files (as you listed) are the anchor points. Below is the integration plan per area.

8.1 Components & Context

src/components/chronicle/ChronicleProvider.tsx

Centralize the GPT‑5 client + feature flag here.

Provide a chronicle.applyDeltaBundle() that receives validated tool calls and persists them atomically (with idempotency).

src/components/chronicle/ChronicleOverlay.tsx

Expand the overlay card to show narrative suggestion + delta checklist.

“Apply” -> executes delta bundle; “Edit” -> open entry composer with structured deltas.

8.2 Gameplay Surfaces

Dice Roller / Stat Roller

Emit a unified MoveEvent with move name, stat, roll, total, and result bucket.

Invoke GPT‑5 for narrative + deltas: miss -> mark_xp(1) proposal; partial -> complication seed; success -> clean resolution.

Equipment Panel

On use/equip/unequip/acquire, pass event to Chronicle; let GPT‑5:

enrich narrative, and

confirm/add item & tags (e.g., close, messy, +1 damage).

PlayTab (ContextualActionZone / QuickActionBar / SmartContextPanel / LiveChronicleStream)

Add “Parse & Apply” on any free‑form note.

Live stream shows applied deltas inline (e.g., −3 HP (ogre), +Ancient Sword).

WikiView / Timeline

Timeline entries display the delta capsule (chips for HP, XP, Items, Bonds, etc.).

Entities show facts computed from the latest state (e.g., “Alice has Ancient Sword; Debility: Shaky”).

8.3 Services

ChronicleActionListenerService.ts

Normalize all gameplay events -> ChronicleEvent.

Call GPT‑5 with context; receive tool calls; forward to applyDeltaBundle.

ChronicleContextIntelligence.ts

Provide pre‑LLM context: situation (combat/explore/social), intensity, recent tone, present entities.

ChronicleTemplateService.ts

Becomes fallback renderer if LLM off/capped; otherwise used to render concise summaries from applied deltas.

8.4 State & Utilities

chronicleStore.ts

Add pendingDeltaBundle, applyDeltaBundle, undoDelta, auditLog.

Store idempotencyKey per bundle; persist applied deltas with hash.

types/chronicle.ts

Define ChronicleEvent, DeltaOp, DeltaBundle, EntityRef, LinkRef.

DW taxonomies (Moves, Debilities, Tags).

chronicleParser.ts

Keep lightweight rules (regex for @mentions, item syntax, dice text).

LLM takes over semantic extraction; the parser prepares hints.

9. Data Model Additions
   9.1 DeltaOps (atomic updates)

apply_damage { characterId, amount, source? }

heal { characterId, amount, source? }

mark_xp { characterId, amount }

level_up { characterId, newLevel, picks: MovePick[] | StatIncreases[] }

add_item { characterId, item: { name, tags?: string[], quantity?: number, notes?: string } }

remove_item { characterId, itemId }

equip_item { characterId, itemId }

unequip_item { characterId, itemId }

add_item_tag { itemId, tag }

spend_ammo { characterId, amount }

mark_hold { characterId, moveName, amount }

spend_hold { characterId, moveName, amount }

add_debility { characterId, type: 'Sick'|'Stunned'|'Shaky'|'Scarred'|'Confused'|'Weakened' }

remove_debility { characterId, type }

add_bond { fromCharacterId, toCharacterId, text }

resolve_bond { fromCharacterId, toCharacterId, xpAward?: number }

add_flag { characterId, text }

add_coin { characterId, amount }

add_note { entityId?, text } (non‑mechanical narrative pin)

create_entity { type, displayName } (NPC, Location, Item, Faction, Front)

link_entity { fromId, toId, relation }

DeltaBundle = { idempotencyKey, ops: DeltaOp[], sourceEntryId?, createdAt }.

10. GPT‑5 Responses API Integration
    10.1 Model & Transport

Model: gpt‑5‑responses (text‑only).

Transport: Responses API with tools (function calling), structured outputs (strict: true), optional parallel tool calls when safe.
OpenAI
+2
OpenAI Platform
+2

10.2 System & Developer Instructions (high‑level)

System: “You are the Chronicle assistant for a Dungeon World game. You never control the game, you draft concise narrative and produce exact function calls for any mechanical changes.”

Developer: Provide DW rules gist (10+/7‑9/6‑), debilities list, common tags, and important: only propose deltas that are unambiguous; otherwise ask for confirmation fields.

10.3 Tool (Function) Schemas (excerpt)

All functions use Structured Outputs with strict: true so arguments always match the JSON Schema.
OpenAI

{
"type": "function",
"function": {
"name": "apply_damage",
"description": "Decrease current HP. Amount must be positive.",
"strict": true,
"parameters": {
"type": "object",
"properties": {
"characterId": {"type": "string", "minLength": 1},
"amount": {"type": "integer", "minimum": 1},
"source": {"type": "string"}
},
"required": ["characterId", "amount"],
"additionalProperties": false
}
}
}

Analogous definitions: heal, mark_xp, add_item, add_item_tag, equip_item, unequip_item, spend_ammo, mark_hold, add_bond, add_debility, level_up, etc.

Note: JSON mode keeps outputs valid JSON; Structured Outputs (+ strict:true) ensures schema‑correct arguments for tool calls.
OpenAI Help Center
+1

10.4 Parallel Tool Calls

Enable for independent ops (e.g., add_item + multiple add_item_tag calls). Serialize where order matters (e.g., create item -> then equip).
OpenAI Platform

10.5 Idempotency & Safety

Include idempotencyKey (hash of entryId + normalized ops) in each bundle.

Confirm before destructive ops if “Confirm mode” is on.

Refusals / safety: detect via standard response fields; fallback to template narrative only.
OpenAI

10.6 Migration Checklist (Unification)

Search for and remove/disable any other LLM clients (Anthropic, legacy Chat Completions wrappers, experimental SDKs).

Create /services/llm/gpt5Client.ts (single entrypoint).

Replace all narrative/parse calls to route through gpt5Client with Responses API shape and tools list.

Feature flag: LLM_UNIFIED=on for dark‑launch; metric compares old vs new outputs (shadow only).

11. UX Requirements
    11.1 Overlay Card

Shows Narrative (1–3 sentences, DW tone) and Proposed Updates (checklist of deltas).

Primary CTA: Apply (or Apply All); Secondary: Edit (opens full editor), Dismiss.

Show micro‑diffs: e.g., HP 18 -> 15, +Ancient Sword.

11.2 Chronicle Composer

Rich text editor with entity autocomplete (@Alice, #AncientSword).

“Parse & Propose” -> shows delta chips; users can toggle items before apply.

11.3 Timeline + Wiki

Each entry displays applied delta chips and links to entities.

Entity pages show facts (derived from latest state), debilities, bonds, gear, and appearances.

11.4 Settings

Auto‑apply policy per delta type; optional auto-equip weapons when the destination slot is free (default off, per player); tone; verbosity; cost cap; “Template fallback” toggle.

11.5 Automation Log

Automation Log card sits below Recent Story and lists the five most recent GPT-5 bundles (timestamp, entry id, applied/skipped counts). Each bundle expands to show Dungeon World copy for applied ops, a skipped section when relevant, and controls: Undo (runs the delta executor rollback with a spinner and surfaces an error toast on failure) and Dismiss (removes the log entry without touching character state). History trims at 50 entries per campaign, persists across sessions, and Settings exposes a "Clear Automation Log" action to wipe it entirely.

12. Telemetry & Observability

Log: request id, model, token usage, latency, tool calls emitted, ops applied, user confirmation result.

Metrics: Coverage, Accuracy, Latency, Cost, Undo rate, “false‑positive” flagged ops.

Tracing: Span per GPT request and per tool call; attach entry and entity ids.

13. Risks & Mitigations

Over‑eager updates -> confirmation mode + per‑type toggles; “undo” everywhere.

Ambiguity in free‑form -> require confirmations; ask clarifying checkboxes.

LLM drift -> strict schemas; regression tests with canned narratives.

Latency spikes -> cache context, trim history, parallelize safe ops.

Cost overruns -> model tokens budget, cap per session, template fallback.

14. Rollout Plan

Phase 0 (Dark): Route events through GPT-5, surface read-only Automation Log with Dismiss only (no apply/undo), and validate delta payload quality.

Phase 0.1 (Matsu Folio): Ship the sheet-first Folio split view with inline counters wiring directly into the Chronicle delta executor.

- Add shared layout primitives (`SplitPane`, `RightRail`, `Gutter`) so the Folio and Chronicle surfaces share a responsive two-pane shell.
- Replace the legacy `CharacterSheet` with `Folio.tsx` pages (stats, gear, spells, bonds, notes) and widget library (inline counters, slot grid, quick note popover, move chips).
- Ensure inline HP/XP/Ammo adjustments emit GPT-5 delta bundles (damage, heal, mark_xp, spend_ammo) with undo support; gear slot changes emit equip/unequip bundles.
- Virtualize long gear/spell/hold lists with `@tanstack/react-virtual`; memoize Folio selectors and Chronicle provider values to stay under the 100 ms interaction target.
- Chronicle composer highlights the matching Folio tab (stats/gear/spells/notes) when entity mentions or keyword cues appear; PlayTab flashes transient highlights on successful note/equipment actions.
- Update Playwright snapshots and widget unit tests (InlineCounters, SlotGrid, QuickNotePopover) to cover the Folio interactions.

Phase 1 (Opt-in): Enable apply with confirmation for GM accounts; Automation Log unlocks Undo + Dismiss and emits telemetry for rollback success/fail.

Phase 2 (Default): Auto‑apply “safe” ops (XP on miss, inventory adds, ammo/hold) while keeping Automation Log + Undo for every bundle.

Legacy removal: Delete old LLM clients and templates after parity confirmed.

15. QA Plan: Representative Test Cases

“I take 4 damage” -> apply_damage(4); narrative notes source if known.

“Loot the Ancient Sword (close, +1 damage)” -> add_item + two add_item_tag ops; then equip_item if phrase includes “equip”.

“Missed my Hack & Slash (6‑)” -> mark_xp(1) + failure narrative seed.

“Hold 2 on Trap Expert, then spend 1” -> mark_hold(2), spend_hold(1).

“Form a bond with Lysa: I owe her my life” -> add_bond.

“I’m Shaky from the fall” -> add_debility('Shaky').

“Level up to 3; take Merciless” -> level_up(newLevel=3, picks=[{move:'Merciless'}]).

“Auto-equip toggle ON; loot the Fallen Blade” -> add_item + add_item_tag + equip_item emitted automatically; undo splits drop vs equip so either can be rolled back independently.

"Automation Log shows latest bundle with Undo + Dismiss"  apply bundle, verify log entry (timestamp, counts), run Undo to restore HP/inventory/hold, Dismiss to remove entry, Clear Automation Log wipes history.

Undo flow validated for each case.

16. Open Questions

Resolved 2025-10-02 — Auto-equip on weapon pickups stays default-off; add a per-player toggle “Auto-equip weapons when slot is free,” limit to weapon-tagged deltas with empty slots, surface explicit undo entries, and log equip separately from acquisition.

Should “coin” be a simple numeric or a weight + coin split for encumbrance?

NPC attitude scale (friendly -> hostile) as a first‑class delta?

Bonds: prompt to resolve old bonds automatically when new ones are created?

17. Engineering Notes (Implementation Detail)
    17.1 GPT‑5 Client

Single client module wrapping Responses API; includes:

Tool schema registry (all DeltaOps), always strict: true.

Request builder that truncates history to fit token budget.

Parallel tool‑call handler (dependency‑aware execution: create -> tag -> equip).
OpenAI Platform

JSON‑mode helper for non‑tool structured replies (summaries, bullets).
OpenAI Help Center

17.2 Idempotency & Atomicity\n\n**2025-10-02 update:** Chronicle delta executor now applies Dungeon World core ops in-app (damage, healing, XP, coin, inventory, debilities, hold, ammo, bonds) with idempotent undo. Entity linking history and advanced inventory slotting now capture relationship timelines and slot-hint-aware inventory placement. PlayTab now surfaces an automation log with per-bundle undo controls for GMs.

**2025-10-07 update:** Chronicle store tracks pending delta bundles and audit history with undo metadata. Overlay and panel surface Tauri guard messaging, pending bundle progress, and expandable audit log status chips so GMs know when automations are queued or applied. Added unit coverage for the new store state and the provider lifecycle.

**2025-10-07 PlayTab polish:** PlayTab automation log adopts shared badge/button variants for status chips and actions, mirrors the Tauri guard messaging used in the overlay/panel, and ships targeted tests for undo, dismiss, and guard dismissal flows.
**2025-10-08 composer integration:** Added a PlayTab composer integration spec that exercises GPT-5 narrative summaries against the shared DeltaChecklist descriptions, verifies manual apply -> automation log undo parity, and reconfirmed the Matsu visual baselines (no diffs).

Compute idempotencyKey = sha256(entryId + stableSerialize(ops)).

Store bundle + ops transactionally; prevent duplicate applies.

“Undo” stores inverse ops automatically (e.g., heal for damage, remove for add).

17.3 Templates as Fallback

If API quota/timeout/refusal, render minimal DW‑tone text via ChronicleTemplateService, and enqueue a parse retry if configured.

17.4 Application scaffolding

Auth and Theme providers now expose dedicated contexts (`AuthContext`, `ThemeContext`) with test coverage so Chronicle surfaces can gate auto-apply features for authenticated GMs without pulling legacy exports. Shared testing utilities wrap stories in the new providers.

18. DW Prompting Snippets (Illustrative)

System (excerpt):
“You are Chronicle, assisting a Dungeon World game. Use the game’s fiction-first ethos: on a 10+ clean success; on 7–9 include a meaningful cost, compromise, or worse outcome; on 6‑ it’s a miss—suggest a GM hard move seed. Do not control outcomes. Generate concise narrative (≤3 sentences). For any mechanical change you detect, emit tool calls using the registered functions. If ambiguous, ask for confirmation fields.”

Developer (guardrails):

Only emit deltas that the text clearly implies.

Prefer add_item + add_item_tag over dumping raw strings.

Always mark_xp(1) on a 6‑ roll for player characters.

Recognize DW debilities: Sick, Stunned, Shaky, Scarred, Confused, Weakened.

Respect entity mentions (@Alice, @Lysa, @OldTower); create as needed.

19. Compliance with OpenAI Capabilities (References)

Structured Outputs (strict: true) ensure tool call args conform to schema.
OpenAI

Function/Tool Calling for multi‑step flows and external updates.
OpenAI Help Center

JSON mode and schema guidance (when not using tools).
OpenAI Help Center

Parallel tool calls guidance for when multiple calls are appropriate.
OpenAI Platform

Migration to Responses API (shape differences and recommendation to standardize).
OpenAI Platform

20. “No Competing LLMs” Checklist (Actionable)

grep -R for openai, anthropic, claude, vertexai, groq, ollama, openrouter, legacy ChatCompletion wrappers. Remove or route all to /services/llm/gpt5Client.ts.

Remove unused API keys/secrets and CI secrets.

Delete unused prompt templates or adapters; keep only fallback templates.

One config surface for: model name, rate limits, cost caps, safety settings.

One tool schema registry for DeltaOps; unit tests validate strict JSON Schema.

21. Execution Runbook

Phase 1 - Chronicle Surface Polish (PRD Sec 11.2–11.5)

**2025-10-05 update:**
\n**2025-10-06 update:** Overlay + automation log layout adjustments ensure footer-safe scrolling; ChronicleProvider now guards Tauri listeners so web shell stays error-free; automation cards respect viewport height.
Phase 1 UI polish is landed. Composer checklist now mirrors the audit drawers, overlay prompts surface Dungeon World move citations alongside proposed deltas, and the automation log exposes the promised "Clear Automation Log" action. PlayTab + overlay undo flows were exercised against the richer delta descriptions to confirm entry → apply → undo parity.

Remaining verification before sign-off:

- Regenerate Playwright visual baselines for the refreshed checklist + automation log styles. ✅ `npm run screenshot` + `npm run screenshot:analyze` succeeded on 2025-10-09.

Phase 2 - Delta Pipeline Extensions (PRD Sec 8, TODOs #5–6, Sec 17.2)

- Implement entity linking + mention updates.
- Complete equip/unequip, XP/bond/hold undo logging.
- Harden idempotency checks for bundles.
  **2025-10-05 design snapshot:** Entity mentions now capture context and inferred type metadata, resource ledgers track HP and coin alongside XP/Bonds/Hold, and bundle idempotency falls back to the entry id when the LLM omits an explicit key. Chronicle store exposes retrieval helpers for the new ledgers so overlay + audit drawers can surface the data in Phase 2 UI work.

**2025-10-07 update:** Chronicle store now tracks pending delta bundles and an audit log; apply/undo flows log entries with actors, and HP/Coin ledgers participate in undo cleanup.

**2025-10-07 late update:** Chronicle panel/entity drawers now consume the shared highlight utilities (actor badges, mention chips) and wiki timeline surfaces actor labels + mention context. Delta executor regression suite covers XP/Bond/Hold logging, hold bundles, equip undo, and idempotent bundle replay.

**2025-10-08 plan:** Break Phase 2 into delivery-ready slices:

- Delta Schema & Registry: finalize `link_entity` argument typing, extend the tool schema registry with relation metadata, and backfill JSON Schema tests under `src/services/llm/__tests__/toolSchemas.test.ts`.
- Chronicle Store Wiring: introduce dedicated selectors for entity link lookups, persist audit log actor metadata, and ensure undo flows reconcile HP/Coin ledgers after parallel operations.
- Delta Executor: harden idempotency filters by hashing normalized ops + entity ids, cover equip/unequip conflict resolution, and surface descriptive errors back to the Automation Log.
- UI Touchpoints: wire the entity chip hover states in `ChronicleOverlay` and `WikiTimeline`, and gate new automation cards behind `LLM_UNIFIED` until the bundle smoke tests pass.
- QA & Verification: add regression fixtures for entity linking scenarios, extend the PlayTab integration spec to assert mention chips, and run `npm run test` + `npm run screenshot:analyze` before merging.
- Rollout Prep: draft the dark-launch checklist, document the entity-linking toggle in `docs/rollout.md`, and capture cost telemetry acceptance criteria for Phase 4.

**2025-10-08 progress:** Chronicle overlay and wiki views now surface linked entity metadata via `getLinkedEntities`, the accessibility/performance Playwright suites run through dedicated configs (`playwright.a11y.config.ts`, `playwright.perf.config.ts`) with smoke tests in place, and the `link_entity` tool schema plus delta executor fingerprinting/equip conflict handling have been hardened for Phase 2.

**2025-10-09 update:** Link_entity automation now writes relationship history events and entity mentions record slot-aware inventory placement via slot hints; add_item honours container/equip hints for Folio so bundle replays stay idempotent.

Phase 3 - Store Hardening & Settings (PRD Sec 6, Sec 12)

- Expand stores with apply/undo helpers and history logging.
- Wire settings for log clear, auto-equip defaults, cost guardrails.
- Snapshot state before/after bundle apply for QA.

**2025-10-09 Phase 3 update:** Chronicle store now records session LLM spend with exportable automation history helpers (bundle snapshot pair selectors + JSON export), and the Settings panel exposes guardrail controls: cost caps trigger template fallbacks with overlay messaging, session spend can be reset, and QA can copy the latest before/after snapshot directly.

**2025-10-10 completion:** Store lifecycle helpers now emit pending and failure records (including `recordBundleFailure`) so automation history, audit trails, and undo wiring stay in sync; Chronicle overlay/panel surface status badges and failure messaging; undo is scoped to applied bundles; and QA can retain before/after snapshots for failed bundles without manual cleanup.

Phase 4 - Telemetry, Cost & Rollout Rails (PRD Sec 12, Sec 14, Sec 17.2, Sec 19-20)

- Emit success/failure telemetry for apply/undo with latency + cost.
- Enforce session budgets and dark-launch -> opt-in -> default flags.
- Document toggles and deployment steps in scripts + PRD.
  **2025-10-08 progress:** Telemetry now covers propose/apply/undo paths with rollout stage tags, session cost guardrails block GPT-5 calls when budgets are exhausted (returning a template fallback narrative), and the new `LLM_ROLLOUT_STAGE` flag coordinates dark/opt-in/default automation behaviour across the UI and executor.
  **2025-10-11 kickoff:** Phase 4 officially in motion. Verifying the apply/undo telemetry payloads now persist bundle latency, stage, outcome, and cost across both the Tauri emitter and ChronicleProvider state, backfilling unit coverage around `recordTelemetry`. Drafting the dark-launch playbook: documenting how `LLM_ROLLOUT_STAGE` gates auto-apply/undo in `docs/rollout.md`, and outlining the session budget guardrail QA checklist before we flip `opt_in` on.
  **2025-10-11 telemetry UI:** Chronicle overlay surfaces per-entry telemetry (stage, latency, and spend) from the new store log, and `useChronicleLLM().telemetryEvents` exposes the same feed so rollout dashboards can chart automation health alongside session budgets.
  **2025-10-11 bridge sync:** The Tauri `llm_telemetry` channel now emits structured payloads with `stage`, `outcome`, `entryId`, and usage so ChronicleProvider logs cost and latency consistently. Guardrail skips emit `stage: guardrail` + `outcome: skipped`, `recordTelemetry` tags their source, and `docs/rollout.md` captures the flag/QA matrix for `LLM_ROLLOUT_STAGE` and cost caps.
  **2025-10-12 guardrail QA:** Verified guardrail telemetry end-to-end. Unit suite (`src/components/chronicle/__tests__/ChronicleProvider.llm.test.tsx`) covers the skip/failure path, and manual checklist confirms the desktop shell clears the bridge warning and surfaces the new telemetry fields.
  **2025-10-12 rollout dashboards:** Added `publishRolloutTelemetry`/`subscribeRolloutTelemetry` utilities (`src/utils/rolloutTelemetry.ts`) so ops dashboards can ingest the feed or listen for the `chronicle-telemetry` window event. History is capped (200) and replay-ready for rapid QA.

Phase 5 - Test & Visual Pass (PRD Sec 15)

- Add executor/tool-schema unit specs and PlayTab integration tests.
- Refresh Playwright snapshots after UI work.
- Maintain zero ESLint warning baseline (verified 2025-10-05); rerun npm run lint on each pass.
- Re-run npm run test, npm run screenshot:analyze, npm run lint:fix.
  **2025-10-09 QA update:** Added slot-hint-aware tool schema assertions, extended the PlayTab composer integration spec to cover mention highlights, and reran `npm run lint:fix`, `npm run test`, `npm run screenshot`, and `npm run screenshot:analyze`. TooltipProvider now renders correctly in Vitest, Playwright visual runs complete without timing out on the theme banner, and the project lints clean with zero outstanding warnings.

Phase 6 - Release Packaging (PRD Sec 20, Appendices)

- Update changelog and launch plan with Automation Log notes.
- Prepare opt-in rollout comms and smoke-test dark launch flags.
- Confirm docs capture undo recovery, telemetry, and rollout playbook.

Status Snapshot

- Phase 0.1: Complete (Matsu Folio split pane, inline counters, virtualized gear/spell lists live as of 2025-10-05).
- Phase 1: Complete (composer checklist + overlay citations landed 2025-10-05; Playwright baseline + integration spec follow-ups tracked in Phase 5).
- Phase 2: Complete (entity linking history + slot-hint inventory placement landed 2025-10-09).
- Phase 3: Complete (pending/failure logging + status-aware overlays landed 2025-10-10).
- Phase 4: In progress (kickoff 2025-10-11; telemetry coverage + rollout rail docs underway).
- Phases 5-6: Planned; follow Phase 4 telemetry/docs handoff.

Appendix A — Minimal Tool Schema Set (starter)

Core: apply_damage, heal, mark_xp, add_item, remove_item, add_item_tag, equip_item, unequip_item, level_up

DW Tracks: spend_ammo, mark_hold, spend_hold

Narrative Flags: add_debility, remove_debility, add_bond, resolve_bond, add_flag

World: create_entity, link_entity, add_note, add_coin

Appendix B — Example Response (conceptual)

User note: “Orc’s axe bites deep—Thorne takes 3 damage. I grab the Fallen’s Blade (close, messy) and press on.”

LLM tool calls produced:

apply_damage({ characterId:'Thorne', amount:3, source:'orc axe' })

add_item({ characterId:'Thorne', item:{ name:'Fallen’s Blade' } })

add_item_tag({ itemId:'<ref: Fallen’s Blade>', tag:'close' })

add_item_tag({ itemId:'<ref: Fallen’s Blade>', tag:'messy' })
