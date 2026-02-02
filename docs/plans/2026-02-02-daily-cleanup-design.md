# Daily Codebase Cleanup System - Design Document

**Date:** 2026-02-02
**Status:** Approved
**Type:** Automation Feature

## Overview

Automated daily cleanup system that identifies and removes irrelevant files across three tiers: temporary files (immediate deletion), outdated documentation (archive then delete), and dead code (PR for review).

## Architecture

### Three-Tier Cleanup System

**Tier 1: Immediate Deletion (Pattern-Based)**
- **Targets:** Temporary test files (`TEST_*.md`, `test-results/**/error-context.md`), build artifacts
- **Detection:** Regex patterns and file age checks
- **Action:** Delete immediately, log in cleanup report
- **Risk:** Low (files are regenerated or clearly temporary)

**Tier 2: Archive & Delayed Deletion (AI-Assisted)**
- **Targets:** Documentation files in `docs/plans/`, `.claude/notes/`, old design docs
- **Detection:** Claude API analyzes content against git history and current codebase state
- **Action:** Move to `.archive/YYYY-MM-DD/`, delete after 30 days
- **Risk:** Medium (may contain useful context, so we archive first)

**Tier 3: Dead Code Review (Tool-Assisted)**
- **Targets:** Unused TypeScript files, unreferenced components, dead dependencies
- **Detection:** `knip` (dead code), `depcheck` (unused deps), `ts-prune` (unused exports)
- **Action:** Create PR with findings for manual review
- **Risk:** High (false positives possible, needs human judgment)

### Execution Schedule

- **When:** Daily at 00:00 UTC
- **Output:** Report at `.github/cleanups/YYYY-MM-DD.md`
- **Auto-merge:** Tiers 1-2 only (commit to cleanup branch and merge)
- **Manual review:** Tier 3 creates PR, never auto-merges

## Detection Logic

### Tier 1: Pattern-Based Detection

Simple file matching with exclusions:

```bash
# Delete patterns
TEST_*.md (root level only)
test-results/**/error-context.md
*.tmp, *.log (if older than 7 days)
.next/cache/* (if older than 14 days)

# Always preserve
test-results/index.html (Playwright report)
README.md, CLAUDE.md, LICENSE
```

### Tier 2: AI-Assisted Documentation Analysis

Uses Claude API (similar to requirements-audit.yml) to analyze each doc file:

```
Prompt: "Analyze this documentation file:
- Is it a completed implementation plan? (check git history for related commits)
- Does it reference features that are now built or abandoned?
- Is it older than 90 days with no recent references in code?
Output JSON: {\"should_archive\": true/false, \"reason\": \"...\"}"
```

Files scoring "should_archive" are moved to `.archive/YYYY-MM-DD/filename.md` with metadata. A cleanup job runs monthly to delete archives older than 30 days.

### Tier 3: Static Analysis Tools

Runs three tools in parallel:
- **knip** - Detects unused files, exports, dependencies
- **depcheck** - Finds unused npm packages
- **ts-prune** - Identifies unused TypeScript exports

Results are aggregated, deduplicated, and formatted into a PR with file-by-file explanations.

## Workflow Implementation

### GitHub Action Structure

**File:** `.github/workflows/daily-cleanup.yml`

```yaml
name: Daily Codebase Cleanup

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  cleanup:
    runs-on: ubuntu-latest
    env:
      CLEANUP_DATE: ""
      BRANCH_NAME: ""
    steps:
      # Setup: checkout, install deps, set date
      # Tier 1: Pattern-based deletion
      # Tier 2: AI-assisted archival
      # Tier 3: Dead code analysis
      # Generate report & commit
      # Auto-merge (Tiers 1-2 only)
```

### Execution Flow

1. **Tier 1 (2-3 min):** Run pattern matching, delete files, log to report
2. **Tier 2 (5-7 min):** Collect docs → batch API call to Claude → move to archive
3. **Tier 3 (3-5 min):** Run knip/depcheck/ts-prune → parse results → format PR body
4. **Commit & Report:** Create `.github/cleanups/YYYY-MM-DD.md` with summary
5. **Auto-merge:** If only Tiers 1-2 ran, merge cleanup branch immediately
6. **Manual PR:** If Tier 3 found dead code, create separate PR for review

### Monthly Archive Cleanup

**File:** `.github/workflows/monthly-archive-cleanup.yml`

Runs on the 1st of each month, deletes `.archive/*` folders older than 30 days.

## Configuration

### Configuration File

**File:** `.github/cleanup-config.json`

