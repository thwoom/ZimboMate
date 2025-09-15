import { ColorVariant } from './types/enums'

interface ColorInfo {
  shade: string
  value: string
  name: string
}

interface ColorPaletteInfo {
  variant: ColorVariant
  title: string
  colors: ColorInfo[]
}

export const colorPalettes: Record<string, ColorPaletteInfo> = {
  parchment: {
    variant: 'parchment',
    title: 'Parchment & Warmth',
    colors: [
      { shade: '50', value: '#fdfcf8', name: 'Lightest' },
      { shade: '200', value: '#f3ede0', name: 'Light' },
      { shade: '500', value: '#d4c8a8', name: 'Base' },
      { shade: '700', value: '#a89d7e', name: 'Dark' },
      { shade: '900', value: '#6b5940', name: 'Darkest' }
    ]
  },
  gold: {
    variant: 'gold',
    title: 'Mystical Gold',
    colors: [
      { shade: '100', value: '#fef9c3', name: 'Lightest' },
      { shade: '300', value: '#fde047', name: 'Light' },
      { shade: '500', value: '#d4af37', name: 'Base' },
      { shade: '700', value: '#a67c00', name: 'Dark' },
      { shade: '900', value: '#713f12', name: 'Darkest' }
    ]
  },
  magic: {
    variant: 'magic',
    title: 'Enchanted Purple',
    colors: [
      { shade: '100', value: '#f3e8ff', name: 'Lightest' },
      { shade: '300', value: '#d8b4fe', name: 'Light' },
      { shade: '500', value: '#a855f7', name: 'Base' },
      { shade: '700', value: '#7c3aed', name: 'Dark' },
      { shade: '900', value: '#581c87', name: 'Darkest' }
    ]
  },
  nature: {
    variant: 'nature',
    title: 'Nature Green',
    colors: [
      { shade: '100', value: '#dcfce7', name: 'Lightest' },
      { shade: '300', value: '#86efac', name: 'Light' },
      { shade: '500', value: '#22c55e', name: 'Base' },
      { shade: '700', value: '#15803d', name: 'Dark' },
      { shade: '900', value: '#14532d', name: 'Darkest' }
    ]
  }
}