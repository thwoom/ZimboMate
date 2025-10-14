# ZimboMate V2 Feature Catalog

This document captures every user-facing surface in the current ZimboMate V2 build (as of 14 Oct 2025). Use it to understand what appears on screen, how to interact with each feature, and any caveats or prerequisites to expect during hands-on sessions.

---

## 1. Global Navigation & Controls

### Header, Layout, and Tabs

- Screen top shows the **ZimboMate V2** masthead, a `ThemeStatusBadge`, and the sticky primary navigation.
- Tabs available to end users: **Play**, **Character**, **Dice**, **Game Management**, **Settings**; a **Button Debug** tab appears in development contexts (localhost/dev flag).
- Tabs are clickable buttons with animated underline; keyboard focus retains accessibility highlights.

### Command Palette (`Ctrl/Cmd + K`)

- Opens an overlay listing navigation destinations, quick dice actions, character utilities, and session tools.
- Type to filter; use arrow keys/`Tab` to move, `Enter` to run.
- Example actions: jump straight to the dice tab, perform a “Quick 2d6 Roll”, start a new chronicle note, or open the Campaign tools.

### Keyboard Shortcut System

- Defaults include tab switching (`Ctrl + 1…6`), quick dice rolls (`Space`, `S/D/C/I/W/H` for stats, `Shift + Q/R/T/Y/U` for common moves), command palette (`Ctrl + K`), theme toggle (`Ctrl + Shift + T`), and placeholders for character save.
- Shortcuts respect context (dice vs character vs global). The **Keyboard Shortcuts** panel in Settings → Help lists every binding and supports searching by description or key.
- Dice shortcuts are active with no modifier by default (configurable); they ignore inputs when focus is inside text fields.

### Chronicle Overlay Prompts

- Floating cards (default top-right) surface automated Chronicle suggestions—stat resolution, loot pickups, resource changes, etc.
- Each card shows why it appeared, checklists of proposed deltas, and buttons to accept, reject, or undo.
- Configure via Settings → Gameplay: toggle overlay, move it to any corner, and cap simultaneous prompts (1–5).

### Theme Status & Component Showcase

- The badge in the header confirms the active theme (Matsu). Settings → Interface exposes a **Theme Showcase** modal with live previews of every tokenized component.
- Accessibility Checker lives in the same section; it runs simulated audits (focus order, missing `alt` text, heading hierarchy, color contrast) and returns per-issue guidance.

### Tooltips & Debugging Helpers

- The app wraps most interactive controls in Radix tooltips with short hints.
- Dev builds expose a **Button Debug** tab plus browser console helpers:
  - `window.ZimboMate.debugButtons()` – highlight buttons.
  - `window.ZimboMate.fixButtons()` – run auto-fix simulation.
  - `window.ZimboMate.buttonReport()` / `.diagnoseButtons()` – log status summaries.

---

## 2. Play Tab – Immersive Story Mode

### Split Layout

- Left pane: **Folio** character sheet (tabs for Stats, Gear, Spells & Hold, Bonds & Debilities, Notes). Highlights appear when Chronicle entries reference relevant data.
- Right pane: toggle between **Chronicle** (default) and **Tools**; animated transitions maintain context.

### Chronicle Composer

- Large parchment-style textarea for narrative input. Guidance text encourages natural language (“fought goblins…”).
- Press **Add to Chronicle** or hit `Ctrl + Enter` (via standard form submit) to queue the note.
- Entry lifecycle: _Draft_ → _Drafting_ (LLM parsing) → _Ready_ ➝ optional _Applying_ ➝ _Applied_ or _Needs review_. Errors surface inline.
- Each entry displays:
  - Narrative rewrite (campaign-tone aware) plus original text.
  - Badges for status & number of deltas.
  - **DeltaChecklist** with toggle switches for every proposed update (e.g., add XP, adjust HP, insert note).

### Chronicle Automations

- **Apply selected** pushes chosen deltas to the sheet via `applyDeltaBundle`; results list applied vs skipped operations.
- Auto-apply policies (XP, loot, damage, hold) respect Settings → Gameplay configuration. When everything auto-qualifies, the entry applies immediately.
- Warnings and errors render as red alerts; the user can retry after adjusting selections.
- **Automation Log** below lists the most recent bundles with timestamps, applied/ skipped ops, and quick undo/dismiss buttons. A Tauri guard card reminds browser users to launch `npm run dev:tauri` for live automation.

