# sumitsugi（住み継ぎ）

> 住人の暮らしを引き継ぐプラットフォーム
> A platform for inheriting someone's living space and lifestyle

sumitsugi connects people leaving their homes ("前の住人" - previous residents) with those looking to inherit not just a space, but a complete lifestyle. Furniture, neighborhood knowledge, daily routines - everything that makes a house a home.

## Key Features

- **Property Listings:** Browse and search properties with detailed information and photos
- **Lifestyle Inheritance:** Transfer not just furniture, but neighborhood knowledge and daily routines
- **Inquiry & Agreement Flow:** Submit inquiries, schedule viewings, and sign digital agreements
- **Secure Payments:** Stripe Checkout with escrow — funds held until viewing completion
- **Seller Payouts:** Stripe Connect for direct seller payouts
- **AI Estimates:** Anthropic-powered property value estimates (optional)
- **Image Upload:** Cloudflare R2 storage (LocalStack for local development)
- **Authentication:** Better-auth with email/password and OAuth (Google, Apple)
- **Admin Dashboard:** Manage listings, inquiries, and users
- **Responsive Design:** Mobile-first, Airbnb-inspired clean interface

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Runtime:** Bun 1.x
- **Package Manager:** bun
- **Database:** PostgreSQL (Neon in production)
- **ORM:** Drizzle ORM
- **Auth:** Better-auth with OAuth providers
- **Payments:** Stripe (Checkout + Connect)
- **Storage:** Cloudflare R2 / LocalStack (S3-compatible)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Testing:** Vitest (unit) + Playwright (E2E)

## Quick Start

1. Clone the repo
2. Run `./dev` to enter devcontainer (Claude Code starts automatically)
3. Copy `.env.example` to `.env.local` and configure
4. Run `bun run db:up && bun run db:migrate` to set up the database
5. Run `bun dev`
6. Open http://localhost:3000

## Setup

### Prerequisites

This project uses VS Code devcontainers for a consistent development environment.

**Required Docker Configuration:**

- **Swap:** 4GB minimum (prevents OOM kills during Claude sessions)
  - Docker Desktop: Settings → Resources → Swap → Set to 4GB
  - Background services (TypeScript, ESLint) and Claude sessions can consume significant memory
  - Default 1GB swap causes "killed" errors when running multiple sessions

### Devcontainer Setup

1. Open this folder in VS Code
2. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
3. Wait for the container to build (Bun, Claude Code, PostgreSQL, and LocalStack are pre-configured)
4. Copy `.env.example` to `.env.local` and fill in required values
5. Run `bun run db:up && bun run db:migrate` to initialize the database
6. Run `bun dev` to start the development server at http://localhost:3000

**Note:** For local development outside the container, install Bun from https://bun.sh

### Devcontainer Services

The devcontainer includes:

- **Bun runtime** (pre-installed)
- **Claude Code CLI** (auto-starts, auth persisted via mounted `~/.claude`)
- **PostgreSQL** (Docker service, port 5432)
- **LocalStack** (S3 emulation for local file uploads, port 4566)

## Development Commands

```bash
# Server
bun dev                  # Start dev server (localhost:3000)
bun run build            # Production build
bun start                # Start production server
bun lint                 # Run ESLint + Prettier check

# Code Formatting
bun run format           # Format all files with Prettier
bun run format:check     # Check formatting without changes

# Database
bun run db:up            # Start PostgreSQL (Docker)
bun run db:down          # Stop PostgreSQL
bun run db:generate      # Generate migrations from schema
bun run db:migrate       # Run pending migrations
bun run db:push          # Push schema changes (dev only)
bun run db:studio        # Open Drizzle Studio (GUI)
bun run db:reset         # Reset database (drop + recreate + migrate)

# Unit Tests (IMPORTANT: Use "bun run test", NOT "bun test")
bun run test             # Run unit tests with Vitest (watch mode)
bun run test:run         # Run unit tests once and exit
bun run test:ui          # Run tests with Vitest UI

# E2E Tests (Playwright)
bun run test:e2e:install # Install Playwright Chromium (required before first run)
bun run test:e2e         # Run all E2E tests
bun run test:e2e:headed  # Run with browser visible
bun run test:e2e:debug   # Run in debug mode
bun run test:e2e:ui      # Run with Playwright UI
bun run test:e2e:report  # View last test report
bun run test:e2e:critical # Run @critical tests only
bun run test:e2e:smoke   # Run @smoke tests only
bun run test:e2e:auth    # Run @auth tests only
bun run test:e2e:listing # Run @listing tests only
bun run test:e2e:properties # Run @properties tests only

# Git Worktrees
bun run worktree:create  # Create new worktree with branch
bun run worktree:list    # List all worktrees
bun run worktree:prune   # Clean up removed worktrees

# Branch Cleanup
bun run cleanup:branches # Delete merged and [gone] branches
bun run cleanup:all      # Full cleanup (branches + worktrees + stashes)
```

