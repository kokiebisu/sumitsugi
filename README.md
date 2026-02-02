# tsumugi（紡ぎ）

> 住人の暮らしを引き継ぐプラットフォーム
> A platform for inheriting someone's living space and lifestyle

tsumugi connects people leaving their homes ("前の住人" - previous residents) with those looking to inherit not just a space, but a complete lifestyle. Furniture, neighborhood knowledge, daily routines - everything that makes a house a home.

## Key Features

- **Property Listings:** Browse and search properties with detailed information and photos
- **Lifestyle Inheritance:** Transfer not just furniture, but neighborhood knowledge and daily routines
- **Secure Payments:** Stripe integration for safe and reliable transactions
- **Authentication:** SSR/hydration-compatible auth system with persistent state
- **Executive Personas:** AI-driven knowledge base and self-growth capabilities for platform intelligence
- **Responsive Design:** Mobile-first, Airbnb-inspired clean interface

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Runtime:** Bun 1.x (migrated from Node.js for improved performance)
- **Package Manager:** bun
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Payment:** Stripe integration for secure transactions

## Quick Start

1. Clone the repo
2. Run `./dev` to enter devcontainer (Claude Code starts automatically)
3. Inside container: `bun dev`
4. Open http://localhost:3000

## Detailed Setup

### Prerequisites

This project uses VS Code devcontainers for a consistent development environment.

**Required Docker Configuration:**
- **Swap:** 4GB minimum (prevents OOM kills during Claude sessions)
  - Docker Desktop: Settings → Resources → Swap → Set to 4GB
  - Background services (TypeScript, ESLint) and Claude sessions can consume significant memory
  - Default 1GB swap causes "killed" errors when running multiple sessions

### Setup

1. Open this folder in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. Wait for the container to build (Bun and Claude Code are pre-installed and auto-start)
4. Run `bun dev` to start the development server at http://localhost:3000

**Note:** Bun runtime is pre-configured in the devcontainer. For local development outside the container, install Bun from https://bun.sh

## Development Commands

```bash
bun dev                  # Start development server (localhost:3000)
bun run build            # Production build
bun start                # Start production server
bun lint                 # Run ESLint
bun test                 # Run tests
bun run test:e2e         # Run E2E tests with Playwright

# Git Worktrees (for isolated development)
npm run worktree:create  # Create new worktree with branch
npm run worktree:list    # List all worktrees
npm run worktree:prune   # Clean up removed worktrees

# Branch Cleanup (automated)
npm run cleanup:branches # Delete merged and [gone] branches
npm run cleanup:all      # Full cleanup (branches + worktrees + stashes)
```

## Development Tools

### Beads Task Tracker

AI-friendly task tracking with dependency management:

```bash
bd ready              # Show tasks with no blockers
bd create "Task"      # Create new task
bd status --json      # Get JSON output for agents
bd done <id>          # Mark task complete
bd show <id>          # Show task details and dependencies
```

Tasks are stored in `.beads/` and shared across git worktrees. [Learn more](https://github.com/steveyegge/beads)

### Claude Code CLI

Auto-installed in the devcontainer with persistent authentication:

- Config directory (`~/.claude`) mounted from host machine
- One-time browser authentication persists permanently
- Pre-configured with plugins: superpowers, context7, typescript-lsp, ralph-loop, code-review, and more
- See `.claude/settings.json` for full plugin list

### E2E Test Reports

View latest test results with screenshots, videos, and traces:
- **GitHub Pages:** https://kokiebisu.github.io/tsumugi/e2e-reports/

Tests run automatically on every PR and push to main.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── properties/       # Property listings & details
│   ├── listing/          # Listing management for previous residents
│   └── account/          # User account pages
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── listing/          # Listing creation flow
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication state management
└── lib/                  # Utilities & data layer
    ├── data.ts           # Property data & type definitions
    ├── utils.ts          # Utility functions
    └── site-config.ts    # Site configuration
```

## Environment Variables

Create a `.env.local` file for sensitive data:

```bash
LINEAR_API_KEY=your_key_here    # Linear API for issue tracking sync
```

Load before running commands that need API keys:
```bash
source .env.local
```

## Git Workflow

### Git Worktrees

This project uses git worktrees for isolated development to prevent accidental file inclusion in commits:

**When to use worktrees:**
- Implementing features or fixes when other files are modified
- Making changes that should be isolated from current workspace
- Working on multiple branches simultaneously

**Workflow:**
```bash
# Create worktree for new branch
npm run worktree:create feature-name

# Navigate to worktree
cd .worktrees/feature-name

# Make changes, commit, push
git add <specific-files>
git commit -m "feat: description"
git push -u origin HEAD

# Return to main workspace
cd /workspaces/tsumugi

# Clean up after PR is merged
git worktree remove .worktrees/feature-name
```

See `.devcontainer/WORKTREE.md` for detailed documentation.

### Automated Branch Cleanup

**GitHub auto-delete:** Branches are automatically deleted after PR merge on GitHub.

**Daily cleanup (GitHub Actions):**
- Runs daily at 00:00 UTC
- Deletes merged branches and branches marked as [gone]
- Can be manually triggered: `gh workflow run "Cleanup Merged Branches"`

**Local cleanup:**
```bash
npm run cleanup:branches  # Delete merged and [gone] branches
npm run cleanup:all       # Full cleanup (branches + worktrees + stashes)
```

## Automated Workflows

### Daily Requirements Audit

Runs daily at 9:00 AM JST via GitHub Actions:
1. Compares REQUIREMENTS.md / BUSINESS.md with actual code using Claude API
2. Detects implementation gaps
3. Creates Beads tasks for any gaps found
4. Auto-creates PR with gap report (only if gaps exist)
5. Auto-merges PR after creation
6. Skips PR creation entirely if no gaps found

**Manual trigger:**
```bash
gh workflow run "Requirements Audit"
```

**Required secret:** `ANTHROPIC_API_KEY` must be configured in repository settings

## Documentation

- `CLAUDE.md` - Development guide (commands, tools, workflows)
- `.claude/PROJECT.md` - Project specification (concept, design principles)
- `.claude/BUSINESS.md` - Business logic (pricing, inheritance flow)
- `.devcontainer/WORKTREE.md` - Git worktree documentation
