import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      // Import design tokens from CSS variables
      tokens: {
        colors: {
          // Base colors
          background: { value: 'hsl(var(--color-background))' },
          foreground: { value: 'hsl(var(--color-foreground))' },
          muted: { value: 'hsl(var(--color-muted))' },
          'muted.foreground': { value: 'hsl(var(--color-muted-foreground))' },

          // Interactive colors
          primary: { value: 'hsl(var(--color-primary))' },
          'primary.foreground': { value: 'hsl(var(--color-primary-foreground))' },
          secondary: { value: 'hsl(var(--color-secondary))' },
          'secondary.foreground': { value: 'hsl(var(--color-secondary-foreground))' },
          accent: { value: 'hsl(var(--color-accent))' },
          'accent.foreground': { value: 'hsl(var(--color-accent-foreground))' },

          // State colors
          destructive: { value: 'hsl(var(--color-destructive))' },
          'destructive.foreground': { value: 'hsl(var(--color-destructive-foreground))' },
          success: { value: 'hsl(var(--color-success))' },
          'success.foreground': { value: 'hsl(var(--color-success-foreground))' },
          warning: { value: 'hsl(var(--color-warning))' },
          'warning.foreground': { value: 'hsl(var(--color-warning-foreground))' },

          // UI elements
          border: { value: 'hsl(var(--color-border))' },
          input: { value: 'hsl(var(--color-input))' },
          ring: { value: 'hsl(var(--color-ring))' },
          card: { value: 'hsl(var(--color-card))' },
          'card.foreground': { value: 'hsl(var(--color-card-foreground))' },
          popover: { value: 'hsl(var(--color-popover))' },
          'popover.foreground': { value: 'hsl(var(--color-popover-foreground))' },

          // Space-HUD theme colors
          'cosmic.bg': { value: 'hsl(var(--color-cosmic-bg))' },
          'cosmic.fg': { value: 'hsl(var(--color-cosmic-fg))' },
          'cosmic.primary': { value: 'hsl(var(--color-cosmic-primary))' },
          'cosmic.secondary': { value: 'hsl(var(--color-cosmic-secondary))' },
          'cosmic.accent': { value: 'hsl(var(--color-cosmic-accent))' },
          'cosmic.glow': { value: 'hsl(var(--color-cosmic-glow))' },
          'cosmic.seam': { value: 'hsl(var(--color-cosmic-seam))' },

          'moebius.bg': { value: 'hsl(var(--color-moebius-bg))' },
          'moebius.fg': { value: 'hsl(var(--color-moebius-fg))' },
          'moebius.primary': { value: 'hsl(var(--color-moebius-primary))' },
          'moebius.secondary': { value: 'hsl(var(--color-moebius-secondary))' },
          'moebius.accent': { value: 'hsl(var(--color-moebius-accent))' },
          'moebius.outline': { value: 'hsl(var(--color-moebius-outline))' },
          'moebius.wire': { value: 'hsl(var(--color-moebius-wire))' },
        },

        spacing: {
          'hud.gap': { value: 'var(--space-hud-gap)' },
          'hud.padding': { value: 'var(--space-hud-padding)' },
          'hud.margin': { value: 'var(--space-hud-margin)' },
          'panel.gap': { value: 'var(--space-panel-gap)' },
        },

        radii: {
          hud: { value: 'var(--radius-hud)' },
          panel: { value: 'var(--radius-panel)' },
          pill: { value: 'var(--radius-pill)' },
          sm: { value: 'var(--radius-sm)' },
          md: { value: 'var(--radius-md)' },
          lg: { value: 'var(--radius-lg)' },
          xl: { value: 'var(--radius-xl)' },
          '2xl': { value: 'var(--radius-2xl)' },
          '3xl': { value: 'var(--radius-3xl)' },
          full: { value: 'var(--radius-full)' },
        },

        shadows: {
          hud: { value: 'var(--shadow-hud)' },
          panel: { value: 'var(--shadow-panel)' },
          glow: { value: 'var(--shadow-glow)' },
          sm: { value: 'var(--shadow-sm)' },
          md: { value: 'var(--shadow-md)' },
          lg: { value: 'var(--shadow-lg)' },
          xl: { value: 'var(--shadow-xl)' },
          '2xl': { value: 'var(--shadow-2xl)' },
          inner: { value: 'var(--shadow-inner)' },
        },

        durations: {
          fast: { value: 'var(--motion-duration-fast)' },
          normal: { value: 'var(--motion-duration-normal)' },
          slow: { value: 'var(--motion-duration-slow)' },
          slower: { value: 'var(--motion-duration-slower)' },
        },

        easings: {
          linear: { value: 'var(--motion-ease-linear)' },
          in: { value: 'var(--motion-ease-in)' },
          out: { value: 'var(--motion-ease-out)' },
          'in-out': { value: 'var(--motion-ease-in-out)' },
          bounce: { value: 'var(--motion-ease-bounce)' },
        },

        zIndex: {
          dropdown: { value: 'var(--z-dropdown)' },
          sticky: { value: 'var(--z-sticky)' },
          fixed: { value: 'var(--z-fixed)' },
          'modal-backdrop': { value: 'var(--z-modal-backdrop)' },
          modal: { value: 'var(--z-modal)' },
          popover: { value: 'var(--z-popover)' },
          tooltip: { value: 'var(--z-tooltip)' },
          toast: { value: 'var(--z-toast)' },
          'hud-overlay': { value: 'var(--z-hud-overlay)' },
        },

        fonts: {
          sans: { value: 'var(--font-family-sans)' },
          mono: { value: 'var(--font-family-mono)' },
        },

        fontSizes: {
          xs: { value: 'var(--font-size-xs)' },
          sm: { value: 'var(--font-size-sm)' },
          base: { value: 'var(--font-size-base)' },
          lg: { value: 'var(--font-size-lg)' },
          xl: { value: 'var(--font-size-xl)' },
          '2xl': { value: 'var(--font-size-2xl)' },
          '3xl': { value: 'var(--font-size-3xl)' },
          '4xl': { value: 'var(--font-size-4xl)' },
        },

        fontWeights: {
          normal: { value: 'var(--font-weight-normal)' },
          medium: { value: 'var(--font-weight-medium)' },
          semibold: { value: 'var(--font-weight-semibold)' },
          bold: { value: 'var(--font-weight-bold)' },
        },

        lineHeights: {
          tight: { value: 'var(--line-height-tight)' },
          normal: { value: 'var(--line-height-normal)' },
          relaxed: { value: 'var(--line-height-relaxed)' },
        },
      },

      // Component recipes for Space-HUD elements
      recipes: {
        hudPanel: {
          className: 'hud-panel',
          description: 'Space-HUD panel component with theme variants',
          base: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'card',
            color: 'card.foreground',
            borderRadius: 'panel',
            padding: 'hud.padding',
            boxShadow: 'panel',
            border: '1px solid {colors.border}',
          },
          variants: {
            theme: {
              classic: {
                backgroundColor: 'background',
                borderColor: 'border',
              },
              cosmic: {
                backgroundColor: 'cosmic.bg',
                borderColor: 'cosmic.seam',
                boxShadow: 'glow',
                _before: {
                  content: '""',
                  position: 'absolute',
                  inset: '0',
                  borderRadius: 'panel',
                  border: '1px solid {colors.cosmic.glow}',
                  opacity: '0.3',
                  pointerEvents: 'none',
                },
              },
              moebius: {
                backgroundColor: 'moebius.bg',
                borderColor: 'moebius.outline',
                borderWidth: '2px',
                boxShadow: 'none',
              },
            },
            size: {
              sm: { padding: 'panel.gap' },
              md: { padding: 'hud.padding' },
              lg: { padding: 'hud.margin' },
            },
          },
          defaultVariants: {
            theme: 'classic',
            size: 'md',
          },
        },

        hudButton: {
          className: 'hud-button',
          description: 'Space-HUD button with theme variants',
          base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'hud',
            padding: '0.5rem 1rem',
            fontSize: 'sm',
            fontWeight: 'medium',
            cursor: 'pointer',
            transition: 'all {durations.fast} {easings.out}',
            border: 'none',
            outline: 'none',
            _focus: {
              ring: '2px solid {colors.ring}',
              ringOffset: '2px',
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          },
          variants: {
            variant: {
              primary: {
                backgroundColor: 'primary',
                color: 'primary.foreground',
                _hover: { opacity: '0.9' },
              },
              secondary: {
                backgroundColor: 'secondary',
                color: 'secondary.foreground',
                _hover: { backgroundColor: 'accent' },
              },
              destructive: {
                backgroundColor: 'destructive',
                color: 'destructive.foreground',
                _hover: { opacity: '0.9' },
              },
              outline: {
                border: '1px solid {colors.border}',
                backgroundColor: 'transparent',
                _hover: { backgroundColor: 'accent' },
              },
              ghost: {
                backgroundColor: 'transparent',
                _hover: { backgroundColor: 'accent' },
              },
            },
            theme: {
              classic: {},
              cosmic: {
                _before: {
                  content: '""',
                  position: 'absolute',
                  inset: '-1px',
                  borderRadius: 'hud',
                  background: 'linear-gradient(45deg, {colors.cosmic.primary}, {colors.cosmic.accent})',
                  zIndex: '-1',
                  opacity: '0',
                  transition: 'opacity {durations.fast} {easings.out}',
                },
                _hover: {
                  _before: { opacity: '0.7' },
                },
              },
              moebius: {
                borderWidth: '2px',
                borderColor: 'moebius.outline',
                _hover: {
                  backgroundColor: 'moebius.secondary',
                },
              },
            },
            size: {
              sm: { padding: '0.25rem 0.75rem', fontSize: 'xs' },
              md: { padding: '0.5rem 1rem', fontSize: 'sm' },
              lg: { padding: '0.75rem 1.5rem', fontSize: 'base' },
            },
          },
          defaultVariants: {
            variant: 'primary',
            theme: 'classic',
            size: 'md',
          },
        },

        hudPill: {
          className: 'hud-pill',
          description: 'HUD pill component for status indicators',
          base: {
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 'pill',
            padding: '0.25rem 0.75rem',
            fontSize: 'xs',
            fontWeight: 'medium',
            backgroundColor: 'muted',
            color: 'muted.foreground',
          },
          variants: {
            variant: {
              default: {},
              success: {
                backgroundColor: 'success',
                color: 'success.foreground',
              },
              warning: {
                backgroundColor: 'warning',
                color: 'warning.foreground',
              },
              destructive: {
                backgroundColor: 'destructive',
                color: 'destructive.foreground',
              },
            },
            theme: {
              classic: {},
              cosmic: {
                boxShadow: '0 0 8px {colors.cosmic.glow}',
              },
              moebius: {
                border: '1px solid {colors.moebius.outline}',
                backgroundColor: 'transparent',
              },
            },
          },
          defaultVariants: {
            variant: 'default',
            theme: 'classic',
          },
        },

        hudToolbar: {
          className: 'hud-toolbar',
          description: 'Space-HUD toolbar component',
          base: {
            display: 'flex',
            alignItems: 'center',
            gap: 'panel.gap',
            padding: '0.5rem 1rem',
            backgroundColor: 'card',
            borderRadius: 'hud',
            border: '1px solid {colors.border}',
            boxShadow: 'sm',
          },
          variants: {
            orientation: {
              horizontal: { flexDirection: 'row' },
              vertical: { flexDirection: 'column' },
            },
            theme: {
              classic: {},
              cosmic: {
                backgroundColor: 'cosmic.bg',
                borderColor: 'cosmic.seam',
                boxShadow: '0 0 16px {colors.cosmic.glow}',
                position: 'relative',
                _before: {
                  content: '""',
                  position: 'absolute',
                  inset: '-1px',
                  borderRadius: 'hud',
                  background: 'linear-gradient(90deg, {colors.cosmic.seam}, transparent, {colors.cosmic.glow})',
                  opacity: '0.3',
                  pointerEvents: 'none',
                },
              },
              moebius: {
                backgroundColor: 'moebius.bg',
                borderColor: 'moebius.outline',
                borderWidth: '2px',
                boxShadow: 'none',
              },
            },
          },
          defaultVariants: {
            orientation: 'horizontal',
            theme: 'classic',
          },
        },

        hudDialog: {
          className: 'hud-dialog',
          description: 'Space-HUD dialog component',
          base: {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'popover',
            borderRadius: 'panel',
            border: '1px solid {colors.border}',
            boxShadow: 'xl',
            padding: 'hud.padding',
            maxWidth: '500px',
            width: '90vw',
            maxHeight: '85vh',
            overflow: 'auto',
            zIndex: 'modal',
          },
          variants: {
            theme: {
              classic: {},
              cosmic: {
                backgroundColor: 'cosmic.bg',
                borderColor: 'cosmic.seam',
                boxShadow: '0 0 40px {colors.cosmic.glow}',
                _before: {
                  content: '""',
                  position: 'absolute',
                  inset: '0',
                  borderRadius: 'panel',
                  background: 'radial-gradient(circle at center, {colors.cosmic.glow} 0%, transparent 70%)',
                  opacity: '0.1',
                  pointerEvents: 'none',
                },
              },
              moebius: {
                backgroundColor: 'moebius.bg',
                borderColor: 'moebius.outline',
                borderWidth: '3px',
                boxShadow: 'none',
              },
            },
            size: {
              sm: { maxWidth: '400px' },
              md: { maxWidth: '500px' },
              lg: { maxWidth: '700px' },
              xl: { maxWidth: '900px' },
            },
          },
          defaultVariants: {
            theme: 'classic',
            size: 'md',
          },
        },

        hudToggle: {
          className: 'hud-toggle',
          description: 'Space-HUD toggle switch component',
          base: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            width: '44px',
            height: '24px',
            backgroundColor: 'muted',
            borderRadius: 'pill',
            border: '1px solid {colors.border}',
            cursor: 'pointer',
            transition: 'all {durations.fast} {easings.out}',
            _focus: {
              ring: '2px solid {colors.ring}',
              ringOffset: '2px',
            },
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          },
          variants: {
            state: {
              unchecked: {},
              checked: {
                backgroundColor: 'primary',
              },
            },
            theme: {
              classic: {},
              cosmic: {
                _checked: {
                  boxShadow: '0 0 12px {colors.cosmic.glow}',
                  borderColor: 'cosmic.glow',
                },
              },
              moebius: {
                borderWidth: '2px',
                borderColor: 'moebius.outline',
                _checked: {
                  backgroundColor: 'moebius.accent',
                },
              },
            },
          },
          defaultVariants: {
            state: 'unchecked',
            theme: 'classic',
          },
        },

        hudTabs: {
          className: 'hud-tabs',
          description: 'Space-HUD tabs component',
          base: {
            display: 'flex',
            backgroundColor: 'muted',
            borderRadius: 'hud',
            padding: '0.25rem',
            gap: '0.25rem',
          },
          variants: {
            orientation: {
              horizontal: { flexDirection: 'row' },
              vertical: { flexDirection: 'column' },
            },
            theme: {
              classic: {},
              cosmic: {
                backgroundColor: 'cosmic.bg',
                border: '1px solid {colors.cosmic.seam}',
                boxShadow: '0 0 8px {colors.cosmic.glow}',
              },
              moebius: {
                backgroundColor: 'transparent',
                border: '2px solid {colors.moebius.outline}',
              },
            },
          },
          defaultVariants: {
            orientation: 'horizontal',
            theme: 'classic',
          },
        },

        hudTabsTrigger: {
          className: 'hud-tabs-trigger',
          description: 'Space-HUD tabs trigger',
          base: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem 1rem',
            fontSize: 'sm',
            fontWeight: 'medium',
            borderRadius: 'sm',
            cursor: 'pointer',
            transition: 'all {durations.fast} {easings.out}',
            backgroundColor: 'transparent',
            color: 'muted.foreground',
            _hover: {
              backgroundColor: 'accent',
            },
            _focus: {
              ring: '2px solid {colors.ring}',
              ringOffset: '2px',
            },
          },
          variants: {
            state: {
              inactive: {},
              active: {
                backgroundColor: 'background',
                color: 'foreground',
                boxShadow: 'sm',
              },
            },
            theme: {
              classic: {},
              cosmic: {
                _active: {
                  backgroundColor: 'cosmic.bg',
                  boxShadow: '0 0 8px {colors.cosmic.glow}',
                  borderColor: 'cosmic.glow',
                },
              },
              moebius: {
                _active: {
                  backgroundColor: 'moebius.secondary',
                  border: '1px solid {colors.moebius.outline}',
                },
              },
            },
          },
          defaultVariants: {
            state: 'inactive',
            theme: 'classic',
          },
        },

        hudSlider: {
          className: 'hud-slider',
          description: 'Space-HUD slider component',
          base: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '20px',
            cursor: 'pointer',
            _disabled: {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
          },
          variants: {
            orientation: {
              horizontal: {},
              vertical: {
                flexDirection: 'column',
                width: '20px',
                height: '100px',
              },
            },
            theme: {
              classic: {},
              cosmic: {},
              moebius: {},
            },
          },
          defaultVariants: {
            orientation: 'horizontal',
            theme: 'classic',
          },
        },

        hudSliderTrack: {
          className: 'hud-slider-track',
          description: 'Space-HUD slider track',
          base: {
            position: 'relative',
            flexGrow: '1',
            height: '4px',
            backgroundColor: 'muted',
            borderRadius: 'pill',
            overflow: 'hidden',
          },
          variants: {
            theme: {
              classic: {},
              cosmic: {
                backgroundColor: 'cosmic.bg',
                boxShadow: 'inset 0 0 4px {colors.cosmic.seam}',
              },
              moebius: {
                border: '1px solid {colors.moebius.outline}',
                backgroundColor: 'transparent',
              },
            },
          },
          defaultVariants: {
            theme: 'classic',
          },
        },

        hudSliderRange: {
          className: 'hud-slider-range',
          description: 'Space-HUD slider range',
          base: {
            position: 'absolute',
            height: '100%',
            backgroundColor: 'primary',
            borderRadius: 'pill',
          },
          variants: {
            theme: {
              classic: {},
              cosmic: {
                backgroundColor: 'cosmic.primary',
                boxShadow: '0 0 8px {colors.cosmic.glow}',
              },
              moebius: {
                backgroundColor: 'moebius.accent',
              },
            },
          },
          defaultVariants: {
            theme: 'classic',
          },
        },

        hudSliderThumb: {
          className: 'hud-slider-thumb',
          description: 'Space-HUD slider thumb',
          base: {
            position: 'relative',
            display: 'block',
            width: '16px',
            height: '16px',
            backgroundColor: 'background',
            border: '2px solid {colors.primary}',
            borderRadius: 'full',
            cursor: 'pointer',
            transition: 'all {durations.fast} {easings.out}',
            _hover: {
              transform: 'scale(1.1)',
            },
            _focus: {
              ring: '2px solid {colors.ring}',
              ringOffset: '2px',
            },
          },
          variants: {
            theme: {
              classic: {},
              cosmic: {
                borderColor: 'cosmic.glow',
                boxShadow: '0 0 12px {colors.cosmic.glow}',
                _hover: {
                  boxShadow: '0 0 16px {colors.cosmic.glow}',
                },
              },
              moebius: {
                borderColor: 'moebius.outline',
                borderWidth: '3px',
                _hover: {
                  backgroundColor: 'moebius.accent',
                },
              },
            },
          },
          defaultVariants: {
            theme: 'classic',
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
  
  // Global CSS
  globalCss: {
    html: {
      colorScheme: 'light dark',
    },
    body: {
      fontFamily: 'sans',
      backgroundColor: 'background',
      color: 'foreground',
    },
  },

  // JSX framework
  jsxFramework: 'react',
})
