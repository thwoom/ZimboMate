# Navigation Menu Standardization Task

## Objective
Search through the codebase and standardize all navigation menus to match the established pattern used in the Folio character sheet tabs.

## Reference Implementation
The standard navigation pattern is found in `src/components/game/CharacterSheet/Folio.tsx` (lines 82-108):

```tsx
<Tabs
  value={currentPage}
  onValueChange={(value) => setCurrentPage(value as FolioPage)}
  className='min-w-0'
>
  <TabsList className='w-full gap-1'>
    <TabsTrigger value='stats' className='gap-1.5'>
      <BarChart3 size={16} />
      <span>Stats</span>
    </TabsTrigger>
    <TabsTrigger value='gear' className='gap-1.5'>
      <Backpack size={16} />
      <span>Gear</span>
    </TabsTrigger>
    {/* ... more triggers */}
  </TabsList>
</Tabs>
```

## Key Characteristics of Standard Pattern

### 1. Component Structure
- Uses Radix UI `Tabs`, `TabsList`, `TabsTrigger` components
- Import from: `@/components/ui/tabs`

### 2. Tabs Container
- Class: `className='min-w-0'`
- Has `value` and `onValueChange` props

### 3. TabsList Styling
- Class: `className='w-full gap-1'`
- NO background color (`bg-muted/40` should be removed)
- NO padding (`p-1` should be removed)
- Simple gap between items

### 4. TabsTrigger Styling
- Class: `className='gap-1.5'`
- Icon size: `size={16}` (not className='size-4')
- Structure: `<Icon /> <span>Label</span>`
- NO complex flex classes
- NO `px-3 py-2` padding classes
- NO `data-[state=active]:shadow-primary` classes

### 5. What to AVOID
- Card wrappers around TabsList
- Background colors on TabsList (`bg-muted/40`)
- Padding on TabsList (`p-1`)
- Complex flex classes on TabsTrigger
- Button components instead of Tabs components

## Search Strategy

1. **Find all TabsList usage:**
   ```bash
   rg "TabsList" --type tsx --type ts ./src
   ```

2. **Find all navigation-like Button groups:**
   ```bash
   rg "variant=.*primary.*ghost" --type tsx ./src
   ```

3. **Look for Card-wrapped navigation:**
   ```bash
   rg "<Card.*<TabsList" -A 5 ./src
   ```

## Files Already Standardized
- ✅ `src/components/game/CharacterSheet/Folio.tsx` - Reference implementation
- ✅ `src/components/game/GameManagementTab.tsx` - Updated to match
- ✅ `src/components/game/PlayTab.tsx` - Chronicle/Tools tabs (intentionally different - has bg-muted/40 for visual separation)
- ✅ `src/components/game/SessionTools/SessionToolsPanel.tsx` - Updated to match
- ✅ `src/components/game/Chronicle/ChroniclePanel.tsx` - Updated to match

## Files to Check
Search for these patterns and update if found:

1. Any `TabsList` with `bg-muted/40 p-1` classes
2. Any `TabsTrigger` with complex flex classes
3. Any navigation using Button components instead of Tabs
4. Any Card components wrapping TabsList

## Exceptions
Some navigation menus intentionally use different styles:
- **PlayTab Chronicle/Tools navigation** - Uses `bg-muted/40 p-1` for visual separation in the right rail
- **PlayTab Tools sub-navigation** - Uses `bg-muted/40 p-1` for consistency with parent
- **Main app navigation** - Uses different styling (not tabs-based)

## Implementation Steps

For each non-standard navigation found:

1. **Import the correct components:**
   ```tsx
   import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
   ```

2. **Replace Button-based navigation:**
   - Remove Card wrapper if present
   - Replace Button components with Tabs structure
   - Update state management to use `value` and `onValueChange`

3. **Update TabsList:**
   - Change class to: `className='w-full gap-1'`
   - Remove `bg-muted/40`, `p-1`, and flex classes

4. **Update TabsTrigger:**
   - Change class to: `className='gap-1.5'`
   - Use `size={16}` for icons
   - Remove padding, flex, and shadow classes
   - Keep structure: `<Icon size={16} /> <span>Label</span>`

5. **Test functionality:**
   - Verify tab switching works
   - Check active state styling
   - Ensure responsive behavior

## Example Transformation

### Before (Non-standard):
```tsx
<Card variant='surface'>
  <CardContent>
    <TabsList className='flex w-full flex-wrap items-center justify-start gap-2 bg-muted/40 p-1'>
      <TabsTrigger
        value='write'
        className='flex min-w-0 items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:shadow-primary'
      >
        <BookOpen className='size-4 shrink-0' aria-hidden='true' />
        <span className='truncate'>Write</span>
      </TabsTrigger>
    </TabsList>
  </CardContent>
</Card>
```

### After (Standard):
```tsx
<Tabs value={activeView} onValueChange={setActiveView} className='min-w-0'>
  <TabsList className='w-full gap-1'>
    <TabsTrigger value='write' className='gap-1.5'>
      <BookOpen size={16} />
      <span>Write</span>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

## Validation Checklist

After updating each file, verify:
- [ ] No Card wrapper around TabsList
- [ ] TabsList has `className='w-full gap-1'` only
- [ ] No background or padding on TabsList
- [ ] TabsTrigger has `className='gap-1.5'` only
- [ ] Icons use `size={16}` prop
- [ ] No complex flex or padding classes on TabsTrigger
- [ ] Tab switching functionality works
- [ ] Active state styling is correct

## Notes
- The Folio pattern is the cleanest and most consistent
- PlayTab's Chronicle/Tools navigation intentionally differs for visual hierarchy
- Always test after changes to ensure functionality is preserved
- Keep icon imports and state management logic intact