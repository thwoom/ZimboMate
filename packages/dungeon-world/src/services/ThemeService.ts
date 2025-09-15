/**
 * Theme Management Service
 * Handles Arcane Slate and Cinder Black theme switching and persistence
 */

export type ThemeMode = 'arcane-slate' | 'cinder-black' | 'high-contrast' | 'auto'

export interface ThemePreferences {
  mode: ThemeMode
  followSystem: boolean
  customColors?: Record<string, string>
}

export class ThemeService {
  private static instance: ThemeService
  private currentTheme: ThemeMode = 'arcane-slate'
  private preferences: ThemePreferences
  private mediaQuery: MediaQueryList
  private listeners: Set<(theme: ThemeMode) => void> = new Set()

  private constructor() {
    // Load saved preferences
    this.preferences = this.loadPreferences()

    // Set up system theme detection
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this))

    // Initialize theme
    this.initializeTheme()
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService()
    }
    return ThemeService.instance
  }

  /**
   * Get current theme mode
   */
  getCurrentTheme(): ThemeMode {
    return this.currentTheme
  }

  /**
   * Set theme mode
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme
    this.preferences.mode = theme
    this.applyTheme()
    this.savePreferences()
    this.notifyListeners()
  }

  /**
   * Toggle between arcane-slate and cinder-black themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'arcane-slate' ? 'cinder-black' : 'arcane-slate'
    this.setTheme(newTheme)
  }

  /**
   * Set whether to follow system theme
   */
  setFollowSystem(follow: boolean): void {
    this.preferences.followSystem = follow
    if (follow) {
      this.setTheme('auto')
    }
    this.savePreferences()
  }

  /**
   * Get theme preferences
   */
  getPreferences(): ThemePreferences {
    return { ...this.preferences }
  }

  /**
   * Add theme change listener
   */
  addListener(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): Array<{ value: ThemeMode, label: string, description: string }> {
    return [
      {
        value: 'arcane-slate',
        label: 'Arcane Slate',
        description: 'Default dark theme with blue-purple accents',
      },
      {
        value: 'cinder-black',
        label: 'Cinder Black',
        description: 'Pure black theme with orange accents',
      },
      {
        value: 'auto',
        label: 'System',
        description: 'Follow system preference (Arcane Slate/Cinder Black)',
      },
      {
        value: 'high-contrast',
        label: 'High Contrast',
        description: 'High contrast mode for accessibility',
      },
    ]
  }

  /**
   * Get theme colors for current theme
   */
  getThemeColors(): Record<string, string> {
    const computedStyle = getComputedStyle(document.documentElement)

    return {
      background: computedStyle.getPropertyValue('--color-background').trim(),
      surface: computedStyle.getPropertyValue('--color-surface').trim(),
      surfaceElevated: computedStyle.getPropertyValue('--color-surface-elevated').trim(),
      primary: computedStyle.getPropertyValue('--color-primary').trim(),
      textPrimary: computedStyle.getPropertyValue('--color-text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
      textTertiary: computedStyle.getPropertyValue('--color-text-tertiary').trim(),
      success: computedStyle.getPropertyValue('--color-success').trim(),
      warning: computedStyle.getPropertyValue('--color-warning').trim(),
      danger: computedStyle.getPropertyValue('--color-danger').trim(),
      border: computedStyle.getPropertyValue('--color-border').trim(),
      borderSubtle: computedStyle.getPropertyValue('--color-border-subtle').trim(),
    }
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.currentTheme === 'arcane-slate' || this.currentTheme === 'cinder-black'
      || (this.currentTheme === 'auto')
  }

  /**
   * Check if current theme is high contrast
   */
  isHighContrastTheme(): boolean {
    return this.currentTheme === 'high-contrast'
  }

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)

    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Check if theme meets accessibility standards
   */
  checkAccessibility(): {
    wcagAA: boolean
    wcagAAA: boolean
    issues: string[]
  } {
    const colors = this.getThemeColors()
    const issues: string[] = []

    // Check text contrast ratios
    const textContrast = this.getContrastRatio(colors.textPrimary, colors.background)
    const secondaryTextContrast = this.getContrastRatio(colors.textSecondary, colors.background)

    const wcagAA = textContrast >= 4.5 && secondaryTextContrast >= 3
    const wcagAAA = textContrast >= 7 && secondaryTextContrast >= 4.5

    if (textContrast < 4.5) {
      issues.push('Primary text contrast ratio is below WCAG AA standard')
    }

    if (secondaryTextContrast < 3) {
      issues.push('Secondary text contrast ratio is below WCAG AA standard')
    }

    return { wcagAA, wcagAAA, issues }
  }

  /**
   * Private methods
   */
  private initializeTheme(): void {
    if (this.preferences.followSystem || this.preferences.mode === 'auto') {
      // For auto mode, default to arcane-slate (both are dark themes)
      this.currentTheme = 'arcane-slate'
    }
    else {
      this.currentTheme = this.preferences.mode
    }

    this.applyTheme()
  }

  private applyTheme(): void {
    const root = document.documentElement

    // Remove existing theme classes
    root.removeAttribute('data-theme')

    // Apply new theme
    if (this.currentTheme === 'auto') {
      // Default to arcane-slate for auto mode
      root.setAttribute('data-theme', 'arcane-slate')
    }
    else if (this.currentTheme === 'arcane-slate') {
      // Arcane slate is default, but set explicitly for clarity
      root.setAttribute('data-theme', 'arcane-slate')
    }
    else {
      root.setAttribute('data-theme', this.currentTheme)
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor()
  }

  private updateMetaThemeColor(): void {
    const colors = this.getThemeColors()
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }

    metaThemeColor.setAttribute('content', colors.surface || colors.background)
  }

  private handleSystemThemeChange(): void {
    if (this.preferences.followSystem || this.preferences.mode === 'auto') {
      // Keep current theme for auto mode since both themes are dark
      this.applyTheme()
      this.notifyListeners()
    }
  }

  private loadPreferences(): ThemePreferences {
    try {
      const saved = localStorage.getItem('zimbomate-theme-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Migrate old theme values
        if (parsed.mode === 'dark' || parsed.mode === 'light' || parsed.mode === 'moon') {
          parsed.mode = 'arcane-slate'
        }
        return { ...this.getDefaultPreferences(), ...parsed }
      }
    }
    catch {
      // Ignore errors
    }

    return this.getDefaultPreferences()
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('zimbomate-theme-preferences', JSON.stringify(this.preferences))
    }
    catch {
      // Ignore errors
    }
  }

  private getDefaultPreferences(): ThemePreferences {
    return {
      mode: 'arcane-slate',
      followSystem: false,
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) listener(this.currentTheme)
  }

  private getLuminance(color: string): number {
    // Convert color to RGB
    const rgb = this.hexToRgb(color)
    if (!rgb)
      return 0

    // Calculate relative luminance
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }
}

// Export singleton instance
export const themeService = ThemeService.getInstance()