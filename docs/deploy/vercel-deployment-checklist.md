# Vercel Deployment Checklist

> Last verified: 2026-02-11
> Production URL: https://sumitsugi-orcin.vercel.app
> Vercel Project: `sumitsugi` (kenichi-okiebisus-projects)

## Current Status

- Vercel is connected to the GitHub repo (`kokiebisu/sumitsugi`)
- Auto-deploy on push to `main` (production) and PR branches (preview)
- `vercel.json` configures: `bun run build`, `bun dev`, `bun install`, framework `nextjs`
- Post-merge smoke test runs on every push to `main`
- Auto-rollback triggers after 2 consecutive smoke test failures

## Prerequisites

### 1. Vercel Project Setup

- [ ] Vercel account linked to GitHub repo
- [ ] Project framework set to Next.js
- [ ] Build command: `bun run build`
- [ ] Install command: `bun install`
- [ ] Output directory: `.next`
- [ ] Node.js version: 24.x (configured in Vercel project settings)

### 2. GitHub Secrets (for CI)

The following secrets must be configured in GitHub repo settings:

```
VERCEL_TOKEN          # Vercel API token (for Vercel GitHub integration)
VERCEL_ORG_ID         # Vercel organization/team ID
VERCEL_PROJECT_ID     # Vercel project ID
```

### 3. Domain Configuration

- [ ] Custom domain configured in Vercel (if applicable)
- [ ] DNS records pointing to Vercel
- [ ] SSL certificate provisioned (automatic with Vercel)

## Environment Variables

### Required for Build

| Variable             | Description                                 | Required at Build Time        |
| -------------------- | ------------------------------------------- | ----------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string (Neon)         | Yes (module-level validation) |
| `BETTER_AUTH_SECRET` | Auth secret key (`openssl rand -base64 32`) | No (runtime warning only)     |

### Required for Runtime

| Variable                             | Description                                                        | Scope  |
| ------------------------------------ | ------------------------------------------------------------------ | ------ |
| `DATABASE_URL`                       | `postgresql://[user]:[pass]@[host].neon.tech/[db]?sslmode=require` | Server |
| `BETTER_AUTH_SECRET`                 | Auth encryption secret (32+ chars)                                 | Server |
| `GOOGLE_CLIENT_ID`                   | Google OAuth client ID                                             | Server |
| `GOOGLE_CLIENT_SECRET`               | Google OAuth client secret                                         | Server |
| `APPLE_CLIENT_ID`                    | Apple Sign In client ID                                            | Server |
| `APPLE_CLIENT_SECRET`                | Apple Sign In client secret                                        | Server |
| `R2_ACCOUNT_ID`                      | Cloudflare R2 account ID                                           | Server |
| `R2_ACCESS_KEY_ID`                   | R2 access key                                                      | Server |
| `R2_SECRET_ACCESS_KEY`               | R2 secret key                                                      | Server |
| `R2_BUCKET_NAME`                     | R2 bucket name (`sumitsugi`)                                       | Server |
| `R2_PUBLIC_URL`                      | R2 public URL for images                                           | Server |
| `RESEND_API_KEY`                     | Resend email API key                                               | Server |
| `EMAIL_FROM`                         | Sender email address                                               | Server |
| `ANTHROPIC_API_KEY`                  | Anthropic API key (for AI estimates)                               | Server |
| `STRIPE_SECRET_KEY`                  | Stripe secret key                                                  | Server |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret                                      | Server |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key                                             | Client |
| `NEXT_PUBLIC_USE_AI_ESTIMATE`        | Enable AI estimates (`true`/`false`)                               | Client |

### Syncing Environment Variables

Set environment variables directly in the Vercel dashboard or via CLI:

```bash
bunx vercel env add <VAR_NAME> production
bunx vercel env add <VAR_NAME> preview
```

## Deployment Steps

### Step 1: Verify Build Locally

```bash
# Build requires DATABASE_URL at module evaluation time
DATABASE_URL="postgresql://ci:ci@localhost:5432/ci" bun run build
```

The CI workflow (`ci.yml`) also verifies the build with a dummy `DATABASE_URL`.

### Step 2: Push to Main

Vercel auto-deploys on push to `main`:

```bash
git push origin main
```

For manual CLI deployment:

```bash
bunx vercel --prod
```

### Step 3: Verify Deployment

```bash
# Check deployment status
bunx vercel ls sumitsugi

# Check latest deployment logs
bunx vercel logs <deployment-url>
```

### Step 4: Run Post-Deployment Verification

