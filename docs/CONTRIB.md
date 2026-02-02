# Contributing Guide

This guide covers the development workflow, tools, and best practices for contributing to tsumugi.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Environment Setup](#environment-setup)
- [Testing Procedures](#testing-procedures)
- [Git Workflow](#git-workflow)
- [Code Quality](#code-quality)

## Development Workflow

### Quick Start

1. **Open in devcontainer**
   ```bash
   ./dev  # Opens VS Code devcontainer with Claude Code auto-started
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun dev
   ```

4. **Open browser**
   - Navigate to http://localhost:3000

### Git Worktrees for Isolated Development

**Always use git worktrees to prevent accidental file inclusion in commits.**

**When to use worktrees:**
- ANY other modified files exist in your workspace
- Making documentation updates
- Implementing features or bug fixes
- Working on multiple branches simultaneously

**Workflow:**

```bash
# 1. Create worktree FIRST (before making changes)
npm run worktree:create feature-name

# 2. Navigate to worktree
cd .worktrees/feature-name

# 3. Make your changes in isolation

# 4. Stage ONLY the files you changed
git add <specific-file>

# 5. Verify (CRITICAL - must show only your intended changes)
git status

# 6. Commit, push, create PR
git commit -m "feat: description"
git push -u origin HEAD
gh pr create --title "..." --body "..."

# 7. Wait for CI to pass
gh pr checks

# 8. Merge after CI passes
gh pr merge <number> --squash --delete-branch

# 9. Return to main workspace
cd /workspaces/tsumugi

# 10. Clean up worktree
git worktree remove .worktrees/feature-name
git pull origin main
```

See `.devcontainer/WORKTREE.md` for detailed documentation.

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `bun dev` | Start Next.js development server on http://localhost:3000 |
| `bun run build` | Build production bundle with optimizations |
| `bun start` | Start production server (requires `build` first) |

### Code Quality

| Command | Description |
|---------|-------------|
| `bun lint` | Run ESLint and Prettier checks on all files |
| `bun run format` | Auto-format all files with Prettier |
| `bun run format:check` | Check formatting without making changes |

### Testing

| Command | Description |
|---------|-------------|
| `bun test` | Run unit tests with Vitest |
| `bun run test:ui` | Run Vitest with interactive UI |

#### E2E Testing (Playwright)

| Command | Description |
|---------|-------------|
| `bun run test:e2e` | Run all E2E tests headless |
| `bun run test:e2e:headed` | Run E2E tests with browser visible |
| `bun run test:e2e:debug` | Run E2E tests in debug mode with Playwright Inspector |
| `bun run test:e2e:ui` | Run E2E tests with Playwright UI mode |
| `bun run test:e2e:report` | Show HTML test report from last run |

#### E2E Test Tag Filtering

| Command | Description |
|---------|-------------|
| `bun run test:e2e:critical` | Run only critical path tests (smoke + auth + checkout) |
| `bun run test:e2e:smoke` | Run smoke tests (basic functionality) |
| `bun run test:e2e:auth` | Run authentication tests |
| `bun run test:e2e:listing` | Run listing creation tests |
| `bun run test:e2e:properties` | Run property browsing tests |

### Git Worktrees

| Command | Description |
|---------|-------------|
| `npm run worktree:create` | Create new worktree with devcontainer support |
| `npm run worktree:list` | List all worktrees |
| `npm run worktree:prune` | Clean up removed worktrees |

### Branch Cleanup

| Command | Description |
|---------|-------------|
| `npm run cleanup:branches` | Delete merged and [gone] branches |
| `npm run cleanup:all` | Full cleanup (branches + worktrees + stashes) |

### Git Hooks

| Command | Description |
|---------|-------------|
| `bun run prepare` | Configure git hooks path to `.githooks/` |

### Devcontainer

| Command | Description |
|---------|-------------|
| `./dev` | Open devcontainer with Claude Code (auto-starts) |
| `bun run shell` | Alias for `./dev` |

## Environment Setup

### Prerequisites

- **Docker Desktop** with 4GB swap minimum (prevents OOM kills during Claude sessions)
- **VS Code** with Dev Containers extension
- **Bun 1.x** (pre-installed in devcontainer)

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

#### Database Configuration (Required)

```bash
# Neon PostgreSQL connection string
# Get this from: https://neon.tech
DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require"
```

#### NextAuth.js Configuration (Required)

```bash
# Base URL for NextAuth
NEXTAUTH_URL="http://localhost:3000"

# Secret for JWT encryption
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
```

#### OAuth Providers (Optional)

```bash
# Google OAuth
# Get credentials from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Apple Sign In
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
```

#### AWS S3 Configuration (Optional - for image storage)

```bash
# AWS credentials from: https://console.aws.amazon.com/
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET_NAME="tsumugi-images"
```

#### Email Provider (Optional - for notifications)

```bash
# Resend API for transactional emails
# Get key from: https://resend.com/
RESEND_API_KEY=""
EMAIL_FROM="noreply@tsumugi.example.com"
```

#### AI Estimate Service (Optional)

```bash
# Anthropic API for AI-powered cost estimates
# Get key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=""

# Enable/disable AI estimates in UI
NEXT_PUBLIC_USE_AI_ESTIMATE="false"
```

#### Environment Mode

```bash
# Set to "production" for production builds
NODE_ENV="development"
```

#### Task Management (Required for Claude)

```bash
# Linear API for task tracking integration
# Required for automated task updates after meetings/features
LINEAR_API_KEY="your_linear_api_key"
```

**Load environment variables before running commands:**

```bash
source .env.local
```

## Testing Procedures

### Test-Driven Development (TDD)

This project follows TDD principles with 80%+ test coverage requirement.

**Mandatory workflow:**

1. **Write test first (RED)** - Write failing test that describes expected behavior
2. **Run test** - Verify it fails for the right reason
3. **Write minimal implementation (GREEN)** - Make the test pass
4. **Run test** - Verify it passes
5. **Refactor (IMPROVE)** - Clean up code while keeping tests green
6. **Verify coverage** - Ensure 80%+ coverage maintained

### Unit Tests

```bash
# Run all unit tests
bun test

# Run with UI
bun run test:ui

# Run specific test file
bun test src/lib/utils.test.ts
```

### Integration Tests

Integration tests are included in the main test suite:

```bash
bun test
```

### E2E Tests

**Run all tests:**

```bash
bun run test:e2e
```

**Run with browser visible:**

```bash
bun run test:e2e:headed
```

**Debug tests:**

```bash
bun run test:e2e:debug
```

**Run by tag:**

```bash
# Critical path only (fast smoke test for CI)
bun run test:e2e:critical

# Specific feature areas
bun run test:e2e:auth
bun run test:e2e:listing
bun run test:e2e:properties
```

**View test reports:**

```bash
bun run test:e2e:report
```

**CI/CD Integration:**

E2E tests run automatically on:
- Every PR
- Every push to main branch

Test reports are published to GitHub Pages:
- https://kokiebisu.github.io/tsumugi/e2e-reports/

### Test Coverage

**Check current coverage:**

```bash
bun test --coverage
```

**Minimum requirements:**
- **Overall:** 80%+ coverage
- **Unit tests:** All utilities, functions, components
- **Integration tests:** API endpoints, database operations
- **E2E tests:** Critical user flows

## Git Workflow

### Commit Message Format

Follow Conventional Commits:

```
<type>: <description>

<optional body>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation updates
- `test:` - Test additions/updates
- `chore:` - Build/tooling changes
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**

```bash
feat: add payment processing with Stripe
fix: resolve auth state hydration error
docs: update contributing guide
```

### Pull Request Workflow

**CRITICAL: Never stop until merge is complete.**

**Complete workflow (all steps required):**

1. Create/update PR
2. **Wait for CI checks to pass** (`gh pr checks`)
3. **Merge PR** (`gh pr merge <number> --squash --delete-branch`)
4. Switch to main (`git checkout main`)
5. Pull latest changes (`git pull origin main`)
6. Verify you're on main with latest code

**PR Requirements:**

- **Size limit:** Maximum ~300 lines of code per PR
- **Single responsibility:** One concern per PR
- **CI checks:** All checks must pass before merge
- **No breaking changes** without user approval

**Auto-merge after CI (default):**

Merge immediately after CI passes for:
- Docs updates
- Config changes
- Bug fixes (small, non-breaking)
- Small features (non-breaking, tests pass)
- Refactoring (no behavior changes)
- Test additions
- Dependency updates

**Wait for user approval only for:**
- Breaking changes affecting existing APIs
- Major architectural decisions
- Large features (10+ files)
- Changes requiring user input on approach

### Branch Cleanup

**Automated cleanup:**

- **GitHub auto-delete:** Branches deleted after PR merge
- **GitHub Actions:** Daily cleanup at 00:00 UTC
- **Manual trigger:** `gh workflow run "Cleanup Merged Branches"`

**Local cleanup:**

```bash
# Delete merged and [gone] branches
npm run cleanup:branches

# Full cleanup (branches + worktrees + stashes)
npm run cleanup:all
```

## Code Quality

### Immutability (CRITICAL)

**Always create new objects, NEVER mutate:**

```javascript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name; // MUTATION!
  return user;
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name,
  };
}
```

### File Organization

**Many small files > few large files:**

- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Extract utilities from large components
- Organize by feature/domain, not by type

### Error Handling

**Always handle errors comprehensively:**

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Detailed user-friendly message');
}
```

### Input Validation

**Always validate user input:**

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150),
});

