# Dungeon World Assistant App PRD

Project: ZimboMate V2 Assistant Expansion
Owner: Zimbo
Author: (Assistant)
Status: Draft
Target Release: TBA (post-Chronicle automation rollout)

## 1) Vision & Problem Statement

ZimboMate already keeps character sheets in sync via Chronicle automation. The next step is a cohesive Dungeon World assistant that gives every player and GM organized tools, guided automation, and compliant AI support without fragmenting the experience across spreadsheets, homebrew docs, and ad hoc bots.

Goals:

- Centralize character, quest, and session management in one immersive interface.
- Let the AI assistant handle routine bookkeeping while staying strictly Dungeon World compliant unless the table opts into homebrew.
- Provide GMs a hidden control room for worldbuilding, loot, and procedural events.

Non-goal: Replace the GM or improvise fiction. The assistant proposes, the table decides.

## 2) Scope

### In Scope

- Player-facing tools: character sheet editing, inventory management, quest tracking, session timeline, passive abilities.
- GM-facing tools: dashboards, world wiki, loot/event generators, homebrew content libraries.
- AI assistant natural language commands for both player and GM workflows.
- Rule guardrails and mode switching (Strict vs Creative).
- Schema library to standardize homebrew assets (moves, items, spells, monsters, fronts, etc.).

### Out of Scope (for this phase)

- Real-time multiplayer sync (covered by a separate initiative).
- VR/AR or 3D enhancements beyond existing dice/FX.
- System support outside Dungeon World (future consideration once schema library ships).

## 3) Personas & Jobs

### Player Character (PC) Owner

- Keep stats, moves, and gear accurate with minimal clicks.
- Capture quests and session notes without breaking flow.
- Use natural language to request sheet updates or new items.

### Game Master (GM)

- Maintain hidden prep: NPCs, locations, fronts, loot tables.
- Reveal content smoothly during play.
- Generate compliant homebrew content quickly and store it for later use.

### Table Historian / Note Keeper

- Wants an organized log of rolls, outcomes, and narrative beats.
- Needs quest progress linked to NPCs and locations.

## 4) Success Metrics

- Assistant command success rate >= 95% (no corrections needed).
- > 80% sessions using quest tracker and session log.
- GM prep time reduced by 30% compared to baseline (survey).
- Zero rule violations in Strict DW mode across regression suite.

## 5) Feature Overview & Requirements

### 5.1 Player Tools

#### Character Sheets

- Full CRUD for stats, moves (standard + homebrew), inventory, debilities, bonds.
- Moves include tags (basic/class/advanced/passive) and level requirements.
- Level up flow offers rules-compliant move or stat choices and allows approved homebrew options.
- Acceptance Criteria:
  - [ ] Character sheet stores and validates DW stats (3-18), HP, armor, damage die.
  - [ ] Editing a move updates linked rolls and descriptions immediately.
  - [ ] Level up wizard enforces DW rules unless homebrew flag provided.

#### Inventory Manager

- Track quantity, uses/charges, consumable status, weight, tags.
- Auto-decrement charges when a move or command consumes the item.
- Provide undo and manual overrides.
- Acceptance Criteria:
  - [ ] Items expose fields: quantity, uses current/max, tags, notes.
  - [ ] Consuming an item via command decrements the correct counter.
  - [ ] Undo restores prior state and logs in automation history.

#### Quest Tracker

- Quests with title, description, status (planned, in progress, resolved), subtasks, assigned characters, outcomes.
- Link quests to NPCs, locations, items, and session entries.
- Acceptance Criteria:
  - [ ] Creating a quest stores metadata and optional subtasks.
  - [ ] Completing a subtask updates status and records timestamp.
  - [ ] Quest detail view surfaces linked NPCs and sessions.

#### Session Notes & Timeline

- Timestamped log of rolls, outcomes, player actions, GM moves.
- Supports manual entries and automated Chronicle events.
- Filters by character, quest, or tag.
- Acceptance Criteria:
  - [ ] Every roll result from the dice roller is captured with timestamp and character.
  - [ ] Chronicle automation entries appear with applied deltas and undo links.
  - [ ] Timeline can export to markdown/JSON for archival.

#### Passive / Triggered Abilities

- Attach ongoing effects to characters, companions, items, or locations (e.g., "Gravity shell grants +1 armor in caves").
- Effects can include conditional triggers, reminders, or modifiers.
- Acceptance Criteria:
  - [ ] Passive ability records scope (target, trigger, effect).
  - [ ] System surfaces passive reminders when triggers occur (e.g., start of session, entering tagged location).
  - [ ] Removing the ability clears associated reminders and logs the change.

### 5.2 AI Assistant (Player)

#### Natural Commands

Examples: "Add a healing potion to Kara," "Mark 1 XP for Thorne," "Apply Shaky to Rowan," "Start the character creator".

- Acceptance Criteria:
  - [ ] Commands map to Chronicle or sheet actions (inventory, stats, debilities, XP).
  - [ ] Assistant can launch the character creation wizard with pre-filled context.
  - [ ] Assistant can submit proposals for new homebrew moves pending GM approval.

#### Automated Updates & Prompts

- Auto mark +1 XP on 6- rolls; prompt Aid/Interfere opportunities on 6 or 9.
- Manage debility application and recovery reminders.
- Acceptance Criteria:
  - [ ] Roll outcomes trigger correct assistant prompts within 2 seconds.
  - [ ] Assistant logs applied debilities and schedules recovery checks.
  - [ ] Aid/Interfere prompt can be dismissed or accepted by relevant players.

