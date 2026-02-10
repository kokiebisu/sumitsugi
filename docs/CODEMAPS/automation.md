# Automation & Workflows Map

> Last updated: 2026-02-10

## GitHub Actions Workflows

```
.github/workflows/
├── ci.yml                      # CI: lint + types + unit tests + bundle size (on PR/push main)
├── e2e-tests.yml               # E2E: Playwright (smart label filtering)
├── autonomous-developer.yml    # Every 4h: pick task → Claude Code → PR (retry + escalation)
├── autonomous-pr-review.yml    # Auto-review + merge PRs after CI passes
├── auto-label.yml              # Auto-label PRs by file path, title convention, size
├── daily-standup.yml           # Daily 09:00 JST: metrics → Claude report → issue
├── weekly-retrospective.yml    # Sundays 21:00 JST: week review → issue
├── daily-knowledge-update.yml  # Daily 09:00 JST: knowledge base refresh
├── requirements-audit.yml      # Daily: code↔requirements drift check
├── health-monitor.yml          # Weekly: workflow health + stale PR detection
├── stale.yml                   # Daily: auto-close stale issues (30d) and PRs (14d)
├── cleanup-branches.yml        # Daily: remove merged branches
├── claude-code-review.yml      # @claude mentions → code review
└── claude.yml                  # General Claude Code integration

.github/
├── dependabot.yml              # Weekly npm + GitHub Actions dependency updates
├── CODEOWNERS                  # Auto-assign reviewers by file path
├── pull_request_template.md    # PR template with checklist
└── ISSUE_TEMPLATE/
    ├── bug_report.md           # Bug report template
    └── feature_request.md      # Feature request template
```

## Autonomous Development Loop

```
[Beads Task Queue] → autonomous-developer.yml (every 4h)
        ↓
    Pick ready task (scripts/autonomous-dev.ts)
        ↓
    Claude Code executes (50 turns max)
        ↓
    Creates PR with changes
        ↓
    autonomous-pr-review.yml triggers
        ↓
    Wait for CI → Claude reviews → Auto-merge (if clean)
        ↓
    Notify Slack + update state.json
```

## Pause Mechanisms

- File: `.github/PAUSE_AUTONOMOUS` (create to pause, delete to resume)
- Label: `autonomous:pause` on any open issue
- PR label: `no-auto-merge` to skip auto-review

## Task Tracking Integration

```
Beads (.beads/)                  Linear (cloud)
  ├── issues.jsonl          ←→  ./scripts/linear-list.sh
  ├── interactions.jsonl         ./scripts/linear-done.sh TSU-xxx
  └── metadata.json              ./scripts/linear-set-project.sh

  bd ready / bd create           Sync: bd linear sync --push --create-only
  bd close <id>
```

## Scripts

```
scripts/
├── autonomous-dev.ts           # Task picker for autonomous workflow
├── daily-knowledge-update.ts   # Knowledge base updater
├── db-migrate.ts               # Database migration runner
├── generate-slides.ts          # Pitch deck generator
├── cleanup-branches.sh         # Git branch cleanup
├── create-worktree.sh          # Git worktree helper
├── setup-git-hooks.sh          # Post-merge hook installer
├── notify-slack.sh             # Slack webhook notifier
├── localstack-init.sh          # LocalStack S3 bucket setup
├── detect-test-tags.js         # E2E test tag detector
├── linear-list.sh              # Linear: list open issues
├── linear-done.sh              # Linear: mark issues done
├── linear-set-project.sh       # Linear: route to Dev/Business project
└── linear-comment.sh           # Linear: add comments
```

## Quality Gates

| Gate | Trigger | Action |
|------|---------|--------|
| Pre-commit hook | `git commit` | Prettier + ESLint + secret scan + console.log check |
| CI | PR/push | ESLint + TypeScript + unit tests + bundle size |
| Auto-label | PR open/sync | Labels by file path, title convention, size → triggers E2E |
| E2E | PR labels (auto) | Playwright (smart filtering) |
| Code review | `@claude` / auto | Claude Code review |
| Requirements audit | Daily | Drift detection + task creation |
| Health monitor | Weekly | Workflow success rates + stale PR alerts |
| Stale bot | Daily | Auto-close inactive issues (30d) + PRs (14d) |
| Dependabot | Weekly | npm + GitHub Actions dependency updates |
| CODEOWNERS | PR open | Auto-assign reviewers by file path |

## Claude Code Configuration

```
.claude/
├── settings.json       # Permissions, plugins, MCP servers
├── hooks/
│   └── SessionStart.md # Environment setup for web sessions
├── rules/
│   ├── standards.md    # Coding standards (immutability, TDD, security)
│   └── workflow.md     # Git worktree, PR, task completion rules
├── skills/             # Reusable skills (tdd, security, build-fix, qa, etc.)
├── commands/           # Slash commands (meeting, plan, pr, team, work, etc.)
├── agents/             # Agent definitions (code-reviewer, planner, etc.)
├── PROJECT.md          # Concept & design principles
└── BUSINESS.md         # Pricing & handover flow
```
