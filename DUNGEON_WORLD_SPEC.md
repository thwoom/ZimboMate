# Dungeon World Rules Spec — ZimboMate

> Purpose: give the coding agent an **app-focused** reference to Dungeon World mechanics so it can implement features (XP, moves, bonds, debilities, dice, end‑of‑session) **without guessing**. Keep text concise and implementation‑ready.

## Scope
- Model only what the Control Panel needs:
  - Characters, stats, HP/Armor, class damage die
  - Moves (basic/class/special) and roll resolution
  - Bonds and Debilities
  - XP rules (misses + End of Session + Alignment/Drive)
  - Session logs, notes, exports

## Core Terms
- **Abilities:** STR, DEX, CON, INT, WIS, CHA. Store **modifiers** directly; mapping from scores is optional. If storing scores, use DW’s standard mapping.

  | Score | Mod |
  |-------|-----|
  | 3     | −3  |
  | 4–5   | −2  |
  | 6–8   | −1  |
  | 9–12  | 0   |
  | 13–15 | +1  |
  | 16–17 | +2  |
  | 18    | +3  |

- **Roll:** `2d6 + relevant ability mod` → outcome band:
  - **10+**: Strong hit (full success).
  - **7–9**: Weak hit (success with cost/complication).
  - **6−**: Miss → mark **+1 XP**. Miss triggers a GM move.
- **HP & Armor:** Integers. Armor reduces incoming damage before HP loss.
- **Damage Die (class):** e.g., d4/d6/d8/d10 depending on class. Store per character.
- **Debilities (−1 to an ability):** `Weak(STR), Shaky(DEX), Sick(CON), Stunned(INT), Confused(WIS), Scarred(CHA)`.
- **Bonds:** Free‑text statements tying your character to others; resolving a bond marks XP and you write a new one.
- **Alignment/Drive:** If fulfilled during the session, mark +1 XP at End of Session.

## XP Rules (baseline DW 1e)
- **On Miss (6−):** mark **+1 XP** immediately.
- **End of Session (EoS):**
  - Ask the three questions (each “Yes” = +1 XP):
    1. Did we learn something new and important about the world?
    2. Did we overcome a notable monster or enemy?
    3. Did we loot a memorable treasure?
  - **Resolve bonds** you feel are no longer relevant → **+1 XP each**, then write new bonds.
  - **Alignment/Drive fulfilled?** → **+1 XP**.
- **Level Up:** When XP ≥ `7 + current level`, you may level up (typically during Make Camp or between sessions). On level up: increase level by 1, follow class rules (stat bumps/moves), subtract the cost from XP.

> Note: Some tables use “Drive” instead of Alignment; treat them equivalently for XP (+1 if fulfilled).

## Data Model (TypeScript types)

```ts
type Ability = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
type DebilityKey = "WEAK" | "SHAKY" | "SICK" | "STUNNED" | "CONFUSED" | "SCARRED";
type RollBand = "MISS" | "WEAK_HIT" | "STRONG_HIT";

interface Bond {
  id: string;
  text: string;
  withCharacter?: string; // name or id
  resolvedAt?: string;    // ISO timestamp
}

interface Debility {
  key: DebilityKey;
  active: boolean;
}

interface Move {
  id: string;
  name: string;
  kind: "BASIC" | "CLASS" | "SPECIAL" | "CUSTOM";
  ability?: Ability;      // when a move rolls a stat
  description: string;    // short rules text (no paste of book text)
  tags?: string[];        // e.g., ["ranged","reload"]
}

interface DiceRoll {
  id: string;
  moveId?: string;
  ability?: Ability;
  base: [number, number]; // the two d6 results
  modifier: number;       // ability mod + situational mods
  total: number;          // base sum + modifier
  band: RollBand;         // derived: MISS/WEAK_HIT/STRONG_HIT
  xpOnMissApplied: boolean;
  at: string;             // ISO timestamp
  note?: string;
}

interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  className: string;
  alignmentOrDrive?: string;  // free text
  abilities: Record<Ability, number>; // store modifiers directly
  hp: { current: number; max: number };
  armor: number;
  damageDie: "d4"|"d6"|"d8"|"d10"; // extend if needed
  debilities: Record<DebilityKey, boolean>;
  bonds: Bond[];
  moves: Move[];
  inventory: InventoryItem[];
  notes?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  qty?: number;
  tags?: string[]; // e.g., ["close","reach","2 weight"]
}

interface SessionLogEntry {
  id: string;
  type:
    | "ROLL"
    | "XP_GAIN"
    | "BOND_RESOLVED"
    | "DEBILITY_ADDED"
    | "DEBILITY_REMOVED"
    | "NOTE"
    | "EoS_SUMMARY";
  payload: any;        // use specific payloads per type
  at: string;          // ISO timestamp
}

interface Session {
  id: string;
  title: string;
  startedAt: string;
  endedAt?: string;
  characterIds: string[];
  log: SessionLogEntry[];
}
```

## Deterministic Helpers (pseudo-code)

```ts
function bandFromTotal(total: number): RollBand {
  if (total <= 6) return "MISS";
  if (total <= 9) return "WEAK_HIT";
  return "STRONG_HIT";
}

function applyMissXP(char: Character, roll: DiceRoll): void {
  if (roll.band === "MISS" && !roll.xpOnMissApplied) {
    char.xp += 1;
    roll.xpOnMissApplied = true;
  }
}

interface EoSChecklist {
  learnedSomethingNew: boolean;
  overcameNotableEnemy: boolean;
  lootedMemorableTreasure: boolean;
  alignmentOrDriveFulfilled: boolean;
  bondsResolvedIds: string[];
}

function endOfSessionXP(char: Character, eos: EoSChecklist): number {
  let gained = 0;
  const yes = [
    eos.learnedSomethingNew,
    eos.overcameNotableEnemy,
    eos.lootedMemorableTreasure,
  ].filter(Boolean).length;
  gained += yes; // +1 each 'Yes' (0..3)
  if (eos.alignmentOrDriveFulfilled) gained += 1;
  gained += eos.bondsResolvedIds.length; // +1 per resolved bond
  char.xp += gained;
  return gained;
}

function canLevelUp(char: Character): boolean {
  return char.xp >= (7 + char.level);
}
```

## UX & Automation Rules
- When a roll is logged, compute `total` and `band` immediately; if `MISS`, auto‑mark +1 XP and log an `XP_GAIN` entry.
- A Debility toggle automatically applies a −1 to the corresponding ability **modifier** for roll calculations (do not mutate the base score if you store scores).
- EoS UI is a checklist + bonds table. Submitting it:
  - Adds a summarized `EoS_SUMMARY` log with XP delta.
  - Auto-increments XP, with a “Level Up available” banner if threshold reached.
- Export/Print must include: character sheet, inventory, active debilities, unresolved/resolved bonds, session log (rolls + outcomes + XP gains).

## Out-of-Scope for v1 (document but don’t implement yet)
- Detailed weapon/armor **tag math** (e.g., messy, forceful) — store tags and notes; leave mechanics to GM.
- Encumbrance and coin — store fields but no auto-math.
- Advanced class move trees — store move text; selection UI later.

## Acceptance Tests (rules layer)
1. `2d6+mod` totals ≤6 → roll.band = MISS, character.xp +1 once per roll.
2. EoS: answering “Yes” to all three questions, fulfilling Drive, and resolving two bonds → **+6 XP** total.
3. Level up becomes available at `xp >= 7 + level`.
4. Activating `SICK` reduces `CON` modifier by −1 for subsequent rolls.
5. Resolving a bond sets `resolvedAt` and grants +1 XP; unresolved bonds grant none.
