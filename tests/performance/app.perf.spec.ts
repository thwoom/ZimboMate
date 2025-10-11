import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'

const distPath = join(process.cwd(), 'dist')

test.describe('Performance Baselines', () => {
  test('navigation timing stays within baseline thresholds', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('load')

    const metrics = await page.evaluate(() => {
      const [navigation] = performance.getEntriesByType(
        'navigation',
      ) as PerformanceNavigationTiming[]

      if (!navigation) return null

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd,
        loadEvent: navigation.loadEventEnd,
        transferSize: navigation.transferSize,
      }
    })

    expect(metrics).not.toBeNull()

    if (metrics) {
      await test.info().attach('navigation-metrics', {
        body: JSON.stringify(metrics, null, 2),
        contentType: 'application/json',
      })

      expect(
        metrics.domContentLoaded,
        'DOM content loaded should complete within 6s',
      ).toBeLessThanOrEqual(6000)
      expect(
        metrics.loadEvent,
        'Load event should fire within 8s to keep bundle responsive',
      ).toBeLessThanOrEqual(8000)
      expect(
        metrics.transferSize,
        'Transfer size should be non-zero to confirm assets were requested',
      ).toBeGreaterThan(0)
    }
  })

  test('bundle size budgets remain under regression thresholds', async () => {
    test.skip(
      !existsSync(distPath),
      'Build artifacts not found – run `npm run build` before enforcing bundle budgets.',
    )

    const assetsDir = join(distPath, 'assets')
    const entries = readdirSync(assetsDir)
    let totalJS = 0
    let totalCSS = 0

    for (const entry of entries) {
      const fullPath = join(assetsDir, entry)
      const stats = statSync(fullPath)

      if (entry.endsWith('.js')) totalJS += stats.size
      if (entry.endsWith('.css')) totalCSS += stats.size
    }

    await test.info().attach('bundle-size-summary', {
      body: JSON.stringify(
        {
          totalJS,
          totalCSS,
        },
        null,
        2,
      ),
      contentType: 'application/json',
    })

    expect(totalJS).toBeLessThanOrEqual(2.5 * 1024 * 1024)
    expect(totalCSS).toBeLessThanOrEqual(300 * 1024)
  })

  test('animation loop maintains an average >= 30fps', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const samples = await page.evaluate(async () => {
      const fpsSamples: number[] = []
      let frameCount = 0
      let lastSample = performance.now()

      return await new Promise<number[]>((resolve) => {
        const step = () => {
          frameCount += 1
          const now = performance.now()

          if (now - lastSample >= 1000) {
            fpsSamples.push(frameCount)
            frameCount = 0
            lastSample = now
          }

          if (fpsSamples.length >= 5) {
            resolve(fpsSamples)
            return
          }

          requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
      })
    })

    const averageFps =
      samples.reduce((accumulator, value) => accumulator + value, 0) /
      samples.length

    await test.info().attach('fps-samples', {
      body: JSON.stringify(samples),
      contentType: 'application/json',
    })

    expect(averageFps).toBeGreaterThanOrEqual(30)
  })
})
