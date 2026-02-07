import { describe, it, expect } from 'vitest';
import {
  calculatePenalty,
  type CancellationInput,
  DEPOSIT_AMOUNT,
} from '../cancellation-penalty';

describe('cancellation-penalty', () => {
  describe('buyer cancellation', () => {
    it('free cancellation before viewing (pre_viewing phase)', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'pre_viewing',
        handoverFee: 80000,
        depositPaid: 0,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(0);
      expect(result.reason).toContain('内見前');
    });

    it('forfeits deposit after deposit paid', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'post_deposit',
        handoverFee: 80000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(DEPOSIT_AMOUNT);
      expect(result.refundAmount).toBe(0);
      expect(result.depositForfeited).toBe(true);
    });

    it('applies compensation after remaining payment', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'post_remaining_payment',
        handoverFee: 100000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 80000,
      };
      const result = calculatePenalty(input);
      // 20% of handoverFee = 20000, capped between 30000 min and 50000 max
      // 20% of 100000 = 20000, but min is 30000 so penalty = 30000
      expect(result.penaltyAmount).toBe(30000);
      expect(result.refundAmount).toBe(80000 - 30000 + DEPOSIT_AMOUNT);
      // refund = remaining - penalty + deposit back (deposit already counted in penalty via phase)
      // Actually: refund = totalPaid - penaltyAmount
      expect(result.refundAmount).toBe(DEPOSIT_AMOUNT + 80000 - 30000);
    });

    it('caps penalty at maximum ¥50,000', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'post_remaining_payment',
        handoverFee: 500000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 480000,
      };
      const result = calculatePenalty(input);
      // 20% of 500000 = 100000, capped at 50000
      expect(result.penaltyAmount).toBe(50000);
    });

    it('enforces minimum penalty ¥30,000 for post-remaining', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'post_remaining_payment',
        handoverFee: 50000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 30000,
      };
      const result = calculatePenalty(input);
      // 20% of 50000 = 10000, but min is 30000
      expect(result.penaltyAmount).toBe(30000);
    });
  });

  describe('seller cancellation', () => {
    it('full refund of deposit when seller cancels post-deposit', () => {
      const input: CancellationInput = {
        cancelledBy: 'seller',
        phase: 'post_deposit',
        handoverFee: 80000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(DEPOSIT_AMOUNT);
      expect(result.depositForfeited).toBe(false);
    });

    it('full refund of all payments when seller cancels post-remaining', () => {
      const input: CancellationInput = {
        cancelledBy: 'seller',
        phase: 'post_remaining_payment',
        handoverFee: 100000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 80000,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(DEPOSIT_AMOUNT + 80000);
    });

    it('free cancellation before viewing', () => {
      const input: CancellationInput = {
        cancelledBy: 'seller',
        phase: 'pre_viewing',
        handoverFee: 80000,
        depositPaid: 0,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(0);
    });
  });

  describe('screening failure', () => {
    it('full refund on screening failure post-deposit', () => {
      const input: CancellationInput = {
        cancelledBy: 'screening_failure',
        phase: 'post_deposit',
        handoverFee: 80000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(DEPOSIT_AMOUNT);
      expect(result.reason).toContain('審査');
    });
  });

  describe('mutual cancellation', () => {
    it('full refund on mutual cancellation', () => {
      const input: CancellationInput = {
        cancelledBy: 'mutual',
        phase: 'post_remaining_payment',
        handoverFee: 100000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 80000,
      };
      const result = calculatePenalty(input);
      expect(result.penaltyAmount).toBe(0);
      expect(result.refundAmount).toBe(DEPOSIT_AMOUNT + 80000);
    });
  });

  describe('result structure', () => {
    it('includes all required fields', () => {
      const input: CancellationInput = {
        cancelledBy: 'buyer',
        phase: 'post_deposit',
        handoverFee: 80000,
        depositPaid: DEPOSIT_AMOUNT,
        remainingPaid: 0,
      };
      const result = calculatePenalty(input);
      expect(result).toHaveProperty('penaltyAmount');
      expect(result).toHaveProperty('refundAmount');
      expect(result).toHaveProperty('depositForfeited');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('cancelledBy');
      expect(result).toHaveProperty('phase');
    });
  });
});
