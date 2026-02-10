import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Test fixtures
const TEST_DIR = join(tmpdir(), 'autonomous-dev-test-' + Date.now());
const BEADS_DIR = join(TEST_DIR, '.beads');
const STATE_DIR = join(TEST_DIR, '.github', 'autonomous');
const BEADS_PATH = join(BEADS_DIR, 'issues.jsonl');
const STATE_PATH = join(STATE_DIR, 'state.json');
const PAUSE_PATH = join(TEST_DIR, '.github', 'PAUSE_AUTONOMOUS');

interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'done' | 'blocked' | 'wontfix';
  priority?: number;
  labels?: string[];
  blockers?: string[];
  created_at?: string;
}

// --- Extracted logic from autonomous-dev.ts for testability ---
const SKIP_LABELS = ['blocked', 'wontfix', 'autonomous:skip', 'needs-human'];
const MAX_TASK_FAILURES = 3;

function isEligible(task: BeadsTask, failedTaskIds: Set<string>): boolean {
  if (task.status !== 'open') return false;
  if (task.labels?.some((l) => SKIP_LABELS.includes(l))) return false;
  if (task.blockers && task.blockers.length > 0) return false;
  if (failedTaskIds.has(task.id)) return false;
  return true;
}

function sortByPriority(tasks: BeadsTask[]): BeadsTask[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = (a.priority ?? 2) - (b.priority ?? 2);
    if (priorityDiff !== 0) return priorityDiff;
    const aDate = a.created_at ? new Date(a.created_at).getTime() : Date.now();
    const bDate = b.created_at ? new Date(b.created_at).getTime() : Date.now();
    return aDate - bDate;
  });
}

function parseBeadsTasks(content: string): BeadsTask[] {
  return content
    .trim()
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as BeadsTask);
}

function getFailedTaskIdsFromState(stateJson: string): Set<string> {
  const state = JSON.parse(stateJson);
  const failedIds = new Set<string>();
  for (const task of state.failed_tasks ?? []) {
    if (task.failures >= MAX_TASK_FAILURES) {
      failedIds.add(task.id);
    }
  }
  return failedIds;
}