const validated = schema.parse(input);
```

### Code Quality Checklist

Before marking work complete:

- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No mutation (immutable patterns used)
- [ ] Tests written and passing
- [ ] 80%+ test coverage maintained

## Task Management

### Beads Task Tracker

Use Beads for AI-friendly task tracking:

```bash
# Show available tasks
bd ready

# Create new task
bd create "Task description"

# Show task details
bd show <id>

# Mark task complete
bd done <id>

# Get JSON output for agents
bd status --json
```

Tasks are stored in `.beads/` and shared across git worktrees.

### Linear Integration (CRITICAL)

**Always update Linear when completing tasks.**

**Load environment variables:**

```bash
source .env.local
```

**Update task to Done:**

```bash
# Get open tasks
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { issues(filter: { state: { name: { nin: [\"Done\", \"Canceled\"] } } }) { nodes { id title state { name } } } }"}' \
  https://api.linear.app/graphql | jq -r '.data.issues.nodes[] | "\(.id) - \(.title)"'

# Update task to Done (replace TASK_ID)
DONE_STATE_ID=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{"query":"query { workflowStates { nodes { id name } } }"}' \
  https://api.linear.app/graphql | jq -r '.data.workflowStates.nodes[] | select(.name == "Done") | .id' | head -1)

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d "{\"query\":\"mutation { issueUpdate(id: \\\"TASK_ID\\\", input: { stateId: \\\"$DONE_STATE_ID\\\" }) { success issue { title state { name } } } }\"}" \
  https://api.linear.app/graphql
```

See `.claude/rules/task-management.md` for detailed workflow.

## Development Tools

### Claude Code CLI

Pre-configured in devcontainer with persistent authentication:

- **Config:** Mounted from `~/.claude` on host
- **Authentication:** One-time browser auth persists permanently
- **Plugins:** superpowers, context7, typescript-lsp, ralph-loop, code-review, security-guidance

**Auto-starts** when opening devcontainer via `./dev`.

### Beads Task Tracker

AI-friendly task tracking with dependency management. Tasks stored in `.beads/` and shared across worktrees.

See [Beads documentation](https://github.com/steveyegge/beads) for details.

## Related Documentation

- `CLAUDE.md` - Project memory bank with quick reference
- `.claude/PROJECT.md` - Project specification
- `.claude/BUSINESS.md` - Business logic specification
- `.claude/rules/` - Development rules and workflows
- `.devcontainer/WORKTREE.md` - Git worktree documentation
- `docs/RUNBOOK.md` - Operations and deployment guide
