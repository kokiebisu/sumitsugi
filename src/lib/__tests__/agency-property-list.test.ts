import { describe, it, expect } from 'vitest';
import {
  filterPropertiesByArea,
  isImmediateMoveInAvailable,
  generateAgencyPropertyListData,
} from '../agency-property-list';
import type { Property } from '../types';

describe('agency-property-list', () => {
  const mockProperties: Property[] = [
    {
      id: '1',
      title: '中目黒のスタイリッシュな1K',
      images: ['img1.jpg'],
      handoverFee: 150000,
      rent: 90000,
      area: '中目黒',
      layout: '1K',
      furniture: ['bed', 'desk'],
      status: 'public',
      handoverDetails: {
        included: ['ベッド', 'デスク'],
        notIncluded: [],
        moveInAvailableFrom: '2026-03-01',
      },
    },
    {
      id: '2',
      title: '渋谷のモダンな1LDK',
      images: ['img2.jpg'],
      handoverFee: 200000,
      rent: 120000,
      area: '渋谷',
      layout: '1LDK',
      furniture: ['bed', 'sofa', 'table'],
      status: 'public',
      handoverDetails: {
        included: ['ベッド', 'ソファ', 'テーブル'],
        notIncluded: [],
        moveInAvailableFrom: '2026-04-15',
      },
    },
    {
      id: '3',
      title: '中目黒のヴィンテージ1DK',
      images: ['img3.jpg'],
      handoverFee: 180000,
      rent: 100000,
      area: '中目黒',
      layout: '1DK',
      furniture: ['bed', 'storage'],
      status: 'draft', // Not public
      handoverDetails: {
        included: ['ベッド', '収納'],
        notIncluded: [],
      },
    },
    {
      id: '4',
      title: '中目黒の即入居可能物件',
      images: ['img4.jpg'],
      handoverFee: 100000,
      rent: 85000,
      area: '中目黒',
      layout: '1K',
      furniture: ['bed'],
      status: 'public',
      handoverDetails: {
        included: ['ベッド'],
        notIncluded: [],
        moveInAvailableFrom: new Date().toISOString().split('T')[0], // Today
      },
    },
  ];

  describe('filterPropertiesByArea', () => {
    it('should filter properties by area', () => {
      const result = filterPropertiesByArea(mockProperties, '中目黒');
      expect(result).toHaveLength(2); // Only public properties in 中目黒
      expect(result.every((p) => p.area === '中目黒')).toBe(true);
      expect(result.every((p) => p.status === 'public')).toBe(true);
    });

    it('should return empty array for non-existent area', () => {
      const result = filterPropertiesByArea(mockProperties, '品川');
      expect(result).toHaveLength(0);
    });

    it('should filter out draft properties', () => {
      const result = filterPropertiesByArea(mockProperties, '中目黒');
      expect(result.some((p) => p.id === '3')).toBe(false);
    });
  });

  describe('isImmediateMoveInAvailable', () => {
    it('should return true for properties available within 14 days', () => {
      const property: Property = {
        id: '1',
        title: 'Test',
        images: [],
        handoverFee: 100000,
        area: 'Test',
        furniture: [],
        status: 'public',
        handoverDetails: {
          included: [],
          notIncluded: [],
          moveInAvailableFrom: new Date().toISOString().split('T')[0], // Today
        },
      };
      expect(isImmediateMoveInAvailable(property)).toBe(true);
    });

    it('should return false for properties available after 14 days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const property: Property = {
        id: '1',
        title: 'Test',
        images: [],
        handoverFee: 100000,
        area: 'Test',
        furniture: [],
        status: 'public',
        handoverDetails: {
          included: [],
          notIncluded: [],
          moveInAvailableFrom: futureDate.toISOString().split('T')[0],
        },
      };
      expect(isImmediateMoveInAvailable(property)).toBe(false);
    });

    it('should return false when moveInAvailableFrom is not set', () => {
      const property: Property = {
        id: '1',
        title: 'Test',
        images: [],
        handoverFee: 100000,
        area: 'Test',
        furniture: [],
        status: 'public',
        handoverDetails: {
          included: [],
          notIncluded: [],
        },
      };
      expect(isImmediateMoveInAvailable(property)).toBe(false);
    });
  });

  describe('generateAgencyPropertyListData', () => {
    it('should generate property list data for a specific area', () => {
      const result = generateAgencyPropertyListData(mockProperties, '中目黒');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('propertyName');
      expect(result[0]).toHaveProperty('area');
      expect(result[0]).toHaveProperty('layout');
      expect(result[0]).toHaveProperty('furnitureList');
      expect(result[0]).toHaveProperty('handoverFee');
      expect(result[0]).toHaveProperty('moveInAvailableFrom');
      expect(result[0]).toHaveProperty('isImmediatelyAvailable');
    });

    it('should correctly flag immediately available properties', () => {
      const result = generateAgencyPropertyListData(mockProperties, '中目黒');
      const immediateProperty = result.find((p) =>
        p.propertyName.includes('即入居可能')
      );

      expect(immediateProperty).toBeDefined();
      expect(immediateProperty?.isImmediatelyAvailable).toBe(true);
    });

    it('should include all required fields', () => {
      const result = generateAgencyPropertyListData(mockProperties, '中目黒');
      const property = result[0];

      expect(property.propertyName).toBe('中目黒のスタイリッシュな1K');
      expect(property.area).toBe('中目黒');
      expect(property.layout).toBe('1K');
      expect(property.furnitureList).toContain('ベッド');
      expect(property.handoverFee).toBe(150000);
      expect(property.moveInAvailableFrom).toBe('2026-03-01');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalProperty: Property = {
        id: '5',
        title: 'ミニマル物件',
        images: [],
        handoverFee: 100000,
        area: '池尻',
        furniture: [],
        status: 'public',
      };

      const result = generateAgencyPropertyListData([minimalProperty], '池尻');

      expect(result).toHaveLength(1);
      expect(result[0].layout).toBe('未設定');
      expect(result[0].furnitureList).toBe('なし');
      expect(result[0].moveInAvailableFrom).toBe('未定');
      expect(result[0].isImmediatelyAvailable).toBe(false);
    });
  });
});
