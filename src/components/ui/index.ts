// Auth Components
export { AdminOpenAISettings } from './AdminOpenAISettings'
export { useAuth } from './AuthContext'
export type { AuthContextValue, User } from './AuthContext'
export { AuthProvider } from './AuthProvider'
export { Badge, type BadgeProps } from './Badge'
export { badgeVariants } from './badge-variants'
export { StatPickerPopover, STAT_ORDER } from './StatPickerPopover'
// shadcn/ui Base Components (aligned with actual filenames)
export { Button, type ButtonProps } from './Button'
export { buttonVariants } from './button-variants'
// Layout Components
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
} from './Card'


export { cardVariants } from './card-variants'
export { ColorPalette } from './ColorSwatch'

export { HelpSystem } from './HelpSystem'
export { Input, type InputProps } from './Input'
export { Label } from './label'
export {
  Progress,
  progressFillVariants,
  type ProgressProps,
  progressVariants,
} from './Progress'

// Menu Components
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

// Form Components
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'
// Text inputs
export { Textarea, type TextareaProps } from './Textarea'
export { textareaVariants } from './textarea-variants'
export { ThemeComponentShowcase } from './ThemeComponentShowcase'
export { ThemeContext, useTheme } from './ThemeContext'

export type { ThemeContextValue } from './ThemeContext'
// Theme Components
export { ThemeProvider } from './ThemeProvider'
export { ThemeStatusBadge } from './ThemeStatusBadge'
