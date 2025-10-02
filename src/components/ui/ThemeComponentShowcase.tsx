import * as Dialog from '@radix-ui/react-dialog'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import * as Separator from '@radix-ui/react-separator'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  Component,
  Eye,
  Heart,
  Info,
  Layout,
  Moon,
  Paintbrush,
  Palette,
  Settings,
  Sparkles,
  Star,
  Sun,
  Type,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import React, { useState } from 'react'
import { Badge } from './Badge'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { Input } from './Input'
import { Progress } from './Progress'
import { Textarea } from './Textarea'

interface ThemeComponentShowcaseProps {
  isOpen: boolean
  onClose: () => void
}

export const ThemeComponentShowcase: React.FC<ThemeComponentShowcaseProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTheme, setActiveTheme] = useState<string>('fantasy')

  const themes = [
    { id: 'fantasy', name: 'Fantasy', icon: Sparkles, description: 'Warm parchment with gold accents' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Dark mode with gold highlights' },
    { id: 'light', name: 'Light', icon: Sun, description: 'Clean light theme' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: Zap, description: 'Futuristic cyber theme' },
  ]

  const colorPalettes = [
    { name: 'Primary Colors', colors: ['--color-primary', '--color-secondary', '--color-accent'] },
    { name: 'Parchment', colors: ['--parchment-50', '--parchment-200', '--parchment-500', '--parchment-800'] },
    { name: 'Gold', colors: ['--gold-300', '--gold-500', '--gold-700'] },
    { name: 'Magic', colors: ['--magic-300', '--magic-500', '--magic-700'] },
    { name: 'Nature', colors: ['--nature-300', '--nature-500', '--nature-700'] },
    { name: 'Status', colors: ['--red-500', '--yellow-500', '--green-600', '--blue-600'] },
  ]

  const buttonVariants = [
    { variant: 'primary' as const, label: 'Primary' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'outline' as const, label: 'Outline' },
    { variant: 'ghost' as const, label: 'Ghost' },
    { variant: 'destructive' as const, label: 'Destructive' },
    { variant: 'magical' as const, label: 'Magical' },
    { variant: 'cyber' as const, label: 'Cyber' },
  ]

  const buttonSizes = [
    { size: 'sm' as const, label: 'Small' },
    { size: 'md' as const, label: 'Medium' },
    { size: 'lg' as const, label: 'Large' },
    { size: 'xl' as const, label: 'Extra Large' },
  ]

  const cardVariants = [
    { variant: 'default' as const, label: 'Default' },
    { variant: 'magical' as const, label: 'Magical' },
    { variant: 'cyber' as const, label: 'Cyber' },
  ]

  const badgeVariants = [
    { variant: 'default' as const, label: 'Default' },
    { variant: 'secondary' as const, label: 'Secondary' },
    { variant: 'outline' as const, label: 'Outline' },
    { variant: 'destructive' as const, label: 'Destructive' },
  ]

  const applyTheme = (themeId: string) => {
    setActiveTheme(themeId)
    document.documentElement.setAttribute('data-theme', themeId)
  }

  const ColorSwatch: React.FC<{ colorVar: string, name: string }> = ({ colorVar, name }) => (
    <div
      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
      style={{
        'backgroundColor': 'var(--card)',
        ':hover': { backgroundColor: 'var(--popover)' },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--popover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card)'
      }}
    >
      <div
        className="w-8 h-8 rounded-lg border-2 shadow-sm"
        style={{
          backgroundColor: `var(${colorVar})`,
          borderColor: 'var(--border)',
        }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium truncate text-foreground"
        >
          {name}
        </div>
        <div
          className="text-xs font-mono text-muted-foreground"
        >
          {colorVar}
        </div>
      </div>
    </div>
  )

  const TypographyExample: React.FC<{ className: string, text: string, description: string }> = ({
    className,
    text,
    description,
  }) => (
    <div className="space-y-2">
      <div className={className}>{text}</div>
      <div
        className="text-xs text-muted-foreground"
      >
        {description}
      </div>
    </div>
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] max-w-6xl rounded-xl shadow-2xl z-50 overflow-hidden bg-background"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div
              className="flex items-center justify-between p-6 border-b border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-pink-500 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Dialog.Title
                    className="text-xl font-semibold text-foreground"
                  >
                    Theme & Component Showcase
                  </Dialog.Title>
                  <Dialog.Description
                    className="text-sm text-muted-foreground"
                  >
                    Explore themes, components, and styling utilities
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs.Root defaultValue="themes" className="h-full flex">
                {/* Sidebar */}
                <div
                  className="w-64 border-r p-4"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <Tabs.List className="flex flex-col gap-1 w-full">
                    <Tabs.Trigger
                      value="themes"
                      className="flex items-center gap-2 w-full p-3 rounded-lg text-left transition-colors hover:opacity-80 data-[state=active]:shadow-sm"
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--popover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.getAttribute('data-state')?.includes('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Palette className="w-4 h-4" />
                      Themes
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="colors"
                      className="flex items-center gap-2 w-full p-3 rounded-lg text-left transition-colors hover:opacity-80 data-[state=active]:shadow-sm"
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--popover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.getAttribute('data-state')?.includes('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Paintbrush className="w-4 h-4" />
                      Colors
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="typography"
                      className="flex items-center gap-2 w-full p-3 rounded-lg text-left transition-colors hover:opacity-80 data-[state=active]:shadow-sm"
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--popover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.getAttribute('data-state')?.includes('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Type className="w-4 h-4" />
                      Typography
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="components"
                      className="flex items-center gap-2 w-full p-3 rounded-lg text-left transition-colors hover:opacity-80 data-[state=active]:shadow-sm"
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--popover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.getAttribute('data-state')?.includes('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Component className="w-4 h-4" />
                      Components
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="layouts"
                      className="flex items-center gap-2 w-full p-3 rounded-lg text-left transition-colors hover:opacity-80 data-[state=active]:shadow-sm"
                      style={{
                        color: 'var(--foreground)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--popover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.getAttribute('data-state')?.includes('active')) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      <Layout className="w-4 h-4" />
                      Layouts
                    </Tabs.Trigger>
                  </Tabs.List>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea.Root className="h-full">
                    <ScrollArea.Viewport className="h-full p-6">

                      {/* Themes Tab */}
                      <Tabs.Content value="themes" className="space-y-6">
                        <div>
                          <h2
                            className="text-2xl font-semibold mb-4 text-foreground"
                          >
                            Theme Variants
                          </h2>
                          <div className="grid grid-cols-2 gap-4">
                            {themes.map((theme) => {
                              const Icon = theme.icon
                              const isActive = activeTheme === theme.id
                              return (
                                <motion.div
                                  key={theme.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card
                                    className={`cursor-pointer transition-all ${
                                      isActive ? 'ring-2 ring-primary/40 shadow-lg' : 'hover:shadow-md'
                                    }`}
                                    onClick={() => applyTheme(theme.id)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                          <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                          <h3
                                            className="font-semibold text-foreground"
                                          >
                                            {theme.name}
                                          </h3>
                                          {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                                        </div>
                                      </div>
                                      <p
                                        className="text-sm mb-4 text-muted-foreground"
                                      >
                                        {theme.description}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="primary">Primary</Button>
                                        <Button size="sm" variant="secondary">Secondary</Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      </Tabs.Content>

                      {/* Colors Tab */}
                      <Tabs.Content value="colors" className="space-y-6">
                        <div>
                          <h2
                            className="text-2xl font-semibold mb-4 text-foreground"
                          >
                            Color System
                          </h2>
                          <div className="grid gap-6">
                            {colorPalettes.map(palette => (
                              <Card key={palette.name}>
                                <CardContent className="p-4">
                                  <h3
                                    className="font-semibold mb-4 text-foreground"
                                  >
                                    {palette.name}
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {palette.colors.map(color => (
                                      <ColorSwatch
                                        key={color}
                                        colorVar={color}
                                        name={color.replace('--', '').replace('-', ' ')}
                                      />
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </Tabs.Content>

                      {/* Typography Tab */}
                      <Tabs.Content value="typography" className="space-y-6">
                        <div>
                          <h2
                            className="text-2xl font-semibold mb-4 text-foreground"
                          >
                            Typography System
                          </h2>
                          <Card>
                            <CardContent className="p-6 space-y-6">
                              <TypographyExample
                                className="text-display-lg"
                                text="Display Large"
                                description="text-display-lg - Cinzel, 3rem, 600 weight"
                              />
                              <Separator.Root
                                className="h-px bg-[color:var(--border)]"
                              />
                              <TypographyExample
                                className="text-display-md"
                                text="Display Medium"
                                description="text-display-md - Cinzel, 2.25rem, 600 weight"
                              />
                              <Separator.Root
                                className="h-px bg-[color:var(--border)]"
                              />
                              <TypographyExample
                                className="text-display-sm"
                                text="Display Small"
                                description="text-display-sm - Cinzel, 1.875rem, 500 weight"
                              />
                              <Separator.Root
                                className="h-px bg-[color:var(--border)]"
                              />
                              <TypographyExample
                                className="text-body-lg"
                                text="Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                description="text-body-lg - Crimson Text, 1.125rem, 400 weight"
                              />
                              <TypographyExample
                                className="text-body-regular"
                                text="Body Regular - Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                description="text-body-regular - Crimson Text, 1rem, 400 weight"
                              />
                              <TypographyExample
                                className="text-body-sm"
                                text="Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                                description="text-body-sm - Crimson Text, 0.875rem, 400 weight"
                              />
                              <TypographyExample
                                className="text-ui-regular"
                                text="UI Regular - Interface text for buttons and controls"
                                description="text-ui-regular - Inter, 0.875rem, 500 weight"
                              />
                              <TypographyExample
                                className="text-ui-small"
                                text="UI Small - Small interface text and labels"
                                description="text-ui-small - Inter, 0.75rem, 500 weight"
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </Tabs.Content>

                      {/* Components Tab */}
                      <Tabs.Content value="components" className="space-y-6">
                        <div>
                          <h2
                            className="text-2xl font-semibold mb-4 text-foreground"
                          >
                            UI Components
                          </h2>

                          {/* Buttons */}
                          <Card className="mb-6">
                            <CardContent className="p-6">
                              <h3
                                className="text-lg font-semibold mb-4 text-foreground"
                              >
                                Buttons
                              </h3>

                              <div className="space-y-4">
                                <div>
                                  <h4
                                    className="font-medium mb-3 text-foreground"
                                  >
                                    Variants
                                  </h4>
                                  <div className="flex flex-wrap gap-3">
                                    {buttonVariants.map(({ variant, label }) => (
                                      <Button key={variant} variant={variant}>
                                        {label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <Separator.Root
                                  className="h-px bg-[color:var(--border)]"
                                />

                                <div>
                                  <h4
                                    className="font-medium mb-3 text-foreground"
                                  >
                                    Sizes
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-3">
                                    {buttonSizes.map(({ size, label }) => (
                                      <Button key={size} size={size} variant="primary">
                                        {label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <Separator.Root
                                  className="h-px bg-[color:var(--border)]"
                                />

                                <div>
                                  <h4
                                    className="font-medium mb-3 text-foreground"
                                  >
                                    With Icons
                                  </h4>
                                  <div className="flex flex-wrap gap-3">
                                    <Button variant="primary" className="gap-2">
                                      <Star className="w-4 h-4" />
                                      Starred
                                    </Button>
                                    <Button variant="secondary" className="gap-2">
                                      <Heart className="w-4 h-4" />
                                      Favorite
                                    </Button>
                                    <Button variant="outline" className="gap-2">
                                      <Settings className="w-4 h-4" />
                                      Settings
                                    </Button>
                                    <Button variant="primary" size="icon">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Cards */}
                          <Card className="mb-6">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Cards</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {cardVariants.map(({ variant, label }) => (
                                  <Card key={variant} variant={variant}>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold mb-2">
                                        {label}
                                        {' '}
                                        Card
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        This is a
                                        {' '}
                                        {label.toLowerCase()}
                                        {' '}
                                        card variant with sample content.
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Badges */}
                          <Card className="mb-6">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Badges</h3>
                              <div className="flex flex-wrap gap-3">
                                {badgeVariants.map(({ variant, label }) => (
                                  <Badge key={variant} variant={variant}>
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Form Elements */}
                          <Card className="mb-6">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Form Elements</h3>
                              <div className="space-y-4 max-w-md">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Input Field</label>
                                  <Input placeholder="Enter some text..." />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Textarea</label>
                                  <Textarea placeholder="Enter a longer message..." rows={3} />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">Progress Bar</label>
                                  <Progress value={65} max={100} className="h-2" />
                                  <div className="text-xs text-muted-foreground mt-1">65% complete</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Status Indicators */}
                          <Card>
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <CheckCircle className="w-5 h-5 text-chart-2" />
                                  <span>Success state</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <AlertTriangle className="w-5 h-5 text-chart-4" />
                                  <span>Warning state</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <XCircle className="w-5 h-5 text-destructive" />
                                  <span>Error state</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Info className="w-5 h-5 text-primary" />
                                  <span>Info state</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </Tabs.Content>

                      {/* Layouts Tab */}
                      <Tabs.Content value="layouts" className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-semibold mb-4">Layout Examples</h2>

                          <Card className="mb-6">
                            <CardContent className="p-6">
                              <h3 className="text-lg font-semibold mb-4">Grid Layouts</h3>
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-medium mb-3">2-Column Grid</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
                                      Column 1
                                    </div>
                                    <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
                                      Column 2
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-3">3-Column Grid</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
                                      Column 1
                                    </div>
                                    <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
                                      Column 2
                                    </div>
                                    <div className="h-20 bg-muted rounded-lg flex items-center justify-center">
                                      Column 3
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-3">Card Grid</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                      <Card key={i}>
                                        <CardContent className="p-4">
                                          <h5 className="font-semibold mb-2">
                                            Card
                                            {i}
                                          </h5>
                                          <p className="text-sm text-muted-foreground">Sample card content</p>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </Tabs.Content>

                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-muted">
                      <ScrollArea.Thumb className="bg-gray-400 rounded-full" />
                    </ScrollArea.Scrollbar>
                  </ScrollArea.Root>
                </div>
              </Tabs.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ThemeComponentShowcase
