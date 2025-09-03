import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect,it } from 'vitest';
import YAML from 'yaml';

describe('Task Manager', () => {
  it('should have a valid tasks.yaml file', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(_tasksPath, 'utf8');
    const _doc = YAML.parse(_raw);

    expect(_doc).toBeDefined();
    expect(Array.isArray(_doc.tasks)).toBe(true);
    expect(_doc.tasks.length).toBeGreaterThan(0);
  });

  it('should have required task fields', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(_tasksPath, 'utf8');
    const _doc = YAML.parse(_raw);

    for (const task of _doc.tasks) {
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.priority).toBeDefined();
    }
  });

  it('should have valid task statuses', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(_tasksPath, 'utf8');
    const _doc = YAML.parse(_raw);

    const validStatuses = ['open', 'in_progress', 'blocked', 'done', 'completed', 'cancelled'];

    for (const task of _doc.tasks) {
      expect(validStatuses).toContain(task.status);
    }
  });

  it('should have valid task priorities', () => {
    const _tasksPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    const _raw = readFileSync(_tasksPath, 'utf8');
    const _doc = YAML.parse(_raw);

    const validPriorities = ['P0', 'P1', 'P2', 'P3'];

    for (const task of _doc.tasks) {
      expect(validPriorities).toContain(task.priority);
    }
  });
});
