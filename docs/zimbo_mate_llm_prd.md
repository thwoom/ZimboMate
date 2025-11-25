# PRD — Zimbo Mate (Local-First, Tool-Centric)

**Doc owner:** Dan (Director of Farming @ Farm.One)  
**Version:** 1.1  
**Decision deadline:** 2 weeks from approval  
**Environment:** Server-side GPU (preferred), dev laptops acceptable (quantized)  
**Primary goals:**  
1. Deterministic, low-latency **tool calling** for gameplay state changes (dice, HP, status).  
2. Clean separation between **rules engine** (tools + Qwen3-Instruct) and **narrator** (creative model).  
3. Minimal app changes from ChatGPT Tools API → fully offline, embedded inference.

Additions (v1.1):
- Idempotency enforced on apply; duplicates must be no-ops and logged.
- When HP crosses to ≤ 0 during `apply_damage`, emit a non-mutating trigger `last_breath_required=true` in audit/telemetry so a future move can pick it up.
- "Hack & Slash (STR+2)": `roll_move` → outcome 10+ → `roll_damage` → `apply_damage(enemy)`; narration after apply.
- "I got hurt for five points": `apply_damage(target=pc, amount=5)` reduces HP; if HP ≤ 0, emit Last Breath trigger.
- Miss on any move: ensure `mark_xp(+1)` occurs (model call or enforced by orchestration) and appears in resource history.
- Consumable use: `spend_ammo(amount)` decrements; or `remove_item(item_id)` reduces inventory; warn on load overflow.
- Idempotency: re-submit the same apply payload → no double-apply; same bundle id returned.
---

## Change Log (v1.1)

- Adopt richer Dungeon World (DW) tool catalog aligned to existing Chronicle delta operations; replace generic inventory tool with granular ops.
- Define router decision rules for `TOOL | WRITE | BOTH`, including ambiguity handling and safe defaults.
- Specify end-to-end orchestration: tool → validate → apply → derive `state_delta` → narration (voice model never mutates state).
- Clarify resilience: 3s timeout + single retry; deterministic fallbacks for tool and narration failures; idempotency enforcement.
- Add Last Breath trigger hook when HP ≤ 0 (non-mutating signal for a future flow).
- Expand telemetry and KPI definitions (schema validity, duplicates, P95 latency, fallback rate) and update acceptance tests accordingly.

## 1. Background & Rationale

- **Why local?** Control, cost, offline reliability, and predictable tool behavior.  
- **Why Qwen3-Instruct?** The current **Qwen3-Instruct-2507** line ships open-weights under **Apache-2.0**, offers long contexts (up to **256K**), and explicitly targets **agent/tool use** with first-party guidance and a maintained **Qwen-Agent** framework.  
- **Why split models?** One model handles **facts & actions** (tools); the other handles **style & voice** (narration). This reduces hallucinations in state changes and keeps prose high-quality.

---

## 2. Scope

### In
- Replace ChatGPT Cloud calls with an embedded llama.cpp runtime (default Qwen + Mistral GGUFs; heavier rigs can opt into external runtimes if they exist).
- First-class **tool calling** for:
  - `roll_dice(sides, count?)`
  - `adjust_hp(character_id, delta)`
  - `get_state(character_id)`
- Add a **voice model** (local or cloud) for narration only.

### Out (for now)
- Vision input, speech, streaming TTS.  
- Complex multi-agent or GM behaviors.

---

## 3. Success Metrics (first 30 days)

- **Tool Call Accuracy:** ≥ 98% valid JSON arguments (schema validation).  
- **Double-execution rate:** ≤ 0.5% (idempotency guarding).  
- **P95 latency (micro-turns):** ≤ 2.5s on production GPU for dice/HP turns.  
- **Fallback rate to cloud:** ≤ 3% of turns.

---

## 4. Users & Primary Use Cases

- **Player:** “Roll a d20.” → dice result + one-line confirmation.  
- **Player:** “I got hurt for five points.” → `adjust_hp(delta:-5)` + new HP + short narration.  
- **Player:** “Show my current HP.” → `get_state` call returning character state.

---

## 5. Functional Requirements

### 5.1 Tooling Contract (Authoritative)
Provide tools to the model with **strict JSON Schemas** (Chronicle’s internal tool schema).

Authoritative DW mutation tools (mapped 1:1 to Chronicle delta executor):

