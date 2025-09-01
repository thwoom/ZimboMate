import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { TaskPlanner } from '../scripts / planFromPrd';

describe('Planning Command E2E', () => {
  const testTasksPath = resolve(process.cwd(), 'test - tasks.yaml');
  const testPrdPath = resolve(process.cwd(), 'test - planning - prd.md');
  let planner: TaskPlanner;

  const samplePRD = `# Test Planning PRD

## Overview
This is a test PRD for planning command testing.

## Product Vision
A test product for planning functionality.

## Core Features

### User Authentication - Login functionality - Password reset - Two - factor authentication

### Data Management - CRUD operations - Data validation - Export functionality

### Reporting - Generate reports - Custom dashboards - Scheduled reports

## Technical Requirements

### Performance - Response time < 200ms - Support 1000 concurrent users - 99.9% uptime

### Security - Data encryption - Access control - Audit logging

### Scalability - Horizontal scaling - Load balancing - Database optimization

## Success Metrics - 95% user satisfaction - 99.9% uptime achieved - Response time < 200ms

## Timeline - Phase 1: Core features (Q1)
- Phase 2: Advanced features (Q2)
- Phase 3: Enterprise features (Q3)`;

  const existingTasks = {
    tasks: [
      {
        id: 'T - 001',
        title: 'Existing Task 1',
        intent: 'Test existing task',
        owner: 'test - user',
        status: 'done' as const,
        priority: 'P1' as const,
        labels: ['existing'],
        deps: [],
        steps: ['Step 1'],
        acceptance: ['Acceptance 1'],
        done_at: '2025 - 01 - 01T00:00:00.000Z',
      },
    ],
  };

  beforeEach(() => {
    // Create test files
    writeFileSync(testPrdPath, samplePRD);
    writeFileSync(testTasksPath, YAML.stringify(existingTasks));
    planner = new TaskPlanner(testTasksPath);
  });

  afterEach(() => {
    // Clean up test files
    try {
      unlinkSync(testPrdPath);
      unlinkSync(testTasksPath);
    } catch (error) {
      // Files might not exist, ignore
    }
  });

  describe('Task Generation', () => {
    it('should generate tasks from PRD content', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);

      expect(newTasks).toHaveLength(9); // 3 features + 3 tech reqs + 3 timeline phases

      // Check feature tasks
      const featureTasks = newTasks.filter((task) =>
        task.labels.includes('feature'),
      );
      expect(featureTasks).toHaveLength(3);
      expect(featureTasks[0].title).toBe('Implement User Authentication');
      expect(featureTasks[1].title).toBe('Implement Data Management');
      expect(featureTasks[2].title).toBe('Implement Reporting');

      // Check infrastructure tasks
      const infraTasks = newTasks.filter((task) =>
        task.labels.includes('infrastructure'),
      );
      expect(infraTasks).toHaveLength(3);
      expect(infraTasks[0].title).toBe('Setup Performance');
      expect(infraTasks[1].title).toBe('Setup Security');
      expect(infraTasks[2].title).toBe('Setup Scalability');

      // Check milestone tasks
      const milestoneTasks = newTasks.filter((task) =>
        task.labels.includes('milestone'),
      );
      expect(milestoneTasks).toHaveLength(3);
      expect(milestoneTasks[0].title).toBe('Complete Phase 1');
      expect(milestoneTasks[1].title).toBe('Complete Phase 2');
      expect(milestoneTasks[2].title).toBe('Complete Phase 3');
    });

    it('should assign correct priorities', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);

      // First items should be P1
      expect(newTasks[0].priority).toBe('P1');
      expect(newTasks[3].priority).toBe('P1'); // First tech req
      expect(newTasks[6].priority).toBe('P1'); // First milestone

      // Later items should be P2 or P3
      expect(newTasks[2].priority).toBe('P2'); // Third feature
      expect(newTasks[5].priority).toBe('P2'); // Third tech req (3 items, so all P1 / P2)
      expect(newTasks[8].priority).toBe('P2'); // Third milestone (3 items, so all P1 / P2)
    });

    it('should generate stable task IDs', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);

      // Should start from T - 002 (since T - 001 exists)
      expect(newTasks[0].id).toBe('T - 002');
      expect(newTasks[1].id).toBe('T - 003');
      expect(newTasks[2].id).toBe('T - 004');
      // ... and so on
    });

    it('should include proper steps and acceptance criteria', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);
      const authTask = newTasks.find(
        (task) => task.title === 'Implement User Authentication',
      );

      expect(authTask).toBeDefined();
      expect(authTask?.steps).toHaveLength(3);
      expect(authTask?.steps).toContain('Implement login functionality');
      expect(authTask?.steps).toContain('Implement password reset');
      expect(authTask?.steps).toContain('Implement two - factor authentication');

      expect(authTask?.acceptance).toHaveLength(3);
      expect(authTask?.acceptance).toContain(
        'All user authentication requirements are implemented',
      );
    });
  });

  describe('Task Appending', () => {
    it('should append tasks without ID collisions', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);
      const collisions = planner.checkForCollisions(newTasks);

      expect(collisions).toHaveLength(0);

      planner.appendTasks(newTasks);

      // Verify file was updated
      const _updatedContent = readFileSync(testTasksPath, 'utf8');
      const _updatedTasks = YAML.parse(updatedContent);

      expect(updatedTasks.tasks).toHaveLength(10); // 1 existing + 9 new
    });

    it('should sort tasks by priority and ID', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);
      planner.appendTasks(newTasks);

      const updatedContent = readFileSync(testTasksPath, 'utf8');
      const updatedTasks = YAML.parse(updatedContent);

      // Check that tasks are sorted by priority first
      const priorities = updatedTasks.tasks.map((task: unknown) => task.priority);
      const priorityOrder = [
        'P1',
        'P1',
        'P1',
        'P1',
        'P2',
        'P2',
        'P2',
        'P2',
        'P2',
        'P2',
      ];

      expect(priorities).toEqual(priorityOrder);

      // Within same priority, should be sorted by ID
      const p1Tasks = updatedTasks.tasks.filter(
        (task: unknown) => task.priority === 'P1',
      );
      const p1Ids = p1Tasks.map((task: unknown) => task.id);
      expect(p1Ids).toEqual(['T - 001', 'T - 002', 'T - 005', 'T - 008']);
    });
  });

  describe('Deterministic Ordering', () => {
    it('should produce same results on multiple runs', () => {
      // First run
      const _newTasks1 = planner.generateTasksFromPRD(testPrdPath);
      planner.appendTasks(newTasks1);

      const content1 = readFileSync(testTasksPath, 'utf8');
      const tasks1 = YAML.parse(content1);

      // Reset and run again
      writeFileSync(testTasksPath, YAML.stringify(existingTasks));
      planner = new TaskPlanner(testTasksPath);

      const _newTasks2 = planner.generateTasksFromPRD(testPrdPath);
      planner.appendTasks(newTasks2);

      const content2 = readFileSync(testTasksPath, 'utf8');
      const tasks2 = YAML.parse(content2);

      // Should be identical
      expect(tasks1).toEqual(tasks2);
    });

    it('should maintain stable IDs across runs', () => {
      const newTasks1 = planner.generateTasksFromPRD(testPrdPath);
      const ids1 = newTasks1.map((task) => task.id);

      // Reset and run again
      planner = new TaskPlanner(testTasksPath);
      const newTasks2 = planner.generateTasksFromPRD(testPrdPath);
      const ids2 = newTasks2.map((task) => task.id);

      expect(ids1).toEqual(ids2);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const _newTasks = planner.generateTasksFromPRD(testPrdPath);
      const stats = planner.getStats(newTasks);

      expect(stats.totalTasks).toBe(10); // 1 existing + 9 new
      expect(stats.newTasks).toBe(9);

      expect(stats.byPriority).toEqual({
        P1: 4,
        P2: 6,
      });

      expect(stats.byLabel).toEqual({
        existing: 1,
        feature: 3,
        implementation: 3,
        infrastructure: 3,
        performance: 1,
        security: 1,
        scalability: 1,
        milestone: 3,
        planning: 3,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing PRD file', () => {
      expect(() => planner.generateTasksFromPRD('non - existent.md')).toThrow();
    });

    it('should handle invalid PRD content', () => {
      const invalidPRD = `# Invalid PRD

## Overview
This PRD is missing required sections.`;

      writeFileSync(testPrdPath, invalidPRD);

      expect(() => planner.generateTasksFromPRD(testPrdPath)).toThrow();
    });

    it('should handle empty tasks file', () => {
      // Create planner with empty tasks file
      writeFileSync(testTasksPath, 'tasks: []');
      const emptyPlanner = new TaskPlanner(testTasksPath);

      const newTasks = emptyPlanner.generateTasksFromPRD(testPrdPath);
      expect(newTasks).toHaveLength(9);
      expect(newTasks[0].id).toBe('T - 001'); // Should start from 1
    });
  });

  describe('CLI Integration', () => {
    it('should work with default PRD path', () => {
      // This test verifies the CLI can work with the default docs / PRD.md
      const defaultPlanner = new TaskPlanner();

      // Should not throw when docs / PRD.md exists
      expect(() => defaultPlanner.generateTasksFromPRD()).not.toThrow();
    });
  });
});
