# tsumugi（紡ぎ）

> 住人の暮らしを引き継ぐプラットフォーム
> A platform for inheriting someone's living space and lifestyle

tsumugi connects people leaving their homes ("前の住人" - previous residents) with those looking to inherit not just a space, but a complete lifestyle. Furniture, neighborhood knowledge, daily routines - everything that makes a house a home.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Node Version:** 20
- **Package Manager:** npm

## Quick Start

### Prerequisites

This project uses VS Code devcontainers for a consistent development environment.

### Setup

1. Open this folder in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. Wait for the container to build (Claude Code CLI will auto-install)
4. Run `npm run dev` to start the development server at http://localhost:3000

## Development Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:e2e         # Run E2E tests with Playwright
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

## Automated Workflows

### Daily Requirements Audit

Runs daily at 9:00 AM JST via GitHub Actions:
1. Compares REQUIREMENTS.md / BUSINESS.md with actual code
2. Detects implementation gaps using Claude API
3. Creates Beads tasks for any gaps found
4. Auto-creates and merges PR if gaps exist

**Manual trigger:**
```bash
gh workflow run "Requirements Audit"
```

## Documentation

- `CLAUDE.md` - Development guide (commands, tools, workflows)
- `.claude/PROJECT.md` - Project specification (concept, design principles)
- `.claude/BUSINESS.md` - Business logic (pricing, inheritance flow)
- `.devcontainer/WORKTREE.md` - Git worktree documentation