## Database

### Schema

Tables defined in `src/db/schema/`:

| Table        | Description                     |
| ------------ | ------------------------------- |
| `users`      | User accounts                   |
| `sessions`   | Auth sessions                   |
| `properties` | Property listings               |
| `inquiries`  | Inquiry submissions from buyers |
| `payments`   | Payment records                 |

### Local Database

PostgreSQL runs via Docker Compose:

```bash
bun run db:up       # Start on port 5432
bun run db:migrate  # Run migrations
bun run db:studio   # Open GUI at https://local.drizzle.studio
```

Default connection string (in `.env.example`):

```
DATABASE_URL="postgresql://sumitsugi:sumitsugi@localhost:5432/sumitsugi"
```

## API Routes

| Endpoint                              | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| `/api/auth/[...all]`                  | Better-auth endpoints (signup, signin, signout, session) |
| `GET/POST /api/properties`            | List / create properties                                 |
| `GET/PUT/DELETE /api/properties/[id]` | Property CRUD by ID                                      |
| `POST/DELETE /api/upload`             | Presigned URLs for image upload (R2 / LocalStack)        |
| `POST /api/estimate`                  | AI-powered estimate calculation                          |
| `POST /api/webhooks/stripe`           | Stripe webhook handler                                   |

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

```bash
# Database (required)
DATABASE_URL="postgresql://sumitsugi:sumitsugi@localhost:5432/sumitsugi"

# Auth (required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"        # openssl rand -base64 32

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# Image Storage - LocalStack (local dev, starts with devcontainer)
S3_ENDPOINT="http://localhost:4566"

# Image Storage - Cloudflare R2 (production)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="sumitsugi"
R2_PUBLIC_URL=""

# Stripe (for payments)
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Email (optional)
RESEND_API_KEY=""
EMAIL_FROM="noreply@sumitsugi.example.com"

# AI Estimates (optional)
ANTHROPIC_API_KEY=""
NEXT_PUBLIC_USE_AI_ESTIMATE="false"

# Linear (task tracking)
LINEAR_API_KEY=""
LINEAR_TEAM_ID=""
```

See `.env.example` for full details and links.

## Testing

### Unit Tests (Vitest)

```bash
bun run test         # Watch mode
bun run test:run     # Run once and exit
```

Test files located in `__tests__/` directories alongside source:

- `src/app/api/properties/__tests__/` — API route tests
- `src/app/api/webhooks/stripe/__tests__/` — Webhook tests
- `src/app/actions/__tests__/` — Server action tests
- `src/lib/stripe/__tests__/` — Stripe calculation tests
- `src/db/schema/__tests__/` — Schema tests

### E2E Tests (Playwright)

```bash
bun run test:e2e:install  # First-time browser setup
bun run test:e2e          # Run all tests
```

Test suites in `tests/e2e/`:

- `auth/` — Authentication & signup flows
- `payment/` — Stripe payment & security tests
- `properties/` — Property browsing & details
- `listing/` — Listing creation & management
- `inquiry/` — Inquiry submission & agreements
- `dashboard/` — User dashboard
- `account/` — Account management

Test tags: `@critical`, `@smoke`, `@auth`, `@listing`, `@properties`, `@payment`

View latest reports: https://kokiebisu.github.io/sumitsugi/e2e-reports/

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   ├── actions/                # Server actions (payment, escrow, stripe-connect)
│   ├── api/
│   │   ├── auth/[...all]/      # Better-auth endpoints
│   │   ├── estimate/           # AI estimate endpoint
│   │   ├── properties/         # Property CRUD
│   │   ├── upload/             # Image upload (presigned URLs)
│   │   └── webhooks/stripe/    # Stripe webhooks
│   ├── properties/             # Property browsing & detail pages
│   ├── listing/                # Listing management (create, edit, preview)
│   ├── listings/               # Public listing views & inquiry submission
│   ├── account/                # User account & settings
│   ├── dashboard/              # User dashboard
│   ├── admin/                  # Admin panel
│   ├── creator/                # Creator interface
│   ├── hosting/                # Hosting creation flow
│   ├── inquiry/                # Inquiry details & agreement flow
│   ├── agreements/             # Agreement viewing & PDF export
│   ├── privacy/                # Privacy policy
│   └── terms/                  # Terms of service
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── auth/                   # Auth dialogs & become-seller flow
│   ├── listing/                # Listing creation flow
│   ├── payment/                # Payment forms & fee breakdown
│   └── admin/                  # Admin components
├── contexts/
│   └── auth-context.tsx        # Authentication state management
├── db/
│   ├── schema/                 # Drizzle schema (users, properties, inquiries, payments)
│   ├── migrations/             # SQL migrations
│   └── index.ts                # Database client
└── lib/
    ├── data.ts                 # Mock data & type definitions
    ├── types.ts                # Shared TypeScript types
    ├── utils.ts                # Utility functions
    ├── site-config.ts          # Site configuration
    ├── auth.ts                 # Better-auth server config
    ├── auth-client.ts          # Better-auth client
    ├── auth-provider.tsx       # Auth provider component
    ├── r2.ts                   # Cloudflare R2 / LocalStack S3 client
    ├── upload.ts               # File upload utilities
    ├── estimate-service.ts     # AI estimate calculation
    ├── geocoding-service.ts    # Geocoding utilities
    ├── station-data.ts         # Railway station data
    └── stripe/                 # Stripe integration
        ├── calculations.ts     # Fee calculations
        ├── client.ts           # Client-side Stripe
        ├── config.ts           # Stripe configuration
        └── server.ts           # Server-side Stripe
