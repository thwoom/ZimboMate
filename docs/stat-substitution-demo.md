# Stat Substitution Demo: Defensive Fighter

## Overview
This demo shows how the "Defensive Fighter" advanced move is now integrated into the gameplay system, providing automatic stat substitution options for the "Defy Danger" move.

## What Was Implemented

### 1. **StatSubstitutionService** (`src/services/StatSubstitutionService.ts`)
- Automatically detects stat substitution moves from character's known moves
- Parses move descriptions to find stat substitution patterns
- Provides methods to get available stats, best stat, and explanations

### 2. **Enhanced DiceRoller** (`src/components/DiceRoller.tsx`)
- Shows stat selection UI when multiple stats are available
- Automatically suggests the best stat based on character attributes
- Displays substitution explanations (e.g., "Using CON due to: Defensive Fighter")

### 3. **Enhanced MoveCard** (`src/components/MoveCard.tsx`)
- Shows ⚡ indicator when a move has stat substitution options
- Displays available stats with their values in the move details
- Provides visual feedback about stat substitution capabilities

## How It Works

### Before (Manual Process)
1. Player selects "Defy Danger" move
2. Player manually remembers they have "Defensive Fighter"
3. Player manually chooses CON instead of the suggested stat
4. No visual indication of available options

### After (Integrated System)
1. Player selects "Defy Danger" move
2. System automatically detects "Defensive Fighter" from character's known moves
3. DiceRoller shows stat selection with both default stat and CON
4. System suggests the best stat (highest value)
5. Player can easily switch between stats with visual feedback
6. System shows explanation: "Using CON due to: Defensive Fighter"

## Example Character Setup

```typescript
const fighterWithDefensiveFighter = {
  name: "Thorin",
  class: "Fighter",
  level: 3,
  attributes: {
    STR: 16,
    DEX: 12,
    CON: 14,  // Higher than DEX, so CON will be suggested
    INT: 10,
    WIS: 8,
    CHA: 12
  },
  knownMoves: ["fighter-advanced-4"] // Defensive Fighter
};
```

## UI Flow

### 1. Move Selection
When viewing "Defy Danger" in the Moves Panel:
- Shows ⚡ indicator next to the stat
- In expanded view, shows "⚡ Stat Options" with available stats

### 2. Dice Rolling
When rolling "Defy Danger":
- Shows stat selection buttons: [STR] [CON]
- CON is highlighted as selected (higher value)
- Shows explanation: "Using CON due to: Defensive Fighter"
- Roll uses CON modifier instead of default stat

### 3. Visual Indicators
- ⚡ icon pulses to draw attention to stat substitution
- Selected stat is highlighted in primary color
- Available stats show their values for easy comparison

## Supported Moves

The system currently supports these stat substitution patterns:
- "use [STAT] instead of any other stat"
- "use [STAT] instead of [STAT]"
- "choose to use [STAT] instead"
- "may use [STAT] instead"

## Future Enhancements

1. **More Move Types**: Support for other stat substitution moves
2. **Conditional Substitutions**: Support for situational stat substitutions
3. **Move Combinations**: Support for multiple substitution sources
4. **Custom Substitutions**: Allow players to create custom stat substitution rules

## Testing

Run the tests to verify functionality:
```bash
npx vitest run test/services/StatSubstitutionService.test.ts
```

## Benefits

1. **Reduced Cognitive Load**: Players don't need to remember all their stat substitution abilities
2. **Better UX**: Clear visual indicators and explanations
3. **Optimal Play**: System suggests the best stat automatically
4. **Consistency**: All stat substitutions work the same way
5. **Extensibility**: Easy to add new stat substitution moves
