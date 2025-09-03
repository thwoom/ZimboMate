# Development Rules and Scope Guidelines

## Core Principle: Local-Only, Player-First Development

This project focuses exclusively on **local-only, single-player features** for Dungeon World character management. This is a **desktop application** that runs entirely on the user's local machine with no network connectivity required.

**Key Constraints:**
- **Local-only**: No server, no cloud, no network dependencies
- **Single-player**: No multiplayer, no real-time sync, no shared sessions
- **Player-focused**: No GM/Dungeon Master tools
- **Offline-capable**: Works completely offline

## ✅ IN SCOPE (Player Features)

### Character Management
- Character creation and advancement
- Character stats and health tracking
- Equipment and inventory management
- Spell preparation and casting (for spellcasters)
- Special moves (Level Up, End of Session, Make Camp, Last Breath)
- Tags and uses system for items

### Gameplay Support
- Dice rolling and move resolution
- Session tools (notes, timers, roll logs)
- Campaign management (player perspective only)
- Custom content creation (moves, items, spells)
- Move libraries and search

### Technical Features
- **Local data storage** (localStorage, IndexedDB, or file system)
- **Export/import** (JSON, CSV, or other local file formats)
- **Performance optimization** for local processing
- **Accessibility improvements**
- **Testing and validation**
- **Offline functionality** (no network dependencies)

## ❌ OUT OF SCOPE (GM/DM Features)

### Explicitly Forbidden
- **GM Tools and Fronts** - Any GM-specific utilities
- **Multiplayer/Real-time sync** - Could enable GM functionality
- **GM-specific panels or interfaces**
- **Fronts, Grim Portents, Impending Doom tracking**
- **GM clocks, counters, or trackers**
- **GM session management tools**
- **GM character management tools**
- **GM campaign management features**

### Network/Server Features (Explicitly Forbidden)
- **Multiplayer functionality** - No real-time sync, no shared sessions
- **Server-side features** - No cloud storage, no remote APIs
- **Network connectivity** - No online features, no web services
- **Real-time collaboration** - No shared editing, no presence indicators
- **Cloud synchronization** - No remote data storage or backup
- **Online authentication** - No user accounts, no login systems
- **WebSocket connections** - No real-time communication
- **API integrations** - No external service dependencies

### Rationale
1. **Scope Focus**: The project aims to be a local-only player character sheet and management tool
2. **Simplicity**: Local-only apps are simpler to develop, deploy, and maintain
3. **Privacy**: No data leaves the user's machine
4. **Reliability**: Works offline, no network dependencies
5. **Performance**: No network latency, faster local processing
6. **Complexity Management**: Avoiding multiplayer/GM tools reduces development complexity
7. **User Experience**: Focused, single-purpose tool with no distractions

## Development Guidelines

### Task Prioritization
1. **P1**: Core local-only player character management features
2. **P2**: Enhanced local-only player features and quality-of-life improvements
3. **P3**: Local-only polish and optimization
4. **P5**: Deferred features (GM tools, multiplayer, network features, etc.)

### Code Review Checklist
- [ ] Does this feature serve player needs?
- [ ] Is this a player-facing feature?
- [ ] Does this avoid GM/DM functionality?
- [ ] Is this consistent with single-player focus?
- [ ] Is this local-only (no network dependencies)?
- [ ] Does this work offline?
- [ ] Is this a desktop application feature?
- [ ] Does this avoid any server/cloud functionality?

### When in Doubt
If a feature could be interpreted as GM/DM functionality OR requires network connectivity:
1. **Defer it** - Move to P5 priority
2. **Document it** - Add notes explaining why it's deferred
3. **Focus on local player needs** - Redirect effort to local-only player features
4. **Question network dependencies** - Ensure everything works offline

## Enforcement

- All new tasks must be reviewed against these guidelines
- GM/DM features will be automatically deferred to P5
- **Multiplayer/network features will be automatically deferred to P5**
- Code reviews must include scope compliance checks
- Documentation must clearly distinguish player vs GM features
- **All features must be tested for offline functionality**
- **No network dependencies allowed in any feature**

---

**Last Updated**: 2025-01-05
**Status**: Active and Enforced
