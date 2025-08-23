# Motion v12 Compatibility CI Checks

This document describes the CI integration for Motion v12 compatibility checks in ZimboMate.

## Overview

The project uses a Motion v12 compatibility layer to support legacy Motion v11 APIs (`timeline`, `glide`) while migrating to Motion v12 patterns. CI checks ensure no new legacy API usage is introduced.

## CI Scripts

### Installation
```bash
npm run ci:install
```
Installs dependencies with `--legacy-peer-deps` to handle React 19 + Arwes peer dependency conflicts.

### Build
```bash
npm run ci:build
```
Runs TypeScript compilation and Vite production build.

### Motion Compatibility Test
```bash
npm run ci:test
```
Runs Vitest tests for Motion compatibility layer:
- Verifies all Motion v12 APIs are available
- Tests compatibility exports (`timeline`, `glide`)
- Validates shim functionality

### Legacy API Scan
```bash
npm run ci:check
```
Scans source code for legacy Motion API usage:
- Legacy imports (`import { timeline, glide } from 'motion'`)
- Direct `glide()` function calls
- Direct `timeline()` function calls
- Old spring easing patterns

## CI Pipeline Integration

### GitHub Actions Example
```yaml
name: Motion Compatibility Checks
on: [push, pull_request]

jobs:
  motion-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run ci:install
      
      - name: Run Motion compatibility tests
        run: npm run ci:test
      
      - name: Scan for legacy Motion API usage
        run: npm run ci:check
      
      - name: Build production bundle
        run: npm run ci:build
```

### Azure DevOps Example
```yaml
trigger:
  - main
  - feature/*

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm run ci:install
    npm run ci:test
    npm run ci:check
    npm run ci:build
  displayName: 'Motion Compatibility Checks'
```

## Expected Results

### ✅ Success Case
```
✅ No legacy Motion API usage found!
🎉 All code uses Motion v12 patterns
```

### ❌ Failure Case
```
🚨 Legacy Motion API usage detected:
❌ Found legacy Motion imports:
   src/components/Example.tsx:5 - import { timeline } from 'motion';
❌ Found glide() calls:
   src/utils/animation.ts:12 - const easing = glide({ velocity: 1000 });

💡 Migration needed: Replace with Motion v12 patterns
   - glide() → { type: inertia, ... }
   - timeline() → animate(sequence)
   - easing: spring() → { type: spring, ... }
```

## Migration Guide

When legacy API usage is detected:

1. **Replace `glide()` calls:**
   ```typescript
   // ❌ Legacy
   animate(element, { x: 100 }, { easing: glide({ velocity: 1000 }) });
   
   // ✅ Motion v12
   animate(element, { x: 100 }, { type: 'inertia', velocity: 1000 });
   ```

2. **Replace `timeline()` calls:**
   ```typescript
   // ❌ Legacy
   timeline([
     [element, { opacity: 1 }, { duration: 0.3 }]
   ]);
   
   // ✅ Motion v12
   animate([
     [element, { opacity: 1 }, { duration: 0.3 }]
   ]);
   ```

3. **Replace spring easing:**
   ```typescript
   // ❌ Legacy
   animate(element, { x: 100 }, { easing: spring({ stiffness: 300 }) });
   
   // ✅ Motion v12
   animate(element, { x: 100 }, { type: spring, stiffness: 300 });
   ```

## Troubleshooting

### Build Failures
- Ensure Motion compatibility plugin is active in `vite.config.ts`
- Check TypeScript declarations in `types/motion-compat.d.ts`
- Verify all Arwes packages are on the same version

### Test Failures
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server: `npm run dev`
- Check Motion compatibility sanity check in `src/App.tsx`

### Scan False Positives
- Test files may contain legacy API usage for testing compatibility
- Demo files may show migration examples
- Focus on production source code in `src/` directory

## Maintenance

- Update Motion compatibility plugin when Motion v12 releases new versions
- Review and update TypeScript declarations as needed
- Monitor Arwes package updates for compatibility changes
- Keep CI scripts updated with latest best practices