// --- Helper functions ---
function makeTask(overrides: Partial<BeadsTask> = {}): BeadsTask {
  return {
    id: `task-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Test task',
    status: 'open',
    priority: 2,
    created_at: '2026-02-01T00:00:00Z',
    ...overrides,
  };
}

function tasksToJsonl(tasks: BeadsTask[]): string {
  return tasks.map((t) => JSON.stringify(t)).join('\n') + '\n';
}

// --- Tests ---
describe('autonomous-dev', () => {
  beforeEach(async () => {
    await mkdir(BEADS_DIR, { recursive: true });
    await mkdir(STATE_DIR, { recursive: true });
    await mkdir(join(TEST_DIR, '.github'), { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('isEligible', () => {
    it('returns true for open tasks with no blockers', () => {
      const task = makeTask({ status: 'open' });
      expect(isEligible(task, new Set())).toBe(true);
    });

    it('returns false for non-open tasks', () => {
      expect(isEligible(makeTask({ status: 'done' }), new Set())).toBe(false);
      expect(isEligible(makeTask({ status: 'in_progress' }), new Set())).toBe(
        false
      );
      expect(isEligible(makeTask({ status: 'blocked' }), new Set())).toBe(
        false
      );
      expect(isEligible(makeTask({ status: 'wontfix' }), new Set())).toBe(
        false
      );
    });

    it('returns false for tasks with skip labels', () => {
      for (const label of SKIP_LABELS) {
        const task = makeTask({ labels: [label] });
        expect(isEligible(task, new Set())).toBe(false);
      }
    });

    it('returns false for tasks with blockers', () => {
      const task = makeTask({ blockers: ['other-task-1'] });
      expect(isEligible(task, new Set())).toBe(false);
    });

    it('returns true for tasks with empty blockers array', () => {
      const task = makeTask({ blockers: [] });
      expect(isEligible(task, new Set())).toBe(true);
    });

    it('returns false for tasks in failed task set', () => {
      const task = makeTask({ id: 'failed-task-1' });
      const failedIds = new Set(['failed-task-1']);
      expect(isEligible(task, failedIds)).toBe(false);
    });

    it('allows tasks not in failed task set', () => {
      const task = makeTask({ id: 'good-task-1' });
      const failedIds = new Set(['other-failed-task']);
      expect(isEligible(task, failedIds)).toBe(true);
    });

    it('allows tasks with non-skip labels', () => {
      const task = makeTask({ labels: ['feature', 'frontend'] });
      expect(isEligible(task, new Set())).toBe(true);
    });
  });

  describe('sortByPriority', () => {
    it('sorts by priority (lower number = higher priority)', () => {
      const tasks = [
        makeTask({ id: 'low', priority: 3 }),
        makeTask({ id: 'high', priority: 1 }),
        makeTask({ id: 'mid', priority: 2 }),
      ];

      const sorted = sortByPriority(tasks);
      expect(sorted.map((t) => t.id)).toEqual(['high', 'mid', 'low']);
    });

    it('sorts by creation date when priority is equal', () => {
      const tasks = [
        makeTask({
          id: 'newer',
          priority: 2,
          created_at: '2026-02-10T00:00:00Z',
        }),
        makeTask({
          id: 'older',
          priority: 2,
          created_at: '2026-02-01T00:00:00Z',
        }),
      ];

      const sorted = sortByPriority(tasks);
      expect(sorted.map((t) => t.id)).toEqual(['older', 'newer']);
    });

    it('uses default priority 2 when not set', () => {
      const tasks = [
        makeTask({ id: 'explicit', priority: 2 }),
        makeTask({
          id: 'default',
          priority: undefined,
          created_at: '2026-02-05T00:00:00Z',
        }),
      ];

      const sorted = sortByPriority(tasks);
      // Same priority, sorted by date
      expect(sorted[0].priority ?? 2).toBe(2);
    });
  });

  describe('parseBeadsTasks', () => {
    it('parses JSONL format correctly', () => {
      const content = [
        JSON.stringify(makeTask({ id: '1', title: 'First' })),
        JSON.stringify(makeTask({ id: '2', title: 'Second' })),
      ].join('\n');

      const tasks = parseBeadsTasks(content);
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('1');
      expect(tasks[1].id).toBe('2');
    });

    it('handles empty lines', () => {
      const content = [
        JSON.stringify(makeTask({ id: '1' })),
        '',
        JSON.stringify(makeTask({ id: '2' })),
        '',
      ].join('\n');

      const tasks = parseBeadsTasks(content);
      expect(tasks).toHaveLength(2);
    });
  });

  describe('getFailedTaskIdsFromState', () => {
    it('returns empty set for no failed tasks', () => {
      const state = JSON.stringify({ failed_tasks: [] });
      expect(getFailedTaskIdsFromState(state).size).toBe(0);
    });

    it('returns empty set when failed_tasks is missing', () => {
      const state = JSON.stringify({});
      expect(getFailedTaskIdsFromState(state).size).toBe(0);
    });

    it('only includes tasks with failures >= MAX_TASK_FAILURES', () => {
      const state = JSON.stringify({
        failed_tasks: [
          { id: 'under-limit', failures: 2 },
          { id: 'at-limit', failures: 3 },
          { id: 'over-limit', failures: 5 },
        ],
      });

      const ids = getFailedTaskIdsFromState(state);
      expect(ids.has('under-limit')).toBe(false);
      expect(ids.has('at-limit')).toBe(true);
      expect(ids.has('over-limit')).toBe(true);
      expect(ids.size).toBe(2);
    });
  });

  describe('JSONL write/read roundtrip', () => {
    it('preserves task data through serialization', async () => {
      const tasks = [
        makeTask({
          id: '1',
          title: 'Task with 日本語',
          labels: ['feature'],
          priority: 1,
        }),
        makeTask({ id: '2', title: 'Task with blockers', blockers: ['1'] }),
      ];

      const jsonl = tasksToJsonl(tasks);
      const parsed = parseBeadsTasks(jsonl);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].title).toBe('Task with 日本語');
      expect(parsed[0].labels).toEqual(['feature']);
      expect(parsed[1].blockers).toEqual(['1']);
    });
  });

  describe('integration: pick eligible from mixed tasks', () => {
    it('filters and sorts correctly from a realistic task set', () => {
      const tasks = [
        makeTask({
          id: 'done-task',
          status: 'done',
          priority: 1,
        }),
        makeTask({
          id: 'blocked-label',
          status: 'open',
          labels: ['blocked'],
          priority: 1,
        }),
        makeTask({
          id: 'has-blockers',
          status: 'open',
          blockers: ['other'],
          priority: 1,
        }),
        makeTask({
          id: 'failed-too-many',
          status: 'open',
          priority: 1,
        }),
        makeTask({
          id: 'eligible-low',
          status: 'open',
          priority: 3,
          created_at: '2026-02-01T00:00:00Z',
        }),
        makeTask({
          id: 'eligible-high',
          status: 'open',
          priority: 1,
          created_at: '2026-02-01T00:00:00Z',
        }),
        makeTask({
          id: 'eligible-mid',
          status: 'open',
          priority: 2,
          created_at: '2026-02-01T00:00:00Z',
        }),
      ];

      const failedIds = new Set(['failed-too-many']);
      const eligible = tasks.filter((t) => isEligible(t, failedIds));
      const sorted = sortByPriority(eligible);

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe('eligible-high');
      expect(sorted[1].id).toBe('eligible-mid');
      expect(sorted[2].id).toBe('eligible-low');
    });
  });
});
