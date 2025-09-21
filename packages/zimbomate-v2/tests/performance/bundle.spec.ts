import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

test.describe('Bundle Size & Performance Tests', () => {
  const distPath = join(process.cwd(), 'dist')

  test('bundle sizes are within limits', async () => {
    // Check if build exists
    expect(existsSync(distPath)).toBeTruthy()

    const bundleStats = getBundleStats(distPath)

    // Main bundle should be under 2MB (good for gaming apps with 3D)
    expect(bundleStats.mainBundle.size).toBeLessThan(2 * 1024 * 1024)

    // Vendor bundle should be under 1.5MB
    expect(bundleStats.vendorBundle.size).toBeLessThan(1.5 * 1024 * 1024)

    // 3D libraries bundle can be larger but should be under 3MB
    expect(bundleStats.threeBundle.size).toBeLessThan(3 * 1024 * 1024)

    // CSS should be under 200KB
    expect(bundleStats.cssSize).toBeLessThan(200 * 1024)

    console.log('Bundle Analysis:', {
      main: `${(bundleStats.mainBundle.size / 1024 / 1024).toFixed(2)}MB`,
      vendor: `${(bundleStats.vendorBundle.size / 1024 / 1024).toFixed(2)}MB`,
      three: `${(bundleStats.threeBundle.size / 1024 / 1024).toFixed(2)}MB`,
      css: `${(bundleStats.cssSize / 1024).toFixed(2)}KB`,
      total: `${(bundleStats.totalSize / 1024 / 1024).toFixed(2)}MB`
    })
  })

  test('lighthouse performance score', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Run basic performance checks
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const metrics = {
            fcp: 0,
            lcp: 0,
            fid: 0,
            cls: 0
          }

          entries.forEach((entry) => {
            switch (entry.entryType) {
              case 'paint':
                if (entry.name === 'first-contentful-paint') {
                  metrics.fcp = entry.startTime
                }
                break
              case 'largest-contentful-paint':
                metrics.lcp = entry.startTime
                break
              case 'first-input':
                metrics.fid = entry.processingStart - entry.startTime
                break
              case 'layout-shift':
                if (!(entry as any).hadRecentInput) {
                  metrics.cls += (entry as any).value
                }
                break
            }
          })

          setTimeout(() => resolve(metrics), 3000)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
      })
    })

    const metrics = await performanceMetrics as any

    // Gaming apps can be more lenient on some metrics
    expect(metrics.fcp).toBeLessThan(3000) // 3s for first paint
    expect(metrics.lcp).toBeLessThan(4000) // 4s for largest paint (3D loading)
    expect(metrics.cls).toBeLessThan(0.25) // Cumulative layout shift

    console.log('Performance Metrics:', {
      FCP: `${metrics.fcp.toFixed(0)}ms`,
      LCP: `${metrics.lcp.toFixed(0)}ms`,
      FID: `${metrics.fid.toFixed(0)}ms`,
      CLS: metrics.cls.toFixed(3)
    })
  })

  test('memory usage during gaming session', async ({ page }) => {
    await page.goto('/')

    // Get initial memory
    const initialMemory = await getMemoryUsage(page)

    // Simulate extended gaming session
    for (let i = 0; i < 50; i++) {
      // Switch between tabs
      await page.click('[role="tab"][aria-label*="Dice"]')
      await page.click('button[aria-label*="Roll"]')
      await page.waitForTimeout(100)

      await page.click('[role="tab"][aria-label*="Character"]')
      await page.waitForTimeout(100)

      // Every 10 iterations, force garbage collection
      if (i % 10 === 0) {
        await page.evaluate(() => {
          if ('gc' in window) {
            (window as any).gc()
          }
        })
      }
    }

    // Check memory after session
    const finalMemory = await getMemoryUsage(page)
    const memoryGrowth = finalMemory - initialMemory

    // Memory growth should be under 50MB for extended session
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)

    console.log('Memory Analysis:', {
      initial: `${(initialMemory / 1024 / 1024).toFixed(2)}MB`,
      final: `${(finalMemory / 1024 / 1024).toFixed(2)}MB`,
      growth: `${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`
    })
  })

  test('3D rendering performance', async ({ page }) => {
    await page.goto('/')
    await page.click('[role="tab"][aria-label*="Dice"]')

    // Measure FPS during dice animation
    const fpsData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const fps: number[] = []
        let lastTime = performance.now()
        let frameCount = 0

        function measureFPS() {
          const currentTime = performance.now()
          frameCount++

          if (currentTime - lastTime >= 1000) {
            fps.push(frameCount)
            frameCount = 0
            lastTime = currentTime
          }

          if (fps.length < 5) {
            requestAnimationFrame(measureFPS)
          } else {
            resolve(fps)
          }
        }

        measureFPS()
      })
    })

    const avgFPS = (fpsData as number[]).reduce((a, b) => a + b, 0) / (fpsData as number[]).length

    // Gaming apps should maintain at least 30 FPS
    expect(avgFPS).toBeGreaterThan(30)

    console.log('3D Performance:', {
      averageFPS: avgFPS.toFixed(1),
      samples: fpsData
    })
  })
})

function getBundleStats(distPath: string) {
  const files = require('fs').readdirSync(distPath + '/assets', { withFileTypes: true })

  let mainBundle = { size: 0, name: '' }
  let vendorBundle = { size: 0, name: '' }
  let threeBundle = { size: 0, name: '' }
  let cssSize = 0
  let totalSize = 0

  files.forEach((file: any) => {
    if (file.isFile()) {
      const filePath = join(distPath, 'assets', file.name)
      const stats = require('fs').statSync(filePath)
      const size = stats.size
      totalSize += size

      if (file.name.includes('index-') && file.name.endsWith('.js')) {
        mainBundle = { size, name: file.name }
      } else if (file.name.includes('vendor-') && file.name.endsWith('.js')) {
        vendorBundle = { size, name: file.name }
      } else if (file.name.includes('three-') && file.name.endsWith('.js')) {
        threeBundle = { size, name: file.name }
      } else if (file.name.endsWith('.css')) {
        cssSize += size
      }
    }
  })

  return { mainBundle, vendorBundle, threeBundle, cssSize, totalSize }
}

async function getMemoryUsage(page: any): Promise<number> {
  return await page.evaluate(() => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  })
}