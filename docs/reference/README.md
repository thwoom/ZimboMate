# ZimboMate V2 Documentation

Welcome to the home for ZimboMate V2 docs. Everything here reflects the current 2025-10 build.

## 📚 Quick Navigation

### 🚀 Getting Started
- **[Quick Start Guide](./QUICK_START.md)** – set up a table in minutes
- **[User Guide](./USER_GUIDE.md)** – full feature documentation
- **[Keyboard Shortcuts](./KEYBOARD_SHORTCUTS.md)** – real bindings for power users

### 🛠️ Support & Release Notes
- **[Troubleshooting](./TROUBLESHOOTING.md)** – common fixes
- **[Level-Up Roadmap](./level-up-roadmap.md)** – advancement implementation status
- **[Launch Plan](./launch-plan.md)** – current release sequencing

### 🧑‍💻 Engineering
- **[Developer Guide](./DEVELOPER_GUIDE.md)** – architecture, tooling, workflow
- **[Rollout Checklist](../operations/rollout.md)** – deployment gate references
- **[Campaign Modal Plan](../olddocs/campaign-modals-plan.md)** – _legacy reference (completed)_

### 🎨 Product & Design
- **[Feature Catalog](../product/zimbo-v2-feature-catalog.md)** – current surface areas with status
- **[Visual Improvements Summary](../product/VISUAL_IMPROVEMENTS_SUMMARY.md)** – latest UI polish pass
- **[DW Assistant App](../product/DW_ASSISTANT_APP.md)** – narrative goals and scope

### 🧭 Operations & Quality
- **[Release Checklist](../operations/release-checklist.md)** – go-live owners and sign-offs
- **[Rollout Playbook](../operations/rollout.md)** – staged flag transitions, comms, telemetry
- **[Testing Playbook](../operations/testing-playbook.md)** – QA responsibilities & tooling
- **[Dark Launch Smoke Test](../smoke-tests/dark-launch-smoke-test.md)** – template for guardrail validation
- **[Campaign Bug Summary](../operations/bug-reports/CAMPAIGN_BUG_SUMMARY.md)** – reference investigation notes
- **[Playthrough Test Results](../operations/PLAYTHROUGH_TEST_RESULTS.md)** – scenario coverage archive

### 🤖 Agent & AI Enablement
- **[Agent Overview](../operations/agents/AGENTS.md)** – coordination between assistants
- **[Claude Guide](../operations/agents/CLAUDE.md)** – Claude-specific operating instructions

---

## 🐉 What is ZimboMate V2?

ZimboMate V2 is a Dungeon World companion that combines character management, 3D dice, moves lookup, campaign tooling, and Chronicle assistant features.

### Core Capabilities
- Character sheets with XP, bonds, debilities, load, and advancement wizard
- 3D physics dice roller with keyboard shortcuts and shared sessions
- Complete SRD move catalogue with context-aware suggestions
- Inventory management with encumbrance tracking
- Session tools (notes, timers, trackers, roll history)
- Campaign hub (journal, NPCs, locations, sessions)
- Chronicle assistant overlay and command palette
- Keyboard-first workflow & accessibility options

### Level-Up Wizard Highlights
- Spend XP through the **Session Flow → Award XP** modal, then launch the wizard from the XP progress tracker or the context assistant.
- Guided steps walk players through _Overview → Stat → Move → Spells → Review_, enforcing stat caps, move prerequisites, and spell quotas along the way.
- Newly unlocked moves surface on the character sheet's **Stats & Basic Moves** page; added spells appear in the **Spells & Hold** tab.
- Playwright coverage (`tests/e2e/level-up-wizard.spec.ts`) automates martial and caster flows—refresh visual baselines with `npm run screenshot` whenever the layout changes.

---

## 🔍 Document Status Legend
- ✅ **Current** – kept in sync with the latest build
- 📝 **In progress** – actively being updated as features land
- 🕰️ **Legacy** – archived for historical reference (lives in `docs/olddocs/`)

Use this README to understand where to look first; if you archive or add docs, update the lists above.

---

_Last updated: 17 Oct 2025_
