# Dungeon World Control Panel — Space HUD Edition

This repository uses **AI-assisted development**. Two guiding documents exist to ensure consistency and focused execution:

## 📖 Spec & Governance
- **[SPACE_HUD_PLAN.md](./SPACE_HUD_PLAN.md)**  
  The full **design + architecture spec**.  
  - Defines vision, required tools, architecture rules.  
  - Non-negotiable: all development must align with this document.  
  - Contains governance, risks, and acceptance standards.

## ✅ Execution Roadmap
- **[TASKS.md](./TASKS.md)**  
  The **working to-do list**.  
  - Slimmed down to milestones, tasks, exit criteria, and acceptance tests.  
  - Updated as work progresses.  
  - CursorAI should prioritize this file when deciding next actions.

---

## How the Bot Should Use These Files

1. **Always read `SPACE_HUD_PLAN.md` first** to understand the rules of the project.  
   - Treat it as the contract: required tools, architecture boundaries, design principles.  

2. **Execute from `TASKS.md`**.  
   - Follow milestone tasks in order.  
   - Use exit criteria and acceptance tests as success conditions.  

3. **If `TASKS.md` is ambiguous**, fall back to the spec (`SPACE_HUD_PLAN.md`).  
   - Never improvise tools or architecture not listed in the spec.  
   - New tools/components must be proposed via an ADR in `/docs/adrs/`.  

---

## Workflow Reminder

- Code changes must always:  
  - Use **tokens.css** for all design values.  
  - Use **Tailwind for layout**, **Panda CSS for shells**, **Radix/shadcn for behavior + structure**, **Augmented-UI for chrome**.  
  - Pass Playwright accessibility + motion compliance tests.  

---

With this setup:  
- Humans keep `SPACE_HUD_PLAN.md` stable as the north star.  
- Bots and contributors iterate on `TASKS.md` for execution.  



<!-- Dungeon World Spec Link -->
## Game Rules Spec
- See **DUNGEON_WORLD_SPEC.md** for the app-specific Dungeon World mechanics (rolls, XP, bonds, debilities, EoS).  
- CursorAI must read this file alongside **SPACE_HUD_PLAN.md** and **TASKS.md** before implementing rules or UI touching DW mechanics.
