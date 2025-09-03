#!/usr / bin / env tsx
/**
 * Workflow Automation Setup * Sets up git hooks and workflow integration for automatic task status updates
 */

import { writeFileSync, existsSync, mkdirSync, chmodSync } from 'fs';
import { resolve } from 'path';

class WorkflowAutomationSetup {
  private gitHooksDir = resolve(process.cwd(), '.git / hooks');

  public setupGitHooks() {
    // Ensure hooks directory exists
    if (!existsSync(this.gitHooksDir)) {
      mkdirSync(this.gitHooksDir, { recursive: true });
    }

    this.createPreCommitHook();
    this.createPostCommitHook();

    }

  private createPreCommitHook() {
    const preCommitHook = `#!/bin / sh
# Pre-commit hook for ZimboMate task status automation

echo "🔍 Checking for completed tasks based on staged files..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Function to suggest task completion
suggest_task_complete() {
  local task_id=$1
  local reason=$2
  echo "✅ Task $task_id appears complete: $reason"
  echo "   Run: npm run tm:move -- --id $task_id --status done"
}

# Check for specific implementations
echo "$STAGED_FILES" | while read file; do
  case "$file" in
    "src / panels / MovesPanel / MovesPanel.tsx")
      suggest_task_complete "T-010" "MovesPanel implementation"
      ;;
    "src / services / DiceRollingService.ts")
      suggest_task_complete "T-028" "Dice rolling system"
      ;;
    "src / panels / InventoryPanel / InventoryPanel.tsx")
      suggest_task_complete "T-009" "Inventory panel implementation"
      ;;
    "src / panels / SessionToolsPanel / SessionToolsPanel.tsx")
      suggest_task_complete "T-011" "Session tools panel"
      ;;
    "src / components / BondTracker.tsx")
      suggest_task_complete "T-196" "Bond tracking system"
      ;;
    "src / services / MulticlassRulesEngine.ts")
      suggest_task_complete "T-188" "Multiclass rules engine"
      ;;
    "src / services / AiService.ts")
      suggest_task_complete "T-169" "LLM integration"
      ;;
    "src / services / ThematicSkinService.ts")
      suggest_task_complete "T-192" "Thematic skin system"
      ;;
  esac
done

echo ""
`;

    const preCommitPath = resolve(this.gitHooksDir, 'pre-commit');
    writeFileSync(preCommitPath, preCommitHook);
    chmodSync(preCommitPath, 0o755); // Make executable
    }

  private createPostCommitHook() {
    const postCommitHook = `#!/bin / sh
# Post-commit hook for ZimboMate task status automation

echo "🔄 Running task status audit after commit..."

# Run the audit script to check for completed tasks
npm run audit-tasks 2>/dev / null | grep "HIGH CONFIDENCE" -A 20 || true

echo ""
echo "💡 Tip: Run 'npm run audit-tasks' anytime to check task status"
echo ""
`;

    const postCommitPath = resolve(this.gitHooksDir, 'post-commit');
    writeFileSync(postCommitPath, postCommitHook);
    chmodSync(postCommitPath, 0o755); // Make executable
    }

  public createWorkflowHelpers() {
    // Quick task status commands
    const taskHelpers = `#!/usr / bin / env tsx
/**
 * Quick task management helpers
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const command = args[0];
const taskId = args[1];

switch (command) {
  case 'start':
    if (!taskId) {
      process.exit(1);
    }
    execSync(\`npm run tm:move -- --id \${taskId} --status in_progress\`, { stdio: 'inherit' });
    break;

  case 'done':
    if (!taskId) {
      process.exit(1);
    }
    execSync(\`npm run tm:move -- --id \${taskId} --status done\`, { stdio: 'inherit' });
    break;

  case 'next':
    execSync('npm run tm:next', { stdio: 'inherit' });
    break;

  case 'audit':
    execSync('npm run audit-tasks', { stdio: 'inherit' });
    break;

  default:
    }
`;

    writeFileSync('scripts / taskHelpers.ts', taskHelpers);
    }

  public updatePackageJson() {
    // Note: In a real implementation, you'd parse and update package.json
    // For now, just show what should be added
    }

  public run() {
    this.setupGitHooks();
    this.createWorkflowHelpers();
    this.updatePackageJson();

    ');
    }
}

const setup = new WorkflowAutomationSetup();
setup.run();
