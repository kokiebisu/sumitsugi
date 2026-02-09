import { describe, it, expect } from 'vitest';
import {
  DEPRECIATION_TABLE,
  getResidualRate,
  calculateDepreciatedPrice,
  calculateNewPriceTotal,
  calculateDiscountRate,
  type FurnitureCategory,
} from '../pricing-guidance';

describe('depreciation table', () => {
  describe('DEPRECIATION_TABLE', () => {
    it('has entries for all furniture categories', () => {
      const expectedCategories: FurnitureCategory[] = [
        'bed',
        'sofa',
        'desk',
        'table',
        'storage',
        'wardrobe',
        'tv',
        'fridge',
      ];
      for (const category of expectedCategories) {
        expect(DEPRECIATION_TABLE[category]).toBeDefined();
      }
    });

    it('has residual rates that decrease over years', () => {
      for (const [, rates] of Object.entries(DEPRECIATION_TABLE)) {
        const years = Object.keys(rates)
          .map(Number)
          .sort((a, b) => a - b);
        for (let i = 1; i < years.length; i++) {
          expect(rates[years[i]]).toBeLessThanOrEqual(rates[years[i - 1]]);
        }
      }
    });

    it('has residual rates between 0 and 1', () => {
      for (const [, rates] of Object.entries(DEPRECIATION_TABLE)) {
        for (const rate of Object.values(rates)) {
          expect(rate).toBeGreaterThanOrEqual(0);
          expect(rate).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('getResidualRate', () => {
    it('returns 1.0 for 0 years of use (new)', () => {
      expect(getResidualRate('bed', 0)).toBe(1.0);
    });

    it('returns correct rate for known year', () => {
      // bed at 1 year should return a specific rate
      const rate = getResidualRate('bed', 1);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(1);
    });

    it('returns lower rate for more years', () => {
      const rate1 = getResidualRate('bed', 1);
      const rate3 = getResidualRate('bed', 3);
      const rate5 = getResidualRate('bed', 5);
      expect(rate3).toBeLessThanOrEqual(rate1);
      expect(rate5).toBeLessThanOrEqual(rate3);
    });

    it('returns minimum rate for years beyond table', () => {
      const rate10 = getResidualRate('bed', 10);
      const rate20 = getResidualRate('bed', 20);
      expect(rate20).toBe(rate10);
    });

    it('interpolates for years between table entries', () => {
      // If table has year 1 and year 3, year 2 should be interpolated
      const rate1 = getResidualRate('sofa', 1);
      const rate3 = getResidualRate('sofa', 3);
      const rate2 = getResidualRate('sofa', 2);
      expect(rate2).toBeLessThanOrEqual(rate1);
      expect(rate2).toBeGreaterThanOrEqual(rate3);
    });

    it('returns 0.1 minimum for unknown category', () => {
      expect(getResidualRate('unknown' as FurnitureCategory, 5)).toBe(0.1);
    });
  });

  describe('calculateDepreciatedPrice', () => {
    it('returns new price for 0 years', () => {
      const result = calculateDepreciatedPrice('bed', 50000, 0);
      expect(result.depreciatedPrice).toBe(50000);
      expect(result.residualRate).toBe(1.0);
    });

    it('returns reduced price for used items', () => {
      const result = calculateDepreciatedPrice('bed', 50000, 3);
      expect(result.depreciatedPrice).toBeLessThan(50000);
      expect(result.depreciatedPrice).toBeGreaterThan(0);
      expect(result.newPrice).toBe(50000);
    });

    it('rounds to 1000 yen', () => {
      const result = calculateDepreciatedPrice('desk', 33333, 2);
      expect(result.depreciatedPrice % 1000).toBe(0);
    });

    it('includes discount rate', () => {
      const result = calculateDepreciatedPrice('bed', 50000, 3);
      expect(result.discountRate).toBeGreaterThan(0);
      expect(result.discountRate).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateNewPriceTotal', () => {
    it('returns 0 for empty items', () => {
      expect(calculateNewPriceTotal([])).toBe(0);
    });

    it('sums new prices from price guides', () => {
      // Uses the midpoint of baseRange for each category
      const total = calculateNewPriceTotal(['bed', 'desk']);
      expect(total).toBeGreaterThan(0);
    });

    it('ignores unknown categories', () => {
      const totalWithUnknown = calculateNewPriceTotal(['bed', 'unknown']);
      const totalWithout = calculateNewPriceTotal(['bed']);
      expect(totalWithUnknown).toBe(totalWithout);
    });
  });

  describe('calculateDiscountRate', () => {
    it('returns 0 when new price is 0', () => {
      expect(calculateDiscountRate(10000, 0)).toBe(0);
    });

    it('returns correct discount percentage', () => {
      // handover 30000, new 100000 → 30% of new → 70% discount
      expect(calculateDiscountRate(30000, 100000)).toBe(70);
    });

    it('returns 0 when handover equals new price', () => {
      expect(calculateDiscountRate(50000, 50000)).toBe(0);
    });

    it('caps at 0 (no negative discount)', () => {
      // handover > new price should still return 0
      expect(calculateDiscountRate(100000, 50000)).toBe(0);
    });

    it('rounds to integer', () => {
      const rate = calculateDiscountRate(33333, 100000);
      expect(Number.isInteger(rate)).toBe(true);
    });
  });
});
