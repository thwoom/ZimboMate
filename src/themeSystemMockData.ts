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

// New magical theme information with distinct color separation and creative typography
export const magicalThemes = {
  'moonlit-grimoire': {
    name: 'Moonlit Grimoire',
    description: 'Ancient manuscript style with scholarly elegance - magic written in starlight',
    primaryColor: '#e2e8f0',
    backgroundColor: '#0a0e1a',
    mood: 'Mysterious, scholarly, ethereal',
    bestFor: 'Night gaming, wizard characters, academic magic',
    colorFamily: 'Cool Blues & Silver',
    typography: {
      display: 'Uncial Antiqua - Ancient manuscript lettering',
      body: 'Spectral - Elegant scholarly reading',
      personality: 'Medieval manuscripts meet modern readability'
    }
  },
  'dragonforge-ember': {
    name: 'Dragonforge Ember',
    description: 'Bold fantasy lettering forged in dragon fire - power carved in molten steel',
    primaryColor: '#f97316',
    backgroundColor: '#450a0a',
    mood: 'Intense, powerful, fiery',
    bestFor: 'Combat campaigns, barbarian/fighter characters, epic battles',
    colorFamily: 'Deep Reds & Molten Orange',
    typography: {
      display: 'Metamorphous - Bold fantasy lettering',
      body: 'Crimson Text - Strong readable serif',
      personality: 'Epic fantasy meets battle-hardened strength'
    }
  },
  'enchanted-grove': {
    name: 'Enchanted Grove',
    description: 'Organic handwritten script flowing like nature - magic written by the forest itself',
    primaryColor: '#10b981',
    backgroundColor: '#064e3b',
    mood: 'Natural, mystical, harmonious',
    bestFor: 'Nature campaigns, druid/ranger characters, forest adventures',
    colorFamily: 'Forest Greens & Cyan',
    typography: {
      display: 'Kalam - Organic handwritten feel',
      body: 'Nunito - Natural rounded sans-serif',
      personality: 'Nature\'s handwriting meets organic harmony'
    }
  },
  'arcane-storm': {
    name: 'Arcane Storm',
    description: 'Futuristic electric typography crackling with magical energy - technology meets sorcery',
    primaryColor: '#e879f9',
    backgroundColor: '#581c87',
    mood: 'Electric, chaotic, powerful',
    bestFor: 'High-magic campaigns, sorcerer characters, planar adventures',
    colorFamily: 'Electric Purple & Magenta',
    typography: {
      display: 'Orbitron - Futuristic electric lettering',
      body: 'Exo 2 - Modern tech aesthetic',
      personality: 'Cyberpunk magic meets electric energy'
    }
  },
  'ancient-sandstone': {
    name: 'Ancient Sandstone',
    description: 'Classical lettering carved in timeless stone - wisdom of ancient civilizations',
    primaryColor: '#c2410c',
    backgroundColor: '#fef7ed',
    mood: 'Ancient, warm, archaeological',
    bestFor: 'Desert campaigns, exploration, ancient mysteries',
    colorFamily: 'Warm Terracotta & Teal',
    typography: {
      display: 'Cinzel - Classical carved stone lettering',
      body: 'Lora - Timeless readable serif',
      personality: 'Roman inscriptions meet archaeological discovery'
    }
  }
}