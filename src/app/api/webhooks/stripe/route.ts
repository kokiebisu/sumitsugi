import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleAccountUpdated,
  handleTransferCreated,
  isEventProcessed,
  markEventProcessed,
} from '@/lib/stripe/webhooks';
import type Stripe from 'stripe';

/**
 * Stripe webhook handler for payment and Connect events.
 * Handles: payment_intent.succeeded, payment_intent.payment_failed,
 *          account.updated, transfer.created, transfer.updated
 *
 * Features:
 * - Signature verification via stripe.webhooks.constructEvent
 * - Idempotency: duplicate events are safely skipped
 * - Extracted handlers in @/lib/stripe/webhooks for testability
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
        {
          error: error instanceof Error ? error.message : 'Invalid signature',
        },
        { status: 400 }
      );
    }

    // Idempotency check: skip already-processed events
    if (isEventProcessed(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
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

        case 'transfer.created': {
          const transfer = event.data.object as Stripe.Transfer;
          await handleTransferCreated(transfer);
          break;
        }

        case 'transfer.updated': {
          // Transfer updates are acknowledged but require no action
          // Transfer status is tracked via transaction records
          break;
        }

        default: {
          // Unhandled event type - acknowledge receipt without processing
          break;
        }
      }

      // Mark event as processed after successful handling
      markEventProcessed(event.id);

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
