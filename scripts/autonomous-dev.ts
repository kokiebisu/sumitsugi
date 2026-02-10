#!/usr/bin/env bun
/* eslint-disable no-console */
/**
 * Autonomous Developer Script
 *
 * Picks tasks from Beads and prepares them for Claude Code implementation.
 * This script is designed to run in GitHub Actions.
 *
 * Usage:
 *   bun run scripts/autonomous-dev.ts pick    # Pick next task
 *   bun run scripts/autonomous-dev.ts status  # Show current status
 *   bun run scripts/autonomous-dev.ts done <task-id>  # Mark task done
 */

import { readFile, writeFile, appendFile, access } from 'node:fs/promises';
import { join } from 'node:path';

interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'done' | 'blocked' | 'wontfix';
  priority?: number;
  issue_type?: string;
  created_at?: string;
  created_by?: string;
  labels?: string[];
  blockers?: string[];
}

interface PickResult {
  success: boolean;
  task?: BeadsTask;
  reason?: string;
  prompt?: string;
}

interface AutonomousState {
  failed_tasks: Array<{
    id: string;
    title: string;
    failures: number;
    first_failed: string;
    last_failed: string;
  }>;
  [key: string]: unknown;
}

const BEADS_PATH = join(process.cwd(), '.beads', 'issues.jsonl');
const PAUSE_FILE = join(process.cwd(), '.github', 'PAUSE_AUTONOMOUS');
const STATE_FILE = join(process.cwd(), '.github', 'autonomous', 'state.json');

// Labels that prevent autonomous processing
const SKIP_LABELS = ['blocked', 'wontfix', 'autonomous:skip', 'needs-human'];

// Max failures before a task is auto-skipped
const MAX_TASK_FAILURES = 3;

// Max tasks per day
const MAX_DAILY_TASKS = 3;

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readBeadsTasks(): Promise<BeadsTask[]> {
  try {
    const content = await readFile(BEADS_PATH, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as BeadsTask);
  } catch {
    console.error('Failed to read Beads tasks');
    return [];
  }
}

async function writeBeadsTasks(tasks: BeadsTask[]): Promise<void> {
  const content = tasks.map((t) => JSON.stringify(t)).join('\n') + '\n';
  await writeFile(BEADS_PATH, content);
}

async function isPaused(): Promise<boolean> {
  return fileExists(PAUSE_FILE);
}

async function getFailedTaskIds(): Promise<Set<string>> {
  try {
    const content = await readFile(STATE_FILE, 'utf-8');
    const state: AutonomousState = JSON.parse(content);
    const failedIds = new Set<string>();

    for (const task of state.failed_tasks ?? []) {
      if (task.failures >= MAX_TASK_FAILURES) {
        failedIds.add(task.id);
      }
    }

    return failedIds;
  } catch {
    return new Set();
  }
}

async function getTodayCompletedCount(): Promise<number> {
  const tasks = await readBeadsTasks();
  const today = new Date().toISOString().split('T')[0];

  return tasks.filter((t) => {
    if (t.status !== 'done') return false;
    // Check if completed today (approximation)
    const updated = t.created_at?.split('T')[0];
    return updated === today;
  }).length;
}

function isEligible(task: BeadsTask, failedTaskIds: Set<string>): boolean {
  if (task.status !== 'open') return false;
  if (task.labels?.some((l) => SKIP_LABELS.includes(l))) return false;
  if (task.blockers && task.blockers.length > 0) return false;
  if (failedTaskIds.has(task.id)) return false;
  return true;
}

function generatePrompt(task: BeadsTask): string {
  return `You are implementing a task from the Beads task tracker.

## Task Details

**ID:** ${task.id}
**Title:** ${task.title}
**Priority:** ${task.priority ?? 2}
**Labels:** ${task.labels?.join(', ') ?? 'none'}

**Description:**
${task.description ?? 'No description provided. Use your best judgment based on the title.'}

## Instructions

1. **Understand the task** - Read relevant code to understand context
2. **Plan the implementation** - Break down into small steps
3. **Write tests first** - Follow TDD
4. **Implement** - Write clean, minimal code
5. **Verify** - Run tests and linting

## Constraints

- Maximum 300 lines of code changes
- Must include tests
- Must pass all existing tests
- Follow existing code patterns
- Do NOT change unrelated files

## When Done

After implementation:
1. Create a PR with clear description
2. Wait for CI to pass
3. If CI fails, fix the issues
4. After CI passes, merge the PR

Begin implementation now.`;
}

