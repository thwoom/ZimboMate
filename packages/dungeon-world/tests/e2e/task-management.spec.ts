import { expect,test } from '@playwright/test';

import { TestHelpers } from './utils/test-helpers';

test.describe('Task Management System', () => {
  let helpers: TestHelpers;

  test.beforeEach(async({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForAppReady();
  });

  test.describe('Task Creation', () => {
    test('should create a new task with all required fields', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Open create task modal
      await page.click('[data-testid="create-task-btn"]');
      await expect(page.locator('[data-testid="task-creation-modal"]')).toBeVisible();

      // Fill out task form
      await page.fill('[data-testid="task-title"]', 'Test Task Title');
      await page.fill('[data-testid="task-description"]', 'This is a test task description');
      await page.selectOption('[data-testid="task-priority"]', 'p1');
      await page.selectOption('[data-testid="task-category"]', 'development');
      await page.fill('[data-testid="task-estimate"]', '2');

      // Submit form
      await page.click('[data-testid="save-task"]');

      // Verify task was created
      await expect(page.locator('text=Test Task Title')).toBeVisible();
      await expect(page.locator('[data-testid="task-creation-modal"]')).not.toBeVisible();
    });

    test('should validate required fields during task creation', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Open create task modal
      await page.click('[data-testid="create-task-btn"]');

      // Try to submit without title
      await page.click('[data-testid="save-task"]');

      // Verify validation error
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('text=Title is required')).toBeVisible();

      // Fill title and try again
      await page.fill('[data-testid="task-title"]', 'Valid Task Title');
      await page.click('[data-testid="save-task"]');

      // Should now succeed
      await expect(page.locator('text=Valid Task Title')).toBeVisible();
    });

    test('should create task with custom tags', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      await page.click('[data-testid="create-task-btn"]');
      await page.fill('[data-testid="task-title"]', 'Tagged Task');
      await page.fill('[data-testid="task-tags"]', 'bug, frontend, high-priority');

      await page.click('[data-testid="save-task"]');

      // Verify tags are displayed
      await expect(page.locator('[data-testid="tag-bug"]')).toBeVisible();
      await expect(page.locator('[data-testid="tag-frontend"]')).toBeVisible();
      await expect(page.locator('[data-testid="tag-high-priority"]')).toBeVisible();
    });
  });

  test.describe('Task Organization', () => {
    test('should organize tasks by priority correctly', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create tasks with different priorities
      const tasks = [
        { title: 'Critical Bug', priority: 'p1' },
        { title: 'Feature Request', priority: 'p2' },
        { title: 'Documentation', priority: 'p3' },
      ];

      for (const task of tasks) {
        await helpers.createTestTask(task.title, task.priority);
      }

      // Verify tasks are sorted by priority
      const taskElements = page.locator('[data-testid="task-row"]');
      await expect(taskElements).toHaveCount(3);

      // Check first task is highest priority
      await expect(taskElements.first().locator('text=Critical Bug')).toBeVisible();
    });

    test('should filter tasks by category', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create tasks in different categories
      await helpers.createTestTask('Frontend Bug', 'p2');
      await page.locator('[data-testid="edit-task-btn"]').first().click();
      await page.selectOption('[data-testid="task-category"]', 'frontend');
      await page.click('[data-testid="update-task"]');

      await helpers.createTestTask('Backend Feature', 'p2');
      await page.locator('[data-testid="edit-task-btn"]').last().click();
      await page.selectOption('[data-testid="task-category"]', 'backend');
      await page.click('[data-testid="update-task"]');

      // Filter by frontend
      await page.selectOption('[data-testid="category-filter"]', 'frontend');

      // Verify only frontend tasks are shown
      await expect(page.locator('text=Frontend Bug')).toBeVisible();
      await expect(page.locator('text=Backend Feature')).not.toBeVisible();
    });

    test('should search tasks by title and description', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create tasks with searchable content
      await helpers.createTestTask('Authentication System', 'p1');
      await helpers.createTestTask('User Dashboard', 'p2');
      await helpers.createTestTask('API Documentation', 'p3');

      // Search for "auth"
      await page.fill('[data-testid="task-search"]', 'auth');

      // Verify search results
      await expect(page.locator('text=Authentication System')).toBeVisible();
      await expect(page.locator('text=User Dashboard')).not.toBeVisible();
      await expect(page.locator('text=API Documentation')).not.toBeVisible();
    });
  });

  test.describe('Task Workflow', () => {
    test('should move tasks through workflow states', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create a task
      await helpers.createTestTask('Workflow Test Task', 'p2');

      // Move to "In Progress"
      await page.locator('[data-testid="task-row"]:has-text("Workflow Test Task")').locator('[data-testid="status-dropdown"]').click();
      await page.selectOption('[data-testid="status-dropdown"]', 'in-progress');

      // Verify status change
      await expect(page.locator('[data-testid="status-in-progress"]')).toBeVisible();

      // Move to "Review"
      await page.locator('[data-testid="status-dropdown"]').click();
      await page.selectOption('[data-testid="status-dropdown"]', 'review');

      // Verify status change
      await expect(page.locator('[data-testid="status-review"]')).toBeVisible();
    });

    test('should assign tasks to team members', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create a task
      await helpers.createTestTask('Assigned Task', 'p1');

      // Assign to team member
      await page.locator('[data-testid="task-row"]:has-text("Assigned Task")').locator('[data-testid="assignee-dropdown"]').click();
      await page.selectOption('[data-testid="assignee-dropdown"]', 'developer1');

      // Verify assignment
      await expect(page.locator('[data-testid="assignee-developer1"]')).toBeVisible();
    });

    test('should track time spent on tasks', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create a task
      await helpers.createTestTask('Time Tracking Task', 'p2');

      // Start time tracking
      await page.locator('[data-testid="task-row"]:has-text("Time Tracking Task")').locator('[data-testid="start-timer"]').click();

      // Verify timer is running
      await expect(page.locator('[data-testid="timer-running"]')).toBeVisible();

      // Wait a moment and stop timer
      await page.waitForTimeout(2000);
      await page.locator('[data-testid="stop-timer"]').click();

      // Verify time was recorded
      await expect(page.locator('[data-testid="time-spent"]')).toBeVisible();
    });
  });

  test.describe('Task Completion', () => {
    test('should complete tasks and move to completed list', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create and complete a task
      await helpers.createTestTask('Completable Task', 'p3');
      await helpers.completeTask('Completable Task');

      // Verify task is marked as completed
      await expect(page.locator('[data-testid="task-completed"]')).toBeVisible();

      // Switch to completed tasks view
      await page.click('[data-testid="view-completed-tasks"]');

      // Verify task appears in completed list
      await expect(page.locator('text=Completable Task')).toBeVisible();
    });

    test('should archive completed tasks', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Complete a task
      await helpers.createTestTask('Archivable Task', 'p2');
      await helpers.completeTask('Archivable Task');

      // Archive the completed task
      await page.locator('[data-testid="archive-task"]').click();

      // Verify task is archived
      await expect(page.locator('[data-testid="task-archived"]')).toBeVisible();
    });
  });

  test.describe('Task Analytics', () => {
    test('should display task completion statistics', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create and complete several tasks
      await helpers.createTestTask('Task 1', 'p1');
      await helpers.createTestTask('Task 2', 'p2');
      await helpers.createTestTask('Task 3', 'p3');

      // Complete some tasks
      await helpers.completeTask('Task 1');
      await helpers.completeTask('Task 2');

      // View analytics
      await page.click('[data-testid="view-analytics"]');

      // Verify statistics
      await expect(page.locator('text=Total Tasks: 3')).toBeVisible();
      await expect(page.locator('text=Completed: 2')).toBeVisible();
      await expect(page.locator('text=Completion Rate: 67%')).toBeVisible();
    });

    test('should show velocity charts', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Navigate to analytics
      await page.click('[data-testid="view-analytics"]');
      await page.click('[data-testid="velocity-tab"]');

      // Verify chart is displayed
      await expect(page.locator('[data-testid="velocity-chart"]')).toBeVisible();
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple tasks for bulk operations', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create multiple tasks
      await helpers.createTestTask('Bulk Task 1', 'p1');
      await helpers.createTestTask('Bulk Task 2', 'p2');
      await helpers.createTestTask('Bulk Task 3', 'p3');

      // Select all tasks
      await page.click('[data-testid="select-all-tasks"]');

      // Verify all checkboxes are checked
      const checkboxes = page.locator('[data-testid="task-checkbox"]');
      for (let i = 0; i < 3; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });

    test('should bulk update task priorities', async({ page }) => {
      await helpers.navigateToPanel('task-management');

      // Create tasks and select them
      await helpers.createTestTask('Bulk Update 1', 'p3');
      await helpers.createTestTask('Bulk Update 2', 'p3');

      // Select both tasks
      await page.locator('[data-testid="task-checkbox"]').nth(0).check();
      await page.locator('[data-testid="task-checkbox"]').nth(1).check();

      // Bulk update priority
      await page.click('[data-testid="bulk-actions"]');
      await page.selectOption('[data-testid="bulk-priority"]', 'p1');
      await page.click('[data-testid="apply-bulk-update"]');

      // Verify both tasks now have p1 priority
      await expect(page.locator('[data-testid="priority-p1"]')).toHaveCount(2);
    });
  });
});
