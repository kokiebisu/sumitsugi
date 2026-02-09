import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { db } from '@/db';
import { payments, stripeAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processApplicationFeeTransfer } from '@/app/actions/payment';
import type Stripe from 'stripe';

/**
 * Stripe webhook handler for payment and Connect events
 * Handles: payment_intent.succeeded, payment_intent.payment_failed,
 *          account.updated, transfer.created, transfer.updated
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!STRIPE_CONFIG.webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid signature' },
        { status: 400 }
      );
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentSucceeded(paymentIntent);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await handlePaymentIntentFailed(paymentIntent);
          break;
        }

        case 'account.updated': {
          const account = event.data.object as Stripe.Account;
          await handleAccountUpdated(account);
          break;
        }

        case 'transfer.created':
        case 'transfer.updated': {
          // Transfer events are acknowledged but require no action
          // Transfer status is tracked via payment records
          break;
        }

        default: {
          // Unhandled event type - acknowledge receipt without processing
          break;
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Payment not found')
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      throw error;
    }
  } catch {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 * Updates payment status and triggers transfer for application fees
 */
async function handlePaymentIntentSucceeded(
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
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  if (payment.type === 'application_fee') {
    await processApplicationFeeTransfer(payment.id);
  }
}

/**
 * Handle failed payment intent
 * Updates payment status with failure reason
 */
async function handlePaymentIntentFailed(
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
 * Handle Connected Account updates from Stripe Connect
 * Syncs capability flags (charges_enabled, payouts_enabled, details_submitted)
 */
async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
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
