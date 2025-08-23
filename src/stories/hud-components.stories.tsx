import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { Button, Panel, Toolbar, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, HudPill, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Slider } from '../components/ui'

// Story for Button component
const ButtonMeta: Meta<typeof Button> = {
  title: 'HUD Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: { onClick: fn() },
}

export default ButtonMeta
type ButtonStory = StoryObj<typeof ButtonMeta>

export const ButtonPrimary: ButtonStory = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
}

export const ButtonSecondary: ButtonStory = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
}

export const ButtonDestructive: ButtonStory = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
}

export const ButtonOutline: ButtonStory = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
}

export const ButtonGhost: ButtonStory = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

// Story for Panel component
const PanelMeta: Meta<typeof Panel> = {
  title: 'HUD Components/Panel',
  component: Panel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export const PanelDefault: StoryObj<typeof PanelMeta> = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">HUD Panel</h3>
        <p className="text-sm text-muted-foreground">
          This is a Space-HUD panel component with theme-aware styling.
        </p>
      </div>
    ),
  },
}

export const PanelSmall: StoryObj<typeof PanelMeta> = {
  args: {
    size: 'sm',
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Small Panel</h3>
        <p className="text-sm text-muted-foreground">Compact panel size.</p>
      </div>
    ),
  },
}

export const PanelLarge: StoryObj<typeof PanelMeta> = {
  args: {
    size: 'lg',
    children: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Large Panel</h3>
        <p className="text-sm text-muted-foreground">
          Spacious panel with generous padding for important content.
        </p>
      </div>
    ),
  },
}

// Story for Toolbar component
const ToolbarMeta: Meta<typeof Toolbar> = {
  title: 'HUD Components/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}

export const ToolbarHorizontal: StoryObj<typeof ToolbarMeta> = {
  args: {
    orientation: 'horizontal',
    children: (
      <>
        <Button variant="outline" size="sm">Action 1</Button>
        <Button variant="outline" size="sm">Action 2</Button>
        <Button variant="outline" size="sm">Action 3</Button>
      </>
    ),
  },
}

export const ToolbarVertical: StoryObj<typeof ToolbarMeta> = {
  args: {
    orientation: 'vertical',
    children: (
      <>
        <Button variant="outline" size="sm">Action 1</Button>
        <Button variant="outline" size="sm">Action 2</Button>
        <Button variant="outline" size="sm">Action 3</Button>
      </>
    ),
  },
}

// Story for HUD Pill component
const HudPillMeta: Meta<typeof HudPill> = {
  title: 'HUD Components/HudPill',
  component: HudPill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
    },
  },
}

export const HudPillDefault: StoryObj<typeof HudPillMeta> = {
  args: {
    variant: 'default',
    children: 'Status: Active',
  },
}

export const HudPillSuccess: StoryObj<typeof HudPillMeta> = {
  args: {
    variant: 'success',
    children: 'Online',
  },
}

export const HudPillWarning: StoryObj<typeof HudPillMeta> = {
  args: {
    variant: 'warning',
    children: 'Caution',
  },
}

export const HudPillDestructive: StoryObj<typeof HudPillMeta> = {
  args: {
    variant: 'destructive',
    children: 'Offline',
  },
}

// Story for Switch component
const SwitchMeta: Meta<typeof Switch> = {
  title: 'HUD Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export const SwitchDefault: StoryObj<typeof SwitchMeta> = {
  args: {
    'aria-label': 'Toggle setting',
  },
}

export const SwitchChecked: StoryObj<typeof SwitchMeta> = {
  args: {
    defaultChecked: true,
    'aria-label': 'Toggle setting',
  },
}

