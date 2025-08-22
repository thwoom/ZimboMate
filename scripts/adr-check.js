#!/usr/bin/env node
/**
 * ADR Enforcement Script
 * Fails the PR if it introduces tool/config changes without an ADR in docs/adrs/.
 *
 * What triggers an ADR requirement:
 *  - Changes to dependency manifests (package.json, pnpm-lock.yaml, yarn.lock)
 *  - Changes to core tool configs (vite, tailwind, panda, storybook, playwright, tauri, eslint, prettier, tsconfig)
 *  - Adding/renaming tool-related directories/files under /scripts/, /config/, /.github/workflows
 *
 * Satisfying an ADR requirement:
 *  - At least one file in docs/adrs/*.md is added/modified in this PR, and
 *  - That file contains "Status:" and "Date:" fields.
 *
 * Usage: node scripts/adr-check.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  return execSync(cmd, { stdio: ['pipe', 'pipe', 'inherit'] }).toString().trim();
}

function getBaseRef() {
  // Prefer GitHub-provided base ref if available; otherwise fallback to main
  const base = process.env.GITHUB_BASE_REF || 'main';
  return base;
}

function fetchBase(base) {
  try {
    sh(`git fetch origin ${base} --depth=1`);
  } catch (e) {
    // If shallow clone of the PR branch only, attempt to fetch --unshallow
    try { sh(`git fetch --unshallow`); } catch {}
    // Try again
    try { sh(`git fetch origin ${base}`); } catch {}
  }
}

function getChangedFiles(base) {
  const range = `origin/${base}...HEAD`;
  const out = sh(`git diff --name-only ${range}`);
  return out ? out.split('\n').filter(Boolean) : [];
}

function isToolChange(file) {
  const toolPatterns = [
    /^package\.json$/,
    /^pnpm-lock\.yaml$/,
    /^yarn\.lock$/,
    /^bun\.lockb$/,
    /^vite\.config\.(t|j)s$/,
    /^tailwind\.config\.(t|j)s$/,
    /^panda\.config\.(t|j)s$/,
    /^postcss\.config\.(t|j)s$/,
    /^playwright\.config\.(t|j)s$/,
    /^storybook\//,
    /^\.storybook\//,
    /^tauri\.conf\.(t|j)s$/,
    /^tauri\.conf\.json$/,
    /^eslint(\.config)?\.(cjs|js|mjs|ts|json)$/,
    /^\.eslintrc(\.(cjs|js|mjs|ts|json))?$/,
    /^prettier(\.config)?\.(cjs|js|mjs|ts|json)$/,
    /^\.prettierrc(\.(cjs|js|mjs|ts|json))?$/,
    /^tsconfig\.(?:app\.)?json$/,
    /^scripts\//,
    /^config\//,
    /^\.github\/workflows\//,
  ];
  return toolPatterns.some((re) => re.test(file));
}

function readJsonAtRef(ref, file) {
  try {
    const content = sh(`git show ${ref}:${file}`);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function depsChanged(base, files) {
  if (!files.includes('package.json')) return false;
  const baseRef = `origin/${base}`;
  const before = readJsonAtRef(baseRef, 'package.json') || {};
  const after = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const keys = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  function flatDeps(obj) {
    const out = {};
    for (const k of keys) {
      if (obj && obj[k]) Object.assign(out, obj[k]);
    }
    return out;
  }
  const a = flatDeps(before);
  const b = flatDeps(after);
  // Changed if any dep added/removed/updated
  const names = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const name of names) {
    if (a[name] !== b[name]) return true;
  }
  return false;
}

function findAdrFiles(base) {
  const range = `origin/${base}...HEAD`;
  const out = sh(`git diff --name-only --diff-filter=ACM ${range} -- docs/adrs`);
  const files = out ? out.split('\n').filter(Boolean) : [];
  return files.filter(f => f.endsWith('.md'));
}

function validateAdrFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const hasStatus = /(^|\n)-\s*Status:\s*/i.test(content);
  const hasDate = /(^|\n)-\s*Date:\s*\d{4}-\d{2}-\d{2}/i.test(content);
  return hasStatus && hasDate;
}

function main() {
  const base = getBaseRef();
  fetchBase(base);
  const changed = getChangedFiles(base);

  const toolTouched = changed.some(isToolChange) || depsChanged(base, changed);

  if (!toolTouched) {
    console.log('No tool/config changes detected. ADR not required.');
    return;
  }

  const adrs = findAdrFiles(base);
  if (adrs.length === 0) {
    console.error('ERROR: Tool/config changes detected but no ADR files were added/modified in docs/adrs/.');
    process.exit(1);
  }

  const invalid = adrs.filter(f => !validateAdrFile(f));
  if (invalid.length > 0) {
    console.error(`ERROR: The following ADRs are missing required metadata (Status/Date):\n - ${invalid.join('\n - ')}`);
    process.exit(1);
  }

  console.log('ADR check passed: tool/config changes accompanied by ADR(s).');
}

main();
