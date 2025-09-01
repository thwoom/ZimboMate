# ZimboMate Design System

## Overview

ZimboMate uses the **Rose Pine** color palette as its foundation, providing a warm, cozy, and accessible design system that enhances the Dungeon World gaming experience.

## Color Palette

### Rose Pine Main (Dark Theme - Default)
- **Base**: `#191724` - Primary background
- **Surface**: `#1f1d2e` - Cards, panels, elevated surfaces
- **Overlay**: `#26233a` - Hover states, overlays
- **Muted**: `#6e6a86` - Disabled text, subtle elements
- **Subtle**: `#908caa` - Secondary text
- **Text**: `#e0def4` - Primary text
- **Love**: `#eb6f92` - Danger, critical states
- **Gold**: `#f6c177` - Warning, attention
- **Rose**: `#ebbcba` - Warm accent
- **Pine**: `#31748f` - Info, calm states
- **Foam**: `#9ccfd8` - Success, positive states
- **Iris**: `#c4a7e7` - Primary brand color

### Rose Pine Dawn (Light Theme)
- **Base**: `#faf4ed` - Primary background
- **Surface**: `#fffaf3` - Cards, panels, elevated surfaces
- **Overlay**: `#f2e9e1` - Hover states, overlays
- **Text**: `#575279` - Primary text
- **Love**: `#b4637a` - Danger, critical states
- **Gold**: `#ea9d34` - Warning, attention
- **Pine**: `#286983` - Info, calm states
- **Foam**: `#56949f` - Success, positive states
- **Iris**: `#907aa9` - Primary brand color

### Rose Pine Moon (Alternative Dark)
- **Base**: `#232136` - Primary background
- **Surface**: `#2a273f` - Cards, panels, elevated surfaces
- Similar color relationships to Main theme

## Game-Specific Color Mapping

### Health Points (HP)
- **Full HP**: `var(--color-hp-full)` - Foam (healthy)
- **Injured**: `var(--color-hp-injured)` - Gold (caution)
- **Critical**: `var(--color-hp-critical)` - Love (danger)
- **Dead**: `var(--color-hp-dead)` - Muted (inactive)

### Experience Points (XP)
- **Highlight**: `var(--color-xp-highlight)` - Iris (achievement)
- **Background**: `var(--color-xp-background)` - Subtle overlay

### Roll Results
- **Success (10+)**: `var(--color-roll-success)` - Foam
- **Partial (7-9)**: `var(--color-roll-partial)` - Gold
- **Failure (6-)**: `var(--color-roll-failure)` - Love

### Character Stats
- **STR**: `var(--color-stat-str)` - Love (strength, power)
- **DEX**: `var(--color-stat-dex)` - Gold (agility, precision)
- **CON**: `var(--color-stat-con)` - Rose (endurance, health)
- **INT**: `var(--color-stat-int)` - Iris (knowledge, magic)
- **WIS**: `var(--color-stat-wis)` - Foam (perception, wisdom)
- **CHA**: `var(--color-stat-cha)` - Pine (social, leadership)

### Equipment Types
- **Weapons**: `var(--color-equipment-weapon)` - Love
- **Armor**: `var(--color-equipment-armor)` - Pine
- **Gear**: `var(--color-equipment-gear)` - Subtle
- **Magic Items**: `var(--color-equipment-magic)` - Iris

### Move Categories
- **Basic Moves**: `var(--color-move-basic)` - Text (universal)
- **Class Moves**: `var(--color-move-class)` - Iris (special)
- **Advanced Moves**: `var(--color-move-advanced)` - Gold (progression)
- **Master Moves**: `var(--color-move-master)` - Love (powerful)
- **Special Moves**: `var(--color-move-special)` - Foam (unique)

## Typography Scale

### Font Sizes
- **xs**: `0.75rem` (12px) - Small labels, captions
- **sm**: `0.875rem` (14px) - Body text, buttons
- **md**: `1rem` (16px) - Default body text
- **lg**: `1.125rem` (18px) - Subheadings
- **xl**: `1.25rem` (20px) - Headings
- **2xl**: `1.5rem` (24px) - Large headings
- **3xl**: `1.875rem` (30px) - Display text
- **4xl**: `2.25rem` (36px) - Hero text

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Headings, labels
- **Bold**: 700 - Strong emphasis

## Spacing Scale

### Spacing Units
- **xs**: `0.25rem` (4px) - Tight spacing
- **sm**: `0.5rem` (8px) - Small gaps
- **md**: `0.75rem` (12px) - Default spacing
- **lg**: `1rem` (16px) - Comfortable spacing
- **xl**: `1.5rem` (24px) - Large spacing
- **2xl**: `2rem` (32px) - Section spacing
- **3xl**: `3rem` (48px) - Major spacing

## Border Radius

### Radius Scale
- **sm**: `0.25rem` (4px) - Small elements
- **md**: `0.375rem` (6px) - Buttons, inputs
- **lg**: `0.5rem` (8px) - Cards, panels
- **xl**: `0.75rem` (12px) - Large cards
- **2xl**: `1rem` (16px) - Modals
- **full**: `9999px` - Pills, circles

## Shadows

### Shadow Scale
- **sm**: Subtle shadow for small elements
- **md**: Standard shadow for cards
- **lg**: Prominent shadow for modals
- **xl**: Heavy shadow for overlays

## Component Patterns

### Cards
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}
```text

### Buttons
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```text

### Status Indicators
```css
.status-success {
  background: var(--color-success);
  color: var(--color-text-inverse);
}

.status-warning {
  background: var(--color-warning);
  color: var(--color-text-inverse);
}

.status-danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}
```text

## Accessibility

### Contrast Ratios
- **Primary text**: Meets WCAG AA (4.5:1 minimum)
- **Secondary text**: Meets WCAG AA (3:1 minimum)
- **Interactive elements**: High contrast for visibility

### Motion
- Respects `prefers-reduced-motion` setting
- Smooth transitions enhance UX without being distracting
- Animation durations: Fast (150ms), Normal (250ms), Slow (350ms)

### High Contrast Mode
- Special high-contrast theme available
- Strong borders and clear visual hierarchy
- Enhanced focus indicators

## Theme Switching

### Available Themes
1. **Rose Pine** (Dark) - Default warm dark theme
2. **Rose Pine Dawn** (Light) - Soft light theme
3. **Rose Pine Moon** (Dark Alt) - Cooler dark alternative
4. **Auto** - Follows system preference
5. **High Contrast** - Accessibility-focused theme

### Implementation
Themes are managed by the `ThemeService` and applied via CSS custom properties. The theme selector provides an intuitive interface for users to switch between themes.

## Usage Guidelines

### Do's
- Use semantic color variables (e.g., `--color-success`) instead of raw colors
- Maintain consistent spacing using the scale
- Follow the typography hierarchy
- Use appropriate shadows for depth
- Respect user's motion preferences

### Don'ts
- Don't use hardcoded colors
- Don't mix spacing units arbitrarily
- Don't ignore accessibility requirements
- Don't override theme colors without good reason
- Don't use excessive animations

## Implementation Notes

### CSS Custom Properties
All colors, spacing, and other design tokens are implemented as CSS custom properties, allowing for easy theming and consistency across the application.

### Component Architecture
Components should use design system tokens and follow established patterns for consistency and maintainability.

### Theme Persistence
User theme preferences are saved to localStorage and restored on subsequent visits.

This design system ensures ZimboMate provides a cohesive, accessible, and beautiful experience that enhances the joy of playing Dungeon World.