- `apply_damage` → HP decrease
- `heal` → HP increase (capped at max)
- `mark_xp` → XP gain
- `level_up` → DW level-up flow (+ optional move picks)
- `add_debility` / `remove_debility` → status/debility changes
- Inventory: `add_item`, `remove_item`, `equip_item`, `unequip_item`, `add_item_tag`, `spend_ammo`
- Bonds/Hold: `add_bond`, `resolve_bond`, `mark_hold`, `spend_hold`
- World graph: `create_entity`, `link_entity`, `add_note`

Read-only tools (non-mutating, for facts and dice):

- `get_state(character_id)` → authoritative snapshot for `{hp,xp,statuses,inventory,load,...}`
- `roll_move(character, move, stat, modifier)` → returns 2d6+mod result and outcome tier
- `roll_damage(die, bonus?)` → returns damage roll breakdown

Rules:
- When a state change is requested, **call tools first**; no narration before tool returns.  
- Never invent state; call `get_state` if uncertain.  
- HP ≤ 0 triggers a *Last Breath* sequence (future support).

### 5.2 Routing (Model Roles)
- **Router:** classification step returns one of `TOOL | WRITE | BOTH` via guided choice.  
- If `TOOL`: call **Qwen3-Instruct** with tools enabled.  
- If `WRITE`: call **voice model** (no tools).  
- If `BOTH`: execute tool first, then feed results to voice model.

### 5.3 Narration
- Voice model receives only: `user_input`, `state_delta`, and `current_state`.  
- It **never** mutates state or calls tools.  
- Returns 1-3 sentences.

### 5.4 Router Decision Rules (v1.1)

- Default to `BOTH` for any mutating intent (damage/heal/xp/level/status/inventory/bonds/hold/entity links).
- Use `TOOL` for read-only queries (state lookups, dice-only requests).
- Use `WRITE` for pure prose requests (retell/summarize/expand) with no implied state change.
- Ambiguous requests: attempt `TOOL` planning; if zero valid tool calls after validation, fall back to `WRITE` (no mutation).
- Record routed decision, probabilities (if available), and any fallbacks in telemetry.

---

## 6. Non-Functional Requirements

- **Privacy:** All gameplay state local.  
- **Observability:** Log each tool request/response.  
- **Resilience:** 3s timeout on tool calls; retry once. Deterministic fallback behavior (see §7.2).  
- **Upgradeability:** Swap models without changing schemas.
 - **Idempotency:** Every apply attempt carries an idempotency key; server must dedupe to ≤0.5% double-exec rate target.
 - **Telemetry:** Emit per-stage events for Router, Tool, Apply, Narration including `latency_ms`, `schema_valid`, `retry_count`, `fallback_reason`.

---

## 7. System Architecture (Player-Facing Only)

```
Client (Zimbo UI)
   ↕ (OpenAI-compatible Chat API)
Router (Tool/Write/Both classifier)
   ├─ Qwen3-Instruct (Rules/Tools) via vLLM
   │    └─ Tools: dice, HP, state (local services)
   └─ Voice Model (local/cloud) – narration only
State Store (characters, sessions)
```

### 7.1 Orchestration Flow (v1.1)

1) Router classifies intent (`TOOL | WRITE | BOTH`).
2) If `TOOL`/`BOTH`: call Qwen3 with tools + schemas.
3) Validate returned tool calls; on validation failure, drop invalid calls and record warnings (no mutation for those calls).
4) Apply valid mutations via the delta executor; capture `{before, after}` snapshots and generate `state_delta` from applied ops.
5) If `BOTH`: call the voice model with `{ user_input, state_delta, current_state }` (no tool access).
6) Persist results (delta history, audit, telemetry), surface to UI (Dock/Overlay), and attach narration to the entry.
7) Failure handling: timeouts/LLM-unavailable → see §7.2; narration failure → keep state changes, attach template prose + warning.

### 7.2 Timeouts, Retry, and Fallbacks (v1.1)

- Tool stage: 3s timeout, single retry. On failure, do not mutate; return warning + captured note template.
- Read-only stage: if tool LLM unreachable, serve `get_state` from local store; for dice-only, use local dice roller when available.
- Narration: if voice model fails, keep applied state and return a short template narrative; log fallback.
- Idempotent apply: re-submissions return the same bundle id; executor must not double-apply.

---

