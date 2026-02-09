import { describe, it, expect } from 'vitest';
import {
  buildConsultationDocumentProps,
  mapFurnitureToConsultationItems,
} from '../consultation-generator';
import type { FurnitureItem } from '../../data';

describe('consultation document generator', () => {
  const sampleFurnitureItems: FurnitureItem[] = [
    {
      type: 'bed',
      photos: ['/bed.jpg'],
      condition: 'excellent',
      notes: 'シングルベッド',
    },
    {
      type: 'sofa',
      photos: ['/sofa.jpg'],
      condition: 'good',
      notes: '3人掛け',
    },
    { type: 'desk', photos: ['/desk.jpg'], condition: 'fair' },
    { type: 'storage', photos: [] },
  ];

  const defaultInput = {
    propertyName: '渋谷の家具付き1LDK',
    propertyAddress: '東京都渋谷区神宮前1-2-3',
    moveOutDate: '2026-03-31',
    sellerName: '山田太郎',
    furnitureItems: sampleFurnitureItems,
  };

  describe('mapFurnitureToConsultationItems', () => {
    it('maps all furniture items with Japanese labels and categories', () => {
      const items = mapFurnitureToConsultationItems(sampleFurnitureItems);
      expect(items).toHaveLength(4);
      expect(items[0].name).toBe('ベッド');
      expect(items[1].name).toBe('ソファ');
      expect(items[2].name).toBe('デスク');
      expect(items[3].name).toBe('収納');
    });

    it('maps layer to correct category labels', () => {
      const items = mapFurnitureToConsultationItems(sampleFurnitureItems);
      // bed, sofa, desk are core; storage is additional
      expect(items[0].category).toBe('コアセット（基本セット）');
      expect(items[1].category).toBe('コアセット（基本セット）');
      expect(items[2].category).toBe('コアセット（基本セット）');
      expect(items[3].category).toBe('追加家具（個別オプション）');
    });

    it('includes notes as description, undefined when absent', () => {
      const items = mapFurnitureToConsultationItems(sampleFurnitureItems);
      expect(items[0].description).toBe('シングルベッド');
      expect(items[1].description).toBe('3人掛け');
      expect(items[2].description).toBeUndefined();
      expect(items[3].description).toBeUndefined();
    });

    it('returns empty array for empty input', () => {
      expect(mapFurnitureToConsultationItems([])).toEqual([]);
    });

    it('returns new array (immutability)', () => {
      const items1 = mapFurnitureToConsultationItems(sampleFurnitureItems);
      const items2 = mapFurnitureToConsultationItems(sampleFurnitureItems);
      expect(items1).not.toBe(items2);
      expect(items1).toEqual(items2);
    });
  });

  describe('buildConsultationDocumentProps', () => {
    it('builds complete props from property data', () => {
      const props = buildConsultationDocumentProps(defaultInput);
      expect(props.propertyName).toBe('渋谷の家具付き1LDK');
      expect(props.propertyAddress).toBe('東京都渋谷区神宮前1-2-3');
      expect(props.sellerName).toBe('山田太郎');
      expect(props.furnitureItems).toHaveLength(4);
      expect(props.furnitureItems[0].name).toBe('ベッド');
      expect(props.furnitureItems[0].category).toBe('コアセット（基本セット）');
    });

    it('formats dates as Japanese date strings', () => {
      const props = buildConsultationDocumentProps(defaultInput);
      expect(props.moveOutDate).toMatch(/2026年3月31日/);
      expect(props.createdDate).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
    });

    it('handles empty furniture list', () => {
      const props = buildConsultationDocumentProps({
        ...defaultInput,
        furnitureItems: [],
      });
      expect(props.furnitureItems).toEqual([]);
    });

    it('preserves all input fields in output', () => {
      const props = buildConsultationDocumentProps({
        ...defaultInput,
        propertyName: '物件A',
        propertyAddress: '住所B',
        sellerName: '名前C',
      });
      expect(props.propertyName).toBe('物件A');
      expect(props.propertyAddress).toBe('住所B');
      expect(props.sellerName).toBe('名前C');
    });
  });
});
