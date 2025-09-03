# Rose Pine Theme Implementation Guide

## Overview

This guide documents the implementation of the Rose Pine color palette in ZimboMate, providing developers with everything needed to maintain and extend the theming system.

## Architecture

### Theme Service (`src/services/ThemeService.ts`)
The `ThemeService` is a singleton that manages theme state, persistence, and switching:

```typescript
import { themeService } from '../services/ThemeService';

// Get current theme
const currentTheme = themeService.getCurrentTheme();

// Set theme
themeService.setTheme('light');

// Listen for theme changes
const unsubscribe = themeService.addListener((theme) => {
  console.log('Theme changed to:', theme);
});
```text

### CSS Variables (`src/styles/rose-pine-variables.css`)
All theme colors are defined as CSS custom properties:

```css
:root {
  /* Rose Pine Main (Dark Theme) */
  --rp-base: #191724;
  --rp-surface: #1f1d2e;
  --rp-text: #e0def4;
  /* ... */
  
  /* Semantic mappings */
  --color-background: var(--rp-base);
  --color-text-primary: var(--rp-text);
  /* ... */
}
```text

## Theme Variants

### 1. Rose Pine Main (Default Dark)
**Usage**: Default theme, warm and cozy
**Base Color**: `#191724`
**Best For**: Extended gaming sessions, low-light environments

### 2. Rose Pine Dawn (Light)
**Usage**: Light theme for bright environments
**Base Color**: `#faf4ed`
**Best For**: Daytime use, high-ambient-light situations

### 3. Rose Pine Moon (Alternative Dark)
**Usage**: Cooler alternative to main theme
**Base Color**: `#232136`
**Best For**: Users who prefer cooler tones

### 4. Auto Theme
**Usage**: Follows system preference
**Implementation**: Switches between dark/light based on `prefers-color-scheme`

### 5. High Contrast
**Usage**: Accessibility-focused theme
**Colors**: Pure black/white with high contrast ratios
**Best For**: Users with visual impairments

## Implementation Patterns

### Component Styling
Always use semantic CSS variables instead of raw colors:

```css
/* ✅ Good */
.character-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

/* ❌ Bad */
.character-card {
  background: #1f1d2e;
  border: 1px solid #403d52;
  color: #e0def4;
}
```text

### Game State Colors
Use specific game-state variables for consistency:

```css
.hp-bar.full { background: var(--color-hp-full); }
.hp-bar.injured { background: var(--color-hp-injured); }
.hp-bar.critical { background: var(--color-hp-critical); }

.roll-result.success { color: var(--color-roll-success); }
.roll-result.partial { color: var(--color-roll-partial); }
.roll-result.failure { color: var(--color-roll-failure); }
```text

### Stat Colors
Each ability score has its own color:

```css
.stat-str { color: var(--color-stat-str); }
.stat-dex { color: var(--color-stat-dex); }
.stat-con { color: var(--color-stat-con); }
.stat-int { color: var(--color-stat-int); }
.stat-wis { color: var(--color-stat-wis); }
.stat-cha { color: var(--color-stat-cha); }
```text

## Theme Switching

### Programmatic Theme Changes
```typescript
import { themeService } from '../services/ThemeService';

// Set specific theme
themeService.setTheme('light');
themeService.setTheme('dark');
themeService.setTheme('moon');
themeService.setTheme('auto');
themeService.setTheme('high-contrast');

// Toggle between dark and light
themeService.toggleTheme();

// Follow system preference
themeService.setFollowSystem(true);
```text

### React Component Integration
```tsx
import React, { useState, useEffect } from 'react';
import { themeService, ThemeMode } from '../services/ThemeService';

const MyComponent: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(themeService.getCurrentTheme());

  useEffect(() => {
    const unsubscribe = themeService.addListener(setTheme);
    return unsubscribe;
  }, []);

  return (
    <div className={`my-component theme-${theme}`}>
      {/* Component content */}
    </div>
  );
};
```text

## CSS Implementation Details

### Theme Application
Themes are applied via `data-theme` attribute on the document root:

```html
<!-- Dark theme (default, no attribute needed) -->
<html>

<!-- Light theme -->
<html data-theme="light">

<!-- Moon theme -->
<html data-theme="moon">

<!-- High contrast theme -->
<html data-theme="high-contrast">
```text

### Variable Overrides
Light and alternative themes override the default variables:

```css
/* Default (dark) theme */
:root {
  --color-background: var(--rp-base);
  --color-text-primary: var(--rp-text);
}

/* Light theme overrides */
[data-theme="light"] {
  --color-background: var(--rp-dawn-base);
  --color-text-primary: var(--rp-dawn-text);
}
```text

## Accessibility Considerations

### Contrast Ratios
All theme variants meet WCAG AA standards:
- Primary text: ≥ 4.5:1 contrast ratio
- Secondary text: ≥ 3:1 contrast ratio
- Interactive elements: ≥ 3:1 contrast ratio

### System Integration
The theme service respects system preferences:

```typescript
// Automatically detects system theme preference
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Respects reduced motion preference
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-normal: 0ms;
    --transition-slow: 0ms;
  }
}
```text

### High Contrast Mode
Special handling for users who need maximum contrast:

```css
[data-theme="high-contrast"] {
  --color-background: #000000;
  --color-surface: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-border: #ffffff;
  --color-primary: #00ff00;
  --color-danger: #ff0000;
}
```text

## Performance Optimizations

### CSS Custom Properties
Using CSS variables allows for instant theme switching without re-parsing stylesheets:

```css
/* Transitions apply to theme changes */
.themed-element {
  background: var(--color-surface);
  transition: background-color var(--transition-normal);
}
```text

### Minimal JavaScript
Theme switching requires minimal JavaScript - just setting a data attribute:

```typescript
// Efficient theme application
document.documentElement.setAttribute('data-theme', 'light');
```text

### Caching
Theme preferences are cached in localStorage:

```typescript
// Automatic persistence
localStorage.setItem('zimbomate-theme-preferences', JSON.stringify(preferences));
```text

## Extending the Theme System

### Adding New Themes
1. Define color palette in `rose-pine-variables.css`:
```css
/* New theme colors */
--rp-custom-base: #your-color;
--rp-custom-surface: #your-color;
/* ... */
```text

2. Add theme variant:
```css
[data-theme="custom"] {
  --color-background: var(--rp-custom-base);
  --color-surface: var(--rp-custom-surface);
  /* ... */
}
```text

3. Update `ThemeService`:
```typescript
export type ThemeMode = 'dark' | 'light' | 'moon' | 'custom' | 'auto';
```text

### Adding New Semantic Colors
1. Define in the base theme:
```css
:root {
  --color-new-semantic: var(--rp-appropriate-color);
}
```text

2. Override in theme variants:
```css
[data-theme="light"] {
  --color-new-semantic: var(--rp-dawn-appropriate-color);
}
```text

3. Use in components:
```css
.new-component {
  color: var(--color-new-semantic);
}
```text

## Testing Themes

### Manual Testing
1. Use the theme selector in the top-right corner
2. Test all interactive states (hover, focus, active)
3. Verify accessibility with screen readers
4. Check contrast ratios with browser dev tools

### Automated Testing
```typescript
// Test theme switching
describe('ThemeService', () => {
  it('should switch themes correctly', () => {
    themeService.setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
```text

### Accessibility Testing
- Use axe-core for automated accessibility testing
- Test with actual screen readers
- Verify keyboard navigation works in all themes
- Check color contrast with tools like WebAIM

## Troubleshooting

### Common Issues

**Theme not applying**: Check that CSS variables are imported in the correct order
```css
/* Must be imported before other styles */
@import './styles/rose-pine-variables.css';
```text

**Flashing on load**: Ensure theme is applied before content renders
```typescript
// Apply saved theme immediately
const savedTheme = localStorage.getItem('zimbomate-theme-preferences');
if (savedTheme) {
  const { mode } = JSON.parse(savedTheme);
  document.documentElement.setAttribute('data-theme', mode);
}
```text

**Inconsistent colors**: Always use semantic variables, never raw Rose Pine colors
```css
/* ✅ Good - will adapt to theme */
color: var(--color-text-primary);

/* ❌ Bad - won't change with theme */
color: var(--rp-text);
```text

## Best Practices

1. **Always use semantic variables** for component styling
2. **Test in all themes** during development
3. **Respect user preferences** (system theme, reduced motion)
4. **Maintain contrast ratios** when adding new colors
5. **Document new semantic colors** when extending the system
6. **Use transitions** to smooth theme changes
7. **Cache theme preferences** for better UX

This implementation provides a robust, accessible, and extensible theming system that enhances the ZimboMate experience while maintaining the cozy aesthetic of the Rose Pine palette.