## 8. Player Tool Interfaces

### 8.1 roll_move (read-only)
Roll 2d6 + modifier, return total & outcome tier.
```json
{
  "name": "roll_move",
  "parameters": {
    "character": "string",
    "move": "string",
    "stat": "string",
    "modifier": "integer"
  }
}
```

### 8.2 roll_damage
Compute damage, respect armor.
```json
{
  "name": "roll_damage",
  "parameters": {
    "source": "string",
    "damage_dice": "string",
    "target": "string",
    "armor": "integer"
  }
}
```

### 8.3 apply_damage (mutating)
Reduce HP, trigger death flag.
```json
{
  "name": "apply_damage",
  "parameters": {
    "target": "string",
    "amount": "integer"
  }
}
```

### 8.4 heal (mutating)
Restore HP, capped at max.
```json
{
  "name": "heal",
  "parameters": {
    "target": "string",
    "amount": "integer"
  }
}
```

### 8.5 mark_xp (mutating)
Grant XP and check threshold.
```json
{
  "name": "mark_xp",
  "parameters": {
    "character": "string",
    "amount": "integer"
  }
}
```

### 8.6 level_up (mutating)
Perform DW level-up flow.
```json
{
  "name": "level_up",
  "parameters": {
    "character": "string"
  }
}
```

### 8.7 add_debility / remove_debility (mutating)
Apply or clear debilities without free-form status strings.
```json
{"name":"add_debility","parameters":{"character":"string","debility":"string","reason":"string"}}
{"name":"remove_debility","parameters":{"character":"string","debility":"string"}}
```

### 8.8 Inventory (mutating)
Granular operations to avoid schema ambiguity and align with executor.
```json
{"name":"add_item","parameters":{"character":"string","item":{"id":"string","name":"string","tags":["string"],"description":"string","stats":"string"}}}
{"name":"remove_item","parameters":{"character":"string","item_id":"string"}}
{"name":"equip_item","parameters":{"character":"string","item_id":"string","slot":"string","reason":"string"}}
{"name":"unequip_item","parameters":{"character":"string","item_id":"string","slot":"string","reason":"string"}}
{"name":"add_item_tag","parameters":{"item_id":"string","tag":"string"}}
{"name":"spend_ammo","parameters":{"character":"string","amount":"integer","move":"string"}}
```

### 8.9 Bonds & Hold (mutating)
```json
{"name":"add_bond","parameters":{"character":"string","targetId":"string","text":"string"}}
{"name":"resolve_bond","parameters":{"character":"string","targetId":"string","resolution":"string"}}
{"name":"mark_hold","parameters":{"character":"string","move":"string","amount":"integer"}}
{"name":"spend_hold","parameters":{"character":"string","move":"string","amount":"integer"}}
```

### 8.10 Entities & Notes (mutating)
```json
{"name":"create_entity","parameters":{"entity":{"id":"string","name":"string","type":"string","description":"string","tags":["string"],"disposition":"string"}}}
{"name":"link_entity","parameters":{"fromId":"string","toId":"string","relationship":{"type":"string","strength":"integer","confidence":"number","status":"string","description":"string"},"context":"string"}}
{"name":"add_note","parameters":{"entityId":"string","note":"string"}}
```

---

## 9. Orchestration Rules

- Every **state change** (HP, XP, status, inventory) must go through a tool.
- Narration occurs **after** tool output.
- Misses (`outcome=6-`) auto-call `mark_xp(+1)`.
- **Encumbrance:** warn if total_weight > Load.
- **Last Breath:** future placeholder when HP ≤ 0.

---

## 10. Acceptance Tests (Player Tooling)

- “Roll a d20 Hack & Slash (STR+2)” → `roll_move` 10+ → `roll_damage` → `apply_damage(enemy)`.
- “I got hurt for five points.” → `apply_damage` → HP reduced; if 0, flag death.
- Miss on any move → `mark_xp(+1)`.
- Use of consumable → `manage_inventory(use)` decrements.

---

## 11. Data Model

**Character JSON:**
```json
{
  "id": "string",
  "name": "string",
  "class": "string",
  "level": 1,
  "xp": 0,
  "stats": {"STR":10,"DEX":12,...},
  "modifiers": {"STR":+0,"DEX":+1,...},
  "hp": {"current":20,"max":20},
  "armor":2,
  "bonds":[],
  "alignment":"Neutral",
  "statuses":[],
  "inventory":[],
  "load":9
}
```