async function pickTask(): Promise<PickResult> {
  // Check if paused
  if (await isPaused()) {
    return { success: false, reason: 'Autonomous development is paused' };
  }

  // Check daily limit
  const completedToday = await getTodayCompletedCount();
  if (completedToday >= MAX_DAILY_TASKS) {
    return {
      success: false,
      reason: `Daily limit reached (${completedToday}/${MAX_DAILY_TASKS})`,
    };
  }

  // Get eligible tasks (skip tasks that have failed too many times)
  const tasks = await readBeadsTasks();
  const failedTaskIds = await getFailedTaskIds();
  const eligible = tasks.filter((t) => isEligible(t, failedTaskIds));

  if (failedTaskIds.size > 0) {
    console.log(
      `Skipping ${failedTaskIds.size} task(s) with ${MAX_TASK_FAILURES}+ failures`
    );
  }

  if (eligible.length === 0) {
    return { success: false, reason: 'No eligible tasks found' };
  }

  // Sort by priority (lower = higher priority), then by age
  eligible.sort((a, b) => {
    const priorityDiff = (a.priority ?? 2) - (b.priority ?? 2);
    if (priorityDiff !== 0) return priorityDiff;

    const aDate = a.created_at ? new Date(a.created_at).getTime() : Date.now();
    const bDate = b.created_at ? new Date(b.created_at).getTime() : Date.now();
    return aDate - bDate;
  });

  const task = eligible[0];
  const prompt = generatePrompt(task);

  return { success: true, task, prompt };
}

async function markTaskInProgress(taskId: string): Promise<boolean> {
  const tasks = await readBeadsTasks();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    console.error(`Task ${taskId} not found`);
    return false;
  }

  task.status = 'in_progress';
  await writeBeadsTasks(tasks);
  return true;
}

async function markTaskDone(taskId: string): Promise<boolean> {
  const tasks = await readBeadsTasks();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    console.error(`Task ${taskId} not found`);
    return false;
  }

  task.status = 'done';
  await writeBeadsTasks(tasks);
  return true;
}

async function showStatus(): Promise<void> {
  const paused = await isPaused();
  const tasks = await readBeadsTasks();
  const failedTaskIds = await getFailedTaskIds();
  const eligible = tasks.filter((t) => isEligible(t, failedTaskIds));
  const completedToday = await getTodayCompletedCount();

  console.log('=== Autonomous Developer Status ===');
  console.log(`Paused: ${paused}`);
  console.log(`Total tasks: ${tasks.length}`);
  console.log(`Eligible tasks: ${eligible.length}`);
  console.log(`Completed today: ${completedToday}/${MAX_DAILY_TASKS}`);

  if (eligible.length > 0) {
    console.log('\nTop 5 eligible tasks:');
    eligible.slice(0, 5).forEach((t, i) => {
      console.log(`  ${i + 1}. [P${t.priority ?? 2}] ${t.title} (${t.id})`);
    });
  }
}

// Main CLI
const command = process.argv[2];

switch (command) {
  case 'pick': {
    const result = await pickTask();
    if (result.success && result.task) {
      // Mark as in progress
      await markTaskInProgress(result.task.id);

      // Output for GitHub Actions (using $GITHUB_OUTPUT)
      const ghOutput = process.env.GITHUB_OUTPUT;
      if (ghOutput) {
        await appendFile(
          ghOutput,
          `task_id=${result.task.id}\ntask_title=${result.task.title}\nhas_task=true\n`
        );
      }
      // Fallback markers for workflow grep parsing
      console.log(`task_id::${result.task.id}`);
      console.log(`task_title::${result.task.title}`);
      console.log(`has_task::true`);

      // Write prompt to file for Claude Code
      await writeFile('/tmp/task-prompt.txt', result.prompt!);
      console.log('Task prompt written to /tmp/task-prompt.txt');

      console.log(`\nSelected task: ${result.task.title} (${result.task.id})`);
    } else {
      const ghOutput = process.env.GITHUB_OUTPUT;
      if (ghOutput) {
        await appendFile(
          ghOutput,
          `has_task=false\nskip_reason=${result.reason}\n`
        );
      }
      console.log(`has_task::false`);
      console.log(`skip_reason::${result.reason}`);
      console.log(`\nNo task selected: ${result.reason}`);
    }
    break;
  }

  case 'done': {
    const taskId = process.argv[3];
    if (!taskId) {
      console.error('Usage: autonomous-dev.ts done <task-id>');
      process.exit(1);
    }
    const success = await markTaskDone(taskId);
    console.log(success ? `Task ${taskId} marked as done` : 'Failed');
    break;
  }

  case 'status':
  default:
    await showStatus();
    break;
}