```

## CI/CD & Automated Workflows

### E2E Tests (`e2e-tests.yml`)

Runs on PRs and pushes to main. Supports tag-based filtering via PR labels:

- `e2e:run` / `e2e:full-suite` — Run all tests
- `e2e:critical-only` — Run only `@critical` tests
- No label — Auto-detect based on changed files

Publishes reports with screenshots, videos, and traces to GitHub Pages.

### Code Review (`claude-code-review.yml`)

Automated code review on PR open/sync via Claude Code.

### Claude Integration (`claude.yml`)

Responds to `@claude` mentions in issues, PRs, and comments.

### Requirements Audit (`requirements-audit.yml`)

Daily at 9:00 AM JST. Compares REQUIREMENTS.md with code, creates tasks for gaps.

```bash
gh workflow run "Requirements Audit"  # Manual trigger
```

### Branch Cleanup (`cleanup-branches.yml`)

Daily at 00:00 UTC. Deletes merged and `[gone]` branches.

```bash
gh workflow run "Cleanup Merged Branches"  # Manual trigger
```

### Knowledge Update (`daily-knowledge-update.yml`)

Daily at 9:00 AM JST. Updates team knowledge base in `docs/team/`.

## Development Tools

### Beads Task Tracker

AI-friendly task tracking with dependency management:

```bash
bd ready              # Show tasks with no blockers
bd create "Task"      # Create new task
bd status --json      # Get JSON output for agents
bd done <id>          # Mark task complete
```

Tasks stored in `.beads/` and shared across worktrees. [Learn more](https://github.com/steveyegge/beads)

### Claude Code CLI

Auto-installed in the devcontainer with persistent authentication:

- Config directory (`~/.claude`) mounted from host machine
- One-time browser authentication persists permanently
- Pre-configured with plugins (see `.claude/settings.json`)

### Git Hooks

Pre-commit hook (configured via `.githooks/`):

- Prettier formatting check
- ESLint linting

Set up automatically by `bun run prepare`.

### Linear Integration

```bash
./scripts/linear-list.sh              # List open tasks
./scripts/linear-done.sh TSU-123      # Mark task as done
./scripts/linear-comment.sh TSU-123 "message"  # Add comment
```

## Git Workflow

### Git Worktrees

This project uses git worktrees for isolated development:

```bash
bun run worktree:create feature-name   # Create worktree
cd .worktrees/feature-name             # Navigate to it
# ... make changes, commit, push, create PR ...
cd /workspaces/sumitsugi                 # Return to main
git worktree remove .worktrees/feature-name  # Clean up
```

See [.devcontainer/WORKTREE.md](.devcontainer/WORKTREE.md) for details.

### Automated Branch Cleanup

- **GitHub auto-delete:** Branches deleted after PR merge
- **Daily cleanup (Actions):** Merged and `[gone]` branches removed at 00:00 UTC
- **Local:** `bun run cleanup:branches` or `bun run cleanup:all`

## Documentation

### Development

- [CLAUDE.md](CLAUDE.md) — Development guide (commands, tools, workflows)
- [DASHBOARD.md](DASHBOARD.md) — Project dashboard
- [.devcontainer/WORKTREE.md](.devcontainer/WORKTREE.md) — Git worktree documentation

### Specifications

- [.claude/PROJECT.md](.claude/PROJECT.md) — Project specification (concept, design principles)
- [.claude/BUSINESS.md](.claude/BUSINESS.md) — Business logic (pricing, inheritance flow)
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) — Detailed requirements

### Operations

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Deployment guide
- [docs/RUNBOOK.md](docs/RUNBOOK.md) — Operational runbook
- [docs/CONTRIB.md](docs/CONTRIB.md) — Contribution guidelines
- [docs/LINEAR_INTEGRATION.md](docs/LINEAR_INTEGRATION.md) — Linear setup

## Current Phase

**Phase 1 (current):** Property display, basic inheritance flow, payments, agreements

**Phase 2 (planned):**

- User registration & login (email + OAuth)
- Messaging between residents
- Full payment integration
- Digital contracts
