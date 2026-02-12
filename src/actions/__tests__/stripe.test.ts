import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));
const {
  mockCreateConnectAccount,
  mockGetOnboardingLink,
  mockGetAccountStatus,
} = vi.hoisted(() => ({
  mockCreateConnectAccount: vi.fn(),
  mockGetOnboardingLink: vi.fn(),
  mockGetAccountStatus: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}));
vi.mock('next/headers', () => ({ headers: vi.fn(() => new Headers()) }));
vi.mock('@/app/actions/stripe-connect', () => ({
  createConnectAccount: mockCreateConnectAccount,
  getConnectAccountOnboardingLink: mockGetOnboardingLink,
  getConnectAccountStatus: mockGetAccountStatus,
}));

import { startStripeOnboarding, getStripeAccountStatus } from '../stripe';

describe('Stripe Onboarding Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://sumitsugi.example.com';
  });

  describe('startStripeOnboarding', () => {
    it('should return error when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await startStripeOnboarding();
      expect(result).toEqual({ success: false, error: 'ログインが必要です' });
    });

    it('should create account and return onboarding URL', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });
      mockCreateConnectAccount.mockResolvedValue({
        success: true,
        accountId: 'acct_new123',
      });
      mockGetOnboardingLink.mockResolvedValue({
        success: true,
        url: 'https://connect.stripe.com/setup/acct_new123',
      });

      const result = await startStripeOnboarding();

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://connect.stripe.com/setup/acct_new123');
      expect(mockCreateConnectAccount).toHaveBeenCalledWith(
        'user-123',
        'previous_tenant',
        'test@example.com'
      );
      expect(mockGetOnboardingLink).toHaveBeenCalledWith(
        'acct_new123',
        'https://sumitsugi.example.com/listing/onboarding',
        'https://sumitsugi.example.com/listing/onboarding/refresh'
      );
    });

    it('should return error when account creation fails', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });
      mockCreateConnectAccount.mockResolvedValue({
        success: false,
        error: 'Stripe API error',
      });
      const result = await startStripeOnboarding();
      expect(result).toEqual({ success: false, error: 'Stripe API error' });
      expect(mockGetOnboardingLink).not.toHaveBeenCalled();
    });

    it('should return error when onboarding link creation fails', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });
      mockCreateConnectAccount.mockResolvedValue({
        success: true,
        accountId: 'acct_123',
      });
      mockGetOnboardingLink.mockResolvedValue({
        success: false,
        error: 'Link creation failed',
      });
      const result = await startStripeOnboarding();
      expect(result).toEqual({ success: false, error: 'Link creation failed' });
    });

    it('should use localhost fallback when NEXT_PUBLIC_APP_URL is not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      });
      mockCreateConnectAccount.mockResolvedValue({
        success: true,
        accountId: 'acct_123',
      });
      mockGetOnboardingLink.mockResolvedValue({
        success: true,
        url: 'https://connect.stripe.com/setup/acct_123',
      });

      await startStripeOnboarding();

      expect(mockGetOnboardingLink).toHaveBeenCalledWith(
        'acct_123',
        'http://localhost:3000/listing/onboarding',
        'http://localhost:3000/listing/onboarding/refresh'
      );
    });
  });

  describe('getStripeAccountStatus', () => {
    it('should return error when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await getStripeAccountStatus();
      expect(result).toEqual({ success: false, error: 'ログインが必要です' });
    });

    it('should return account status for authenticated user', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } });
      const mockStatus = {
        success: true,
        exists: true,
        account: {
          stripeAccountId: 'acct_123',
          onboardingCompleted: true,
          chargesEnabled: true,
          payoutsEnabled: true,
        },
      };
      mockGetAccountStatus.mockResolvedValue(mockStatus);

      const result = await getStripeAccountStatus();

      expect(result).toEqual(mockStatus);
      expect(mockGetAccountStatus).toHaveBeenCalledWith('user-123');
    });

    it('should return not exists when no account', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-456' } });
      mockGetAccountStatus.mockResolvedValue({ success: true, exists: false });
      const result = await getStripeAccountStatus();
      expect(result).toEqual({ success: true, exists: false });
    });
  });
});
