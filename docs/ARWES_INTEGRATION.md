# Arwes Integration Documentation

This document outlines the complete Arwes theming and component integration in ZimboMate.

## Overview

ZimboMate now features a comprehensive futuristic HUD interface powered by Arwes, including:
- Dynamic themed UI with cosmic, moebius, and minimal variants
- Animated backgrounds with grid lines, dots, and moving elements
- Advanced frame components with multiple styles
- Text effects including typewriter, decipher, and glitch animations
- Interactive button hover and click states
- Cohesive HUD layout system

## Architecture

### 1. Theme System (`src/ui/arwes/ArwesProviders.tsx`)

The app uses Arwes' `createAppTheme` with:
- **Palette**: Primary (cyan), Secondary (dark blue), Neutral (near-black), Error, Success
- **Typography**: Defined heading and body sizes
- **Spacing**: Consistent space tokens (xs to xxl)
- **Transitions**: Short (0.2s), Medium (0.4s), Long (0.6s) durations

### 2. Component Library

#### Background Components (`src/ui/hud/HudBackground.tsx`)
- `HudBackground`: Dynamic animated backgrounds
- `HudPageBackground`: Full-screen wrapper
- Variants: cosmic (rich), moebius (minimal), minimal (subtle)

#### Panel Components (`src/ui/hud/HudPanelV2.tsx`)
- `HudPanelV2`: Base panel with configurable frames
- Frame types: corners, octagon, nero, kranox, lines, custom
- Specialized variants: `HudCard`, `HudModal`, `HudAlert`, `HudSection`

#### Text Components (`src/ui/hud/HudTextV2.tsx`)
- `HudTextV2`: Advanced text with multiple effects
- Effects: typewriter, decipher, fade, glitch, slide
- Specialized: `Hero`, `Glow`, `Code`, `Alert`, `Counter`

#### Button Components (`src/ui/hud/HudButton.tsx`)
- `HudButton`: Interactive button with hover states
- Variants: primary, secondary, danger, success
- Specialized: `HudIconButton`, `HudToggleButton`

#### Layout Components (`src/ui/hud/HudLayout.tsx`)
- `HudLayout`: Complete page layout with header, sidebar, footer
- `HudContent`: Content wrapper with spacing
- `HudGrid`: Responsive grid system

### 3. Animation System

Comprehensive animation system:
- Entrance and exit animations
- Text effects with configurable durations
- Hover and click interactions
- Smooth transitions between states

## Usage Examples

### Basic Page with HUD Layout

```tsx
import { HudLayout, HudContent, HudSection } from '@/ui/hud'

function MyPage() {
  return (
    <HudLayout 
      variant="cosmic"
      title="My App"
      subtitle="System Interface"
    >
      <HudContent>
        <HudSection title="Section Title">
          <p>Your content here</p>
        </HudSection>
      </HudContent>
    </HudLayout>
  )
}
```

### Animated Text

```tsx
import { HudTextV2 } from '@/ui/hud'

// Hero text with decipher effect
<HudTextV2.Hero>
  Welcome to the System
</HudTextV2.Hero>

// Glowing text
<HudTextV2.Glow color="#ff6b5e">
  Alert: System Active
</HudTextV2.Glow>

// Counter animation
<HudTextV2.Counter 
  from={0} 
  to={100} 
  suffix="%" 
/>
```

### Interactive Panels

```tsx
import { HudCard, HudModal } from '@/ui/hud'

// Card with animation
<Animator>
  <HudCard title="Data Panel">
    <p>Panel content</p>
  </HudCard>
</Animator>

// Modal dialog
<HudModal title="Confirm Action">
  <p>Are you sure?</p>
</HudModal>
```

### Interactive Buttons

```tsx
import { HudButton } from '@/ui/hud'

<HudButton 
  variant="primary"
  onClick={handleClick}
>
  Execute Command
</HudButton>
```

## Theme Customization

### CSS Variables

Key variables in `src/ui/arwes/frames.css`:
- `--arwes-frames-line-color`: Frame stroke color
- `--arwes-frames-bg-color`: Frame background
- `--arwes-glow-primary`: Primary glow color
- `--arwes-glow-secondary`: Secondary glow

### Adding New Themes

1. Update the theme object in `ArwesProviders.tsx`
2. Add variant logic to `HudBackground.tsx`
3. Update CSS variables for the new theme

## Animation Integration

1. Animations are controlled via AnimatorGeneralProvider
2. Configure durations in `ArwesProviders.tsx`
3. Use Animator components to wrap animated content
4. Text effects automatically calculate duration based on content length

## Performance Considerations

- Use `React.memo` for heavy components
- Limit simultaneous animations
- Use `animator={{ disabled: true }}` to skip animations
- Keep animation durations reasonable for better UX

## Browser Compatibility

- Requires React 18+
- Works with Vite
- No React Strict Mode support
- Modern browsers only (Chrome, Firefox, Safari, Edge)

## Future Enhancements

1. Add more frame styles (hexagon, triangle)
2. Implement data visualization components
3. Add more animation effects
4. Create preset theme configurations
5. Build form components with Arwes styling

## Demo

View the complete demo at `/arwes-demo` route to see all components in action.
