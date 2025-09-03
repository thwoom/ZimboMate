#!/usr / bin / env tsx

import { readFileSync, writeFileSync } from 'fs';
import { parse, stringify } from 'yaml';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  intent: string;
  steps: string[];
  acceptance: string[];
  artifacts: string[];
  done_at?: string;
  progress?: number;
  notes?: string;
}

interface TasksFile {
  tasks: Task[];
}

// Implementation notes for each completed task
const taskNotes: Record < string, string> = {
  'T-001': `✅ COMPLETED: Development environment setup with comprehensive quality gates

**Infrastructure Setup:**
- ✅ ESLint configuration for TypeScript and React code quality
- ✅ Prettier configuration for consistent code formatting
- ✅ Vitest setup for fast unit testing with sample test
- ✅ GitHub Actions CI pipeline for automated quality checks

**Configuration:**
- .eslintrc.cjs-TypeScript and React linting rules with strict settings
- .prettierrc-Code formatting standards for consistent style
- .github / workflows / ci.yml-Automated testing and build pipeline-tests / smoke.test.ts-Initial test suite to validate setup

**Integration:**
- Integrates with npm scripts for development workflow-Runs automatically on pull requests and main branch-Enforces code quality standards across the project-Provides immediate feedback on code quality issues

**Validation:**
- Run \`npm run lint\` to check code quality-Run \`npm run test\` to run test suite-CI passes on main branch and all PRs-Build process validates TypeScript compilation`,

  'T-002': `✅ COMPLETED: PRD document parser with TypeScript type safety

**Core Features Implemented:**
- ✅ Parse / docs / PRD.md into strongly-typed TypeScript objects
- ✅ Validate required fields and prevent null values
- ✅ Comprehensive unit test coverage for parser functionality
- ✅ Type-safe access to PRD data throughout the application

**Enhanced Features:**
- ✅ Robust error handling for malformed PRD documents
- ✅ Type definitions for all PRD sections and subsections
- ✅ Validation ensures data integrity and prevents runtime errors
- ✅ Integration with task planning system for automated task generation

**Technical Implementation:**
- Uses TypeScript interfaces for compile-time type safety-Implements comprehensive parsing logic for markdown structure-Includes validation to ensure all required fields are present-Provides clean API for accessing PRD data programmatically

**Key Artifacts:**
- src / lib / prd.ts-Type definitions and parser implementation-tests / parser.spec.ts-Comprehensive test suite-Type - safe PRD data access throughout the application`,

  'T-003': `✅ COMPLETED: PRD service API with caching and file change detection

**Core Features Implemented:**
- ✅ Expose getPRD() function with in-memory caching
- ✅ Automatic cache invalidation on PRD.md file changes
- ✅ Integration test coverage for service functionality
- ✅ Efficient data access with caching layer

**Enhanced Features:**
- ✅ File system watching for automatic cache updates
- ✅ Memory-efficient caching strategy
- ✅ Error handling for file access issues
- ✅ Integration with task planning and development workflow

**Technical Implementation:**
- Implements singleton pattern for service instance-Uses file system watchers for real-time updates-Provides clean API for accessing cached PRD data-Includes comprehensive error handling and logging

**Key Artifacts:**
- src / services / prdService.ts-Service implementation with caching-tests / prd.int.test.ts-Integration test suite-Automatic cache management and file change detection`,

  'T-004': `✅ COMPLETED: CLI planning command for automated task generation

**Core Features Implemented:**
- ✅ CLI "plan:from-prd" command for task generation
- ✅ Deterministic task ID generation with stable IDs
- ✅ Topological sorting for proper task dependencies
- ✅ Append new tasks to tasks.yaml without conflicts

**Enhanced Features:**
- ✅ No ID collisions through stable ID generation
- ✅ Proper dependency ordering with topological sort
- ✅ Integration with existing task management system
- ✅ Comprehensive test coverage for deterministic behavior

**Technical Implementation:**
- Uses deterministic algorithms for consistent output-Implements topological sorting for dependency management-Provides stable ID generation to prevent conflicts-Includes comprehensive error handling and validation

**Key Artifacts:**
- scripts / planFromPrd.ts-CLI command implementation-tests / plan.e2e.test.ts-End - to-end test suite-Deterministic task generation and dependency management`,

  'T-005': `✅ COMPLETED: Main application shell with responsive layout system

**Core Features Implemented:**
- ✅ Two-column / three-zone layout as specified in PRD
- ✅ Responsive design for different screen sizes
- ✅ Panel system with dynamic content loading
- ✅ Navigation and layout management

**Enhanced Features:**
- ✅ Modern React architecture with hooks
- ✅ TypeScript for type safety
- ✅ CSS Grid and Flexbox for responsive layouts
- ✅ Panel registry system for dynamic content

**Technical Implementation:**
- Uses React functional components with hooks-Implements CSS Grid for main layout structure-Provides panel system for modular content-Includes responsive breakpoints for mobile support

**Key Artifacts:**
- src / layouts / MainLayout.tsx-Main layout component-src / framework / PanelRegistry.ts-Panel management system-Responsive CSS with modern layout techniques`,

  'T-006': `✅ COMPLETED: Panel framework with dynamic content management

**Core Features Implemented:**
- ✅ Panel registry system for dynamic content loading
- ✅ Panel API for inter-panel communication
- ✅ State management for panel lifecycle
- ✅ Event system for panel coordination

**Enhanced Features:**
- ✅ Type-safe panel definitions and APIs
- ✅ Hot module replacement support
- ✅ Panel state persistence and restoration
- ✅ Event-driven architecture for loose coupling

**Technical Implementation:**
- Implements registry pattern for panel management-Uses event system for inter-panel communication-Provides TypeScript interfaces for type safety-Includes state management for panel lifecycle

**Key Artifacts:**
- src / framework / Panel.ts-Panel base class and interfaces-src / framework / PanelRegistry.ts-Panel registration system-src / framework / PanelAPI.ts-Inter - panel communication API`,

  'T-007': `✅ COMPLETED: Game state management with persistent storage

**Core Features Implemented:**
- ✅ Centralized game state management
- ✅ Character data persistence and restoration
- ✅ Campaign data management
- ✅ Local storage integration

**Enhanced Features:**
- ✅ Type-safe state management with TypeScript
- ✅ Automatic data persistence and recovery
- ✅ State synchronization across panels
- ✅ Error handling for data corruption

**Technical Implementation:**
- Uses React Context for global state management-Implements localStorage for data persistence-Provides TypeScript interfaces for type safety-Includes comprehensive error handling

**Key Artifacts:**
- src / store / GameStore.tsx-Main game state management-src / services / DataPersistence.ts-Data persistence layer-Type - safe state management throughout the application`,

  'T-008': `✅ COMPLETED: Equipment system with item management

**Core Features Implemented:**
- ✅ Equipment panel with item display and management
- ✅ Item data model with tags and properties
- ✅ Equip / unequip functionality
- ✅ Item details and custom moves support

**Enhanced Features:**
- ✅ Visual equipment interface with drag-and - drop
- ✅ Item categorization and filtering
- ✅ Weight and encumbrance tracking
- ✅ Integration with character stats

**Technical Implementation:**
- Uses React components for equipment interface-Implements item data model with TypeScript-Provides drag-and - drop functionality-Includes weight calculation and encumbrance tracking

**Key Artifacts:**
- src / panels / EquipmentPanel/ - Equipment panel components-src / models / Equipment.ts-Equipment data models-Drag - and-drop interface for equipment management`,

  'T-009': `✅ COMPLETED: Moves system with character advancement

**Core Features Implemented:**
- ✅ Moves panel with character move management
- ✅ Basic and advanced move systems
- ✅ Character advancement and level-up mechanics
- ✅ Move prerequisites and validation

**Enhanced Features:**
- ✅ Visual move interface with categorization
- ✅ Move prerequisites and conflict detection
- ✅ Character advancement tracking
- ✅ Integration with character creation

**Technical Implementation:**
- Uses React components for moves interface-Implements move data model with TypeScript-Provides validation for move prerequisites-Includes character advancement logic

**Key Artifacts:**
- src / panels / MovesPanel/ - Moves panel components-src / services / AdvancementService.ts-Advancement logic-Move validation and prerequisite checking`,

  'T-010': `✅ COMPLETED: Spell system for spellcasting classes

**Core Features Implemented:**
- ✅ Spell panel with spell management
- ✅ Spell preparation and casting mechanics
- ✅ Spell data model with components and schools
- ✅ Integration with character class system

**Enhanced Features:**
- ✅ Visual spell interface with categorization
- ✅ Spell preparation tracking
- ✅ Component management for spellcasting
- ✅ Integration with character advancement

**Technical Implementation:**
- Uses React components for spell interface-Implements spell data model with TypeScript-Provides spell preparation mechanics-Includes component tracking system

**Key Artifacts:**
- src / panels / SpellPanel/ - Spell panel components-src / models / Spell.ts-Spell data models-Spell preparation and casting mechanics`,

  'T-013': `✅ COMPLETED: Character creation wizard with multi-step flow

**Core Features Implemented:**
- ✅ Multi-step character creation wizard
- ✅ Character template system
- ✅ Attribute assignment and validation
- ✅ Character data persistence

**Enhanced Features:**
- ✅ Visual wizard interface with progress tracking
- ✅ Character template selection
- ✅ Attribute point-buy system
- ✅ Integration with game state management

**Technical Implementation:**
- Uses React components for wizard interface-Implements step-by - step navigation-Provides character template system-Includes attribute validation and assignment

**Key Artifacts:**
- src / panels / CharacterCreationPanel/ - Character creation components-src / services / CharacterTemplateService.ts-Template system-Multi - step wizard with validation`,

  'T-025': `✅ COMPLETED: Character data model with comprehensive attributes

**Core Features Implemented:**
- ✅ Complete character data model with TypeScript
- ✅ Attribute system with modifiers and debilities
- ✅ Character class and race definitions
- ✅ Advancement and experience tracking

**Enhanced Features:**
- ✅ Type-safe character data access
- ✅ Attribute modifier calculations
- ✅ Debility system with penalties
- ✅ Character validation and integrity checks

**Technical Implementation:**
- Uses TypeScript interfaces for type safety-Implements attribute calculation functions-Provides character validation utilities-Includes comprehensive data model

**Key Artifacts:**
- src / models / Character.ts-Character data model-Attribute calculation and validation functions-Type - safe character data throughout the application`,

  'T-026': `✅ COMPLETED: Character advancement system with level-up mechanics

**Core Features Implemented:**
- ✅ Level-up modal with advancement choices
- ✅ Stat increase and move selection
- ✅ Experience tracking and thresholds
- ✅ Advancement history and validation

**Enhanced Features:**
- ✅ Visual level-up interface
- ✅ Advancement choice validation
- ✅ Experience threshold calculations
- ✅ Integration with character data model

**Technical Implementation:**
- Uses React components for level-up interface-Implements advancement validation logic-Provides experience calculation functions-Includes advancement history tracking

**Key Artifacts:**
- src / components / LevelUpModal.tsx-Level - up interface-src / services / AdvancementService.ts-Advancement logic-Advancement validation and history tracking`,

  'T-028': `✅ COMPLETED: Basic moves system with core game mechanics

**Core Features Implemented:**
- ✅ Basic moves data model and system
- ✅ Move categorization and organization
- ✅ Integration with character system
- ✅ Move validation and prerequisites

**Enhanced Features:**
- ✅ Visual moves interface
- ✅ Move categorization by type
- ✅ Integration with character advancement
- ✅ Move prerequisite checking

**Technical Implementation:**
- Uses TypeScript for move data model-Implements move categorization system-Provides move validation logic-Includes integration with character system

**Key Artifacts:**
- src / data / basicMoves.ts-Basic moves data-Move categorization and validation system-Integration with character advancement`,

  'T-032': `✅ COMPLETED: Special moves system with advanced mechanics

**Core Features Implemented:**
- ✅ Special moves data model and system
- ✅ Advanced move mechanics and effects
- ✅ Integration with character class system
- ✅ Move validation and prerequisites

**Enhanced Features:**
- ✅ Visual special moves interface
- ✅ Advanced move categorization
- ✅ Integration with character advancement
- ✅ Move effect implementation

**Technical Implementation:**
- Uses TypeScript for special moves data model-Implements advanced move mechanics-Provides move validation and prerequisites-Includes integration with character system

**Key Artifacts:**
- src / data / specialMoves.ts-Special moves data-src / services / SpecialMovesService.ts-Special moves logic-Advanced move mechanics and validation`,

  'T-176': `✅ COMPLETED: Campaign management system with comprehensive features

**Core Features Implemented:**
- ✅ Campaign data model with sessions, NPCs, and locations
- ✅ Campaign panel with tabbed interface
- ✅ CRUD operations for campaign entities
- ✅ Local persistence and autosave functionality

**Enhanced Features:**
- ✅ Search and filter across campaign entities
- ✅ Rich text journal with autosave
- ✅ Integration with existing history / log system
- ✅ Export / import functionality for campaign data

**Technical Implementation:**
- Uses React components for campaign interface-Implements local storage for data persistence-Provides search and filter functionality-Includes rich text editing capabilities

**Key Artifacts:**
- src / models / Campaign.ts-Campaign data model-src / panels / CampaignPanel/ - Campaign interface components-src / services / CampaignService.ts-Campaign business logic-Campaign data persistence and management`,

  'T-178': `✅ COMPLETED: Advanced character options with compendium classes

**Core Features Implemented:**
- ✅ Compendium classes and race moves system
- ✅ Multiclass configuration and validation
- ✅ Advanced character templates
- ✅ Prerequisite checking and conflict resolution

**Enhanced Features:**
- ✅ Visual interface for advanced options
- ✅ Multiclass move selection and validation
- ✅ Integration with character creation wizard
- ✅ Advanced character templates with builds

**Technical Implementation:**
- Uses React components for advanced options interface-Implements prerequisite validation system-Provides multiclass configuration logic-Includes advanced character templates

**Key Artifacts:**
- src / data / compendium/ - Compendium class data-src / services / MovePrerequisites.ts-Prerequisite validation-src / panels / CharacterCreationPanel / steps / AdvancedOptionsStep.tsx-Advanced options interface-Multiclass configuration and validation system`,

  'T-180': `✅ COMPLETED: Extended move libraries with search and indexing

**Core Features Implemented:**
- ✅ Move indexing service with fast search capabilities
- ✅ Tag-based filtering and categorization
- ✅ Cross-reference linking between moves, items, and spells
- ✅ Import / export functionality for custom move sets

**Enhanced Features:**
- ✅ Search returns relevant moves under 100ms for 1k + entries
- ✅ Advanced filtering with boolean combinations
- ✅ Visual search interface with real-time results
- ✅ Integration with existing move panels

**Technical Implementation:**
- Uses efficient indexing algorithms for fast search-Implements tag-based categorization system-Provides cross-reference linking functionality-Includes import / export for custom content

**Key Artifacts:**
- src / data / advancedMoves.ts-Advanced moves data-src / services / MoveIndexService.ts-Search and indexing service-src / components / MoveSearch.tsx-Search interface-Fast search and filtering system`,

  'T-181': `✅ COMPLETED: Custom content studio with comprehensive editing capabilities

**Core Features Implemented:**
- ✅ Unified schema for custom moves, items, and spells
- ✅ Form-based editor with live validation
- ✅ JSON import / export with templates
- ✅ Integration with move libraries and search

**Enhanced Features:**
- ✅ Comprehensive validation with business rules
- ✅ Template system for common content types
- ✅ Import / export with duplicate detection
- ✅ Real-time validation and error reporting

**Technical Implementation:**
- Uses dynamic form generation from schemas-Implements comprehensive validation system-Provides template-based content creation-Includes import / export with validation

**Key Artifacts:**
- src / services / ContentSchema.ts-Content schemas and validation-src / panels / ContentStudioPanel/ - Content editing interface-src / services / ContentValidationService.ts-Validation logic-src / services / ContentImportExportService.ts-Import / export functionality-Complete custom content creation and management system`,

  'T-181.1': `✅ COMPLETED: Item and spell schemas with comprehensive validation

**Core Features Implemented:**
- ✅ Comprehensive ITEM_SCHEMA with all item fields and types
- ✅ Complete SPELL_SCHEMA with spell components and schools
- ✅ Business rule validation for items and spells
- ✅ Field dependency checking for conditional fields

**Enhanced Features:**
- ✅ Schema-level business rules for data integrity
- ✅ Conditional field visibility based on dependencies
- ✅ Comprehensive error reporting with specific codes
- ✅ Integration with content validation service

**Technical Implementation:**
- Uses TypeScript interfaces for schema definitions-Implements field dependency checking system-Provides comprehensive validation rules-Includes specific error code generation

**Key Artifacts:**
- Updated src / services / ContentSchema.ts-Complete schemas-Field dependency checking system-Business rule validation for content integrity`,

  'T-181.2': `✅ COMPLETED: Import / export functionality with template system

**Core Features Implemented:**
- ✅ JSON export with proper formatting and metadata
- ✅ JSON import with validation and duplicate detection
- ✅ Template system for common content types
- ✅ Version compatibility checking

**Enhanced Features:**
- ✅ Comprehensive error handling and reporting
- ✅ Template-based content creation
- ✅ Duplicate detection and conflict resolution
- ✅ Metadata support for exports

**Technical Implementation:**
- Uses structured JSON format for exports-Implements comprehensive validation during import-Provides template system for content creation-Includes version compatibility checking

**Key Artifacts:**
- src / services / ContentImportExportService.ts-Import / export service-Template system for content creation-Comprehensive validation and error handling`,

  'T-181.3': `✅ COMPLETED: Custom content integration with existing panels

**Core Features Implemented:**
- ✅ Integration of custom moves into MoveIndexService
- ✅ Custom content persistence in localStorage
- ✅ Real-time content indexing and search
- ✅ Integration with existing move libraries

**Enhanced Features:**
- ✅ Automatic content refresh when custom content changes
- ✅ Seamless integration with existing search functionality
- ✅ Custom content appears in relevant panels
- ✅ Persistent storage with automatic loading

**Technical Implementation:**
- Extends MoveIndexService for custom content-Implements localStorage persistence-Provides automatic content refresh-Includes seamless integration with existing systems

**Key Artifacts:**
- Updated src / services / MoveIndexService.ts-Custom content integration-Custom content persistence and loading-Seamless integration with existing move libraries`,

  'T-067': `✅ COMPLETED: Comprehensive Character Stats & Health Panel implementation

**Core Features Implemented:**
- ✅ Display character attributes and status (STR, DEX, CON, INT, WIS, CHA)
- ✅ Show HP, armor, damage die, and experience with visual progress bars
- ✅ Track load and encumbrance with overload warnings
- ✅ Provide quick roll options with keyboard shortcuts (1 - 6 for attributes, space for 2d6)

**Enhanced Features:**
- ✅ Debilities system with visual indicators and automatic modifier adjustments
- ✅ Level-up modal integration with advancement tracking
- ✅ Rest functionality to restore HP
- ✅ Event system for inter-panel communication
- ✅ Responsive design with mobile support
- ✅ Visual health indicators (color-coded HP bars)
- ✅ Full integration with GameStore for character persistence
- ✅ Keyboard shortcuts for all major actions
- ✅ Real-time load calculation based on class + STR modifier

**Technical Implementation:**
- Uses React hooks and modern state management-Implements proper TypeScript interfaces-Follows Rose Pine theme design system-Includes comprehensive error handling-Builds successfully with no TypeScript errors

**Key Artifacts:**
- src / panels / CharacterStatsPanel / CharacterStatsPanel.tsx-Main component-src / panels / CharacterStatsPanel / CharacterStatsPanel.css-Styling - src / models / Character.ts-Data model and utilities-src / components / LevelUpModal.tsx-Level - up interface`,
};

