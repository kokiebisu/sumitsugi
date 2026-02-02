import { describe, it, expect } from 'vitest';
import {
  calculateLandlordIncentive,
  calculateDeposit,
  calculatePlatformFee,
  calculatePreviousTenantAmount,
  calculateFeeBreakdown,
} from '../server';

describe('Stripe Server Utilities', () => {
  describe('calculateLandlordIncentive', () => {
    it('should return minimum ¥3,000 for low handover fees', () => {
      expect(calculateLandlordIncentive(80000)).toBe(3000);
      expect(calculateLandlordIncentive(150000)).toBe(3000);
    });

    it('should return 1% for high handover fees', () => {
      expect(calculateLandlordIncentive(400000)).toBe(4000);
      expect(calculateLandlordIncentive(500000)).toBe(5000);
    });

    it('should handle edge case at exactly ¥300,000', () => {
      // 1% of 300,000 = 3,000, which equals minimum
      expect(calculateLandlordIncentive(300000)).toBe(3000);
    });
  });

  describe('calculateDeposit', () => {
    it('should return minimum ¥30,000 for low fees', () => {
      expect(calculateDeposit(80000)).toBe(30000);
      expect(calculateDeposit(90000)).toBe(30000);
    });

    it('should return 30% for mid-range fees', () => {
      expect(calculateDeposit(150000)).toBe(45000);
      expect(calculateDeposit(140000)).toBe(42000);
    });

    it('should return maximum ¥50,000 for high fees', () => {
      expect(calculateDeposit(200000)).toBe(50000);
      expect(calculateDeposit(300000)).toBe(50000);
    });

    it('should handle edge cases at boundaries', () => {
      // At exactly ¥100,000: 30% = ¥30,000 (minimum)
      expect(calculateDeposit(100000)).toBe(30000);

      // At ¥166,667: 30% = ¥50,000.01, capped at ¥50,000
      expect(calculateDeposit(166667)).toBe(50000);
    });
  });

  describe('calculatePlatformFee', () => {
    it('should return 15% of handover fee', () => {
      expect(calculatePlatformFee(100000)).toBe(15000);
      expect(calculatePlatformFee(150000)).toBe(22500);
      expect(calculatePlatformFee(200000)).toBe(30000);
    });

    it('should round correctly', () => {
      // 15% of 100,001 = 15,000.15 -> should round to 15,000
      expect(calculatePlatformFee(100001)).toBe(15000);
    });
  });

  describe('calculatePreviousTenantAmount', () => {
    it('should deduct all fees from handover total', () => {
      const handoverFee = 150000;
      const cleaningFee = 8000;
      const landlordIncentive = 3000; // max(150000 * 0.01, 3000) = 3000
      const platformFee = 22500; // 150000 * 0.15
      const expected = handoverFee - cleaningFee - landlordIncentive - platformFee;

      expect(calculatePreviousTenantAmount(150000)).toBe(expected);
      expect(calculatePreviousTenantAmount(150000)).toBe(116500);
    });

    it('should calculate correctly for ¥80,000 handover fee', () => {
      const handoverFee = 80000;
      const cleaningFee = 8000;
      const landlordIncentive = 3000;
      const platformFee = 12000; // 80000 * 0.15
      const expected = handoverFee - cleaningFee - landlordIncentive - platformFee;

      expect(calculatePreviousTenantAmount(80000)).toBe(expected);
      expect(calculatePreviousTenantAmount(80000)).toBe(57000);
    });

    it('should calculate correctly for ¥400,000 handover fee', () => {
      const handoverFee = 400000;
      const cleaningFee = 8000;
      const landlordIncentive = 4000; // max(400000 * 0.01, 3000) = 4000
      const platformFee = 60000; // 400000 * 0.15
      const expected = handoverFee - cleaningFee - landlordIncentive - platformFee;

      expect(calculatePreviousTenantAmount(400000)).toBe(expected);
      expect(calculatePreviousTenantAmount(400000)).toBe(328000);
    });
  });

  describe('calculateFeeBreakdown', () => {
    it('should correctly break down ¥150,000 handover fee', () => {
      const breakdown = calculateFeeBreakdown(150000);

      expect(breakdown.handoverFeeTotal).toBe(150000);
      expect(breakdown.additionalCleaningFee).toBe(8000);
      expect(breakdown.landlordIncentive).toBe(3000);
      expect(breakdown.platformFee).toBe(22500);
      expect(breakdown.previousTenantReceives).toBe(116500);
      expect(breakdown.applicationFee).toBe(20000);
      expect(breakdown.deposit).toBe(45000);
      expect(breakdown.remaining).toBe(105000);
    });

    it('should correctly break down ¥80,000 handover fee', () => {
      const breakdown = calculateFeeBreakdown(80000);

      expect(breakdown.handoverFeeTotal).toBe(80000);
      expect(breakdown.additionalCleaningFee).toBe(8000);
      expect(breakdown.landlordIncentive).toBe(3000);
      expect(breakdown.platformFee).toBe(12000);
      expect(breakdown.previousTenantReceives).toBe(57000);
      expect(breakdown.applicationFee).toBe(20000);
      expect(breakdown.deposit).toBe(30000); // minimum
      expect(breakdown.remaining).toBe(50000);
    });

    it('should correctly break down ¥400,000 handover fee', () => {
      const breakdown = calculateFeeBreakdown(400000);

      expect(breakdown.handoverFeeTotal).toBe(400000);
      expect(breakdown.additionalCleaningFee).toBe(8000);
      expect(breakdown.landlordIncentive).toBe(4000); // 1%
      expect(breakdown.platformFee).toBe(60000);
      expect(breakdown.previousTenantReceives).toBe(328000);
      expect(breakdown.applicationFee).toBe(20000);
      expect(breakdown.deposit).toBe(50000); // maximum
      expect(breakdown.remaining).toBe(350000);
    });

    it('should ensure deposit + remaining equals handoverFeeTotal', () => {
      const breakdown1 = calculateFeeBreakdown(150000);
      expect(breakdown1.deposit + breakdown1.remaining).toBe(150000);

      const breakdown2 = calculateFeeBreakdown(80000);
      expect(breakdown2.deposit + breakdown2.remaining).toBe(80000);

      const breakdown3 = calculateFeeBreakdown(400000);
      expect(breakdown3.deposit + breakdown3.remaining).toBe(400000);
    });

    it('should ensure all fees sum correctly', () => {
      const breakdown = calculateFeeBreakdown(150000);
      const totalFees =
        breakdown.additionalCleaningFee +
        breakdown.landlordIncentive +
        breakdown.platformFee +
        breakdown.previousTenantReceives;

      expect(totalFees).toBe(breakdown.handoverFeeTotal);
    });
  });
});
