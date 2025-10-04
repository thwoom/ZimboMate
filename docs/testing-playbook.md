# Testing Playbook

## Smoke Test Flow

- Run `npm run test:smoke` to lint, build, execute Vitest in-band, and drive a single-browser Playwright pass.
- Use this before pushing or when iterating locally to catch regressions without the full device matrix.

## Full Suite Execution

- CI still fans out across the entire device matrix automatically.
- Locally, opt in with `PW_DEVICES=all npm run e2e` when you are ready for the full matrix.
- Visual baselines remain tied to `npm run screenshot` / `npm run screenshot:analyze` and honor the same device selection rules.

## Profiling Hung Runs

- Reproduce the freeze with verbose telemetry: `npm run test:run -- --runInBand --reporter=json` or `npx playwright test --project="Desktop Chrome" --reporter=json`.
- Capture a CPU profile with `node --inspect-brk ./node_modules/vitest/vitest.mjs run --runInBand` before terminating the worker.
- Record the run context (command, commit, OS, CPU load) so the next pass can compare timing deltas.

## Environment Toggles

- `PW_USE_DEV_SERVER=1` switches Playwright back to Vite dev mode when you need rapid feedback and can tolerate the watcher.
- `PW_DEVICES=all` re-enables every device profile locally; omit to stick with the constrained desktop matrix.
- `PWDEBUG=1` remains available for interactive debugging without touching the shared config.

## Dice System Regression Checks

- `vitest run src/components/__tests__/UnifiedRollSystem.test.tsx` exercises the streamlined roller. It stubs the Zustand dice store to confirm stat and custom rolls dispatch as expected and ensures the history log updates in response.
- When you touch `src/stores/diceStore.ts` or the dice UI, re-run that targeted test before the broader `npm run test` sweep so we catch selector regressions early.
- The export helpers now read directly from the trimmed roll shape. If roll serialization changes, add or update coverage beside `rollHistoryExport.ts` before shipping.
- `npm run test:watchdog` runs the full suite under a 10 minute watchdog, writes combined output to `logs/test-watchdog-<timestamp>.log`, and, on timeout, automatically tries `npm run test:run -- --runInBand` and a single-browser Playwright pass to capture diagnostics.