### Chronicle Utilities

- **Campaign Vibe** picker (Fantasy, Sci-Fi, Cyberpunk, Horror, Western, Modern) influences narrative phrasing for fallbacks and rewrites.
- Scroll-synced highlight: typing `@` mentions or keywords like "gear", "stats", "spells" auto-focus the matching folio tab.
- Dice integration: when a roll is pending, the folio flashes the Stats tab ("Dice roll in progress").
- Quick actions card ("Edit in Builder", "Jump to Play") provides one-click navigation; textual helper notes remind GPT-powered inline counters update instantly.

### Chronicle Timeline & Advancements

- The **Timeline** view lists every chronicle entry with automation badges, resource chips (XP/HP/Load), entity highlights, and optional tag filters. A new Level Ups filter toggles those milestones inline.
- The **Advancements** tab is a pre-filtered timeline that surfaces only level-up entries. A summary card tracks total advancements, number of characters who leveled, and the most recent milestone.
- Level-up entries now link directly to the advancing character, include stat/move/spell notes, and log resource deltas so the timeline chips stay accurate whether or not automation bundles were used.

### Tools Subtab (AI Generators)

- Three subcategories-**Items**, **Monsters**, **NPCs**-persist across visits.
- Enter a short prompt and click **Create with AI** to seed mock data (name, stats, description). Generated entries list under "Your Items/Monsters/NPCs".
- Items show tags & stats; monsters include HP, Armor, Instinct, Moves; NPCs include appearance, drive, quirk, knowledge.

### Folio Highlights & Notes

- Folio pages react to Chronicle outcomes:
  - **Gear tab** uses slot selectors to equip/unequip with automation support (manual bundle fallback if automation disabled).
  - **Notes tab** features a quick note popover; saving pushes a “folio-note” chronicle entry.
  - **Spells tab** shows known/prepared lists plus Hold tracker (virtualized lists for long collections).

---

## 3. Character Tab – Sheet, Builder, and Session Tools

### Character Dashboard

- Banner shows active character name, level/class badge, XP, HP, Armor, Load, Coin. Buttons: **Manage Session** (opens Session Manager modal) and **Create Character** (launches builder).
- Empty state triggers the builder automatically.

### Folio Tabs (User-Facing Behaviors)

- **Stats & Basic Moves**: attribute grid (auto-resolved scores) and move chips.
- **Gear & Load**:
  - Slot cards (Main Hand, Off Hand, Armor) with select dropdowns.
  - Autocomplete inventory list, quantities, weight totals; virtualization handles large inventories.
  - Equip/unequip triggers automation if permitted; otherwise logs a warning that Chronicle automation is read-only.
- **Spells & Hold**: known/prepared lists with counts, scroll virtualization; Hold entries show move name, description, amount, and roll linkage.
- **Bonds & Debilities**: placeholder cards reminding players to manage via Bond Tracker (see Game Management).
- **Notes**: quick note workflow described above.

### Character Builder (Nine-Step Wizard)

1. **Class** – choose 1 of 10 Dungeon World classes; switching prunes incompatible races/spells automatically.
2. **Identity** – Name, Race (class-filtered), Look; shows class/race-specific move text.
3. **Alignment** – class-specific alignment list.
4. **Assign Stats** – drag/drop standard array (implementation via `StandardArrayAssign` component).
5. **Derived Values** – live preview of HP, Load, and damage die.
6. **Bonds** – add from class templates or free-type; duplicates prevented.
7. **Gear** – pick starting packages per class, toggle coin.
8. **Spellcasting** – for Cleric/Wizard: deity selection, spellbook choices (enforced counts).
9. **Review** – confirm summary then **Create Character**.

- Auto-saves draft to `localStorage` (Save Draft, Reset controls). Navigation buttons allow stepping back/forward; validation gates progress (e.g., require deity for cleric, spells for casters).

### Session Manager Modal

- Pivots between **Menu**, **Create Session**, **Join Session**.
- Connection status indicator (Connected/Connecting/Disconnected) with retry button.
- Create flow: session name, player name, max players, spectator toggle, dice sharing, approval requirement. Submits via `multiplayerService.createSession`.
- Join flow: pick from live session list or paste session ID; updates on service events (`session_created`, `session_joined`).
- After success, modal closes and passes session object back to the app.

### Context-Aware System (Right Rail Card)