See [Post-Deployment Verification](#post-deployment-verification) below.

## Post-Deployment Verification

### Automated Checks

The `post-merge-smoke.yml` workflow runs automatically:

- TypeScript build verification
- Unit test suite
- Critical E2E tests (tagged `@critical`)

### Manual Verification Checklist

After deployment, verify each page loads correctly:

#### Core Pages

- [ ] Homepage (`/`) -- property listings or "no properties" message
- [ ] Properties page (`/properties`)
- [ ] Guide page (`/guide`) -- 9-step handover process
- [ ] Terms page (`/terms`) -- terms of service
- [ ] Privacy page (`/privacy`) -- privacy policy

#### Listing Flow

- [ ] New listing page (`/listing/new`)
- [ ] Listing onboarding (`/listing/onboarding`)

#### Account Pages

- [ ] Account page (`/account`)
- [ ] Account edit (`/account/edit`)

#### API Health

- [ ] Auth endpoint responds (`/api/auth/*`)
- [ ] Properties API responds (`/api/properties`)

#### Functional Checks

- [ ] Images load correctly (R2/Cloudflare)
- [ ] Authentication flow works (Google/Apple OAuth)
- [ ] Mobile responsive layout renders correctly
- [ ] Footer links all resolve correctly

### Webhook Verification (When Stripe is Active)

```bash
# Test webhook endpoint is accessible
curl -I https://sumitsugi-orcin.vercel.app/api/webhooks/stripe
# Expected: 405 Method Not Allowed (POST required) or similar

# Check Stripe Dashboard > Webhooks for delivery status
# URL: https://sumitsugi-orcin.vercel.app/api/webhooks/stripe
# Events: payment_intent.succeeded, payment_intent.payment_failed,
#          account.updated, transfer.created, transfer.updated
```

## CI/CD Pipeline

```
PR Push → CI (lint + build + test) → Preview Deploy
                                          ↓
Main Push → Post-Merge Smoke Test → Production Deploy
                                          ↓
                              Auto-Rollback (on 2 failures)
                                          ↓
                              Slack Notification + Incident Issue
```

### Key Workflows

| Workflow               | Trigger            | Purpose                                   |
| ---------------------- | ------------------ | ----------------------------------------- |
| `ci.yml`               | PR push            | Lint, build, unit tests                   |
| `post-merge-smoke.yml` | Push to main       | Build + tests on production code          |
| `auto-rollback.yml`    | Smoke test failure | Reverts main after 2 consecutive failures |

## Rollback

### Quick Rollback via Vercel

```bash
# List recent deployments
bunx vercel ls sumitsugi

# Promote a previous deployment to production
bunx vercel promote <deployment-url>
```

### Automatic Rollback

The `auto-rollback.yml` workflow:

1. Monitors post-merge smoke test results
2. After 2 consecutive failures, creates a revert commit on `main`
3. Opens an incident issue with `P0` label
4. Sends Slack notification

## Troubleshooting

### Build Fails with "DATABASE_URL not set"

The `src/db/index.ts` module throws at evaluation time if `DATABASE_URL` is missing. Ensure Vercel has `DATABASE_URL` configured for all environments (production + preview).

For local builds: `DATABASE_URL="postgresql://ci:ci@localhost:5432/ci" bun run build`

### BetterAuth Warnings During Build

Warnings about `BETTER_AUTH_SECRET` and `BETTER_AUTH_BASE_URL` during build are non-blocking. These are runtime configuration warnings that don't prevent the build from completing.

### Preview Deploys Fail

Ensure environment variables are set for the `preview` environment in Vercel, not just `production`.

### Vercel CLI Not Linked

```bash
bunx vercel link --yes --project sumitsugi
```

## Launch Day Checklist (2/14)

### Pre-Launch

- [ ] All environment variables set in Vercel production
- [ ] Database migrations applied to production Neon instance
- [ ] Custom domain configured and DNS propagated
- [ ] SSL certificate active
- [ ] Stripe webhook endpoint configured for production domain
- [ ] OAuth redirect URIs updated to production domain
- [ ] R2 bucket CORS configured for production domain

### Launch

- [ ] Push final changes to `main`
- [ ] Verify deployment succeeds in Vercel dashboard
- [ ] Run full manual verification checklist above
- [ ] Verify Stripe webhook connectivity (send test event)
- [ ] Test OAuth login flow end-to-end

### Post-Launch

- [ ] Monitor Vercel function logs for errors
- [ ] Monitor Stripe webhook delivery dashboard
- [ ] Check Neon database connection metrics
- [ ] Verify no 5xx errors in Vercel analytics
- [ ] Confirm auto-rollback pipeline is operational
