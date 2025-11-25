# PRD: Tauri Plugin Integration Playbook

Last Updated: 2025-10-19  
Owner: Chronicle Platform Engineering

## 0) Summary

Equip ZimboMate V2 with the core Tauri plugins required for secure credential handling, durable Chronicle data, native file exports, system notifications, and ergonomic window management. This document guides an automation agent through installing, configuring, and wiring each plugin into the existing Rust + React (Vite) codebase.

## 1) Goals & Non-Goals

### Goals
- Protect OpenAI credentials and overrides with encrypted storage via `@tauri-apps/plugin-stronghold`.
- Persist Chronicle/Zustand state outside the webview sandbox using `@tauri-apps/plugin-store`.
- Replace mock file export flows with native dialogs and filesystem writes through `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs`.
- Surface critical automation feedback using OS-level notifications via `@tauri-apps/plugin-notification`.
- Restore window size/state across launches using `@tauri-apps/plugin-window-state`.
- Define reusable patterns (capabilities, TypeScript helpers, tests) so future bots can extend integrations safely.

### Non-Goals
- Shipping optional plugins (e.g., global shortcuts) unless time allows.
- Refactoring Chronicle data schemas beyond what is required for persistence.
- Shipping platform-specific installers or auto-update flows.

## 2) Stakeholders
- Gameplay Platform Team (primary)
- LLM / Chronicle Services Team (secondary)
- QA Automation (Playwright + Vitest maintainers)

## 3) Technical Context
- Tauri backend: `src-tauri/src/lib.rs`, commands in `src-tauri/src/commands.rs`.
- Credentials persisted in plaintext (`src-tauri/src/llm_service.rs:205-245`).
- Chronicle + notification stores use `zustand/persist` (localStorage) in `src/stores/chronicleStore.ts:636` and `src/stores/notificationStore.ts:89`.
- Export flows use mock data and DOM downloads (`src/utils/rollHistoryExport.ts:362-378`, `src/components/game/ExportPanel.tsx:33-107`, `src/components/game/FileBrowserPanel.tsx`).
- Notifications limited to in-app toasts (`src/stores/notificationStore.ts` + UI components).
- Window dimensions hardcoded in `src-tauri/tauri.conf.json:16-30`.

## 4) Plugin Requirements

### 4.1 Stronghold (Secrets Vault)
- **Install:** `npm install @tauri-apps/plugin-stronghold` & add Rust dep `tauri-plugin-stronghold`.
- **Capabilities:** Update `src-tauri/capabilities/default.json` to include `plugin:stronghold` permission.
- **Backend wiring:** Register plugin in `tauri::Builder` (`src-tauri/src/lib.rs`) before `.manage`. Configure snapshot path and optional migration hook.
- **Credential API updates:** Swap file persistence in `LlmService`:
  - On startup, open a Stronghold vault, derive record keys (e.g., `llm_credentials`).
  - Replace `fs::write` / `fs::read_to_string` with `stronghold.write` / `stronghold.read`.
  - Ensure `set_llm_credentials` and `get_llm_credentials` use the vault.
- **Frontend compatibility:** `adminCredentials.ts` should still fall back to local cache when IPC unavailable, but the Tauri invoke path must remain unchanged.
- **Acceptance Criteria:**
  1. Existing plaintext file is no longer created.
  2. Credentials survive app restarts and are unreadable via plain filesystem inspection.
  3. CI checks (if any) compile with new dependency.

### 4.2 Store (Chronicle Persistence)
- **Install:** `npm install @tauri-apps/plugin-store` & Rust `tauri-plugin-store`.
- **Capabilities:** Grant `plugin:store` in `capabilities/default.json`.
- **Backend wiring:** Register Store plugin with default scope. Optionally set a namespace like `chronicle`.
- **Frontend adapters:**
  - Create a thin utility (e.g., `src/services/nativeStore.ts`) that wraps `@tauri-apps/plugin-store` APIs.
  - Refactor `useChronicleStore` & `useNotificationStore` to use a custom storage adapter instead of default `persist`. Suggested approach: use Zustand's `createJSONStorage` with async store driver.
  - Migrate existing persisted data: on first launch, attempt to import from localStorage before clearing it.
- **Acceptance Criteria:**
  1. Store data remains after clearing webview cache.
  2. Chronicle session resumes with previous entries without manual import.
  3. Unit test (Vitest) covers adapter read/write/call ordering.

### 4.3 File System + Dialog
- **Install:** `npm install @tauri-apps/plugin-fs @tauri-apps/plugin-dialog` plus Rust deps.
- **Capabilities:** Add `plugin:fs` (read/write) and `plugin:dialog` permissions. Restrict to workspace root where possible.
- **Backend wiring:** Register both plugins.
- **Frontend refactors:**
  - Replace hidden anchor downloads with `save` dialog + `fs.writeFile` in `rollHistoryExport.ts` & Export panel callbacks.
  - Implement open/save flows in `FileBrowserPanel` using `open`, `save`, `readDir`.
  - Provide graceful fallback when running in pure web (development mode).