- Presents prioritized suggestions (Health, Equipment, Advancement, Tactical, Roleplay).
- Each suggestion includes reason, optional action button (e.g., Heal Character, Start Level Up), and timestamps; dismissible suggestions persist until cleared.
- Works in compact mode on Character tab; the same module appears on Dice tab.

---

## 4. Dice Tab – Rolls, History, and Shortcuts

### Unified Roll System

- **Stat Cards**: each ability shows score + modifier; clicking rolls 2d6+mod via `rollStat`.
- **Core Moves**: cards for Hack & Slash, Defy Danger, Discern Realities, Spout Lore (`rollMove`).
- **Custom Roll**: label, notes, numeric modifier. Submit triggers `rollCustom`.
- **Last Roll Summary**: plain-English breakdown with **Copy summary** button.
- **Roll Log**:
  - Filters by type (Stat/Move/Custom) and outcome (Success/Partial/Failure).
  - Entries show outcome badge, timestamp (“2 minutes ago”), dice breakdown, context description.
  - Buttons: **Reroll** (replays via `reroll`) and **Copy** (clipboard summary).

### Stat Roller (Story-Centric Flow)

- Shows grid of STR/DEX/CON/INT/WIS/CHA buttons with icon + short description.
- Selecting a stat opens a detail panel:
  - Back button to return to grid.
  - `ChronicleEnabledDiceRoller` with built-in prompt that asks “Why did you roll …?” after completion.
  - Optional “Examples” list to remind players of stat use cases.
- Auto-closes 5 seconds after completing a roll unless user reopens.

### Keyboard & Chronicle Integration

- Dice keyboard shortcuts: `S/D/C/I/W/H` for stat rolls; `Shift + Q/E/R/T/Y/U` for moves. Custom roll modifiers with `Ctrl + 1–6` (positive) and `Ctrl + Shift + 1–6` (negative) are logged for future implementation.
- Rolling from Dice tab feeds context back to Chronicle automation, enabling automatic prompt linking in the Play tab.

---

## 5. Game Management – GM & Long-Term Tools

### Tab Navigation

- Search bar appears for Chronicle, Campaign, and Monsters tabs (filters content live).
- Animated tab switch highlights active section; “Featured” badge marks Chronicle.

### Chronicle Management Panel

- **Write View** (default):
  - Rich text area identical to Play tab but oriented for GM use.
  - @mention suggestions appear as you type; `buildMentionContext` surfaces candidate entities.
  - Status alerts for automation (drafting/applying) appear inline.
- **Timeline View**:
  - Shows session timeline, resource logs, automation audit cards.
  - Guard rails warn if Tauri desktop bridge is unavailable; button to dismiss.
- **Entities View**:
  - Grid of entity cards (characters, locations, items, etc.) with mention count, last mentioned time, snippets.
  - Clicking opens an overlay preview (via `EntityPreview`) with cross-linked entries and relationships.
- Audit log and bundle snapshots accessible via Settings → Gameplay > Automation Log actions.

### Campaign Panel

- Requires selecting or creating a campaign:
  - **Campaign Selector** dropdown (when existing data) plus **Create Campaign** modal (name, description).
  - Overview Card: displays description, creation date, player notes.
- **Statistics Grid**: total sessions, journal entries, NPCs, locations, total XP, average session duration (mock data via `campaignManagementMockData`).
- **Quick Actions**: add session/journal/NPC/location (UI placeholder—wire up service to activate).
- **Recent Activity**: list sorted by date mixing sessions and journal entries.
- Sub-tabs:
  - **Sessions**: timeline with search filter.
  - **Journal**: detailed entries.
  - **NPCs**: manager for characters (role, relationship).
  - **Locations**: type-filtered tracker.

### Bond Tracker

- Summaries for total, active, resolved bonds; XP auto-awarded via `addXP` when resolving.
- Cards per bond with edit/delete/resolve actions; resolved section lists completed bonds (+1 XP indicator).
- Creation form supports optional “Character Name” association.

### Monster Manager

- Search by name, filter by origin tags, toggle favorites, and switch between template list and quick monsters.
- Cards show description, level, origin badges. Buttons:
  - **Favorite / Unfavorite** toggles persisted preference.
  - **Add to Combat** integrates with combat store (if enabled); quick monsters create instant stat blocks.
- Quick action button generates a placeholder “Quick Foe” (8 HP, 1 Armor, d6 damage).

### Multiplayer Sessions

