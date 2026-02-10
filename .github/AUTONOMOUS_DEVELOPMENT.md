# Autonomous Development System

## Vision

Transform this repository into a self-growing, self-building system that operates like an AI software organization. The system should:

1. **Identify work** - Automatically find what needs to be done
2. **Prioritize** - Pick the most important task
3. **Implement** - Write code autonomously
4. **Review** - Self-review and iterate
5. **Ship** - Create PRs, merge after CI passes
6. **Report** - Provide visibility without human intervention

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS DEVELOPMENT LOOP                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  DISCOVERY   │ -> │  PLANNING    │ -> │ IMPLEMENTATION│       │
│  │              │    │              │    │               │       │
│  │ - Beads tasks│    │ - Pick task  │    │ - Claude Code │       │
│  │ - Audit gaps │    │ - Estimate   │    │ - Write code  │       │
│  │ - Issues     │    │ - Validate   │    │ - Write tests │       │
│  └──────────────┘    └──────────────┘    └───────────────┘       │
│         ^                                        │               │
│         │                                        v               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   REPORTING  │ <- │   SHIPPING   │ <- │    REVIEW    │       │
│  │              │    │              │    │              │       │
│  │ - Standup    │    │ - Create PR  │    │ - Code review│       │
│  │ - Metrics    │    │ - Wait CI    │    │ - Self-fix   │       │
│  │ - Summary    │    │ - Auto-merge │    │ - Iterate    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Workflows

### 1. Autonomous Developer (Daily)

**Schedule:** Every 4 hours (6:00, 10:00, 14:00, 18:00, 22:00 UTC)
**Budget:** Max 3 tasks per day, max $5 API cost per run

```yaml
Workflow:
1. Read open tasks from .beads/issues.jsonl
2. Filter by priority and labels (exclude: blocked, wontfix)
3. Pick highest priority task
4. Validate task is implementable (has clear requirements)
5. Create branch: auto/<task-id>
6. Use Claude Code to implement
7. Create PR with tests
8. Wait for CI
9. If CI passes + no CRITICAL review issues -> auto-merge
10. Mark task as done in Beads
```

### 2. Daily Standup (Report)

**Schedule:** 09:00 JST (00:00 UTC)

```yaml
Workflow:
1. Collect yesterday's activity:
   - PRs created
   - PRs merged
   - Tasks completed
   - Tasks blocked
2. Generate standup report
3. Post to GitHub Discussions or Issue
4. Update team dashboard
```

### 3. Weekly Retrospective

**Schedule:** Sunday 21:00 JST (12:00 UTC)

```yaml
Workflow:
1. Collect week's metrics:
   - Tasks completed
   - Lines of code changed
   - Test coverage delta
   - Build success rate
2. Identify patterns
3. Suggest process improvements
4. Create retrospective issue
```

## Safeguards

### Budget Controls

```yaml
daily_limits:
  max_tasks: 3
  max_api_cost: $10
  max_lines_changed: 500

per_task_limits:
  max_api_cost: $3
  max_duration: 30min
  max_retries: 2
```

### Quality Gates

```yaml
auto_merge_requires:
  - CI passes
  - No CRITICAL code review issues
  - No security vulnerabilities
  - Test coverage >= 80%
  - PR size <= 300 lines
```

### Human Override

```yaml
pause_autonomous:
  - Label: "autonomous:pause" on any open issue
  - File: .github/PAUSE_AUTONOMOUS exists
  - More than 3 consecutive failed PRs

require_approval:
  - Changes to auth/payment code
  - Database schema changes
  - Infrastructure changes
  - Changes > 500 lines
```

## Task Sources (Priority Order)

1. **Beads tasks** (`.beads/issues.jsonl`) - Primary source
2. **Audit gaps** (from requirements-audit workflow)
3. **GitHub Issues** labeled `autonomous:ready`
4. **Technical debt** identified by code review

## Task Selection Algorithm

