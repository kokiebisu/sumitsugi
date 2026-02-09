import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createApplicationFeePayment,
  processApplicationFeeTransfer,
  createDepositPayment,
  createRemainingPayment,
} from '../payment';
import { stripe } from '@/lib/stripe/server';
import { db } from '@/db';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

// Mock dependencies
vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    charges: {
      retrieve: vi.fn(),
    },
  },
  calculateDeposit: vi.fn((amount: number) => {
    const calculated = Math.round(amount * 0.3);
    return Math.min(Math.max(calculated, 30000), 50000);
  }),
  calculateFeeBreakdown: vi.fn((amount: number) => {
    const deposit = Math.min(Math.max(Math.round(amount * 0.3), 30000), 50000);
    return {
      handoverFeeTotal: amount,
      additionalCleaningFee: 8000,
      landlordIncentive: Math.max(Math.round(amount * 0.01), 3000),
      platformFee: Math.round(amount * 0.15),
      previousTenantReceives:
        amount -
        8000 -
        Math.max(Math.round(amount * 0.01), 3000) -
        Math.round(amount * 0.15),
      applicationFee: 20000,
      deposit,
      remaining: amount - deposit,
    };
  }),
}));

vi.mock('@/db', () => ({
  db: {
    query: {
      stripeAccounts: {
        findFirst: vi.fn(),
      },
      payments: {
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
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Payment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createApplicationFeePayment', () => {
    const mockPropertyId = 'prop-123';
    const mockUserId = 'user-456';
    const mockPreviousTenantId = 'seller-789';

    it('should create application fee payment successfully', async () => {
      // Mock previous tenant account
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue({
        id: 'acc-1',
        userId: mockPreviousTenantId,
        stripeAccountId: 'acct_test123',
        accountType: 'express',
        onboardingCompleted: true,
        detailsSubmitted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock Stripe PaymentIntent creation
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_test123',
        client_secret: 'pi_test123_secret',
        amount: 20000,
        currency: 'jpy',
      } as any);

      // Mock database insert
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: 'payment-123',
          propertyId: mockPropertyId,
          userId: mockUserId,
          type: 'application_fee',
          amount: 20000,
          stripePaymentIntentId: 'pi_test123',
          status: 'pending',
        },
      ]);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const result = await createApplicationFeePayment(
        mockPropertyId,
        mockUserId,
        mockPreviousTenantId
      );

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBe('pi_test123_secret');
      expect(result.paymentId).toBe('payment-123');

      // Verify Stripe PaymentIntent was created with correct params
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: STRIPE_CONFIG.APPLICATION_FEE,
        currency: 'jpy',
        metadata: {
          propertyId: mockPropertyId,
          userId: mockUserId,
          previousTenantId: mockPreviousTenantId,
          paymentType: 'application_fee',
        },
        transfer_data: {
          destination: 'acct_test123',
        },
      });
    });

    it('should fail if previous tenant has no Stripe account', async () => {
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue(undefined);

      const result = await createApplicationFeePayment(
        mockPropertyId,
        mockUserId,
        mockPreviousTenantId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Previous tenant does not have a Stripe account'
      );
    });

    it('should fail if previous tenant account is not ready', async () => {
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue({
        id: 'acc-1',
        userId: mockPreviousTenantId,
        stripeAccountId: 'acct_test123',
        accountType: 'express',
        onboardingCompleted: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await createApplicationFeePayment(
        mockPropertyId,
        mockUserId,
        mockPreviousTenantId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Previous tenant Stripe account is not ready to receive payments'
      );
    });

    it('should handle Stripe API errors', async () => {
      vi.mocked(db.query.stripeAccounts.findFirst).mockResolvedValue({
        id: 'acc-1',
        userId: mockPreviousTenantId,
        stripeAccountId: 'acct_test123',
        accountType: 'express',
        onboardingCompleted: true,
        detailsSubmitted: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(stripe.paymentIntents.create).mockRejectedValue(
        new Error('Stripe API error')
      );

      const result = await createApplicationFeePayment(
        mockPropertyId,
        mockUserId,
        mockPreviousTenantId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Stripe API error');
    });
  });

  describe('processApplicationFeeTransfer', () => {
    const mockPaymentId = 'payment-123';

    it('should process transfer successfully', async () => {
      // Mock payment
      vi.mocked(db.query.payments.findFirst).mockResolvedValue({
        id: mockPaymentId,
        propertyId: 'prop-123',
        userId: 'user-456',
        type: 'application_fee',
        amount: 20000,
        stripePaymentIntentId: 'pi_test123',
        stripeChargeId: null,
        status: 'processing',
        metadata: { previousTenantId: 'seller-789' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock PaymentIntent
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test123',
        latest_charge: 'ch_test123',
      } as any);

      // Mock Charge
      vi.mocked(stripe.charges.retrieve).mockResolvedValue({
        id: 'ch_test123',
        transfer: 'tr_test123',
      } as any);

      // Mock database operations
      const mockInsertReturning = vi
        .fn()
        .mockResolvedValue([{ id: 'txn-123' }]);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: mockInsertReturning,
        }),
      } as any);

      const mockWhere = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: mockWhere,
        }),
      } as any);

      const result = await processApplicationFeeTransfer(mockPaymentId);

      expect(result.success).toBe(true);
      expect(result.transferId).toBe('tr_test123');
    });

    it('should fail if payment not found', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValue(undefined);

      const result = await processApplicationFeeTransfer(mockPaymentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment not found');
    });

    it('should fail if payment type is invalid', async () => {
      vi.mocked(db.query.payments.findFirst).mockResolvedValue({
        id: mockPaymentId,
        propertyId: 'prop-123',
        userId: 'user-456',
        type: 'deposit',
        amount: 30000,
        stripePaymentIntentId: 'pi_test123',
        stripeChargeId: null,
        status: 'processing',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await processApplicationFeeTransfer(mockPaymentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid payment type');
    });
  });

  describe('createDepositPayment', () => {
    const mockPropertyId = 'prop-123';
    const mockUserId = 'user-456';
    const mockHandoverFee = 100000;

    it('should create deposit payment successfully', async () => {
      // Mock property
      vi.mocked(db.query.properties.findFirst).mockResolvedValue({
        id: mockPropertyId,
        userId: 'seller-789',
        title: 'Test Property',
        summary: null,
        images: [],
        status: 'public',
        handoverFee: mockHandoverFee,
        additionalCleaningFee: 8000,
        coreSetPrice: null,
        rent: 80000,
        managementFee: 5000,
        deposit: '1',
        keyMoney: '1',
        area: 'Shibuya',
        lat: null,
        lng: null,
        neighborhood: null,
        layout: '1K',
        occupancy: 1,
        style: 'modern',
        furnitureItems: [],
        condition: 'good',
        estimatedDuration: '2〜4ヶ月',
        landlordConsent: { status: 'approved' as const },
        amenities: [],
        moveOutDate: null,
        moveOutReason: null,
        managementCompanyName: null,
        managementCompanyEmail: null,
        managementConsultedAt: null,
        pdfUrls: null,
        furnitureDescription: null,
        story: null,
        conditions: null,
        handoverDetails: null,
        faq: null,
        handoverHost: null,
        isProCoordinated: false,
        issueRecord: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      });

      // Mock Stripe PaymentIntent creation
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_deposit123',
        client_secret: 'pi_deposit123_secret',
        amount: 30000,
        currency: 'jpy',
      } as any);

      // Mock database insert
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: 'payment-deposit-123',
          propertyId: mockPropertyId,
          userId: mockUserId,
          type: 'deposit',
          amount: 30000,
          stripePaymentIntentId: 'pi_deposit123',
          status: 'pending',
        },
      ]);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const result = await createDepositPayment(
        mockPropertyId,
        mockUserId,
        mockHandoverFee
      );

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBe('pi_deposit123_secret');
      expect(result.paymentId).toBe('payment-deposit-123');

      // Verify PaymentIntent created with manual capture
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 30000,
        currency: 'jpy',
        capture_method: 'manual',
        metadata: {
          propertyId: mockPropertyId,
          userId: mockUserId,
          previousTenantId: 'seller-789',
          paymentType: 'deposit',
          handoverFeeTotal: mockHandoverFee.toString(),
        },
      });
    });

    it('should fail if property not found', async () => {
      vi.mocked(db.query.properties.findFirst).mockResolvedValue(undefined);

      const result = await createDepositPayment(
        mockPropertyId,
        mockUserId,
        mockHandoverFee
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Property not found');
    });
  });

  describe('createRemainingPayment', () => {
    const mockPropertyId = 'prop-123';
    const mockUserId = 'user-456';
    const mockHandoverFee = 100000;

    it('should create remaining payment successfully', async () => {
      // Mock property
      vi.mocked(db.query.properties.findFirst).mockResolvedValue({
        id: mockPropertyId,
        userId: 'seller-789',
        title: 'Test Property',
        summary: null,
        images: [],
        status: 'public',
        handoverFee: mockHandoverFee,
        additionalCleaningFee: 8000,
        coreSetPrice: null,
        rent: 80000,
        managementFee: 5000,
        deposit: '1',
        keyMoney: '1',
        area: 'Shibuya',
        lat: null,
        lng: null,
        neighborhood: null,
        layout: '1K',
        occupancy: 1,
        style: 'modern',
        furnitureItems: [],
        condition: 'good',
        estimatedDuration: '2〜4ヶ月',
        landlordConsent: { status: 'approved' as const },
        amenities: [],
        moveOutDate: null,
        moveOutReason: null,
        managementCompanyName: null,
        managementCompanyEmail: null,
        managementConsultedAt: null,
        pdfUrls: null,
        furnitureDescription: null,
        story: null,
        conditions: null,
        handoverDetails: null,
        faq: null,
        handoverHost: null,
        isProCoordinated: false,
        issueRecord: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      });

      // Mock Stripe PaymentIntent creation
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_remaining123',
        client_secret: 'pi_remaining123_secret',
        amount: 70000, // 100000 - 30000 deposit
        currency: 'jpy',
      } as any);

      // Mock database insert
      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: 'payment-remaining-123',
          propertyId: mockPropertyId,
          userId: mockUserId,
          type: 'remaining',
          amount: 70000,
          stripePaymentIntentId: 'pi_remaining123',
          status: 'pending',
        },
      ]);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const result = await createRemainingPayment(
        mockPropertyId,
        mockUserId,
        mockHandoverFee
      );

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBe('pi_remaining123_secret');
      expect(result.paymentId).toBe('payment-remaining-123');

      // Verify PaymentIntent created with manual capture
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 70000,
        currency: 'jpy',
        capture_method: 'manual',
        metadata: {
          propertyId: mockPropertyId,
          userId: mockUserId,
          previousTenantId: 'seller-789',
          paymentType: 'remaining',
          handoverFeeTotal: mockHandoverFee.toString(),
        },
      });
    });

    it('should fail if property not found', async () => {
      vi.mocked(db.query.properties.findFirst).mockResolvedValue(undefined);

      const result = await createRemainingPayment(
        mockPropertyId,
        mockUserId,
        mockHandoverFee
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Property not found');
    });

    it('should calculate remaining amount correctly for high handover fee', async () => {
      const highHandoverFee = 200000;

      vi.mocked(db.query.properties.findFirst).mockResolvedValue({
        id: mockPropertyId,
        userId: 'seller-789',
        title: 'Test Property',
        summary: null,
        images: [],
        status: 'public',
        handoverFee: highHandoverFee,
        additionalCleaningFee: 8000,
        coreSetPrice: null,
        rent: 80000,
        managementFee: 5000,
        deposit: '1',
        keyMoney: '1',
        area: 'Shibuya',
        lat: null,
        lng: null,
        neighborhood: null,
        layout: '1K',
        occupancy: 1,
        style: 'modern',
        furnitureItems: [],
        condition: 'good',
        estimatedDuration: '2〜4ヶ月',
        landlordConsent: { status: 'approved' as const },
        amenities: [],
        moveOutDate: null,
        moveOutReason: null,
        managementCompanyName: null,
        managementCompanyEmail: null,
        managementConsultedAt: null,
        pdfUrls: null,
        furnitureDescription: null,
        story: null,
        conditions: null,
        handoverDetails: null,
        faq: null,
        handoverHost: null,
        isProCoordinated: false,
        issueRecord: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
      });

      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_remaining456',
        client_secret: 'pi_remaining456_secret',
        amount: 150000, // 200000 - 50000 (max deposit)
        currency: 'jpy',
      } as any);

      const mockReturning = vi.fn().mockResolvedValue([
        {
          id: 'payment-remaining-456',
          propertyId: mockPropertyId,
          userId: mockUserId,
          type: 'remaining',
          amount: 150000,
          stripePaymentIntentId: 'pi_remaining456',
          status: 'pending',
        },
      ]);
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const result = await createRemainingPayment(
        mockPropertyId,
        mockUserId,
        highHandoverFee
      );

      expect(result.success).toBe(true);
      // Remaining should be 200000 - 50000 (max deposit) = 150000
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150000,
        })
      );
    });
  });
});