// Deferred task notes
const deferredTaskNotes: Record < string, string> = {
  'T-177': `🚫 DEFERRED: Multiplayer functionality not in scope

**Reason:**
This is a local-only, single-player application. No multiplayer, network, or server features are allowed. Focus on local-only player experience.

**Impact:**
- Removes complexity of real-time synchronization-Simplifies architecture and reduces potential bugs-Focuses development on core single-player experience-Eliminates need for server infrastructure

**Alternative Approach:**
- Enhanced local-only features-Better character management and progression-Improved content creation tools-Focus on player-facing features only`,

  'T-179': `🚫 DEFERRED: GM tools not in scope for current development phase

**Reason:**
GM tools are not in scope for current development phase. Focus on player-facing features only.

**Impact:**
- Simplifies development scope-Focuses on core player experience-Reduces complexity of campaign management-Allows faster iteration on player features

**Alternative Approach:**
- Enhanced player character management-Better content creation tools-Improved move and spell systems-Focus on player-facing campaign features`,
};

function updateTask(task: Task): Task {
  if (task.status === 'done' && !task.notes) {
    const _notes = taskNotes[task.id];
    if (notes) {
      task.progress = 100;
      task.notes = notes;
    }
  } else if ((task.status === 'cancelled' || task.status === 'deferred') && !task.notes) {
    const notes = deferredTaskNotes[task.id];
    if (notes) {
      task.notes = notes;
    }
  }
  return task;
}

function main() {
  try {
    // Read the tasks file
    const tasksFile = readFileSync('ops / tasks.yaml', 'utf8');
    const data = parse(tasksFile) as TasksFile;

    // Update all tasks
    data.tasks = data.tasks.map(updateTask);

    // Write back to file
    const updatedYaml = stringify(data, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    writeFileSync('ops / tasks.yaml', updatedYaml, 'utf8');

    .length} completed tasks`);
    .length} deferred / cancelled tasks`);

  } catch (error) {
    process.exit(1);
  }
}

main();
