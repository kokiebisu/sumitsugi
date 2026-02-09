import { db } from '@/db';
import { payments, transactions, stripeAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processApplicationFeeTransfer } from '@/app/actions/payment';
import type Stripe from 'stripe';

/**
 * In-memory idempotency store for processed webhook events.
 * Prevents duplicate processing when Stripe retries delivery.
 * Uses a bounded Set with TTL-based eviction.
 */
const PROCESSED_EVENTS = new Set<string>();
const MAX_STORED_EVENTS = 10_000;
const EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface EventRecord {
  id: string;
  timestamp: number;
}

const eventTimestamps: EventRecord[] = [];

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

  // Evict expired entries
  while (
    eventTimestamps.length > 0 &&
    now - eventTimestamps[0].timestamp > EVENT_TTL_MS
  ) {
    const expired = eventTimestamps.shift();
    if (expired) {
      PROCESSED_EVENTS.delete(expired.id);
    }
  }

  // Evict oldest if at capacity
  if (PROCESSED_EVENTS.size >= MAX_STORED_EVENTS) {
    const oldest = eventTimestamps.shift();
    if (oldest) {
      PROCESSED_EVENTS.delete(oldest.id);
    }
  }

  PROCESSED_EVENTS.add(eventId);
  eventTimestamps.push({ id: eventId, timestamp: now });
}

/**
 * Reset the idempotency store (for testing only).
 */
export function resetProcessedEvents(): void {
  PROCESSED_EVENTS.clear();
  eventTimestamps.length = 0;
}

/**
 * Handle successful payment intent.
 * Updates payment status and triggers transfer for application fees.
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
 */
export async function handleTransferCreated(
  transfer: Stripe.Transfer
): Promise<void> {
  // Find the payment associated with this transfer via metadata
  const paymentId = transfer.metadata?.paymentId;
  if (!paymentId) {
    // Transfer not linked to a payment in our system - skip
    return;
  }

  const existingTransaction = await db.query.transactions.findFirst({
    where: eq(transactions.stripeTransferId, transfer.id),
  });

  if (existingTransaction) {
    // Already recorded - idempotent
    return;
  }

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
}
