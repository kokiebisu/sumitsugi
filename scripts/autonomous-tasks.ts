#!/usr/bin/env bun
/**
 * Autonomous Task Manager
 *
 * Manages which Beads tasks are eligible for autonomous Claude execution.
 *
 * Usage:
 *   bun run scripts/autonomous-tasks.ts list       # Show eligible tasks
 *   bun run scripts/autonomous-tasks.ts queue       # Show what will run next
 *   bun run scripts/autonomous-tasks.ts exclude ID  # Exclude a task from autonomous
 *   bun run scripts/autonomous-tasks.ts include ID  # Re-include a task
 *   bun run scripts/autonomous-tasks.ts stats       # Show pipeline statistics
 */

import { readFileSync, writeFileSync } from "fs";

interface BeadsTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: number;
  labels?: string[];
  blocked_by?: Array<{ depends_on_id: string }>;
  dependencies?: Array<{ depends_on_id: string; type: string }>;
  created_by?: string;
  created_at?: string;
}

const ISSUES_PATH = ".beads/issues.jsonl";

// Manual/human task patterns - these cannot be automated
const MANUAL_PATTERNS = [
  "電話",
  "ヒアリング",
  "相談",
  "予約",
  "確認.*HP",
  "メモ",
  "リスト化",
  "リストアップ",
  "下書き",
  "投稿",
  "アカウント.*作成",
  "Sheets",
  "Docs",
  "見積もり",
  "フィードバック.*収集",
  "準備",
  "送信",
  "振り返り",
  "開く.*https",
  "読む.*https",
  "設計",
  "Design",
  "design",
  "検討",
  "実地検証",
  "STRATEGY\\.md",
  "質問.*読み",
  "資料.*レビュー",
];

function readTasks(): ReadonlyArray<BeadsTask> {
  const content = readFileSync(ISSUES_PATH, "utf-8");
  return content
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as BeadsTask);
}

function writeTasks(tasks: ReadonlyArray<BeadsTask>): void {
  const content = tasks.map((t) => JSON.stringify(t)).join("\n") + "\n";
  writeFileSync(ISSUES_PATH, content);
}

function isManualTask(task: BeadsTask): boolean {
  return MANUAL_PATTERNS.some((pattern) => new RegExp(pattern).test(task.title));
}

function isBlocked(task: BeadsTask): boolean {
  return (task.blocked_by ?? []).length > 0 || (task.dependencies ?? []).length > 0;
}

function isExcluded(task: BeadsTask): boolean {
  return (task.labels ?? []).includes("no-autonomous");
}

function isAutonomousEligible(task: BeadsTask): boolean {
  return (
    task.status === "open" &&
    !isManualTask(task) &&
    !isBlocked(task) &&
    !isExcluded(task)
  );
}

function listCommand(): void {
  const tasks = readTasks();
  const open = tasks.filter((t) => t.status === "open");

  const eligible = open.filter(isAutonomousEligible);
  const manual = open.filter(isManualTask);
  const blocked = open.filter((t) => !isManualTask(t) && isBlocked(t));
  const excluded = open.filter((t) => !isManualTask(t) && !isBlocked(t) && isExcluded(t));

  console.log("=== Autonomous-Eligible Tasks ===\n");
  for (const t of eligible.sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3))) {
    console.log(`  [${t.id}] P${t.priority ?? 3} ${t.title}`);
  }
  console.log(`\n  Total: ${eligible.length}\n`);

  console.log("=== Manual/Human Tasks (not automatable) ===\n");
  for (const t of manual) {
    console.log(`  [${t.id}] ${t.title}`);
  }
  console.log(`\n  Total: ${manual.length}\n`);

  console.log("=== Blocked Tasks (waiting on dependencies) ===\n");
  for (const t of blocked) {
    const fromBlocked = (t.blocked_by ?? []).map((b) => b.depends_on_id);
    const fromDeps = (t.dependencies ?? []).map((d) => d.depends_on_id);
    const blockers = [...fromBlocked, ...fromDeps].join(", ");
    console.log(`  [${t.id}] ${t.title}`);
    console.log(`    blocked by: ${blockers}`);
  }
  console.log(`\n  Total: ${blocked.length}\n`);

  if (excluded.length > 0) {
    console.log("=== Excluded from Autonomous ===\n");
    for (const t of excluded) {
      console.log(`  [${t.id}] ${t.title}`);
    }
    console.log(`\n  Total: ${excluded.length}\n`);
  }
}

