'use server';

import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';
import { stripeAccounts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface ConnectAccountResult {
  success: boolean;
  accountId?: string;
  error?: string;
}

/**
 * Create Stripe Connect Account for user
 */
export async function createConnectAccount(
  userId: string,
  accountType: 'previous_tenant' | 'landlord' | 'property_management',
  email: string
): Promise<ConnectAccountResult> {
  try {
    // Check if account already exists
    const existing = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, userId),
    });

    if (existing) {
      return {
        success: true,
        accountId: existing.stripeAccountId,
      };
    }

    // Create Stripe Connect Account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'JP',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
    });

    // Save to database
    await db.insert(stripeAccounts).values({
      userId,
      stripeAccountId: account.id,
      accountType: 'express',
      onboardingCompleted: false,
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    });

    revalidatePath('/account');

    return {
      success: true,
      accountId: account.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate onboarding link for Stripe Connect Account
 */
export async function getConnectAccountOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      success: true,
      url: accountLink.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Stripe Connect Account status
 */
export async function getConnectAccountStatus(userId: string) {
  try {
    const account = await db.query.stripeAccounts.findFirst({
      where: eq(stripeAccounts.userId, userId),
    });

    if (!account) {
      return { success: true, exists: false };
    }

    // Fetch latest status from Stripe
    const stripeAccount = await stripe.accounts.retrieve(
      account.stripeAccountId
    );

    // Update local database
    await db
      .update(stripeAccounts)
      .set({
        detailsSubmitted: stripeAccount.details_submitted || false,
        chargesEnabled: stripeAccount.charges_enabled || false,
        payoutsEnabled: stripeAccount.payouts_enabled || false,
        onboardingCompleted: stripeAccount.details_submitted || false,
        updatedAt: new Date(),
      })
      .where(eq(stripeAccounts.userId, userId));

    return {
      success: true,
      exists: true,
      account: {
        stripeAccountId: account.stripeAccountId,
        onboardingCompleted: stripeAccount.details_submitted || false,
        chargesEnabled: stripeAccount.charges_enabled || false,
        payoutsEnabled: stripeAccount.payouts_enabled || false,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