- **Acceptance Criteria:**
  1. Export prompts a system save dialog and writes file to chosen path.
  2. File Browser lists actual files under an app-defined storage directory (`logs`, saved exports, etc.).
  3. Manual tests on Windows confirm correct path resolution and no permission errors.

### 4.4 Notification
- **Install:** `npm install @tauri-apps/plugin-notification` & Rust `tauri-plugin-notification`.
- **Capabilities:** Add `plugin:notification` (and OS-specific entitlements if required later).
- **Frontend integration:**
  - Create bridge `src/services/nativeNotifications.ts` that sends OS notifications when certain store events fire.
  - Update `notificationStore` to emit via native plugin when priority ≥ `high` or when Chronicle automation fails.
  - Ensure toast UI still works for in-app context.
- **Acceptance Criteria:**
  1. Native notification triggers on automation failure, XP award, or dice critical events (configurable).
  2. Duplicate suppression logic respects notification IDs.
  3. QA checklist verifies Windows 11 notification center entry.

### 4.5 Window State
- **Install:** `npm install @tauri-apps/plugin-window-state` & Rust `tauri-plugin-window-state`.
- **Capabilities:** Add `plugin:window-state`.
- **Backend wiring:** Register plugin with default config.
- **Frontend alignment:**
  - Remove hardcoded `width`/`height` from `tauri.conf.json` if conflicting; rely on plugin's persisted state.
  - Ensure any window adjustments (e.g., opening dev tools) still behave.
- **Acceptance Criteria:**
  1. App restores last size, position, and maximized status.
  2. Plugin state resets cleanly when `--reset-window-state` env flag is set (optional helper command).

### Optional: Global Shortcut
- Documented as a stretch. If implemented, follow same pattern: install, add capability, register keyboard shortcuts that trigger dice rolls even when unfocused.

## 5) Implementation Plan
1. **Dependency Setup** – Batch install all plugin packages (Rust + JS), update `Cargo.lock`, and run `npm install`.
2. **Capability Matrix** – Extend `default.json` to include plugin permissions; add scoped configs if needed (e.g., `fs:write` to specific directories).
3. **Backend Registration** – Modify `src-tauri/src/lib.rs` to chain `.plugin(...)` calls for each plugin. Run `cargo check`.
4. **Stronghold Migration** – Refactor `LlmService` persistence, add helper for legacy JSON migration (read once, migrate, delete).
5. **Store Adapter** – Implement async storage driver and update Zustand stores; add migration logic.
6. **FS/Dialog Refactor** – Update export modules and panels, add TypeScript wrappers, adjust tests/mocks.
7. **Notification Bridge** – Hook store events to native notifications with throttling.
8. **Window State Enablement** – Remove redundant window persistence logic, test maximizing/minimizing.
9. **Testing & QA** – Update Vitest mocks for `@tauri-apps/plugin-*`, add integration smoke tests, run `npm run test:all` and `npm run tauri:build`.
10. **Documentation** – Update `README.md` and admin settings docs with new persistence and notification details.

## 6) Testing & Validation
- **Unit Tests:** Vitest stubs for stronghold/store wrappers; ensure fallbacks when `__TAURI_IPC__` missing.
- **Integration:** Playwright scenarios covering export/download & Chronicle persistence.
- **Manual QA:** Checklist for Windows (primary), macOS optional. Validate notifications, window restore, credential migration.
- **Security Review:** Confirm no plaintext credentials remain, verify vault file permissions.

## 7) Telemetry & Observability
- Instrument success/error events for each plugin-backed operation (e.g., `stronghold-credentials-migrated`, `store-write-failed`, `fs-export-succeeded`).
- Emit via existing telemetry bus (`publishChronicleDockInteraction` or new channel).

## 8) Risks & Mitigations
- **Stronghold migration failures** – Keep read-only fallback; display admin banner via `NotificationManager`.
- **Store adapter regressions** – Back up legacy localStorage before clearing; provide import script.
- **Cross-platform path issues** – Use `BaseDirectory.AppData` or dedicated folder for exports.
- **Notification spam** – Add rate limiting and user preferences toggle.

## 9) Rollout Checklist
1. Complete automated + manual test suites.
2. Verify capability declarations committed.
3. Update release notes (`docs/reference/CHANGELOG.md`).
4. Notify support team of new persistence location for credentials and Chronicle data.
5. Prepare rollback plan (feature flags or environment toggles).

## 10) References
- Tauri plugin docs: [https://v2.tauri.app/plugin/](https://v2.tauri.app/plugin/)
- Existing credential logic: `src-tauri/src/llm_service.rs`
- Chronicle persistence: `src/stores/chronicleStore.ts`, `src/services/adminCredentials.ts`