---

## 12. Implementation Notes

- Voice model remains **tool-free**; only Qwen3 handles state logic.
- Player data stored locally or via API; JSON-based persistence.
- Tools exposed over OpenAI-compatible endpoint (vLLM/Ollama).
- Structured output enforcement (`guided_json`) for schema compliance.
- Embedded desktop runtime (future release):
  - Bundle a portable llama.cpp engine for both tooling (Qwen 7B) and narration (Mistral 7B) so Chronicle can run offline without Docker.
  - Ship/download quantized GGUF weights into an app-managed directory and verify hashes before loading.
  - Provide a manifest-driven updater so new model versions can be fetched in-app with progress + rollback.
  - ChronicleProvider must autodetect the embedded engine in Tauri builds and route tool/narration calls through IPC instead of HTTP.
  - Desktop bundles must ship a llama.cpp binary or prompt for `LLAMA_CPP_BIN`/`LLAMA_CPP_MAX_TOKENS` env vars so the embedded executor knows which CLI to spawn.

---

## 13. Metrics & KPIs (v1.1)

- Schema Validity (%) = valid_tool_calls / total_tool_calls
- Double-Execution (%) = deduped_apply_attempts / total_apply_attempts
- P95 Latency (ms, Tool stage) = 95th percentile over tool call latencies
- Fallback Rate (%) = fallback_turns / total_turns
- Per-event telemetry fields: `stage` (router|tool|apply|narration), `latency_ms`, `schema_valid`, `retry_count`, `fallback_reason`, `model` (qwen3-instruct-2507|voice-<name>|router)

---

## 14. Developer Guide (Local Runtime & Acceptance Tests)

### 14.1 Local runtime setup

> Chronicle now defaults to the local runtime path. You only need to opt into the GPT‑5 desktop bridge if you explicitly set `VITE_LLM_RUNTIME=tauri`.

1. Install Docker Desktop (with virtualization enabled) so the bundled `llama.cpp` containers can run.
2. Copy `.env.example` to `.env.local` and set:
   - `VITE_LOCAL_OPENAI_BASE_URL=http://localhost:11434/v1` (rules/tool endpoint)
   - `VITE_LOCAL_RULES_MODEL=qwen3-instruct-2507` (or whichever local weight you have pulled)
   - `VITE_LOCAL_OPENAI_VOICE_BASE_URL=http://localhost:11435/v1` *(optional, only if narration runs on a different service; otherwise it reuses the rules endpoint)*
   - `VITE_LOCAL_VOICE_MODEL=your-narration-model` *(optional, enabling prose/voice locally)*
   - (Optional) `VITE_LLM_RUNTIME=tauri` **only** if you need to temporarily route through GPT‑5 for debugging.
3. Run `npm run dev` (web) or `npm run dev:tauri` (desktop) so Chronicle can reach the local runtime. The dock badge should read **Local Tools Connected** once the health heartbeat succeeds.
4. Preferred shortcut: `./scripts/start-local-llm.ps1` (Windows) or `bash ./scripts/start-local-llm.sh` spins up the Docker Compose stack in `infra/local-llm/docker-compose.yml`, exports the env vars above, and then launches `npm run dev`. Use the matching `stop-local-llm` script to tear everything down.
5. To use the embedded llama.cpp executor, set:
   - `LLAMA_CPP_BIN` → absolute path to your `llama` binary (defaults to `llama` on `PATH`).
   - `LLAMA_CPP_MAX_TOKENS` → optional generation cap (defaults to `256`).

Recommended layout (laptop friendly):

- **Rules / tooling**: Qwen2.5-7B-Instruct (Q4_K_M GGUF) served via the bundled `llama.cpp` server (`./scripts/start-local-llm.*`). Chronicle refers to it as `qwen2.5-7b-tools`.
- **Narration / voice**: Mistral-7B-Instruct (Q4_K_M GGUF) or similar creative LM, exposed on the second `llama.cpp` server (`mistral-7b-narrator`).
- Place both GGUF files under `infra/local-llm/models/` before running the start script; the compose stack mounts that folder and refuses to boot if the files are missing.

### 14.2 Router & tool architecture

