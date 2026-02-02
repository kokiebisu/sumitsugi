import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { processApplicationFeeTransfer } from '@/app/actions/payment';
import type Stripe from 'stripe';

/**
 * Stripe webhook handler for payment events
 * Handles payment_intent.succeeded, payment_intent.payment_failed, and transfer events
 */
export async function POST(request: Request) {
  try {
    // Get signature from headers
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook secret is configured
    if (!STRIPE_CONFIG.webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
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

    // Handle event types
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

        case 'transfer.created': {
          const transfer = event.data.object as Stripe.Transfer;
          console.log('Transfer created:', transfer);
          break;
        }

        case 'transfer.updated': {
          const transfer = event.data.object as Stripe.Transfer;
          console.log('Transfer updated:', transfer);
          break;
        }

        default: {
          // Unhandled event type - log and continue
          // This is intentional - we don't want to fail on unhandled events
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      // Handle payment not found errors with 404
      if (
        error instanceof Error &&
        error.message.includes('Payment not found')
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      // All other errors return 500
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 * - Update payment status to succeeded
 * - For application_fee: trigger automatic transfer to previous tenant
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // Find payment in database
  const payment = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, paymentIntent.id),
  });

  if (!payment) {
    throw new Error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
  }

  // Update payment status
  await db
    .update(payments)
    .set({
      status: 'succeeded',
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // For application fee payments, automatically trigger transfer
  if (payment.type === 'application_fee') {
    await processApplicationFeeTransfer(payment.id);
  }
}

/**
 * Handle failed payment intent
 * - Update payment status to failed
 * - Store failure reason in metadata
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  // Find payment in database
  const payment = await db.query.payments.findFirst({
    where: eq(payments.stripePaymentIntentId, paymentIntent.id),
  });

  if (!payment) {
    throw new Error(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
  }

  // Update payment status with failure reason
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
