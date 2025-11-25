# Chronicle Dock Prompt-as-Entry

The Chronicle Dock delivers a dock-first prompt experience for the Play tab, backed by the Prompt-as-Entry data model. Prompts appear as real Chronicle entries, automation happens in-line, and the legacy floating overlay is now optional.

## Highlights
- **Dock-first UI**: Chronicle Dock mounts in the right rail with prompt feed, composer, automation checklist, and history cards.
- **Prompt-as-Entry model**: Every prompt is a Chronicle entry (`status`, `origin`, `actionContext`, `promptMetadata`, `pendingBundle`) stored in `chronicleStore`.
- **Ui mode toggle**: `chronicle.settings.uiMode` controls where prompts render. Options:
  - `dock` *(default)* - overlay hidden, everything flows through the Dock.
  - `overlay` - classic overlay only (Dock shows guardrail message).
  - `both` - overlay plus dock feed for dual-screen operators.
- **Dismiss guard rails**: Dock dismissals route through a reason picker and emit analytics.
- **Analytics bus**: `publishChronicleDockInteraction` emits structured events (`chronicle-dock-interaction` window event) for downstream dashboards.
- **Live LLM status & manual feedback**: The Dock header surfaces Connected/Initializing/Offline state, shows a banner when automation pauses, and adds inline success/failure messaging plus retry controls for manual notes.
- **Admin diagnostics**: OpenAI settings display desktop bridge detection, last GPT heartbeat and error, and surface bridge-write failures instead of silently falling back.

## Application Modes

Launch now starts with a mode selector that keeps Chronicle optional:

- **Sheet-Only** *(default)* – Offline character sheet, dice, and campaign management with no Chronicle UI or GPT-5 initialization.
- **Chronicle+** – Opt-in Chronicle dock, automation deltas, and AI budget tracking. Requires the Tauri desktop bridge to reach GPT-5.

You can reopen the selector any time from the header “Switch Mode” badge or Settings ▸ Chronicle. Switching modes is instant and preserves campaign data.

## Getting Started
```bash
npm install
npm run dev
```
The Play tab automatically loads the Dock when `chronicle.settings.uiMode` is `dock` or `both`.

## Offline LLM Stack (Local Models Only)
Chronicle now runs entirely offline when you front it with local OpenAI-compatible runtimes for both rules/tools and narration.

1. Install Docker Desktop (with GPU passthrough enabled) and sign in to Hugging Face so vLLM can download weights the first time you launch.
2. Download the quantized GGUF weights listed in `infra/local-llm/models/README.md` (Qwen2.5-7B Instruct + Mistral 7B Instruct) into `infra/local-llm/models/`. They total ~8 GB and run comfortably on modern laptops.
3. Start the local models plus the Vite dev server in one step:
   - Windows PowerShell: `./scripts/start-local-llm.ps1`
   - macOS/Linux: `bash ./scripts/start-local-llm.sh`
4. Set the embedded runtime env vars if you want to run llama.cpp directly from the desktop build:
   - `LLAMA_CPP_BIN` – absolute path to the `llama` binary (defaults to `llama` on `PATH`)
   - `LLAMA_CPP_MAX_TOKENS` – optional generation limit (default `256`)
5. The script spins up lightweight `llama.cpp` servers (via Docker Compose) hosting those models on ports `11434/11435`, exports the required `VITE_*` env vars, and then runs `npm run dev`.
6. When you are done developing, stop the models with `./scripts/stop-local-llm.ps1` or `bash ./scripts/stop-local-llm.sh`.

The first run reuses the GGUF files you placed in `infra/local-llm/models/`, so Chronicle stays completely offline—no GPT-5 fallback unless you intentionally set `VITE_LLM_RUNTIME=tauri`.

### Embedded Runtime IPC (Desktop Builds)
- Tauri commands expose the embedded engine so the UI can manage models without touching HTTP:
  - `embedded_runtime_list_models` — returns model descriptors (kind, expected path, status).
  - `embedded_runtime_ensure_model` / `embedded_runtime_load_model` (`kind: "rules" | "narration"`) — verifies the GGUF exists and, when the embedded llama runner is configured, primes it for work.
  - `embedded_runtime_models_dir` — returns the resolved models directory so the UI can open/focus it for the user.
  - `embedded_runtime_run_tools` / `embedded_runtime_run_narration` — launches the bundled `llama` binary with the selected GGUF. Tool runs now emit JSON `{ "tool_calls": [...] }` blocks so the dock can translate them into Dungeon World delta operations before narration runs offline.
- Manifest + downloader additions (ZM-LLM-081/082):
  - `embedded_runtime_get_manifest` - surfaces the bundled manifest JSON (kind, filename, download URL, SHA256, size) so the UI can show model metadata.
  - `embedded_runtime_download_model(kind)` - streams the GGUF into the managed models directory, reports progress events (`embedded_runtime::download_*`), and verifies SHA-256 before flipping the file live. Only one download runs at a time, and Chronicle automation is paused while downloads are active.
  - `embedded_runtime_cancel_download(kind)` - cancels the active download, emits `embedded_runtime::download_cancelled`, and keeps the `.part` file so the next download resumes via HTTP Range instead of starting from byte zero.
  - `embedded_runtime::download_telemetry` events fire at the end of every download (success, cancel, or error) with bytes downloaded, resume offsets, wall-clock duration, verify duration, and error messages so diagnostics dashboards can stay in sync.
  - Admin + Dock panels now show per-model Download/Resume buttons, progress bars, Cancel controls, and a bulk "Download missing" action wired to these IPC commands.

Front-end code should call these commands before allowing Chronicle automation to run, surfacing actionable errors (e.g., “Download qwen2.5-7b-instruct-q4_k_m.gguf to …”). Set `VITE_EMBEDDED_RUNTIME=true` to enable this experimental path in development builds; otherwise Chronicle continues to use the legacy local HTTP client.

## Configuring Chronicle Settings
Chronicle settings live in `chronicleStore.settings`. Update them via the Chronicle settings panel or programmatically, for example:
```ts
const store = useChronicleStore.getState()
store.updateSettings({
  uiMode: 'dock',
  maxActivePrompts: 3,
})
```
Changing `uiMode` to `overlay` hides the dock UI and shows a notice explaining how to re-enable it.

## Telemetry & Analytics
Dock interactions publish through `publishChronicleDockInteraction` (`src/utils/chronicleDockTelemetry.ts`). Each event includes `type`, `entryId`, optional `bundleId`, dismissal `reason`, `sessionId`, and `uiMode`.

Subscribe from dashboards or devtools:
```ts
import { subscribeChronicleDockInteractions } from '@/utils/chronicleDockTelemetry'

const unsubscribe = subscribeChronicleDockInteractions((event) => {
  console.log('dock interaction', event)
}, { replay: true, replayLimit: 20 })
```
Events also dispatch as a `chronicle-dock-interaction` `CustomEvent` on `window` for external listeners.

## Testing
Focused regression suite for dock + overlay flows:
```bash
npx vitest --run \
  src/utils/__tests__/chronicleDockTelemetry.test.ts \
  src/stores/__tests__/chronicle.promptEntry.test.ts \
  src/components/chronicle/__tests__/ChronicleDock.integration.test.tsx \
  src/components/chronicle/__tests__/ChronicleOverlay.links.test.tsx
```

## Additional Documentation
- Progress log: `docs/chronicle-promptasentry-progress.md`
- Product requirements: `docs/chronicle_dock_promptasentry_prd.md`
- Change log: `docs/reference/CHANGELOG.md`
