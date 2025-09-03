# ZimboMate UI/UX Specifications

## Overview

This document outlines the complete UI/UX specifications for ZimboMate, a digital companion for Dungeon World tabletop RPG. The interface is designed to be intuitive, accessible, and enhance the gaming experience without getting in the way.

## Design Principles

### 1. **Cozy & Warm**
- Rose Pine color palette creates a warm, inviting atmosphere
- Soft shadows and rounded corners for comfort
- Muted colors reduce eye strain during long gaming sessions

### 2. **Accessibility First**
- High contrast ratios (WCAG AA compliant)
- Keyboard navigation support
- Screen reader friendly
- Reduced motion options
- Multiple theme options including high contrast

### 3. **Game-Focused**
- Quick access to frequently used actions
- Clear visual hierarchy for game information
- Contextual information display
- Minimal cognitive load

### 4. **Responsive & Adaptive**
- Works on desktop, tablet, and mobile
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## Layout Architecture

### Main Layout Structure
```text
┌─────────────────────────────────────────────────────┐
│ Header (Theme Toggle, Title)                        │
├─────────────┬─────────────────────┬─────────────────┤
│ Sidebar     │ Main Content Area   │ Auxiliary       │
│ (Panels)    │ (Active Panel)      │ Drawer          │
│             │                     │ (Optional)      │
│             │                     │                 │
│             │                     │                 │
│             │                     │                 │
│             │                     │                 │
├─────────────┴─────────────────────┴─────────────────┤
│ Floating Action Button (Dice)                       │
└─────────────────────────────────────────────────────┘
```text

### Responsive Breakpoints
- **Mobile**: < 768px - Single column, collapsible sidebar
- **Tablet**: 768px - 1024px - Two column, overlay drawer
- **Desktop**: > 1024px - Full three-column layout

## Component Specifications

### 1. Theme Selector
**Location**: Fixed top-right corner
**Features**:
- Dropdown with theme previews
- Current theme indicator
- Smooth transitions between themes
- Keyboard accessible

**States**:
- Closed: Shows current theme name and icon
- Open: Displays all available themes with descriptions

### 2. Sidebar Navigation
**Width**: 260px (desktop), collapsible (mobile)
**Features**:
- Panel icons with labels
- Active state indication
- Smooth hover animations
- Badge notifications for updates

**Panel Categories**:
- Character Management (Stats, Creation, Equipment)
- Gameplay (Moves, Dice Rolling)
- Campaign Tools (Notes, References)

### 3. Main Content Area
**Layout**: Flexible container for active panel
**Features**:
- Smooth panel transitions
- Consistent padding and spacing
- Scrollable content areas
- Loading states

### 4. Auxiliary Drawer
**Width**: 450px
**Trigger**: Context-dependent (equipment details, move descriptions)
**Features**:
- Slide-in animation from right
- Overlay backdrop on mobile
- Quick close actions

### 5. Floating Dice Button
**Position**: Bottom-right corner
**Features**:
- Always accessible for quick rolls
- Shows last roll result
- Animated on roll
- Expandable quick roll interface

## Panel Specifications

### Character Creation Panel
**Layout**: Multi-step wizard
**Features**:
- Progress indicator with emoji steps
- Floating action bar for navigation
- Real-time validation feedback
- Template system for quick creation

**Steps**:
1. 🎭 Choose Class
2. 📊 Assign Stats  
3. 🎒 Select Equipment
4. 🔗 Define Bonds
5. ✨ Finishing Touches

### Character Stats Panel
**Layout**: Grid-based stat display
**Features**:
- Large, readable stat values
- Modifier calculations
- HP/XP progress bars
- Quick stat roll buttons

### Equipment Panel
**Layout**: Categorized item lists
**Features**:
- Drag-and-drop organization
- Auto-calculation of load/armor
- Equipment slot visualization
- Item detail drawer

### Moves Panel
**Layout**: Searchable card grid
**Features**:
- Category filtering
- Search functionality
- One-click rolling
- Move suggestions based on context
- Roll history and analytics

## Interaction Patterns

### 1. **Hover States**
- Subtle elevation (2px translateY)
- Shadow enhancement
- Color brightening
- 150ms transition

### 2. **Active States**
- Pressed appearance (no elevation)
- Slightly darker colors
- Immediate feedback

### 3. **Focus States**
- Visible focus rings
- High contrast outlines
- Keyboard navigation indicators