#### Interactive Move Flows

- Moves like Discern Realities / Spout Lore become guided Q&A; store answers back into timeline.
- Aid/Interfere sends prompts to teammates with relevant modifiers.
- Acceptance Criteria:
  - [ ] Interactive moves present scripted questions per DW rules.
  - [ ] Answers auto-save into session log with move reference.
  - [ ] Aid/Interfere requests track who responded and apply modifiers if accepted.

### 5.3 GM Tools

#### GM Dashboard

- Hidden tab with encounter clock, quick-roll buttons, and reveal controls.
- Configurable "GM Present" indicator to toggle visibility.
- Acceptance Criteria:
  - [ ] Dashboard only visible when GM mode is enabled.
  - [ ] Quick-roll buttons generate loot/events with adjustable rarity.
  - [ ] Reveal button pushes selected content to player view.

#### Worldbuilding & Wiki

- NPCs: traits, factions, session links, secrets.
- Locations: notes, connections, associated quests.
- Items & Loot: hidden entries until revealed.
- Supports homebrew monsters, factions, fronts, dangers.
- Acceptance Criteria:
  - [ ] Each entity type has schema-compliant fields and relationships.
  - [ ] GM can flag entries as hidden; reveal toggles expose them to players.
  - [ ] Fronts/dangers include grim portents, impending doom, linked NPCs.

#### GM AI Assistant

- Conditional tools: evaluate mystery items, roll on loot tables, reveal hidden effects.
- Generative content: create items, spells, monsters, moves, fronts aligned with schema.
- Procedural rolling: auto roll when an item with random behavior is used.
- Acceptance Criteria:
  - [ ] Assist commands respect GM-only visibility unless explicitly revealed.
  - [ ] Generated content validates against schema library before saving.
  - [ ] Mystery item workflow stores unrevealed state and logs reveal history.

### 5.4 Schema Library (Future Feature)

- Unified schema definitions for moves, items, weapons, spells, monsters, fronts, factions, tables.
- Schema validation for both assistant-generated and manually created content.
- Versioned with migration helpers.
- Visibility split ensures players and GMs only see what they should.

#### Player-Facing Schemas

Players can view, request, or contribute to these during play:

- Moves: basic, class/advanced, and passive/triggered abilities (with GM approval for homebrew).
- Weapons & gear: tags, damage dice, special properties.
- Items: consumables, revealed magic items, tracked uses/charges.
- Spells & rituals: known spell lists, one-use tomes.
- Quest entries: public quests with status, subtasks, linked NPCs/locations.

#### GM-Only Schemas

Hidden within the GM dashboard until revealed:

- Mystery items and hidden loot (unrevealed potions, sealed scrolls, secret caches).
- Loot tables with rarity logic and treasure hoards.
- Unrevealed spells & rituals reserved for tomes or random rolls.
- Monsters: stats, moves, instincts, loot tables.
- Fronts & dangers: grim portents, impending dooms, linked threats.
- Factions & organizations: traits, goals, relationships, custom moves.
- Custom tags or house rules (e.g., gravity-bending).

- Acceptance Criteria:
  - [ ] Schema definitions live in shared registry accessible to assistant and UI, with visibility flags for player vs GM scopes.
  - [ ] Creating homebrew content from UI or assistant validates and stores per schema and enforces visibility.
  - [ ] Migration guide exists for updating schemas without breaking existing data.

## 6) Modes & Guardrails

### Strict Dungeon World Mode

- Enforces SRD-only moves, gear, spells.
- Rejects assistant commands outside loaded rule set.
- Requires explicit GM override to accept homebrew content.

### Creative Mode

- Allows brainstorming/homebrew suggestions with clear labels.
- Still respects loaded forbidden tags (e.g., "do not suggest moves").

### Rules File

- JSON/YAML file loaded at session start specifying:
  - Allowed books/expansions.
  - Custom rules, loot rarity tables, homebrew move lists.
  - Forbidden behaviors or content areas.
- Acceptance Criteria:
  - [ ] Rule file validated on load; errors surfaced to GM.
  - [ ] Assistant respects allow/deny lists in real time.
  - [ ] Switching modes updates assistant prompt and UI indicators.

## 7) Dependencies & Integrations

- Chronicle automation and delta executor (must complete Execution Runbook Phases 1-6 first).
- Stores: character, inventory, chronicle, campaign, quest (new), schema registry (new).
- Assistant LLM client: extends existing GPT-5 Responses setup with new tool schemas.
- Feature flags: Strict vs Creative mode, GM dashboard availability.

## 8) Rollout Plan

- Phase 0 (Internal): Build schema library foundations and quest tracker in parallel with Chronicle completion.
- Phase 1 (Player Beta): Release player tools + assistant commands in Strict mode; gather feedback.
- Phase 2 (GM Beta): Enable GM dashboard, world wiki, and generative tools behind invite flag.
- Phase 3 (General Availability): Ship mode switching, rules files, and schema validation publicly.

## 9) Open Questions

- How will multiplayer/state sync interact with assistant commands (future spec)?
- What telemetry thresholds trigger fallback (e.g., assistant refusal rate)?
- Should we offer offline/printable exports for quests and timelines?

## 10) Related Documents

- Chronicle v2 – GPT-5 Unified PRD (`docs/LLM_UPGRADE.md`)
- Dungeon World Feature Parity Roadmap (legacy reference)
- Testing Playbook (`docs/testing-playbook.md`)
