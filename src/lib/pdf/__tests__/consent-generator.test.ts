import { describe, it, expect } from 'vitest';
import {
  buildConsentFormProps,
  mapChecklistToConsentItems,
} from '../consent-generator';
import type { ChecklistItem } from '../../furniture-checklist';

describe('consent PDF generator', () => {
  const sampleItems: ChecklistItem[] = [
    {
      id: 'item-1',
      furnitureType: 'bed',
      photos: ['/bed.jpg'],
      condition: 'excellent',
      disposition: 'keep',
    },
    {
      id: 'item-2',
      furnitureType: 'sofa',
      photos: ['/sofa.jpg'],
      condition: 'good',
      notes: '少し傷あり',
      disposition: 'keep',
    },
    {
      id: 'item-3',
      furnitureType: 'desk',
      photos: [],
      condition: 'fair',
      disposition: 'take_away',
    },
  ];

  describe('mapChecklistToConsentItems', () => {
    it('maps keep items to consent form furniture items', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      expect(items).toHaveLength(2); // only keep items
    });

    it('maps furniture type to Japanese label', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      expect(items[0].name).toBe('ベッド');
      expect(items[1].name).toBe('ソファ');
    });

    it('maps condition to Japanese label', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      expect(items[0].condition).toBe('良好');
      expect(items[1].condition).toBe('普通');
    });

    it('maps layer to category label', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      expect(items[0].category).toBe('コアセット（基本セット）');
    });

    it('includes notes as remarks', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      expect(items[1].remarks).toBe('少し傷あり');
    });

    it('excludes take_away and undecided items', () => {
      const items = mapChecklistToConsentItems(sampleItems);
      const names = items.map((i) => i.name);
      expect(names).not.toContain('デスク');
    });
  });

  describe('buildConsentFormProps', () => {
    it('builds complete props for ConsentForm component', () => {
      const props = buildConsentFormProps({
        propertyAddress: '東京都渋谷区1-2-3',
        roomNumber: '301',
        sellerName: '田中太郎',
        buyerName: '山田花子',
        checklistItems: sampleItems,
      });

      expect(props.propertyAddress).toBe('東京都渋谷区1-2-3');
      expect(props.roomNumber).toBe('301');
      expect(props.sellerName).toBe('田中太郎');
      expect(props.buyerName).toBe('山田花子');
      expect(props.furnitureItems).toHaveLength(2);
      expect(props.createdDate).toBeTruthy();
    });

    it('formats createdDate as Japanese date', () => {
      const props = buildConsentFormProps({
        propertyAddress: '東京都渋谷区1-2-3',
        sellerName: '田中太郎',
        checklistItems: sampleItems,
      });

      // Should be formatted like "2026年2月7日"
      expect(props.createdDate).toMatch(/\d{4}年\d{1,2}月\d{1,2}日/);
    });

    it('handles missing optional fields', () => {
      const props = buildConsentFormProps({
        propertyAddress: '東京都渋谷区1-2-3',
        sellerName: '田中太郎',
        checklistItems: sampleItems,
      });

      expect(props.roomNumber).toBeUndefined();
      expect(props.buyerName).toBeUndefined();
    });
  });
});
