import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleAccountUpdated,
  handleTransferCreated,
  isEventProcessed,
  markEventProcessed,
  resetProcessedEvents,
} from '../webhooks';
import { db } from '@/db';
import type Stripe from 'stripe';

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    query: {
      payments: { findFirst: vi.fn() },
      stripeAccounts: { findFirst: vi.fn() },
      transactions: { findFirst: vi.fn() },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  payments: { stripePaymentIntentId: 'stripe_payment_intent_id', id: 'id' },
  stripeAccounts: { stripeAccountId: 'stripe_account_id', id: 'id' },
  transactions: { stripeTransferId: 'stripe_transfer_id', id: 'id' },
}));

vi.mock('@/app/actions/payment', () => ({
  processApplicationFeeTransfer: vi.fn().mockResolvedValue({
    success: true,
    transferId: 'tr_mock',
  }),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

describe('Webhook Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetProcessedEvents();
  });

  describe('idempotency', () => {
    it('should track processed events', () => {
      expect(isEventProcessed('evt_001')).toBe(false);
      markEventProcessed('evt_001');
      expect(isEventProcessed('evt_001')).toBe(true);
    });

    it('should not mark unprocessed events as processed', () => {
      markEventProcessed('evt_002');
      expect(isEventProcessed('evt_003')).toBe(false);
    });

    it('should reset processed events', () => {
      markEventProcessed('evt_004');
      resetProcessedEvents();
      expect(isEventProcessed('evt_004')).toBe(false);
    });
  });

  describe('handlePaymentIntentSucceeded', () => {
    it('should update payment status to succeeded', async () => {
      const mockPayment = {
        id: 'pay_123',
        type: 'deposit',
        status: 'pending',
        metadata: { customerNotes: 'test' },
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_123',
        amount_received: 50000,
        latest_charge: 'ch_123',
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentSucceeded(paymentIntent);

      expect(db.update).toHaveBeenCalled();
    });

    it('should trigger transfer for application_fee payments', async () => {
      const mockPayment = {
        id: 'pay_456',
        type: 'application_fee',
        status: 'pending',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_456',
        amount_received: 20000,
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentSucceeded(paymentIntent);

      const { processApplicationFeeTransfer } =
        await import('@/app/actions/payment');
      expect(processApplicationFeeTransfer).toHaveBeenCalledWith('pay_456');
    });

    it('should throw when payment not found', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(undefined);

      const paymentIntent = {
        id: 'pi_missing',
      } as unknown as Stripe.PaymentIntent;

      await expect(handlePaymentIntentSucceeded(paymentIntent)).rejects.toThrow(
        'Payment not found for PaymentIntent: pi_missing'
      );
    });

    it('should not trigger transfer for non-application_fee payments', async () => {
      const mockPayment = {
        id: 'pay_789',
        type: 'deposit',
        status: 'pending',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_789',
        amount_received: 30000,
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentSucceeded(paymentIntent);

      const { processApplicationFeeTransfer } =
        await import('@/app/actions/payment');
      expect(processApplicationFeeTransfer).not.toHaveBeenCalled();
    });

    it('should skip if payment already succeeded (DB-level idempotency)', async () => {
      const mockPayment = {
        id: 'pay_already',
        type: 'application_fee',
        status: 'succeeded',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_already',
        amount_received: 20000,
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentSucceeded(paymentIntent);

      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentIntentFailed', () => {
    it('should update payment status to failed with reason', async () => {
      const mockPayment = {
        id: 'pay_fail',
        status: 'pending',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_fail',
        last_payment_error: { message: 'Card declined' },
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentFailed(paymentIntent);

      expect(db.update).toHaveBeenCalled();
    });

    it('should use "Unknown error" when no error message', async () => {
      const mockPayment = {
        id: 'pay_fail2',
        status: 'pending',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_fail2',
        last_payment_error: null,
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentFailed(paymentIntent);

      expect(db.update).toHaveBeenCalled();
    });

    it('should throw when payment not found', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(undefined);

      const paymentIntent = {
        id: 'pi_missing2',
      } as unknown as Stripe.PaymentIntent;

      await expect(handlePaymentIntentFailed(paymentIntent)).rejects.toThrow(
        'Payment not found for PaymentIntent: pi_missing2'
      );
    });

    it('should skip if payment already in terminal state (DB-level idempotency)', async () => {
      const mockPayment = {
        id: 'pay_term',
        status: 'failed',
        metadata: {},
      };

      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const paymentIntent = {
        id: 'pi_term',
        last_payment_error: { message: 'Card declined' },
      } as unknown as Stripe.PaymentIntent;

      await handlePaymentIntentFailed(paymentIntent);

      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('handleAccountUpdated', () => {
    it('should update account capabilities', async () => {
      const mockAccount = {
        id: 'sa_1',
        stripeAccountId: 'acct_1',
      };

      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(
        mockAccount as any
      );

      const account = {
        id: 'acct_1',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      } as unknown as Stripe.Account;

      await handleAccountUpdated(account);

      expect(db.update).toHaveBeenCalled();
    });

    it('should skip when account not found', async () => {
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(undefined);

      const account = {
        id: 'acct_unknown',
        charges_enabled: true,
        payouts_enabled: true,
        details_submitted: true,
      } as unknown as Stripe.Account;

      await handleAccountUpdated(account);

      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe('handleTransferCreated', () => {
    it('should record transfer in transactions table', async () => {
      const transfer = {
        id: 'tr_123',
        amount: 15000,
        metadata: {
          paymentId: 'pay_123',
          recipientId: 'user_seller',
        },
      } as unknown as Stripe.Transfer;

      await handleTransferCreated(transfer);

      expect(db.insert).toHaveBeenCalled();
    });

    it('should skip when no paymentId in metadata', async () => {
      const transfer = {
        id: 'tr_no_meta',
        amount: 10000,
        metadata: {},
      } as unknown as Stripe.Transfer;

      await handleTransferCreated(transfer);

      expect(db.insert).not.toHaveBeenCalled();
    });

    it('should handle PK violation gracefully (atomic idempotency)', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockRejectedValue({ code: '23505' }),
      } as any);

      const transfer = {
        id: 'tr_dup',
        amount: 20000,
        metadata: { paymentId: 'pay_dup' },
      } as unknown as Stripe.Transfer;

      // Should not throw
      await expect(handleTransferCreated(transfer)).resolves.toBeUndefined();
    });

    it('should re-throw non-PK-violation errors', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockRejectedValue({ code: '42P01' }),
      } as any);

      const transfer = {
        id: 'tr_err',
        amount: 10000,
        metadata: { paymentId: 'pay_err' },
      } as unknown as Stripe.Transfer;

      await expect(handleTransferCreated(transfer)).rejects.toEqual({
        code: '42P01',
      });
    });
  });
});