```json
{
  "tier1": {
    "patterns": [
      "TEST_*.md",
      "test-results/**/error-context.md",
      "**/*.tmp",
      "**/*.log"
    ],
    "age_threshold_days": 7,
    "exclude": ["README.md", "CLAUDE.md", "LICENSE"]
  },
  "tier2": {
    "target_paths": ["docs/plans/", ".claude/notes/"],
    "age_threshold_days": 90,
    "archive_retention_days": 30,
    "ai_model": "claude-sonnet-4-20250514"
  },
  "tier3": {
    "enabled": true,
    "tools": ["knip", "depcheck", "ts-prune"],
    "confidence_threshold": "high"
  }
}
```

### Safety Mechanisms

1. **Dry-run mode:** Set `DRY_RUN=true` in workflow_dispatch to preview without changes
2. **Gitignore check:** Never delete files tracked in git without committing removal
3. **Size limits:** Skip files >100KB for AI analysis (likely not documentation)
4. **Whitelist:** Always preserve files matching critical patterns (package.json, tsconfig.json, etc.)
5. **Archive recovery:** `.archive/` commits include full file content, allowing easy restoration
6. **PR review required:** Tier 3 (dead code) NEVER auto-merges

### Manual Override

Run locally with interactive prompts:
```bash
npm run cleanup:manual
```

## Integration

### Integration with Existing Systems

1. **Beads Task Tracker:** When Tier 3 finds dead code, optionally create Beads tasks:
   ```bash
   bd create "Review dead code: src/components/OldComponent.tsx"
   ```

2. **Requirements Audit:** Share the same Claude API key (`ANTHROPIC_API_KEY` secret), similar report format

3. **Branch Cleanup:** Leverage existing `cleanup:branches` script pattern for consistency

### Cleanup Report Format

**File:** `.github/cleanups/YYYY-MM-DD.md`

```markdown
# Cleanup Report 2026-02-02

## Summary
- **Tier 1:** 5 files deleted (12.3 KB freed)
- **Tier 2:** 3 files archived
- **Tier 3:** 2 unused files found (PR #123 created)

## Tier 1: Immediate Deletion
- ✓ TEST_FIXES.md (2.1 KB)
- ✓ TEST_RESULTS_FINAL.md (3.4 KB)
- ✓ test-results/auth-*/error-context.md (15 files, 6.8 KB)

## Tier 2: Archived
- 📦 docs/plans/2026-01-15-old-feature.md → .archive/2026-02-02/
  Reason: Feature completed in commit abc123

## Tier 3: Dead Code Review
- PR #123: Review 2 unused exports in src/lib/
```

### Notifications

- GitHub Actions summary shows cleanup stats
- PR created for Tier 3 triggers normal review workflow
- Silent operation if nothing to clean

## Dependencies

### New npm Packages (devDependencies)

```json
{
  "knip": "latest",
  "depcheck": "latest",
  "ts-prune": "latest"
}
```

### GitHub Secrets Required

- `ANTHROPIC_API_KEY` (already exists for requirements-audit)
- `GITHUB_TOKEN` (automatically provided by GitHub Actions)

## Implementation Phases

### Phase 1: Tier 1 (Pattern-Based Cleanup)
- Implement pattern matching logic
- Create basic workflow structure
- Test with dry-run mode
- Deploy and monitor for 1 week

### Phase 2: Tier 2 (AI-Assisted Documentation)
- Add Claude API integration
- Implement archival system
- Create monthly cleanup workflow
- Test with dry-run mode

### Phase 3: Tier 3 (Dead Code Analysis)
- Install and configure static analysis tools
- Implement PR generation logic
- Test with various code patterns
- Fine-tune confidence thresholds

### Phase 4: Integration & Polish
- Add Beads integration
- Create npm scripts
- Update CLAUDE.md documentation
- Create user guide

## Success Metrics

- **Storage reduction:** Track codebase size reduction over time
- **False positives:** Monitor Tier 3 PR accuracy (target <5% false positives)
- **Time savings:** Measure time spent on manual cleanup before/after
- **Archive recovery:** Track how often archived files are restored (should be <2%)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Accidental deletion of important files | Whitelist system, archive before delete, git history preservation |
| AI misclassification of docs | Archive instead of delete, 30-day retention, easy restoration |
| Static analysis false positives | Manual PR review required, no auto-merge for Tier 3 |
| API costs for Claude | Batch requests, cache results, skip large files |
| Workflow timeout | Set 30-min timeout, split into separate jobs if needed |

## Future Enhancements

- **Smart scheduling:** Run more frequently during active development, less during quiet periods
- **ML learning:** Train on user's archive restoration patterns to improve AI accuracy
- **Workspace awareness:** Detect and preserve files in active git worktrees
- **Interactive mode:** Web UI for reviewing cleanup decisions before execution
