'use server';

import { stripe } from '@/lib/stripe/server';
import {
  calculateFeeBreakdown,
  calculatePreviousTenantAmount,
} from '@/lib/stripe/server';
import { db } from '@/db';
import {
  payments,
  transactions,
  stripeAccounts,
  properties,
} from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface EscrowReleaseResult {
  success: boolean;
  transferIds?: {
    previousTenant?: string;
    platformFee?: string;
  };
  error?: string;
}

export interface HandoverConfirmationResult {
  success: boolean;
  error?: string;
}

/**
 * Release escrowed funds and distribute to all parties
 * Called after handover completion and dispute period passes (24-48h)
 *
 * Distribution:
 * 1. Previous tenant - calculated amount (handoverFee - cleaning - landlord - platform)
 * 2. Platform fee - 15% of handover fee
 * 3. Phase 1: Landlord and property management transfers not yet implemented
 */
export async function releaseEscrowAndDistribute(
  propertyId: string
): Promise<EscrowReleaseResult> {
  try {
    // Get property details with handover fee
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return {
        success: false,
        error: 'Property not found',
      };
    }

    if (!property.handoverFee) {
      return {
        success: false,
        error: 'Property has no handover fee set',
      };
    }

    // Get previous tenant's Stripe Connect account
    const previousTenantAccount = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, property.userId),
    });

    if (!previousTenantAccount) {
      return {
        success: false,
        error: 'Previous tenant does not have a Stripe account',
      };
    }

    if (!previousTenantAccount.payoutsEnabled) {
      return {
        success: false,
        error: 'Previous tenant Stripe account is not ready to receive payouts',
      };
    }

    // Calculate fee breakdown
    const breakdown = calculateFeeBreakdown(property.handoverFee);
    const previousTenantAmount = calculatePreviousTenantAmount(
      property.handoverFee
    );

    // Get all escrowed payments (deposit + remaining with status='succeeded')
    const escrowedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.propertyId, propertyId),
        inArray(payments.type, ['deposit', 'remaining']),
        eq(payments.status, 'succeeded')
      ),
    });

    if (escrowedPayments.length === 0) {
      return {
        success: false,
        error: 'No escrowed payments found for this property',
      };
    }

    // Verify total escrowed amount matches expected handover fee
    const totalEscrowed = escrowedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    if (totalEscrowed !== property.handoverFee) {
      return {
        success: false,
        error: `Escrowed amount (¥${totalEscrowed}) does not match handover fee (¥${property.handoverFee})`,
      };
    }

    // Capture all escrowed PaymentIntents (they were authorized with manual capture)
    for (const payment of escrowedPayments) {
      if (!payment.stripePaymentIntentId) {
        return {
          success: false,
          error: `Payment ${payment.id} missing Stripe PaymentIntent ID`,
        };
      }

      // Capture the held payment
      await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
    }

    // Transfer to previous tenant
    const previousTenantTransfer = await stripe.transfers.create({
      amount: previousTenantAmount,
      currency: 'jpy',
      destination: previousTenantAccount.stripeAccountId,
      metadata: {
        propertyId,
        recipientType: 'seller',
        recipientId: property.userId,
      },
    });

    // Record previous tenant transaction
    await db.insert(transactions).values({
      paymentId: escrowedPayments[0].id, // Link to first escrowed payment
      recipientType: 'seller',
      recipientId: property.userId,
      amount: previousTenantAmount,
      stripeTransferId: previousTenantTransfer.id,
      status: 'completed',
    });

    // Record platform fee transaction (no actual transfer, just record)
    await db.insert(transactions).values({
      paymentId: escrowedPayments[0].id,
      recipientType: 'platform',
      recipientId: null,
      amount: breakdown.platformFee,
      stripeTransferId: null, // Platform keeps the fee, no transfer needed
      status: 'completed',
    });

    // TODO Phase 2: Add landlord and property management transfers
    // - Transfer landlord incentive (breakdown.landlordIncentive)
    // - Transfer cleaning fee to property management (breakdown.additionalCleaningFee)

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath('/account/sales');

    return {
      success: true,
      transferIds: {
        previousTenant: previousTenantTransfer.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Confirm handover completion from buyer or seller side
 * TODO: Implement confirmation tracking and automatic escrow release scheduling
 *
 * Future implementation:
 * - Track confirmations from both parties (buyer + seller)
 * - After both confirm, schedule escrow release in 24-48h
 * - Send notifications to both parties
 * - Handle dispute flow if only one party confirms
 *
 * @param propertyId - Property ID for the handover
 * @param userId - User ID confirming completion
 * @param role - User role: 'buyer' | 'seller'
 */
export async function confirmHandoverCompletion(
  propertyId: string,
  userId: string,
  role: 'buyer' | 'seller'
): Promise<HandoverConfirmationResult> {
  // TODO: Implement handover confirmation tracking
  // For now, return success stub
  return {
    success: true,
  };
}
