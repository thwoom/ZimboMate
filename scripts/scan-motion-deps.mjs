import fs from "node:fs";
import path from "node:path";
import process from "node:process";

console.log("[scan-motion-deps] START");

const ROOT = process.cwd();
const LOCK = path.join(ROOT, "package-lock.json");

// Read JSON safely
const readJSON = (p) => {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
};

// Gather candidate package dirs that declare "motion"
function findCandidates() {
  const set = new Set();

  const lock = readJSON(LOCK);
  if (lock && lock.packages && typeof lock.packages === "object") {
    for (const [rel, meta] of Object.entries(lock.packages)) {
      if (!rel || rel === "") continue;
      if (meta && meta.dependencies && Object.prototype.hasOwnProperty.call(meta.dependencies, "motion")) {
        set.add(path.join(ROOT, rel));
      }
    }
    return [...set];
  }

  // Fallback: crawl node_modules for package.json mentioning "motion" in deps/peers/optional
  const nm = path.join(ROOT, "node_modules");
  const stack = [nm];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || /^[.@a-z0-9_-]+$/i.test(e.name)) stack.push(p);
        const pj = path.join(p, "package.json");
        try {
          const pkg = readJSON(pj);
          if (pkg) {
            const deps = Object.assign({}, pkg.dependencies, pkg.peerDependencies, pkg.optionalDependencies);
            if (deps && Object.prototype.hasOwnProperty.call(deps, "motion")) set.add(p);
          }
        } catch {}
      }
    }
  }
  return [...set];
}

function listFiles(dir, exts, maxSize = 2 * 1024 * 1024) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (/^(dist|build|coverage|__tests__|docs)$/i.test(e.name)) continue; // skip heavy dirs
        stack.push(p);
      } else {
        const ext = path.extname(e.name).toLowerCase();
        if (exts.has(ext)) {
          try {
            const st = fs.statSync(p);
            if (st.size <= maxSize) out.push(p);
          } catch {}
        }
      }
    }
  }
  return out;
}

function scanFiles(files, regex) {
  for (const f of files) {
    let s = "";
    try { s = fs.readFileSync(f, "utf8"); } catch { continue; }
    const lines = s.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return `${f}:${i + 1}: ${lines[i].trim()}`; // return first hit for speed
      }
    }
  }
  return null;
}

if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
  console.log("[scan-motion-deps] node_modules not found. Run npm i first.");
  console.log("[scan-motion-deps] END");
  process.exit(0);
}

const depRegex = /import\s*{[^}]*\b(glide|timeline)\b[^}]*}\s*from\s*["']motion["']/;
const exts = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx"]);

const candidates = findCandidates();
console.log(`[scan-motion-deps] candidates: ${candidates.length}`);

let firstHit = null;
for (const dir of candidates) {
  const files = listFiles(dir, exts);
  firstHit = scanFiles(files, depRegex);
  if (firstHit) break;
}

if (firstHit) {
  console.error(firstHit);
  console.error("Legacy Motion API found in dependencies.");
  console.log("[scan-motion-deps] END");
  process.exit(2);
} else {
  console.log("OK: deps clean.");
  console.log("[scan-motion-deps] END");
  process.exit(0);
}
