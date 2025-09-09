import fs from 'node:fs'
import path from 'node:path'

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
    } else if (entry.isFile() && full.endsWith('.css')) {
      yield full
    }
  }
}

const roots = [
  path.join(process.cwd(), 'src'),
  path.join(process.cwd(), 'components'),
  path.join(process.cwd(), 'panels'),
  path.join(process.cwd(), 'layouts'),
  path.join(process.cwd(), 'styles'),
].filter(fs.existsSync)

let changed = 0
for (const base of roots) {
  for (const file of walk(base)) {
    const before = fs.readFileSync(file, 'utf8')
    let t = before

    // Ensure -webkit-backdrop-filter precedes backdrop-filter (allow whitespace/newlines between)
    t = t.replace(/(backdrop-filter\s*:[^;]+;)(\s*)(-webkit-backdrop-filter\s*:[^;]+;)/g, '$3$2$1')
    t = t.replace(/(backdrop-filter\s*:[^;]+;)([\s\S]{0,80}?)(-webkit-backdrop-filter\s*:[^;]+;)/g, '$3$2$1')

    // Ensure -webkit-appearance precedes appearance
    t = t.replace(/(appearance\s*:[^;]+;)(\s*)(-webkit-appearance\s*:[^;]+;)/g, '$3$2$1')
    t = t.replace(/(appearance\s*:[^;]+;)([\s\S]{0,80}?)(-webkit-appearance\s*:[^;]+;)/g, '$3$2$1')

    if (t !== before) {
      fs.writeFileSync(file, t)
      changed++
    }
  }
}

console.log(`fixCssPrefixes: files changed ${changed}`)

