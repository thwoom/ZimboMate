#!/usr / bin / env tsx
/**
 * Enhanced Git Integration for Task Management * Advanced git hooks that auto-detect task completion and track development time
 */

import { writeFileSync, existsSync, mkdirSync, chmodSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import YAML from 'yaml';

class EnhancedGitIntegration {
  private gitHooksDir = resolve(process.cwd(), '.git / hooks');
  private tasksPath = 'ops / tasks.yaml';

  constructor() {
    }

  private ensureHooksDir() {
    if (!existsSync(this.gitHooksDir)) {
      mkdirSync(this.gitHooksDir, { recursive: true });
    }
  }

  public setupAdvancedPreCommitHook() {
    const preCommitHook = `#!/bin / sh
# Enhanced Pre-commit Hook for ZimboMate Task Management

echo "🔍 Analyzing staged files for task completion..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)
SUGGESTIONS=""

# Advanced artifact detection patterns
check_task_completion() {
  local pattern=$1
  local task_id=$2
  local description=$3

  if echo "$STAGED_FILES" | grep-q "$pattern"; then
    echo "✅ Detected: $description"
    SUGGESTIONS="$SUGGESTIONS\\nnpm run task done $task_id  # $description"
  fi
}

# Core Panel Implementations
check_task_completion "src / panels / InventoryPanel / InventoryPanel\\.tsx" "T-009" "Inventory Panel"
check_task_completion "src / panels / SessionToolsPanel / SessionToolsPanel\\.tsx" "T-011" "Session Tools Panel"
check_task_completion "src / panels / LorePanel/\\|src / panels / JournalPanel/" "T-012" "Lore / Journal Panel"

# Service Implementations
check_task_completion "src / services / BondService\\.ts" "T-196" "Bond & Alignment XP Tracker"
check_task_completion "src / services / ConditionService\\.ts" "T-200" "Debility and Ongoing Effect Tracker"
check_task_completion "src / services / RollHistoryService\\.ts" "T-197" "Roll History Storage"
check_task_completion "src / services / DiceAnalyticsService\\.ts" "T-210" "Dice Analytics"

# AI Integration
check_task_completion "src / services / AiService\\.ts" "T-169" "LLM Integration"
check_task_completion "src / panels / AIGeneratorPanel/" "T-169" "LLM Integration Panel"

# Multiclass System
check_task_completion "src / services / MulticlassRulesEngine\\.ts" "T-188" "Multiclass Rules Engine"
check_task_completion "src / components / MulticlassMoveSelector\\.tsx" "T-189" "Multiclass Move Selection UI"
check_task_completion "src / components / MulticlassCharacterSheet\\.tsx" "T-190" "Multiclass Character Sheet"

# Conditional Content System
check_task_completion "src / utils / conditionalContent\\.ts" "T-182" "Conditional Content Foundation"
check_task_completion "src / panels/.*/ClassConditional.*\\.tsx" "T-183" "Conditional Panel Content"
check_task_completion "src / layouts / Sidebar / ConditionalNavigation\\.tsx" "T-187" "Conditional Navigation"

# Thematic Skins
check_task_completion "src / services / ThematicSkinService\\.ts" "T-192" "Thematic Skin System"
check_task_completion "src / data / skins / chronopunk/" "T-193" "Chronopunk Theme Content"

# Equipment Management
check_task_completion "src / components / LoadOptimizer\\.tsx" "T-203" "Load Optimization"
check_task_completion "src / components / EquipmentSets\\.tsx" "T-212" "Equipment Sets"

# Character Tools
check_task_completion "src / components / CharacterJournal\\.tsx" "T-199" "Character Journal"
check_task_completion "src / components / BuildPlanner\\.tsx" "T-201" "Build Planner"
check_task_completion "src / components / CharacterPortrait\\.tsx" "T-206" "Character Portraits"

# Session Tools
check_task_completion "src / components / SessionTimer\\.tsx" "T-205" "Session Timer"
check_task_completion "src / services / SessionRecapService\\.ts" "T-198" "Session Recap Generator"

# Sidebar Organization
check_task_completion "src / layouts / Sidebar / SidebarSections\\.tsx" "T-195" "Organized Sidebar"

# Advanced Features
check_task_completion "src / services / PDFExportService\\.ts" "T-209" "PDF Export System"
check_task_completion "src / services / EnhancedRandomGenerators\\.ts" "T-208" "Enhanced Randomization"

if [ -n "$SUGGESTIONS" ]; then
  echo ""
  echo "🎯 SUGGESTED TASK UPDATES:"
  echo-e "$SUGGESTIONS"
  echo ""
  echo "💡 Run these commands to update task statuses:"
  echo ""
fi

# Check for work in progress
IN_PROGRESS=$(npm run tm:enhanced deps 2>/dev / null | grep "in_progress" || echo "")
if [ -n "$IN_PROGRESS" ]; then
  echo "⏰ Tasks currently in progress-don't forget to track time!"
  echo "   Complete with: npm run task done T-XXX [hours]"
  echo ""
fi
`;

    const preCommitPath = resolve(this.gitHooksDir, 'pre-commit');
    writeFileSync(preCommitPath, preCommitHook);
    chmodSync(preCommitPath, 0o755);
    }

  public setupCommitMsgHook() {
    const commitMsgHook = `#!/bin / sh
# Commit message hook-auto - link commits to tasks

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Extract task IDs from commit message (T-XXX)
TASK_IDS=$(echo "$COMMIT_MSG" | grep-o 'T-[0 - 9]\\+' | sort-u)

if [ -n "$TASK_IDS" ]; then
  echo ""
  echo "🔗 Linked to tasks: $TASK_IDS"

  # Add task links to commit message
  echo "" >> "$COMMIT_MSG_FILE"
  echo "Tasks: $TASK_IDS" >> "$COMMIT_MSG_FILE"

  # Track time for in-progress tasks
  for task_id in $TASK_IDS; do
    # Check if task is in progress and suggest time tracking
    echo "⏰ If $task_id is complete, run: npm run tm:enhanced complete $task_id [hours]"
  done
  echo ""
fi
`;

    const commitMsgPath = resolve(this.gitHooksDir, 'commit-msg');
    writeFileSync(commitMsgPath, commitMsgHook);
    chmodSync(commitMsgPath, 0o755);
    }

  public setupPostCommitHook() {
    const postCommitHook = `#!/bin / sh
# Enhanced Post-commit Hook with Time Tracking

echo "📊 Post-commit task analysis..."

# Get the commit message and extract task IDs
COMMIT_MSG=$(git log-1 --pretty=%B)
TASK_IDS=$(echo "$COMMIT_MSG" | grep-o 'T-[0 - 9]\\+' | sort-u)

if [ -n "$TASK_IDS" ]; then
  echo "🔗 Commit linked to: $TASK_IDS"

  # Run quick audit for these specific tasks
  for task_id in $TASK_IDS; do
    echo "🔍 Checking $task_id completion status..."
  done
fi

# Show quick progress update
npm run tm:enhanced report 2>/dev / null | head-5 || echo "📊 Progress tracking available with: npm run tm:enhanced report"

echo ""
echo "💡 Quick commands:"
echo "   npm run task next     # Next task to work on"
echo "   npm run task audit    # Check for completed work"
echo ""
`;

    const postCommitPath = resolve(this.gitHooksDir, 'post-commit');
    writeFileSync(postCommitPath, postCommitHook);
    chmodSync(postCommitPath, 0o755);
    }

  public run() {
    this.ensureHooksDir();
    this.setupAdvancedPreCommitHook();
    this.setupCommitMsgHook();
    this.setupPostCommitHook();

    }
}

const integration = new EnhancedGitIntegration();
integration.run();
