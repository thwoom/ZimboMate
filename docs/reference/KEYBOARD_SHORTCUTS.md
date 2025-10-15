# Keyboard Shortcuts – ZimboMate V2 (Current Implementation)

_Last updated: 2025-10-14_

This guide lists the keyboard shortcuts that actually exist in the current V2 build. Each shortcut is registered through `KeyboardShortcutsService` and/or the dice shortcut hooks, so the tables below reflect the real code rather than the older marketing copy.

> Tip: You can see these bindings in-app under **Settings → Keyboard Shortcuts**. That panel is powered by the same service used here.

---

## 1. Global Shortcuts (Anywhere in the App)

| Shortcut          | Action                            | Notes                                                                 |
|-------------------|-----------------------------------|-----------------------------------------------------------------------|
| `Ctrl` + `K` / `⌘` + `K` | Open command palette              | Works unless you're typing in an input; closes with `Esc`.            |
| `Ctrl` + `1` … `Ctrl` + `6` | Switch to primary tabs            | 1: Character, 2: Dice, 3: Moves, 4: Equipment, 5: Session tools, 6: Campaign. While the Dice tab is active these combos perform the custom modifier rolls instead of navigation. |
| `Space`           | Quick dice access                 | Moves you to the Dice tab from anywhere.                              |
| `Esc`             | Close dialogs / cancel actions    | Standard Radix dialog behaviour.                                      |

> _Theme toggle (`Ctrl` + `Shift` + `T`) and other experimental bindings are registered but currently just log to the console—treat them as placeholders until a real action is wired._

---

## 2. Dice & Move Shortcuts

These shortcuts are active whenever you are not typing into an input/textarea and the dice roller is idle.

### Stat Rolls (no modifier key)

| Key | Roll                           |
|-----|--------------------------------|
| `S` | Roll +STR (Strength)           |
| `D` | Roll +DEX (Dexterity)          |
| `C` | Roll +CON (Constitution)       |
| `I` | Roll +INT (Intelligence)       |
| `W` | Roll +WIS (Wisdom)             |
| `H` | Roll +CHA (Charisma)           |

Each roll is logged via `useDiceStore.rollStat` with the active character.

### Move Rolls (hold `Shift`)

| Shortcut     | Move                | Stat Used |
|--------------|---------------------|-----------|
| `Shift` + `Q` | Hack & Slash         | STR       |
| `Shift` + `E` | Defend               | CON       |
| `Shift` + `R` | Volley               | DEX       |
| `Shift` + `T` | Discern Realities    | WIS       |
| `Shift` + `Y` | Spout Lore           | INT       |
| `Shift` + `U` | Parley               | CHA       |

These call `useDiceStore.rollMove` with the corresponding move ID.

### Custom Modifier Rolls (Dice tab)

| Shortcut | Result |
|----------|--------|
| `Ctrl` + `1` … `Ctrl` + `6` | Roll 2d6 with a +N forward modifier (handled by `useDiceKeyboardShortcuts` via `diceStore.rollCustom`). |
| `Ctrl` + `Shift` + `1` … `6`| Roll 2d6 with a -N modifier using the same path. |

These bindings are only enabled while the Dice tab is active so they do not conflict with global navigation.

---

## 3. Navigation & Session Context Binding

The shortcut service also registers bindings for session tools (`Ctrl` + `N` = new note, `Ctrl` + `F` = search notes, `Ctrl` + `T` = start timer). These are wired once the relevant session components call `useSessionToolsShortcuts`. If you add those actions, they will start working immediately—otherwise they fall back to no-op placeholders.

Similarly, `Ctrl` + `S` (“Save Character”) is defined but does nothing until a component calls `useCharacterShortcuts({ onSave })`.

---

## 4. Working with the Shortcut Service

- **Context awareness:** the service ignores shortcuts when the target is an `<input>`, `<textarea>`, or contentEditable element so text entry is safe.
- **Formatting:** `keyboardShortcutsService.formatShortcut()` automatically adapts the displayed modifier labels for macOS vs Windows/Linux. Use it whenever you display shortcuts in UI.
- **Custom bindings:** use the hook helpers in `src/hooks/useKeyboardShortcuts.ts` (`useKeyboardShortcuts`, `useDiceShortcuts`, `useNavigationShortcuts`, etc.) instead of registering listeners manually.

---

## 5. Updating This Document

Whenever you add, remove, or change a binding:

1. Update `KeyboardShortcutsService` (or the relevant hook) to register the shortcut.
2. Verify the Settings → Keyboard Shortcuts panel reflects the change.
3. Update this doc so the published reference stays in sync.
4. Note any placeholders/TODOs so UX doesn’t over-promise behaviour.

Keeping code and docs aligned prevents confusion like the previous “master list” that described shortcuts we never shipped. If you move or remove this file, remember to update the README links that point here.