- `router.ts` classifies incoming Chronicle prompts as `TOOL`, `WRITE`, or `BOTH`. Ambiguous inputs default to `WRITE` but log a guardrail warning.
- `ChronicleProvider` merges the router decision with model responses:
  1. Router chooses the stage.
  2. Tool calls flow through `localToolRunner`:
     - Read-only tools (`roll_move`, `roll_damage`, `get_state`) stay deterministic and side-effect free.
     - DW mutation tools map 1:1 to Chronicle `DeltaOperation`s (`mapDwToolCallToDeltaOperations`) and are committed via `applyChronicleDeltaBundle`.
  3. After apply succeeds, narration (voice model or GPT-5) hydrates `pendingBundle.narrative` and the dock overlay renders it as “Chronicle Suggestion.”
- Missed moves call `ensureXpForMisses` so XP auto-marks are injected before persistence. Consumable updates (`spend_ammo`, `remove_item`) share the same pipeline which keeps idempotency keys on every bundle.

### 14.3 Telemetry & KPI instrumentation

- Each router/tool/apply/narration stage fires `recordTelemetry` with `latency_ms`, `model`, `schema_valid`, `retry_count`, and `fallback_reason`.
- KPI helpers consume `useChronicleStore.getState().telemetryEvents` to calculate Schema Validity, Double Execution, Tool P95, and Fallback Rate. These values should be surfaced in the rollout dashboard before enabling desktop-wide.
- Idempotency violations show up as audit entries with `reason: 'duplicate_bundle'` plus telemetry events flagged `stage=apply` + `outcome=skipped`.

### 14.4 Acceptance test suite

- **Service layer:** `src/services/llm/__tests__/localToolRunner.acceptance.test.ts` covers Hack & Slash damage resolution, Last Breath triggers, XP on a miss, consumables, and bundle idempotency at the executor level.
- **UI layer:** `src/components/chronicle/__tests__/ChronicleDock.dwAcceptance.test.tsx` (Vitest + React Testing Library) ensures the dock/overlay render those flows end-to-end: Hack & Slash narration + rule refs, Last Breath warnings, miss→XP, ammo/inventory deltas, and idempotent skip messaging.
- Run both suites locally with:

```bash
npx vitest run src/services/llm/__tests__/localToolRunner.acceptance.test.ts src/components/chronicle/__tests__/ChronicleDock.dwAcceptance.test.tsx
```

Passing both suites is required before flipping `VITE_LLM_RUNTIME=local` to the default or promoting a build to QA.

### 14.5 Embedded runtime tasks (ZM-LLM-080+)

1. **ZM-LLM-080 — Embedded engine host**  
   - Integrate a llama.cpp-based executor inside the Tauri backend. Provide commands to initialize, load models, run chat completions, and stream tool calls for both rules (Qwen2.5-7B) and narration (Mistral-7B).
2. **ZM-LLM-081 - Model manifest & downloader**  
   - Add a bundled manifest JSON and a safe, resumable downloader in the Tauri backend. Provide IPC `embedded_runtime_get_manifest()` and `embedded_runtime_download_model(kind)`; stream progress events; verify SHA-256; atomic rename from `*.part` to final file; single active download guard. Blocks Chronicle automation while downloads are in flight.
3. **ZM-LLM-082 - Auto-update UX**  
   - Embed Download actions and progress in the Admin panel and Dock banner. Provide per-model and bulk download, verifying state, retry on failure, and clear error copy. Chronicle Dock disables propose/apply while any embedded model is downloading.
4. **ZM-LLM-083 — Desktop routing**  
   - ChronicleProvider detects embedded mode via feature flag + Tauri context and routes tool/narration calls through IPC instead of HTTP. Web builds continue to use the OpenAI-compatible endpoints.
5. **ZM-LLM-084 - Acceptance tests**  
   - Add integration tests that mock the embedded runtime to verify initialization, failure recovery, and ChronicleDock health messaging when the engine is missing or models are still downloading.
6. **ZM-LLM-085 - Legacy cleanup**  
   - Remove remaining OpenAI/cloud references from docs, code paths, and env vars. Delete unused HTTP fallbacks, default configs, and UI copy mentioning OpenAI so the app clearly communicates "local-only" behavior.

### 14.6 Embedded Manifest & Downloader — Detailed Plan (v1.1 addendum)

This addendum specifies the concrete design and acceptance for ZM‑LLM‑081/082.

