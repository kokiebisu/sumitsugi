import { describe, it, expect } from 'vitest';
import {
  getPriceGuide,
  getAdjustedRange,
  isInPopularRange,
  getTotalPriceRange,
  FURNITURE_PRICE_GUIDES,
} from '@/lib/pricing-guidance';

// Component tests focus on the underlying logic since PricingGuidance
// uses hooks (useState) and can't be called as a pure function.
// The UI integration is verified by the E2E tests and the logic tests below.

describe('PricingGuidance logic', () => {
  describe('price guide lookup', () => {
    it('returns all 8 furniture guides', () => {
      const ids = [
        'bed',
        'sofa',
        'desk',
        'table',
        'storage',
        'wardrobe',
        'tv',
        'fridge',
      ];
      for (const id of ids) {
        expect(getPriceGuide(id)).toBeDefined();
      }
    });

    it('returns correct labels for each guide', () => {
      const expected: Record<string, string> = {
        bed: 'ベッド',
        sofa: 'ソファ',
        desk: 'デスク',
        table: 'テーブル',
        storage: '収納',
        wardrobe: 'ワードローブ',
        tv: 'テレビ台',
        fridge: '冷蔵庫',
      };
      for (const [id, label] of Object.entries(expected)) {
        expect(getPriceGuide(id)!.label).toBe(label);
      }
    });
  });

  describe('popular range detection for form feedback', () => {
    it('detects fee within popular range for single item', () => {
      const guide = getPriceGuide('bed')!;
      // bed popular: 10,000-25,000
      expect(isInPopularRange(guide, 15000)).toBe(true);
      expect(isInPopularRange(guide, 10000)).toBe(true);
      expect(isInPopularRange(guide, 25000)).toBe(true);
    });

    it('detects fee outside popular range', () => {
      const guide = getPriceGuide('bed')!;
      expect(isInPopularRange(guide, 3000)).toBe(false);
      expect(isInPopularRange(guide, 50000)).toBe(false);
    });

    it('calculates combined popular range for multiple items', () => {
      const ids = ['bed', 'sofa'];
      const popularMin = ids.reduce((sum, id) => {
        const guide = getPriceGuide(id);
        return sum + (guide?.popularRange.min ?? 0);
      }, 0);
      const popularMax = ids.reduce((sum, id) => {
        const guide = getPriceGuide(id);
        return sum + (guide?.popularRange.max ?? 0);
      }, 0);
      // bed popular: 10,000-25,000, sofa popular: 8,000-20,000
      expect(popularMin).toBe(18000);
      expect(popularMax).toBe(45000);
    });
  });

  describe('condition adjustments for form display', () => {
    it('excellent condition increases range by 20%', () => {
      const guide = getPriceGuide('sofa')!;
      const range = getAdjustedRange(guide, 'excellent');
      // sofa base: 3,000-35,000, * 1.2 = 4000-42000
      expect(range.min).toBe(4000);
      expect(range.max).toBe(42000);
    });

    it('fair condition decreases range by 30%', () => {
      const guide = getPriceGuide('sofa')!;
      const range = getAdjustedRange(guide, 'fair');
      // sofa base: 3,000-35,000, * 0.7 = 2100->2000, 24500->25000
      expect(range.min).toBe(2000);
      expect(range.max).toBe(25000);
    });

    it('total range reflects condition for multiple items', () => {
      const rangeGood = getTotalPriceRange(['bed', 'table'], 'good');
      const rangeExcellent = getTotalPriceRange(['bed', 'table'], 'excellent');
      const rangeFair = getTotalPriceRange(['bed', 'table'], 'fair');

      expect(rangeExcellent.min).toBeGreaterThan(rangeGood.min);
      expect(rangeFair.min).toBeLessThan(rangeGood.min);
      expect(rangeExcellent.max).toBeGreaterThan(rangeGood.max);
      expect(rangeFair.max).toBeLessThan(rangeGood.max);
    });
  });

  describe('all price ranges are valid for display', () => {
    it('all guides have positive min prices', () => {
      for (const guide of FURNITURE_PRICE_GUIDES) {
        expect(guide.baseRange.min).toBeGreaterThan(0);
        expect(guide.popularRange.min).toBeGreaterThan(0);
      }
    });

    it('all adjusted ranges produce rounded values', () => {
      const conditions = ['excellent', 'good', 'fair'] as const;
      for (const guide of FURNITURE_PRICE_GUIDES) {
        for (const condition of conditions) {
          const range = getAdjustedRange(guide, condition);
          expect(range.min % 1000).toBe(0);
          expect(range.max % 1000).toBe(0);
        }
      }
    });
  });
});
