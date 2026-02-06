# Deployment Guide

This guide covers deploying the tsumugi platform with payment system integration.

## Prerequisites

Before deploying, ensure you have:

### 1. Stripe Account

- **Stripe Account**: Create at https://stripe.com
- **Connected Accounts**: Enable Stripe Connect in your dashboard
- **API Keys**: Obtain publishable and secret keys (test + production)
- **Webhook Secret**: Configure webhook endpoint (see Webhook Configuration section)

### 2. Database

- **PostgreSQL Database**: Neon, Supabase, or any PostgreSQL provider
- **Database URL**: Connection string with SSL enabled
- **Migrations**: Run all migrations before deployment

### 3. Hosting Platform

- **Vercel** (recommended): https://vercel.com
- **Railway**: https://railway.app
- **AWS/Heroku**: Any platform supporting Next.js

## Environment Variables

### Required Variables

The following environment variables MUST be configured before deployment:

```bash
# Database Configuration (Required)
DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require"

# NextAuth.js Configuration (Required)
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32

# Stripe Configuration (Required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Environment (Required)
NODE_ENV="production"
```

### Optional Variables

These variables enable additional features:

```bash
# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# AWS S3 for Image Storage (Optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET_NAME="tsumugi-images"

# Email Notifications (Optional)
RESEND_API_KEY=""
EMAIL_FROM="noreply@tsumugi.example.com"

# AI-Powered Estimate (Optional)
ANTHROPIC_API_KEY=""
NEXT_PUBLIC_USE_AI_ESTIMATE="false"
```

### Environment Variable Checklist

Before deployment, verify:

- [ ] Database connection string is correct and accessible
- [ ] NextAuth secret is generated and unique
- [ ] Stripe publishable key matches environment (test vs. production)
- [ ] Stripe secret key matches environment (test vs. production)
- [ ] Stripe webhook secret is configured correctly
- [ ] NEXTAUTH_URL points to production domain
- [ ] NODE_ENV is set to "production"

## Deployment Steps

### Step 1: Run Database Migrations

Before deploying the application, ensure all database migrations are applied:

#### Option A: Using Drizzle CLI (Recommended)

```bash
# Install dependencies
bun install

# Generate migration files (if not already generated)
bun run db:generate

# Apply migrations to production database
bun run db:migrate
```

#### Option B: Using Drizzle Studio

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require"

# Open Drizzle Studio
bun run db:studio

# Verify schema matches expected structure
```

#### Verify Migration Success

Connect to your database and verify tables exist:

```sql
-- Check for payment tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('payments', 'transactions', 'stripe_accounts');

-- Expected output:
-- payments
-- transactions
-- stripe_accounts
```

### Step 2: Configure Stripe Webhook

The webhook endpoint is critical for payment processing. Follow these steps carefully:

#### A. Deploy Application First (Without Webhook)

```bash
# Deploy to get production URL
git push origin main

# Your production URL will be:
# https://your-domain.com
```

#### B. Create Webhook Endpoint in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `transfer.updated`
5. Click "Add endpoint"

#### C. Copy Webhook Secret

1. Click on the newly created endpoint
2. Click "Reveal" in "Signing secret" section
3. Copy the secret (starts with `whsec_`)

#### D. Add Webhook Secret to Environment

**Vercel:**

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the secret when prompted
```

**Railway:**

```bash
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
```

**Other Platforms:**
Add `STRIPE_WEBHOOK_SECRET` to your environment configuration.

#### E. Redeploy Application

```bash
# Trigger redeployment to load new environment variable
git commit --allow-empty -m "chore: trigger redeploy for webhook secret"
git push origin main
```

### Step 3: Deploy Application

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables (if not already set)
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
railway variables set NEXTAUTH_SECRET=your-secret
railway variables set NEXTAUTH_URL=https://your-domain.com

