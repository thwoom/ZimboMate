# Task Management Structure

## Overview
Tasks are now organized by priority and status to improve performance and maintainability.

## File Structure
```
ops/tasks/
├── README.md                    # This file
├── active/                      # Currently active tasks
│   ├── p1-tasks.yaml           # Priority 1 tasks (in progress/open)
│   ├── p2-tasks.yaml           # Priority 2 tasks (in progress/open)
│   └── p3-tasks.yaml           # Priority 3 tasks (in progress/open)
├── completed/                   # Completed tasks
│   ├── completed-2024.yaml     # Tasks completed in 2024
│   └── completed-2025.yaml     # Tasks completed in 2025
├── archived/                    # Archived/cancelled tasks
│   └── archived-tasks.yaml
└── templates/                   # Task templates and utilities
    ├── task-template.yaml
    └── completion-template.md
```

## Benefits
- **Faster operations**: Smaller files load and parse faster
- **Better tool performance**: Edit operations target specific files
- **Easier maintenance**: Focus on relevant tasks only
- **Reduced conflicts**: Smaller files reduce merge conflicts
- **Better organization**: Clear separation by priority and status

## Usage
- **Active development**: Work with files in `active/` directory
- **Task completion**: Move completed tasks to `completed/` with timestamp
- **Archiving**: Move cancelled/obsolete tasks to `archived/`
- **Dashboard generation**: Scripts combine files for dashboard display

## Migration
The original `tasks.yaml` is preserved as a backup. New task operations use the split structure.