- Marketing-style card summarizing upcoming features; core functionality handled through Character tab’s Session Manager.
- Badges highlight planned capabilities (dice sharing, WebSocket integration, voice chat placeholder).

### GM Tools (Coming Soon)

- Placeholder cards for Session Timer, Random Tables, Initiative Tracker, Notes & References—all marked “Coming Soon” with outline buttons. Use this layout to slot future utilities.

---

## 6. Settings & Support

### Gameplay Settings (Expanded by Default)

- **Chronicle Settings**:
  - Toggle overlay on/off, pick overlay corner, set max prompts.
  - Narrative tone (Gritty/Heroic/Terse) and verbosity (Short/Standard/Long).
  - Auto-equip weapons toggle.
  - Auto-apply policy per delta type (Auto/Confirm/Off for XP on miss, Loot pickups, Damage, Ammo/Hold).
  - GPT-5 cost guardrail: set per-session USD cap, view spend, reset tally, clear guardrail.
  - Automation log stats with shortcuts to copy latest bundle snapshot or clear logs.
- **Other gameplay toggles**: Auto-save (characters), Dice sound effects, Quick roll shortcuts, Keyboard shortcut configuration placeholder.

### Interface & Theme

- Theme Showcase launcher (opens modal with token previews).
- Accessibility Checker (runs simulated audit, lists issues/passed checks, toggles for reduce motion, high contrast, large text, keyboard navigation, screen reader mode).

### Data Management

- **Import Files**: drag/drop or browse; validates size/type, simulates validation/import progress, allows removing items and restarting. Ideal for JSON/CSV/XML/ZIP assets.
- **Export Data**: pick target (characters, campaigns, settings) and format (JSON, CSV, ZIP); simulates progress and exposes download button.
- **Backup & Restore**: create timestamped backups, restore previous snapshots, view retention policy.
- **File Browser**: tree view of mock filesystem rooted in user data, with actions to view, rename, delete, or download. Uses virtualization for lists and progress indicators for simulated operations.

### System & Performance

- Currently a placeholder (`PerformanceMonitor` returns null); slot reserved for future telemetry dashboards.

### Help & Support

- **Help System** tabs:
  - Quick Start, User Guide, Keyboard Shortcuts, Troubleshooting (all rendered from structured content arrays).
  - Search across sections with result counts; copy text snippets to clipboard.
- **Keyboard Shortcuts Panel** replicates the standalone view with category filters and search.
- Closing callouts remind users to use the command palette, consult knowledge base, or join community channels.

### Settings Search & Expansion

- Search bar filters categories by title/description; categories collapse/expand individually; expanded state persists in component state.

---

## 7. Developer & QA Utilities

### Button Debug Tab (Dev-Only)

- Cards cover:
  - Variant click counters (Primary, Secondary, Outline, Ghost, Destructive, Magical, Cyber).
  - Size grid (XS through XL) and async buttons (simulate loading).
  - Icon buttons, segmented controls, toggle groups.
  - Game-specific actions (Heal, Damage, Roll Dice, Rest, Defend) with counters.
  - Event handling tests logging to console (mouse/focus events).
  - Test summary tiles (total clicks, buttons tested, loading states, “All Working” badge).
- **Run Diagnosis**, **Enable Debug Mode**, **Auto-Fix Issues**, **Download Report** buttons tie into `buttonUtils` mock analytics; download creates a text blob.

### Console Helpers & Global Debug Flags

- From the browser console, call the `window.ZimboMate.*` methods documented above to mirror UI actions.
- Logging uses the shared `logger` utility (`logger.info`, `.warn`, `.error`, `.debug`) for consistent output.

---

## 8. Platform Notes & Prerequisites

- **Automation Guardrails**: Running strictly in the browser disables live Chronicle bundle application. Launch the Tauri shell (`npm run dev:tauri`) for full automation (UI surfaces the red guard card if not connected).
- **LLM Cost Management**: ChronicleProvider tracks per-session spend; once the cap is hit, prompts fall back to deterministic templates.
- **Persistence**: Character, campaign, chronicle, inventory, monster stores use Zustand persistence; drafts survive reloads unless explicitly cleared.
- **Fonts & Theme Compliance**: Nunito and PT Serif must remain; the `.texture` overlay at the app root should not be removed.

Use this catalog as a checklist when demoing or regression testing. Each bullet references behaviors currently wired in the UI, including placeholders that still surface to users, so QA can verify copy, affordances, and guardrails match expectations.
