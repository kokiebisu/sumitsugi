# Stripe Webhook Setup Guide

This guide explains how to configure Stripe webhooks for the tsumugi payment system in both development and production environments.

## Webhook Endpoint

The webhook handler is located at:

```
POST /api/webhooks/stripe
```

This endpoint handles payment events from Stripe and automatically processes payments and transfers.

## Handled Events

The webhook handler processes the following Stripe events:

### Critical Events

- **`payment_intent.succeeded`** - Payment completed successfully
  - Updates payment status to `succeeded`
  - For `application_fee` payments: Automatically triggers transfer to previous tenant
  - For `deposit` and `remaining` payments: Updates status only (held in escrow)

- **`payment_intent.payment_failed`** - Payment failed
  - Updates payment status to `failed`
  - Stores failure reason in payment metadata

### Informational Events

- **`transfer.created`** - Transfer initiated (logged)
- **`transfer.updated`** - Transfer status updated (logged)

All other events are acknowledged but not processed.

## Environment Variables

The webhook handler requires the following environment variable:

```bash
# Required
STRIPE_WEBHOOK_SECRET=whsec_...
```

This secret is used to verify that webhook events are genuinely from Stripe and not from a malicious source.

## Development Setup

### Using Stripe CLI (Recommended)

The Stripe CLI allows you to test webhooks locally without exposing your development server to the internet.

#### 1. Install Stripe CLI

**macOS:**

```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**

```bash
scoop install stripe
```

**Linux:**

```bash
# Download from https://github.com/stripe/stripe-cli/releases
```

#### 2. Login to Stripe

```bash
stripe login
```

This will open your browser to authorize the CLI with your Stripe account.

#### 3. Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This command will:

- Display your webhook signing secret (e.g., `whsec_...`)
- Forward all webhook events to your local server
- Show real-time webhook event logs

#### 4. Update Environment Variables

Copy the webhook signing secret from the CLI output and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 5. Restart Development Server

```bash
npm run dev
```

#### 6. Test Webhooks

In a separate terminal, trigger test events:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test transfer created
stripe trigger transfer.created
```

You should see webhook events being received in both:

- The Stripe CLI terminal (forwarding logs)
- Your Next.js server logs (handling logs)

### Alternative: ngrok (For External Testing)

If you need to test webhooks from external services:

#### 1. Install ngrok

```bash
npm install -g ngrok
```

#### 2. Start Tunnel

```bash
ngrok http 3000
```

#### 3. Configure Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your ngrok URL: `https://your-id.ngrok.io/api/webhooks/stripe`
4. Select events to listen to (see "Handled Events" section above)
5. Copy the webhook signing secret

#### 4. Update Environment Variables

Add the signing secret to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Production Setup

### 1. Configure Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your production URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `transfer.updated`

### 2. Copy Webhook Secret

After creating the endpoint:

1. Click on the endpoint in the dashboard
2. Click "Reveal" in the "Signing secret" section
3. Copy the secret (starts with `whsec_`)

### 3. Add to Production Environment

Add the webhook secret to your production environment variables:

**Vercel:**

```bash
vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the secret when prompted
```

**Railway:**

```bash
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
```

**AWS/Heroku/Other:**
Add `STRIPE_WEBHOOK_SECRET` to your environment configuration.

### 4. Deploy

Deploy your application with the updated environment variables:

```bash
git push origin main
```

### 5. Verify Webhook

After deployment, test the webhook:

1. Go to your webhook endpoint in Stripe Dashboard
2. Click "Send test webhook"
3. Select `payment_intent.succeeded`
4. Check that the endpoint returns a `200 OK` response

## Webhook Security

The webhook handler implements several security measures:

### Signature Verification

Every webhook request is verified using the `stripe-signature` header and your webhook secret. This prevents:

- Replay attacks
- Man-in-the-middle attacks
- Malicious webhook requests

### Error Handling

The handler returns appropriate HTTP status codes:

- `200 OK` - Event processed successfully
- `400 Bad Request` - Invalid signature or missing headers
- `404 Not Found` - Payment not found in database
- `500 Internal Server Error` - Server error or webhook secret not configured

### Idempotency

Stripe may send the same webhook event multiple times. The handler is designed to be idempotent:

- Payment status updates use the same values
- Transfer processing checks for existing transfers
- Database operations are atomic

## Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook secret**

   ```bash
   echo $STRIPE_WEBHOOK_SECRET
   ```

   Should output `whsec_...`

2. **Check Stripe CLI connection**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Should show "Ready! You are using Stripe API Version..."

3. **Check server logs**
   Look for webhook errors in Next.js console

### Invalid Signature Errors

1. **Verify webhook secret matches**
   - Local: Check `.env.local`
   - Production: Check environment variables

2. **Check for secret rotation**
   - Stripe rotates secrets when endpoints are deleted/recreated
   - Always use the latest secret from the dashboard

### Payment Not Found Errors

1. **Check PaymentIntent metadata**
   - Ensure `propertyId`, `userId`, and `paymentType` are set
   - Verify payment was created in database before webhook fires

2. **Check database connection**
   - Ensure `DATABASE_URL` is configured
   - Verify database is accessible from webhook handler

## Event Sequence

Here's the typical event sequence for a successful payment:

### Application Fee Payment (Non-refundable)

1. User completes payment form
2. Client creates PaymentIntent via Stripe Elements
3. **`payment_intent.succeeded`** webhook fires
   - Handler updates payment status to `succeeded`
   - Handler calls `processApplicationFeeTransfer()`
   - Creates transaction record
4. **`transfer.created`** webhook fires
   - Handler logs transfer creation
5. Funds transferred to previous tenant's Stripe account
6. **`transfer.updated`** webhook fires (if status changes)

### Deposit/Remaining Payment (Held in Escrow)

1. User completes payment form
2. Client creates PaymentIntent via Stripe Elements (with `capture_method: manual`)
3. **`payment_intent.succeeded`** webhook fires
   - Handler updates payment status to `succeeded`
   - Payment held (not captured yet)
4. After dispute period (48 hours):
   - Platform captures payment via `releaseEscrow()` action
   - Separate transfer flow begins

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

## Support

For issues with webhook configuration:

1. Check Stripe Dashboard webhook logs
2. Review Next.js server logs
3. Test with Stripe CLI before deploying to production
4. Verify all environment variables are set correctly