# Deploy
railway up
```

#### Manual Deployment (AWS, Heroku, etc.)

1. Configure environment variables in platform dashboard
2. Build application:
   ```bash
   bun run build
   ```
3. Start production server:
   ```bash
   bun start
   ```

### Step 4: Test Payment Flow

After deployment, thoroughly test the payment system:

#### A. Test Application Fee Payment

1. Navigate to a property page
2. Click "Apply" or "Request Viewing"
3. Complete the application fee payment (¥20,000)
4. Verify:
   - [ ] Payment succeeds in Stripe Dashboard
   - [ ] Webhook fires and updates payment status
   - [ ] Transfer to previous tenant is created
   - [ ] Transaction record is created in database

#### B. Test Deposit Payment

1. After approval, navigate to deposit payment page
2. Complete deposit payment (30% of relocation fee)
3. Verify:
   - [ ] Payment succeeds in Stripe Dashboard
   - [ ] Funds are held (not transferred yet)
   - [ ] Payment status is `succeeded` in database

#### C. Test Remaining Payment

1. Navigate to remaining payment page
2. Complete remaining payment (70% of relocation fee)
3. Verify:
   - [ ] Payment succeeds in Stripe Dashboard
   - [ ] Funds are held in escrow
   - [ ] Payment status is `succeeded` in database

#### D. Test Escrow Release

1. After handoff completion, trigger escrow release:
   ```bash
   # This would typically be done via admin panel
   # or automatically after dispute period
   ```
2. Verify:
   - [ ] Funds are transferred to all parties
   - [ ] Transaction records are created
   - [ ] Payment status is updated

## Monitoring

### Stripe Dashboard Monitoring

Monitor payment activity in Stripe Dashboard:

1. **Payments**: https://dashboard.stripe.com/payments
   - View all PaymentIntents
   - Check for failed payments
   - Monitor refunds

2. **Transfers**: https://dashboard.stripe.com/connect/transfers
   - View transfers to connected accounts
   - Check transfer status
   - Monitor failed transfers

3. **Webhooks**: https://dashboard.stripe.com/webhooks
   - View webhook event history
   - Check for failed webhook deliveries
   - Monitor response times

### Application Monitoring

#### Database Queries

Monitor payment and transaction records:

```sql
-- Check recent payments
SELECT id, type, amount, status, "createdAt"
FROM payments
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check recent transactions
SELECT id, "recipientType", amount, status, "createdAt"
FROM transactions
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check failed payments
SELECT id, property_id, user_id, amount, status, "createdAt"
FROM payments
WHERE status = 'failed'
ORDER BY "createdAt" DESC;

-- Check pending transfers
SELECT id, payment_id, "recipientType", amount, status
FROM transactions
WHERE status = 'pending';
```

#### Server Logs

Monitor application logs for webhook processing:

**Vercel:**

```bash
vercel logs --follow
```

**Railway:**

```bash
railway logs
```

Look for:

- Webhook signature verification errors
- Payment processing errors
- Transfer failures
- Database connection issues

### Alerts (Recommended)

Set up alerts for critical events:

1. **Stripe Alerts**:
   - Failed payments (Settings > Notifications)
   - Failed webhooks (Webhook endpoint settings)

2. **Database Alerts**:
   - Monitor for stuck payments (`status = 'pending'` for > 1 hour)
   - Monitor for failed transfers (`status = 'failed'`)

3. **Application Alerts**:
   - Set up error tracking (Sentry, Rollbar, etc.)
   - Monitor webhook endpoint uptime
   - Alert on 4xx/5xx errors

## Troubleshooting

### Webhook Issues

#### Problem: Webhooks not being received

**Symptoms:**

- Payment succeeds in Stripe but status not updated in database
- Transfers not created automatically

**Solutions:**

1. **Verify webhook endpoint is accessible**:

   ```bash
   curl -I https://your-domain.com/api/webhooks/stripe
   # Expected: 405 Method Not Allowed (POST required)
   ```

2. **Check webhook secret**:

   ```bash
   # Vercel
   vercel env ls

   # Railway
   railway variables

   # Should show STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Check Stripe webhook logs**:
   - Go to https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint
   - View "Recent deliveries"
   - Check for errors (signature mismatch, 404, 500, etc.)

4. **Test webhook manually**:
   - In Stripe Dashboard, click "Send test webhook"
   - Select `payment_intent.succeeded`
   - Verify 200 OK response

#### Problem: Invalid signature errors

**Symptoms:**

- Webhook returns 400 Bad Request
- Logs show "Webhook signature verification failed"

**Solutions:**

1. **Verify webhook secret matches Stripe Dashboard**:
   - Get secret from https://dashboard.stripe.com/webhooks
   - Update environment variable
   - Redeploy application

2. **Check for secret rotation**:
   - Stripe rotates secrets when endpoints are recreated
   - Always use latest secret from dashboard

### Payment Processing Issues

#### Problem: Payments stuck in "pending" status

