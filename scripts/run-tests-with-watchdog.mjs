#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const DEFAULT_MAIN_TIMEOUT = 10 * 60 * 1000
const DEFAULT_FALLBACK_TIMEOUT = 5 * 60 * 1000

const mainTimeout =
  Number.parseInt(process.env.TEST_WATCHDOG_TIMEOUT ?? '', 10) ||
  DEFAULT_MAIN_TIMEOUT
const fallbackTimeout =
  Number.parseInt(process.env.TEST_WATCHDOG_FALLBACK_TIMEOUT ?? '', 10) ||
  DEFAULT_FALLBACK_TIMEOUT

const logDir = resolve(process.cwd(), 'logs')
if (!existsSync(logDir)) mkdirSync(logDir)

const logFile = resolve(logDir, `test-watchdog-${Date.now()}.log`)
const logStream = createWriteStream(logFile, { flags: 'a' })

const fallbackCommands = [
  {
    label: 'npx vitest run --threads false',
    command: 'npx vitest run --threads false',
  },
  {
    label:
      'npx playwright test --project="Desktop Chrome" --reporter=line --workers=1',
    command:
      'npx playwright test --project="Desktop Chrome" --reporter=line --workers=1',
  },
]

function log(message) {
  const line = `[watchdog ${new Date().toISOString()}] ${message}\n`
  process.stdout.write(line)
  logStream.write(line)
}

function pipeOutput(label, data) {
  const text = data.toString()
  process.stdout.write(text)
  logStream.write(`[${label}] ${text}`)
}

function runCommand(label, command, timeout) {
  return new Promise((resolveRun) => {
    const child = spawn(command, { shell: true })
    let finished = false
    let timedOut = false
    const timeoutHandle = setTimeout(() => {
      if (finished) return
      timedOut = true
      log(`${label} exceeded ${timeout}ms, sending SIGTERM`)
      child.kill('SIGTERM')
      setTimeout(() => {
        if (!finished) {
          log(`${label} unresponsive after SIGTERM, sending SIGKILL`)
          child.kill('SIGKILL')
        }
      }, 5000)
    }, timeout)

    child.stdout.on('data', (chunk) => pipeOutput(label, chunk))
    child.stderr.on('data', (chunk) => pipeOutput(label, chunk))

    child.on('error', (error) => {
      if (finished) return
      finished = true
      clearTimeout(timeoutHandle)
      log(`${label} failed to start: ${error.message}`)
      resolveRun({ code: 1, timedOut })
    })

    child.on('exit', (code, signal) => {
      if (finished) return
      finished = true
      clearTimeout(timeoutHandle)
      if (timedOut)
        log(`${label} terminated after timeout (signal=${signal ?? 'none'})`)
      else log(`${label} exited with code ${code ?? 0}`)
      resolveRun({ code: code ?? 0, timedOut })
    })
  })
}

async function runWatchdog() {
  log(
    `Starting watchdog: npm run test (timeout ${mainTimeout}ms) -> ${logFile}`,
  )
  const mainResult = await runCommand(
    'npm run test',
    'npm run test',
    mainTimeout,
  )

  if (!mainResult.timedOut) {
    log('Main test command completed without timeout')
    logStream.end()
    process.exit(mainResult.code)
  }

  log('Main test command timed out; running fallback diagnostics')
  const results = []
  for (const fallback of fallbackCommands) {
    log(`Running fallback command: ${fallback.label}`)

    const result = await runCommand(
      fallback.label,
      fallback.command,
      fallbackTimeout,
    )
    results.push({ label: fallback.label, ...result })
  }

  log('Watchdog summary:')
  for (const result of results)
    log(` - ${result.label}: code=${result.code} timedOut=${result.timedOut}`)

  log(`See log file for details: ${logFile}`)
  logStream.end()
  process.exit(1)
}

runWatchdog().catch((error) => {
  log(`Watchdog script failed: ${error.message}`)
  logStream.end()
  process.exit(1)
})
