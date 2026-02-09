import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { stripe } from '@/lib/stripe/server';

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

// Mock the extracted webhook handlers
const mockHandlePaymentIntentSucceeded = vi.fn();
const mockHandlePaymentIntentFailed = vi.fn();
const mockHandleAccountUpdated = vi.fn();
const mockHandleTransferCreated = vi.fn();
const mockIsEventProcessed = vi.fn().mockReturnValue(false);
const mockMarkEventProcessed = vi.fn();

vi.mock('@/lib/stripe/webhooks', () => ({
  handlePaymentIntentSucceeded: (...args: unknown[]) =>
    mockHandlePaymentIntentSucceeded(...args),
  handlePaymentIntentFailed: (...args: unknown[]) =>
    mockHandlePaymentIntentFailed(...args),
  handleAccountUpdated: (...args: unknown[]) =>
    mockHandleAccountUpdated(...args),
  handleTransferCreated: (...args: unknown[]) =>
    mockHandleTransferCreated(...args),
  isEventProcessed: (...args: unknown[]) => mockIsEventProcessed(...args),
  markEventProcessed: (...args: unknown[]) => mockMarkEventProcessed(...args),
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
    mockIsEventProcessed.mockReturnValue(false);
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

  describe('idempotency', () => {
    it('should skip duplicate events', async () => {
      mockIsEventProcessed.mockReturnValue(true);

      const mockEvent = {
        id: 'evt_duplicate',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
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
      expect(data).toEqual({ received: true, duplicate: true });
      expect(mockHandlePaymentIntentSucceeded).not.toHaveBeenCalled();
    });

    it('should mark event as processed after handling', async () => {
      const mockEvent = {
        id: 'evt_new',
        type: 'transfer.updated',
        data: { object: { id: 'tr_123' } },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      await POST(request);

      expect(mockMarkEventProcessed).toHaveBeenCalledWith('evt_new');
    });
  });

  describe('payment_intent.succeeded event', () => {
    it('should call handlePaymentIntentSucceeded', async () => {
      const mockEvent = {
        id: 'evt_pi_success',
        type: 'payment_intent.succeeded',
        data: {
          object: { id: 'pi_123', metadata: {} },
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
      expect(mockHandlePaymentIntentSucceeded).toHaveBeenCalledWith(
        mockEvent.data.object
      );
    });

    it('should return 404 if handler throws Payment not found', async () => {
      const mockEvent = {
        id: 'evt_pi_404',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_missing' } },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      mockHandlePaymentIntentSucceeded.mockRejectedValueOnce(
        new Error('Payment not found for PaymentIntent: pi_missing')
      );

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = (await response.json()) as { error: string };

      expect(response.status).toBe(404);
      expect(data.error).toContain('Payment not found');
    });
  });

  describe('payment_intent.payment_failed event', () => {
    it('should call handlePaymentIntentFailed', async () => {
      const mockEvent = {
        id: 'evt_pi_fail',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_789',
            last_payment_error: { message: 'Card declined' },
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
      expect(mockHandlePaymentIntentFailed).toHaveBeenCalledWith(
        mockEvent.data.object
      );
    });
  });

  describe('account.updated event', () => {
    it('should call handleAccountUpdated', async () => {
      const mockEvent = {
        id: 'evt_acct_update',
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

      const request = createRequest(mockEvent, {
        'stripe-signature': 'valid-signature',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
      expect(mockHandleAccountUpdated).toHaveBeenCalledWith(
        mockEvent.data.object
      );
    });
  });

  describe('transfer events', () => {
    it('should call handleTransferCreated for transfer.created', async () => {
      const mockEvent = {
        id: 'evt_tr_created',
        type: 'transfer.created',
        data: { object: { id: 'tr_123', amount: 20000 } },
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
      expect(mockHandleTransferCreated).toHaveBeenCalledWith(
        mockEvent.data.object
      );
    });

    it('should handle transfer.updated without calling handler', async () => {
      const mockEvent = {
        id: 'evt_tr_updated',
        type: 'transfer.updated',
        data: { object: { id: 'tr_456', amount: 30000 } },
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
        id: 'evt_unhandled',
        type: 'customer.created',
        data: { object: { id: 'cus_123' } },
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
        id: 'evt_error',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_error' } },
      };

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(
        mockEvent as any
      );
      mockHandlePaymentIntentSucceeded.mockRejectedValueOnce(
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
