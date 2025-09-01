import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';

describe('Task Manager', () => {
  it('should have a valid tasks.yaml file', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(tasksPath, 'utf8');
    const _doc = YAML.parse(raw);

    expect(doc).toBeDefined();
    expect(Array.isArray(doc.tasks)).toBe(true);
    expect(doc.tasks.length).toBeGreaterThan(0);
  });

  it('should have required task fields', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(tasksPath, 'utf8');
    const _doc = YAML.parse(raw);

    for (const task of doc.tasks) {
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.priority).toBeDefined();
    }
  });

  it('should have valid task statuses', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(tasksPath, 'utf8');
    const _doc = YAML.parse(raw);

    const validStatuses = ['open', 'in_progress', 'blocked', 'done', 'completed'];

    for (const task of doc.tasks) {
      expect(validStatuses).toContain(task.status);
    }
  });

  it('should have valid task priorities', () => {
    const tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const raw = readFileSync(tasksPath, 'utf8');
    const doc = YAML.parse(raw);

    const validPriorities = ['P0', 'P1', 'P2', 'P3'];

    for (const task of doc.tasks) {
      expect(validPriorities).toContain(task.priority);
    }
  });
});
