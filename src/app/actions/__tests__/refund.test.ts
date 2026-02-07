import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processRefund } from '../refund';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';

// Mock dependencies
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    refunds: {
      create: vi.fn(),
    },
    paymentIntents: {
      cancel: vi.fn(),
    },
  },
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      payments: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      properties: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    // Mock transaction to execute the callback with a mock tx object
    transaction: vi.fn(async (cb: (_tx: any) => Promise<void>) => {
      await cb({
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(),
          })),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(),
          })),
        })),
      });
    }),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// We do NOT mock cancellation-penalty — let it use the real module

describe('processRefund', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPropertyId = 'prop-123';

  it('should refund application fee when buyer cancels pre-viewing', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'application_fee',
        amount: 20000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_app123',
      },
    ] as any);

    vi.mocked(stripe.refunds.create).mockResolvedValue({
      id: 're_test123',
      amount: 20000,
    } as any);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'buyer',
      phase: 'pre_viewing',
    });

    expect(result.success).toBe(true);
    expect(result.penaltyAmount).toBe(0);
    // Application fee refunded pre-viewing
    expect(result.refundAmount).toBe(20000);
    expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
  });

  it('should forfeit deposit when buyer cancels post-deposit', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'application_fee',
        amount: 20000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_app123',
      },
      {
        id: 'pay-2',
        type: 'deposit',
        amount: 30000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_dep123',
      },
    ] as any);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'buyer',
      phase: 'post_deposit',
    });

    expect(result.success).toBe(true);
    expect(result.depositForfeited).toBe(true);
    // Buyer post-deposit: deposit forfeited, application fee not refundable
    expect(result.penaltyAmount).toBe(30000);
    expect(result.refundAmount).toBe(0);
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });

  it('should issue full refund when seller cancels post-deposit', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'application_fee',
        amount: 20000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_app123',
      },
      {
        id: 'pay-2',
        type: 'deposit',
        amount: 30000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_dep123',
      },
    ] as any);

    vi.mocked(stripe.refunds.create).mockResolvedValue({
      id: 're_test123',
      amount: 20000,
    } as any);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'seller',
      phase: 'post_deposit',
    });

    expect(result.success).toBe(true);
    expect(result.penaltyAmount).toBe(0);
    // Seller cancellation: all amounts refunded (deposit 30k + app fee 20k)
    expect(result.refundAmount).toBe(50000);
    expect(stripe.refunds.create).toHaveBeenCalledTimes(2);
  });

  it('should issue full refund for screening failure', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'application_fee',
        amount: 20000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_app123',
      },
    ] as any);

    vi.mocked(stripe.refunds.create).mockResolvedValue({
      id: 're_test123',
      amount: 20000,
    } as any);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'screening_failure',
      phase: 'post_deposit',
    });

    expect(result.success).toBe(true);
    expect(result.penaltyAmount).toBe(0);
    // Screening failure: application fee refunded
    expect(result.refundAmount).toBe(20000);
    expect(stripe.refunds.create).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending payments instead of refunding', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'deposit',
        amount: 30000,
        status: 'pending',
        stripePaymentIntentId: 'pi_dep123',
      },
    ] as any);

    vi.mocked(stripe.paymentIntents.cancel).mockResolvedValue({
      id: 'pi_dep123',
      status: 'canceled',
    } as any);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'mutual',
      phase: 'post_deposit',
    });

    expect(result.success).toBe(true);
    expect(stripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_dep123');
    // No succeeded payments, so no refunds
    expect(stripe.refunds.create).not.toHaveBeenCalled();
  });

  it('should fail if property not found', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue(undefined);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'buyer',
      phase: 'pre_viewing',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Property not found');
  });

  it('should fail if no payments found', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([]);

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'buyer',
      phase: 'pre_viewing',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('No payments found for this property');
  });

  it('should reject invalid input with Zod validation', async () => {
    const result = await processRefund({
      propertyId: '',
      cancelledBy: 'invalid' as any,
      phase: 'pre_viewing',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('入力が不正です');
  });

  it('should handle Stripe API errors gracefully', async () => {
    vi.mocked(db.query.properties.findFirst).mockResolvedValue({
      id: mockPropertyId,
      userId: 'seller-789',
      handoverFee: 100000,
    } as any);

    vi.mocked(db.query.payments.findMany).mockResolvedValue([
      {
        id: 'pay-1',
        type: 'application_fee',
        amount: 20000,
        status: 'succeeded',
        stripePaymentIntentId: 'pi_app123',
      },
    ] as any);

    vi.mocked(stripe.refunds.create).mockRejectedValue(
      new Error('Stripe refund error')
    );

    const result = await processRefund({
      propertyId: mockPropertyId,
      cancelledBy: 'seller',
      phase: 'post_deposit',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Stripe refund error');
  });
});
