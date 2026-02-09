import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';
import { payments } from '@/db/schema';

// Mock dependencies
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('@/lib/stripe/config', () => ({
  STRIPE_CONFIG: {
    webhookSecret: 'test-webhook-secret',
    secretKey: 'test-secret-key',
    publishableKey: 'test-publishable-key',
    APPLICATION_FEE: 20000,
    ADDITIONAL_CLEANING_FEE: 8000,
    LANDLORD_INCENTIVE_RATE: 0.01,
    LANDLORD_INCENTIVE_MIN: 3000,
    PLATFORM_FEE_RATE: 0.15,
    DEPOSIT_RATE: 0.3,
    DEPOSIT_MIN: 30000,
    DEPOSIT_MAX: 50000,
    ESCROW_HOLD_HOURS: 48,
  },
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      payments: {
        findFirst: vi.fn(),
      },
      stripeAccounts: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

vi.mock('@/db/schema', () => ({
  payments: { stripePaymentIntentId: 'stripe_payment_intent_id', id: 'id' },
  stripeAccounts: { stripeAccountId: 'stripe_account_id', id: 'id' },
}));

vi.mock('@/app/actions/payment', () => ({
  processApplicationFeeTransfer: vi.fn(),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

function createRequest(body: object, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signature verification', () => {
    it('should return 400 if signature header is missing', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing stripe-signature header',
      });
    });

    it('should return 400 if signature verification fails', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const request = createRequest({}, { 'stripe-signature': 'invalid-sig' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid signature',
      });
    });
  });

  describe('payment_intent.succeeded event', () => {
    it('should update payment status and trigger transfer for application_fee', async () => {
      const mockPayment = {
        id: 'payment-123',
        type: 'application_fee',
        stripePaymentIntentId: 'pi_123',
      };

      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: { paymentType: 'application_fee' },
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const { processApplicationFeeTransfer } =
        await import('@/app/actions/payment');
      vi.mocked(processApplicationFeeTransfer).mockResolvedValue({
        success: true,
        transferId: 'tr_123',
      });

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(processApplicationFeeTransfer).toHaveBeenCalledWith('payment-123');
    });

    it('should update payment status for deposit payment', async () => {
      const mockPayment = {
        id: 'payment-456',
        type: 'deposit',
        stripePaymentIntentId: 'pi_456',
      };

      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_456',
            metadata: { paymentType: 'deposit' },
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(db.update).toHaveBeenCalledWith(payments);
    });

    it('should return 404 if payment not found', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_nonexistent',
            metadata: { paymentType: 'application_fee' },
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(undefined);

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Payment not found for PaymentIntent: pi_nonexistent',
      });
    });
  });

  describe('payment_intent.payment_failed event', () => {
    it('should update payment status to failed', async () => {
      const mockPayment = {
        id: 'payment-789',
        type: 'deposit',
        stripePaymentIntentId: 'pi_789',
      };

      const mockEvent = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_789',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(
        mockPayment as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(db.update).toHaveBeenCalledWith(payments);
    });
  });

  describe('account.updated event (Stripe Connect)', () => {
    it('should update stripe account capabilities when account is found', async () => {
      const mockAccount = {
        id: 'sa_123',
        stripeAccountId: 'acct_123',
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      };

      const mockEvent = {
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_123',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(
        mockAccount as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(db.update).toHaveBeenCalled();
    });

    it('should return 200 even when connected account is not found in db', async () => {
      const mockEvent = {
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_unknown',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(undefined);

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      // account.updated for unknown accounts should not fail
      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });

    it('should handle account with charges disabled', async () => {
      const mockAccount = {
        id: 'sa_456',
        stripeAccountId: 'acct_456',
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      };

      const mockEvent = {
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_456',
            charges_enabled: false,
            payouts_enabled: false,
            details_submitted: true,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(
        mockAccount as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('transfer events', () => {
    it('should handle transfer.created event', async () => {
      const mockEvent = {
        type: 'transfer.created',
        data: {
          object: {
            id: 'tr_123',
            amount: 20000,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });

    it('should handle transfer.updated event', async () => {
      const mockEvent = {
        type: 'transfer.updated',
        data: {
          object: {
            id: 'tr_456',
            amount: 30000,
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });
  });

  describe('unhandled events', () => {
    it('should return 200 for unhandled event types', async () => {
      const mockEvent = {
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_123',
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });
  });

  describe('error handling', () => {
    it('should return 500 for unexpected errors', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_error',
          },
        },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      vi.mocked(db.query.payments.findFirst).mockRejectedValue(
        new Error('Database connection error')
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Webhook handler failed',
      });
    });
  });
});
