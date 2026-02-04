'use server';

import { randomUUID } from 'crypto';
import { stripe } from '@/lib/stripe/server';
import { calculateDeposit, calculateFeeBreakdown } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import { db } from '@/db';
import {
  payments,
  transactions,
  stripeAccounts,
  properties,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreatePaymentResult {
  success: boolean;
  clientSecret?: string;
  paymentId?: string;
  error?: string;
}

export interface TransferResult {
  success: boolean;
  transferId?: string;
  error?: string;
}

/**
 * Create application fee payment (¥20,000 non-refundable)
 * This is paid immediately and transferred directly to the previous tenant (not held in escrow)
 */
export async function createApplicationFeePayment(
  propertyId: string,
  userId: string,
  previousTenantId: string
): Promise<CreatePaymentResult> {
  try {
    // Get previous tenant's Stripe Connect account
    const previousTenantAccount = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, previousTenantId),
    });

    if (!previousTenantAccount) {
      return {
        success: false,
        error: 'Previous tenant does not have a Stripe account',
      };
    }

    if (!previousTenantAccount.chargesEnabled) {
      return {
        success: false,
        error:
          'Previous tenant Stripe account is not ready to receive payments',
      };
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: STRIPE_CONFIG.APPLICATION_FEE,
      currency: 'jpy',
      metadata: {
        propertyId,
        userId,
        previousTenantId,
        paymentType: 'application_fee',
      },
      transfer_data: {
        destination: previousTenantAccount.stripeAccountId,
      },
    });

    // Save payment to database
    const [payment] = await db
      .insert(payments)
      .values({
        id: randomUUID(),
        propertyId,
        userId,
        type: 'application_fee',
        amount: STRIPE_CONFIG.APPLICATION_FEE,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        metadata: {
          previousTenantId,
          previousTenantStripeAccountId: previousTenantAccount.stripeAccountId,
        },
      })
      .returning();

    revalidatePath('/properties/[id]');

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentId: payment.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process application fee transfer after payment succeeds
 * Called by webhook handler when payment is confirmed
 */
export async function processApplicationFeeTransfer(
  paymentId: string
): Promise<TransferResult> {
  try {
    // Get payment details
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    if (payment.type !== 'application_fee') {
      return {
        success: false,
        error: 'Invalid payment type',
      };
    }

    if (!payment.stripePaymentIntentId) {
      return {
        success: false,
        error: 'Missing Stripe PaymentIntent ID',
      };
    }

    // Get payment intent to find transfer
    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentIntentId
    );

    if (!paymentIntent.latest_charge) {
      return {
        success: false,
        error: 'No charge found for payment',
      };
    }

    // Get charge to find transfer
    const charge = await stripe.charges.retrieve(
      paymentIntent.latest_charge as string
    );

    // Record transaction in database
    await db.insert(transactions).values({
      id: randomUUID(),
      paymentId: payment.id,
      recipientType: 'seller',
      recipientId: (payment.metadata as { previousTenantId?: string })
        ?.previousTenantId,
      amount: payment.amount,
      stripeTransferId: charge.transfer as string | null,
      status: 'completed',
    });

    // Update payment status
    await db
      .update(payments)
      .set({
        status: 'succeeded',
        stripeChargeId: charge.id,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    revalidatePath('/properties/[id]');

    return {
      success: true,
      transferId: charge.transfer as string | undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create deposit payment (30% of handover fee, held in escrow)
 * Uses manual capture to hold funds until dispute period passes
 */
export async function createDepositPayment(
  propertyId: string,
  userId: string,
  handoverFeeTotal: number
): Promise<CreatePaymentResult> {
  try {
    // Validate property exists and get details
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return {
        success: false,
        error: 'Property not found',
      };
    }

    // Calculate deposit amount
    const depositAmount = calculateDeposit(handoverFeeTotal);

    // Create PaymentIntent with manual capture (held in escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'jpy',
      capture_method: 'manual', // Hold for escrow
      metadata: {
        propertyId,
        userId,
        previousTenantId: property.userId,
        paymentType: 'deposit',
        handoverFeeTotal: handoverFeeTotal.toString(),
      },
    });

    // Save payment to database
    const [payment] = await db
      .insert(payments)
      .values({
        id: randomUUID(),
        propertyId,
        userId,
        type: 'deposit',
        amount: depositAmount,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        metadata: {
          handoverFeeTotal,
          previousTenantId: property.userId,
        },
      })
      .returning();

    revalidatePath('/properties/[id]');

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentId: payment.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create remaining payment (70% of handover fee, held in escrow)
 * Uses manual capture to hold funds until dispute period passes
 */
export async function createRemainingPayment(
  propertyId: string,
  userId: string,
  handoverFeeTotal: number
): Promise<CreatePaymentResult> {
  try {
    // Validate property exists and get details
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return {
        success: false,
        error: 'Property not found',
      };
    }

    // Calculate remaining amount
    const breakdown = calculateFeeBreakdown(handoverFeeTotal);

    // Create PaymentIntent with manual capture (held in escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: breakdown.remaining,
      currency: 'jpy',
      capture_method: 'manual', // Hold for escrow
      metadata: {
        propertyId,
        userId,
        previousTenantId: property.userId,
        paymentType: 'remaining',
        handoverFeeTotal: handoverFeeTotal.toString(),
      },
    });

    // Save payment to database
    const [payment] = await db
      .insert(payments)
      .values({
        id: randomUUID(),
        propertyId,
        userId,
        type: 'remaining',
        amount: breakdown.remaining,
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        metadata: {
          handoverFeeTotal,
          previousTenantId: property.userId,
        },
      })
      .returning();

    revalidatePath('/properties/[id]');

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentId: payment.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
