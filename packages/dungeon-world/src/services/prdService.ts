import type { PRD } from '../lib/prd'
import { existsSync, statSync } from 'node:fs'

import { resolve } from 'node:path'
import { loadPRD } from '../lib/prd'

interface CacheEntry {
  prd: PRD
  lastModified: number
  filePath: string
}

class PRDService {
  private cache: Map <string, CacheEntry> = new Map()
  private defaultPath: string

  constructor(defaultPath = 'docs/PRD.md') {
    this.defaultPath = resolve(process.cwd(), defaultPath.replace(/[^\w/.-]/g, ''))
  }

  /**
   * Get the PRD with caching and automatic invalidation on file changes
   */
  getPRD(prdPath?: string): PRD {
    const filePath = prdPath
      ? resolve(process.cwd(), prdPath.replace(/[^\w/.-]/g, ''))
      : this.defaultPath
    const cacheKey = filePath

    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`PRD file not found: ${filePath}`)
    }

    // Get file stats for modification time
    const stats = statSync(filePath)
    const lastModified = stats.mtime.getTime()

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && cached.lastModified >= lastModified) {
      return cached.prd
    }

    // Cache miss or file changed, reload
    const prd = loadPRD(filePath)

    // Update cache
    this.cache.set(cacheKey, {
      prd,
      lastModified,
      filePath,
    })

    return prd
  }

  /**
   * Force refresh the cache for a specific file
   */
  refreshCache(prdPath?: string): void {
    const filePath = prdPath
      ? resolve(process.cwd(), prdPath.replace(/[^\w/.-]/g, ''))
      : this.defaultPath
    const cacheKey = filePath

    this.cache.delete(cacheKey)
  }

  /**
   * Clear all cached entries
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, entries: string[] } {
    return {
      size: this.cache.size,
      entries: [...this.cache.keys()],
    }
  }

  /**
   * Check if a file is cached and up to date
   */
  isCached(prdPath?: string): boolean {
    const filePath = prdPath
      ? resolve(process.cwd(), prdPath.replace(/[^\w/.-]/g, ''))
      : this.defaultPath
    const cacheKey = filePath

    const cached = this.cache.get(cacheKey)
    if (!cached)
      return false

    if (!existsSync(filePath))
      return false

    const stats = statSync(filePath)
    const lastModified = stats.mtime.getTime()

    return cached.lastModified >= lastModified
  }

  /**
   * Get the last modification time of a cached file
   */
  getLastModified(prdPath?: string): number | null {
    const filePath = prdPath
      ? resolve(process.cwd(), prdPath.replace(/[^\w/.-]/g, ''))
      : this.defaultPath
    const cacheKey = filePath

    const cached = this.cache.get(cacheKey)
    return cached ? cached.lastModified : null
  }
}

// Singleton instance
let prdServiceInstance: PRDService | null = null

/**
 * Get the singleton PRD service instance
 */
export function getPRDService(defaultPath?: string): PRDService {
  if (!prdServiceInstance) {
    prdServiceInstance = new PRDService(defaultPath)
  }
  return prdServiceInstance
}

/**
 * Convenience function to get PRD with caching
 */
export function getPRD(prdPath?: string): PRD {
  return getPRDService().getPRD(prdPath)
}

export { PRDService }
export type { CacheEntry }
