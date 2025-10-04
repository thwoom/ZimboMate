import { useEffect } from 'react'
import { logger } from '@/utils/logger'

interface FontLoaderProps {
  onFontsLoaded?: (loaded: boolean) => void
}

export function FontLoader({ onFontsLoaded }: FontLoaderProps) {
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Wait for Google Fonts to be ready
        await document.fonts.ready

        // Verify key fonts are available
        const criticalFonts = [
          'Kalam',
          'Uncial Antiqua',
          'Metamorphous',
          'Orbitron',
          'Cinzel',
        ]
        const loadedFonts = criticalFonts.filter((fontName) =>
          document.fonts.check(`16px "${fontName}"`),
        )

        logger.info('font_loader_ready', {
          loaded: loadedFonts.length,
          total: criticalFonts.length,
          fonts: loadedFonts,
        })

        onFontsLoaded?.(loadedFonts.length >= 3) // Consider loaded if most fonts are available
      } catch (error) {
        logger.warn('font_loader_failed', { message: (error as Error)?.message ?? String(error) })
        onFontsLoaded?.(true) // Assume loaded to continue
      }
    }

    // Small delay to allow CSS to load
    const timer = setTimeout(loadFonts, 200)
    return () => clearTimeout(timer)
  }, [onFontsLoaded])

  return null // This component doesn't render anything
}
