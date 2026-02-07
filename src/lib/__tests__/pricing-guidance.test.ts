import { describe, it, expect } from 'vitest';
import {
  getPriceGuide,
  getAdjustedRange,
  isInPopularRange,
  getTotalPriceRange,
  FURNITURE_PRICE_GUIDES,
  CONDITION_LABELS,
} from '../pricing-guidance';

describe('pricing-guidance', () => {
  describe('FURNITURE_PRICE_GUIDES', () => {
    it('has 8 furniture categories', () => {
      expect(FURNITURE_PRICE_GUIDES).toHaveLength(8);
    });

    it('each guide has valid price ranges (min < max)', () => {
      for (const guide of FURNITURE_PRICE_GUIDES) {
        expect(guide.baseRange.min).toBeLessThan(guide.baseRange.max);
        expect(guide.popularRange.min).toBeLessThan(guide.popularRange.max);
      }
    });

    it('popular range is within base range', () => {
      for (const guide of FURNITURE_PRICE_GUIDES) {
        expect(guide.popularRange.min).toBeGreaterThanOrEqual(
          guide.baseRange.min
        );
        expect(guide.popularRange.max).toBeLessThanOrEqual(guide.baseRange.max);
      }
    });
  });

  describe('CONDITION_LABELS', () => {
    it('has labels for all conditions', () => {
      expect(CONDITION_LABELS.excellent).toBe('良好');
      expect(CONDITION_LABELS.good).toBe('普通');
      expect(CONDITION_LABELS.fair).toBe('使用感あり');
    });
  });

  describe('getPriceGuide', () => {
    it('returns guide for valid furniture id', () => {
      const guide = getPriceGuide('bed');
      expect(guide).toBeDefined();
      expect(guide!.label).toBe('ベッド');
    });

    it('returns guide for table', () => {
      const guide = getPriceGuide('table');
      expect(guide).toBeDefined();
      expect(guide!.baseRange.min).toBe(5000);
      expect(guide!.baseRange.max).toBe(30000);
    });

    it('returns undefined for unknown furniture id', () => {
      expect(getPriceGuide('unknown')).toBeUndefined();
    });
  });

  describe('getAdjustedRange', () => {
    it('returns base range for good condition (multiplier 1.0)', () => {
      const guide = getPriceGuide('table')!;
      const range = getAdjustedRange(guide, 'good');
      expect(range.min).toBe(5000);
      expect(range.max).toBe(30000);
    });

    it('increases range for excellent condition', () => {
      const guide = getPriceGuide('table')!;
      const range = getAdjustedRange(guide, 'excellent');
      expect(range.min).toBe(6000); // 5000 * 1.2 = 6000
      expect(range.max).toBe(36000); // 30000 * 1.2 = 36000
    });

    it('decreases range for fair condition', () => {
      const guide = getPriceGuide('table')!;
      const range = getAdjustedRange(guide, 'fair');
      expect(range.min).toBe(4000); // 5000 * 0.7 = 3500 → rounded to 4000
      expect(range.max).toBe(21000); // 30000 * 0.7 = 21000
    });

    it('rounds to 1000 yen', () => {
      const guide = getPriceGuide('desk')!;
      const range = getAdjustedRange(guide, 'fair');
      // 2000 * 0.7 = 1400 → round(1400/1000)*1000 = 1000
      expect(range.min % 1000).toBe(0);
      expect(range.max % 1000).toBe(0);
    });
  });

  describe('isInPopularRange', () => {
    it('returns true for price within popular range', () => {
      const guide = getPriceGuide('table')!;
      // popular: { min: 8000, max: 18000 }
      expect(isInPopularRange(guide, 10000)).toBe(true);
      expect(isInPopularRange(guide, 8000)).toBe(true);
      expect(isInPopularRange(guide, 18000)).toBe(true);
    });

    it('returns false for price below popular range', () => {
      const guide = getPriceGuide('table')!;
      expect(isInPopularRange(guide, 5000)).toBe(false);
    });

    it('returns false for price above popular range', () => {
      const guide = getPriceGuide('table')!;
      expect(isInPopularRange(guide, 25000)).toBe(false);
    });
  });

  describe('getTotalPriceRange', () => {
    it('returns zero range for empty furniture list', () => {
      const range = getTotalPriceRange([]);
      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
    });

    it('returns single item range for one furniture', () => {
      const range = getTotalPriceRange(['table'], 'good');
      expect(range.min).toBe(5000);
      expect(range.max).toBe(30000);
    });

    it('sums ranges for multiple furniture items', () => {
      const range = getTotalPriceRange(['table', 'desk'], 'good');
      // table: 5000-30000, desk: 2000-20000
      expect(range.min).toBe(7000);
      expect(range.max).toBe(50000);
    });

    it('applies condition multiplier', () => {
      const rangeGood = getTotalPriceRange(['bed'], 'good');
      const rangeExcellent = getTotalPriceRange(['bed'], 'excellent');
      expect(rangeExcellent.min).toBeGreaterThan(rangeGood.min);
      expect(rangeExcellent.max).toBeGreaterThan(rangeGood.max);
    });

    it('ignores unknown furniture ids', () => {
      const range = getTotalPriceRange(['table', 'unknown'], 'good');
      expect(range.min).toBe(5000);
      expect(range.max).toBe(30000);
    });

    it('defaults to good condition when not specified', () => {
      const range = getTotalPriceRange(['table']);
      const rangeGood = getTotalPriceRange(['table'], 'good');
      expect(range.min).toBe(rangeGood.min);
      expect(range.max).toBe(rangeGood.max);
    });
  });
});
