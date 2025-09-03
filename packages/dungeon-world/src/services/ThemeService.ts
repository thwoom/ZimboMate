/**
 * Theme Management Service * Handles Rose Pine theme switching and persistence
 */

export type ThemeMode = 'dark' | 'light' | 'moon' | 'high-contrast' | 'auto';

export interface ThemePreferences {
  mode: ThemeMode;
  followSystem: boolean;
  customColors?: Record < string, string>;
}

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme: ThemeMode = 'dark';
  private preferences: ThemePreferences;
  private mediaQuery: MediaQueryList;
  private listeners: Set<(theme: ThemeMode) => void> = new Set();

  private constructor() {
    // Load saved preferences
    this.preferences = this.loadPreferences();

    // Set up system theme detection
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // Initialize theme
    this.initializeTheme();
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Get current theme mode
   */
  getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * Set theme mode
   */
  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.preferences.mode = theme;
    this.applyTheme();
    this.savePreferences();
    this.notifyListeners();
  }

  /**
   * Toggle between dark and light themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set whether to follow system theme
   */
  setFollowSystem(follow: boolean): void {
    this.preferences.followSystem = follow;
    if (follow) {
      this.setTheme('auto');
    }
    this.savePreferences();
  }

  /**
   * Get theme preferences
   */
  getPreferences(): ThemePreferences {
    return { ...this.preferences };
  }

  /**
   * Add theme change listener
   */
  addListener(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): Array<{ value: ThemeMode; label: string; description: string }> {
    return [
      {
        value: 'dark',
        label: 'Rose Pine',
        description: 'Dark theme with warm, muted colors',
      },
      {
        value: 'light',
        label: 'Rose Pine Dawn',
        description: 'Light theme with soft, natural tones',
      },
      {
        value: 'moon',
        label: 'Rose Pine Moon',
        description: 'Alternative dark theme with cooler tones',
      },
      {
        value: 'auto',
        label: 'System',
        description: 'Follow system preference',
      },
      {
        value: 'high-contrast',
        label: 'High Contrast',
        description: 'High contrast mode for accessibility',
      },
    ];
  }

  /**
   * Get theme colors for current theme
   */
  getThemeColors(): Record < string, string> {
    const computedStyle = getComputedStyle(document.documentElement);

    return {
      background: computedStyle.getPropertyValue('--color-background').trim(),
      surface: computedStyle.getPropertyValue('--color-surface').trim(),
      primary: computedStyle.getPropertyValue('--color-primary').trim(),
      textPrimary: computedStyle.getPropertyValue('--color-text-primary').trim(),
      textSecondary: computedStyle.getPropertyValue('--color-text-secondary').trim(),
      success: computedStyle.getPropertyValue('--color-success').trim(),
      warning: computedStyle.getPropertyValue('--color-warning').trim(),
      danger: computedStyle.getPropertyValue('--color-danger').trim(),
      border: computedStyle.getPropertyValue('--color-border').trim(),
    };
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.currentTheme === 'dark' || this.currentTheme === 'moon' ||
           (this.currentTheme === 'auto' && this.mediaQuery.matches);
  }

  /**
   * Check if current theme is light
   */
  isLightTheme(): boolean {
    return this.currentTheme === 'light' ||
           (this.currentTheme === 'auto' && !this.mediaQuery.matches);
  }

  /**
   * Get contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if theme meets accessibility standards
   */
  checkAccessibility(): {
    wcagAA: boolean;
    wcagAAA: boolean;
    issues: string[];
  } {
    const colors = this.getThemeColors();
    const issues: string[] = [];

    // Check text contrast ratios
    const textContrast = this.getContrastRatio(colors.textPrimary, colors.background);
    const secondaryTextContrast = this.getContrastRatio(colors.textSecondary, colors.background);

    const wcagAA = textContrast >= 4.5 && secondaryTextContrast >= 3;
    const wcagAAA = textContrast >= 7 && secondaryTextContrast >= 4.5;

    if (textContrast < 4.5) {
      issues.push('Primary text contrast ratio is below WCAG AA standard');
    }

    if (secondaryTextContrast < 3) {
      issues.push('Secondary text contrast ratio is below WCAG AA standard');
    }

    return { wcagAA, wcagAAA, issues };
  }

  /**
   * Private methods
   */
  private initializeTheme(): void {
    if (this.preferences.followSystem || this.preferences.mode === 'auto') {
      this.currentTheme = this.mediaQuery.matches ? 'dark' : 'light';
    } else {
      this.currentTheme = this.preferences.mode;
    }

    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;

    // Remove existing theme classes
    root.removeAttribute('data-theme');

    // Apply new theme
    if (this.currentTheme === 'auto') {
      const systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
      if (systemTheme === 'light') {
        root.setAttribute('data-theme', 'light');
      }
      // Dark is default, no attribute needed
    } else if (this.currentTheme !== 'dark') {
      root.setAttribute('data-theme', this.currentTheme);
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor();
  }

  private updateMetaThemeColor(): void {
    const colors = this.getThemeColors();
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', colors.surface || colors.background);
  }

  private handleSystemThemeChange(): void {
    if (this.preferences.followSystem || this.preferences.mode === 'auto') {
      this.currentTheme = this.mediaQuery.matches ? 'dark' : 'light';
      this.applyTheme();
      this.notifyListeners();
    }
  }

  private loadPreferences(): ThemePreferences {
    try {
      const saved = localStorage.getItem('zimbomate-theme-preferences');
      if (saved) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(saved) };
      }
    } catch {
      }

    return this.getDefaultPreferences();
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('zimbomate-theme-preferences', JSON.stringify(this.preferences));
    } catch {
      }
  }

  private getDefaultPreferences(): ThemePreferences {
    return {
      mode: 'dark',
      followSystem: false,
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) listener(this.currentTheme);
  }

  private getLuminance(color: string): number {
    // Convert color to RGB
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    // Calculate relative luminance
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16),
    } : null;
  }
}

// Export singleton instance
export const themeService = ThemeService.getInstance();



