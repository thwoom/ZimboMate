import { execSync } from 'node:child_process'
import net from 'node:net'
import process from 'node:process'

const DEFAULT_PORT = 1420
const DEFAULT_HOST = '127.0.0.1'

if (process.env.SKIP_DEV_PORT_CHECK === '1') {
  process.exit(0)
}

function readCliPort() {
  const rawArgv = process.env.npm_config_argv
  if (!rawArgv) return undefined

  try {
    const parsed = JSON.parse(rawArgv)
    const args = parsed?.remain
    if (!Array.isArray(args)) return undefined

    for (let index = 0; index < args.length; index += 1) {
      const token = args[index]
      if (token === '--port' || token === '-p') {
        const value = args[index + 1]
        if (typeof value === 'string') {
          const numeric = Number.parseInt(value, 10)
          if (Number.isFinite(numeric)) {
            return numeric
          }
        }
      }

      if (token?.startsWith('--port=')) {
        const [, value] = token.split('=')
        const numeric = Number.parseInt(value, 10)
        if (Number.isFinite(numeric)) {
          return numeric
        }
      }
    }
  } catch {
    // Ignore malformed JSON; we'll fall back to env/defaults.
  }

  return undefined
}

const cliPort = readCliPort()
const envPort = Number.parseInt(process.env.VITE_DEV_SERVER_PORT ?? '', 10)
const port = Number.isFinite(cliPort)
  ? cliPort
  : Number.isFinite(envPort)
    ? envPort
    : DEFAULT_PORT
const host = process.env.VITE_DEV_SERVER_HOST ?? DEFAULT_HOST

function describeWindowsUsage() {
  try {
    const netstat = execSync(
      `cmd.exe /c "netstat -ano -p TCP | findstr :${port}"`,
      { stdio: 'pipe' },
    )
      .toString()
      .trim()

    if (!netstat) {
      return 'No TCP listeners reported by netstat.'
    }

    const lines = netstat.split(/\r?\n/).map((line) => line.trim())
    const pids = new Set(
      lines
        .map((line) => line.split(/\s+/).at(-1))
        .filter((pid) => pid && pid !== ''),
    )

    const details = [
      'Active TCP entries (via netstat):',
      ...lines,
      '',
      'Owning processes:',
    ]

    for (const pid of pids) {
      try {
        const procInfo = execSync(
          `powershell -NoLogo -NoProfile -Command "Get-Process -Id ${pid} | Select-Object Id,ProcessName,Path | Format-List"`,
          { stdio: 'pipe' },
        )
          .toString()
          .trim()
        if (procInfo) {
          details.push(procInfo)
        }
      } catch {
        // Swallow errors – we only need best-effort diagnostics.
      }

      try {
        const commandLine = execSync(
          `powershell -NoLogo -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"ProcessId=${pid}\\").CommandLine"`,
          { stdio: 'pipe' },
        )
          .toString()
          .trim()
        if (commandLine) {
          details.push(`CommandLine: ${commandLine}`)
        }
      } catch {
        // No-op – command line lookup is a bonus.
      }
      details.push('')
    }

    return details.join('\n').trim()
  } catch (error) {
    const stdout = error?.stdout?.toString()?.trim()
    const stderr = error?.stderr?.toString()?.trim()
    return stdout || stderr || 'Unable to query netstat for diagnostics.'
  }
}

function describeUnixUsage() {
  try {
    const output = execSync(`lsof -i tcp:${port} -P -n`, {
      stdio: 'pipe',
    })
      .toString()
      .trim()

    if (!output) {
      return 'No lsof entries for the port.'
    }

    return `Active entries (via lsof):\n${output}`
  } catch (error) {
    const stdout = error?.stdout?.toString()?.trim()
    if (stdout) {
      return `Active entries (via lsof):\n${stdout}`
    }
    const stderr = error?.stderr?.toString()?.trim()
    return stderr || 'Unable to query lsof for diagnostics.'
  }
}

function printDiagnostics() {
  const message =
    process.platform === 'win32'
      ? describeWindowsUsage()
      : describeUnixUsage()
  console.error(message)
}

const server = net.createServer()

server.once('error', (error) => {
  const code = typeof error === 'object' && error?.code
  if (code === 'EADDRINUSE') {
    console.error(
      `\n⚠️  Port ${port} on host ${host} is already in use. The dev server cannot start until it is freed.\n`,
    )
    printDiagnostics()
    console.error(
      `\nResolve the conflict (stop the listed process or choose a new port) and then retry. You can override the port with ` +
        '`VITE_DEV_SERVER_PORT=<port> npm run dev`.\n',
    )
    process.exit(1)
  }

  console.error(
    `Unexpected error while probing port ${port}:`,
    error instanceof Error ? error.message : error,
  )
  process.exit(1)
})

server.listen(
  {
    host,
    port,
    exclusive: true,
  },
  () => {
    server.close(() => {
      process.exit(0)
    })
  },
)