— Manifest
- Location: `src-tauri/assets/embedded_manifest.json` bundled with the app. Loaded at startup; if missing, fall back to the in-code default manifest.
- Fields (per model):
  - `kind`: `"rules" | "narration"` (enum)
  - `model_id`: stable id used in telemetry and UI
  - `display_name`: human label
  - `filename`: expected GGUF filename
  - `quantization`: e.g. `Q4_K_M`
  - `parameter_count`: integer (billions)
  - `description`: short explanation
  - `download_url`: HTTPS location of the GGUF
  - `sha256`: lowercase hex checksum
  - `size_bytes`: integer bytes
- Models directory: platform app data dir → `<app_local_data_dir>/models`.

— IPC Contract (new)
- `embedded_runtime_get_manifest()` → returns the full manifest object.
- `embedded_runtime_download_model(kind)` → starts download for the given kind; returns immediately. Progress emits as events (see below). Only one download is active at a time; subsequent calls yield a `busy` error.

— Progress Events (Tauri app bus)
- `embedded_runtime::download_started` `{ kind, totalBytes }`
- `embedded_runtime::download_progress` `{ kind, receivedBytes, totalBytes, percent }`
- `embedded_runtime::download_verifying` `{ kind }`
- `embedded_runtime::download_complete` `{ kind }`
- `embedded_runtime::download_error` `{ kind, message }`

— Status Semantics
- `Missing` → file not present.
- `Loading { progress }` → a download is active for this model; status must not be clobbered by a background refresh until completion/error.
- `Ready { loaded_at }` → file exists and checksum was verified; set only after atomic rename from `*.part`.
- `Error { message }` → terminal failure; user can retry.

— Safety & Integrity
- Stream to `<filename>.part`; compute SHA-256 incrementally; on match, `rename(.part → final)` atomically. On mismatch or error, delete `.part` and emit `download_error`.
- Single-download guard in backend to reduce race conditions; follow-ups may be queued later (out of scope for 081/082).

— UI & UX
- Admin → Embedded Runtime Panel: for `Missing`, show a `Download` button; while `Loading`, show percent and stage (Downloading / Verifying); show inline errors with `Retry`.
- Dock banner: when Embedded Runtime is enabled, surface a notice if any model is `Missing` or `Loading` with actions: `Download all`, `Open folder`, and `Refresh`.

— Chronicle Automation Guardrail
- ChronicleProvider sets `canApplyAutomation=false` while any embedded model is `Loading`. This blocks propose/apply and shows a friendly message: “Models downloading — Chronicle will resume when ready.”

— Telemetry (minimal 081/082)
- Emit per-model counters: `bytes_downloaded`, `duration_ms`, `verify_ms`, and outcome `success|error` (error includes reason: `checksum_mismatch|network|io|busy`).

— Acceptance (081)
1) Backend can return manifest via IPC.  
2) Download streams to `*.part`, emits progress, verifies SHA-256, atomically renames on success.  
3) Concurrent download prevention enforced.  
4) Status transitions: `Missing → Loading → Ready` or `Missing → Loading → Error` are reflected by `embedded_runtime_list_models`.

— Acceptance (082)
1) Admin panel shows Download/Progress/Verify/Error states and allows retry.  
2) Dock banner offers “Download all” when any model is missing; progress visible when downloading.  
3) Chronicle automation is blocked while `Loading`; attempts surface a clear message, and resume automatically after `download_complete`.

— Follow-ups (new tasks)
- **ZM-LLM-086 - Download resume & cancel**: HTTP Range support, partial hash resume, cancel IPC.
- **ZM-LLM-087 - Background verification**: On startup, verify existing files when `size_bytes` or `sha256` changed; mark `Error` on mismatch.
- **ZM-LLM-088 - Multi-download queue**: Queue per-model downloads; progress aggregate; "Download all" becomes sequential.

#### 14.6.1 Implementation Status (as of 10 Nov 2025)

