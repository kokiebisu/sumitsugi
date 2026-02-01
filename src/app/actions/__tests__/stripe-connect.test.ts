import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';

// Create mock functions using vi.hoisted to ensure they're available during hoisting
const { mockCreate, mockRetrieve, mockAccountLinksCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRetrieve: vi.fn(),
  mockAccountLinksCreate: vi.fn(),
}));

const { mockFindFirst, mockInsert, mockUpdate } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockInsert: vi.fn(),
  mockUpdate: vi.fn(),
}));

// Mock the Stripe module
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    accounts: {
      create: mockCreate,
      retrieve: mockRetrieve,
    },
    accountLinks: {
      create: mockAccountLinksCreate,
    },
  },
}));

// Mock database
vi.mock('@/db', () => ({
  db: {
    query: {
      stripeAccounts: {
        findFirst: mockFindFirst,
      },
    },
    insert: vi.fn(() => ({
      values: mockInsert,
    })),
    update: vi.fn(() => ({
      set: mockUpdate,
    })),
  },
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    eq: vi.fn((field: unknown, value: unknown) => ({ field, value })),
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import after mocks
import {
  createConnectAccount,
  getConnectAccountOnboardingLink,
  getConnectAccountStatus,
} from '../stripe-connect';

describe('Stripe Connect Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createConnectAccount', () => {
    it('should return existing account if already exists', async () => {
      const existingAccount = {
        userId: 'user-123',
        stripeAccountId: 'acct_existing',
        accountType: 'express' as const,
      };

      mockFindFirst.mockResolvedValue(existingAccount);

      const result = await createConnectAccount(
        'user-123',
        'previous_tenant',
        'test@example.com'
      );

      expect(result).toEqual({
        success: true,
        accountId: 'acct_existing',
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should create new Connect account for previous tenant', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'acct_new123',
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      } as Partial<Stripe.Account>);
      mockInsert.mockResolvedValue(undefined);

      const result = await createConnectAccount(
        'user-123',
        'previous_tenant',
        'tenant@example.com'
      );

      expect(result.success).toBe(true);
      expect(result.accountId).toBe('acct_new123');
      expect(mockCreate).toHaveBeenCalledWith({
        type: 'express',
        country: 'JP',
        email: 'tenant@example.com',
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
    });

    it('should create new Connect account for landlord', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'acct_landlord456',
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      } as Partial<Stripe.Account>);
      mockInsert.mockResolvedValue(undefined);

      const result = await createConnectAccount(
        'user-456',
        'landlord',
        'landlord@example.com'
      );

      expect(result.success).toBe(true);
      expect(result.accountId).toBe('acct_landlord456');
    });

    it('should handle Stripe API errors', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockCreate.mockRejectedValue(new Error('Stripe API error'));

      const result = await createConnectAccount(
        'user-789',
        'previous_tenant',
        'error@example.com'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe API error');
    });

    it('should handle database errors', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database connection failed'));

      const result = await createConnectAccount(
        'user-999',
        'previous_tenant',
        'db-error@example.com'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('getConnectAccountOnboardingLink', () => {
    it('should generate onboarding link successfully', async () => {
      mockAccountLinksCreate.mockResolvedValue({
        url: 'https://connect.stripe.com/setup/acct_123',
      } as Stripe.AccountLink);

      const result = await getConnectAccountOnboardingLink(
        'acct_123',
        'https://example.com/return',
        'https://example.com/refresh'
      );

      expect(result.success).toBe(true);
      expect(result.url).toBe('https://connect.stripe.com/setup/acct_123');
      expect(mockAccountLinksCreate).toHaveBeenCalledWith({
        account: 'acct_123',
        refresh_url: 'https://example.com/refresh',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });
    });

    it('should handle Stripe API errors when creating link', async () => {
      mockAccountLinksCreate.mockRejectedValue(
        new Error('Account not found')
      );

      const result = await getConnectAccountOnboardingLink(
        'acct_invalid',
        'https://example.com/return',
        'https://example.com/refresh'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
    });
  });

  describe('getConnectAccountStatus', () => {
    it('should return not exists if account not found', async () => {
      mockFindFirst.mockResolvedValue(null);

      const result = await getConnectAccountStatus('user-nonexistent');

      expect(result).toEqual({
        success: true,
        exists: false,
      });
    });

    it('should fetch and update account status from Stripe', async () => {
      const dbAccount = {
        userId: 'user-123',
        stripeAccountId: 'acct_123',
        accountType: 'express',
        onboardingCompleted: false,
      };

      mockFindFirst.mockResolvedValue(dbAccount);
      mockRetrieve.mockResolvedValue({
        id: 'acct_123',
        details_submitted: true,
        charges_enabled: true,
        payouts_enabled: true,
      } as Partial<Stripe.Account>);

      const mockWhere = vi.fn();
      mockUpdate.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue(undefined);

      const result = await getConnectAccountStatus('user-123');

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.account).toEqual({
        stripeAccountId: 'acct_123',
        onboardingCompleted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
      });
      expect(mockRetrieve).toHaveBeenCalledWith('acct_123');
    });

    it('should handle partially onboarded accounts', async () => {
      const dbAccount = {
        userId: 'user-456',
        stripeAccountId: 'acct_456',
        accountType: 'express',
      };

      mockFindFirst.mockResolvedValue(dbAccount);
      mockRetrieve.mockResolvedValue({
        id: 'acct_456',
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
      } as Partial<Stripe.Account>);

      const mockWhere = vi.fn();
      mockUpdate.mockReturnValue({ where: mockWhere });
      mockWhere.mockResolvedValue(undefined);

      const result = await getConnectAccountStatus('user-456');

      expect(result.success).toBe(true);
      expect(result.account?.onboardingCompleted).toBe(false);
      expect(result.account?.chargesEnabled).toBe(false);
    });

    it('should handle Stripe API errors', async () => {
      mockFindFirst.mockResolvedValue({
        userId: 'user-789',
        stripeAccountId: 'acct_789',
      });
      mockRetrieve.mockRejectedValue(new Error('Stripe API unavailable'));

      const result = await getConnectAccountStatus('user-789');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe API unavailable');
    });
  });
});