### 4. **Loading States**
- Skeleton screens for content
- Spinner animations for actions
- Progress bars for multi-step processes

### 5. **Error States**
- Rose Pine Love color for errors
- Clear error messages
- Inline validation feedback
- Recovery suggestions

## Animation Guidelines

### Transition Timing
- **Fast**: 150ms - Hover effects, button states
- **Normal**: 250ms - Panel transitions, modal open/close
- **Slow**: 350ms - Page transitions, complex animations

### Easing Functions
- **ease-in-out**: Default for most transitions
- **ease-out**: Entrance animations
- **ease-in**: Exit animations

### Motion Principles
- **Purposeful**: Every animation serves a function
- **Subtle**: Enhances without distracting
- **Consistent**: Same patterns throughout app
- **Respectful**: Honors prefers-reduced-motion

## Typography Hierarchy

### Headings
- **H1**: 2.25rem (36px) - Page titles
- **H2**: 1.875rem (30px) - Section headers
- **H3**: 1.5rem (24px) - Subsection headers
- **H4**: 1.25rem (20px) - Card titles
- **H5**: 1.125rem (18px) - Small headers
- **H6**: 1rem (16px) - Labels

### Body Text
- **Large**: 1.125rem (18px) - Important content
- **Normal**: 1rem (16px) - Default body text
- **Small**: 0.875rem (14px) - Secondary text
- **Caption**: 0.75rem (12px) - Captions, labels

### Interactive Text
- **Button**: 0.875rem (14px), weight 500
- **Link**: Inherits size, underline on hover
- **Label**: 0.875rem (14px), weight 600

## Color Usage Guidelines

### Background Hierarchy
1. **Base**: Main application background
2. **Surface**: Cards, panels, elevated content
3. **Overlay**: Hover states, temporary surfaces

### Text Hierarchy
1. **Primary**: Main content, headings
2. **Secondary**: Supporting text, labels
3. **Muted**: Disabled text, placeholders

### Interactive Colors
- **Primary**: Main actions, brand elements
- **Success**: Positive actions, confirmations
- **Warning**: Caution, attention needed
- **Danger**: Destructive actions, errors
- **Info**: Informational content

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual hierarchy
- All interactive elements focusable
- Escape key closes modals/dropdowns
- Arrow keys for navigation within components

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content
- Skip links for main content

### Visual Accessibility
- Minimum 4.5:1 contrast ratio
- Focus indicators clearly visible
- No color-only information
- Scalable text up to 200%

### Motor Accessibility
- Large touch targets (44px minimum)
- Generous spacing between interactive elements
- No time-based interactions
- Alternative input methods supported

## Mobile Considerations

### Touch Interactions
- **Tap**: Primary interaction
- **Long Press**: Context menus, additional options
- **Swipe**: Navigation, dismissal
- **Pinch**: Zoom (where applicable)

### Mobile-Specific Features
- Pull-to-refresh where appropriate
- Bottom navigation for thumb accessibility
- Collapsible sections to save space
- Optimized keyboard layouts

### Performance
- Lazy loading for images and heavy content
- Efficient animations using CSS transforms
- Minimal JavaScript for core interactions
- Progressive enhancement

## Error Handling & Feedback

### Error Types
1. **Validation Errors**: Inline, immediate feedback
2. **Network Errors**: Toast notifications with retry options
3. **System Errors**: Full-page error states with recovery
4. **User Errors**: Helpful guidance and suggestions

### Success Feedback
- **Immediate**: Button state changes, form validation
- **Delayed**: Toast notifications for completed actions
- **Persistent**: Status indicators, progress tracking

### Loading States
- **Instant**: Skeleton screens for predictable content
- **Short**: Spinner animations for quick operations
- **Long**: Progress bars with cancellation options

## Implementation Notes

### CSS Architecture
- CSS Custom Properties for theming
- BEM methodology for class naming
- Component-scoped styles
- Utility classes for common patterns

### JavaScript Interactions
- Progressive enhancement
- Graceful degradation
- Event delegation for performance
- Debounced input handling

### Performance Considerations
- Critical CSS inlined
- Non-critical CSS loaded asynchronously
- Image optimization and lazy loading
- Code splitting for large components

This specification ensures ZimboMate provides a consistent, accessible, and delightful user experience that enhances the Dungeon World gaming experience.
