import { describe, it, expect, vi, beforeEach } from 'vitest';
import { confirmHandoverCompletion } from '../escrow';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    query: {
      handoverConfirmations: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'hc-1',
              propertyId: 'prop-123',
              buyerConfirmedAt: new Date(),
              sellerConfirmedAt: null,
            },
          ]),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    paymentIntents: { capture: vi.fn() },
    transfers: { create: vi.fn().mockResolvedValue({ id: 'tr_123' }) },
  },
  calculateFeeBreakdown: vi.fn().mockReturnValue({
    handoverFee: 100000,
    platformFee: 15000,
    additionalCleaningFee: 8000,
    landlordIncentive: 0,
    previousTenantAmount: 77000,
  }),
  calculatePreviousTenantAmount: vi.fn().mockReturnValue(77000),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('confirmHandoverCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should record buyer confirmation', async () => {
    const result = await confirmHandoverCompletion(
      'prop-123',
      'buyer-456',
      'buyer'
    );

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('should record seller confirmation', async () => {
    const result = await confirmHandoverCompletion(
      'prop-123',
      'seller-789',
      'seller'
    );

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('should indicate when both parties have confirmed', async () => {
    // Mock: insert returns a record with both confirmations
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'hc-1',
              propertyId: 'prop-123',
              buyerConfirmedAt: new Date(),
              sellerConfirmedAt: new Date(),
            },
          ]),
        }),
      }),
    } as any);

    const result = await confirmHandoverCompletion(
      'prop-123',
      'buyer-456',
      'buyer'
    );

    expect(result.success).toBe(true);
    expect(result.bothConfirmed).toBe(true);
  });

  it('should indicate when only one party has confirmed', async () => {
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'hc-1',
              propertyId: 'prop-123',
              buyerConfirmedAt: new Date(),
              sellerConfirmedAt: null,
            },
          ]),
        }),
      }),
    } as any);

    const result = await confirmHandoverCompletion(
      'prop-123',
      'buyer-456',
      'buyer'
    );

    expect(result.success).toBe(true);
    expect(result.bothConfirmed).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(db.insert).mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const result = await confirmHandoverCompletion(
      'prop-123',
      'buyer-456',
      'buyer'
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed');
  });
});
