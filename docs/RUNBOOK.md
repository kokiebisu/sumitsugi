# Operations Runbook

This runbook covers deployment procedures, monitoring, troubleshooting, and incident response for tsumugi.

## Table of Contents

- [Deployment Procedures](#deployment-procedures)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Common Issues and Fixes](#common-issues-and-fixes)
- [Rollback Procedures](#rollback-procedures)
- [Infrastructure](#infrastructure)
- [Emergency Contacts](#emergency-contacts)

## Deployment Procedures

### Prerequisites

- [ ] All tests passing locally (`bun test` and `bun run test:e2e`)
- [ ] Code reviewed and approved
- [ ] Environment variables configured in deployment platform
- [ ] Database migrations prepared (if applicable)

### Continuous Deployment (Vercel)

**Automatic deployment on push to main:**

1. Push commits to `main` branch
2. Vercel automatically detects changes
3. Build triggered with production environment
4. Tests run during build
5. Deployment completes if build succeeds
6. Production URL updated

**Monitor deployment:**

```bash
# Check deployment status
vercel list

# View deployment logs
vercel logs [deployment-url]
```

### Preview Deployments

**Automatic preview on PR:**

1. Create pull request
2. Vercel creates preview deployment
3. Preview URL posted in PR comments
4. Test changes in preview environment
5. Merge PR to deploy to production

### Manual Deployment

**Deploy from local machine (emergency only):**

```bash
# Build production bundle
bun run build

# Deploy to Vercel
vercel --prod

# Or deploy specific branch
vercel --prod --force
```

### Environment Variables

**Production environment variables (Vercel Dashboard):**

Required:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_URL` - Production URL (e.g., https://tsumugi.example.com)
- `NEXTAUTH_SECRET` - JWT encryption secret (unique per environment)

Optional:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` - Apple Sign In
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - S3 image storage
- `AWS_REGION` / `AWS_S3_BUCKET_NAME` - S3 configuration
- `RESEND_API_KEY` / `EMAIL_FROM` - Email notifications
- `ANTHROPIC_API_KEY` - AI estimates
- `NEXT_PUBLIC_USE_AI_ESTIMATE` - Enable AI features

**Update environment variable:**

```bash
# Via Vercel CLI
vercel env add VARIABLE_NAME production

# Or via dashboard: Project Settings → Environment Variables
```

**After updating environment variables:**

```bash
# Redeploy to apply changes
vercel --prod --force
```

### Database Migrations

**Run migrations:**

```bash
# Generate migration from schema changes
bunx drizzle-kit generate:pg

# Push migration to production database
bunx drizzle-kit push:pg

# Or apply migrations via code (on deployment)
# Migrations run automatically during build if configured
```

**Rollback migration:**

```bash
# Connect to production database
psql $DATABASE_URL

# Run rollback SQL manually
# (Keep migration rollback scripts in version control)
```

### Deployment Checklist

- [ ] All tests passing (`bun test`, `bun run test:e2e`)
- [ ] Code reviewed and approved
- [ ] Environment variables updated (if needed)
- [ ] Database migrations prepared and tested
- [ ] Changelog/release notes updated
- [ ] Staging environment tested (if applicable)
- [ ] Backup of production database taken
- [ ] Deployment window communicated to team
- [ ] Monitoring dashboards open
- [ ] Rollback plan ready

## Monitoring and Alerts

### Application Monitoring

**Vercel Analytics:**

- Real-time performance metrics
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- Error rates

**Access:** Vercel Dashboard → Analytics

### Error Tracking

**Vercel Logs:**

```bash
# View production logs
vercel logs --prod

# Stream logs in real-time
vercel logs --prod --follow

# Filter by function
vercel logs --prod --scope=api
```

**Key metrics to monitor:**

- 5xx error rates (should be < 0.1%)
- 4xx error rates (should be < 5%)
- Response times (p95 should be < 1s)
- Database connection errors
- Authentication failures

### Database Monitoring

**Neon Dashboard:**

- Connection pool usage
- Query performance
- Storage usage
- Connection errors

**Access:** https://neon.tech → Project → Monitoring

**Critical alerts:**

- Connection pool exhausted
- Slow queries (> 1s)
- Storage > 80% capacity
- Frequent connection errors

### External Service Monitoring

**Stripe Dashboard:**

- Payment success rates
- Failed payments
- Webhook delivery status

**AWS S3 (if enabled):**

- Storage usage
- Request errors
- Upload failures

**Resend Dashboard (if enabled):**

- Email delivery rates
- Bounce rates
- Failed sends

### Health Checks

**Manual health check:**

```bash
# Check homepage
curl -I https://tsumugi.example.com

# Check API endpoint
curl https://tsumugi.example.com/api/health

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

**Expected responses:**

- Homepage: HTTP 200
- API health: HTTP 200 with `{"status":"ok"}`
- Database: `1` (row returned)

## Common Issues and Fixes

### Build Failures

**Issue:** Build fails with TypeScript errors

**Fix:**

```bash
# Run type check locally
bunx tsc --noEmit

# Fix type errors
# Commit fixes and push
```

**Issue:** Build fails with dependency errors

**Fix:**

```bash
# Clear lockfile and reinstall
rm bun.lockb
bun install

# Or force clean install
bun install --force
```

### Runtime Errors

**Issue:** 500 Internal Server Error

**Diagnose:**

```bash
# Check Vercel logs
vercel logs --prod

# Common causes:
# - Environment variable missing
# - Database connection error
# - Unhandled exception in API route
```

**Fix:**

1. Identify error in logs
2. Fix in code or update environment variable
3. Redeploy

**Issue:** Authentication not working

**Diagnose:**

```bash
# Check NEXTAUTH_URL is correct
echo $NEXTAUTH_URL

# Check NEXTAUTH_SECRET is set
# (Don't echo - it's sensitive)

# Check OAuth credentials configured
```

**Fix:**

1. Update environment variables in Vercel dashboard
2. Redeploy application
3. Clear browser cookies and retry

**Issue:** Database connection timeouts

**Diagnose:**

```bash
# Check Neon dashboard for connection pool usage
# Check for slow queries

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Fix:**

1. Scale up Neon compute if under load
2. Optimize slow queries
3. Increase connection pool size in application config

### Performance Issues

**Issue:** Slow page loads

**Diagnose:**

```bash
# Check Vercel Analytics for Core Web Vitals
# Identify slow pages/routes

# Check for:
# - Unoptimized images
# - Large JavaScript bundles
# - Slow API calls
# - N+1 database queries
```

**Fix:**

1. Optimize images (use Next.js Image component)
2. Code split large bundles
3. Add API route caching
4. Optimize database queries with indexes

**Issue:** High memory usage

**Diagnose:**

```bash
# Check Vercel logs for OOM errors
# Check function execution logs
```

**Fix:**

1. Identify memory-intensive operations
2. Optimize data processing (stream large data)
3. Increase serverless function memory limit
4. Add pagination to API responses

### E2E Test Failures

**Issue:** Tests failing in CI but passing locally

**Diagnose:**

```bash
# Check GitHub Actions logs
# Common causes:
# - Timing issues (race conditions)
# - Environment differences
# - Missing test fixtures
```

**Fix:**

1. Add explicit waits for async operations
2. Use `waitForLoadState` and `waitForSelector`
3. Ensure test data is properly seeded
4. Check for hardcoded URLs or ports

**View test artifacts:**

- Screenshots: GitHub Actions → Workflow → Artifacts
- Videos: GitHub Actions → Workflow → Artifacts
- Traces: GitHub Pages → https://kokiebisu.github.io/tsumugi/e2e-reports/

## Rollback Procedures

### Vercel Rollback

**Instant rollback to previous deployment:**

```bash
# List recent deployments
vercel list

# Promote previous deployment to production
vercel promote [deployment-url] --prod

# Or via Vercel Dashboard:
# Project → Deployments → Previous Deployment → Promote to Production
```

**Rollback time:** ~30 seconds

### Database Rollback

**Rollback database migration:**

```bash
# 1. Connect to production database
psql $DATABASE_URL

# 2. Run rollback SQL
# (Should be prepared in advance for each migration)
BEGIN;
-- Rollback statements here
-- DROP COLUMN, ALTER TABLE, etc.
COMMIT;
```

**CRITICAL:** Always test rollback SQL in staging before deploying migration.

### Git Rollback

**Revert breaking commit:**

```bash
# 1. Identify bad commit
git log --oneline

# 2. Revert commit (creates new commit)
git revert <commit-hash>

# 3. Push to main (triggers deployment)
git push origin main
```

**Or hard reset (use with caution):**

```bash
# 1. Reset to previous commit
git reset --hard <good-commit-hash>

# 2. Force push (requires admin permissions)
git push origin main --force

# This rewrites history - coordinate with team first
```

### Environment Variable Rollback

**Restore previous environment variable:**

```bash
# Via Vercel Dashboard:
# Project Settings → Environment Variables → Variable History → Restore

# Or set via CLI:
vercel env add VARIABLE_NAME production
# (Enter previous value when prompted)

# Redeploy to apply
vercel --prod --force
```

### Rollback Decision Tree

```
Is the issue critical (data loss, security, complete outage)?
├─ YES: Immediate rollback
│   └─ Execute Vercel rollback (30 seconds)
│
└─ NO: Can it be fixed forward quickly (< 15 minutes)?
    ├─ YES: Deploy hotfix
    │   └─ Faster than rollback + re-deploy
    │
    └─ NO: Rollback and fix properly
        └─ Execute rollback, fix in development, re-deploy
```

## Infrastructure

### Hosting

**Platform:** Vercel (Next.js optimized hosting)

**Regions:** Global Edge Network with automatic geo-routing

**Configuration:**

- Build command: `bun run build`
- Output directory: `.next`
- Install command: `bun install`
- Node version: Auto-detected from `package.json`

### Database

**Provider:** Neon (Serverless PostgreSQL)

**Configuration:**

- Connection pooling enabled
- Auto-scaling compute
- Point-in-time recovery (PITR) enabled
- Automatic backups every 24 hours

**Connection string format:**

```
postgresql://[user]:[password]@[host]/[db]?sslmode=require
```

### CDN and Assets

**Static assets:** Vercel Edge Network (automatic)

**Image optimization:** Next.js Image Optimization (automatic)

**Custom domain:** Configure in Vercel Dashboard → Domains

### Email Service

**Provider:** Resend (transactional email)

**Configuration:**

- Domain verification required
- DKIM/SPF configured
- Webhook for delivery tracking

### Payment Processing

**Provider:** Stripe

**Configuration:**

- Webhook endpoint: `/api/stripe/webhook`
- Webhook secret stored in environment variables
- Test mode for development, live mode for production

### Image Storage

**Provider:** AWS S3 (optional)

**Configuration:**

- Bucket: `tsumugi-images`
- Region: `ap-northeast-1`
- Public read access for property images
- Signed URLs for private uploads

## Emergency Contacts

### On-Call Rotation

- **Primary:** [Contact info]
- **Secondary:** [Contact info]
- **Escalation:** [Contact info]

### Service Providers

- **Vercel Support:** support@vercel.com
- **Neon Support:** support@neon.tech
- **Stripe Support:** https://support.stripe.com
- **AWS Support:** https://console.aws.amazon.com/support

### Incident Response

**Severity Levels:**

- **P0 (Critical):** Complete outage, data loss, security breach
  - Response time: Immediate (< 15 minutes)
  - Action: Page on-call, execute rollback

- **P1 (High):** Major feature broken, significant user impact
  - Response time: < 1 hour
  - Action: Notify team, begin investigation

- **P2 (Medium):** Minor feature broken, limited user impact
  - Response time: < 4 hours
  - Action: Create ticket, schedule fix

- **P3 (Low):** Cosmetic issue, no user impact
  - Response time: Next business day
  - Action: Backlog for next sprint

### Post-Incident Review

**After any P0 or P1 incident:**

1. Document timeline of events
2. Identify root cause
3. Document what worked/didn't work
4. Create action items to prevent recurrence
5. Share learnings with team

**Template:** `docs/incidents/YYYY-MM-DD-incident-name.md`

## Backup and Recovery

### Database Backups

**Automatic backups:**

- Frequency: Every 24 hours
- Retention: 30 days
- Storage: Neon managed storage

**Manual backup:**

```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to safe location
aws s3 cp backup-$(date +%Y%m%d).sql s3://tsumugi-backups/
```

**Restore from backup:**

```bash
# Download backup
aws s3 cp s3://tsumugi-backups/backup-20260202.sql .

# Restore to database
psql $DATABASE_URL < backup-20260202.sql
```

### Code Backup

**Primary:** GitHub repository (private)

**Backup:** Vercel maintains deployment history (90 days)

**Disaster recovery:**

1. Clone repository from GitHub
2. Restore environment variables from documentation
3. Deploy to new Vercel project
4. Update DNS to point to new deployment

### Data Recovery

**Point-in-Time Recovery (Neon):**

```bash
# Via Neon Dashboard:
# Project → Backups → Point-in-Time Recovery → Select timestamp → Restore
```

**Time to recover:** 5-15 minutes depending on database size

## Maintenance Windows

### Planned Maintenance

**Database maintenance:**

- Frequency: Monthly (first Sunday, 2:00-4:00 AM JST)
- Duration: Up to 2 hours
- Impact: Brief connection interruptions (< 30 seconds)

**Application updates:**

- Frequency: Continuous (automated deployments)
- Duration: ~2 minutes per deployment
- Impact: Zero downtime (rolling deployment)

### Emergency Maintenance

**Notification:**

1. Post status update to status page
2. Notify users via email (if applicable)
3. Post updates every 30 minutes
4. Confirm resolution when complete

**Communication channels:**

- Status page: [URL if applicable]
- Twitter: [@tsumugi_status if applicable]
- Email: status@tsumugi.example.com

## Security

### Access Control

**Production access:**

- Vercel: Team members only
- GitHub: Protected main branch, required reviews
- Database: IP whitelist, SSL required
- AWS: IAM roles with least privilege

### Secret Rotation

**Frequency:** Every 90 days

**Secrets to rotate:**

- `NEXTAUTH_SECRET`
- Database passwords
- API keys (Stripe, AWS, Resend, Anthropic)
- OAuth client secrets

**Rotation procedure:**

1. Generate new secret
2. Add new secret to Vercel environment variables
3. Deploy application with new secret
4. Verify application works with new secret
5. Remove old secret after 24 hours

### Security Monitoring

**Monitor for:**

- Failed authentication attempts (> 10/minute from same IP)
- SQL injection attempts (in Vercel logs)
- Unusual API usage patterns
- Payment fraud attempts (Stripe Radar)

**Alert channels:**

- Email: security@tsumugi.example.com
- Slack: #security-alerts (if applicable)

### Incident Response

**Security incident procedure:**

1. **Contain:** Disable compromised accounts/services
2. **Assess:** Determine scope of breach
3. **Notify:** Alert team and affected users
4. **Remediate:** Fix vulnerability, rotate secrets
5. **Review:** Post-mortem and preventive measures

## Related Documentation

- `docs/CONTRIB.md` - Development and contribution guide
- `CLAUDE.md` - Project memory bank with quick reference
- `.claude/PROJECT.md` - Project specification
- `.claude/BUSINESS.md` - Business logic specification
- `docs/DEPLOYMENT.md` - Detailed deployment guide
