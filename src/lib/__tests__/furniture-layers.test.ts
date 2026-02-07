import { describe, it, expect } from 'vitest';
import {
  FURNITURE_LAYER_ITEMS,
  getCoreFurniture,
  getAdditionalFurniture,
  isCoreFurniture,
  getLayerLabel,
} from '../furniture-layers';

describe('furniture-layers', () => {
  describe('FURNITURE_LAYER_ITEMS', () => {
    it('has items in both core and additional layers', () => {
      const core = FURNITURE_LAYER_ITEMS.filter((f) => f.layer === 'core');
      const additional = FURNITURE_LAYER_ITEMS.filter(
        (f) => f.layer === 'additional'
      );
      expect(core.length).toBeGreaterThan(0);
      expect(additional.length).toBeGreaterThan(0);
    });

    it('has unique ids', () => {
      const ids = FURNITURE_LAYER_ITEMS.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every item has required fields', () => {
      for (const item of FURNITURE_LAYER_ITEMS) {
        expect(item.id).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(['core', 'additional']).toContain(item.layer);
        expect(item.iconName).toBeTruthy();
      }
    });
  });

  describe('getCoreFurniture', () => {
    it('returns only core items', () => {
      const core = getCoreFurniture();
      expect(core.length).toBeGreaterThan(0);
      expect(core.every((f) => f.layer === 'core')).toBe(true);
    });
  });

  describe('getAdditionalFurniture', () => {
    it('returns only additional items', () => {
      const additional = getAdditionalFurniture();
      expect(additional.length).toBeGreaterThan(0);
      expect(additional.every((f) => f.layer === 'additional')).toBe(true);
    });
  });

  describe('isCoreFurniture', () => {
    it('returns true for core furniture id', () => {
      const core = getCoreFurniture();
      expect(isCoreFurniture(core[0].id)).toBe(true);
    });

    it('returns false for additional furniture id', () => {
      const additional = getAdditionalFurniture();
      expect(isCoreFurniture(additional[0].id)).toBe(false);
    });

    it('returns false for unknown id', () => {
      expect(isCoreFurniture('unknown-id')).toBe(false);
    });
  });

  describe('getLayerLabel', () => {
    it('returns correct label for core', () => {
      expect(getLayerLabel('core')).toBe('コアセット（基本セット）');
    });

    it('returns correct label for additional', () => {
      expect(getLayerLabel('additional')).toBe('追加家具（個別オプション）');
    });
  });
});
