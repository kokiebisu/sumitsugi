'use server';

import { randomUUID } from 'crypto';
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
  handoverConfirmations,
} from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import zod from 'zod';

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
  bothConfirmed?: boolean;
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
      id: randomUUID(),
      paymentId: escrowedPayments[0].id, // Link to first escrowed payment
      recipientType: 'seller',
      recipientId: property.userId,
      amount: previousTenantAmount,
      stripeTransferId: previousTenantTransfer.id,
      status: 'completed',
    });

    // Record platform fee transaction (no actual transfer, just record)
    await db.insert(transactions).values({
      id: randomUUID(),
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

const confirmHandoverSchema = zod.object({
  propertyId: zod.string().min(1, 'Property ID is required'),
  userId: zod.string().min(1, 'User ID is required'),
  role: zod.enum(['buyer', 'seller']),
});

/**
 * Confirm handover completion from buyer or seller side.
 *
 * Uses upsert to create or update the handover_confirmations record.
 * When both buyer and seller have confirmed, bothConfirmed=true is returned
 * and the caller can trigger escrow release (Phase 1: immediate release).
 *
 * TODO Phase 2: Replace userId param with session-based auth (getSession)
 * TODO Phase 2: Verify user has claimed role for property (seller = property.userId, buyer = inquiry/thread)
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
  try {
    const validated = confirmHandoverSchema.parse({ propertyId, userId, role });
    const now = new Date();
    const confirmationId = randomUUID();

    const setFields =
      validated.role === 'buyer'
        ? { buyerId: validated.userId, buyerConfirmedAt: now }
        : { sellerId: validated.userId, sellerConfirmedAt: now };

    const [record] = await db
      .insert(handoverConfirmations)
      .values({
        id: confirmationId,
        propertyId: validated.propertyId,
        ...setFields,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: handoverConfirmations.propertyId,
        set: setFields,
      })
      .returning();

    const bothConfirmed = !!(
      record.buyerConfirmedAt && record.sellerConfirmedAt
    );

    revalidatePath(`/properties/${validated.propertyId}`);

    return {
      success: true,
      bothConfirmed,
    };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