```python
def pick_next_task(tasks):
    # Filter
    eligible = [t for t in tasks if
        t.status == "open" and
        "blocked" not in t.labels and
        "wontfix" not in t.labels and
        "autonomous:skip" not in t.labels]

    # Sort by priority, then age
    sorted_tasks = sorted(eligible,
        key=lambda t: (t.priority, t.created_at))

    # Validate top task
    for task in sorted_tasks:
        if is_implementable(task):
            return task

    return None
```

## Implemented Features

### Phase 1: Basic Loop (DONE)

- [x] Autonomous developer workflow (`autonomous-developer.yml`)
- [x] Task picker from Beads (`scripts/autonomous-dev.ts`)
- [x] Basic PR creation with labels
- [x] Auto-merge after CI passes

### Phase 2: Self-Review (DONE)

- [x] Claude Code code review integration
- [x] Auto-merge for passing PRs
- [x] Pause mechanism (file + label)

### Phase 3: Reporting (DONE)

- [x] Daily standup workflow (`daily-standup.yml`)
- [x] Weekly retrospective (`weekly-retrospective.yml`)
- [x] CTO reports in `docs/team/cto/standups/` and `docs/team/cto/retrospectives/`
- [x] GitHub Issues for CTO review

### Phase 4: Advanced (TODO)

- [ ] Multi-task parallelization
- [ ] Learning from failed PRs
- [ ] Cost optimization
- [ ] Feature flag integration

## How to Control Autonomous Development

### Pause All Autonomous Activity

**Option 1: Create PAUSE file**

```bash
touch .github/PAUSE_AUTONOMOUS
git add .github/PAUSE_AUTONOMOUS
git commit -m "chore: pause autonomous development"
git push
```

**Option 2: Create issue with label**

```bash
gh issue create --title "Pause autonomous development" --label "autonomous:pause"
```

### Resume Autonomous Development

```bash
# Remove pause file
git rm .github/PAUSE_AUTONOMOUS
git commit -m "chore: resume autonomous development"
git push

# Or close the pause issue
gh issue close <issue-number>
```

### Skip Specific Tasks

Add label to task in Beads:

```bash
# Edit .beads/issues.jsonl and add "autonomous:skip" to labels array
```

### Force a Specific Task

Manually trigger with task ID:

```bash
gh workflow run autonomous-developer.yml -f force_task_id=tsumugi-abc123
```

### Dry Run (Test Mode)

```bash
gh workflow run autonomous-developer.yml -f dry_run=true
```

## Metrics to Track

| Metric               | Target | Measurement          |
| -------------------- | ------ | -------------------- |
| Tasks completed/week | 5+     | Beads status changes |
| PR success rate      | >80%   | Merged / Created     |
| Avg time to merge    | <2h    | PR creation to merge |
| Test coverage        | >80%   | Coverage report      |
| Build success rate   | >95%   | CI status            |
| API cost/task        | <$3    | Anthropic billing    |

## Files Structure

```
.github/
├── workflows/
│   ├── autonomous-developer.yml   # Main implementation loop
│   ├── daily-standup.yml          # Progress reporting
│   └── weekly-retrospective.yml   # Weekly summary
├── AUTONOMOUS_DEVELOPMENT.md      # This document
├── PAUSE_AUTONOMOUS               # Create to pause (empty file)
└── autonomous/
    ├── task-picker.ts             # Task selection logic
    ├── implementer.ts             # Claude Code orchestration
    └── reporter.ts                # Report generation
scripts/
├── autonomous-dev.ts              # Main orchestration script
└── generate-standup.ts            # Standup report generator
```

## Example Run

```
[06:00 UTC] Autonomous Developer starts
[06:01] Read 12 open tasks from Beads
[06:01] Filtered to 8 eligible tasks
[06:01] Selected: "Add property image carousel" (priority: 1)
[06:02] Created branch: auto/tsumugi-a3f2b1
[06:03] Claude Code analyzing task...
[06:05] Implementation started
[06:15] Code written, tests passing
[06:16] PR #142 created
[06:18] CI running...
[06:25] CI passed, code review: 0 CRITICAL, 1 MEDIUM
[06:25] Auto-merge triggered
[06:26] PR #142 merged
[06:26] Task marked as done in Beads
[06:27] Workflow complete. Cost: $1.82
```