// Story for Tabs component
const TabsMeta: Meta<typeof Tabs> = {
  title: 'HUD Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export const TabsDefault: StoryObj<typeof TabsMeta> = {
  args: {
    defaultValue: 'tab1',
    className: 'w-80',
    children: (
      <>
        <TabsList>
          <TabsTrigger value="tab1">Character</TabsTrigger>
          <TabsTrigger value="tab2">Inventory</TabsTrigger>
          <TabsTrigger value="tab3">Moves</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="mt-4">
          <Panel size="sm">
            <h3 className="font-semibold mb-2">Character Sheet</h3>
            <p className="text-sm text-muted-foreground">
              Character information and stats go here.
            </p>
          </Panel>
        </TabsContent>
        <TabsContent value="tab2" className="mt-4">
          <Panel size="sm">
            <h3 className="font-semibold mb-2">Inventory</h3>
            <p className="text-sm text-muted-foreground">
              Items and equipment listing.
            </p>
          </Panel>
        </TabsContent>
        <TabsContent value="tab3" className="mt-4">
          <Panel size="sm">
            <h3 className="font-semibold mb-2">Moves</h3>
            <p className="text-sm text-muted-foreground">
              Available moves and abilities.
            </p>
          </Panel>
        </TabsContent>
      </>
    ),
  },
}

// Story for Slider component
const SliderMeta: Meta<typeof Slider> = {
  title: 'HUD Components/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}

export const SliderDefault: StoryObj<typeof SliderMeta> = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: 'w-64',
  },
}

export const SliderVertical: StoryObj<typeof SliderMeta> = {
  args: {
    orientation: 'vertical',
    defaultValue: [75],
    max: 100,
    step: 1,
    className: 'h-64',
  },
}

// Story for Dialog component
const DialogMeta: Meta<typeof Dialog> = {
  title: 'HUD Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export const DialogDefault: StoryObj<typeof DialogMeta> = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>HUD System Dialog</DialogTitle>
          <DialogDescription>
            This is a Space-HUD dialog component with theme-aware styling and Augmented-UI frames.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Dialog content goes here. The dialog supports different themes and sizes.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button variant="primary" size="sm">Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

// Comprehensive showcase
const ShowcaseMeta: Meta<typeof Panel> = {
  title: 'HUD Components/Showcase',
  component: Panel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export const AllComponents: StoryObj<typeof ShowcaseMeta> = {
  render: () => (
    <div className="p-8 min-h-screen bg-background">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Space-HUD Component Showcase</h1>
          <p className="text-muted-foreground mb-6">
            All components with theme-aware styling. Use the theme controls in the toolbar to switch between Classic, Cosmic, and Moebius themes.
          </p>
        </div>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </Panel>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">HUD Pills</h2>
          <div className="flex flex-wrap gap-4">
            <HudPill variant="default">Active</HudPill>
            <HudPill variant="success">Online</HudPill>
            <HudPill variant="warning">Caution</HudPill>
            <HudPill variant="destructive">Offline</HudPill>
          </div>
        </Panel>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Toolbar</h2>
          <Toolbar>
            <Button variant="outline" size="sm">Action 1</Button>
            <Button variant="outline" size="sm">Action 2</Button>
            <Button variant="outline" size="sm">Action 3</Button>
            <Switch aria-label="Toggle feature" />
          </Toolbar>
        </Panel>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Volume Slider</label>
              <Slider defaultValue={[75]} max={100} step={1} className="w-64" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <label htmlFor="notifications" className="text-sm font-medium">
                Enable notifications
              </label>
            </div>
          </div>
        </Panel>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Tabs</h2>
          <Tabs defaultValue="character" className="w-full">
            <TabsList>
              <TabsTrigger value="character">Character</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="moves">Moves</TabsTrigger>
            </TabsList>
            <TabsContent value="character" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Character information and stats would be displayed here.
              </div>
            </TabsContent>
            <TabsContent value="inventory" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Equipment and items would be listed here.
              </div>
            </TabsContent>
            <TabsContent value="moves" className="mt-4">
              <div className="text-sm text-muted-foreground">
                Available moves and abilities would be shown here.
              </div>
            </TabsContent>
          </Tabs>
        </Panel>
        
        <Panel>
          <h2 className="text-xl font-semibold mb-4">Dialog Example</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Space-HUD Dialog</DialogTitle>
                <DialogDescription>
                  This dialog demonstrates the theme-aware styling and Augmented-UI frames.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">
                  The dialog content adapts to the selected theme, providing a consistent 
                  user experience across Classic, Cosmic, and Moebius variants.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </Panel>
      </div>
    </div>
  ),
}
