'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  createConnectAccount,
  getConnectAccountOnboardingLink,
  getConnectAccountStatus,
} from '@/app/actions/stripe-connect';

export interface OnboardingResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface AccountStatusResult {
  success: boolean;
  exists?: boolean;
  account?: {
    stripeAccountId: string;
    onboardingCompleted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
  error?: string;
}

/**
 * Get authenticated session
 */
async function getSession() {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList });
}

/**
 * Get base URL for redirect URLs
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Start Stripe Connect onboarding for the current user.
 * Creates a Connected Account if needed and returns the onboarding URL.
 */
export async function startStripeOnboarding(): Promise<OnboardingResult> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { success: false, error: 'ログインが必要です' };
  }

  const { id: userId, email } = session.user;
  const baseUrl = getBaseUrl();

  // Create Connected Account (or get existing)
  const accountResult = await createConnectAccount(
    userId,
    'previous_tenant',
    email
  );

  if (!accountResult.success || !accountResult.accountId) {
    return {
      success: false,
      error: accountResult.error || 'アカウント作成に失敗しました',
    };
  }

  // Generate onboarding link
  const linkResult = await getConnectAccountOnboardingLink(
    accountResult.accountId,
    `${baseUrl}/listing/onboarding`,
    `${baseUrl}/listing/onboarding/refresh`
  );

  if (!linkResult.success || !linkResult.url) {
    return {
      success: false,
      error: linkResult.error || 'オンボーディングリンクの生成に失敗しました',
    };
  }

  return { success: true, url: linkResult.url };
}

/**
 * Get Stripe Connect account status for the current user.
 */
export async function getStripeAccountStatus(): Promise<AccountStatusResult> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { success: false, error: 'ログインが必要です' };
  }

  return getConnectAccountStatus(session.user.id);
}
