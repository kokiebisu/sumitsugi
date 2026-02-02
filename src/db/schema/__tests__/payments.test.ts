import { describe, it, expect } from 'vitest';
import { payments, transactions, stripeAccounts } from '../payments';
import { getTableColumns } from 'drizzle-orm';

describe('Payment Database Schema', () => {
  describe('payments table', () => {
    it('should be defined', () => {
      expect(payments).toBeDefined();
    });

    it('should have required columns', () => {
      const columns = getTableColumns(payments);

      // Primary key
      expect(columns.id).toBeDefined();

      // Foreign keys
      expect(columns.propertyId).toBeDefined();
      expect(columns.userId).toBeDefined();

      // Payment type and amount
      expect(columns.type).toBeDefined();
      expect(columns.amount).toBeDefined();

      // Stripe IDs
      expect(columns.stripePaymentIntentId).toBeDefined();
      expect(columns.stripeChargeId).toBeDefined();

      // Status and metadata
      expect(columns.status).toBeDefined();
      expect(columns.metadata).toBeDefined();

      // Timestamps
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });
  });

  describe('transactions table', () => {
    it('should be defined', () => {
      expect(transactions).toBeDefined();
    });

    it('should have required columns', () => {
      const columns = getTableColumns(transactions);

      // Primary key
      expect(columns.id).toBeDefined();

      // Foreign key to payment
      expect(columns.paymentId).toBeDefined();

      // Recipient info
      expect(columns.recipientType).toBeDefined();
      expect(columns.recipientId).toBeDefined();
      expect(columns.amount).toBeDefined();

      // Stripe IDs
      expect(columns.stripeTransferId).toBeDefined();
      expect(columns.stripePayoutId).toBeDefined();

      // Status
      expect(columns.status).toBeDefined();

      // Timestamps
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });
  });

  describe('stripeAccounts table', () => {
    it('should be defined', () => {
      expect(stripeAccounts).toBeDefined();
    });

    it('should have required columns', () => {
      const columns = getTableColumns(stripeAccounts);

      // Primary key
      expect(columns.id).toBeDefined();

      // Foreign key to user
      expect(columns.userId).toBeDefined();

      // Stripe account info
      expect(columns.stripeAccountId).toBeDefined();
      expect(columns.accountType).toBeDefined();

      // Onboarding and capability flags
      expect(columns.onboardingCompleted).toBeDefined();
      expect(columns.detailsSubmitted).toBeDefined();
      expect(columns.chargesEnabled).toBeDefined();
      expect(columns.payoutsEnabled).toBeDefined();

      // Timestamps
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
    });
  });
});