function queueCommand(): void {
  const tasks = readTasks();
  const eligible = tasks
    .filter(isAutonomousEligible)
    .sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3));

  const next3 = eligible.slice(0, 3);

  console.log("=== Next Autonomous Run (up to 3 tasks) ===\n");
  for (const [i, t] of next3.entries()) {
    console.log(`  ${i + 1}. [${t.id}] ${t.title}`);
    if (t.description && t.description !== t.title) {
      const desc =
        t.description.length > 100
          ? t.description.slice(0, 100) + "..."
          : t.description;
      console.log(`     ${desc}`);
    }
  }

  if (eligible.length > 3) {
    console.log(`\n  ... and ${eligible.length - 3} more in queue`);
  }

  console.log(`\n  Total eligible: ${eligible.length}`);
}

function excludeCommand(taskId: string): void {
  const tasks = readTasks();
  const updated = tasks.map((t) => {
    if (t.id === taskId) {
      const labels = [...(t.labels ?? [])];
      if (!labels.includes("no-autonomous")) {
        labels.push("no-autonomous");
      }
      return { ...t, labels };
    }
    return t;
  });

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task not found: ${taskId}`);
    process.exit(1);
  }

  writeTasks(updated);
  console.log(`Excluded from autonomous: [${taskId}] ${task.title}`);
}

function includeCommand(taskId: string): void {
  const tasks = readTasks();
  const updated = tasks.map((t) => {
    if (t.id === taskId) {
      const labels = (t.labels ?? []).filter((l) => l !== "no-autonomous");
      return { ...t, labels };
    }
    return t;
  });

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task not found: ${taskId}`);
    process.exit(1);
  }

  writeTasks(updated);
  console.log(`Re-included in autonomous: [${taskId}] ${task.title}`);
}

function statsCommand(): void {
  const tasks = readTasks();
  const open = tasks.filter((t) => t.status === "open");
  const closed = tasks.filter((t) => t.status === "closed" || t.status === "done");
  const eligible = open.filter(isAutonomousEligible);
  const manual = open.filter(isManualTask);
  const blocked = open.filter((t) => !isManualTask(t) && isBlocked(t));

  console.log("=== Autonomous Pipeline Stats ===\n");
  console.log(`  Total tasks:           ${tasks.length}`);
  console.log(`  Open:                  ${open.length}`);
  console.log(`  Closed:                ${closed.length}`);
  console.log(`  Autonomous-eligible:   ${eligible.length}`);
  console.log(`  Manual/human:          ${manual.length}`);
  console.log(`  Blocked:               ${blocked.length}`);
  console.log(
    `  Automation rate:       ${open.length > 0 ? Math.round((eligible.length / open.length) * 100) : 0}%`
  );
  console.log(
    `\n  At 3 tasks/day, eligible queue clears in ~${Math.ceil(eligible.length / 3)} days`
  );
}

// CLI
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "list":
    listCommand();
    break;
  case "queue":
    queueCommand();
    break;
  case "exclude":
    if (!arg) {
      console.error("Usage: autonomous-tasks.ts exclude <task-id>");
      process.exit(1);
    }
    excludeCommand(arg);
    break;
  case "include":
    if (!arg) {
      console.error("Usage: autonomous-tasks.ts include <task-id>");
      process.exit(1);
    }
    includeCommand(arg);
    break;
  case "stats":
    statsCommand();
    break;
  default:
    console.log(`Usage: bun run scripts/autonomous-tasks.ts <command>

Commands:
  list      Show all tasks categorized by automation eligibility
  queue     Show what will run in the next autonomous cycle
  exclude   Exclude a task from autonomous execution
  include   Re-include a task in autonomous execution
  stats     Show pipeline statistics`);
}