**Symptoms:**

- Payment shows `status = 'pending'` in database
- User completed payment but status not updated

**Solutions:**

1. **Check Stripe PaymentIntent status**:

   ```bash
   # In Stripe Dashboard, search for payment
   # Verify it shows "Succeeded"
   ```

2. **Manually trigger webhook**:
   - In Stripe Dashboard, go to PaymentIntent
   - Click "Send webhook" in Events section
   - Select `payment_intent.succeeded`

3. **Check webhook processing logs**:
   ```bash
   # Look for errors in server logs
   vercel logs | grep "webhook"
   ```

#### Problem: Transfers not created

**Symptoms:**

- Application fee payment succeeded
- No transfer to previous tenant

**Solutions:**

1. **Check Stripe account onboarding**:

   ```sql
   SELECT id, user_id, "stripeAccountId", "onboardingCompleted"
   FROM stripe_accounts
   WHERE user_id = 'previous-tenant-id';
   ```

2. **Verify account can receive transfers**:
   - In Stripe Dashboard, go to Connect > Accounts
   - Check account status (should be "Complete")

3. **Check transaction records**:
   ```sql
   SELECT id, payment_id, status, "stripeTransferId"
   FROM transactions
   WHERE payment_id = 'payment-id';
   ```

### Database Issues

#### Problem: Migration errors

**Symptoms:**

- Tables missing
- Column type mismatches
- Foreign key constraint errors

**Solutions:**

1. **Verify migration files are up to date**:

   ```bash
   ls -la src/db/migrations/
   ```

2. **Re-run migrations**:

   ```bash
   bun run db:migrate
   ```

3. **Check database schema**:
   ```sql
   \d payments
   \d transactions
   \d stripe_accounts
   ```

### Performance Issues

#### Problem: Slow payment processing

**Symptoms:**

- Long delay between payment and webhook processing
- Timeout errors

**Solutions:**

1. **Check database connection pool**:
   - Ensure `DATABASE_URL` includes `?connection_limit=10`
   - Monitor active connections

2. **Optimize database queries**:

   ```sql
   -- Add indexes if missing
   CREATE INDEX idx_payments_stripe_payment_intent_id
   ON payments("stripePaymentIntentId");

   CREATE INDEX idx_transactions_payment_id
   ON transactions(payment_id);
   ```

3. **Monitor Stripe API response times**:
   - Check Stripe Dashboard > Developers > API logs
   - Look for slow requests

## Security Checklist

Before going to production, verify:

- [ ] All environment variables use production values (not test mode)
- [ ] Webhook signature verification is enabled
- [ ] Database uses SSL connection (`sslmode=require`)
- [ ] NEXTAUTH_SECRET is unique and strong (32+ characters)
- [ ] Stripe API keys are not committed to git
- [ ] CORS is configured correctly (if using API)
- [ ] Rate limiting is enabled on payment endpoints
- [ ] User input is validated (Zod schemas)
- [ ] SQL injection prevention (parameterized queries via Drizzle)

## Rollback Plan

If issues arise after deployment:

### Quick Rollback (Vercel)

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Revert migrations (if needed)
bun run db:rollback

# Or manually drop tables
psql $DATABASE_URL
DROP TABLE transactions;
DROP TABLE payments;
DROP TABLE stripe_accounts;
```

### Stripe Webhook Rollback

1. Disable webhook in Stripe Dashboard
2. Rollback application deployment
3. Re-enable webhook after verification

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Connect Guide**: https://stripe.com/docs/connect
- **Webhook Setup Guide**: [docs/plans/stripe-webhook-setup.md](./plans/stripe-webhook-setup.md)
- **Payment System Design**: [docs/plans/2026-01-31-payment-system-design.md](./plans/2026-01-31-payment-system-design.md)
- **Drizzle ORM**: https://orm.drizzle.team/docs/overview

## Post-Deployment Checklist

After deployment, verify:

- [ ] Application is accessible at production URL
- [ ] Database migrations completed successfully
- [ ] Stripe webhook is configured and receiving events
- [ ] Test payment flow works end-to-end
- [ ] Monitoring is set up (Stripe Dashboard + application logs)
- [ ] Alerts are configured for critical failures
- [ ] Backup strategy is in place (database snapshots)
- [ ] Documentation is updated with production details
- [ ] Team has access to Stripe Dashboard
- [ ] Rollback plan is documented and tested
