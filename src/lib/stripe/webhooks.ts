import { db } from '@/db';
import { payments, transactions, stripeAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processApplicationFeeTransfer } from '@/app/actions/payment';
import type Stripe from 'stripe';

/**
 * In-memory idempotency store for processed webhook events.
 * Provides best-effort duplicate detection within a single serverless instance.
 *
 * NOTE: On serverless platforms (Vercel), each invocation may run in a different
 * instance with independent memory. For production-grade idempotency, migrate to
 * a DB-backed webhook_events table (tracked as Phase 2 improvement).
 * Individual handlers below also implement their own DB-level idempotency guards.
 */
const PROCESSED_EVENTS = new Set<string>();
const MAX_STORED_EVENTS = 10_000;
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface EventRecord {
  readonly id: string;
  readonly timestamp: number;
}

let eventTimestamps: readonly EventRecord[] = [];

/**
 * Check if an event has already been processed (idempotency guard).
 * Returns true if the event was already processed.
 */
export function isEventProcessed(eventId: string): boolean {
  return PROCESSED_EVENTS.has(eventId);
}

/**
 * Mark an event as processed and evict stale entries.
 */
export function markEventProcessed(eventId: string): void {
  const now = Date.now();

  // Evict expired entries (immutable filter)
  const expired = eventTimestamps.filter(
    (e) => now - e.timestamp > EVENT_TTL_MS
  );
  for (const entry of expired) {
    PROCESSED_EVENTS.delete(entry.id);
  }
  let remaining = eventTimestamps.filter(
    (e) => now - e.timestamp <= EVENT_TTL_MS
  );

  // Evict oldest if at capacity
  if (remaining.length >= MAX_STORED_EVENTS) {
    const [oldest, ...rest] = remaining;
    if (oldest) {
      PROCESSED_EVENTS.delete(oldest.id);
    }
    remaining = rest;
  }

  PROCESSED_EVENTS.add(eventId);
  eventTimestamps = [...remaining, { id: eventId, timestamp: now }];
}

/**
 * Reset the idempotency store (for testing only).
 */
export function resetProcessedEvents(): void {
  PROCESSED_EVENTS.clear();
  eventTimestamps = [];
}

/**
 * Handle successful payment intent.
 * Updates payment status and triggers transfer for application fees.
 * DB-level idempotency: status check prevents duplicate transfers.
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, paymentIntent.id),
  });

  if (!payment) {
    throw new Error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
  }

  // DB-level idempotency: skip if already succeeded
  if (payment.status === 'succeeded') {
    return;
  }

  await db
    .update(payments)
    .set({
      status: 'succeeded',
      stripeChargeId: paymentIntent.latest_charge as string | undefined,
      metadata: {
        ...payment.metadata,
        succeededAt: new Date().toISOString(),
        amountReceived: paymentIntent.amount_received,
      },
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  if (payment.type === 'application_fee') {
    await processApplicationFeeTransfer(payment.id);
  }
}

/**
 * Handle failed payment intent.
 * Updates payment status with failure reason.
 * DB-level idempotency: skip if already in terminal state.
 */
export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const payment = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, paymentIntent.id),
  });

  if (!payment) {
    throw new Error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
  }

  // DB-level idempotency: skip if already in terminal state
  if (payment.status === 'failed' || payment.status === 'succeeded') {
    return;
  }

  await db
    .update(payments)
    .set({
      status: 'failed',
      metadata: {
        ...payment.metadata,
        failureReason:
          paymentIntent.last_payment_error?.message || 'Unknown error',
      },
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));
}

/**
 * Handle Connected Account updates from Stripe Connect.
 * Syncs capability flags (charges_enabled, payouts_enabled, details_submitted).
 */
export async function handleAccountUpdated(
  account: Stripe.Account
): Promise<void> {
  const existingAccount = await db.query.stripeAccounts.findFirst({
    where: eq(stripeAccounts.stripeAccountId, account.id),
  });

  if (!existingAccount) {
    // Account not tracked in our system - skip silently
    return;
  }

  await db
    .update(stripeAccounts)
    .set({
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      updatedAt: new Date(),
    })
    .where(eq(stripeAccounts.id, existingAccount.id));
}

/**
 * Handle transfer.created event.
 * Records transfer details in transactions table.
 * Uses insert-with-conflict-handling for atomic idempotency.
 */
export async function handleTransferCreated(
  transfer: Stripe.Transfer
): Promise<void> {
  const paymentId = transfer.metadata?.paymentId;
  if (!paymentId) {
    // Transfer not linked to a payment in our system - skip
    return;
  }

  try {
    await db.insert(transactions).values({
      id: `txn_${transfer.id}`,
      paymentId,
      recipientType: 'seller',
      recipientId: transfer.metadata?.recipientId || null,
      amount: transfer.amount,
      stripeTransferId: transfer.id,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: unknown) {
    // Primary key violation means already recorded - idempotent
    const dbError = error as { code?: string };
    if (dbError.code === '23505') {
      return;
    }
    throw error;
  }
}
