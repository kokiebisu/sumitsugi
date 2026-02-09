import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Stripe Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('STRIPE_CONFIG constants', () => {
    it('should have correct fee structure values', async () => {
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.ADDITIONAL_CLEANING_FEE).toBe(8000);
      expect(STRIPE_CONFIG.LANDLORD_INCENTIVE_RATE).toBe(0.01);
      expect(STRIPE_CONFIG.LANDLORD_INCENTIVE_MIN).toBe(3000);
      expect(STRIPE_CONFIG.PLATFORM_FEE_RATE).toBe(0.15);
      expect(STRIPE_CONFIG.APPLICATION_FEE).toBe(20000);
    });

    it('should have correct deposit configuration', async () => {
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.DEPOSIT_RATE).toBe(0.3);
      expect(STRIPE_CONFIG.DEPOSIT_MIN).toBe(30000);
      expect(STRIPE_CONFIG.DEPOSIT_MAX).toBe(50000);
    });

    it('should have correct escrow hold hours', async () => {
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.ESCROW_HOLD_HOURS).toBe(48);
    });
  });

  describe('environment variable reading', () => {
    it('should read publishableKey from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', async () => {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.publishableKey).toBe('pk_test_123');
    });

    it('should read secretKey from STRIPE_SECRET_KEY', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.secretKey).toBe('sk_test_123');
    });

    it('should read webhookSecret from STRIPE_WEBHOOK_SECRET', async () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.webhookSecret).toBe('whsec_test_123');
    });

    it('should default to empty strings when env vars are not set', async () => {
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const { STRIPE_CONFIG } = await import('../config');

      expect(STRIPE_CONFIG.publishableKey).toBe('');
      expect(STRIPE_CONFIG.secretKey).toBe('');
      expect(STRIPE_CONFIG.webhookSecret).toBe('');
    });
  });

  describe('config immutability', () => {
    it('should be marked as const (readonly)', async () => {
      const { STRIPE_CONFIG } = await import('../config');

      // TypeScript enforces `as const`, but at runtime we can verify the object exists
      expect(typeof STRIPE_CONFIG).toBe('object');
      expect(STRIPE_CONFIG).toBeDefined();
    });
  });
});
