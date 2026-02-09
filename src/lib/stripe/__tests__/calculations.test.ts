import { describe, it, expect } from 'vitest';
import {
  calculateLandlordIncentive,
  calculateDeposit,
  calculatePlatformFee,
  calculatePreviousTenantAmount,
  calculateFeeBreakdown,
} from '../calculations';

describe('Stripe Calculations', () => {
  describe('calculateLandlordIncentive', () => {
    it('should return minimum 3000 for low handover fees', () => {
      expect(calculateLandlordIncentive(80000)).toBe(3000);
      expect(calculateLandlordIncentive(150000)).toBe(3000);
      expect(calculateLandlordIncentive(200000)).toBe(3000);
    });

    it('should return 1% for handover fees above 300000', () => {
      expect(calculateLandlordIncentive(400000)).toBe(4000);
      expect(calculateLandlordIncentive(500000)).toBe(5000);
      expect(calculateLandlordIncentive(1000000)).toBe(10000);
    });

    it('should return exactly 3000 at the 300000 boundary', () => {
      // 1% of 300000 = 3000, equals minimum
      expect(calculateLandlordIncentive(300000)).toBe(3000);
    });

    it('should handle zero handover fee', () => {
      expect(calculateLandlordIncentive(0)).toBe(3000);
    });
  });

  describe('calculateDeposit', () => {
    it('should return minimum 30000 for low handover fees', () => {
      expect(calculateDeposit(80000)).toBe(30000);
      expect(calculateDeposit(90000)).toBe(30000);
      expect(calculateDeposit(100000)).toBe(30000);
    });

    it('should return 30% for mid-range handover fees', () => {
      expect(calculateDeposit(150000)).toBe(45000);
      expect(calculateDeposit(140000)).toBe(42000);
    });

    it('should cap at maximum 50000 for high handover fees', () => {
      expect(calculateDeposit(200000)).toBe(50000);
      expect(calculateDeposit(300000)).toBe(50000);
      expect(calculateDeposit(500000)).toBe(50000);
    });

    it('should handle zero handover fee', () => {
      expect(calculateDeposit(0)).toBe(30000);
    });
  });

  describe('calculatePlatformFee', () => {
    it('should return 15% of handover fee', () => {
      expect(calculatePlatformFee(100000)).toBe(15000);
      expect(calculatePlatformFee(150000)).toBe(22500);
      expect(calculatePlatformFee(200000)).toBe(30000);
    });

    it('should round to nearest integer', () => {
      // 15% of 100001 = 15000.15 -> rounds to 15000
      expect(calculatePlatformFee(100001)).toBe(15000);
      // 15% of 100003 = 15000.45 -> rounds to 15000
      expect(calculatePlatformFee(100003)).toBe(15000);
    });

    it('should handle zero handover fee', () => {
      expect(calculatePlatformFee(0)).toBe(0);
    });
  });

  describe('calculatePreviousTenantAmount', () => {
    it('should deduct cleaning, landlord incentive, and platform fees', () => {
      // 150000 - 8000 (cleaning) - 3000 (landlord min) - 22500 (15%) = 116500
      expect(calculatePreviousTenantAmount(150000)).toBe(116500);
    });

    it('should calculate correctly for 80000 handover fee', () => {
      // 80000 - 8000 - 3000 - 12000 = 57000
      expect(calculatePreviousTenantAmount(80000)).toBe(57000);
    });

    it('should calculate correctly for 400000 handover fee', () => {
      // 400000 - 8000 - 4000 (1%) - 60000 = 328000
      expect(calculatePreviousTenantAmount(400000)).toBe(328000);
    });
  });

  describe('calculateFeeBreakdown', () => {
    it('should return complete breakdown for 150000 handover fee', () => {
      const breakdown = calculateFeeBreakdown(150000);

      expect(breakdown).toEqual({
        handoverFeeTotal: 150000,
        additionalCleaningFee: 8000,
        landlordIncentive: 3000,
        platformFee: 22500,
        sellerReceives: 116500,
        applicationFee: 20000,
        deposit: 45000,
        remaining: 105000,
      });
    });

    it('should ensure deposit + remaining equals handover total', () => {
      const amounts = [80000, 100000, 150000, 200000, 300000, 400000];

      for (const amount of amounts) {
        const breakdown = calculateFeeBreakdown(amount);
        expect(breakdown.deposit + breakdown.remaining).toBe(amount);
      }
    });

    it('should ensure all deductions sum to handover total', () => {
      const breakdown = calculateFeeBreakdown(150000);
      const totalFees =
        breakdown.additionalCleaningFee +
        breakdown.landlordIncentive +
        breakdown.platformFee +
        breakdown.sellerReceives;

      expect(totalFees).toBe(breakdown.handoverFeeTotal);
    });
  });
});
