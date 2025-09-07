#!/usr/bin/env tsx

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, relative, dirname, basename } from 'path';
import { glob } from 'glob';

function toPosixPath(p: string) {
  return p.replace(/\\/g, '/');
}

async function findImages(root: string, dirs: string[]): Promise<string[]> {
  const all: string[] = [];
  for (const dir of dirs) {
    const abs = resolve(root, dir);
    if (!existsSync(abs)) continue;
    const matches = await glob('**/*.{png,jpg,jpeg,webp}', { cwd: abs, nodir: true, dot: false });
    for (const m of matches) {
      all.push(resolve(abs, m));
    }
  }
  // Sort by mtime (newest first) would require fs.stat; keep simple by name for now
  all.sort();
  return all;
}

function buildHtml(outputDir: string, imagePaths: string[]) {
  const items = imagePaths.map((abs) => {
    const rel = toPosixPath(relative(outputDir, abs));
    const name = basename(abs);
    return `
      <div class="card">
        <div class="meta">
          <div class="name">${name}</div>
          <div class="actions">
            <a href="${rel}" target="_blank">Open</a>
            <a href="${rel}" download>Download</a>
          </div>
        </div>
        <img src="${rel}" alt="${name}" onclick="window.open(this.src)" />
      </div>
    `;
  }).join('\n');

  const css = `
    body { margin: 0; padding: 20px; background: #0b0b0b; color: #eaeaea; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
    h1 { margin: 0 0 16px 0; font-weight: 600; font-size: 20px; }
    .container { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .card { background: #151515; border: 1px solid #2a2a2a; border-radius: 8px; overflow: hidden; }
    .meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #2a2a2a; }
    .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
    .actions a { color: #9ad1ff; text-decoration: none; margin-left: 12px; font-size: 13px; }
    .actions a:hover { text-decoration: underline; }
    img { display: block; width: 100%; height: auto; background: #000; cursor: zoom-in; }
    .empty { opacity: 0.7; padding: 24px; }
    .hint { margin: 12px 0 20px; color: #bdbdbd; font-size: 13px; }
    code { background: #1f1f1f; padding: 2px 6px; border-radius: 4px; }
  `;

  const hint = `Images sourced from: ${imagePaths.length} files`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>UI Screenshot Gallery</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${css}</style>
  <script>
    // No JS needed beyond simple open()-on-click; kept minimal for portability
  </script>
  </head>
<body>
  <h1>UI Screenshot Gallery</h1>
  <div class="hint">${hint}</div>
  <div class="container">
    ${items || '<div class="empty">No images found. Run your capture first.</div>'}
  </div>
</body>
</html>`;
  return html;
}

async function main() {
  const projectRoot = process.cwd();
  const outputDir = resolve(projectRoot, 'artifacts');
  const outFile = resolve(outputDir, 'gallery.html');
  const dirsEnv = process.env.GALLERY_DIRS || 'artifacts/playwright,screenshots';
  const sourceDirs = dirsEnv.split(',').map((d) => d.trim()).filter(Boolean);

  const images = await findImages(projectRoot, sourceDirs);
  mkdirSync(outputDir, { recursive: true });
  const html = buildHtml(dirname(outFile), images);
  writeFileSync(outFile, html);
  // eslint-disable-next-line no-console
  console.log(`Gallery written: ${outFile}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate gallery:', err);
  process.exitCode = 1;
});


