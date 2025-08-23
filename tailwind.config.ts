import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Color tokens from design/tokens.css
      colors: {
        // Base colors
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        
        // Interactive colors
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          foreground: "hsl(var(--color-accent-foreground))",
        },
        
        // State colors
        destructive: {
          DEFAULT: "hsl(var(--color-destructive))",
          foreground: "hsl(var(--color-destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--color-success))",
          foreground: "hsl(var(--color-success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning))",
          foreground: "hsl(var(--color-warning-foreground))",
        },
        
        // UI elements
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        card: {
          DEFAULT: "hsl(var(--color-card))",
          foreground: "hsl(var(--color-card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--color-popover))",
          foreground: "hsl(var(--color-popover-foreground))",
        },
        
        // Space-HUD theme colors
        cosmic: {
          bg: "hsl(var(--color-cosmic-bg))",
          fg: "hsl(var(--color-cosmic-fg))",
          primary: "hsl(var(--color-cosmic-primary))",
          secondary: "hsl(var(--color-cosmic-secondary))",
          accent: "hsl(var(--color-cosmic-accent))",
          glow: "hsl(var(--color-cosmic-glow))",
          seam: "hsl(var(--color-cosmic-seam))",
        },
        moebius: {
          bg: "hsl(var(--color-moebius-bg))",
          fg: "hsl(var(--color-moebius-fg))",
          primary: "hsl(var(--color-moebius-primary))",
          secondary: "hsl(var(--color-moebius-secondary))",
          accent: "hsl(var(--color-moebius-accent))",
          outline: "hsl(var(--color-moebius-outline))",
          wire: "hsl(var(--color-moebius-wire))",
        },
      },
      
      // Spacing tokens
      spacing: {
        'hud-gap': 'var(--space-hud-gap)',
        'hud-padding': 'var(--space-hud-padding)',
        'hud-margin': 'var(--space-hud-margin)',
        'panel-gap': 'var(--space-panel-gap)',
      },
      
      // Border radius tokens
      borderRadius: {
        'hud': 'var(--radius-hud)',
        'panel': 'var(--radius-panel)',
        'pill': 'var(--radius-pill)',
        
        // Standard radix ui mappings
        lg: "var(--radius-lg)",
        md: "var(--radius-md)", 
        sm: "var(--radius-sm)",
      },
      
      // Shadow tokens
      boxShadow: {
        'hud': 'var(--shadow-hud)',
        'panel': 'var(--shadow-panel)',
        'glow': 'var(--shadow-glow)',
      },
      
      // Typography tokens
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)'],
      },
      
      // Animation duration tokens
      transitionDuration: {
        'fast': 'var(--motion-duration-fast)',
        'normal': 'var(--motion-duration-normal)',
        'slow': 'var(--motion-duration-slow)',
        'slower': 'var(--motion-duration-slower)',
      },
      
      // Animation timing tokens
      transitionTimingFunction: {
        'bounce': 'var(--motion-ease-bounce)',
      },
      
      // Z-index tokens
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'toast': 'var(--z-toast)',
        'hud-overlay': 'var(--z-hud-overlay)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