- Backend (Tauri) now loads the bundled manifest at startup, exposes `embedded_runtime_get_manifest`/`embedded_runtime_download_model`, streams GGUF downloads with checksum verification, and emits `download_started`, `download_progress`, `download_verifying`, `download_complete`, and `download_error` events.
- Downloader writes to `<filename>.part`, renames atomically on verify success, and blocks concurrent downloads; cancellation scaffolding exists (`embedded_runtime_cancel_download`, partial file preservation) but is not fully honored yet.
- Frontend services (`embeddedRuntime.ts`) fetch the manifest, invoke download/cancel IPC commands, normalize event streams, and keep ChronicleProvider/Dock/Admin UIs aware of download state so automation is paused while any model is downloading.
- Admin Embedded Runtime panel and the Dock banner display Download buttons, progress bars, warnings, and disable Chronicle actions while models are missing or downloading; ChronicleProvider enforces the automation guard.
- Tests cover the backend parser + download event listeners and the Chronicle Dock embedded state; README + this PRD describe the manifest schema, downloader pipeline, and automation guardrails.
- Downloader now emits `embedded_runtime::download_telemetry` events summarizing outcome (`success|cancelled|error`), bytes pulled (including resume offsets), and download / verify durations so instrumentation and QA dashboards can reason about offline performance.

#### 14.6.2 Detailed Task Plan (ZM-LLM-086/087/088)

**ZM-LLM-086 - Download Resume & Cancel**
- Honor `embedded_runtime_cancel_download` end-to-end: downloader loop should watch for cancellation, emit `embedded_runtime::download_cancelled`, delete or retain `.part` based on cancellation reason, and unblock queued requests.
- Resume support: if a `.part` file exists, re-hash the existing bytes, send HTTP `Range` headers to continue the download, fall back to a full fetch when the server does not accept ranges, and keep progress percentages relative to total bytes.
- Frontend UX: Admin panel and Dock banner should surface explicit Cancel/Resume affordances, show when a download was resumed automatically, and make ChronicleProvider block automation during cancellation/verification transitions.
- Telemetry/test coverage: add unit/integration tests for cancellation + resume flows (mock HTTP + event streams) and log resume/cancel metrics (`resume=true|false`, `cancel_reason`).

**ZM-LLM-087 - Background Verification**
- On startup or manifest refresh, re-check hashes/sizes of existing GGUFs, delete or quarantine corrupted files, and emit `download_error` with a `verification_failed` reason so the UI can prompt a re-download.
- Extend manifest comparison logic so updates that change `sha256` or `size_bytes` mark the corresponding model as `Error` until re-verified.
- Document the background verification policy and add tests that stub mismatched files to ensure the UI surfaces remediation guidance.

**ZM-LLM-088 - Multi-download Queue**
- Allow multiple download requests by queuing them in the backend; ensure progress events identify which model is active and provide aggregate status for the Dock “Download all” CTA.
- Frontend bulk-download button should kick off sequenced downloads, display combined progress, and keep Chronicle automation blocked until every queued model is `Ready`.
- Add tests that simulate queueing, cancellation in the middle of the queue, and failure retries; update docs to clarify sequencing and user expectations.

### 14.7 Embedded DW Tool Executor (ZM-LLM-083)

- The embedded `run_tools` IPC now instructs the llama.cpp rules model to answer with a JSON payload shaped as `{"tool_calls":[{"name":"<tool>","arguments":{...}}],"warnings":[]}`. No prose, markdown, or narration is allowed in this response.
- The front-end parser (shared utility + unit tests) normalizes that JSON, tolerates surrounding text, and converts it into the same `ChatCompletionToolCall` objects used by the OpenAI local client. Unsupported tool names are dropped with explicit warnings.
- Once tool calls are parsed, Chronicle reuses `localToolRunner` helpers (`executeReadOnlyTool`, `mapDwToolCallToDeltaOperations`, `ensureXpForMisses`) to apply Dungeon World mutations against local stores, exactly mirroring the router/both flow.
- Narration still runs offline via `embedded_runtime_run_narration`, but now it receives state delta summaries and current-state snapshots derived from the applied ops so copy stays grounded.
- Automation is blocked (and the Dock surfaces a warning) whenever downloads are active or when the embedded parser fails to extract valid tool calls.
- **Acceptance (ZM-LLM-083)**:
  1. Tool runs emit valid JSON for every request; malformed payloads raise actionable warnings.
  2. Parsed tool calls map 1:1 to Chronicle `DeltaOperation`s, including read-only helpers (`get_state`, `roll_move`, `roll_damage`).
  3. Resulting bundles include deterministic idempotency keys (SHA-256 of entryId + ops fingerprint) and warnings when zero mutations are produced.
  4. Tests cover the parser + event bridge; docs (README + this section) explain the JSON schema so future llama prompts stay aligned.
