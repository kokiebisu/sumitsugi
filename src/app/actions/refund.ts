'use server';

import { randomUUID } from 'crypto';
import zod from 'zod';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';
import { payments, transactions, properties } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import {
  calculatePenalty,
  type CancelledBy,
  type CancellationPhase,
} from '@/lib/cancellation-penalty';

const processRefundSchema = zod.object({
  propertyId: zod.string().min(1),
  cancelledBy: zod.enum(['buyer', 'seller', 'screening_failure', 'mutual']),
  phase: zod.enum(['pre_viewing', 'post_deposit', 'post_remaining_payment']),
});

export interface ProcessRefundInput {
  propertyId: string;
  cancelledBy: CancelledBy;
  phase: CancellationPhase;
}

export interface ProcessRefundResult {
  success: boolean;
  penaltyAmount?: number;
  refundAmount?: number;
  depositForfeited?: boolean;
  refundIds?: string[];
  error?: string;
}

/**
 * Process refund for a cancelled handover transaction.
 *
 * Combines cancellation penalty calculation with Stripe refund execution:
 * - Uses calculatePenalty() for deposit/remaining payment penalty logic
 * - Handles application fee refund separately (non-refundable after transfer,
 *   but refundable pre-viewing or when seller/screening cancels)
 * - Cancels pending (uncaptured) payments via PaymentIntent cancel
 * - Refunds succeeded payments via Stripe Refund
 *
 * TODO: Add authentication/authorization checks when auth system is implemented.
 * This action should verify the caller is the buyer, seller, or admin for the property.
 */
export async function processRefund(
  input: ProcessRefundInput
): Promise<ProcessRefundResult> {
  try {
    const validated = processRefundSchema.parse(input);
    const { propertyId, cancelledBy, phase } = validated;

    // Get property details
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    // Get all payments for this property
    const propertyPayments = await db.query.payments.findMany({
      where: eq(payments.propertyId, propertyId),
    });

    if (propertyPayments.length === 0) {
      return { success: false, error: 'No payments found for this property' };
    }

    // Separate payments by type
    const succeededPayments = propertyPayments.filter(
      (p) => p.status === 'succeeded' && p.stripePaymentIntentId
    );
    const pendingPayments = propertyPayments.filter(
      (p) => p.status === 'pending' && p.stripePaymentIntentId
    );

    // Calculate amounts by payment type
    const depositPaid = succeededPayments
      .filter((p) => p.type === 'deposit')
      .reduce((sum, p) => sum + p.amount, 0);

    const remainingPaid = succeededPayments
      .filter((p) => p.type === 'remaining')
      .reduce((sum, p) => sum + p.amount, 0);

    const applicationFeePaid = succeededPayments
      .filter((p) => p.type === 'application_fee')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate penalty for deposit/remaining using the penalty module
    const penaltyResult = calculatePenalty({
      cancelledBy,
      phase,
      handoverFee: property.handoverFee ?? 0,
      depositPaid,
      remainingPaid,
    });

    // Determine application fee refund eligibility:
    // - Pre-viewing: application fee is refundable (no transfer made yet)
    // - Seller/screening cancellation: application fee refundable
    // - Buyer post-deposit: application fee already transferred, not refundable
    const shouldRefundApplicationFee =
      phase === 'pre_viewing' ||
      cancelledBy === 'seller' ||
      cancelledBy === 'screening_failure' ||
      cancelledBy === 'mutual';

    const applicationFeeRefund = shouldRefundApplicationFee
      ? applicationFeePaid
      : 0;

    const totalRefund = penaltyResult.refundAmount + applicationFeeRefund;

    const refundIds: string[] = [];

    // Use database transaction for atomicity
    await db.transaction(async (tx) => {
      // Cancel any pending payments first (no charge was made)
      for (const payment of pendingPayments) {
        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId!);
        await tx
          .update(payments)
          .set({ status: 'canceled', updatedAt: new Date() })
          .where(eq(payments.id, payment.id));
      }

      // Process refunds for succeeded payments
      if (totalRefund > 0) {
        let remainingRefund = totalRefund;

        for (const payment of succeededPayments) {
          if (remainingRefund <= 0) break;

          // Skip deposit if it's forfeited
          if (payment.type === 'deposit' && penaltyResult.depositForfeited) {
            continue;
          }

          // Skip application fee if not eligible for refund
          if (
            payment.type === 'application_fee' &&
            !shouldRefundApplicationFee
          ) {
            continue;
          }

          const refundAmount = Math.min(payment.amount, remainingRefund);

          const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId!,
            amount: refundAmount,
            metadata: {
              propertyId,
              cancelledBy,
              phase,
              reason: penaltyResult.reason,
            },
          });

          refundIds.push(refund.id);

          // Record refund transaction
          await tx.insert(transactions).values({
            id: randomUUID(),
            paymentId: payment.id,
            recipientType: 'platform',
            recipientId: null,
            amount: -refundAmount,
            stripeTransferId: refund.id,
            status: 'completed',
          });

          // Update payment status to 'refunded' (distinct from 'canceled')
          await tx
            .update(payments)
            .set({ status: 'refunded', updatedAt: new Date() })
            .where(eq(payments.id, payment.id));

          remainingRefund -= refundAmount;
        }
      }
    });

    revalidatePath(`/properties/${propertyId}`);

    return {
      success: true,
      penaltyAmount: penaltyResult.penaltyAmount,
      refundAmount: totalRefund,
      depositForfeited: penaltyResult.depositForfeited,
      refundIds: refundIds.length > 0 ? refundIds : undefined,
    };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return {
        success: false,
        error: `入力が不正です: ${error.errors.map((e) => e.message).join(', ')}`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
